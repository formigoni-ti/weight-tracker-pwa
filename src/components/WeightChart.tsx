import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { computeTrendLine } from "../utils/regression";
import { formatDateShort } from "../utils/dates";
import type { WeightEntry } from "../db";

type Range = "1W" | "1M" | "3M" | "ALL";

const RANGE_DAYS: Record<Range, number | null> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  ALL: null,
};

interface Props {
  entries: WeightEntry[];
  goalWeight: number | null;
  unit: string;
}

function CustomTooltip({ active, payload, label, unit }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string; unit: string }) {
  if (!active || !payload?.length) return null;
  const weight = payload.find((p) => p.dataKey === "weight");
  const trend = payload.find((p) => p.dataKey === "trend");
  return (
    <div className="bg-surface-overlay/95 backdrop-blur-sm border border-border-medium rounded-xl px-3 py-2 shadow-xl">
      <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{label}</div>
      {weight && (
        <div className="text-sm font-bold text-text-primary">{weight.value} <span className="text-text-muted font-normal">{unit}</span></div>
      )}
      {trend && (
        <div className="text-xs text-trend mt-0.5">Trend: {trend.value}</div>
      )}
    </div>
  );
}

export default function WeightChart({ entries, goalWeight, unit }: Props) {
  const [range, setRange] = useState<Range>("ALL");

  const filtered = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const days = RANGE_DAYS[range];
    if (!days || sorted.length === 0) return sorted;
    const latest = new Date(sorted[sorted.length - 1].date);
    latest.setDate(latest.getDate() - days);
    const cutoff = latest.toISOString().slice(0, 10);
    return sorted.filter((e) => e.date >= cutoff);
  }, [entries, range]);

  const chartData = useMemo(() => {
    const byDate = new Map<string, WeightEntry>();
    for (const e of filtered) {
      byDate.set(e.date, e);
    }
    const unique = [...byDate.values()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const trend = computeTrendLine(unique);
    const trendMap = new Map(trend.map((t) => [t.date, t.trend]));
    return unique.map((e) => ({
      date: e.date,
      label: formatDateShort(e.date),
      weight: e.weight,
      trend: trendMap.get(e.date) ?? null,
    }));
  }, [filtered]);

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [180, 200];
    const weights = chartData.map((d) => d.weight);
    const allVals = goalWeight ? [...weights, goalWeight] : weights;
    const min = Math.floor(Math.min(...allVals) - 2);
    const max = Math.ceil(Math.max(...allVals) + 2);
    return [min, max];
  }, [chartData, goalWeight]);

  if (entries.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-text-muted text-sm">No data yet</div>
        <div className="text-text-muted/50 text-xs mt-1">Log your first weight to see the chart</div>
      </div>
    );
  }

  return (
    <div className="card p-4 pt-3">
      {/* Range selector */}
      <div className="flex gap-1 mb-3 bg-surface rounded-xl p-1">
        {(Object.keys(RANGE_DAYS) as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              range === r
                ? "bg-accent text-white shadow-md shadow-accent/30"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -15 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6c5ce7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#5a5a78" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            dy={4}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 10, fill: "#5a5a78" }}
            tickLine={false}
            axisLine={false}
            dx={-4}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Area
            type="linear"
            dataKey="weight"
            stroke="#a29bfe"
            strokeWidth={2.5}
            fill="url(#weightGradient)"
            dot={{ r: 3, fill: "#6c5ce7", stroke: "#a29bfe", strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: "#a29bfe", stroke: "#6c5ce7", strokeWidth: 2 }}
            name="Weight"
          />
          <Line
            type="linear"
            dataKey="trend"
            stroke="#fdcb6e"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            name="Trend"
          />
          {goalWeight && (
            <ReferenceLine
              y={goalWeight}
              stroke="#00cec9"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: `Goal`, position: "insideTopRight", fontSize: 10, fill: "#00cec9", fontWeight: 600 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full bg-accent-light" />
          <span className="text-[10px] text-text-muted">Weight</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full bg-trend" style={{ background: "repeating-linear-gradient(to right, #fdcb6e 0, #fdcb6e 3px, transparent 3px, transparent 5px)" }} />
          <span className="text-[10px] text-text-muted">Trend</span>
        </div>
        {goalWeight && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full bg-positive" />
            <span className="text-[10px] text-text-muted">Goal</span>
          </div>
        )}
      </div>
    </div>
  );
}
