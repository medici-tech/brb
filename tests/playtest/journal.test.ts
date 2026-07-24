import { describe, expect, it } from "vitest";
import { commitAction, consultAdvisor, createGame } from "../../src/game/index.js";
import type { GameState } from "../../src/game/types.js";
import {
  PLAYTEST_STORAGE_KEY,
  abandonActivePlaytestRun,
  addPlaytestBookmark,
  clearPlaytestJournal,
  completePlaytestRun,
  createEmptyPlaytestJournal,
  loadPlaytestJournal,
  recordPlaytestDecision,
  savePlaytestJournal,
  savePlaytestRecap,
  serializePlaytestJournal,
  startPrimaryPlaytestRun,
  startReplayPlaytestRun,
  summarizePlaytestJournal,
} from "../../src/playtest/journal.js";

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

function commitOne(state: GameState): GameState {
  const prepared = structuredClone(state);
  prepared.activeCardId = null;
  const result = commitAction(prepared, { type: "recover_resource", resource: "money" });
  expect(result.accepted).toBe(true);
  return result.state;
}

function createTechnocratMatrixGame(seed: number, runId: string): GameState {
  return createGame({
    seed,
    archetypeId: "technocrat",
    runId,
    legacyDirectiveId: "emergency_appropriation",
  });
}

function endedState(state: GameState): GameState {
  const ended = structuredClone(state);
  ended.phase = "ended";
  ended.ending = {
    id: "state_collapse",
    title: "The Empty Chamber",
    description: "The state could no longer carry the project.",
    victory: false,
    reason: "Test ending",
    variationId: null,
    variationTitle: null,
  };
  return ended;
}

const recap = {
  fairness: 3 as const,
  pacing: "about_right" as const,
  lateGamePressure: "gradual" as const,
  consequenceClarity: 4 as const,
  strategyViability: 3 as const,
  replayInterest: 5 as const,
  directiveUseMonth: 8,
  directiveTimingReason: "The resource gain made the next commitment affordable.",
  directiveDrawbackMeaning: 4 as const,
  ignoredOrderingClarity: 5 as const,
  nextExperiment: "Delay the first deposit.",
};

describe("solo playtest journal", () => {
  it("creates the six-run matrix and safely replaces malformed local data", () => {
    const storage = memoryStorage();
    const journal = createEmptyPlaytestJournal("2026-07-16T12:00:00.000Z");
    expect(journal.matrix).toHaveLength(6);
    expect(journal.matrix.slice(0, 3).every((slot) => slot.replayRequired)).toBe(true);
    expect(journal.matrix.map((slot) => slot.legacyDirectiveId)).toEqual([
      "emergency_appropriation",
      "coalition_whip",
      "protected_channel",
      "public_confidence_reserve",
      "industrial_surge",
      "continuity_freeze_order",
    ]);
    savePlaytestJournal(storage, journal);
    expect(loadPlaytestJournal(storage)).toEqual(journal);

    const legacy = structuredClone(journal) as unknown as {
      matrix: Array<Record<string, unknown>>;
      runs: Array<Record<string, unknown>>;
    };
    legacy.matrix.forEach((slot) => { delete slot.legacyDirectiveId; });
    storage.setItem(PLAYTEST_STORAGE_KEY, JSON.stringify(legacy));
    expect(loadPlaytestJournal(storage).matrix.every((slot) => slot.legacyDirectiveId === null)).toBe(true);

    const invalidDirective = structuredClone(journal) as unknown as {
      matrix: Array<Record<string, unknown>>;
    };
    invalidDirective.matrix[0]!.legacyDirectiveId = "not-a-directive";
    storage.setItem(PLAYTEST_STORAGE_KEY, JSON.stringify(invalidDirective));
    expect(loadPlaytestJournal(storage).matrix.every((slot) => slot.status === "pending")).toBe(true);

    storage.setItem(PLAYTEST_STORAGE_KEY, JSON.stringify({ version: 99 }));
    expect(loadPlaytestJournal(storage, "2026-07-17T12:00:00.000Z").matrix.every((slot) => slot.status === "pending")).toBe(true);
    storage.setItem(PLAYTEST_STORAGE_KEY, "not-json");
    expect(loadPlaytestJournal(storage).runs).toEqual([]);
    clearPlaytestJournal(storage);
    expect(storage.getItem(PLAYTEST_STORAGE_KEY)).toBeNull();
  });

  it("captures accepted commitments and attaches exact state to bookmarks", () => {
    const state = createTechnocratMatrixGame(18, "primary-1");
    let journal = startPrimaryPlaytestRun(createEmptyPlaytestJournal(), "technocrat-natural", state);
    const nextState = commitOne(state);
    journal = recordPlaytestDecision(journal, nextState, "2026-07-16T12:01:00.000Z").journal;
    journal = addPlaytestBookmark(
      journal,
      state.runId,
      "campaign",
      { category: "confusion", severity: "high", note: "The pressure source was unclear." },
      nextState,
      "2026-07-16T12:02:00.000Z",
      "bookmark-1",
    );

    expect(journal.runs[0]?.decisions).toHaveLength(1);
    expect(journal.runs[0]?.legacyDirectiveId).toBe("emergency_appropriation");
    expect(journal.bookmarks[0]).toMatchObject({ id: "bookmark-1", runId: "primary-1", category: "confusion" });
    expect(journal.bookmarks[0]?.snapshot?.turn).toBe(nextState.turn - 1);
    expect(journal.bookmarks[0]?.snapshot?.corporation.progress).toBe(nextState.corporation.progress);
  });

  it("captures the current briefing when bookmarked before the first commitment", () => {
    const state = createTechnocratMatrixGame(19, "primary-briefing");
    let journal = startPrimaryPlaytestRun(createEmptyPlaytestJournal(), "technocrat-natural", state);
    journal = addPlaytestBookmark(
      journal,
      state.runId,
      "campaign",
      { category: "confusion", severity: "medium", note: "The opening file needs context." },
      state,
      "2026-07-16T12:00:30.000Z",
      "bookmark-opening",
    );

    expect(journal.runs[0]?.seed).toBe(state.seed);
    expect(journal.runs[0]?.decisions).toEqual([]);
    expect(journal.bookmarks[0]?.snapshot).toMatchObject({
      decisionId: null,
      category: null,
      summary: null,
      turn: 1,
      activeCardId: state.activeCardId,
      resources: state.resources,
      tracks: state.tracks,
      pressures: state.pressures,
    });

    const storage = memoryStorage();
    savePlaytestJournal(storage, journal);
    expect(loadPlaytestJournal(storage).bookmarks[0]?.snapshot).toEqual(journal.bookmarks[0]?.snapshot);
  });

  it("requires a recap before advancing a natural slot to replay", () => {
    const state = createTechnocratMatrixGame(21, "primary-2");
    let journal = startPrimaryPlaytestRun(createEmptyPlaytestJournal(), "technocrat-natural", state);
    const completed = endedState(commitOne(state));
    journal = completePlaytestRun(recordPlaytestDecision(journal, completed).journal, completed);
    expect(journal.matrix[0]?.status).toBe("awaiting_recap");

    journal = savePlaytestRecap(journal, state.runId, recap, "2026-07-16T13:00:00.000Z");
    expect(journal.matrix[0]?.status).toBe("awaiting_replay");
    expect(journal.runs[0]?.recap?.nextExperiment).toBe("Delay the first deposit.");
  });

  it("stops a replay after five accepted commitments and ignores consultations", () => {
    const primaryState = createTechnocratMatrixGame(33, "primary-3");
    let journal = startPrimaryPlaytestRun(createEmptyPlaytestJournal(), "technocrat-natural", primaryState);
    const completed = endedState(commitOne(primaryState));
    journal = completePlaytestRun(recordPlaytestDecision(journal, completed).journal, completed);
    journal = savePlaytestRecap(journal, primaryState.runId, recap);

    let replayState = createGame({
      seed: 33,
      archetypeId: "technocrat",
      runId: "replay-3",
      experiment: "Try another path.",
      legacyDirectiveId: "emergency_appropriation",
    });
    journal = startReplayPlaytestRun(journal, primaryState.runId, replayState);
    let checkpointReached = false;
    for (let index = 0; index < 4; index += 1) {
      replayState = commitOne(replayState);
      const recorded = recordPlaytestDecision(journal, replayState);
      journal = recorded.journal;
      checkpointReached = recorded.checkpointReached;
    }
    expect(checkpointReached).toBe(false);
    expect(journal.matrix[0]?.replayCommitments).toBe(4);

    replayState.phase = "briefing";
    replayState.consultation = null;
    const consulted = consultAdvisor(replayState, "analyst");
    expect(consulted.accepted).toBe(true);
    const afterConsult = recordPlaytestDecision(journal, consulted.state);
    journal = afterConsult.journal;
    expect(journal.matrix[0]?.replayCommitments).toBe(4);

    replayState = commitOne(consulted.state);
    const recorded = recordPlaytestDecision(journal, replayState);
    expect(recorded.checkpointReached).toBe(true);
    expect(recorded.journal.matrix[0]).toMatchObject({ status: "completed", replayCommitments: 5 });
    expect(recorded.journal.runs.find((run) => run.runId === "replay-3")?.status).toBe("checkpoint_reached");
  });

  it("abandons only the active slot and produces a stable summary/export payload", () => {
    const state = createTechnocratMatrixGame(45, "primary-4");
    let journal = startPrimaryPlaytestRun(createEmptyPlaytestJournal(), "technocrat-natural", state);
    journal = abandonActivePlaytestRun(journal, "2026-07-16T14:00:00.000Z");
    expect(journal.matrix[0]).toMatchObject({ status: "pending", primaryRunId: null });
    expect(journal.runs[0]?.status).toBe("abandoned");
    expect(summarizePlaytestJournal(journal).completedSlots).toBe(0);
    const exported = JSON.parse(serializePlaytestJournal(journal));
    expect(exported.journal.buildId).toBe("guided-internal-v1");
    expect(exported.journal.runs[0].status).toBe("abandoned");
  });
});
