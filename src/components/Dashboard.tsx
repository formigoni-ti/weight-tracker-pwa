import { todayISO } from "../utils/dates";
import WeightChart from "./WeightChart";
import StatsStrip from "./StatsStrip";
import type { WeightEntry } from "../db";

interface Props {
  entries: WeightEntry[];
  goalWeight: number | null;
  unit: string;
  onLogWeight: () => void;
  onEditEntry: (entry: WeightEntry) => void;
}

export default function Dashboard({
  entries,
  goalWeight,
  unit,
  onLogWeight,
  onEditEntry,
}: Props) {
  const today = todayISO();
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const todayEntry = sorted.find((e) => e.date === today);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Weight Tracker</h1>
          <p className="text-sm text-text-muted mt-0.5">Your progress at a glance</p>
        </div>
        <button
          onClick={todayEntry ? () => onEditEntry(todayEntry) : onLogWeight}
          className="h-10 w-10 rounded-full bg-accent flex items-center justify-center glow-accent hover:scale-105 transition-transform active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Today's entry */}
      {todayEntry ? (
        <button
          onClick={() => onEditEntry(todayEntry)}
          className="w-full card p-5 text-left hover:border-border-medium transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-text-muted uppercase tracking-widest font-medium">Today</div>
              <div className="text-4xl font-extrabold text-text-primary mt-1 tracking-tight">
                {todayEntry.weight}
                <span className="text-base font-normal text-text-muted ml-1.5">{unit}</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
          {todayEntry.notes && (
            <div className="text-sm text-text-secondary mt-3 truncate border-t border-border-subtle pt-3">{todayEntry.notes}</div>
          )}
        </button>
      ) : (
        <button
          onClick={onLogWeight}
          className="w-full rounded-2xl p-6 text-center transition-all hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-br from-accent to-purple-500 glow-accent"
        >
          <div className="text-lg font-bold text-white">Log Today's Weight</div>
          <div className="text-sm text-white/60 mt-1">Tap to add your entry</div>
        </button>
      )}

      <WeightChart entries={entries} goalWeight={goalWeight} unit={unit} />
      <StatsStrip entries={entries} goalWeight={goalWeight} unit={unit} />
    </div>
  );
}
