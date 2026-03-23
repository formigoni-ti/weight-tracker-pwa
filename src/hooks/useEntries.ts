import { useLiveQuery } from "dexie-react-hooks";
import { v4 as uuid } from "uuid";
import { db, type WeightEntry } from "../db";

export function useEntries() {
  const entries = useLiveQuery(() => db.entries.orderBy("date").toArray()) ?? [];

  async function addEntry(date: string, weight: number, notes: string) {
    const now = new Date().toISOString();
    await db.entries.add({
      id: uuid(),
      date,
      weight,
      notes,
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateEntry(id: string, data: Partial<Pick<WeightEntry, "date" | "weight" | "notes">>) {
    await db.entries.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async function deleteEntry(id: string) {
    await db.entries.delete(id);
  }

  async function getEntryByDate(date: string) {
    return db.entries.where("date").equals(date).first();
  }

  async function bulkAdd(newEntries: WeightEntry[]) {
    await db.entries.bulkAdd(newEntries);
  }

  async function clearAll() {
    await db.entries.clear();
  }

  return { entries, addEntry, updateEntry, deleteEntry, getEntryByDate, bulkAdd, clearAll };
}
