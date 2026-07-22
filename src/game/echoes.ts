import { addHistory, clamp, linkConsequence } from "./state-helpers";
import type { AdvisorId, GameState } from "./types";

const POSITIVE_MEMORIES = new Set([
  "protected_whistleblower",
  "contained_whistleblower",
  "protected_defector",
  "shared_activation_authority",
  "ran_counter_lobby",
  "silent_partner_channel",
  "containment_authority",
]);
const NEGATIVE_MEMORIES = new Set([
  "subjected_to_loyalty_audit",
  "ignored_coalition_vote",
  "emergency_bill_vetoed",
]);

export type AdvisorForecastProfile = {
  accuracy: number;
  memoryModifier: number;
  doctrineModifier: number;
  sourceDecisionIds: string[];
};

function memoryValue(memory: string): number {
  if (POSITIVE_MEMORIES.has(memory) || memory.startsWith("contained_")) return 6;
  if (NEGATIVE_MEMORIES.has(memory)) return -6;
  return 0;
}

function memorySourceDecisionId(
  state: GameState,
  advisorId: AdvisorId,
  memory: string,
): string | null {
  const marker = `${advisorId}:${memory}`;
  return state.decisionHistory.find((decision) =>
    decision.advisorMemories.includes(marker),
  )?.id ?? null;
}

export function systemModifierSourceDecision(
  state: GameState,
  modifier: string,
) {
  return state.decisionHistory.find((decision) =>
    decision.systemModifiers.includes(modifier),
  ) ?? null;
}

export function getAdvisorForecastProfile(
  state: GameState,
  advisorId: AdvisorId,
): AdvisorForecastProfile {
  const advisor = state.advisors[advisorId];
  const memories = state.advisorMemories[advisorId];
  const rawMemoryModifier = memories.reduce(
    (sum, memory) => sum + memoryValue(memory),
    0,
  );
  const memoryModifier = clamp(rawMemoryModifier, -12, 12);
  const doctrineModifier = state.systemModifiers.includes("false_plan_in_circulation")
    ? -10
    : 0;
  const sourceDecisionIds = memories
    .filter((memory) => memoryValue(memory) !== 0)
    .map((memory) => memorySourceDecisionId(state, advisorId, memory))
    .filter((decisionId): decisionId is string => decisionId !== null);
  const falsePlanSource = systemModifierSourceDecision(
    state,
    "false_plan_in_circulation",
  )?.id;
  if (falsePlanSource) sourceDecisionIds.push(falsePlanSource);

  return {
    accuracy: clamp(
      advisor.competence
      + advisor.alignment * 0.2
      + (advisor.loyalty - 50) * 0.4
      - advisor.leverage * 0.35
      + memoryModifier
      + doctrineModifier,
    ),
    memoryModifier,
    doctrineModifier,
    sourceDecisionIds: [...new Set(sourceDecisionIds)],
  };
}

export function getAdvisorForecastAccuracy(
  state: GameState,
  advisorId: AdvisorId,
): number {
  return getAdvisorForecastProfile(state, advisorId).accuracy;
}

function surfaceEchoOnce(
  state: GameState,
  sourceDecisionId: string | null,
  message: string,
): void {
  if (!sourceDecisionId) return;
  if (state.history.some((entry) =>
    entry.causedByDecisionId === sourceDecisionId && entry.message === message,
  )) {
    return;
  }
  addHistory(state, "system", message, { causedByDecisionId: sourceDecisionId });
  linkConsequence(state, sourceDecisionId);
}

export function surfaceForecastEchoes(
  state: GameState,
  profile: AdvisorForecastProfile,
): void {
  for (const decisionId of profile.sourceDecisionIds) {
    surfaceEchoOnce(
      state,
      decisionId,
      "An earlier relationship or doctrine changed a later advisor forecast.",
    );
  }
}

export function surfaceSystemModifier(
  state: GameState,
  modifier: string,
  message: string,
): void {
  surfaceEchoOnce(state, systemModifierSourceDecision(state, modifier)?.id ?? null, message);
}

export function modifierAppliesThisTurn(
  state: GameState,
  modifier: string,
): boolean {
  if (!state.systemModifiers.includes(modifier)) return false;
  const source = systemModifierSourceDecision(state, modifier);
  return !source || source.turn < state.turn;
}
