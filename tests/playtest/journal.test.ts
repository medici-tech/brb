import { describe, expect, it } from "vitest";
import { commitAction, consultAdvisor, createGame } from "../../src/game/index.js";
import type { GameState } from "../../src/game/types.js";
import {
  PLAYTEST_STORAGE_KEY,
  RETAINED_STEP_LOG_RUNS,
  abandonActivePlaytestRun,
  addPlaytestMarker,
  adoptUntrackedRun,
  clearPlaytestJournal,
  completePlaytestRun,
  createEmptyPlaytestJournal,
  loadPlaytestJournal,
  normalizePlaytestCommitOptions,
  recordPlaytestStep,
  savePlaytestJournal,
  serializePlaytestJournal,
  startPlaytestRun,
} from "../../src/playtest/journal.js";
import { deserializePlaytestJournal } from "../../src/playtest/journal-validation.js";
import type { PlaytestJournalV2 } from "../../src/playtest/types.js";

const LEGACY_STORAGE_KEY = "brb.playtest-journal.v1";

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

function newGame(runId: string, seed = 20260715): GameState {
  return createGame({ seed, archetypeId: "technocrat", runId, legacyDirectiveId: "emergency_appropriation" });
}

function commitOne(state: GameState): GameState {
  const prepared = structuredClone(state);
  prepared.activeCardId = null;
  const result = commitAction(prepared, { type: "recover_resource", resource: "money" });
  expect(result.accepted).toBe(true);
  return result.state;
}

function endedState(state: GameState): GameState {
  const ended = structuredClone(state);
  ended.phase = "ended";
  ended.turn = 14;
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

describe("free-play journal storage", () => {
  it("starts empty and round-trips through local storage", () => {
    const storage = memoryStorage();
    const journal = createEmptyPlaytestJournal();

    expect(journal.version).toBe(2);
    expect(journal.runs).toEqual([]);
    expect(journal.markers).toEqual([]);

    expect(savePlaytestJournal(storage, journal)).toBe(true);
    expect(loadPlaytestJournal(storage)).toEqual(journal);

    clearPlaytestJournal(storage);
    expect(storage.getItem(PLAYTEST_STORAGE_KEY)).toBeNull();
  });

  it("discards a journal from an earlier build and removes its dead blob", () => {
    const storage = memoryStorage();
    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({ version: 1, buildId: "guided-internal-v1" }));
    storage.setItem(PLAYTEST_STORAGE_KEY, JSON.stringify({ version: 1, buildId: "guided-internal-v1" }));

    const loaded = loadPlaytestJournal(storage);
    expect(loaded.version).toBe(2);
    expect(loaded.runs).toEqual([]);

    savePlaytestJournal(storage, loaded);
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it("degrades to an empty journal rather than throwing at the storage boundary", () => {
    const storage = memoryStorage();

    storage.setItem(PLAYTEST_STORAGE_KEY, "not-json");
    expect(loadPlaytestJournal(storage).runs).toEqual([]);

    storage.setItem(PLAYTEST_STORAGE_KEY, JSON.stringify({ version: 99 }));
    expect(loadPlaytestJournal(storage).runs).toEqual([]);
  });

  it("reports a failed write instead of throwing, so the campaign save still lands", () => {
    const storage = memoryStorage();
    storage.setItem = () => { throw new Error("QuotaExceededError"); };
    expect(savePlaytestJournal(storage, createEmptyPlaytestJournal())).toBe(false);
  });
});

describe("free-play journal validation", () => {
  function journalWithOneStep(): PlaytestJournalV2 {
    const state = newGame("run-validate");
    const committed = commitOne(state);
    return recordPlaytestStep(
      startPlaytestRun(createEmptyPlaytestJournal(), state),
      { kind: "commit", action: { type: "recover_resource", resource: "money" }, options: {} },
      committed,
    );
  }

  it("accepts both a bare journal and an exported envelope", () => {
    const journal = journalWithOneStep();
    expect(deserializePlaytestJournal(serializePlaytestJournal(journal))).toEqual(journal);
    expect(deserializePlaytestJournal(JSON.stringify(journal))).toEqual(journal);
  });

  it("throws on a journal written by an earlier build", () => {
    expect(() => deserializePlaytestJournal(JSON.stringify({ version: 1, buildId: "guided-internal-v1" })))
      .toThrow(/unsupported version 1/);
  });

  it("fails closed on a step log that names content the engine does not have", () => {
    const journal = journalWithOneStep();
    const broken = structuredClone(journal);
    broken.runs[0]!.steps[0]!.step = {
      kind: "commit",
      action: { type: "recover_resource", resource: "prestige" },
      options: {},
    } as never;

    expect(() => deserializePlaytestJournal(JSON.stringify(broken))).toThrow(/unknown resource/);
  });

  it("rejects a non-canonical commit option rather than replaying it", () => {
    const journal = journalWithOneStep();
    const broken = structuredClone(journal);
    broken.runs[0]!.steps[0]!.step = {
      kind: "commit",
      action: { type: "recover_resource", resource: "money" },
      options: { useLegacyDirective: false },
    } as never;

    expect(() => deserializePlaytestJournal(JSON.stringify(broken))).toThrow(/non-canonical commit option/);
  });

  it("rejects a doctrine-incompatible Directive loadout", () => {
    const state = createGame({
      seed: 4243,
      archetypeId: "operator",
      runId: "run-doctrine-lock",
      legacyDirectiveId: "containment_brief",
    });
    const journal = startPlaytestRun(createEmptyPlaytestJournal(), state);
    const broken = structuredClone(journal);
    broken.runs[0]!.archetypeId = "technocrat";

    expect(() => deserializePlaytestJournal(JSON.stringify(broken)))
      .toThrow(/Containment Brief requires the Operator doctrine/);
  });

  it("rejects a marker pointing at a run the journal does not hold", () => {
    const journal = journalWithOneStep();
    const broken = structuredClone(journal);
    broken.markers.push({
      id: "marker-1",
      runId: "run-that-does-not-exist",
      location: "campaign",
      note: "orphan",
      createdAt: new Date().toISOString(),
      snapshot: null,
    });

    expect(() => deserializePlaytestJournal(JSON.stringify(broken))).toThrow(/does not hold/);
  });
});

describe("recording a free-play run", () => {
  it("records the run the player actually chose, with no assigned loadout", () => {
    const state = createGame({ seed: 4242, archetypeId: "populist", runId: "run-a", legacyDirectiveId: null });
    const journal = startPlaytestRun(createEmptyPlaytestJournal(), state);

    expect(journal.runs).toHaveLength(1);
    expect(journal.runs[0]).toMatchObject({
      runId: "run-a",
      kind: "primary",
      seed: 4242,
      archetypeId: "populist",
      legacyDirectiveId: null,
      status: "active",
      replayComplete: true,
    });
  });

  it("does not start a second entry for a run it already holds", () => {
    const state = newGame("run-a");
    const once = startPlaytestRun(createEmptyPlaytestJournal(), state);
    expect(startPlaytestRun(once, state).runs).toHaveLength(1);
  });

  it("appends each accepted input with the state it produced", () => {
    const state = newGame("run-a");
    const consulted = consultAdvisor(state, "analyst");
    expect(consulted.accepted).toBe(true);
    const committed = commitOne(consulted.state);

    let journal = startPlaytestRun(createEmptyPlaytestJournal(), state);
    journal = recordPlaytestStep(journal, { kind: "consult", advisorId: "analyst", useArchetypeAbility: false }, consulted.state);
    journal = recordPlaytestStep(journal, { kind: "commit", action: { type: "recover_resource", resource: "money" }, options: {} }, committed);

    const steps = journal.runs[0]!.steps;
    expect(steps.map((entry) => entry.index)).toEqual([1, 2]);
    expect(steps[0]!.step).toEqual({ kind: "consult", advisorId: "analyst", useArchetypeAbility: false });
    expect(steps[0]!.after.rngState).toBe(consulted.state.rngState);
    expect(steps[1]!.after.turn).toBe(committed.turn);
    expect(steps[1]!.after.decisionCount).toBe(committed.decisionHistory.length);
  });

  it("tracks every card the deck drew, including ones never committed against", () => {
    const state = newGame("run-a");
    const journal = startPlaytestRun(createEmptyPlaytestJournal(), state);
    expect(journal.runs[0]!.cardsSeen).toEqual(Object.keys(state.deck.drawCounts).sort());
  });

  it("drops falsey commit options instead of storing them", () => {
    expect(normalizePlaytestCommitOptions({ confirmCardAbandonment: false, useLegacyDirective: true }))
      .toEqual({ useLegacyDirective: true });
    expect(normalizePlaytestCommitOptions()).toEqual({});
  });

  it("ignores a step for a run that is no longer active", () => {
    const state = newGame("run-a");
    const completed = completePlaytestRun(startPlaytestRun(createEmptyPlaytestJournal(), state), endedState(state));
    const after = recordPlaytestStep(completed, { kind: "consult", advisorId: "analyst", useArchetypeAbility: false }, state);
    expect(after.runs[0]!.steps).toHaveLength(0);
  });
});

describe("the recorder's contract", () => {
  /**
   * The whole feature rests on this: whatever `recordPlaytestStep` stored has
   * to fold back into the same campaign. `tests/game/replay-fold.test.ts` proves
   * the engine is deterministic; this proves the journal captures enough of it.
   */
  it("stores a step log that folds back into the same state", () => {
    const setup = { seed: 90210, archetypeId: "operator" as const, runId: "run-fold", legacyDirectiveId: null };
    let state = createGame(setup);
    let journal = startPlaytestRun(createEmptyPlaytestJournal(), state);

    const consulted = consultAdvisor(state, "fixer");
    expect(consulted.accepted).toBe(true);
    state = consulted.state;
    journal = recordPlaytestStep(journal, { kind: "consult", advisorId: "fixer", useArchetypeAbility: false }, state);

    for (const resource of ["money", "influence", "trust"] as const) {
      const options = state.activeCardId !== null ? { confirmCardAbandonment: true as const } : {};
      const result = commitAction(state, { type: "recover_resource", resource }, options);
      expect(result.accepted).toBe(true);
      state = result.state;
      journal = recordPlaytestStep(journal, { kind: "commit", action: { type: "recover_resource", resource }, options }, state);
    }

    let replayed = createGame(setup);
    for (const record of journal.runs[0]!.steps) {
      const result = record.step.kind === "consult"
        ? consultAdvisor(replayed, record.step.advisorId, record.step.useArchetypeAbility)
        : commitAction(replayed, record.step.action, record.step.options);
      expect(result.accepted).toBe(true);
      replayed = result.state;
      expect(replayed.rngState).toBe(record.after.rngState);
      expect(replayed.turn).toBe(record.after.turn);
    }

    expect(replayed).toEqual(state);
  });
});

describe("finishing and abandoning runs", () => {
  it("records the ending, campaign length, and a final snapshot", () => {
    const state = newGame("run-a");
    const journal = completePlaytestRun(startPlaytestRun(createEmptyPlaytestJournal(), state), endedState(state));
    const run = journal.runs[0]!;

    expect(run.status).toBe("completed");
    expect(run.endingId).toBe("state_collapse");
    expect(run.months).toBe(14);
    expect(run.finalSnapshot?.endingId).toBe("state_collapse");
  });

  it("keeps an abandoned run in the record rather than erasing it", () => {
    const state = newGame("run-a");
    const journal = abandonActivePlaytestRun(startPlaytestRun(createEmptyPlaytestJournal(), state));

    expect(journal.runs[0]!.status).toBe("abandoned");
    expect(journal.runs[0]!.completedAt).not.toBeNull();
  });

  it("adopts a campaign that survived a journal reset, marked unreproducible", () => {
    const state = newGame("run-orphan");
    const journal = adoptUntrackedRun(createEmptyPlaytestJournal(), state);

    expect(journal.runs[0]!.replayComplete).toBe(false);
    expect(journal.runs[0]!.steps).toEqual([]);
  });

  it("degrades old step logs so an unbounded number of sessions cannot fill storage", () => {
    let journal = createEmptyPlaytestJournal();

    for (let index = 0; index < RETAINED_STEP_LOG_RUNS + 3; index += 1) {
      const state = newGame(`run-${index}`, 20260715 + index);
      journal = startPlaytestRun(journal, state);
      journal = recordPlaytestStep(
        journal,
        { kind: "commit", action: { type: "recover_resource", resource: "money" }, options: {} },
        commitOne(state),
      );
      const ended = endedState(state);
      // Completion times order the retention window.
      journal = completePlaytestRun(journal, ended, new Date(Date.UTC(2026, 7, 1, 0, index)).toISOString());
    }

    const withSteps = journal.runs.filter((run) => run.steps.length > 0);
    expect(withSteps).toHaveLength(RETAINED_STEP_LOG_RUNS);
    expect(journal.runs.filter((run) => !run.replayComplete)).toHaveLength(3);
    // Nothing is deleted — the summary and coverage of every run survive.
    expect(journal.runs).toHaveLength(RETAINED_STEP_LOG_RUNS + 3);
  });
});

describe("markers", () => {
  function activeJournal(): { journal: PlaytestJournalV2; state: GameState } {
    const state = newGame("run-a");
    return { journal: startPlaytestRun(createEmptyPlaytestJournal(), state), state };
  }

  it("captures the board the note was written against", () => {
    const { journal, state } = activeJournal();
    const next = addPlaytestMarker(journal, "run-a", "campaign", "  Panic spiked and I could not tell why  ", state);
    const marker = next.markers[0]!;

    expect(marker.note).toBe("Panic spiked and I could not tell why");
    expect(marker.location).toBe("campaign");
    expect(marker.snapshot?.turn).toBe(state.turn);
    expect(marker.snapshot?.resources).toEqual(state.resources);
  });

  it("works before the first commitment, when there is no decision yet", () => {
    const { journal, state } = activeJournal();
    const marker = addPlaytestMarker(journal, "run-a", "campaign", "Opening screen is unclear", state).markers[0]!;

    expect(marker.snapshot).not.toBeNull();
    expect(marker.snapshot?.decisionId).toBeNull();
    expect(marker.snapshot?.category).toBeNull();
  });

  it("falls back to the final snapshot when marking a finished report", () => {
    const { journal, state } = activeJournal();
    const completed = completePlaytestRun(journal, endedState(state));
    const marker = addPlaytestMarker(completed, "run-a", "report", "The grade surprised me").markers[0]!;

    expect(marker.location).toBe("report");
    expect(marker.snapshot?.endingId).toBe("state_collapse");
  });

  it("refuses an empty note and an unknown run", () => {
    const { journal, state } = activeJournal();
    expect(() => addPlaytestMarker(journal, "run-a", "campaign", "   ", state)).toThrow(/needs a note/);
    expect(() => addPlaytestMarker(journal, "run-missing", "campaign", "note", state)).toThrow(/not found/);
  });
});
