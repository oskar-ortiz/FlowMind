"use client";

import { useMemo } from "react";
import { useThoughtStore } from "@/store";
import {
  buildChartData,
  buildSnapshot,
  generateInsights,
  getTrend,
  CHART_DAYS,
} from "@/lib/analytics";

import { MentalLoadChart } from "./MentalLoadChart";
import { InsightsPanel } from "./InsightsPanel";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ── Trend display config ──────────────────────────────────

const TREND_CONFIG = {
  increasing: {
    label: "Tendencia al alza",
    icon: TrendingUp,
    className: "text-rose-500",
  },
  decreasing: {
    label: "Tendencia a la baja",
    icon: TrendingDown,
    className: "text-emerald-500",
  },
  stable: {
    label: "Estable",
    icon: Minus,
    className: "text-muted-foreground",
  },
};

// ── Component ─────────────────────────────────────────────

export function AnalyticsPanel() {
  const thoughts = useThoughtStore((s) => s.thoughts);
  const dailySnapshots = useThoughtStore((s) => s.dailySnapshots);

  const { chartData, trend, insights } = useMemo(() => {
    const liveSnapshot = buildSnapshot(thoughts);
    const chartData = buildChartData(dailySnapshots, liveSnapshot);
    const trend = getTrend(chartData);
    const insights = generateInsights(chartData, thoughts, trend);
    return { chartData, trend, insights };
  }, [thoughts, dailySnapshots]);

  const trendConfig = TREND_CONFIG[trend];
  const TrendIcon = trendConfig.icon;

  return (
    <section
      aria-label="Panel de analíticas mentales"
      className="rounded-xl border border-border bg-card ring-1 ring-foreground/5"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-medium text-foreground">
            Analíticas mentales
          </h2>
          <p className="text-xs text-muted-foreground">
            Últimos {CHART_DAYS} días
          </p>
        </div>
        <div
          className={`flex items-center gap-1.5 text-xs font-medium ${trendConfig.className}`}
        >
          <TrendIcon className="size-3.5" />
          {trendConfig.label}
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pt-4 pb-2">
        <MentalLoadChart data={chartData} />
      </div>

      {/* Insights */}
      <div className="border-t border-border px-4 py-3">
        <p className="mb-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Insights
        </p>
        <InsightsPanel insights={insights} />
      </div>
    </section>
  );
}
