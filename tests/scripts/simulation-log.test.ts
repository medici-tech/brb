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
    expect(entry).toContain("`abc1234` (clean)");
    expect(entry).toContain("| Activations | 90 (9%) |");
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
