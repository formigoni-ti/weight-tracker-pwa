import { useLiveQuery } from "dexie-react-hooks";
import { db, type UserSettings } from "../db";

const DEFAULT_SETTINGS: UserSettings = {
  id: "settings",
  goalWeight: null,
  unit: "lbs",
  startDate: null,
};

export function useSettings() {
  const settings = useLiveQuery(() => db.settings.get("settings")) ?? DEFAULT_SETTINGS;

  async function updateSettings(data: Partial<Omit<UserSettings, "id">>) {
    const existing = await db.settings.get("settings");
    if (existing) {
      await db.settings.update("settings", data);
    } else {
      await db.settings.put({ ...DEFAULT_SETTINGS, ...data });
    }
  }

  return { settings, updateSettings };
}
