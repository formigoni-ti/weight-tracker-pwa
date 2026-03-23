import { useState } from "react";
import CSVImport from "./CSVImport";
import { exportCSV } from "../utils/csv";
import type { WeightEntry, UserSettings } from "../db";

interface Props {
  settings: UserSettings;
  entries: WeightEntry[];
  onUpdateSettings: (data: Partial<Omit<UserSettings, "id">>) => Promise<void>;
  onImport: (entries: WeightEntry[]) => Promise<void>;
  onClearAll: () => Promise<void>;
}

export default function Settings({
  settings,
  entries,
  onUpdateSettings,
  onImport,
  onClearAll,
}: Props) {
  const [goalInput, setGoalInput] = useState(
    settings.goalWeight ? String(settings.goalWeight) : ""
  );

  function handleGoalSave() {
    const val = parseFloat(goalInput);
    onUpdateSettings({ goalWeight: isNaN(val) ? null : val });
  }

  function handleExport() {
    const csv = exportCSV(entries);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weight-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleClear() {
    if (!confirm("Delete ALL weight entries? This cannot be undone.")) return;
    if (!confirm("Are you really sure?")) return;
    await onClearAll();
  }

  const existingDates = new Set(entries.map((e) => e.date));

  return (
    <div className="space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">Settings</h1>

      {/* Goal Weight */}
      <div className="card p-4">
        <label className="block text-[10px] text-text-muted uppercase tracking-widest font-medium mb-2">Goal Weight ({settings.unit})</label>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="e.g. 180"
            className="flex-1 bg-surface border border-border-subtle rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleGoalSave}
            className="px-5 py-2.5 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors"
          >
            Save
          </button>
          {settings.goalWeight && (
            <button
              onClick={() => {
                setGoalInput("");
                onUpdateSettings({ goalWeight: null });
              }}
              className="px-3 py-2.5 text-text-muted border border-border-subtle rounded-xl hover:bg-surface transition-colors text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Units */}
      <div className="card p-4">
        <label className="block text-[10px] text-text-muted uppercase tracking-widest font-medium mb-2">Units</label>
        <div className="flex gap-2 bg-surface rounded-xl p-1">
          {(["lbs", "kg"] as const).map((u) => (
            <button
              key={u}
              onClick={() => onUpdateSettings({ unit: u })}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                settings.unit === u
                  ? "bg-accent text-white shadow-md shadow-accent/30"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Import */}
      <div className="card p-4">
        <CSVImport existingDates={existingDates} onImport={onImport} />
      </div>

      {/* Export */}
      <div className="card p-4">
        <button
          onClick={handleExport}
          disabled={entries.length === 0}
          className="w-full py-3 rounded-xl border border-accent/30 text-accent-light font-semibold text-sm hover:bg-accent/10 disabled:opacity-40 transition-colors"
        >
          Export CSV ({entries.length} entries)
        </button>
      </div>

      {/* Clear All */}
      <div className="card p-4">
        <button
          onClick={handleClear}
          disabled={entries.length === 0}
          className="w-full py-3 rounded-xl border border-negative/20 text-negative font-semibold text-sm hover:bg-negative/10 disabled:opacity-40 transition-colors"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
}
