// stack / queue / deque / heap -> oriented box stacks.
// Stack grows vertically with a "top" marker; queue/deque are horizontal with
// front/back markers. Heap is shown as its array form (level order).

export default function StackQueueView({ value, vtype }) {
  const items = value?.values || (Array.isArray(value) ? value : []);

  if (vtype === "stack") {
    return (
      <div className="px-4 py-3">
        <div className="inline-flex flex-col-reverse gap-1">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="min-w-[3rem] h-9 px-3 grid place-items-center rounded-lg border border-white/15 bg-white/[0.04] font-mono text-sm">
                {String(it)}
              </div>
              {i === items.length - 1 && <span className="text-[10px] text-indigo-300 font-semibold">top</span>}
            </div>
          ))}
          {!items.length && <span className="text-white/30 italic text-sm">empty</span>}
        </div>
      </div>
    );
  }

  // queue / deque / heap -> horizontal
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-1 flex-wrap">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="min-w-[2.75rem] h-9 px-2 grid place-items-center rounded-lg border border-white/15 bg-white/[0.04] font-mono text-sm">
              {String(it)}
            </div>
            <span className="text-[10px] text-white/30 mt-0.5">
              {i === 0 ? (vtype === "heap" ? "root" : "front") : i === items.length - 1 ? "back" : ""}
            </span>
          </div>
        ))}
        {!items.length && <span className="text-white/30 italic text-sm">empty</span>}
      </div>
    </div>
  );
}
