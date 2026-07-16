import {
  ARCHETYPES,
  CARD_APPEARANCE_CHANCE,
  FOLLOW_UP_CARD_IDS,
  SITUATION_CARDS,
} from "./content";
import { nextRandom } from "./rng";
import { applyRouteChange } from "./routes";
import {
  addHistory,
  applyEffects,
  clamp,
  cloneState,
  emptyDecision,
  linkConsequence,
  populateDecisionImpact,
  pushUnique,
} from "./state-helpers";
import type {
  CardEncounterStatus,
  CardRequirements,
  GameState,
  ResourceKey,
  SituationCard,
  SituationOutcome,
  TrackKey,
} from "./types";

function meetsCardRequirements(
  state: GameState,
  requirements: CardRequirements | undefined,
): boolean {
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

export function drawSituationCard(state: GameState): void {
  const appearanceRoll = nextRandom(state.rngState);
  state.rngState = appearanceRoll.state;
  if (appearanceRoll.value > CARD_APPEARANCE_CHANCE) {
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
    status: "presented",
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

export function getActiveCard(state: GameState): SituationCard | null {
  if (!state.activeCardId) return null;
  return SITUATION_CARDS.find((card) => card.id === state.activeCardId) ?? null;
}

function applySituationOutcome(
  state: GameState,
  card: SituationCard,
  choiceId: string,
  label: string,
  outcome: SituationOutcome,
  encounterStatus: CardEncounterStatus,
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
  populateDecisionImpact(decision, before, state);
  state.decisionHistory.push(decision);

  const encounter = [...state.cardHistory].reverse().find(
    (candidate) => candidate.cardId === card.id && candidate.choiceId === null,
  );
  if (encounter) {
    encounter.choiceId = choiceId;
    encounter.outcomeId = `${card.id}:${choiceId}`;
    encounter.status = encounterStatus;
  }
  addHistory(state, "card", decision.summary, { decisionId: decision.id });
  state.activeCardId = null;
  return decision.id;
}

export function resolveCard(state: GameState, choiceId: string): string | null {
  const card = getActiveCard(state);
  if (!card) return null;
  const choice = card.choices.find((item) => item.id === choiceId);
  if (!choice) return null;
  return applySituationOutcome(state, card, choice.id, choice.label, choice, "resolved");
}

export function applyIgnoredCard(state: GameState): string | null {
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
    return applySituationOutcome(state, card, "suppressed", "Contained by the Fixer", synthetic, "suppressed");
  }
  return applySituationOutcome(state, card, "ignored", "Ignored and escalated", card.ignoredOutcome, "ignored");
}

export function expireActiveCard(state: GameState): void {
  if (!state.activeCardId) return;
  const encounter = [...state.cardHistory].reverse().find(
    (candidate) => candidate.cardId === state.activeCardId && candidate.status === "presented",
  );
  if (encounter) {
    encounter.status = "expired";
    encounter.outcomeId = `${encounter.cardId}:expired`;
  }
  state.activeCardId = null;
}
