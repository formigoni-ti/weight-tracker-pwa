import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import History from "./components/History";
import Settings from "./components/Settings";
import LogEntryModal from "./components/LogEntryModal";
import { useEntries } from "./hooks/useEntries";
import { useSettings } from "./hooks/useSettings";
import { parseCSV, toWeightEntries } from "./utils/csv";
import type { WeightEntry } from "./db";

function AppContent() {
  const { entries, addEntry, updateEntry, deleteEntry, getEntryByDate, bulkAdd, clearAll } =
    useEntries();
  const { settings, updateSettings } = useSettings();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || entries.length > 0) return;
    seeded.current = true;
    fetch("/seed-data.csv")
      .then((r) => r.text())
      .then((text) => {
        const { entries: parsed } = parseCSV(text);
        if (parsed.length > 0) {
          bulkAdd(toWeightEntries(parsed));
        }
      })
      .catch(() => {});
  }, [entries.length, bulkAdd]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<WeightEntry | null>(null);

  function openModal(entry?: WeightEntry) {
    setEditEntry(entry ?? null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditEntry(null);
  }

  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-4">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                entries={entries}
                goalWeight={settings.goalWeight}
                unit={settings.unit}
                onLogWeight={() => openModal()}
                onEditEntry={(e) => openModal(e)}
              />
            }
          />
          <Route
            path="/history"
            element={
              <History
                entries={entries}
                unit={settings.unit}
                onEdit={(e) => openModal(e)}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <Settings
                settings={settings}
                entries={entries}
                onUpdateSettings={updateSettings}
                onImport={bulkAdd}
                onClearAll={clearAll}
              />
            }
          />
        </Routes>
      </main>

      <LogEntryModal
        open={modalOpen}
        onClose={closeModal}
        onSave={addEntry}
        onUpdate={(id, data) => updateEntry(id, data)}
        onDelete={deleteEntry}
        getEntryByDate={getEntryByDate}
        editEntry={editEntry}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border-subtle">
        <div className="max-w-lg mx-auto flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex-1 py-3 pt-2.5 text-center text-[10px] font-medium tracking-wide uppercase transition-colors ${
                isActive ? "text-accent-light" : "text-text-muted"
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex-1 py-3 pt-2.5 text-center text-[10px] font-medium tracking-wide uppercase transition-colors ${
                isActive ? "text-accent-light" : "text-text-muted"
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            History
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex-1 py-3 pt-2.5 text-center text-[10px] font-medium tracking-wide uppercase transition-colors ${
                isActive ? "text-accent-light" : "text-text-muted"
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
