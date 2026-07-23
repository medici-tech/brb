import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ActivationFailureReason, EndingId } from "../src/game/types.js";
import type { BotId, SimulationReport } from "../src/game/simulation-types.js";

export const SIMULATION_LOG_PATH = "docs/BRB_SIMULATION_LOG.md";
export const DEFAULT_SIMULATION_NOTES = "No additional notes were supplied for this run.";

type SimulationLogReport = Pick<
  SimulationReport,
  | "runs"
  | "seed"
  | "endings"
  | "averageMonths"
  | "outcomeSummary"
  | "cardTempo"
  | "campaignLength"
> & {
  activationFailureReasons: Record<ActivationFailureReason, number>;
  outcomeByStrategy: Partial<Record<BotId, {
    runs: number;
    endings: Record<EndingId, number>;
  }>>;
};

export type SimulationLogMetadata = {
  timestamp: Date;
  notes: string;
  label?: string;
  gitCommit?: string;
  workingTreeDirty?: boolean;
};

const LOG_HEADER = `# BRB Simulation Run Log

Every successful \`npm run simulate\` invocation appends a summary here. Add run-specific context with \`--notes\`; the log stays in Git so balance decisions have a durable history.

`;

function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function asBlockquote(value: string): string {
  return value
    .trim()
    .split(/\r?\n/)
    .map((line) => `> ${line || " "}`)
    .join("\n");
}

export function formatSimulationLogEntry(
  report: SimulationLogReport,
  metadata: SimulationLogMetadata,
): string {
  const timestamp = metadata.timestamp.toISOString();
  const label = oneLine(metadata.label || "Simulation run");
  const notes = metadata.notes.trim() || DEFAULT_SIMULATION_NOTES;
  const gitState = metadata.gitCommit
    ? `\`${metadata.gitCommit}\`${metadata.workingTreeDirty ? " with uncommitted changes" : " (clean)"}`
    : "Unavailable";
  const activationAttempts =
    report.activationFailureReasons.activated
    + report.activationFailureReasons.activation_corporate_capture;
  const allTracksReady = report.runs - report.activationFailureReasons.tracks_never_ready;
  const failureReasons = Object.entries(report.activationFailureReasons)
    .map(([reason, count]) => `| ${reason} | ${count.toLocaleString("en-US")} |`)
    .join("\n");
  const strategyActivations = Object.entries(report.outcomeByStrategy)
    .filter(([, result]) => result.runs > 0)
    .map(([strategy, result]) => {
      const activations = result.endings.compromised_activation + result.endings.civic_legacy;
      return `| ${strategy} | ${result.runs.toLocaleString("en-US")} | ${activations.toLocaleString("en-US")} |`;
    })
    .join("\n");

  return `## ${timestamp} — ${label}

- Runs: **${report.runs.toLocaleString("en-US")}**
- Seed: \`${report.seed}\`
- Source: ${gitState}

| Outcome | Result |
| --- | ---: |
| Activations | ${report.outcomeSummary.activations.toLocaleString("en-US")} (${report.outcomeSummary.activationRate}%) |
| Civic Legacy | ${report.endings.civic_legacy.toLocaleString("en-US")} |
| State collapse | ${report.endings.state_collapse.toLocaleString("en-US")} (${report.outcomeSummary.collapseRate}%) |
| Corporate capture | ${report.endings.corporate_capture.toLocaleString("en-US")} (${report.outcomeSummary.corporateCaptureRate}%) |
| Average / median months | ${report.averageMonths} / ${report.campaignLength.median} |
| Longest campaign | ${report.campaignLength.max} months |
| Cards presented / resolved per run | ${report.cardTempo.presentedPerRun} / ${report.cardTempo.activelyResolvedPerRun} |
| Over 5 / 10 years | ${report.campaignLength.exceeding5Years} / ${report.campaignLength.exceeding10Years} |
| All tracks ready | ${allTracksReady.toLocaleString("en-US")} |
| Activation attempts | ${activationAttempts.toLocaleString("en-US")} |

### Activation funnel

| Result | Runs |
| --- | ---: |
${failureReasons}

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
${strategyActivations}

### Notes

${asBlockquote(notes)}

`;
}

export async function appendSimulationLog(
  projectRoot: string,
  report: SimulationLogReport,
  metadata: SimulationLogMetadata,
): Promise<string> {
  const logPath = path.join(projectRoot, SIMULATION_LOG_PATH);
  await mkdir(path.dirname(logPath), { recursive: true });

  try {
    await readFile(logPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await writeFile(logPath, LOG_HEADER, "utf8");
  }

  await appendFile(logPath, formatSimulationLogEntry(report, metadata), "utf8");
  return logPath;
}
