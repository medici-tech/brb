import {
  ADVISORS,
  ARCHETYPES,
  BASE_RESOURCES,
  CORPORATION_MOVES,
  DEPOSIT_COSTS,
  ENDING_COPY,
  FOLLOW_UP_CARD_IDS,
  SITUATION_CARDS,
} from "./content";
import { buildDeclassifiedReport } from "./replay";
import { nextRandom, randomInt } from "./rng";
import {
  CARD_TYPES,
  RESOURCE_KEYS,
  ROUTE_IDS,
  TRACK_KEYS,
  type ActionCategory,
  type ActionResult,
  type AdvisorId,
  type AdvisorState,
  type ArchetypeId,
  type CardRequirements,
  type ConsultationResult,
  type CorporationStrategy,
  type CreateGameOptions,
  type DecisionRecord,
  type Effects,
  type Ending,
  type EndingVariationId,
  type GameState,
  type MajorAction,
  type ResourceKey,
  type ResourcePool,
  type RouteChange,
  type SituationCard,
  type SituationOutcome,
  type TrackKey,
} from "./types";

const CORPORATION_STRATEGIES = Object.keys(CORPORATION_MOVES) as CorporationStrategy[];

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function cloneState(state: GameState): GameState {
  return structuredClone(state);
}

function addHistory(
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

function patchNumberRecord<T extends string>(
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

function applyArchetype(state: GameState): void {
  const archetype = ARCHETYPES[state.archetypeId];
  patchNumberRecord(state.resources, archetype.resourceChanges);
  patchNumberRecord(state.tracks, archetype.trackChanges);
  for (const [advisorId, changes] of Object.entries(archetype.advisorChanges) as [
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

function meetsCardRequirements(state: GameState, requirements: CardRequirements | undefined): boolean {
  if (!requirements) return true;
  if (requirements.minTurn !== undefined && state.turn < requirements.minTurn) return false;
  if (requirements.maxTurn !== undefined && state.turn > requirements.maxTurn) return false;
  for (const [track, minimum] of Object.entries(requirements.minTrack ?? {}) as [TrackKey, number][]) {
    if (state.tracks[track] < minimum) return false;
  }
  for (const [resource, maximum] of Object.entries(requirements.maxResource ?? {}) as [
    ResourceKey,
    number,
  ][]) {
    if (state.resources[resource] > maximum) return false;
  }
  if (requirements.requiredFlags?.some((flag) => !state.flags.includes(flag))) return false;
  if (requirements.excludedFlags?.some((flag) => state.flags.includes(flag))) return false;
  if (
    requirements.requiredCorporationStrategies &&
    !requirements.requiredCorporationStrategies.includes(state.corporation.strategy)
  ) return false;
  return true;
}

function cardIsInDeck(state: GameState, card: SituationCard): boolean {
  if (state.deck.removedCardIds.includes(card.id)) return false;
  if (FOLLOW_UP_CARD_IDS.has(card.id) && !state.deck.addedCardIds.includes(card.id)) return false;
  return true;
}

export function getEligibleSituationCards(state: GameState): SituationCard[] {
  return SITUATION_CARDS.filter((card) => {
    if (!cardIsInDeck(state, card)) return false;
    if (!meetsCardRequirements(state, card.requirements)) return false;
    const drawCount = state.deck.drawCounts[card.id] ?? 0;
    if (drawCount >= card.maxPerRun) return false;
    const lastDrawn = state.deck.lastDrawnTurn[card.id];
    if (lastDrawn !== undefined && state.turn - lastDrawn < card.cooldownTurns) return false;
    return true;
  });
}

function linkConsequence(state: GameState, decisionId: string | null): void {
  if (!decisionId) return;
  const decision = state.decisionHistory.find((candidate) => candidate.id === decisionId);
  if (decision) decision.linkedConsequences += 1;
}

function drawSituationCard(state: GameState): void {
  const appearanceRoll = nextRandom(state.rngState);
  state.rngState = appearanceRoll.state;
  if (appearanceRoll.value > 0.65) {
    state.activeCardId = null;
    return;
  }

  const eligible = getEligibleSituationCards(state);
  if (eligible.length === 0) {
    state.activeCardId = null;
    return;
  }

  const favoredType = ARCHETYPES[state.archetypeId].favoredCardType;
  const weighted = eligible.map((card) => ({
    card,
    weight: card.weight * (card.type === favoredType ? 1.25 : 1),
  }));
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  const random = nextRandom(state.rngState);
  state.rngState = random.state;
  let cursor = random.value * totalWeight;
  let selected = weighted[weighted.length - 1]?.card ?? null;
  for (const item of weighted) {
    cursor -= item.weight;
    if (cursor <= 0) {
      selected = item.card;
      break;
    }
  }
  if (!selected) return;

  state.activeCardId = selected.id;
  state.deck.drawCounts[selected.id] = (state.deck.drawCounts[selected.id] ?? 0) + 1;
  state.deck.lastDrawnTurn[selected.id] = state.turn;
  const causedByDecisionId = state.deck.cardSources[selected.id] ?? null;
  state.cardHistory.push({
    cardId: selected.id,
    turn: state.turn,
    choiceId: null,
    outcomeId: null,
    causedByDecisionId,
  });
  linkConsequence(state, causedByDecisionId);
  if (causedByDecisionId) {
    addHistory(
      state,
      "card",
      `${selected.title} appeared because of an earlier decision.`,
      { causedByDecisionId },
    );
  }
}

function createAdvisorState(id: AdvisorId): AdvisorState {
  const definition = ADVISORS[id];
  return {
    loyalty: 60,
    alignment: 55,
    leverage: 10,
    competence: definition.baseCompetence,
    active: true,
  };
}

function normalizeCreateOptions(
  seedOrOptions: number | CreateGameOptions,
  archetypeId: ArchetypeId,
  maxTurns: number,
): Required<Omit<CreateGameOptions, "experiment">> & { experiment: string | null } {
  if (typeof seedOrOptions === "number") {
    const seed = seedOrOptions >>> 0;
    return {
      seed,
      archetypeId,
      maxTurns,
      runId: `run-${seed}-${archetypeId}`,
      experiment: null,
    };
  }
  const seed = seedOrOptions.seed >>> 0;
  const chosenArchetype = seedOrOptions.archetypeId ?? "technocrat";
  return {
    seed,
    archetypeId: chosenArchetype,
    maxTurns: seedOrOptions.maxTurns ?? 20,
    runId: seedOrOptions.runId ?? `run-${seed}-${chosenArchetype}`,
    experiment: seedOrOptions.experiment ?? null,
  };
}

export function createGame(
  seedOrOptions: number | CreateGameOptions,
  archetypeId: ArchetypeId = "technocrat",
  maxTurns = 20,
): GameState {
  const options = normalizeCreateOptions(seedOrOptions, archetypeId, maxTurns);
  const firstRandom = randomInt(options.seed, CORPORATION_STRATEGIES.length);
  const state: GameState = {
    version: 2,
    runId: options.runId,
    seed: options.seed,
    rngState: firstRandom.state,
    turn: 1,
    maxTurns: options.maxTurns,
    phase: "briefing",
    archetypeId: options.archetypeId,
    experiment: options.experiment,
    resources: { ...BASE_RESOURCES },
    deposited: { money: 0, influence: 0, intelligence: 0, trust: 0, capacity: 0 },
    pressures: { stress: 12, panic: 8 },
    tracks: { engineering: 0, access: 0, legitimacy: 0, stability: 0 },
    institutions: 60,
    advisors: {
      analyst: createAdvisorState("analyst"),
      fixer: createAdvisorState("fixer"),
      steward: createAdvisorState("steward"),
    },
    advisorMemories: { analyst: [], fixer: [], steward: [] },
    corporation: {
      strategy: CORPORATION_STRATEGIES[firstRandom.value] ?? "expanding",
      progress: 8,
      threat: 15,
      lastMove: null,
    },
    activeCardId: null,
    deck: {
      drawCounts: {},
      lastDrawnTurn: {},
      addedCardIds: [],
      removedCardIds: [],
      cardSources: {},
    },
    cardHistory: [],
    decisionHistory: [],
    routes: {
      labor_coalition: {
        status: "unknown",
        discoveredSteps: [],
        openedByDecisionId: null,
        closedByDecisionId: null,
      },
      corporate_exposure: {
        status: "unknown",
        discoveredSteps: [],
        openedByDecisionId: null,
        closedByDecisionId: null,
      },
    },
    flags: [],
    systemModifiers: [],
    endingContributors: [],
    archetypeAbilityUsed: false,
    suppressNextIgnoredCard: false,
    consultation: null,
    history: [],
    ending: null,
    report: null,
  };

  applyArchetype(state);
  drawSituationCard(state);
  addHistory(state, "system", `${ARCHETYPES[state.archetypeId].name} run started.`);
  return state;
}

export function getActiveCard(state: GameState): SituationCard | null {
  if (!state.activeCardId) return null;
  return SITUATION_CARDS.find((card) => card.id === state.activeCardId) ?? null;
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

function emptyDecision(
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
    routesAdvanced: [],
    routesCompleted: [],
    routesClosed: [],
    endingContributors: [],
    systemModifiers: [],
    advisorMemories: [],
    linkedConsequences: 0,
    immediateDeltaScore: 0,
    pivotalScore: 0,
  };
}

function pushUnique(list: string[], value: string): void {
  if (!list.includes(value)) list.push(value);
}

function applyRouteChange(state: GameState, decision: DecisionRecord, change: RouteChange): void {
  const route = state.routes[change.routeId];
  if (change.stepId) pushUnique(route.discoveredSteps, change.stepId);
  if (change.effect === "open") {
    if (route.status !== "completed") route.status = "opened";
    route.openedByDecisionId = decision.id;
    pushUnique(decision.routesOpened, change.routeId);
  } else if (change.effect === "advance") {
    if (route.status === "unknown") route.status = "opened";
    pushUnique(decision.routesAdvanced, change.routeId);
  } else if (change.effect === "complete") {
    route.status = "completed";
    pushUnique(decision.routesCompleted, change.routeId);
  } else if (route.status !== "completed") {
    route.status = "closed";
    route.closedByDecisionId = decision.id;
    pushUnique(decision.routesClosed, change.routeId);
  }
}

function applySituationOutcome(
  state: GameState,
  card: SituationCard,
  choiceId: string,
  label: string,
  outcome: SituationOutcome,
): string {
  const before = cloneState(state);
  const decision = emptyDecision(state, "card", `${card.title}: ${label}`, card.id, choiceId);
  applyEffects(state, outcome.effects);

  if (state.archetypeId === "technocrat" && outcome.tags?.includes("opaque")) {
    state.resources.trust = clamp(state.resources.trust - 3);
    pushUnique(decision.endingContributors, "technocratic_opacity");
    pushUnique(state.endingContributors, "technocratic_opacity");
  }
  if (state.archetypeId === "populist" && outcome.tags?.includes("public_betrayal")) {
    state.pressures.panic = clamp(state.pressures.panic + 5);
    pushUnique(decision.endingContributors, "public_betrayal");
    pushUnique(state.endingContributors, "public_betrayal");
  }

  for (const flag of outcome.setFlags ?? []) {
    pushUnique(state.flags, flag);
    pushUnique(decision.flagsCreated, flag);
  }
  for (const flag of outcome.consumeFlags ?? []) {
    state.flags = state.flags.filter((candidate) => candidate !== flag);
    pushUnique(decision.flagsConsumed, flag);
  }

  pushUnique(decision.echoHints, outcome.echoHint);
  for (const echo of outcome.echoes) {
    pushUnique(decision.echoTypes, echo.type);
    pushUnique(decision.echoHints, echo.hint);
    if (echo.type === "card") {
      for (const cardId of echo.addCardIds ?? []) {
        pushUnique(state.deck.addedCardIds, cardId);
        state.deck.removedCardIds = state.deck.removedCardIds.filter((id) => id !== cardId);
        state.deck.cardSources[cardId] = decision.id;
        pushUnique(decision.cardsAdded, cardId);
      }
      for (const cardId of echo.removeCardIds ?? []) {
        pushUnique(state.deck.removedCardIds, cardId);
        state.deck.addedCardIds = state.deck.addedCardIds.filter((id) => id !== cardId);
        pushUnique(decision.cardsRemoved, cardId);
      }
    } else if (echo.type === "relationship") {
      pushUnique(state.advisorMemories[echo.advisorId], echo.memory);
      pushUnique(decision.advisorMemories, `${echo.advisorId}:${echo.memory}`);
    } else if (echo.type === "system") {
      pushUnique(state.systemModifiers, echo.modifier);
      pushUnique(decision.systemModifiers, echo.modifier);
    } else {
      pushUnique(state.endingContributors, echo.contributor);
      pushUnique(decision.endingContributors, echo.contributor);
    }
  }

  for (const change of outcome.routeChanges ?? []) applyRouteChange(state, decision, change);
  decision.immediateDeltaScore = calculateImmediateDeltaScore(before, state);
  state.decisionHistory.push(decision);

  const encounter = [...state.cardHistory].reverse().find(
    (candidate) => candidate.cardId === card.id && candidate.choiceId === null,
  );
  if (encounter) {
    encounter.choiceId = choiceId;
    encounter.outcomeId = `${card.id}:${choiceId}`;
  }
  addHistory(state, "card", decision.summary, { decisionId: decision.id });
  state.activeCardId = null;
  return decision.id;
}

function recordSimpleDecision(
  state: GameState,
  before: GameState,
  category: ActionCategory,
  summary: string,
): string {
  const decision = emptyDecision(state, category, summary);
  decision.immediateDeltaScore = calculateImmediateDeltaScore(before, state);
  state.decisionHistory.push(decision);
  addHistory(state, "player", summary, { decisionId: decision.id });
  return decision.id;
}

export function consultAdvisor(
  state: GameState,
  advisorId: AdvisorId,
  useArchetypeAbility = false,
): ActionResult {
  if (state.phase === "ended") return { state, accepted: false, error: "The run has ended." };
  if (state.phase !== "briefing") {
    return { state, accepted: false, error: "Only one consultation is allowed each turn." };
  }
  if (!state.advisors[advisorId].active) {
    return { state, accepted: false, error: "That advisor is no longer active." };
  }
  if (state.resources.intelligence < 2) {
    return { state, accepted: false, error: "Consultation requires 2 Intelligence." };
  }

  const next = cloneState(state);
  const before = cloneState(next);
  const advisor = next.advisors[advisorId];
  const definition = ADVISORS[advisorId];
  next.resources.intelligence -= 2;
  const leverageGain = next.archetypeId === "operator" ? 4 : 2;
  advisor.leverage = clamp(advisor.leverage + leverageGain);
  advisor.loyalty = clamp(advisor.loyalty + 1, 0, definition.loyaltyCeiling);

  let archetypeAbilityApplied = false;
  if (useArchetypeAbility && !next.archetypeAbilityUsed) {
    if (next.archetypeId === "populist" && advisorId === "steward" && next.resources.trust >= 6) {
      next.resources.trust -= 6;
      next.resources.influence = clamp(next.resources.influence + 9);
      next.archetypeAbilityUsed = true;
      archetypeAbilityApplied = true;
      const decisionId = recordSimpleDecision(
        next,
        before,
        "advisor",
        "The Steward converted public Trust into emergency Influence.",
      );
      next.decisionHistory.at(-1)?.echoHints.push("The public mandate has been spent, not erased.");
      next.decisionHistory.at(-1)?.echoTypes.push("ending");
      next.decisionHistory.at(-1)?.endingContributors.push("spent_public_mandate");
      pushUnique(next.endingContributors, "spent_public_mandate");
      addHistory(next, "advisor", "The public mandate was converted into political force.", { causedByDecisionId: decisionId });
    } else if (next.archetypeId === "operator" && advisorId === "fixer") {
      next.suppressNextIgnoredCard = true;
      advisor.leverage = clamp(advisor.leverage + 8);
      next.archetypeAbilityUsed = true;
      archetypeAbilityApplied = true;
      const decisionId = recordSimpleDecision(
        next,
        before,
        "advisor",
        "The Fixer received authority to contain the next ignored Situation Card.",
      );
      next.decisionHistory.at(-1)?.echoHints.push("The Fixer will remember the authority you granted.");
      next.decisionHistory.at(-1)?.echoTypes.push("relationship");
      next.decisionHistory.at(-1)?.advisorMemories.push("fixer:containment_authority");
      pushUnique(next.advisorMemories.fixer, "containment_authority");
      addHistory(next, "advisor", "Containment authority is ready.", { causedByDecisionId: decisionId });
    }
  }

  const technocratPrecision = next.archetypeId === "technocrat" && advisorId === "analyst";
  let predictedStrategy = next.corporation.strategy;
  let confidence: ConsultationResult["confidence"] = "high";
  if (!technocratPrecision) {
    const accuracy = clamp(advisor.competence + advisor.alignment * 0.2 - advisor.leverage * 0.35);
    const random = nextRandom(next.rngState);
    next.rngState = random.state;
    if (random.value * 100 > accuracy) {
      const alternate = CORPORATION_STRATEGIES.filter(
        (strategy) => strategy !== next.corporation.strategy,
      );
      const pick = randomInt(next.rngState, alternate.length);
      next.rngState = pick.state;
      predictedStrategy = alternate[pick.value] ?? "expanding";
    }
    confidence = accuracy >= 78 ? "high" : accuracy >= 58 ? "medium" : "low";
  }

  next.consultation = {
    advisorId,
    predictedStrategy,
    confidence,
    archetypeAbilityApplied,
    message: `${definition.name} predicts the Corporation is ${predictedStrategy.replace("_", " ")}.`,
  };
  next.phase = "consulted";
  addHistory(next, "advisor", next.consultation.message);
  return { state: next, accepted: true };
}

function depositCost(track: TrackKey, size: "standard" | "large"): ResourcePool {
  const multiplier = size === "large" ? 1.75 : 1;
  const cost = { ...DEPOSIT_COSTS[track] };
  for (const resource of RESOURCE_KEYS) cost[resource] = Math.ceil(cost[resource] * multiplier);
  return cost;
}

function canAfford(resources: ResourcePool, cost: ResourcePool): boolean {
  return RESOURCE_KEYS.every((resource) => resources[resource] >= cost[resource]);
}

function counterCost(state: GameState): { intelligence: number; influence: number } {
  return state.systemModifiers.includes("emergency_rule")
    ? { intelligence: 5, influence: 2 }
    : { intelligence: 7, influence: 3 };
}

function actionError(state: GameState, action: MajorAction): string | null {
  if (state.phase === "ended") return "The run has ended.";
  if (action.type === "deposit" && !canAfford(state.resources, depositCost(action.track, action.size))) {
    return "The deposit costs more resources than are available.";
  }
  if (action.type === "resolve_card") {
    const card = getActiveCard(state);
    if (!card) return "There is no active Situation Card.";
    if (!card.choices.some((choice) => choice.id === action.choiceId)) {
      return "That choice does not belong to the active Situation Card.";
    }
  }
  if (action.type === "counter_corporation") {
    const cost = counterCost(state);
    if (state.resources.intelligence < cost.intelligence || state.resources.influence < cost.influence) {
      return `Countering the Corporation requires ${cost.intelligence} Intelligence and ${cost.influence} Influence.`;
    }
  }
  if (action.type === "strengthen_faction" && state.resources.influence < 8) {
    return "Strengthening the coalition requires 8 Influence.";
  }
  if (action.type === "manage_advisor") {
    if (!state.advisors[action.advisorId].active) return "That advisor is no longer active.";
    if (state.resources.influence < 4) return "Managing an advisor requires 4 Influence.";
  }
  if (action.type === "protect_institutions" && (state.resources.money < 6 || state.resources.trust < 4)) {
    return "Protecting institutions requires 6 Money and 4 Trust.";
  }
  if (action.type === "activate_brb" && TRACK_KEYS.some((track) => state.tracks[track] < 50)) {
    return "Every BRB track must reach 50 before activation.";
  }
  return null;
}

function applyDeposit(state: GameState, track: TrackKey, size: "standard" | "large"): void {
  const cost = depositCost(track, size);
  for (const resource of RESOURCE_KEYS) {
    state.resources[resource] -= cost[resource];
    state.deposited[resource] += cost[resource];
  }
  state.tracks[track] = clamp(state.tracks[track] + (size === "large" ? 32 : 20));
  const sideEffect = size === "large" ? 2 : 1;
  if (track === "engineering") state.corporation.threat = clamp(state.corporation.threat + 3 * sideEffect);
  else if (track === "access") state.advisors.fixer.leverage = clamp(state.advisors.fixer.leverage + 3 * sideEffect);
  else if (track === "legitimacy") {
    state.corporation.threat = clamp(state.corporation.threat + 2 * sideEffect);
    state.pressures.stress = clamp(state.pressures.stress + 2 * sideEffect);
  } else {
    state.pressures.stress = clamp(state.pressures.stress - 3 * sideEffect);
    state.corporation.progress = clamp(state.corporation.progress + 2 * sideEffect);
  }
}

function resolveCard(state: GameState, choiceId: string): string | null {
  const card = getActiveCard(state);
  if (!card) return null;
  const choice = card.choices.find((item) => item.id === choiceId);
  if (!choice) return null;
  return applySituationOutcome(state, card, choice.id, choice.label, choice);
}

function applyIgnoredCard(state: GameState): string | null {
  const card = getActiveCard(state);
  if (!card) return null;
  if (state.suppressNextIgnoredCard) {
    state.suppressNextIgnoredCard = false;
    const synthetic: SituationOutcome = {
      effects: {},
      echoHint: "The Fixer contained the immediate damage and kept the file.",
      echoes: [{
        type: "relationship",
        hint: "The Fixer remembers the crisis that disappeared.",
        advisorId: "fixer",
        memory: `contained_${card.id}`,
      }],
    };
    return applySituationOutcome(state, card, "suppressed", "Contained by the Fixer", synthetic);
  }
  return applySituationOutcome(state, card, "ignored", "Ignored and escalated", card.ignoredOutcome);
}

function applyPlayerAction(state: GameState, action: MajorAction): {
  corporationBlocked: boolean;
  decisionId: string | null;
} {
  const before = cloneState(state);
  let corporationBlocked = false;
  let summary = "";
  if (action.type === "deposit") {
    applyDeposit(state, action.track, action.size);
    summary = `${action.size === "large" ? "Large" : "Standard"} ${action.track} deposit permanently committed.`;
  } else if (action.type === "resolve_card") {
    return { corporationBlocked, decisionId: resolveCard(state, action.choiceId) };
  } else if (action.type === "counter_corporation") {
    const cost = counterCost(state);
    state.resources.intelligence -= cost.intelligence;
    state.resources.influence -= cost.influence;
    corporationBlocked = action.predictedStrategy === state.corporation.strategy;
    if (corporationBlocked) {
      state.corporation.progress = clamp(state.corporation.progress - 8);
      state.corporation.threat = clamp(state.corporation.threat - 6);
      summary = `The ${action.predictedStrategy.replace("_", " ")} move was countered.`;
    } else {
      state.corporation.threat = clamp(state.corporation.threat + 5);
      summary = "The counter-operation targeted the wrong strategy.";
    }
  } else if (action.type === "strengthen_faction") {
    applyEffects(state, { resources: { influence: -8, trust: 6 }, institutions: 5 });
    summary = "The governing coalition was strengthened.";
  } else if (action.type === "manage_advisor") {
    state.resources.influence -= 4;
    state.advisors[action.advisorId].loyalty = clamp(state.advisors[action.advisorId].loyalty + 10);
    state.advisors[action.advisorId].leverage = clamp(state.advisors[action.advisorId].leverage - 6);
    summary = `${ADVISORS[action.advisorId].name} was brought back into line.`;
  } else if (action.type === "recover_resource") {
    const gain = action.resource === "capacity" ? 28 : 30;
    state.resources[action.resource] = clamp(state.resources[action.resource] + gain);
    state.pressures.stress = clamp(state.pressures.stress + 7);
    state.corporation.progress = clamp(state.corporation.progress + 3);
    summary = `${action.resource} was recovered while the Corporation used the delay.`;
  } else if (action.type === "protect_institutions") {
    applyEffects(state, {
      resources: { money: -6, trust: -4 },
      institutions: 11,
      pressures: { stress: -4, panic: -2 },
    });
    summary = "Institutional safeguards were reinforced.";
  } else {
    summary = "BRB activation was authorized.";
  }
  return {
    corporationBlocked,
    decisionId: recordSimpleDecision(state, before, getActionCategory(action), summary),
  };
}

export function getActionCategory(action: MajorAction): ActionCategory {
  if (action.type === "resolve_card") return "card";
  if (action.type === "counter_corporation") return "counter";
  if (action.type === "strengthen_faction") return "faction";
  if (action.type === "manage_advisor") return "advisor";
  if (action.type === "recover_resource") return "recover";
  if (action.type === "protect_institutions") return "institutions";
  if (action.type === "activate_brb") return "activate";
  return "deposit";
}

function applyAdvisorReactions(state: GameState, category: ActionCategory): void {
  for (const advisorId of Object.keys(ADVISORS) as AdvisorId[]) {
    const definition = ADVISORS[advisorId];
    const advisor = state.advisors[advisorId];
    if (!advisor.active) continue;
    if (definition.agenda.includes(category)) {
      advisor.alignment = clamp(advisor.alignment + 4);
      advisor.loyalty = clamp(advisor.loyalty + 1, 0, definition.loyaltyCeiling);
    } else advisor.alignment = clamp(advisor.alignment - 2);

    if (advisor.alignment < definition.breakingPoint || advisor.leverage >= 90) {
      advisor.active = false;
      addHistory(
        state,
        "advisor",
        advisor.leverage >= 90
          ? `${definition.name} used accumulated leverage to leave on their own terms.`
          : `${definition.name} resigned after a final policy break.`,
      );
    }
  }
}

function applyCorporationMove(state: GameState, blocked: boolean, causedByDecisionId: string | null): void {
  const strategy = state.corporation.strategy;
  state.corporation.lastMove = strategy;
  if (blocked) {
    addHistory(
      state,
      "corporation",
      `${CORPORATION_MOVES[strategy].name} failed.`,
      causedByDecisionId ? { causedByDecisionId } : undefined,
    );
    linkConsequence(state, causedByDecisionId);
    return;
  }
  applyEffects(state, CORPORATION_MOVES[strategy].effects);
  addHistory(
    state,
    "corporation",
    CORPORATION_MOVES[strategy].description,
    causedByDecisionId ? { causedByDecisionId } : undefined,
  );
  linkConsequence(state, causedByDecisionId);
}

function chooseCorporationStrategy(state: GameState, action: MajorAction): void {
  const scores: Record<CorporationStrategy, number> = {
    expanding: 5 + Math.max(0, 50 - state.corporation.progress) / 12,
    infiltrating: 4 + state.tracks.access / 12 + Math.max(0, 35 - state.resources.capacity) / 8,
    discrediting: 4 + state.tracks.legitimacy / 14 + Math.max(0, 40 - state.resources.trust) / 7,
    buying_influence: 4 + Math.max(0, 40 - state.resources.influence) / 7 + state.advisors.fixer.leverage / 25,
  };
  if (action.type === "deposit") {
    if (action.track === "engineering" || action.track === "access") scores.infiltrating += 5;
    if (action.track === "legitimacy") scores.discrediting += 5;
    if (action.track === "stability") scores.expanding += 5;
  }
  const random = nextRandom(state.rngState);
  state.rngState = random.state;
  const ranked = CORPORATION_STRATEGIES.map((strategy) => ({
    strategy,
    score: scores[strategy] + random.value * 2,
  })).sort((a, b) => b.score - a.score);
  state.corporation.strategy = ranked[0]?.strategy ?? "expanding";
}

function applyPressure(state: GameState): void {
  const depleted = RESOURCE_KEYS.filter((resource) => state.resources[resource] <= 15).length;
  state.pressures.stress = clamp(state.pressures.stress + depleted * 3 - (depleted === 0 ? 1 : 0));
  if (state.corporation.progress >= 60) state.pressures.panic = clamp(state.pressures.panic + 3);
  if (state.institutions <= 30) state.pressures.panic = clamp(state.pressures.panic + 4);
  if (state.pressures.stress >= 80) state.resources.trust = clamp(state.resources.trust - 4);
  if (state.systemModifiers.includes("emergency_rule")) state.institutions = clamp(state.institutions - 1);
}

function endingVariation(state: GameState, ending: Ending): {
  variationId: EndingVariationId | null;
  variationTitle: string | null;
} {
  if (!ending.victory) return { variationId: null, variationTitle: null };
  if (
    state.archetypeId === "technocrat" &&
    (state.endingContributors.includes("technocratic_opacity") || state.resources.trust < 30)
  ) {
    return { variationId: "perfect_machine_empty_state", variationTitle: "Perfect Machine, Empty State" };
  }
  if (
    state.archetypeId === "populist" &&
    state.routes.labor_coalition.status === "completed"
  ) {
    return { variationId: "crowd_presses_button", variationTitle: "The Crowd Presses the Button" };
  }
  if (
    state.archetypeId === "operator" &&
    (state.systemModifiers.includes("emergency_rule") || state.advisors.fixer.leverage >= 60)
  ) {
    return { variationId: "government_by_command", variationTitle: "Government by Command" };
  }
  return { variationId: null, variationTitle: null };
}

function makeEnding(id: Ending["id"], reason: string): Ending {
  return { ...ENDING_COPY[id], reason, variationId: null, variationTitle: null };
}

function endRun(state: GameState, ending: Ending): void {
  const variation = endingVariation(state, ending);
  ending.variationId = variation.variationId;
  ending.variationTitle = variation.variationTitle;
  state.ending = ending;
  state.phase = "ended";
  addHistory(state, "system", `${ending.variationTitle ?? ending.title}: ${ending.reason}`);
  state.report = buildDeclassifiedReport(state);
}

function activate(state: GameState): void {
  if (state.corporation.progress >= 80 || state.tracks.access < 50) {
    endRun(state, makeEnding("corporate_capture", "The Corporation held the decisive access point."));
    return;
  }
  const highestLeverage = Math.max(...Object.values(state.advisors).map((advisor) => advisor.leverage));
  const civicHistory =
    state.routes.labor_coalition.status === "completed" ||
    state.endingContributors.includes("public_testimony");
  if (
    state.tracks.legitimacy >= 75 &&
    state.tracks.stability >= 75 &&
    state.institutions >= 55 &&
    state.pressures.panic < 60 &&
    highestLeverage < 65 &&
    !state.systemModifiers.includes("emergency_rule") &&
    civicHistory
  ) {
    endRun(state, makeEnding("civic_legacy", "The project remained under durable public control."));
    return;
  }
  endRun(
    state,
    makeEnding("compromised_activation", "The BRB worked, but emergency arrangements became permanent."),
  );
}

function evaluateTerminalState(state: GameState): void {
  if (state.corporation.progress >= 100) {
    endRun(state, makeEnding("corporate_capture", "The Corporation completed its objective first."));
  } else if (state.pressures.panic >= 100 || state.institutions <= 0) {
    endRun(state, makeEnding("state_collapse", "The regime could no longer contain the political crisis."));
  } else if (Object.values(state.advisors).every((advisor) => !advisor.active)) {
    endRun(state, makeEnding("state_collapse", "No advisor remained willing to operate the government."));
  } else if (state.turn > state.maxTurns) {
    endRun(state, makeEnding("state_collapse", "The campaign reached its deadline before activation."));
  }
}

export function commitAction(state: GameState, action: MajorAction): ActionResult {
  const error = actionError(state, action);
  if (error) return { state, accepted: false, error };

  const next = cloneState(state);
  if (action.type === "activate_brb") {
    applyPlayerAction(next, action);
    activate(next);
    return { state: next, accepted: true };
  }

  const hadActiveCard = next.activeCardId !== null;
  const playerResult = applyPlayerAction(next, action);
  if (hadActiveCard && action.type !== "resolve_card") applyIgnoredCard(next);
  const category = getActionCategory(action);
  applyAdvisorReactions(next, category);
  applyCorporationMove(next, playerResult.corporationBlocked, playerResult.decisionId);
  applyPressure(next);
  chooseCorporationStrategy(next, action);

  next.turn += 1;
  next.consultation = null;
  next.phase = "briefing";
  evaluateTerminalState(next);
  if (!next.ending) drawSituationCard(next);
  return { state: next, accepted: true };
}

export function getValidActions(state: GameState): MajorAction[] {
  if (state.phase === "ended") return [];
  const actions: MajorAction[] = [];
  const card = getActiveCard(state);
  if (card) {
    actions.push(...card.choices.map((choice) => ({ type: "resolve_card" as const, choiceId: choice.id })));
  }
  for (const track of TRACK_KEYS) {
    for (const size of ["standard", "large"] as const) {
      const candidate: MajorAction = { type: "deposit", track, size };
      if (!actionError(state, candidate)) actions.push(candidate);
    }
  }
  for (const predictedStrategy of CORPORATION_STRATEGIES) {
    const candidate: MajorAction = { type: "counter_corporation", predictedStrategy };
    if (!actionError(state, candidate)) actions.push(candidate);
  }
  for (const advisorId of Object.keys(ADVISORS) as AdvisorId[]) {
    const candidate: MajorAction = { type: "manage_advisor", advisorId };
    if (!actionError(state, candidate)) actions.push(candidate);
  }
  for (const resource of RESOURCE_KEYS) actions.push({ type: "recover_resource", resource });
  for (const action of [
    { type: "strengthen_faction" },
    { type: "protect_institutions" },
    { type: "activate_brb" },
  ] as MajorAction[]) {
    if (!actionError(state, action)) actions.push(action);
  }
  return actions;
}

export function canUseArchetypeConsultation(state: GameState, advisorId: AdvisorId): boolean {
  if (state.archetypeAbilityUsed) return false;
  if (state.archetypeId === "populist") return advisorId === "steward" && state.resources.trust >= 6;
  if (state.archetypeId === "operator") return advisorId === "fixer";
  return false;
}

export function getBriefing(state: GameState): string[] {
  const card = getActiveCard(state);
  const weakestResource = RESOURCE_KEYS.reduce((lowest, key) =>
    state.resources[key] < state.resources[lowest] ? key : lowest,
  );
  return [
    `Turn ${state.turn} of ${state.maxTurns}`,
    card ? `${card.title}: ${card.description}` : "No Situation Card demands an immediate response.",
    `Weakest resource: ${weakestResource} (${state.resources[weakestResource]})`,
    `Corporation threat: ${state.corporation.threat}; activity estimate: ${state.corporation.strategy.replace("_", " ")}`,
  ];
}

export function serializeGame(state: GameState): string {
  return JSON.stringify(state);
}

export function deserializeGame(serialized: string): GameState {
  const parsed: unknown = JSON.parse(serialized);
  if (!parsed || typeof parsed !== "object" || !("version" in parsed) || parsed.version !== 2) {
    throw new Error("Unsupported or invalid BRB save.");
  }
  return parsed as GameState;
}

export const SITUATION_DECK_CARD_TYPES = CARD_TYPES;
export const PROTOTYPE_ROUTE_IDS = ROUTE_IDS;
