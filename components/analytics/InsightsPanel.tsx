"use client";

import type { Insight } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<Insight["severity"], string> = {
  positive:
    "bg-emerald-500/8 border-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  neutral:
    "bg-muted/60 border-border text-muted-foreground",
  warning:
    "bg-amber-500/8 border-amber-500/20 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

interface InsightsPanelProps {
  insights: Insight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  if (insights.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className={cn(
            "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs leading-relaxed",
            SEVERITY_STYLES[insight.severity],
          )}
        >
          <span className="mt-px shrink-0 text-sm leading-none" role="img" aria-hidden>
            {insight.icon}
          </span>
          <p>{insight.message}</p>
        </div>
      ))}
    </div>
  );
}
