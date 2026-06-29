// linked_list / doubly_linked_list -> nodes with arrows.
// Renders prev/next links and a circular badge when the chain loops.

export default function LinkedListView({ value }) {
  const nodes = value?.nodes || [];
  const doubly = value?.type === "doubly_linked_list";

  return (
    <div className="px-4 py-4 overflow-auto">
      <div className="flex items-center gap-1">
        {nodes.map((node, i) => (
          <div key={node.id} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div className="flex rounded-lg overflow-hidden border border-white/20">
                <div className="min-w-[2.25rem] h-10 grid place-items-center px-2 bg-white/[0.05] font-mono text-sm text-white/90">
                  {String(node.value)}
                </div>
                <div className="w-6 h-10 grid place-items-center bg-white/[0.02] text-white/30 text-xs border-l border-white/10">
                  {node.next === null ? "/" : "*"}
                </div>
              </div>
              {i === (value?.head ?? 0) && (
                <span className="text-[10px] text-indigo-300 mt-1 font-semibold">head</span>
              )}
            </div>
            {i < nodes.length - 1 && (
              <span className="text-white/40 text-lg">{doubly ? "<->" : "->"}</span>
            )}
          </div>
        ))}
        {value?.circular && (
          <span className="ml-2 px-2 py-0.5 rounded-md text-[11px] border border-amber-400/30 bg-amber-500/15 text-amber-200">
            circular
          </span>
        )}
        {nodes.length === 0 && <span className="text-white/30 italic text-sm">empty / null</span>}
      </div>
    </div>
  );
}
