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
    expect(report.seed).toBe(20260715);
    expect(report.corporationResponseCadence).toEqual({
      quiet: 5,
      watched: 4,
      contested: 3,
      severe: 2,
      critical: 1,
    });
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

    expect(report.campaignLength.min).toBeLessThanOrEqual(report.campaignLength.p25);
    expect(report.campaignLength.p25).toBeLessThanOrEqual(report.campaignLength.median);
    expect(report.campaignLength.median).toBeLessThanOrEqual(report.campaignLength.p75);
    expect(report.campaignLength.p75).toBeLessThanOrEqual(report.campaignLength.p90);
    expect(report.campaignLength.p90).toBeLessThanOrEqual(report.campaignLength.p95);
    expect(report.campaignLength.p95).toBeLessThanOrEqual(report.campaignLength.max);
    expect(report.campaignLength.exceeding10Years).toBeLessThanOrEqual(
      report.campaignLength.exceeding5Years,
    );
    expect(report.longestCampaign.monthsSurvived).toBe(report.campaignLength.max);
    expect(report.longestCampaign.months).toHaveLength(report.campaignLength.max);

    const strategyRuns = Object.values(report.outcomeByStrategy)
      .reduce((sum, strategy) => sum + strategy.runs, 0);
    const strategyEndings = Object.values(report.outcomeByStrategy)
      .flatMap((strategy) => Object.values(strategy.endings))
      .reduce((sum, count) => sum + count, 0);
    expect(strategyRuns).toBe(90);
    expect(strategyEndings).toBe(90);

    expect(Object.values(report.activationFailureReasons).reduce((sum, count) => sum + count, 0)).toBe(90);
    const lengthBucketRuns = Object.values(report.outcomesByCampaignLength)
      .reduce((sum, bucket) => sum + bucket.runs, 0);
    const lengthBucketEndings = Object.values(report.outcomesByCampaignLength)
      .flatMap((bucket) => Object.values(bucket.endings))
      .reduce((sum, count) => sum + count, 0);
    expect(lengthBucketRuns).toBe(90);
    expect(lengthBucketEndings).toBe(90);

    const auditedMonths = Object.values(report.monthsByPressureTier)
      .reduce((sum, tier) => sum + tier.months, 0);
    const meteredMonths = Object.values(report.meterGainByPressureTier)
      .reduce((sum, tier) => sum + tier.months, 0);
    expect(auditedMonths / report.runs).toBeCloseTo(report.averageMonths, 2);
    expect(meteredMonths).toBe(auditedMonths);
    for (const source of Object.values(report.panicSources)) {
      expect(source.net).toBe(source.gained - source.reduced);
    }
    for (const tier of Object.values(report.meterGainByPressureTier)) {
      expect(tier.corporationResponseRate).toBeGreaterThanOrEqual(0);
      expect(tier.corporationResponseRate).toBeLessThanOrEqual(100);
      expect(tier.corporationGainPerMonth).toBe(
        tier.months === 0 ? 0 : Number((tier.corporationGain / tier.months).toFixed(4)),
      );
      expect(tier.panicGainPerMonth).toBe(
        tier.months === 0 ? 0 : Number((tier.panicGain / tier.months).toFixed(4)),
      );
    }
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
    const presentationsPerMonth = report.cardTempo.presentedPerRun / report.averageMonths;
    const activeResolutionShare = report.cardTempo.activelyResolvedPerRun /
      report.cardTempo.presentedPerRun;
    expect(presentationsPerMonth).toBeGreaterThanOrEqual(0.5);
    expect(presentationsPerMonth).toBeLessThanOrEqual(0.6);
    expect(activeResolutionShare).toBeGreaterThanOrEqual(0.65);
    expect(activeResolutionShare).toBeLessThanOrEqual(0.82);
    expect(report.finalTurningPointCategories.counter).toBeGreaterThan(0);
    expect(report.endingFunnels.civic_legacy.stages.some((stage) => stage.id === "all_tracks_50")).toBe(true);
    expect(report.endingFunnels.government_by_command.stages.some((stage) => stage.id === "command_authority")).toBe(true);
  }, 10_000);

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

  it("keeps the long-horizon diagnostic out of normal runs and proves five-year reachability", () => {
    const normal = runSimulation({ runs: 30, seed: 20260715 });
    expect(normal.byBot.long_horizon.runs).toBe(0);

    const diagnostic = runSimulation({
      runs: 30,
      seed: 20260715,
      bots: ["long_horizon"],
      archetypes: ["technocrat"],
    });
    expect(diagnostic.byBot.long_horizon.runs).toBe(30);
    expect(diagnostic.campaignLength.exceeding5Years).toBeGreaterThan(0);
    expect(diagnostic.campaignLength.max).toBeGreaterThan(60);
    expect(diagnostic.longestCampaign.months).toHaveLength(diagnostic.campaignLength.max);
  });

  it("rejects an invalid run count", () => {
    expect(() => runSimulation({ runs: 0, seed: 1 })).toThrow(/positive integer/i);
  });
});
