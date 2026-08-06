import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { deserializePlaytestJournal } from "../src/playtest/journal-validation.js";
import { formatReplayResult, replayPlaytestRun } from "../src/playtest/replay-run.js";
import type { PlaytestJournalV2, PlaytestRunEntry } from "../src/playtest/types.js";

/**
 * Reproduces a run from an exported playtest journal.
 *
 * Unlike `npm run simulate`, this command is non-mutating: it writes no tracked
 * file and appends to no evidence log. It answers one question — does this
 * recorded session still play out the same way under current rules — and says
 * why when the answer is no.
 */

type CliOptions = {
  path: string;
  runId?: string;
  through?: number;
  atTurn?: number;
  state: boolean;
  list: boolean;
};

const VALUE_FLAGS = ["--run", "--through", "--at-turn"];

function valueForFlag(args: string[], name: string): string | undefined {
  const equalsPrefix = `${name}=`;
  const equalsValue = args.find((argument) => argument.startsWith(equalsPrefix));
  if (equalsValue) return equalsValue.slice(equalsPrefix.length);

  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value.`);
  return value;
}

function positionalArguments(args: string[]): string[] {
  const positionals: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!argument) continue;
    if (VALUE_FLAGS.includes(argument)) {
      index += 1;
      continue;
    }
    if (!argument.startsWith("--")) positionals.push(argument);
  }
  return positionals;
}

function integerFlag(args: string[], name: string): number | undefined {
  const raw = valueForFlag(args, name);
  if (raw === undefined) return undefined;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${name} requires a positive integer.`);
  return parsed;
}

export function parseReplayCli(args: string[]): CliOptions {
  const positionals = positionalArguments(args);
  const path = positionals[0];
  if (!path) throw new Error("A path to an exported playtest journal is required.");

  const runId = valueForFlag(args, "--run");
  const through = integerFlag(args, "--through");
  const atTurn = integerFlag(args, "--at-turn");

  return {
    path,
    ...(runId ? { runId } : {}),
    ...(through === undefined ? {} : { through }),
    ...(atTurn === undefined ? {} : { atTurn }),
    state: args.includes("--state"),
    list: args.includes("--list"),
  };
}

function runTable(journal: PlaytestJournalV2): string {
  if (journal.runs.length === 0) return "  (the journal holds no runs)";
  return journal.runs
    .map((run) => [
      `  ${run.runId}`,
      run.archetypeId,
      `seed ${run.seed}`,
      run.legacyDirectiveId ?? "no Directive",
      run.endingId ?? run.status,
      `${run.months ?? "—"} months`,
      `${run.steps.length} steps`,
      run.replayComplete ? "replayable" : "PARTIAL",
    ].join("  ·  "))
    .join("\n");
}

/** Truncating the log is a supported request, but it stops being a full run. */
function truncate(run: PlaytestRunEntry, through: number | undefined): PlaytestRunEntry {
  if (through === undefined) return run;
  return { ...run, steps: run.steps.slice(0, through) };
}

function main(): void {
  let options: CliOptions;
  try {
    options = parseReplayCli(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n`);
    process.stderr.write("Usage: npm run replay -- <journal.json> [--run <runId>] [--through <n>] [--at-turn <n>] [--state] [--list]\n");
    process.exitCode = 2;
    return;
  }

  let journal: PlaytestJournalV2;
  try {
    journal = deserializePlaytestJournal(readFileSync(options.path, "utf8"));
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n`);
    process.exitCode = 2;
    return;
  }

  if (options.list) {
    process.stderr.write(`${journal.runs.length} run(s) in ${options.path}:\n${runTable(journal)}\n`);
    process.stdout.write(`${JSON.stringify(journal.runs.map((run) => ({
      runId: run.runId,
      archetypeId: run.archetypeId,
      seed: run.seed,
      legacyDirectiveId: run.legacyDirectiveId,
      endingId: run.endingId,
      status: run.status,
      months: run.months,
      steps: run.steps.length,
      replayComplete: run.replayComplete,
    })), null, 2)}\n`);
    return;
  }

  const run = options.runId
    ? journal.runs.find((candidate) => candidate.runId === options.runId)
    : journal.runs.length === 1 ? journal.runs[0] : undefined;

  if (!run) {
    process.stderr.write(options.runId
      ? `No run "${options.runId}" in ${options.path}.\n`
      : `This journal holds ${journal.runs.length} runs; name one with --run.\n`);
    process.stderr.write(`${runTable(journal)}\n`);
    process.exitCode = 2;
    return;
  }

  const result = replayPlaytestRun(truncate(run, options.through));
  process.stderr.write(`${formatReplayResult(run, result)}\n`);

  if (!result.ok) {
    // An unusable log is a usage problem, not a reproduction failure.
    process.exitCode = result.reason === "incomplete" ? 2 : 1;
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const atTurn = options.atTurn === undefined
    ? undefined
    : run.steps.find((record) => record.after.turn === options.atTurn);
  if (options.atTurn !== undefined && !atTurn) {
    process.stderr.write(`  note: the run never recorded a step ending on turn ${options.atTurn}.\n`);
  }

  process.stdout.write(`${JSON.stringify({
    ok: true,
    runId: run.runId,
    steps: result.steps,
    warnings: result.warnings,
    final: {
      turn: result.state.turn,
      phase: result.state.phase,
      endingId: result.state.ending?.id ?? null,
      resources: result.state.resources,
      tracks: result.state.tracks,
      pressures: result.state.pressures,
    },
    ...(atTurn ? { atTurn: atTurn.after } : {}),
    ...(options.state ? { state: result.state } : {}),
  }, null, 2)}\n`);
}

// Only run when invoked as a script. The CLI parser is imported by tests, and
// a side-effecting main() would print usage and set an exit code during them.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
