// ============================================================
// FlowMind – Analytics engine
// Pure functions — no side-effects, fully testable.
// ============================================================

import type { DailySnapshot, Thought, ThoughtType } from "@/types";

// ── Constants ─────────────────────────────────────────────

export const CHART_DAYS = 7;

// ── Date helpers ──────────────────────────────────────────

/** Returns a YYYY-MM-DD string for a given Date (local timezone). */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Returns the YYYY-MM-DD strings for the last N days (oldest → newest). */
export function lastNDays(n: number = CHART_DAYS): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

/** Short label for the X-axis ("Lun", "Mar", …, "Hoy"). */
export function dayLabel(dateKey: string): string {
  const today = toDateKey();
  if (dateKey === today) return "Hoy";

  const yesterday = toDateKey(new Date(Date.now() - 86_400_000));
  if (dateKey === yesterday) return "Ayer";

  const d = new Date(`${dateKey}T12:00:00`); // noon avoids DST edge-cases
  return d.toLocaleDateString("es-ES", { weekday: "short" });
}

// ── Snapshot builder ──────────────────────────────────────

/** Builds a snapshot for the current moment from the live thought list. */
export function buildSnapshot(thoughts: Thought[]): DailySnapshot {
  const WEIGHT: Record<string, number> = { low: 1, medium: 2, high: 3 };

  const breakdown: Record<ThoughtType, number> = {
    idea: 0,
    task: 0,
    concern: 0,
    noise: 0,
  };

  let load = 0;
  for (const t of thoughts) {
    load += WEIGHT[t.priority] ?? 1;
    breakdown[t.type] = (breakdown[t.type] ?? 0) + 1;
  }

  return {
    date: toDateKey(),
    load,
    thoughtCount: thoughts.length,
    breakdown,
  };
}

// ── Chart data ────────────────────────────────────────────

export interface ChartPoint {
  date: string;
  label: string;
  load: number;
  thoughtCount: number;
}

/**
 * Merges the stored snapshot history with the live snapshot for today,
 * filling missing days with zeros, returning exactly `CHART_DAYS` points.
 */
export function buildChartData(
  snapshots: DailySnapshot[],
  liveSnapshot: DailySnapshot,
): ChartPoint[] {
  // Build a lookup map from stored snapshots
  const map = new Map<string, DailySnapshot>(snapshots.map((s) => [s.date, s]));

  // Override today with the live snapshot (always up-to-date)
  map.set(liveSnapshot.date, liveSnapshot);

  return lastNDays(CHART_DAYS).map((date) => {
    const snap = map.get(date);
    return {
      date,
      label: dayLabel(date),
      load: snap?.load ?? 0,
      thoughtCount: snap?.thoughtCount ?? 0,
    };
  });
}

// ── Trend analysis ────────────────────────────────────────

export type TrendDirection = "increasing" | "decreasing" | "stable";

/**
 * Simple linear trend: compares average of first half vs second half
 * of the chart window.  Needs at least 2 data points with load > 0.
 */
export function getTrend(points: ChartPoint[]): TrendDirection {
  const active = points.filter((p) => p.load > 0);
  if (active.length < 2) return "stable";

  const mid = Math.floor(active.length / 2);
  const firstHalf = active.slice(0, mid);
  const secondHalf = active.slice(mid);

  const avg = (arr: ChartPoint[]) =>
    arr.reduce((s, p) => s + p.load, 0) / arr.length;

  const diff = avg(secondHalf) - avg(firstHalf);

  if (diff > 1.5) return "increasing";
  if (diff < -1.5) return "decreasing";
  return "stable";
}

// ── Insights engine ───────────────────────────────────────

export interface Insight {
  id: string;
  icon: string;
  message: string;
  severity: "positive" | "neutral" | "warning";
}

/**
 * Generates a prioritised list of actionable insights from the data.
 * Rules are ordered by severity — most important first.
 */
export function generateInsights(
  points: ChartPoint[],
  thoughts: Thought[],
  trend: TrendDirection,
): Insight[] {
  const insights: Insight[] = [];
  const today = points.at(-1);
  const totalNoise = thoughts.filter((t) => t.type === "noise").length;
  const totalConcerns = thoughts.filter((t) => t.type === "concern").length;
  const highPriority = thoughts.filter((t) => t.priority === "high").length;
  const noiseRatio = thoughts.length > 0 ? totalNoise / thoughts.length : 0;

  // Trend insights
  if (trend === "increasing") {
    insights.push({
      id: "trend-up",
      icon: "📈",
      message: "Tu carga mental ha aumentado esta semana. Considera liberar algunos pensamientos.",
      severity: "warning",
    });
  } else if (trend === "decreasing") {
    insights.push({
      id: "trend-down",
      icon: "📉",
      message: "¡Vas mejorando! Tu carga mental está bajando esta semana.",
      severity: "positive",
    });
  } else {
    insights.push({
      id: "trend-stable",
      icon: "➡️",
      message: "Tu carga mental se mantiene estable.",
      severity: "neutral",
    });
  }

  // High load today
  if (today && today.load >= 15) {
    insights.push({
      id: "high-load-today",
      icon: "🔥",
      message: `Carga alta hoy (${today.load} pts). Intenta procesar o eliminar pensamientos de baja prioridad.`,
      severity: "warning",
    });
  }

  // High priority concentration
  if (highPriority >= 3) {
    insights.push({
      id: "high-priority",
      icon: "⚠️",
      message: `Tienes ${highPriority} pensamientos de alta prioridad. Considera actuar primero en ellos.`,
      severity: "warning",
    });
  }

  // Noise ratio
  if (noiseRatio > 0.4 && totalNoise >= 2) {
    insights.push({
      id: "high-noise",
      icon: "☁️",
      message: `El ${Math.round(noiseRatio * 100)}% de tus pensamientos son ruido. Filtra por "Ruido" y elimina los irrelevantes.`,
      severity: "neutral",
    });
  }

  // Concerns signal
  if (totalConcerns >= 2) {
    insights.push({
      id: "concerns",
      icon: "💭",
      message: `Tienes ${totalConcerns} preocupaciones activas. Escribirlas ya las hace más manejables.`,
      severity: "neutral",
    });
  }

  // All clear
  if (insights.length === 1 && trend === "stable" && (today?.load ?? 0) < 8) {
    insights.push({
      id: "all-clear",
      icon: "✨",
      message: "Tu mente está bastante despejada. ¡Buen trabajo!",
      severity: "positive",
    });
  }

  return insights;
}
