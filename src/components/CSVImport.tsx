import { useState, useRef } from "react";
import { parseCSV, toWeightEntries } from "../utils/csv";
import { formatDate } from "../utils/dates";
import type { WeightEntry } from "../db";

interface Props {
  existingDates: Set<string>;
  onImport: (entries: WeightEntry[]) => Promise<void>;
}

export default function CSVImport({ existingDates, onImport }: Props) {
  const [parsed, setParsed] = useState<ReturnType<typeof parseCSV> | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = parseCSV(reader.result as string);
      setParsed(result);
      setDone(false);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!parsed) return;
    const newEntries = parsed.entries.filter((e) => !existingDates.has(e.date));
    if (newEntries.length === 0) return;

    setImporting(true);
    try {
      await onImport(toWeightEntries(newEntries));
      setDone(true);
      setParsed(null);
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setParsed(null);
    setDone(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  const newEntries = parsed?.entries.filter((e) => !existingDates.has(e.date)) ?? [];
  const dupes = parsed ? parsed.entries.length - newEntries.length : 0;

  return (
    <div>
      <label className="block text-[10px] text-text-muted uppercase tracking-widest font-medium mb-2">Import CSV</label>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFile}
        className="block w-full text-sm text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-accent/10 file:text-accent-light file:font-semibold file:text-sm hover:file:bg-accent/20 file:transition-colors file:cursor-pointer"
      />

      {done && (
        <p className="mt-3 text-sm text-positive font-semibold">Import complete!</p>
      )}

      {parsed && (
        <div className="mt-4 animate-fade-in">
          {parsed.errors.length > 0 && (
            <div className="bg-negative/10 border border-negative/20 rounded-xl p-3 mb-3">
              <p className="text-sm font-semibold text-negative mb-1">Errors:</p>
              {parsed.errors.map((err, i) => (
                <p key={i} className="text-xs text-negative/80">{err}</p>
              ))}
            </div>
          )}

          <p className="text-sm text-text-secondary mb-2">
            {newEntries.length} new entries{dupes > 0 && `, ${dupes} duplicates skipped`}
          </p>

          {newEntries.length > 0 && (
            <>
              <div className="max-h-48 overflow-y-auto bg-surface rounded-xl border border-border-subtle divide-y divide-border-subtle">
                {newEntries.map((e, i) => (
                  <div key={i} className="px-3 py-2 text-sm flex justify-between">
                    <span className="text-text-muted">{formatDate(e.date)}</span>
                    <span className="font-semibold text-text-primary">{e.weight}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={reset}
                  className="flex-1 py-2.5 rounded-xl border border-border-subtle text-text-muted font-semibold text-sm hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 disabled:opacity-40 transition-colors"
                >
                  {importing ? "Importing..." : `Import ${newEntries.length} entries`}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
