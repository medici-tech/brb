import { describe, expect, it } from "vitest";
import {
  STORAGE_KEYS,
  commitAction,
  createReplayIntent,
  createEmptyArchive,
  createGame,
  loadActiveRun,
  loadArchive,
  loadLatestReport,
  loadReplayIntent,
  saveActiveRun,
  saveArchive,
  saveLatestReport,
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
  function completedReport() {
    const state = createGame({ seed: 17, runId: "report-storage-run" });
    state.activeCardId = null;
    state.tracks = {
      engineering: 60,
      access: 60,
      legitimacy: 60,
      stability: 60,
    };
    state.corporation.progress = 20;
    const finished = commitAction(state, { type: "activate_brb" }).state;
    if (!finished.report) throw new Error("Expected a completed report");
    return finished.report;
  }

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

  it("fails closed for supported versions with malformed nested data or IDs", () => {
    const storage = memoryStorage();
    storage.setItem(
      STORAGE_KEYS.activeRun,
      JSON.stringify({ version: 4, corporation: { lastResponseMonth: 0 } }),
    );
    storage.setItem(STORAGE_KEYS.archive, JSON.stringify({ version: 0 }));
    storage.setItem(
      STORAGE_KEYS.latestReport,
      JSON.stringify({
        runId: "malformed",
        rulesVersion: 1,
        archetypeId: "outsider",
      }),
    );
    storage.setItem(
      STORAGE_KEYS.replayIntent,
      JSON.stringify({
        mode: "same_seed",
        seed: 42,
        archetypeId: "outsider",
        experiment: "Try again",
      }),
    );

    expect(loadActiveRun(storage)).toBeNull();
    expect(loadArchive(storage)).toBeNull();
    expect(loadLatestReport(storage)).toBeNull();
    expect(loadReplayIntent(storage)).toBeNull();
  });

  it("rejects invalid canonical IDs and missing decision provenance", () => {
    const storage = memoryStorage();
    const invalidCard = createGame(81);
    invalidCard.activeCardId = "not-a-card";
    storage.setItem(STORAGE_KEYS.activeRun, JSON.stringify(invalidCard));
    expect(loadActiveRun(storage)).toBeNull();

    const invalidSource = createGame(82);
    invalidSource.deck.cardSources.silent_partner = "missing-decision";
    storage.setItem(STORAGE_KEYS.activeRun, JSON.stringify(invalidSource));
    expect(loadActiveRun(storage)).toBeNull();
  });

  it("loads a legacy v3 key and replaces it on the next save", () => {
    const storage = memoryStorage();
    const legacy = JSON.parse(JSON.stringify(createGame(21)));
    legacy.version = 3;
    delete legacy.lastTurnResolution;
    storage.setItem(STORAGE_KEYS.legacyActiveRun, JSON.stringify(legacy));

    const restored = loadActiveRun(storage);
    expect(restored?.version).toBe(4);
    expect(restored?.lastTurnResolution).toBeNull();

    if (!restored) throw new Error("Expected migrated save");
    saveActiveRun(storage, restored);
    expect(storage.getItem(STORAGE_KEYS.legacyActiveRun)).toBeNull();
    expect(storage.getItem(STORAGE_KEYS.activeRun)).not.toBeNull();
  });

  it("round-trips the current report rules version and final-state snapshot", () => {
    const storage = memoryStorage();
    const report = completedReport();

    saveLatestReport(storage, report);

    expect(loadLatestReport(storage)).toEqual(report);
    expect(storage.getItem(STORAGE_KEYS.latestReport)).not.toBeNull();
    expect(report.rulesVersion).toBeGreaterThan(0);
    expect(report.finalSnapshot).toMatchObject({
      tracks: { engineering: 60, access: 60, legitimacy: 60, stability: 60 },
      corporation: { progress: 20 },
    });
  });

  it("reads a v2 report without deleting it and creates a current-rules replay intent", () => {
    const storage = memoryStorage();
    const legacy = JSON.parse(JSON.stringify(completedReport()));
    delete legacy.rulesVersion;
    delete legacy.finalSnapshot;
    storage.setItem(STORAGE_KEYS.legacyLatestReport, JSON.stringify(legacy));

    const restored = loadLatestReport(storage);

    expect(restored).toMatchObject({
      rulesVersion: 0,
      finalSnapshot: null,
      seed: legacy.seed,
      archetypeId: legacy.archetypeId,
    });
    expect(storage.getItem(STORAGE_KEYS.legacyLatestReport)).not.toBeNull();
    if (!restored) throw new Error("Expected the legacy report");
    expect(createReplayIntent(restored, "same_seed")).toMatchObject({
      mode: "same_seed",
      seed: restored.seed,
      archetypeId: restored.archetypeId,
    });
  });
});
