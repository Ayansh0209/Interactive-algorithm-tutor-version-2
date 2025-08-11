# Tracer Feature Checklist
*(For dynamic data structure & algorithm runtime tracking with custom + prebuilt Python library support)*

## **1. Core Tracing Enhancements**
| Feature | Description | Code Needed | Status |
|---------|-------------|-------------|--------|
| **Custom Serializer System** | Detect object types and serialize them into JSON-friendly form | `serialize_value(val)` function with type adapters | ☐ |
| **Type Detection Upgrade** | Detect complex DS types (`Node`, `Stack`, `Queue`, `Graph`) | Update `detectType()` to handle custom classes | ☐ |
| **Cycle Detection** | Prevent infinite loops in linked structures | `visited` set in serialization functions | ☐ |
| **Branch Outcome Detection** | Continue current `branch_taken` but extend for `match-case` | Extend `traceSteps()` conditional detection | ☐ |
| **Nested Structure Support** | Handle nested lists/dicts of objects | Recursive serialization | ☐ |

---

## **2. Data Structure Adapters (Custom)**
| Data Structure | Serialization Output | Code to Add | Status |
|----------------|----------------------|-------------|--------|
| **Linked List (Singly)** | `[val1, val2, ...]` | `linked_list_to_array(head)` | ☐ |
| **Linked List (Doubly)** | `{"forward": [...], "backward": [...]}` | `doubly_linked_list_to_array(head)` | ☐ |
| **Stack** | `[bottom, ..., top]` | `stack_to_array(stack)` | ☐ |
| **Queue** | `[front, ..., back]` | `queue_to_array(queue)` | ☐ |
| **Deque** | `[left, ..., right]` | `deque_to_array(deque)` | ☐ |
| **Binary Tree** | Nested dict: `{"val": x, "left": {...}, "right": {...}}` | `binary_tree_to_dict(root)` | ☐ |
| **N-ary Tree** | `{"val": x, "children": [...]}` | `nary_tree_to_dict(root)` | ☐ |
| **Graph (Adjacency List)** | `{node: [neighbors...]}` | `graph_to_adj_list(graph)` | ☐ |
| **Graph (Edge List)** | `[(u,v), (v,w), ...]` | `graph_to_edge_list(graph)` | ☐ |
| **Matrix/Grid** | 2D list | No extra code (lists already handled) | ☐ |
| **Set** | List of items | Simple cast: `list(my_set)` | ☐ |
| **Priority Queue / Heap** | Heap array form | `heapq_to_array(heap)` | ☐ |

---

## **3. Data Structure Adapters (Prebuilt Python Libraries)**
| Library Type | Example Import | Serialization Output | Code Needed | Status |
|--------------|----------------|----------------------|-------------|--------|
| **`collections.deque`** | `from collections import deque` | `["front", ..., "back"]` | `list(val)` | ☐ |
| **`queue.Queue`** | `import queue` | `["item1", "item2", ...]` | `list(val.queue)` | ☐ |
| **`set`** | Built-in | `["a", "b", "c"]` | `list(val)` | ☐ |
| **`heapq`** | Built-in | `[min, ...]` | Already list-based | ☐ |
| **`numpy.ndarray`** | `import numpy as np` | 2D/1D list | `val.tolist()` | ☐ |
| **`pandas.DataFrame`** | `import pandas as pd` | `{"columns": [...], "data": [...]}` | Columns + `values.tolist()` | ☐ |
| **`networkx.Graph`** | `import networkx as nx` | `{node: [neighbors...]}` | Iterate nodes + neighbors | ☐ |

---

## **4. Algorithm-Specific Tracking**
| Algorithm Category | Extra Tracking | Code to Add | Status |
|--------------------|----------------|-------------|--------|
| **Recursion** | Track depth, function call stack snapshot | Already partially in place (`CodeDepth`) | ☐ |
| **Backtracking** | Store decision path | Add `path_snapshot()` for arrays/lists | ☐ |
| **Sorting** | Track array state per iteration | Already works (lists tracked) | ☐ |
| **Search (BFS/DFS)** | Track visited set, frontier queue/stack | Extend graph/tree serializers | ☐ |
| **Dynamic Programming** | Track DP table (2D list) | Already works (lists tracked) | ☐ |
| **Greedy Algorithms** | Track choice made each step | Add per-iteration choice log | ☐ |
| **Divide and Conquer** | Track subarray/subproblem size | Add size logging in recursion | ☐ |

---

## **5. Quality-of-Life / Extensibility**
| Feature | Description | Code Needed | Status |
|---------|-------------|-------------|--------|
| **Custom Class Opt-In** | Let user define `__trace_repr__()` for their own class | Check with `hasattr(val, "__trace_repr__")` | ☐ |
| **Configurable Depth Limit** | Limit nested serialization depth | Global `MAX_TRACE_DEPTH` | ☐ |
| **Pretty Printing** | Clean formatting for frontend | Optional `json.dumps(..., indent=2)` | ☐ |
| **Performance Mode** | Skip unchanged deep objects | Hash object snapshots | ☐ |

---

## **Implementation Flow**
1. **Add `serialize_value()`** → central function for all DS conversions (custom + prebuilt)  
2. **Update `traceSteps()`** → replace direct `json.dumps()` with `serialize_value()`  
3. **Write individual adapters** (linked list, stack, queue, tree, graph, numpy, pandas, etc.)  
4. **Test with example DS classes & standard library objects**  
5. **Integrate into your algorithm visualizer frontend**  
