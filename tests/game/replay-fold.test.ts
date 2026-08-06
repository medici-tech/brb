import { describe, expect, it } from "vitest";
import {
  SITUATION_CARDS,
  canUseArchetypeConsultation,
  commitAction,
  consultAdvisor,
  createGame,
  getCompletionPressure,
  isCorporationResponseDue,
} from "../../src/game/index.js";
import type {
  AdvisorId,
  ArchetypeId,
  CommitOptions,
  GameState,
  LegacyDirectiveId,
  MajorAction,
  ResourceKey,
  TrackKey,
} from "../../src/game/types.js";

/**
 * The free-play journal records engine *inputs*, not the decisions the engine
 * chose to remember, and replays a run by folding those inputs from a fresh
 * `createGame`. Everything downstream — `npm run replay`, marker triage against
 * a reconstructed board — rests on that fold being exact. These tests are the
 * executable form of that claim.
 */

type ActionStep =
  | { kind: "consult"; advisorId: AdvisorId; useArchetypeAbility: boolean }
  | { kind: "commit"; action: MajorAction; options: CommitOptions };

type RunSetup = {
  seed: number;
  archetypeId: ArchetypeId;
  legacyDirectiveId: LegacyDirectiveId | null;
};

const TRACK_ORDER: TrackKey[] = ["engineering", "legitimacy", "access", "stability"];
const RESOURCE_ORDER: ResourceKey[] = ["money", "influence", "intelligence", "trust", "capacity"];
const ADVISOR_ORDER: AdvisorId[] = ["analyst", "steward", "fixer"];

/** A guard well above any real campaign; a runaway loop should fail loudly. */
const MAX_STEPS = 400;

function newGame({ seed, archetypeId, legacyDirectiveId }: RunSetup): GameState {
  return createGame({ seed, archetypeId, legacyDirectiveId, runId: `fold-${seed}-${archetypeId}` });
}

/**
 * Candidate commitments in priority order. The point is not to play well — it is
 * to reach every branch that could make the input log lossy: card resolution,
 * card abandonment, Directive spend, counters, deposits of both sizes, and
 * activation.
 */
function candidateActions(state: GameState, step: number): MajorAction[] {
  const candidates: MajorAction[] = [];
  const activeCard = state.activeCardId
    ? SITUATION_CARDS.find((card) => card.id === state.activeCardId)
    : undefined;

  // Resolve most cards, but deliberately abandon every third one so the log has
  // to carry `confirmCardAbandonment`.
  if (activeCard && step % 3 !== 2) {
    for (const choice of activeCard.choices) candidates.push({ type: "resolve_card", choiceId: choice.id });
  }

  candidates.push({ type: "activate_brb" });
  if (step % 5 === 0) candidates.push({ type: "counter_corporation", predictedStrategy: state.corporation.strategy });
  if (step % 4 === 3) candidates.push({ type: "protect_institutions" });
  if (step % 7 === 5) candidates.push({ type: "strengthen_faction" });

  const track = TRACK_ORDER[step % TRACK_ORDER.length] ?? "engineering";
  candidates.push({ type: "deposit", track, size: step % 2 === 0 ? "large" : "standard" });
  candidates.push({ type: "deposit", track, size: "standard" });
  for (const other of TRACK_ORDER) candidates.push({ type: "deposit", track: other, size: "standard" });

  for (const resource of RESOURCE_ORDER) candidates.push({ type: "recover_resource", resource });
  for (const advisorId of ADVISOR_ORDER) candidates.push({ type: "manage_advisor", advisorId });

  return candidates;
}

/**
 * Drives a campaign to its ending with a deterministic scripted policy, keeping
 * only the inputs the engine accepted. This is the recorder's contract in
 * miniature: whatever it returns must reproduce the same run.
 */
function recordRun(setup: RunSetup): { steps: ActionStep[]; finalState: GameState } {
  let state = newGame(setup);
  const steps: ActionStep[] = [];

  for (let step = 0; state.phase !== "ended"; step += 1) {
    expect(steps.length).toBeLessThan(MAX_STEPS);

    // Consult on a fixed cadence, spending the archetype ability the first time
    // it is available so the ability branch is covered too.
    if (step % 2 === 0) {
      const advisorId = ADVISOR_ORDER[step % ADVISOR_ORDER.length] ?? "analyst";
      const useArchetypeAbility = canUseArchetypeConsultation(state, advisorId);
      const consulted = consultAdvisor(state, advisorId, useArchetypeAbility);
      if (consulted.accepted) {
        steps.push({ kind: "consult", advisorId, useArchetypeAbility });
        state = consulted.state;
      }
    }

    const directiveReady = Boolean(
      state.legacyDirective.equippedId
      && !state.legacyDirective.used
      && (
        state.legacyDirective.equippedId !== "continuity_freeze_order"
        || isCorporationResponseDue(state, getCompletionPressure(state).tier)
      ),
    );

    let committed = false;
    for (const action of candidateActions(state, step)) {
      const options: CommitOptions = {};
      if (state.activeCardId !== null && action.type !== "resolve_card") options.confirmCardAbandonment = true;
      if (directiveReady && action.type !== "activate_brb") options.useLegacyDirective = true;

      const result = commitAction(state, action, options);
      if (!result.accepted) continue;
      steps.push({ kind: "commit", action, options });
      state = result.state;
      committed = true;
      break;
    }

    // A campaign with no affordable commitment would spin forever; the scripted
    // policy always includes recovery, so this should be unreachable.
    expect(committed).toBe(true);
  }

  return { steps, finalState: state };
}

/** Replays a recorded input log from a fresh game, exactly as the CLI will. */
function foldRun(setup: RunSetup, steps: ActionStep[]): GameState {
  let state = newGame(setup);
  for (const [index, step] of steps.entries()) {
    const result = step.kind === "consult"
      ? consultAdvisor(state, step.advisorId, step.useArchetypeAbility)
      : commitAction(state, step.action, step.options);
    expect(result.accepted, `step ${index + 1} (${step.kind}) was rejected during replay: ${result.error}`).toBe(true);
    state = result.state;
  }
  return state;
}

const SETUPS: RunSetup[] = [
  { seed: 20260715, archetypeId: "technocrat", legacyDirectiveId: "emergency_appropriation" },
  { seed: 4242, archetypeId: "populist", legacyDirectiveId: "coalition_whip" },
  { seed: 90210, archetypeId: "operator", legacyDirectiveId: "continuity_freeze_order" },
  { seed: 77, archetypeId: "technocrat", legacyDirectiveId: null },
];

describe("replaying a run from its recorded inputs", () => {
  it.each(SETUPS)(
    "reproduces the whole campaign for $archetypeId on seed $seed",
    (setup) => {
      const { steps, finalState } = recordRun(setup);
      expect(steps.length).toBeGreaterThan(0);
      expect(foldRun(setup, steps)).toEqual(finalState);
    },
  );

  it("reaches every branch that could make an input log lossy", () => {
    const { steps } = recordRun(SETUPS[0]!);
    const commits = steps.flatMap((step) => (step.kind === "commit" ? [step] : []));

    expect(steps.some((step) => step.kind === "consult")).toBe(true);
    expect(commits.some((step) => step.action.type === "resolve_card")).toBe(true);
    expect(commits.some((step) => step.options.confirmCardAbandonment === true)).toBe(true);
    expect(commits.some((step) => step.options.useLegacyDirective === true)).toBe(true);
    expect(commits.some((step) => step.action.type === "deposit")).toBe(true);
  });

  it("keeps the fold stable across repeated replays", () => {
    const setup = SETUPS[1]!;
    const { steps } = recordRun(setup);
    expect(foldRun(setup, steps)).toEqual(foldRun(setup, steps));
  });
});

describe("what the input log must not omit", () => {
  /**
   * A lossy log fails in one of two ways, and the replay CLI reports them
   * differently: the engine rejects a recorded input outright, or it accepts
   * everything and lands somewhere else. Both mean "not reproduced".
   */
  function tryFold(setup: RunSetup, steps: ActionStep[]): GameState | null {
    let state = newGame(setup);
    for (const step of steps) {
      const result = step.kind === "consult"
        ? consultAdvisor(state, step.advisorId, step.useArchetypeAbility)
        : commitAction(state, step.action, step.options);
      if (!result.accepted) return null;
      state = result.state;
    }
    return state;
  }

  /**
   * `consultAdvisor` advances `rngState` twice on a forecast miss
   * (src/game/engine.ts) but writes no `DecisionRecord` unless the archetype
   * ability fires. A recorder built on `decisionHistory` would silently drop
   * ordinary consultations. Folding a short prefix isolates the RNG effect
   * before affordability drift can cause a rejection instead.
   */
  it("diverges when an ordinary consultation is dropped from the log", () => {
    const setup = SETUPS[1]!;
    const { steps } = recordRun(setup);

    const droppedIndex = steps.findIndex((step) => step.kind === "consult" && !step.useArchetypeAbility);
    expect(droppedIndex).toBeGreaterThanOrEqual(0);

    // Stop just after the next commitment: long enough for the missing RNG
    // draws to reach the state, short enough that everything stays affordable.
    const nextCommit = steps.findIndex((step, index) => index > droppedIndex && step.kind === "commit");
    const prefix = steps.slice(0, nextCommit + 1);

    const withConsult = tryFold(setup, prefix);
    const withoutConsult = tryFold(setup, prefix.filter((_, index) => index !== droppedIndex));

    expect(withConsult).not.toBeNull();
    expect(withoutConsult).not.toBeNull();
    expect(withoutConsult!.rngState).not.toBe(withConsult!.rngState);
  });

  /**
   * `DecisionSubject` records that a deposit happened, but replay needs the
   * track and size back. Losing the track spends the wrong resources and
   * credits the wrong meter.
   */
  it("diverges when a deposit loses its track", () => {
    const setup = SETUPS[0]!;
    const { steps } = recordRun(setup);

    const depositIndex = steps.findIndex((step) => step.kind === "commit" && step.action.type === "deposit");
    expect(depositIndex).toBeGreaterThanOrEqual(0);

    const prefix = steps.slice(0, depositIndex + 1);
    const original = steps[depositIndex]!;
    expect(original.kind).toBe("commit");
    const action = (original as Extract<ActionStep, { kind: "commit" }>).action;
    expect(action.type).toBe("deposit");
    const deposit = action as Extract<MajorAction, { type: "deposit" }>;
    const swapped: TrackKey = deposit.track === "engineering" ? "legitimacy" : "engineering";

    const rewritten = prefix.map((step, index) =>
      index === depositIndex
        ? { ...step, action: { ...deposit, track: swapped } }
        : step);

    const faithful = tryFold(setup, prefix);
    const lossy = tryFold(setup, rewritten);

    expect(faithful).not.toBeNull();
    // Either the swapped deposit is unaffordable (rejected) or it credits the
    // wrong meter. Both are reproduction failures.
    expect(lossy === null || lossy.tracks[deposit.track] !== faithful!.tracks[deposit.track]).toBe(true);
  });
});
