// AutoFit: uniformly scales its content to fit the available box, so a panel
// full of variables shrinks to stay visible (instead of spawning a scrollbar)
// and a sparse panel grows to fill the space. Pure visual transform -- layout
// size is measured unscaled, so there is no feedback loop. Falls back to
// scrolling only if content is still too large at the minimum scale.

import { useRef, useState, useLayoutEffect, useCallback } from "react";
import { cx } from "./ui";

// FitWidth: scales its content DOWN (never up) so its natural width fits the
// container's width — no inner horizontal scrollbar. The wrapper's height
// tracks the scaled content so surrounding layout stays tight. Used by the
// wide structure renderers (trees, linked lists, tries) inside variable cards.
export function FitWidth({ children, min = 0.35, className = "" }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const [scale, setScale] = useState(1);
  const [h, setH] = useState(null);

  const measure = useCallback(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const ow = o.clientWidth, iw = i.scrollWidth, ih = i.scrollHeight;
    if (!ow || !iw || !ih) return;
    const s = Math.max(min, Math.min(1, ow / iw));
    setScale((p) => (Math.abs(p - s) > 0.004 ? s : p));
    setH(Math.ceil(ih * s));
  }, [min]);

  useLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    if (outer.current) ro.observe(outer.current);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div ref={outer} className={cx("w-full overflow-hidden", className)} style={{ height: h ?? "auto" }}>
      <div ref={inner} style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: "max-content" }}>
        {children}
      </div>
    </div>
  );
}

export default function AutoFit({ children, min = 0.5, max = 1.15, mode = "both", className = "", align = "top" }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const [scale, setScale] = useState(1);

  const measure = useCallback(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const ow = o.clientWidth;
    const oh = o.clientHeight;
    // scrollWidth/Height are the natural (untransformed) content size.
    const iw = i.scrollWidth;
    const ih = i.scrollHeight;
    if (!iw || !ih || !ow || !oh) return;
    // "height" fits vertical stacking (wide widgets keep their own x-scroll);
    // "both" fits the whole thing (used for the recursion tree).
    const ratio = mode === "height" ? oh / ih : Math.min(ow / iw, oh / ih);
    const s = Math.max(min, Math.min(max, ratio));
    setScale((prev) => (Math.abs(prev - s) > 0.005 ? s : prev));
  }, [min, max, mode]);

  useLayoutEffect(() => {
    measure();
    const o = outer.current;
    const i = inner.current;
    if (!o || !i || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [measure]);

  const overflow = scale <= min ? "auto" : "hidden";
  const justify = align === "center" ? "center" : "flex-start";

  return (
    <div
      ref={outer}
      className={cx("h-full w-full scrollbar-thin", className)}
      style={{ overflow, display: "flex", justifyContent: "center", alignItems: justify }}
    >
      <div ref={inner} style={{ transform: `scale(${scale})`, transformOrigin: "top center", flex: "0 0 auto" }}>
        {children}
      </div>
    </div>
  );
}
