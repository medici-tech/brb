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
    expect(report.averageTurns).toBeGreaterThan(0);
    expect(report.averageTurns).toBeLessThanOrEqual(20);
    expect(report.victories).toBeGreaterThan(0);
    expect(report.actionUsage.deposit).toBeGreaterThan(0);
    expect(report.actionUsage.card).toBeGreaterThan(0);
    expect(report.actionUsage.counter).toBeGreaterThan(0);
    expect(report.actionUsage.recover).toBeGreaterThan(0);
    expect(report.actionUsage.activate).toBeGreaterThan(0);
    expect(Object.values(report.advisorConsultations).reduce((sum, count) => sum + count, 0)).toBeGreaterThan(0);
    expect(Math.max(...Object.values(report.averageFinalLeverage))).toBeGreaterThan(10);
    expect(Object.values(report.cardDrawsByType).reduce((sum, count) => sum + count, 0)).toBeGreaterThan(0);
    expect(Object.values(report.cardDrawsByRarity).reduce((sum, count) => sum + count, 0)).toBeGreaterThan(0);
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
  });

  it("returns the same report for the same seed", () => {
    const options = { runs: 30, seed: 404 };
    expect(runSimulation(options)).toEqual(runSimulation(options));
  });

  it("rejects an invalid run count", () => {
    expect(() => runSimulation({ runs: 0, seed: 1 })).toThrow(/positive integer/i);
  });
});
