"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from "recharts";
import type { ChartPoint } from "@/lib/analytics";

// ── Custom Tooltip ────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload as ChartPoint;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        Carga:{" "}
        <span className="font-semibold text-foreground">{data.load} pts</span>
      </p>
      <p className="text-muted-foreground">
        Pensamientos:{" "}
        <span className="font-semibold text-foreground">{data.thoughtCount}</span>
      </p>
    </div>
  );
}

// ── Chart ─────────────────────────────────────────────────

interface MentalLoadChartProps {
  data: ChartPoint[];
}

export function MentalLoadChart({ data }: MentalLoadChartProps) {
  const hasData = data.some((p) => p.load > 0);

  if (!hasData) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Sin datos suficientes aún.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart
        data={data}
        margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
      >
        <defs>
          <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          className="text-border"
          vertical={false}
        />

        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "currentColor" }}
          className="text-muted-foreground"
          axisLine={false}
          tickLine={false}
          dy={6}
        />

        <YAxis
          tick={{ fontSize: 11, fill: "currentColor" }}
          className="text-muted-foreground"
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />

        <Tooltip content={<CustomTooltip />} cursor={false} />

        <Area
          type="monotone"
          dataKey="load"
          stroke="hsl(262 83% 58%)"
          strokeWidth={2}
          fill="url(#loadGradient)"
          dot={false}
          activeDot={{
            r: 4,
            fill: "hsl(262 83% 58%)",
            stroke: "hsl(262 83% 58% / 0.3)",
            strokeWidth: 4,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
