import {
  ADVISOR_IDS,
  RESOURCE_KEYS,
  TRACK_KEYS,
  type ActionCategory,
  type AdvisorId,
  type AdvisorState,
  type DecisionRecord,
  type DecisionSubject,
  type Effects,
  type GameState,
  type StateDelta,
} from "./types";

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function cloneState(state: GameState): GameState {
  return structuredClone(state);
}

export type EffectSnapshot = Pick<
  GameState,
  "resources" | "pressures" | "tracks" | "institutions" | "advisors"
> & {
  corporation: Pick<GameState["corporation"], "progress" | "threat">;
};

export function snapshotGameEffects(state: GameState): EffectSnapshot {
  return {
    resources: { ...state.resources },
    pressures: { ...state.pressures },
    tracks: { ...state.tracks },
    institutions: state.institutions,
    corporation: {
      progress: state.corporation.progress,
      threat: state.corporation.threat,
    },
    advisors: Object.fromEntries(
      ADVISOR_IDS.map((advisorId) => [
        advisorId,
        { ...state.advisors[advisorId] },
      ]),
    ) as GameState["advisors"],
  };
}

function numericDelta(before: number, after: number): number | undefined {
  const delta = after - before;
  return delta === 0 ? undefined : delta;
}

export function diffEffectSnapshots(before: EffectSnapshot, after: EffectSnapshot): StateDelta {
  const delta: StateDelta = {
    resources: {},
    pressures: {},
    tracks: {},
    advisors: {},
  };

  for (const key of RESOURCE_KEYS) {
    const change = numericDelta(before.resources[key], after.resources[key]);
    if (change !== undefined) delta.resources[key] = change;
  }
  for (const key of ["stress", "panic"] as const) {
    const change = numericDelta(before.pressures[key], after.pressures[key]);
    if (change !== undefined) delta.pressures[key] = change;
  }
  for (const key of TRACK_KEYS) {
    const change = numericDelta(before.tracks[key], after.tracks[key]);
    if (change !== undefined) delta.tracks[key] = change;
  }

  const institutions = numericDelta(before.institutions, after.institutions);
  if (institutions !== undefined) delta.institutions = institutions;
  const corporationProgress = numericDelta(
    before.corporation.progress,
    after.corporation.progress,
  );
  if (corporationProgress !== undefined) delta.corporationProgress = corporationProgress;
  const corporationThreat = numericDelta(
    before.corporation.threat,
    after.corporation.threat,
  );
  if (corporationThreat !== undefined) delta.corporationThreat = corporationThreat;

  for (const advisorId of ADVISOR_IDS) {
    const prior = before.advisors[advisorId];
    const current = after.advisors[advisorId];
    const advisorDelta: NonNullable<StateDelta["advisors"][AdvisorId]> = {};
    for (const key of ["loyalty", "alignment", "leverage", "competence"] as const) {
      const change = numericDelta(prior[key], current[key]);
      if (change !== undefined) advisorDelta[key] = change;
    }
    if (prior.active !== current.active) advisorDelta.active = current.active;
    if (Object.keys(advisorDelta).length > 0) delta.advisors[advisorId] = advisorDelta;
  }

  return delta;
}

export function diffGameState(before: GameState, after: GameState): StateDelta {
  return diffEffectSnapshots(snapshotGameEffects(before), snapshotGameEffects(after));
}

export function hasStateDelta(delta: StateDelta): boolean {
  return Object.keys(delta.resources).length > 0
    || Object.keys(delta.pressures).length > 0
    || Object.keys(delta.tracks).length > 0
    || delta.institutions !== undefined
    || delta.corporationProgress !== undefined
    || delta.corporationThreat !== undefined
    || Object.keys(delta.advisors).length > 0;
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
  const advisorImpact = ADVISOR_IDS.reduce(
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
  subject: DecisionSubject | null = null,
): DecisionRecord {
  const resolvedSubject =
    subject
    ?? (cardId && choiceId
      ? { kind: "card" as const, cardId, choiceId }
      : null);
  return {
    id: nextDecisionId(state),
    turn: state.turn,
    category,
    summary,
    cardId,
    choiceId,
    subject: resolvedSubject,
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
  subject: DecisionSubject | null = null,
): string {
  const decision = emptyDecision(state, category, summary, null, null, subject);
  populateDecisionImpact(decision, before, state);
  state.decisionHistory.push(decision);
  addHistory(state, "player", summary, { decisionId: decision.id });
  return decision.id;
}
