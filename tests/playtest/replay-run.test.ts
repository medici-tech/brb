import { describe, expect, it } from "vitest";
import { commitAction, consultAdvisor, createGame } from "../../src/game/index.js";
import type { GameState } from "../../src/game/types.js";
import {
  completePlaytestRun,
  createEmptyPlaytestJournal,
  recordPlaytestStep,
  startPlaytestRun,
} from "../../src/playtest/journal.js";
import { formatReplayResult, replayPlaytestRun } from "../../src/playtest/replay-run.js";
import type { PlaytestRunEntry } from "../../src/playtest/types.js";
import { parseReplayCli } from "../../scripts/replay.js";

const SETUP = {
  seed: 20260715,
  archetypeId: "technocrat" as const,
  runId: "run-replay",
  legacyDirectiveId: "emergency_appropriation" as const,
};

/**
 * Builds a run by actually driving the engine, so the step log under test is
 * the one the app would have written rather than a fixture that agrees with the
 * replayer by construction.
 */
function recordedRun(): PlaytestRunEntry {
  let state: GameState = createGame(SETUP);
  let journal = startPlaytestRun(createEmptyPlaytestJournal(), state);

  const consulted = consultAdvisor(state, "analyst");
  expect(consulted.accepted).toBe(true);
  state = consulted.state;
  journal = recordPlaytestStep(journal, { kind: "consult", advisorId: "analyst", useArchetypeAbility: false }, state);

  for (const resource of ["money", "influence", "trust", "capacity"] as const) {
    const options = state.activeCardId !== null ? { confirmCardAbandonment: true as const } : {};
    const result = commitAction(state, { type: "recover_resource", resource }, options);
    expect(result.accepted).toBe(true);
    state = result.state;
    journal = recordPlaytestStep(journal, { kind: "commit", action: { type: "recover_resource", resource }, options }, state);
  }

  return journal.runs[0]!;
}

describe("replaying a recorded run", () => {
  it("reproduces a run the app actually recorded", () => {
    const run = recordedRun();
    const result = replayPlaytestRun(run);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.steps).toBe(run.steps.length);
    expect(result.warnings).toEqual([]);
    expect(formatReplayResult(run, result)).toMatch(/^REPRODUCED/);
  });

  it("names the diverged field and the last step that still agreed", () => {
    const run = structuredClone(recordedRun());
    run.steps[2]!.after.rngState += 1;

    const result = replayPlaytestRun(run);
    expect(result.ok).toBe(false);
    if (result.ok || result.reason !== "diverged") throw new Error("expected a divergence");

    expect(result.index).toBe(3);
    expect(result.field).toBe("rngState");
    expect(result.lastAgreeingStep?.index).toBe(2);

    const report = formatReplayResult(run, result);
    expect(report).toMatch(/DIVERGENCE at step 3 of/);
    expect(report).toMatch(/first mismatched field: rngState/);
    expect(report).toMatch(/last agreeing step: 2/);
    // The report has to separate an engine change from a lossy recorder.
    expect(report).toMatch(/unrecorded consultation advances the RNG/);
  });

  it("reports a rejection differently from a divergence", () => {
    const run = structuredClone(recordedRun());
    run.steps[1]!.step = { kind: "commit", action: { type: "activate_brb" }, options: {} };

    const result = replayPlaytestRun(run);
    expect(result.ok).toBe(false);
    if (result.ok || result.reason !== "rejected") throw new Error("expected a rejection");

    expect(result.index).toBe(2);
    const report = formatReplayResult(run, result);
    expect(report).toMatch(/^REJECTED at step 2 of/);
    expect(report).toMatch(/not a determinism failure/);
  });

  it("refuses a run whose log cannot reproduce it", () => {
    const run = { ...recordedRun(), replayComplete: false };
    const result = replayPlaytestRun(run);

    expect(result.ok).toBe(false);
    if (result.ok || result.reason !== "incomplete") throw new Error("expected an incomplete run");
    expect(formatReplayResult(run, result)).toMatch(/^INCOMPLETE/);
  });

  it("warns without failing when only the positional decision ID shifts", () => {
    const run = structuredClone(recordedRun());
    run.steps[3]!.after.latestDecisionId = "D9-99";

    const result = replayPlaytestRun(run);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatchObject({ index: 4, field: "latestDecisionId" });
    expect(formatReplayResult(run, result)).toMatch(/labelling shift, not a reproduction failure/);
  });

  it("replays a run that was carried through completion", () => {
    const state = createGame(SETUP);
    const journal = completePlaytestRun(startPlaytestRun(createEmptyPlaytestJournal(), state), state);
    expect(replayPlaytestRun(journal.runs[0]!).ok).toBe(true);
  });
});

describe("replay CLI arguments", () => {
  it("accepts both flag spellings and a leading path", () => {
    expect(parseReplayCli(["journal.json", "--run", "abc"])).toMatchObject({ path: "journal.json", runId: "abc" });
    expect(parseReplayCli(["journal.json", "--run=abc"])).toMatchObject({ path: "journal.json", runId: "abc" });
    expect(parseReplayCli(["--run", "abc", "journal.json"])).toMatchObject({ path: "journal.json", runId: "abc" });
  });

  it("reads the optional integer and boolean flags", () => {
    const options = parseReplayCli(["j.json", "--through", "12", "--at-turn=4", "--state", "--list"]);
    expect(options).toMatchObject({ through: 12, atTurn: 4, state: true, list: true });
  });

  it("refuses a missing path, a missing flag value, and a non-positive integer", () => {
    expect(() => parseReplayCli([])).toThrow(/path to an exported playtest journal/);
    expect(() => parseReplayCli(["j.json", "--run"])).toThrow(/--run requires a value/);
    expect(() => parseReplayCli(["j.json", "--through", "0"])).toThrow(/positive integer/);
  });
});
