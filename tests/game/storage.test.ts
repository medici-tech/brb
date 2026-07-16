import { describe, expect, it } from "vitest";
import {
  STORAGE_KEYS,
  createEmptyArchive,
  createGame,
  loadActiveRun,
  loadArchive,
  loadLatestReport,
  loadReplayIntent,
  saveActiveRun,
  saveArchive,
} from "../../src/game/index.js";

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
}

describe("versioned browser persistence", () => {
  it("round-trips supported active-run and Archive versions", () => {
    const storage = memoryStorage();
    const run = createGame({ seed: 18, runId: "stored-run" });
    const archive = createEmptyArchive();
    saveActiveRun(storage, run);
    saveArchive(storage, archive);
    expect(loadActiveRun(storage)).toEqual(run);
    expect(loadArchive(storage)).toEqual(archive);
  });

  it("fails safely for invalid or obsolete local data", () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEYS.activeRun, JSON.stringify({ version: 1, resources: { money: 100 } }));
    storage.setItem(STORAGE_KEYS.archive, "not-json");
    storage.setItem(STORAGE_KEYS.latestReport, JSON.stringify({ runId: "incomplete" }));
    storage.setItem(STORAGE_KEYS.replayIntent, JSON.stringify({ mode: "same_seed", seed: "wrong" }));
    expect(loadActiveRun(storage)).toBeNull();
    expect(loadArchive(storage)).toBeNull();
    expect(loadLatestReport(storage)).toBeNull();
    expect(loadReplayIntent(storage)).toBeNull();
    expect(createGame(18).resources).toEqual(createGame(18).resources);
  });
});
