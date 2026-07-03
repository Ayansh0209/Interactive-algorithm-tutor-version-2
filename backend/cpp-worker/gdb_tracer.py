"""C++ execution tracer -- runs INSIDE gdb (``gdb --batch -x gdb_tracer.py``).

It single-steps a compiled user program, staying in the user's source file, and
at every stop captures the current line, the in-scope locals (primitives, C
arrays, ``std::vector`` / ``std::string`` / nested vectors, small structs) and
the call/return structure (depth, call_id, parent_id) so the frontend can draw
the recursion tree. It emits the SAME normalized Trace envelope every other
language worker produces, written as JSON to ``$CPP_OUT``.

Config comes from environment variables (set by app.py before launching gdb):
    CPP_SRC        path to the .cpp (for reading line text)
    CPP_OUT        path to write the trace JSON
    CPP_MAX_STEPS  hard cap on recorded steps (default 4000)
    CPP_MAX_SECONDS wall-clock cap (default 8)

Everything is defensive: a failure reading one variable must never abort the
trace, and library/STL frames are skipped so we never drown in header internals.
"""

import gdb  # provided by the gdb runtime
import itertools
import json
import os
import sys
import time
import traceback

SRC = os.environ.get("CPP_SRC", "prog.cpp")
EXE = os.environ.get("CPP_EXE", "")
OUT = os.environ.get("CPP_OUT", "trace.json")
DEBUG = os.environ.get("CPP_DEBUG", "") == "1"


def _dbg(*a):
    if DEBUG:
        print("[tracer]", *a)


# Register libstdc++'s gdb pretty-printers if we were told where they live; this
# lets us read std::map/set/stack/queue/priority_queue/deque generically via the
# visualizer API instead of walking red-black-tree / hashtable internals by hand.
PRINTERS_OK = False
_pp = os.environ.get("CPP_PYPRINTERS", "")
if _pp and os.path.isdir(_pp):
    try:
        sys.path.insert(0, _pp)
        from libstdcxx.v6.printers import register_libstdcxx_printers
        register_libstdcxx_printers(None)
        PRINTERS_OK = True
    except Exception as _e:  # noqa: BLE001
        _dbg("printer registration failed:", _e)
MAX_STEPS = int(os.environ.get("CPP_MAX_STEPS", "4000"))
MAX_SECONDS = float(os.environ.get("CPP_MAX_SECONDS", "8"))
MAX_ELEMS = 200          # cap array/vector length we serialize
MAX_DEPTH = 4            # nesting cap for value serialization
TREE_MAX_DEPTH = 40      # separate, deeper cap for walking linked lists / trees

# Field-name heuristics for pointer-based node structs (Node* / TreeNode*), the
# idiomatic C++ shape for linked lists and trees. Mirrors the same field names
# the Python and Java engines already use, so all three languages agree on what
# "looks like a linked list" or "looks like a tree" means.
NEXT_NAMES = ("next", "nxt", "next_node")
PREV_NAMES = ("prev", "previous", "prev_node")
LEFT_NAMES = ("left", "l", "lc")
RIGHT_NAMES = ("right", "r", "rc")
VAL_NAMES = ("val", "value", "data", "key", "item")

# Read the source once so we can attach the exact line text to each step.
try:
    with open(SRC, "r", encoding="utf-8", errors="replace") as fh:
        SRC_LINES = fh.read().splitlines()
    SRC_BASENAME = os.path.basename(SRC)
except OSError:
    SRC_LINES = []
    SRC_BASENAME = os.path.basename(SRC)


def line_text(lineno):
    if 1 <= lineno <= len(SRC_LINES):
        return SRC_LINES[lineno - 1].strip()
    return ""


# --------------------------------------------------------------------------- #
# Value serialization: gdb.Value -> (var_type, scene) matching the envelope.
# --------------------------------------------------------------------------- #
def _type_name(v):
    try:
        return str(v.type.strip_typedefs())
    except Exception:
        return ""


def _is_vector(tn):
    return tn.startswith("std::vector") or tn.startswith("std::__debug::vector")


def _is_string(tn):
    return "basic_string" in tn or tn == "std::string" or tn.startswith("std::__cxx11::basic_string")


def _read_string(v):
    try:
        # libstdc++ std::string: read exactly _M_string_length chars from the
        # char* buffer (a fixed length would trail into uninitialized memory).
        length = int(v["_M_string_length"])
        length = max(0, min(length, 4096))
        p = v["_M_dataplus"]["_M_p"]
        return p.string(errors="replace", length=length)
    except Exception:
        try:
            s = str(v)
            i, j = s.find('"'), s.rfind('"')
            if 0 <= i < j:
                return s[i + 1:j]
            return s.strip().strip('"')
        except Exception:
            return "<string>"


def _vector_elems(v):
    """Yield the live elements of a std::vector as gdb.Values."""
    impl = v["_M_impl"]
    start = impl["_M_start"]
    finish = impl["_M_finish"]
    n = int(finish - start)
    n = max(0, min(n, MAX_ELEMS))
    for i in range(n):
        yield (start + i).dereference()


def _scalar(v, code):
    try:
        if code == gdb.TYPE_CODE_BOOL:
            return bool(v)
        if code == gdb.TYPE_CODE_FLT:
            return float(v)
        if code == gdb.TYPE_CODE_CHAR:
            iv = int(v)
            # printable char -> its glyph, else the code
            return chr(iv) if 32 <= iv < 127 else iv
        return int(v)
    except Exception:
        try:
            return str(v)
        except Exception:
            return None


def serialize_value(v, depth=0):
    """Return a plain JSON-able value for a gdb.Value (best effort)."""
    try:
        t = v.type.strip_typedefs()
    except Exception:
        return str(v)
    code = t.code
    tn = str(t)

    if depth > MAX_DEPTH:
        return "..."

    if _is_string(tn):
        return _read_string(v)
    if _is_vector(tn):
        try:
            return [serialize_value(e, depth + 1) for e in _vector_elems(v)]
        except Exception:
            return []
    if code == gdb.TYPE_CODE_ARRAY:
        try:
            lo, hi = t.range()
            hi = min(hi, lo + MAX_ELEMS - 1)
            return [serialize_value(v[i], depth + 1) for i in range(lo, hi + 1)]
        except Exception:
            return []
    if code in (gdb.TYPE_CODE_INT, gdb.TYPE_CODE_ENUM, gdb.TYPE_CODE_FLT,
                gdb.TYPE_CODE_BOOL, gdb.TYPE_CODE_CHAR):
        return _scalar(v, code)
    if code == gdb.TYPE_CODE_PTR:
        try:
            if int(v) == 0:
                return None
        except Exception:
            pass
        return str(v)
    if code == gdb.TYPE_CODE_STRUCT:
        out = {}
        try:
            for f in t.fields():
                if not f.name or f.artificial:
                    continue
                try:
                    out[f.name] = serialize_value(v[f.name], depth + 1)
                except Exception:
                    out[f.name] = "?"
        except Exception:
            return str(v)
        return out
    return str(v)


def read_container(v, tn):
    """Read std::map/set/stack/queue/priority_queue/deque/list generically via
    the registered pretty-printer's children(). Returns (var_type, scene) or None.
    """
    if not PRINTERS_OK:
        return None
    try:
        vis = gdb.default_visualizer(v)
    except Exception:
        vis = None
    if vis is None or not hasattr(vis, "children"):
        return None
    try:
        hint = vis.display_hint() if hasattr(vis, "display_hint") else None
    except Exception:
        hint = None
    try:
        items = list(itertools.islice(vis.children(), 0, 2 * MAX_ELEMS))
    except Exception:
        return None
    flat = tn.replace(" ", "")
    if hint == "map" or flat.startswith("std::map") or flat.startswith("std::unordered_map") or flat.startswith("std::multimap"):
        d = {}
        for idx in range(0, len(items) - 1, 2):
            try:
                k = serialize_value(items[idx][1], 2)
                val = serialize_value(items[idx + 1][1], 2)
                d[str(k)] = val
            except Exception:
                continue
        return "object", d
    vals = []
    for _, child in items:
        try:
            vals.append(serialize_value(child, 2))
        except Exception:
            pass
    if "set" in flat:
        return "set", {"type": "set", "values": vals}
    if "priority_queue" in flat:
        return "heap", {"type": "heap", "values": vals}
    if "stack" in flat:
        return "stack", {"type": "stack", "values": vals}
    if "queue" in flat or "deque" in flat:
        return "queue", {"type": "queue", "values": vals}
    return "array", vals


def _struct_field_names(t):
    try:
        return {f.name for f in t.fields() if f.name}
    except Exception:
        return set()


def _pointee_struct_type(v):
    """If v is a non-null pointer to a struct/class, return the pointee type."""
    try:
        t = v.type.strip_typedefs()
        if t.code != gdb.TYPE_CODE_PTR or int(v) == 0:
            return None
        pt = t.target().strip_typedefs()
        return pt if pt.code == gdb.TYPE_CODE_STRUCT else None
    except Exception:
        return None


def _field_value(struct_val, names):
    for n in names:
        try:
            return struct_val[n]
        except Exception:
            continue
    return None


def _looks_like_list_node(t):
    return bool(_struct_field_names(t) & set(NEXT_NAMES))


def _looks_like_tree_node(t):
    fields = _struct_field_names(t)
    return bool(fields & set(LEFT_NAMES)) and bool(fields & set(RIGHT_NAMES))


def walk_linked_list(ptr):
    """Follow a Node* chain into the same {type, nodes, head} shape the
    Python/Java linked-list renderers already expect."""
    nodes, index_by_addr = [], {}
    is_doubly = is_circular = False
    cur = ptr
    while cur is not None and len(nodes) < MAX_ELEMS:
        try:
            if int(cur) == 0:
                break
        except Exception:
            break
        addr = int(cur)
        if addr in index_by_addr:
            is_circular = True
            break
        try:
            node_val = cur.dereference()
        except Exception:
            break
        index_by_addr[addr] = len(nodes)
        val_field = _field_value(node_val, VAL_NAMES)
        prev_field = _field_value(node_val, PREV_NAMES)
        if prev_field is not None:
            try:
                if int(prev_field) != 0:
                    is_doubly = True
            except Exception:
                pass
        nodes.append({"id": len(nodes), "value": serialize_value(val_field) if val_field is not None else None,
                      "next": None, "prev": None})
        cur = _field_value(node_val, NEXT_NAMES)
    for i, node in enumerate(nodes):
        if i + 1 < len(nodes):
            node["next"] = i + 1
    if is_circular and nodes:
        nodes[-1]["next"] = index_by_addr.get(int(ptr), 0)
    if is_doubly:
        for i in range(1, len(nodes)):
            nodes[i]["prev"] = i - 1
    return {
        "type": "doubly_linked_list" if is_doubly else "linked_list",
        "circular": is_circular,
        "nodes": nodes,
        "head": 0 if nodes else None,
    }


def walk_tree(ptr, visited=None, depth=0):
    """Recursively dereference left/right pointers into {val, left, right}."""
    if visited is None:
        visited = set()
    try:
        if ptr is None or int(ptr) == 0:
            return None
    except Exception:
        return None
    addr = int(ptr)
    if depth > TREE_MAX_DEPTH or addr in visited or len(visited) > MAX_ELEMS:
        return {"val": "<truncated>"}
    visited.add(addr)
    try:
        node_val = ptr.dereference()
    except Exception:
        return None
    val_field = _field_value(node_val, VAL_NAMES)
    return {
        "val": serialize_value(val_field) if val_field is not None else None,
        "left": walk_tree(_field_value(node_val, LEFT_NAMES), visited, depth + 1),
        "right": walk_tree(_field_value(node_val, RIGHT_NAMES), visited, depth + 1),
    }


def classify_and_scene(v):
    """Map a gdb.Value to (var_type tag, scene JSON) as the renderers expect."""
    try:
        t = v.type.strip_typedefs()
    except Exception:
        return "primitive", str(v)
    code = t.code
    tn = str(t)

    # Pointer to a struct/class that looks like a linked-list node or a tree
    # node (by field name, same heuristic Python/Java use) -> walk it into the
    # renderer-ready shape instead of showing a raw address.
    if code == gdb.TYPE_CODE_PTR:
        pt = _pointee_struct_type(v)
        if pt is not None:
            if _looks_like_tree_node(pt):
                kind = "avl_tree" if "height" in _struct_field_names(pt) or "bf" in _struct_field_names(pt) else "binary_tree"
                return kind, {"type": kind, "root": walk_tree(v)}
            if _looks_like_list_node(pt):
                scene = walk_linked_list(v)
                return scene["type"], scene   # doubly_linked_list vs linked_list
            # Some other struct pointer (e.g. a TrieNode*) -- dereference once
            # and show its fields instead of a bare address. Best-effort: a
            # container FIELD nested inside (e.g. unordered_map<char,TrieNode*>
            # children) still shows raw internals, since only top-level
            # variables get the pretty-printer treatment (read_container).
            try:
                return "object", serialize_value(v.dereference())
            except Exception:
                pass

    # Associative + adaptor containers via the pretty-printer visualizer.
    flat = tn.replace(" ", "")
    if any(flat.startswith(p) for p in (
            "std::map", "std::unordered_map", "std::multimap",
            "std::set", "std::unordered_set", "std::multiset",
            "std::stack", "std::queue", "std::priority_queue",
            "std::deque", "std::list")):
        got = read_container(v, tn)
        if got is not None:
            return got

    # 2D vector / 2D array -> matrix
    def _is_2d_vector():
        if not _is_vector(tn):
            return False
        try:
            elem_t = str(t.template_argument(0))
            return elem_t.startswith("std::vector") or _is_vector(elem_t)
        except Exception:
            return False

    if _is_string(tn):
        return "primitive", _read_string(v)
    if _is_2d_vector():
        return "matrix", {"type": "matrix", "rows": serialize_value(v)}
    if _is_vector(tn):
        return "array", serialize_value(v)
    if code == gdb.TYPE_CODE_ARRAY:
        try:
            elem = t.target().strip_typedefs()
            if elem.code == gdb.TYPE_CODE_ARRAY:
                return "matrix", {"type": "matrix", "rows": serialize_value(v)}
        except Exception:
            pass
        return "array", serialize_value(v)
    if code in (gdb.TYPE_CODE_INT, gdb.TYPE_CODE_ENUM, gdb.TYPE_CODE_FLT,
                gdb.TYPE_CODE_BOOL, gdb.TYPE_CODE_CHAR):
        return "primitive", _scalar(v, code)
    if code == gdb.TYPE_CODE_STRUCT:
        return "object", serialize_value(v)
    if code == gdb.TYPE_CODE_PTR:
        return "primitive", serialize_value(v)
    return "primitive", str(v)


# --------------------------------------------------------------------------- #
# Frame / scope helpers.
# --------------------------------------------------------------------------- #
def frame_file(frame):
    try:
        sal = frame.find_sal()
        if sal and sal.symtab:
            return os.path.basename(sal.symtab.filename)
    except Exception:
        pass
    return None


def in_user_code(frame):
    return frame_file(frame) == SRC_BASENAME


def user_backtrace(frame):
    """Frames from newest to main that belong to the user source (recursion)."""
    out = []
    f = frame
    while f is not None:
        if in_user_code(f):
            out.append(f)
        try:
            f = f.older()
        except Exception:
            break
    return out


def fingerprint(frame):
    """A stable-enough identity for a live frame. The caller's return address
    (older frame PC) distinguishes sibling calls made from DIFFERENT call sites
    on the same line -- e.g. fib(n-1) vs fib(n-2) -- which stack depth alone and
    a reused stack pointer cannot."""
    try:
        fn = frame.name() or "?"
    except Exception:
        fn = "?"
    cpc = 0
    try:
        older = frame.older()
        if older is not None:
            cpc = int(older.pc())
    except Exception:
        pass
    return (fn, cpc)


def collect_locals(frame, cur_line):
    """In-scope arguments + variables of the current function block.

    Variables whose declaration line has NOT been reached yet are skipped so we
    never show pre-initialization garbage (gdb, unlike Python's settrace, will
    happily report a slot's stack junk before the ``int x = ...`` runs).
    """
    scenes, types = {}, {}
    try:
        block = frame.block()
    except Exception:
        return scenes, types
    # Find the function block so we stop before globals.
    fn_block = block
    while fn_block is not None and fn_block.function is None:
        fn_block = fn_block.superblock
    seen = set()
    b = block
    while b is not None:
        try:
            for sym in b:
                if not (sym.is_argument or sym.is_variable):
                    continue
                name = sym.name
                if not name or name in seen or name.startswith("__"):
                    continue
                # Skip variables not yet declared at this line (arguments have a
                # decl line on the signature, so they always pass).
                try:
                    dl = sym.line
                    if dl and cur_line and dl >= cur_line and not sym.is_argument:
                        continue
                except Exception:
                    pass
                seen.add(name)
                try:
                    val = sym.value(frame)
                    vtype, scene = classify_and_scene(val)
                    types[name] = vtype
                    scenes[name] = scene
                except Exception:
                    continue
        except Exception:
            pass
        if b is fn_block:
            break
        b = b.superblock
    return scenes, types


_USER_GLOBALS = None       # cached [(name, gdb.Symbol)] from the user's file


def find_globals(frame):
    """Discover file-scope globals declared in the user's source (once).

    Competitive solutions routinely keep arrays/counters as globals, so we must
    surface them, not just frame locals. We include only symbols whose defining
    symtab is the user file to avoid dumping libc/STL globals.
    """
    global _USER_GLOBALS
    if _USER_GLOBALS is not None:
        return
    _USER_GLOBALS = []
    try:
        symtab = frame.find_sal().symtab
    except Exception:
        return
    if symtab is None:
        return
    blocks = []
    try:
        blocks.append(symtab.global_block())
    except Exception:
        pass
    try:
        blocks.append(symtab.static_block())
    except Exception:
        pass
    seen = set()
    for blk in blocks:
        if blk is None:
            continue
        try:
            for sym in blk:
                if not sym.is_variable:
                    continue
                name = sym.name
                if not name or name in seen:
                    continue
                try:
                    if sym.symtab and os.path.basename(sym.symtab.filename) != SRC_BASENAME:
                        continue
                except Exception:
                    continue
                seen.add(name)
                _USER_GLOBALS.append((name, sym))
        except Exception:
            pass


def collect_globals():
    scenes, types = {}, {}
    if not _USER_GLOBALS:
        return scenes, types
    for name, sym in _USER_GLOBALS:
        try:
            val = sym.value()
            vtype, scene = classify_and_scene(val)
            types[name] = vtype
            scenes[name] = scene
        except Exception:
            continue
    return scenes, types


def call_stack_of(frames):
    """[{function, args}] from main down to current (for the recursion panel)."""
    stack = []
    for f in reversed(frames):  # main first
        name = _fn_name(f)
        args = {}
        try:
            block = f.block()
            fn_block = block
            while fn_block is not None and fn_block.function is None:
                fn_block = fn_block.superblock
            if fn_block is not None:
                for sym in fn_block:
                    if sym.is_argument:
                        try:
                            args[sym.name] = serialize_value(sym.value(f))
                        except Exception:
                            pass
        except Exception:
            pass
        stack.append({"function": name, "args": args})
    return stack


def _fn_name(frame):
    try:
        return frame.name() or "??"
    except Exception:
        return "??"


def scope_of(code):
    c = code.lstrip()
    if c.startswith(("for", "while", "do")) or "for (" in c or "while (" in c:
        return "loop"
    if c.startswith(("if", "else", "case", "switch")):
        return "conditional"
    return None


def changed_vars(prev, cur):
    out = []
    for k, v in cur.items():
        if k not in prev or prev[k] != v:
            out.append(k)
    return out


# --------------------------------------------------------------------------- #
# Stepping controller.
# --------------------------------------------------------------------------- #
class Recorder:
    def __init__(self):
        self.steps = []
        self.prev_by_call = {}
        self.prev_fps = []         # fingerprints main..top of the last stop
        self.call_ids = []         # call_id per live frame, parallel to prev_fps
        self.counter = 0           # next call_id (main gets 0, then 1,2,3...)
        self.truncated = False
        self.start = time.monotonic()

    def over_budget(self):
        if len(self.steps) >= MAX_STEPS:
            self.truncated = True
            return True
        if time.monotonic() - self.start > MAX_SECONDS:
            self.truncated = True
            return True
        return False

    def record(self, frame):
        frames = user_backtrace(frame)
        if not frames:
            return
        depth = len(frames) - 1        # main -> depth 0
        lineno = 0
        try:
            lineno = frame.find_sal().line
        except Exception:
            pass
        code = line_text(lineno)
        fn = _fn_name(frame)

        # Reconstruct call/return by diffing the whole frame stack against the
        # previous stop (robust to sibling calls that share a depth).
        cur_fps = [fingerprint(f) for f in reversed(frames)]   # main..top
        common = 0
        while (common < len(cur_fps) and common < len(self.prev_fps)
               and cur_fps[common] == self.prev_fps[common]):
            common += 1
        popped = len(self.prev_fps) - common
        pushed = len(cur_fps) - common
        for _ in range(popped):
            if self.call_ids:
                self.call_ids.pop()
        for _ in range(pushed):
            if not self.call_ids:
                self.call_ids.append(0)          # main
            else:
                self.counter += 1
                self.call_ids.append(self.counter)
        event = "call" if pushed else ("return" if popped else "line")
        call_id = self.call_ids[-1] if self.call_ids else 0
        parent_id = self.call_ids[-2] if len(self.call_ids) > 1 else None

        find_globals(frame)
        gscenes, gtypes = collect_globals()
        lscenes, ltypes = collect_locals(frame, lineno)
        scenes = dict(gscenes); scenes.update(lscenes)   # locals shadow globals
        types = dict(gtypes); types.update(ltypes)
        prev = self.prev_by_call.get(call_id, {})
        highlight = changed_vars(prev, scenes)

        step = {
            "i": len(self.steps),
            "event": event,
            "line": lineno,
            "function": fn,
            "code": code,
            "locals": scenes,
            "var_types": types,
            "highlight_vars": highlight,
            "scope": scope_of(code),
            "depth": depth,
            "call_id": call_id,
            "parent_id": parent_id,
            "semantic": [],
            "call_stack": call_stack_of(frames),
        }
        self.steps.append(step)
        self.prev_by_call[call_id] = scenes
        self.prev_fps = cur_fps


def _sal_ok(frame):
    try:
        sal = frame.find_sal()
        return bool(sal and sal.symtab and sal.line)
    except Exception:
        return False


def run():
    rec = Recorder()
    out = {
        "meta": {
            "language": "cpp",
            "analysis": {"primary": None, "hints": []},
            "output": "",
            "error": None,
            "truncated": False,
            "num_steps": 0,
        },
        "steps": [],
    }

    gdb.execute("set pagination off")
    gdb.execute("set print pretty off")
    gdb.execute("set width 0")
    gdb.execute("set height 0")
    gdb.execute("set confirm off")
    # Load the executable explicitly (positional-arg ordering is unreliable).
    if EXE:
        try:
            gdb.execute("file " + EXE.replace("\\", "/"))
            _dbg("file loaded", EXE)
        except gdb.error as exc:
            _dbg("file load error", exc)
    # Skip stepping into STL / system code by FILE (header globs), never by a
    # function-name regex: a name regex like "std::*" wrongly matches a USER
    # function that merely takes an STL parameter -- e.g. search(vector<int>&) --
    # and skips it entirely. The user's prog.cpp lives in a temp dir, so none of
    # these header globs can match it. The finish-loop below is the correctness
    # backstop if any library frame still slips through.
    for glob in ("*/include/*", "*/c++/*", "*/lib/gcc/*", "*bits/*", "*ext/*",
                 "*mingw*/*", "*ucrt*/*"):
        try:
            gdb.execute("skip -gfi " + glob)
        except gdb.error:
            pass

    try:
        gdb.execute("break main")
    except gdb.error as exc:
        out["meta"]["error"] = "Could not set breakpoint at main: " + str(exc)
        _write(out)
        return

    # Redirect the inferior's stdio so app.py can feed stdin and capture stdout
    # (gdb's `run` supports shell-style redirection passed to the program).
    run_cmd = "run"
    stdin_path = os.environ.get("CPP_STDIN", "")
    stdout_path = os.environ.get("CPP_STDOUT", "")
    if stdin_path:
        run_cmd += ' < "%s"' % stdin_path.replace("\\", "/")
    if stdout_path:
        run_cmd += ' > "%s"' % stdout_path.replace("\\", "/")
    try:
        gdb.execute(run_cmd)
        _dbg("after run, steps loop begins")
    except gdb.error as exc:
        out["meta"]["error"] = "Run failed: " + str(exc)
        _dbg("RUN EXC", traceback.format_exc())
        _write(out)
        return

    # Main stepping loop.
    try:
        while True:
            if rec.over_budget():
                break
            try:
                frame = gdb.newest_frame()
            except gdb.error:
                break  # program exited

            # If we're not in user code (stepped into a lib), climb out.
            hops = 0
            while frame is not None and not in_user_code(frame) and hops < 200:
                try:
                    gdb.execute("finish")
                except gdb.error:
                    break
                try:
                    frame = gdb.newest_frame()
                except gdb.error:
                    frame = None
                hops += 1
            if frame is None:
                break
            if in_user_code(frame) and _sal_ok(frame):
                rec.record(frame)

            try:
                gdb.execute("step")
            except gdb.error:
                break
            # Detect program termination.
            try:
                gdb.selected_inferior()
                if not gdb.selected_inferior().is_valid() or not gdb.inferiors()[0].threads():
                    break
            except Exception:
                pass
    except Exception as exc:  # never lose the partial trace
        out["meta"]["error"] = "Trace error: " + str(exc)

    # Program stdout captured separately by app.py; leave "output" for the worker.
    out["meta"]["truncated"] = rec.truncated
    out["meta"]["num_steps"] = len(rec.steps)
    out["steps"] = rec.steps
    _write(out)


def _write(obj):
    try:
        with open(OUT, "w", encoding="utf-8") as fh:
            json.dump(obj, fh, ensure_ascii=False)
    except Exception as exc:
        print("TRACE_WRITE_ERROR", exc)


run()
