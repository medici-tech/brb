import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  appendSimulationLog,
  formatSimulationLogEntry,
  SIMULATION_LOG_PATH,
} from "../../scripts/simulation-log.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

function reportFixture() {
  return {
    runs: 1000,
    seed: 20260715,
    legacyDirectiveId: null,
    endings: {
      civic_legacy: 4,
      compromised_activation: 86,
      corporate_capture: 450,
      state_collapse: 460,
    },
    averageMonths: 24.39,
    outcomeSummary: {
      activations: 90,
      activationRate: 9,
      civicLegacyRate: 0.4,
      compromisedActivationRate: 8.6,
      collapseRate: 46,
      corporateCaptureRate: 45,
      premiumEndings: 50,
      premiumEndingRate: 5,
    },
    cardTempo: {
      presentedPerRun: 13.37,
      activelyResolvedPerRun: 9.85,
      ignoredPerRun: 3.52,
    },
    campaignLength: {
      min: 12,
      p25: 21,
      median: 24,
      p75: 27,
      p90: 30,
      p95: 33,
      max: 58,
      exceeding5Years: 0,
      exceeding10Years: 0,
    },
    activationFailureReasons: {
      activated: 90,
      activation_corporate_capture: 10,
      tracks_never_ready: 700,
      panic_before_activation: 40,
      institutions_before_activation: 30,
      advisors_before_activation: 20,
      corporation_capture_before_activation: 50,
      corporation_unsafe_before_activation: 40,
      strategy_delayed_after_readiness: 20,
    },
    outcomeByStrategy: {
      balanced: {
        runs: 100,
        endings: {
          civic_legacy: 1,
          compromised_activation: 9,
          corporate_capture: 45,
          state_collapse: 45,
        },
      },
    },
  };
}

describe("simulation run log", () => {
  it("formats reproducible run details and notes", () => {
    const entry = formatSimulationLogEntry(reportFixture(), {
      timestamp: new Date("2026-07-16T15:30:00.000Z"),
      label: "Corporation cadence audit",
      notes: "Changed only the response interval.\nActivation improved without longer campaigns.",
      gitCommit: "abc1234",
      workingTreeDirty: false,
    });

    expect(entry).toContain("2026-07-16T15:30:00.000Z — Corporation cadence audit");
    expect(entry).toContain("Runs: **1,000**");
    expect(entry).toContain("`20260715`");
    expect(entry).toContain("Legacy Directive: `none`");
    expect(entry).toContain("`abc1234` (clean)");
    expect(entry).toContain("| Activations | 90 (9%) |");
    expect(entry).toContain("| — Civic Legacy | 4 (0.4%) |");
    expect(entry).toContain("| — Compromised activation | 86 (8.6%) |");
    expect(entry).toContain("| All tracks ready | 300 |");
    expect(entry).toContain("| Activation attempts | 100 |");
    expect(entry).toContain("| tracks_never_ready | 700 |");
    expect(entry).toContain("| balanced | 100 | 10 |");
    expect(entry).toContain("> Changed only the response interval.");
    expect(entry).toContain("> Activation improved without longer campaigns.");
  });

  it("creates the log and appends each completed simulation", async () => {
    const projectRoot = await mkdtemp(path.join(tmpdir(), "brb-simulation-log-"));
    temporaryDirectories.push(projectRoot);

    await appendSimulationLog(projectRoot, reportFixture(), {
      timestamp: new Date("2026-07-16T15:30:00.000Z"),
      notes: "First run.",
    });
    await appendSimulationLog(projectRoot, reportFixture(), {
      timestamp: new Date("2026-07-16T16:30:00.000Z"),
      notes: "Second run.",
    });

    const log = await readFile(path.join(projectRoot, SIMULATION_LOG_PATH), "utf8");
    expect(log.match(/^# BRB Simulation Run Log$/gm)).toHaveLength(1);
    expect(log.match(/^## 2026-07-16T/gm)).toHaveLength(2);
    expect(log).toContain("> First run.");
    expect(log).toContain("> Second run.");
  });
});
