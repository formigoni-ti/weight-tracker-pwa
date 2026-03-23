import { formatDate } from "../utils/dates";
import type { WeightEntry } from "../db";

interface Props {
  entries: WeightEntry[];
  unit: string;
  onEdit: (entry: WeightEntry) => void;
}

export default function History({ entries, unit, onEdit }: Props) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 pb-24">
        <div className="text-text-muted text-lg">No entries yet</div>
        <p className="text-text-muted/60 text-sm mt-1">Go to the dashboard to log your first weight.</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">History</h1>
      <p className="text-sm text-text-muted mb-4">{sorted.length} entries</p>

      <div className="space-y-1.5">
        {sorted.map((entry, i) => {
          const prev = sorted[i + 1];
          const diff = prev ? entry.weight - prev.weight : null;

          return (
            <button
              key={entry.id}
              onClick={() => onEdit(entry)}
              className="w-full card p-4 flex items-center gap-4 text-left hover:border-border-medium transition-all active:scale-[0.99]"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-text-muted font-medium">{formatDate(entry.date)}</div>
                <div className="text-xl font-bold text-text-primary tracking-tight mt-0.5">
                  {entry.weight}
                  <span className="text-xs font-normal text-text-muted ml-1">{unit}</span>
                </div>
                {entry.notes && (
                  <div className="text-xs text-text-secondary truncate mt-1">{entry.notes}</div>
                )}
              </div>
              {diff !== null && (
                <div
                  className={`text-sm font-bold whitespace-nowrap px-2.5 py-1 rounded-lg ${
                    diff < 0
                      ? "text-positive bg-positive/10"
                      : diff > 0
                      ? "text-negative bg-negative/10"
                      : "text-text-muted bg-surface"
                  }`}
                >
                  {diff > 0 ? "+" : ""}
                  {diff.toFixed(1)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
