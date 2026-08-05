import { describe, expect, it } from "vitest";
import { ENDING_IDS, LEGACY_DIRECTIVE_IDS } from "../../src/game/types.js";
import { summarizePlaytestCoverage } from "../../src/playtest/coverage.js";
import { createEmptyPlaytestJournal } from "../../src/playtest/journal.js";
import type { PlaytestJournalV2, PlaytestRunEntry } from "../../src/playtest/types.js";

function run(overrides: Partial<PlaytestRunEntry> & { runId: string }): PlaytestRunEntry {
  return {
    kind: "primary",
    seed: 1,
    archetypeId: "technocrat",
    legacyDirectiveId: null,
    experiment: null,
    startedAt: "2026-08-05T00:00:00.000Z",
    completedAt: null,
    status: "active",
    endingId: null,
    months: null,
    steps: [],
    cardsSeen: [],
    finalSnapshot: null,
    replayComplete: true,
    ...overrides,
  };
}

function journalOf(runs: PlaytestRunEntry[], markers: PlaytestJournalV2["markers"] = []): PlaytestJournalV2 {
  return { ...createEmptyPlaytestJournal(), runs, markers };
}

describe("free-play coverage", () => {
  it("reports nothing covered for an empty journal without dividing by zero", () => {
    const coverage = summarizePlaytestCoverage(createEmptyPlaytestJournal());

    expect(coverage.runs).toEqual({ total: 0, completed: 0, abandoned: 0, active: 0 });
    expect(coverage.archetypes.covered).toBe(0);
    expect(coverage.archetypes.total).toBe(3);
    expect(coverage.archetypes.missing).toEqual(["technocrat", "populist", "operator"]);
    expect(coverage.months).toEqual({ shortest: null, longest: null, median: null, histogram: expect.any(Array) });
  });

  it("counts an abandoned run toward archetype and Directive coverage", () => {
    const coverage = summarizePlaytestCoverage(journalOf([
      run({ runId: "a", archetypeId: "operator", legacyDirectiveId: "coalition_whip", status: "abandoned" }),
    ]));

    expect(coverage.runs).toMatchObject({ total: 1, abandoned: 1, completed: 0 });
    expect(coverage.archetypes.counts.operator).toBe(1);
    expect(coverage.directives.counts.coalition_whip).toBe(1);
    // An unfinished campaign has no ending to report.
    expect(coverage.endings.covered).toBe(0);
  });

  it("treats playing without a Directive as its own coverable choice", () => {
    const coverage = summarizePlaytestCoverage(journalOf([run({ runId: "a", legacyDirectiveId: null })]));

    expect(coverage.directives.total).toBe(LEGACY_DIRECTIVE_IDS.length + 1);
    expect(coverage.directives.counts.none).toBe(1);
    expect(coverage.directives.missing).not.toContain("none");
  });

  it("summarizes endings and campaign length from completed runs only", () => {
    const coverage = summarizePlaytestCoverage(journalOf([
      run({ runId: "a", status: "completed", endingId: "state_collapse", months: 8 }),
      run({ runId: "b", status: "completed", endingId: "state_collapse", months: 20 }),
      run({ runId: "c", status: "completed", endingId: "civic_legacy", months: 14 }),
      run({ runId: "d", status: "active", months: 99 }),
    ]));

    expect(coverage.endings.counts.state_collapse).toBe(2);
    expect(coverage.endings.total).toBe(ENDING_IDS.length);
    expect(coverage.months).toMatchObject({ shortest: 8, longest: 20, median: 14 });
    expect(coverage.months.histogram.find((bucket) => bucket.label === "7-12")?.runs).toBe(1);
    expect(coverage.months.histogram.find((bucket) => bucket.label === "19-24")?.runs).toBe(1);
  });

  it("counts a card once per run that drew it, across every run", () => {
    const coverage = summarizePlaytestCoverage(journalOf([
      run({ runId: "a", cardsSeen: ["budget_shortfall", "whistleblower"] }),
      run({ runId: "b", cardsSeen: ["budget_shortfall"] }),
    ]));

    expect(coverage.cards.counts.budget_shortfall).toBe(2);
    expect(coverage.cards.counts.whistleblower).toBe(1);
    expect(coverage.cards.covered).toBe(2);
    expect(coverage.cards.total).toBe(15);
    expect(coverage.cards.missing).toHaveLength(13);
  });

  it("splits markers by where they were dropped and tracks replay completeness", () => {
    const coverage = summarizePlaytestCoverage(journalOf(
      [run({ runId: "a" }), run({ runId: "b", replayComplete: false })],
      [
        { id: "m1", runId: "a", location: "campaign", note: "one", createdAt: "x", snapshot: null },
        { id: "m2", runId: "a", location: "report", note: "two", createdAt: "x", snapshot: null },
        { id: "m3", runId: "b", location: "campaign", note: "three", createdAt: "x", snapshot: null },
      ],
    ));

    expect(coverage.markers).toEqual({ total: 3, campaign: 2, report: 1 });
    expect(coverage.replayComplete).toEqual({ complete: 1, total: 2 });
  });
});
