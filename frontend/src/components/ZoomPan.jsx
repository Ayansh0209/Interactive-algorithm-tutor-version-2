// ZoomPan: a pannable, zoomable viewport for large visualizations (the
// recursion tree). Mouse-wheel zooms around the pointer, drag pans, and the
// overlay buttons zoom in / zoom out / re-fit. Content initially auto-fits.

import { useRef, useState, useLayoutEffect, useEffect, useCallback } from "react";
import { IconButton, Icon } from "./ui";

const MIN_SCALE = 0.12;
const MAX_SCALE = 3;

export default function ZoomPan({ children }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);
  const fitted = useRef(false);

  const fit = useCallback(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const ow = o.clientWidth, oh = o.clientHeight;
    const iw = i.scrollWidth, ih = i.scrollHeight;
    if (!ow || !oh || !iw || !ih) return;
    const s = Math.max(MIN_SCALE, Math.min(1, ow / iw, oh / ih));
    setView({ s, x: Math.max(0, (ow - iw * s) / 2), y: Math.max(0, (oh - ih * s) / 2) });
    fitted.current = true;
  }, []);

  // Fit once when content first has a size (NOT on every growth — that would
  // fight the user's manual zoom while scrubbing the timeline).
  useLayoutEffect(() => {
    if (!fitted.current) fit();
  });

  const zoomAt = useCallback((factor, cx, cy) => {
    setView((v) => {
      const s = Math.max(MIN_SCALE, Math.min(MAX_SCALE, v.s * factor));
      const k = s / v.s;
      return { s, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k };
    });
  }, []);

  const zoomCenter = (factor) => {
    const o = outer.current;
    if (!o) return;
    zoomAt(factor, o.clientWidth / 2, o.clientHeight / 2);
  };

  // Wheel zoom needs a non-passive listener to preventDefault page scroll.
  useEffect(() => {
    const o = outer.current;
    if (!o) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = o.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - rect.left, e.clientY - rect.top);
    };
    o.addEventListener("wheel", onWheel, { passive: false });
    return () => o.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    drag.current = { px: e.clientX, py: e.clientY, x: view.x, y: view.y };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const d = drag.current;
    setView((v) => ({ ...v, x: d.x + (e.clientX - d.px), y: d.y + (e.clientY - d.py) }));
  };
  const endDrag = () => { drag.current = null; setDragging(false); };

  return (
    <div
      ref={outer}
      className="relative h-full w-full overflow-hidden select-none"
      style={{ touchAction: "none", cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <div
        ref={inner}
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`, transformOrigin: "0 0", width: "max-content" }}
      >
        {children}
      </div>
      {/* zoom controls */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1" onPointerDown={(e) => e.stopPropagation()}>
        <IconButton size="sm" title="Zoom in" onClick={() => zoomCenter(1.3)}><Icon name="plus" size={14} /></IconButton>
        <IconButton size="sm" title="Zoom out" onClick={() => zoomCenter(1 / 1.3)}><Icon name="minus" size={14} /></IconButton>
        <IconButton size="sm" title="Fit to view" onClick={fit}><Icon name="reset" size={14} /></IconButton>
      </div>
      <span className="absolute bottom-2 right-2.5 z-10 text-3xs font-mono text-fg-faint pointer-events-none">
        {Math.round(view.s * 100)}%
      </span>
    </div>
  );
}
