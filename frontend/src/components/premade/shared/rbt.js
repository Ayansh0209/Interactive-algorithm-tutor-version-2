// Red-black tree (CLRS insert + fixup with a nil sentinel). Kept separate so the
// invariants can be unit-checked. render() returns a plain {id,value,color,
// left,right} tree (nil -> null) for TreeCanvas.

export function makeRBT() {
  const NIL = { color: "B", value: null, id: 0, nil: true };
  NIL.left = NIL; NIL.right = NIL; NIL.parent = NIL;
  let root = NIL;
  let idc = 1;

  function leftRotate(x) {
    const y = x.right; x.right = y.left;
    if (y.left !== NIL) y.left.parent = x;
    y.parent = x.parent;
    if (x.parent === NIL) root = y; else if (x === x.parent.left) x.parent.left = y; else x.parent.right = y;
    y.left = x; x.parent = y;
  }
  function rightRotate(x) {
    const y = x.left; x.left = y.right;
    if (y.right !== NIL) y.right.parent = x;
    y.parent = x.parent;
    if (x.parent === NIL) root = y; else if (x === x.parent.right) x.parent.right = y; else x.parent.left = y;
    y.right = x; x.parent = y;
  }
  function insert(val) {
    let y = NIL, x = root;
    while (x !== NIL) { y = x; if (val === x.value) return false; x = val < x.value ? x.left : x.right; }
    const z = { color: "R", value: val, left: NIL, right: NIL, parent: y, id: idc++ };
    if (y === NIL) root = z; else if (val < y.value) y.left = z; else y.right = z;
    fixup(z); return true;
  }
  function fixup(z) {
    while (z.parent.color === "R") {
      if (z.parent === z.parent.parent.left) {
        const y = z.parent.parent.right;
        if (y.color === "R") { z.parent.color = "B"; y.color = "B"; z.parent.parent.color = "R"; z = z.parent.parent; }
        else { if (z === z.parent.right) { z = z.parent; leftRotate(z); } z.parent.color = "B"; z.parent.parent.color = "R"; rightRotate(z.parent.parent); }
      } else {
        const y = z.parent.parent.left;
        if (y.color === "R") { z.parent.color = "B"; y.color = "B"; z.parent.parent.color = "R"; z = z.parent.parent; }
        else { if (z === z.parent.left) { z = z.parent; rightRotate(z); } z.parent.color = "B"; z.parent.parent.color = "R"; leftRotate(z.parent.parent); }
      }
    }
    root.color = "B";
  }
  function render(n = root) {
    if (n === NIL) return null;
    return { id: n.id, value: n.value, color: n.color === "R" ? "red" : "black", left: render(n.left), right: render(n.right) };
  }
  return { insert, render, isEmpty: () => root === NIL };
}

export function buildRBT(values) {
  const t = makeRBT();
  values.forEach((v) => t.insert(v));
  return t.render();
}

// Validity check used in tests: returns true if the render tree satisfies the
// red-black invariants (root black, no red-red, equal black-height).
export function isValidRBT(root) {
  if (!root) return true;
  if (root.color !== "black") return false;
  let ok = true;
  function bh(n) {
    if (!n) return 1;
    if (n.color === "red" && ((n.left && n.left.color === "red") || (n.right && n.right.color === "red"))) ok = false;
    const l = bh(n.left), r = bh(n.right);
    if (l !== r) ok = false;
    return l + (n.color === "black" ? 1 : 0);
  }
  bh(root);
  return ok;
}
