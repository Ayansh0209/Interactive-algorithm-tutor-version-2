// src/components/RecursionTree.jsx
import React, { useMemo } from "react";
import { useTrace } from "../contexts/TraceContext";

// Reconstruct the recursion tree from trace steps history
function buildRecursionTree(traceSteps, currentStep) {
  const root = { id: "root", name: "root", children: [], isRoot: true };
  let path = [root];

  for (let i = 0; i <= currentStep; i++) {
    const step = traceSteps[i];
    if (!step || !step.callStack) continue;

    const stack = step.callStack;
    const depth = stack.length;

    while (path.length > depth + 1) {
      path.pop();
    }

    if (depth > 0) {
      const currentCall = stack[depth - 1];
      const parentNode = path[path.length - 1];

      const argsStr = Object.entries(currentCall.args || {})
        .map(([k, v]) => `${k}=${v}`)
        .join(", ");
      const nodeName = `${currentCall.function}(${argsStr})`;

      let childNode = parentNode.children.find((c) => c.name === nodeName);
      if (!childNode) {
        childNode = {
          id: `rec-node-${i}-${nodeName}`,
          name: nodeName,
          children: [],
          status: step.event === "return" ? "returned" : "active",
          returnValue: null,
          stepIndex: i
        };
        parentNode.children.push(childNode);
      }

      if (step.event === "return" && step.functionName === currentCall.function) {
        childNode.status = "returned";
        // Extract return value from step.locals if present
        if (step.locals && step.locals.return_value !== undefined) {
          childNode.returnValue = step.locals.return_value;
        }
      }

      if (path.length === depth) {
        path.push(childNode);
      }
    }
  }

  return root.children[0] || null;
}

// Compute tree nodes SVG coordinates recursively
function layoutRecursionTree(node, x, y, dx, dy, depth = 0) {
  if (!node) return null;
  const nodes = [];
  const lines = [];

  const childrenCount = node.children.length;
  let idx = 0;

  node.children.forEach((child) => {
    // Dynamically adjust branch spacing
    const childX = x + (idx - (childrenCount - 1) / 2) * (dx / Math.pow(1.15, depth));
    const childY = y + dy;

    lines.push(
      <line
        key={`rl-${x}-${y}-${child.id}`}
        x1={x}
        y1={y}
        x2={childX}
        y2={childY}
        stroke="#4b5563"
        strokeWidth="1.5"
      />
    );

    const childLayout = layoutRecursionTree(child, childX, childY, dx, dy, depth + 1);
    if (childLayout) {
      nodes.push(...childLayout.nodes);
      lines.push(...childLayout.lines);
    }
    idx++;
  });

  // Styles based on recursion node status
  let circleClass = "fill-blue-600 stroke-blue-400";
  if (node.status === "returned") {
    circleClass = "fill-green-600 stroke-green-400";
  }

  nodes.push(
    <g key={`rn-${node.id}`} className="cursor-pointer group">
      <circle cx={x} cy={y} r="12" className={`${circleClass} stroke-2 transition-all duration-300`} />
      <text x={x} y={y + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" className="font-mono select-none">
        {depth}
      </text>
      {/* Tooltip on hover */}
      <title>{node.name}{node.returnValue !== null ? ` -> returned ${node.returnValue}` : ""}</title>
      
      {/* Node label text */}
      <text x={x} y={y - 16} textAnchor="middle" fill="#9ca3af" fontSize="8" className="font-mono bg-black select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        {node.name}
      </text>
    </g>
  );

  return { nodes, lines };
}

function RecursionTree() {
  const { traceSteps, currentStep } = useTrace();

  // Re-map traceSteps call_stack to callStack to match runner mapping
  const normalizedSteps = useMemo(() => {
    return traceSteps.map(step => ({
      ...step,
      callStack: step.callStack || step.call_stack || []
    }));
  }, [traceSteps]);

  const treeRoot = useMemo(() => {
    return buildRecursionTree(normalizedSteps, currentStep);
  }, [normalizedSteps, currentStep]);

  const dx = 120;
  const dy = 50;
  const width = 450;
  const height = 250;

  const layout = useMemo(() => {
    return treeRoot ? layoutRecursionTree(treeRoot, width / 2, 30, dx, dy) : null;
  }, [treeRoot]);

  if (!treeRoot) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-green-500/20 bg-black/40 rounded-lg">
        <span className="text-sm text-gray-500 font-mono">No active recursion call stack detected.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center my-2 w-full max-w-full">
      <div className="text-green-400 font-bold mb-2 font-mono text-sm">Recursion Tree (DFS / Backtracking)</div>
      <div className="overflow-auto max-w-full border border-green-500/20 bg-black/40 rounded p-4">
        <svg width={width} height={height} className="min-w-[450px]">
          {layout?.lines}
          {layout?.nodes}
        </svg>
      </div>
      <div className="text-[10px] text-gray-400 font-mono mt-2">
        Hover nodes to view arguments. Green means call returned; blue is currently active.
      </div>
    </div>
  );
}

export default RecursionTree;
