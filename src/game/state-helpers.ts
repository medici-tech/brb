import {
  RESOURCE_KEYS,
  TRACK_KEYS,
  type ActionCategory,
  type AdvisorId,
  type AdvisorState,
  type DecisionRecord,
  type Effects,
  type GameState,
} from "./types";

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function cloneState(state: GameState): GameState {
  return structuredClone(state);
}

export function addHistory(
  state: GameState,
  source: GameState["history"][number]["source"],
  message: string,
  links: { decisionId?: string; causedByDecisionId?: string } = {},
): void {
  const consequence: GameState["history"][number] = { turn: state.turn, source, message };
  if (links.decisionId) consequence.decisionId = links.decisionId;
  if (links.causedByDecisionId) consequence.causedByDecisionId = links.causedByDecisionId;
  state.history.push(consequence);
}

export function patchNumberRecord<T extends string>(
  target: Record<T, number>,
  changes: Partial<Record<T, number>> | undefined,
): void {
  if (!changes) return;
  for (const [key, amount] of Object.entries(changes) as [T, number][]) {
    target[key] = clamp(target[key] + amount);
  }
}

export function applyEffects(state: GameState, effects: Effects): void {
  patchNumberRecord(state.resources, effects.resources);
  patchNumberRecord(state.pressures, effects.pressures);
  patchNumberRecord(state.tracks, effects.tracks);

  if (effects.institutions !== undefined) {
    state.institutions = clamp(state.institutions + effects.institutions);
  }
  if (effects.corporationProgress !== undefined) {
    state.corporation.progress = clamp(
      state.corporation.progress + effects.corporationProgress,
    );
  }
  if (effects.corporationThreat !== undefined) {
    state.corporation.threat = clamp(
      state.corporation.threat + effects.corporationThreat,
    );
  }
  if (effects.advisors) {
    for (const [advisorId, changes] of Object.entries(effects.advisors) as [
      AdvisorId,
      Partial<AdvisorState>,
    ][]) {
      const advisor = state.advisors[advisorId];
      for (const [key, amount] of Object.entries(changes) as [keyof AdvisorState, number | boolean][]) {
        if (key === "active") advisor.active = Boolean(amount);
        else advisor[key] = clamp(advisor[key] + Number(amount));
      }
    }
  }
}

export function linkConsequence(state: GameState, decisionId: string | null): void {
  if (!decisionId) return;
  const decision = state.decisionHistory.find((candidate) => candidate.id === decisionId);
  if (decision) decision.linkedConsequences += 1;
}

function nextDecisionId(state: GameState): string {
  return `D${state.turn}-${state.decisionHistory.length + 1}`;
}

function calculateImmediateDeltaScore(before: GameState, after: GameState): number {
  let magnitude = 0;
  for (const key of RESOURCE_KEYS) magnitude += Math.abs(after.resources[key] - before.resources[key]);
  for (const key of TRACK_KEYS) magnitude += Math.abs(after.tracks[key] - before.tracks[key]);
  magnitude += Math.abs(after.pressures.stress - before.pressures.stress);
  magnitude += Math.abs(after.pressures.panic - before.pressures.panic);
  magnitude += Math.abs(after.institutions - before.institutions);
  magnitude += Math.abs(after.corporation.progress - before.corporation.progress);
  magnitude += Math.abs(after.corporation.threat - before.corporation.threat);
  return Math.round(magnitude / 5);
}

export function populateDecisionImpact(
  decision: DecisionRecord,
  before: GameState,
  after: GameState,
): void {
  decision.immediateDeltaScore = calculateImmediateDeltaScore(before, after);
  const trackImpact = TRACK_KEYS.reduce(
    (sum, key) => sum + Math.abs(after.tracks[key] - before.tracks[key]),
    0,
  );
  const depositedImpact = RESOURCE_KEYS.reduce(
    (sum, key) => sum + Math.abs(after.deposited[key] - before.deposited[key]),
    0,
  );
  const advisorImpact = (Object.keys(after.advisors) as AdvisorId[]).reduce(
    (sum, advisorId) => {
      const prior = before.advisors[advisorId];
      const current = after.advisors[advisorId];
      return (
        sum +
        Math.abs(current.loyalty - prior.loyalty) +
        Math.abs(current.alignment - prior.alignment) +
        Math.abs(current.leverage - prior.leverage)
      );
    },
    0,
  );
  decision.persistentImpactScore = Math.round(
    (trackImpact + depositedImpact + advisorImpact + Math.abs(after.institutions - before.institutions)) / 5,
  );
  decision.corporationImpactScore =
    Math.abs(after.corporation.progress - before.corporation.progress) +
    Math.abs(after.corporation.threat - before.corporation.threat);
  if (decision.category === "deposit") {
    decision.resourceOpportunityCost = RESOURCE_KEYS.reduce(
      (sum, key) => sum + Math.max(0, before.resources[key] - after.resources[key]),
      0,
    );
    decision.irreversibilityScore =
      decision.resourceOpportunityCost +
      TRACK_KEYS.reduce((sum, key) => sum + Math.max(0, after.tracks[key] - before.tracks[key]), 0);
  }
}

export function emptyDecision(
  state: GameState,
  category: ActionCategory,
  summary: string,
  cardId: string | null = null,
  choiceId: string | null = null,
): DecisionRecord {
  return {
    id: nextDecisionId(state),
    turn: state.turn,
    category,
    summary,
    cardId,
    choiceId,
    echoHints: [],
    echoTypes: [],
    flagsCreated: [],
    flagsConsumed: [],
    cardsAdded: [],
    cardsRemoved: [],
    routesOpened: [],
    routesReopened: [],
    routesAdvanced: [],
    routesCompleted: [],
    routesClosed: [],
    endingContributors: [],
    systemModifiers: [],
    advisorMemories: [],
    linkedConsequences: 0,
    immediateDeltaScore: 0,
    persistentImpactScore: 0,
    corporationImpactScore: 0,
    resourceOpportunityCost: 0,
    irreversibilityScore: 0,
    narrativeScore: 0,
    strategicScore: 0,
    finalTurningPointScore: 0,
    pivotalScore: 0,
  };
}

export function pushUnique(list: string[], value: string): void {
  if (!list.includes(value)) list.push(value);
}

export function recordSimpleDecision(
  state: GameState,
  before: GameState,
  category: ActionCategory,
  summary: string,
): string {
  const decision = emptyDecision(state, category, summary);
  populateDecisionImpact(decision, before, state);
  state.decisionHistory.push(decision);
  addHistory(state, "player", summary, { decisionId: decision.id });
  return decision.id;
}
