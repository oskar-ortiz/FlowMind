"use client";

import { useThoughtStore } from "@/store";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Visual indicator of the user's current mental load.
 *
 * Thresholds:
 *  0-5   → Low    (green)
 *  6-12  → Medium (amber)
 *  13+   → High   (rose)
 */
export function MentalLoadMeter() {
  const mentalLoad = useThoughtStore((s) => s.mentalLoad);
  const thoughtCount = useThoughtStore((s) => s.thoughts.length);

  const level =
    mentalLoad <= 5 ? "low" : mentalLoad <= 12 ? "medium" : "high";

  const levelConfig = {
    low: {
      label: "Baja",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      bar: "bg-emerald-500",
    },
    medium: {
      label: "Media",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      bar: "bg-amber-500",
    },
    high: {
      label: "Alta",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      bar: "bg-rose-500",
    },
  };

  const config = levelConfig[level];
  // Normalize to 0-100 for the progress bar (cap at 30)
  const pct = Math.min((mentalLoad / 30) * 100, 100);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
        config.bg,
      )}
    >
      <Brain className={cn("size-5 shrink-0", config.color)} />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="font-medium text-foreground">
            Carga mental:{" "}
            <span className={config.color}>{config.label}</span>
          </span>
          <span className="tabular-nums text-muted-foreground">
            {mentalLoad} pts · {thoughtCount}{" "}
            {thoughtCount === 1 ? "pensamiento" : "pensamientos"}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/5">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              config.bar,
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
