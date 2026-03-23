import { v4 as uuid } from "uuid";
import type { WeightEntry } from "../db";

function parseFlexibleDate(raw: string): string | null {
  const trimmed = raw.trim();

  // ISO format: 2025-02-17
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // m/d, m/d/yy, m/d/yyyy
  const parts = trimmed.split("/");
  if (parts.length >= 2) {
    const month = parts[0].padStart(2, "0");
    const day = parts[1].padStart(2, "0");
    let year = "2025";
    if (parts.length === 3) {
      year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    }
    return `${year}-${month}-${day}`;
  }

  return null;
}

export function parseCSV(
  text: string
): { entries: Omit<WeightEntry, "id" | "createdAt" | "updatedAt">[]; errors: string[] } {
  const lines = text.trim().split("\n");
  const entries: Omit<WeightEntry, "id" | "createdAt" | "updatedAt">[] = [];
  const errors: string[] = [];

  // Skip header if present
  const firstLine = lines[0].toLowerCase();
  const startIdx = firstLine.includes("date") || firstLine.includes("weight") ? 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(",").map((s) => s.trim());
    if (cols.length < 2) {
      errors.push(`Line ${i + 1}: not enough columns`);
      continue;
    }

    const date = parseFlexibleDate(cols[0]);
    if (!date) {
      errors.push(`Line ${i + 1}: invalid date "${cols[0]}"`);
      continue;
    }

    const weight = parseFloat(cols[1]);
    if (isNaN(weight)) {
      errors.push(`Line ${i + 1}: invalid weight "${cols[1]}"`);
      continue;
    }

    const notes = cols.length > 2 ? cols.slice(2).join(",").trim() : "";
    entries.push({ date, weight, notes });
  }

  return { entries, errors };
}

export function toWeightEntries(
  parsed: Omit<WeightEntry, "id" | "createdAt" | "updatedAt">[]
): WeightEntry[] {
  const now = new Date().toISOString();
  return parsed.map((e) => ({
    ...e,
    id: uuid(),
    createdAt: now,
    updatedAt: now,
  }));
}

export function exportCSV(entries: WeightEntry[]): string {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const lines = ["date,weight,notes"];
  for (const e of sorted) {
    const notes = e.notes.includes(",") ? `"${e.notes}"` : e.notes;
    lines.push(`${e.date},${e.weight},${notes}`);
  }
  return lines.join("\n");
}
