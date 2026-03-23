import type { WeightEntry } from "../db";

interface Props {
  entries: WeightEntry[];
  goalWeight: number | null;
  unit: string;
}

export default function StatsStrip({ entries, goalWeight, unit }: Props) {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const totalChange = latest.weight - first.weight;

  // 7-day trend relative to latest entry
  const latestDate = new Date(latest.date);
  const sevenDaysAgo = new Date(latestDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentEntries = sorted.filter(
    (e) => new Date(e.date) >= sevenDaysAgo
  );
  let trendLabel = "--";
  let trendColor = "text-text-secondary";
  if (recentEntries.length >= 2) {
    const recentChange =
      recentEntries[recentEntries.length - 1].weight - recentEntries[0].weight;
    if (recentChange < -0.2) { trendLabel = "Losing"; trendColor = "text-positive"; }
    else if (recentChange > 0.2) { trendLabel = "Gaining"; trendColor = "text-negative"; }
    else { trendLabel = "Stable"; trendColor = "text-text-secondary"; }
  }

  const dayCount = sorted.length;

  interface Stat {
    label: string;
    value: string;
    color: string;
    icon: string;
  }

  const stats: Stat[] = [
    { label: "Current", value: `${latest.weight}`, color: "text-text-primary", icon: "scale" },
    {
      label: "Change",
      value: `${totalChange > 0 ? "+" : ""}${totalChange.toFixed(1)}`,
      color: totalChange < 0 ? "text-positive" : totalChange > 0 ? "text-negative" : "text-text-secondary",
      icon: "delta",
    },
    { label: "7d Trend", value: trendLabel, color: trendColor, icon: "trend" },
    { label: "Entries", value: String(dayCount), color: "text-text-primary", icon: "cal" },
  ];

  if (goalWeight) {
    const toGo = latest.weight - goalWeight;
    stats.push({
      label: "To Goal",
      value: toGo > 0 ? `${toGo.toFixed(1)} ${unit}` : "Done!",
      color: toGo <= 0 ? "text-positive" : "text-accent-light",
      icon: "goal",
    });
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {stats.slice(0, 4).map((s) => (
          <div key={s.label} className="card p-3.5">
            <div className="text-[10px] text-text-muted uppercase tracking-widest font-medium mb-1">{s.label}</div>
            <div className={`text-xl font-bold tracking-tight ${s.color}`}>
              {s.value}
              {(s.label === "Current" || s.label === "Change") && (
                <span className="text-xs font-normal text-text-muted ml-1">{unit}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {stats[4] && (
        <div className="card p-3.5 flex items-center justify-between">
          <div className="text-[10px] text-text-muted uppercase tracking-widest font-medium">{stats[4].label}</div>
          <div className={`text-lg font-bold ${stats[4].color}`}>{stats[4].value}</div>
        </div>
      )}
    </div>
  );
}
