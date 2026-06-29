// src/components/Box.jsx
import React from "react";

// --- Stack Visualizer ---
function StackVisualizer({ values }) {
  return (
    <div className="flex flex-col-reverse items-center border-2 border-green-500 border-t-0 p-2 min-w-16 w-fit bg-black/60 rounded-b-md">
      {values.map((v, i) => (
        <div key={i} className="w-12 h-10 border border-green-400 bg-green-500/20 text-green-300 flex items-center justify-center font-bold my-1 text-sm rounded transition-all duration-300">
          {v}
        </div>
      ))}
      {values.length === 0 && <span className="text-xs text-gray-500 py-4">Empty Stack</span>}
    </div>
  );
}

// --- Queue Visualizer ---
function QueueVisualizer({ values }) {
  return (
    <div className="flex items-center border-y-2 border-green-500 px-4 py-2 min-h-16 w-fit bg-black/60 gap-1">
      {values.map((v, i) => (
        <div key={i} className="w-12 h-10 border border-green-400 bg-green-500/20 text-green-300 flex items-center justify-center font-bold text-sm rounded transition-all duration-300">
          {v}
        </div>
      ))}
      {values.length === 0 && <span className="text-xs text-gray-500 px-4">Empty Queue</span>}
    </div>
  );
}

// --- DSU Visualizer ---
function DsuVisualizer({ parent }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1 border border-green-500/30 p-2 bg-black/40 rounded flex-wrap">
        {parent.map((p, idx) => (
          <div key={idx} className="flex flex-col items-center border border-gray-600 bg-gray-800 p-1 text-xs">
            <span className="text-[9px] text-gray-400 font-mono">i:{idx}</span>
            <span className="font-bold text-white font-mono">{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Linked List Visualizer ---
function LinkedListVisualizer({ nodes, head }) {
  if (!nodes || nodes.length === 0) return <span className="text-xs text-gray-500">Empty List</span>;

  return (
    <div className="flex items-center gap-4 border border-green-500/20 bg-black/40 rounded p-4 overflow-x-auto w-full max-w-full">
      {nodes.map((node, i) => (
        <div key={node.id} className="flex items-center">
          <div className="flex flex-col border border-green-500 rounded bg-zinc-900 overflow-hidden min-w-16">
            <div className="bg-green-600/20 text-green-400 text-[10px] text-center font-mono py-0.5 border-b border-green-500/30">
              id: {node.id}
            </div>
            <div className="p-2 text-center text-sm font-bold text-white">
              {node.value === null ? "null" : node.value.toString()}
            </div>
          </div>
          {i + 1 < nodes.length && (
            <div className="text-green-400 text-lg ml-2 animate-pulse">➔</div>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Tree (BST/AVL/Red-Black/Segment) SVG Visualizer ---
function renderTreeNodes(node, x, y, dx, dy, depth = 0) {
  if (!node) return null;
  const nodes = [];
  const lines = [];

  const leftX = x - dx / Math.pow(1.3, depth);
  const leftY = y + dy;
  const rightX = x + dx / Math.pow(1.3, depth);
  const rightY = y + dy;

  if (node.left) {
    lines.push(
      <line key={`line-l-${x}-${y}`} x1={x} y1={y} x2={leftX} y2={leftY} stroke="#22c55e" strokeWidth="2" />
    );
    const childTree = renderTreeNodes(node.left, leftX, leftY, dx, dy, depth + 1);
    if (childTree) {
      nodes.push(...childTree.nodes);
      lines.push(...childTree.lines);
    }
  }
  if (node.right) {
    lines.push(
      <line key={`line-r-${x}-${y}`} x1={x} y1={y} x2={rightX} y2={rightY} stroke="#22c55e" strokeWidth="2" />
    );
    const childTree = renderTreeNodes(node.right, rightX, rightY, dx, dy, depth + 1);
    if (childTree) {
      nodes.push(...childTree.nodes);
      lines.push(...childTree.lines);
    }
  }

  // Determine classes based on Red-Black Tree colors
  let nodeStyle = "fill-green-600 stroke-green-400";
  if (node.color) {
    nodeStyle = node.color === "red" ? "fill-red-600 stroke-red-400" : "fill-zinc-800 stroke-zinc-600";
  }

  nodes.push(
    <g key={`node-g-${x}-${y}`}>
      <circle cx={x} cy={y} r="16" className={`${nodeStyle} stroke-2`} />
      <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" className="font-mono">
        {node.val !== null ? node.val : "nil"}
      </text>
      {node.height !== undefined && (
        <text x={x + 16} y={y - 8} fill="#60a5fa" fontSize="8" fontWeight="bold" className="font-mono">
          h:{node.height}
        </text>
      )}
      {node.start !== undefined && (
        <text x={x} y={y - 20} textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold" className="font-mono">
          [{node.start},{node.end}]
        </text>
      )}
    </g>
  );

  return { nodes, lines };
}

function TreeSvgVisualizer({ root, type }) {
  if (!root) return <span className="text-xs text-gray-500">Empty Tree</span>;
  const dx = 90;
  const dy = 45;
  const width = 380;
  const height = 200;
  const treeLayout = renderTreeNodes(root, width / 2, 25, dx, dy);

  return (
    <svg width={width} height={height} className="border border-green-500/20 bg-black/40 rounded p-2">
      {treeLayout?.lines}
      {treeLayout?.nodes}
    </svg>
  );
}

// --- Trie Visualizer ---
function renderTrieNodes(node, label, x, y, dx, dy, depth = 0) {
  if (!node) return null;
  const nodes = [];
  const lines = [];

  const childrenCount = Object.keys(node.children || {}).length;
  let idx = 0;
  
  for (const [char, child] of Object.entries(node.children || {})) {
    const childX = x + (idx - (childrenCount - 1) / 2) * (dx / Math.pow(1.2, depth));
    const childY = y + dy;

    lines.push(
      <line key={`trie-l-${x}-${y}-${char}`} x1={x} y1={y} x2={childX} y2={childY} stroke="#10b981" strokeWidth="1.5" />
    );
    const childTree = renderTrieNodes(child, char, childX, childY, dx, dy, depth + 1);
    if (childTree) {
      nodes.push(...childTree.nodes);
      lines.push(...childTree.lines);
    }
    idx++;
  }

  nodes.push(
    <g key={`trie-g-${x}-${y}-${label}`}>
      <circle cx={x} cy={y} r="12" className={`${node.is_word ? 'fill-green-600 stroke-green-400' : 'fill-zinc-800 stroke-zinc-600'} stroke-2`} />
      <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" className="font-mono">
        {label || "root"}
      </text>
    </g>
  );

  return { nodes, lines };
}

function TrieVisualizer({ root }) {
  if (!root) return <span className="text-xs text-gray-500">Empty Trie</span>;
  const dx = 110;
  const dy = 40;
  const width = 380;
  const height = 180;
  const trieLayout = renderTrieNodes(root, "", width / 2, 20, dx, dy);

  return (
    <svg width={width} height={height} className="border border-green-500/20 bg-black/40 rounded p-2 overflow-auto">
      {trieLayout?.lines}
      {trieLayout?.nodes}
    </svg>
  );
}

// --- Graph Circular Visualizer ---
function GraphCircularVisualizer({ adjacencyList }) {
  const nodes = Object.keys(adjacencyList);
  if (nodes.length === 0) return <span className="text-xs text-gray-500">Empty Graph</span>;

  const width = 300;
  const height = 220;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 70;

  const coords = {};
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    coords[node] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  });

  const edges = [];
  nodes.forEach((u) => {
    const neighbors = adjacencyList[u] || [];
    neighbors.forEach((item) => {
      let v, weight;
      if (typeof item === 'object' && item !== null) {
        if (Array.isArray(item)) {
          v = item[0];
          weight = item[1];
        } else {
          v = item.to;
          weight = item.weight;
        }
      } else {
        v = item;
      }

      if (coords[u] && coords[v]) {
        edges.push(
          <g key={`graph-e-${u}-${v}-${edges.length}`}>
            <line x1={coords[u].x} y1={coords[u].y} x2={coords[v].x} y2={coords[v].y} stroke="#10b981" strokeWidth="2" opacity="0.6" />
            {weight !== undefined && (
              <text x={(coords[u].x + coords[v].x) / 2} y={(coords[u].y + coords[v].y) / 2 - 4} fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">
                {weight}
              </text>
            )}
          </g>
        );
      }
    });
  });

  return (
    <svg width={width} height={height} className="border border-green-500/20 bg-black/40 rounded p-2">
      {edges}
      {nodes.map((node) => (
        <g key={`graph-n-${node}`}>
          <circle cx={coords[node].x} cy={coords[node].y} r="14" className="fill-zinc-800 stroke-green-400 stroke-2" />
          <text x={coords[node].x} y={coords[node].y + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" className="font-mono">
            {node}
          </text>
        </g>
      ))}
    </svg>
  );
}

// --- Universal Data Box (Main Dispatcher) ---
export function UniversalDataBox({ label, data }) {
  const getType = (d) => {
    if (d && typeof d === "object") {
      if (d.type) return d.type;
      if (Array.isArray(d)) {
        return (d.length > 0 && Array.isArray(d[0])) ? "matrix" : "array";
      }
      return "hashmap";
    }
    return "variable";
  };

  const type = getType(data);

  if (type === "stack") {
    return (
      <div className="flex flex-col items-center my-2">
        <span className="text-xs text-green-400 font-bold mb-1">{label} (Stack)</span>
        <StackVisualizer values={data.values || []} />
      </div>
    );
  }
  
  if (type === "queue") {
    return (
      <div className="flex flex-col items-center my-2">
        <span className="text-xs text-green-400 font-bold mb-1">{label} (Queue)</span>
        <QueueVisualizer values={data.values || []} />
      </div>
    );
  }
  
  if (type === "dsu") {
    return (
      <div className="flex flex-col items-center my-2">
        <span className="text-xs text-green-400 font-bold mb-1">{label} (DSU parent array)</span>
        <DsuVisualizer parent={data.parent || []} />
      </div>
    );
  }

  if (type === "linked_list") {
    return (
      <div className="flex flex-col items-start my-2 w-full">
        <span className="text-xs text-green-400 font-bold mb-1">{label} (Linked List)</span>
        <LinkedListVisualizer nodes={data.nodes} head={data.head} />
      </div>
    );
  }

  if (type === "binary_tree" || type === "avl_tree" || type === "red_black_tree") {
    const typeLabel = type === "avl_tree" ? "AVL Tree" : type === "red_black_tree" ? "Red-Black Tree" : "Binary Tree";
    return (
      <div className="flex flex-col items-center my-2">
        <span className="text-xs text-green-400 font-bold mb-1">{label} ({typeLabel})</span>
        <TreeSvgVisualizer root={data.root} type={type} />
      </div>
    );
  }

  if (type === "segment_tree") {
    return (
      <div className="flex flex-col items-center my-2">
        <span className="text-xs text-green-400 font-bold mb-1">{label} (Segment Tree)</span>
        <TreeSvgVisualizer root={data.root} type={type} />
      </div>
    );
  }

  if (type === "trie") {
    return (
      <div className="flex flex-col items-center my-2">
        <span className="text-xs text-green-400 font-bold mb-1">{label} (Trie)</span>
        <TrieVisualizer root={data.root} />
      </div>
    );
  }

  if (type === "graph") {
    return (
      <div className="flex flex-col items-center my-2">
        <span className="text-xs text-green-400 font-bold mb-1">{label} (Graph)</span>
        <GraphCircularVisualizer adjacencyList={data.adjacency_list || {}} />
      </div>
    );
  }

  // Default fallbacks
  let items = [];
  let gridCols = "auto";

  if (type === "variable") {
    items = [[label, data]];
  } else if (type === "array") {
    items = data.map((v, i) => [`${i}`, v]);
    gridCols = `repeat(${data.length}, auto)`;
  } else if (type === "matrix") {
    items = data.flat().map((v) => [null, v]);
    gridCols = `repeat(${data[0].length}, auto)`;
  } else if (type === "hashmap") {
    items = Object.entries(data);
    gridCols = `repeat(${items.length}, auto)`;
  }

  return (
    <div className="flex flex-col items-center my-4 w-fit max-w-full">
      {label && (
        <div className="w-full bg-black text-green-400 text-center py-1 rounded-t-md font-mono text-xs">
          {label}
        </div>
      )}

      <div
        className={type === "variable" ? "flex bg-black" : "grid bg-black"}
        style={{
          gridTemplateColumns: type === "variable" ? undefined : gridCols,
          border: "1px solid green",
          borderTop: "none",
          borderRadius: "0 0 0.375rem 0.375rem",
          padding: "0.75rem",
          minWidth: "fit-content",
          maxWidth: "100%",
          flexWrap: type === "variable" ? "wrap" : undefined,
          justifyContent: "center",
          gap: "0.5rem"
        }}
      >
        {items.map(([key, value], idx) => (
          <div
            key={idx}
            className="flex flex-col items-center border border-gray-300 bg-white text-black px-3 py-2 rounded"
          >
            {key !== null && (
              <span className="text-[9px] text-gray-500 font-mono">{key}</span>
            )}
            <span className="text-xs font-bold font-mono">
              {typeof value === "boolean" ? value.toString() : typeof value === "object" ? JSON.stringify(value) : value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Black Box Container (Frame Wrapper) ---
export function BlackBoxContainer({ title, children }) {
  return (
    <div className="flex flex-col items-center my-2 w-fit max-w-full border border-green-400 rounded-lg bg-black p-4">
      {title && (
        <div className="text-green-400 font-bold mb-2 font-mono text-sm">{title}</div>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        {children}
      </div>
    </div>
  );
}
