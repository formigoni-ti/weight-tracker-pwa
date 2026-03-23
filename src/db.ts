import Dexie, { type EntityTable } from "dexie";

export interface WeightEntry {
  id: string;
  date: string; // ISO date "2025-02-17"
  weight: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: "settings";
  goalWeight: number | null;
  unit: "lbs" | "kg";
  startDate: string | null;
}

const db = new Dexie("WeightTracker") as Dexie & {
  entries: EntityTable<WeightEntry, "id">;
  settings: EntityTable<UserSettings, "id">;
};

db.version(1).stores({
  entries: "id, date",
  settings: "id",
});

export { db };
