import { execFileSync } from "node:child_process";
import { runSimulation } from "../src/game/simulator.js";
import { LEGACY_DIRECTIVE_IDS, type LegacyDirectiveId } from "../src/game/types.js";
import {
  appendSimulationLog,
  DEFAULT_SIMULATION_NOTES,
} from "./simulation-log.js";

type CliOptions = {
  runs: number;
  seed: number;
  label?: string;
  notes: string;
  legacyDirectiveId?: LegacyDirectiveId;
};

function valueForFlag(args: string[], name: string): string | undefined {
  const equalsPrefix = `${name}=`;
  const equalsValue = args.find((argument) => argument.startsWith(equalsPrefix));
  if (equalsValue) return equalsValue.slice(equalsPrefix.length);

  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value.`);
  }
  return value;
}

function positionalArguments(args: string[]): string[] {
  const positionals: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!argument) continue;
    if (["--notes", "--label", "--directive"].includes(argument)) {
      index += 1;
      continue;
    }
    if (!argument.startsWith("--")) positionals.push(argument);
  }
  return positionals;
}

export function parseSimulationCli(args: string[]): CliOptions {
  const positionals = positionalArguments(args);
  const label = valueForFlag(args, "--label");
  const directive = valueForFlag(args, "--directive");
  if (directive && !LEGACY_DIRECTIVE_IDS.includes(directive as LegacyDirectiveId)) {
    throw new Error(`Unknown Legacy Directive: ${directive}`);
  }
  return {
    runs: Number.parseInt(positionals[0] ?? "1000", 10),
    seed: Number.parseInt(positionals[1] ?? "20260715", 10),
    ...(label ? { label } : {}),
    ...(directive ? { legacyDirectiveId: directive as LegacyDirectiveId } : {}),
    notes: valueForFlag(args, "--notes") ?? process.env.BRB_SIMULATION_NOTES ?? DEFAULT_SIMULATION_NOTES,
  };
}

function gitValue(args: string[]): string | undefined {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return undefined;
  }
}

async function main(): Promise<void> {
  const options = parseSimulationCli(process.argv.slice(2));
  const report = runSimulation({
    runs: options.runs,
    seed: options.seed,
    legacyDirectiveId: options.legacyDirectiveId ?? null,
  });
  const gitCommit = gitValue(["rev-parse", "--short", "HEAD"]);
  const gitStatus = gitValue(["status", "--porcelain"]);

  const logPath = await appendSimulationLog(process.cwd(), report, {
    timestamp: new Date(),
    notes: options.notes,
    ...(options.label ? { label: options.label } : {}),
    ...(gitCommit ? { gitCommit } : {}),
    ...(gitStatus !== undefined ? { workingTreeDirty: gitStatus.length > 0 } : {}),
  });

  console.log(JSON.stringify(report, null, 2));
  console.error(`Simulation summary appended to ${logPath}`);
}

await main();
