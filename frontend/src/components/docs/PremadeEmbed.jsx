// Bridges a docs topic's `premade: "<id>"` to its interactive component, with a
// Suspense skeleton while the lazy chunk loads. Renders nothing for unknown ids.

import { Suspense } from "react";
import { getPremade } from "../premade/registry";
import { Spinner } from "../ui";

export default function PremadeEmbed({ id }) {
  const Comp = getPremade(id);
  if (!Comp) return null;
  return (
    <div className="my-6">
      <Suspense
        fallback={
          <div className="h-64 grid place-items-center rounded-2xl border border-border bg-surface text-fg-faint">
            <Spinner />
          </div>
        }
      >
        <Comp />
      </Suspense>
    </div>
  );
}
