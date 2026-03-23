import { useState, useEffect } from "react";
import { todayISO } from "../utils/dates";
import type { WeightEntry } from "../db";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (date: string, weight: number, notes: string) => Promise<void>;
  onUpdate: (id: string, data: { date: string; weight: number; notes: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  getEntryByDate: (date: string) => Promise<WeightEntry | undefined>;
  editEntry?: WeightEntry | null;
}

export default function LogEntryModal({
  open,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  getEntryByDate,
  editEntry,
}: Props) {
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [existingEntry, setExistingEntry] = useState<WeightEntry | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editEntry) {
      setDate(editEntry.date);
      setWeight(String(editEntry.weight));
      setNotes(editEntry.notes);
      setExistingEntry(editEntry);
    } else if (open) {
      setDate(todayISO());
      setWeight("");
      setNotes("");
      setExistingEntry(null);
    }
  }, [editEntry, open]);

  useEffect(() => {
    if (!editEntry && open) {
      getEntryByDate(date).then((entry) => {
        if (entry) {
          setWeight(String(entry.weight));
          setNotes(entry.notes);
          setExistingEntry(entry);
        } else {
          setExistingEntry(null);
        }
      });
    }
  }, [date, editEntry, open, getEntryByDate]);

  if (!open) return null;

  async function handleSave() {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;

    setSaving(true);
    try {
      if (existingEntry) {
        await onUpdate(existingEntry.id, { date, weight: w, notes });
      } else {
        await onSave(date, w, notes);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existingEntry) return;
    if (!confirm("Delete this entry?")) return;
    setSaving(true);
    try {
      await onDelete(existingEntry.id);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-slide-up bg-surface-raised border border-border-subtle">
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-border-medium mx-auto mb-5 sm:hidden" />

        <h2 className="text-xl font-bold text-text-primary mb-5">
          {existingEntry ? "Edit Entry" : "Log Weight"}
        </h2>

        <label className="block text-[10px] text-text-muted uppercase tracking-widest font-medium mb-1.5">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 mb-4 text-base text-text-primary focus:outline-none focus:border-accent transition-colors"
        />

        <label className="block text-[10px] text-text-muted uppercase tracking-widest font-medium mb-1.5">Weight</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="0.0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-4 mb-4 text-3xl font-bold text-center text-text-primary focus:outline-none focus:border-accent transition-colors"
        />

        <label className="block text-[10px] text-text-muted uppercase tracking-widest font-medium mb-1.5">Notes <span className="normal-case tracking-normal">(optional)</span></label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Meals, exercise, how you felt..."
          rows={3}
          className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 mb-6 text-sm text-text-primary placeholder:text-text-muted/50 resize-none focus:outline-none focus:border-accent transition-colors"
        />

        <div className="flex gap-3">
          {existingEntry && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-3 rounded-xl text-negative border border-negative/20 hover:bg-negative/10 font-semibold text-sm transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl text-text-secondary border border-border-subtle hover:bg-surface font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !weight}
            className="flex-1 px-4 py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent/90 disabled:opacity-40 transition-all glow-accent"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
