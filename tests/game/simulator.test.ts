import { describe, expect, it } from "vitest";
import { runSimulation } from "../../src/game/index.js";

describe("headless simulator", () => {
  it("completes seeded runs and reports every run exactly once", () => {
    const report = runSimulation({ runs: 90, seed: 20260715 });
    const endingTotal = Object.values(report.endings).reduce((sum, count) => sum + count, 0);
    const botTotal = Object.values(report.byBot).reduce((sum, item) => sum + item.runs, 0);
    const archetypeTotal = Object.values(report.byArchetype).reduce(
      (sum, item) => sum + item.runs,
      0,
    );

    expect(endingTotal).toBe(90);
    expect(botTotal).toBe(90);
    expect(archetypeTotal).toBe(90);
    expect(report.averageMonths).toBeGreaterThan(0);
    expect(report.averageMonths).toBeLessThan(1_200);
    expect(report.actionUsage.deposit).toBeGreaterThan(0);
    expect(report.actionUsage.card).toBeGreaterThan(0);
    expect(report.actionUsage.counter).toBeGreaterThan(0);
    expect(report.actionUsage.recover).toBeGreaterThan(0);
    expect(Object.values(report.advisorConsultations).reduce((sum, count) => sum + count, 0)).toBeGreaterThan(0);
    expect(Math.max(...Object.values(report.averageFinalLeverage))).toBeGreaterThan(10);
    expect(Object.values(report.cardDrawsByType).reduce((sum, count) => sum + count, 0)).toBeGreaterThan(0);
    expect(Object.values(report.cardDrawsByRarity).reduce((sum, count) => sum + count, 0)).toBeGreaterThan(0);
    expect(report.cardEncounterStatuses.presented).toBe(
      Object.values(report.cardDrawsByType).reduce((sum, count) => sum + count, 0),
    );
    const classifiedCards = Object.entries(report.cardEncounterStatuses)
      .filter(([status]) => status !== "presented")
      .reduce((sum, [, count]) => sum + count, 0);
    expect(classifiedCards).toBe(report.cardEncounterStatuses.presented);
    expect(Object.values(report.pivotalDecisionCategories).reduce((sum, count) => sum + count, 0)).toBe(90);
    expect(report.chainsStarted.labor_coalition).toBeGreaterThanOrEqual(
      report.chainsCompleted.labor_coalition,
    );
    expect(report.chainsStarted.corporate_exposure).toBeGreaterThanOrEqual(
      report.chainsCompleted.corporate_exposure,
    );
    expect(report.routesTouched.labor_coalition).toBeGreaterThanOrEqual(
      report.routesOpened.labor_coalition,
    );
    expect(report.routesTouched.corporate_exposure).toBeGreaterThanOrEqual(
      report.routesOpened.corporate_exposure,
    );
    expect(report.invalidCompletions).toEqual({
      labor_coalition: 0,
      corporate_exposure: 0,
    });
    expect(report.normalCompletions.labor_coalition + report.reconciledCompletions.labor_coalition).toBe(
      report.chainsCompleted.labor_coalition,
    );
    for (const routeId of ["labor_coalition", "corporate_exposure"] as const) {
      expect(
        report.chainsCompleted[routeId] +
        report.closedPermanently[routeId] +
        report.openUnfinished[routeId],
      ).toBe(report.routesTouched[routeId]);
    }
    expect(report.endingFunnels.civic_legacy.candidates).toBe(90);
    expect(report.endingFunnels.government_by_command.candidates).toBe(report.byArchetype.operator.runs);
    expect(Object.values(report.strategicPivotCategories).reduce((sum, count) => sum + count, 0)).toBe(90);
    expect(report.outcomeSummary.premiumEndings).toBeLessThanOrEqual(report.victories);
    expect(report.cardTempo.presentedPerRun).toBeGreaterThan(0);
    for (const funnel of Object.values(report.endingFunnels)) {
      for (let index = 1; index < funnel.stages.length; index += 1) {
        expect(funnel.stages[index]?.entered).toBe(funnel.stages[index - 1]?.passed);
      }
      for (const stage of funnel.stages) {
        expect(stage.passed + stage.dropped).toBe(stage.entered);
      }
    }
    expect(report.endingFunnels.civic_legacy.closestAttempt?.botId).toBe("institutionalist");
    expect(report.endingFunnels.civic_legacy.closestAttempt?.months.length).toBeGreaterThan(0);
  });

  it("returns the same report for the same seed", () => {
    const options = { runs: 30, seed: 404 };
    expect(runSimulation(options)).toEqual(runSimulation(options));
  });

  it("exercises neglected systems and preserves Corporate Exposure choice tension", () => {
    const report = runSimulation({ runs: 600, seed: 20260715 });
    expect(report.actionUsage.faction).toBeGreaterThan(0);
    expect(report.actionUsage.advisor).toBeGreaterThan(0);
    expect(report.actionUsage.institutions).toBeGreaterThan(0);

    const corporateChoices = report.cardChoiceSelections.silent_partner ?? {};
    const seize = corporateChoices.seize ?? 0;
    const deal = corporateChoices.deal ?? 0;
    expect(seize).toBeGreaterThan(0);
    expect(deal).toBeGreaterThan(0);
    expect(deal / (seize + deal)).toBeGreaterThan(0.1);

    expect(report.strategicPivotCategories.deposit).toBeGreaterThan(0);
    expect(report.strategicPivotCategories.card).toBeGreaterThan(0);
    const strategicDepositShare = report.strategicPivotCategories.deposit / 600;
    expect(strategicDepositShare).toBeGreaterThanOrEqual(0.3);
    expect(strategicDepositShare).toBeLessThanOrEqual(0.75);
    expect(report.cardTempo.presentedPerRun).toBeGreaterThanOrEqual(8);
    expect(report.cardTempo.presentedPerRun).toBeLessThanOrEqual(11);
    expect(report.cardTempo.activelyResolvedPerRun).toBeGreaterThanOrEqual(6);
    expect(report.cardTempo.activelyResolvedPerRun).toBeLessThanOrEqual(8);
    expect(report.finalTurningPointCategories.counter).toBeGreaterThan(0);
    expect(report.endingFunnels.civic_legacy.stages.some((stage) => stage.id === "all_tracks_50")).toBe(true);
    expect(report.endingFunnels.government_by_command.stages.some((stage) => stage.id === "command_authority")).toBe(true);
  });

  it("reports the command funnel deterministically", () => {
    const report = runSimulation({
      runs: 300,
      seed: 20260715,
      bots: ["command"],
      archetypes: ["operator"],
    });
    expect(report.endingFunnels.government_by_command.completions).toBe(
      report.endingVariations.government_by_command,
    );
  });

  it("rejects an invalid run count", () => {
    expect(() => runSimulation({ runs: 0, seed: 1 })).toThrow(/positive integer/i);
  });
});
