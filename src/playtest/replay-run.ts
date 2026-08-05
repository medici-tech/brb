import { commitAction, consultAdvisor, createGame } from "../game/engine";
import type { GameState } from "../game/types";
import type { PlaytestRunEntry, PlaytestStepCheckpoint, PlaytestStepRecord } from "./types";

/**
 * Reproduces a recorded run by folding its input log from a fresh `createGame`.
 *
 * The value of this is not that it re-runs a campaign — it is that it tells you
 * *why* a campaign no longer reproduces. A divergence means the engine changed
 * how much randomness an action consumes; a rejection means the rules no longer
 * permit something the player actually did. Those are different problems with
 * different fixes, and a report that conflates them is worthless.
 */

/**
 * Checked on every step. These are the determinism contract: if any of them
 * disagree, the recorded run is not the run being replayed.
 */
const HARD_FIELDS = ["rngState", "turn", "phase", "decisionCount", "endingId"] as const;

export type ReplayWarning = { index: number; field: string; recorded: string; replayed: string };

export type ReplayResult =
  | { ok: true; state: GameState; steps: number; warnings: ReplayWarning[] }
  | {
    ok: false;
    reason: "diverged";
    index: number;
    steps: number;
    field: string;
    recorded: PlaytestStepCheckpoint;
    replayed: PlaytestStepCheckpoint;
    step: PlaytestStepRecord;
    lastAgreeingStep: PlaytestStepRecord | null;
  }
  | { ok: false; reason: "rejected"; index: number; steps: number; step: PlaytestStepRecord; error: string }
  | { ok: false; reason: "incomplete"; runId: string };

function checkpointOf(state: GameState): PlaytestStepCheckpoint {
  return {
    turn: state.turn,
    rngState: state.rngState,
    phase: state.phase,
    decisionCount: state.decisionHistory.length,
    latestDecisionId: state.decisionHistory.at(-1)?.id ?? null,
    endingId: state.ending?.id ?? null,
  };
}

export function replayPlaytestRun(run: PlaytestRunEntry): ReplayResult {
  if (!run.replayComplete) return { ok: false, reason: "incomplete", runId: run.runId };

  let state = createGame({
    seed: run.seed,
    archetypeId: run.archetypeId,
    runId: run.runId,
    ...(run.experiment === null ? {} : { experiment: run.experiment }),
    legacyDirectiveId: run.legacyDirectiveId,
  });

  const warnings: ReplayWarning[] = [];
  let lastAgreeingStep: PlaytestStepRecord | null = null;

  for (const record of run.steps) {
    const result = record.step.kind === "consult"
      ? consultAdvisor(state, record.step.advisorId, record.step.useArchetypeAbility)
      : commitAction(state, record.step.action, record.step.options);

    if (!result.accepted) {
      return {
        ok: false,
        reason: "rejected",
        index: record.index,
        steps: run.steps.length,
        step: record,
        error: result.error ?? "The engine rejected the recorded input.",
      };
    }

    state = result.state;
    const replayed = checkpointOf(state);
    const diverged = HARD_FIELDS.find((field) => replayed[field] !== record.after[field]);
    if (diverged) {
      return {
        ok: false,
        reason: "diverged",
        index: record.index,
        steps: run.steps.length,
        field: diverged,
        recorded: record.after,
        replayed,
        step: record,
        lastAgreeingStep,
      };
    }

    // Decision IDs are positional (`D{turn}-{n}`), so any engine change that
    // writes one extra DecisionRecord anywhere would otherwise turn every
    // archived run red for a reason that is not a reproduction failure.
    if (replayed.latestDecisionId !== record.after.latestDecisionId) {
      warnings.push({
        index: record.index,
        field: "latestDecisionId",
        recorded: String(record.after.latestDecisionId),
        replayed: String(replayed.latestDecisionId),
      });
    }

    lastAgreeingStep = record;
  }

  return { ok: true, state, steps: run.steps.length, warnings };
}

function describeStep(record: PlaytestStepRecord): string {
  const { step } = record;
  if (step.kind === "consult") {
    return `consult ${step.advisorId}${step.useArchetypeAbility ? " (archetype ability)" : ""}`;
  }
  const { action } = step;
  const detail =
    action.type === "deposit" ? ` ${action.track}/${action.size}`
      : action.type === "resolve_card" ? ` ${action.choiceId}`
        : action.type === "counter_corporation" ? ` ${action.predictedStrategy}`
          : action.type === "manage_advisor" ? ` ${action.advisorId}`
            : action.type === "recover_resource" ? ` ${action.resource}`
              : "";
  const flags = Object.keys(step.options);
  return `commit ${action.type}${detail}${flags.length > 0 ? ` {${flags.join(", ")}}` : ""}`;
}

function describeCheckpoint(checkpoint: PlaytestStepCheckpoint): string {
  return `turn ${checkpoint.turn}  rngState ${checkpoint.rngState}  phase ${checkpoint.phase}  `
    + `decisions ${checkpoint.decisionCount}  latest ${checkpoint.latestDecisionId ?? "—"}`;
}

/** Human-readable form for stderr. The stdout JSON carries the same facts. */
export function formatReplayResult(run: PlaytestRunEntry, result: ReplayResult): string {
  const loadout = `run ${run.runId} · ${run.archetypeId} · seed ${run.seed} · ${run.legacyDirectiveId ?? "no Directive"}`;

  if (result.ok) {
    const lines = [`REPRODUCED ${result.steps} of ${result.steps} steps   (${loadout})`];
    for (const warning of result.warnings) {
      lines.push(
        `  warning at step ${warning.index}: ${warning.field} recorded ${warning.recorded}, replayed ${warning.replayed}`,
      );
    }
    if (result.warnings.length > 0) {
      lines.push("  Decision IDs are positional, so this is a labelling shift, not a reproduction failure.");
    }
    return lines.join("\n");
  }

  if (result.reason === "incomplete") {
    return [
      `INCOMPLETE   (run ${result.runId})`,
      "  This run has no usable input log: the journal was reset or replaced while it was",
      "  under way. Refusing to replay rather than reporting a divergence that means nothing.",
    ].join("\n");
  }

  if (result.reason === "rejected") {
    return [
      `REJECTED at step ${result.index} of ${result.steps}   (${loadout})`,
      `  step       ${describeStep(result.step)}`,
      `  engine     ${result.error}`,
      "  This is not a determinism failure: the rules no longer permit a recorded input.",
      "  Expected after a balance change; the run is not reproducible under current rules.",
    ].join("\n");
  }

  return [
    `DIVERGENCE at step ${result.index} of ${result.steps}   (${loadout})`,
    `  step         ${describeStep(result.step)}`,
    `  recorded     ${describeCheckpoint(result.recorded)}`,
    `  replayed     ${describeCheckpoint(result.replayed)}`,
    `  first mismatched field: ${result.field}`,
    result.lastAgreeingStep
      ? `  last agreeing step: ${result.lastAgreeingStep.index}  (turn ${result.lastAgreeingStep.after.turn}, after ${describeStep(result.lastAgreeingStep)})`
      : "  last agreeing step: none — the run diverged on its first input",
    "",
    "  Two causes produce this:",
    "    · an engine change altered how many random draws this action consumes; or",
    "    · an input was not recorded — an unrecorded consultation advances the RNG",
    "      twice on a forecast miss.",
  ].join("\n");
}
