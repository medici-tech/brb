import { ARCHETYPES, CORPORATION_MOVES, SITUATION_CARDS } from "./content";
import { isLegacyDirectiveCompatible } from "./directives";
import { validateRouteIntegrity } from "./routes";
import { isDeclassifiedReport, isEnding } from "./persisted-data-validation";
import {
  ADVISOR_IDS,
  ECHO_TYPES,
  LEGACY_DIRECTIVE_IDS,
  RESOURCE_KEYS,
  ROUTE_IDS,
  TRACK_KEYS,
  type ArchetypeId,
  type GameState,
} from "./types";
import {
  hasRecordKeys,
  isAdvisorRecord,
  isBoolean,
  isFiniteNumber,
  isInteger,
  isMeter,
  isNonEmptyString,
  isNullableString,
  isOneOf,
  isPressurePool,
  isRecord,
  isResourcePool,
  isString,
  isStringArray,
  isTrackPool,
} from "./validation-primitives";

const ACTION_CATEGORIES = [
  "deposit",
  "card",
  "counter",
  "faction",
  "advisor",
  "recover",
  "institutions",
  "activate",
] as const;
const CARD_STATUSES = [
  "presented",
  "resolved",
  "ignored",
  "expired",
  "auto_resolved",
  "suppressed",
] as const;
const COMPLETION_TIERS = ["quiet", "watched", "contested", "severe", "critical"] as const;
const CONSEQUENCE_SOURCES = ["player", "advisor", "corporation", "card", "pressure", "system"] as const;
const PHASES = ["briefing", "consulted", "ended"] as const;
const ROUTE_EFFECTS = ["touch", "open", "advance", "complete", "close", "reopen"] as const;
const ROUTE_STATUSES = ["unseen", "touched", "open", "closed", "reopened", "completed"] as const;
const CORPORATION_STRATEGIES = Object.keys(CORPORATION_MOVES);
const ARCHETYPE_IDS = Object.keys(ARCHETYPES) as ArchetypeId[];
const CARD_IDS = SITUATION_CARDS.map((card) => card.id);
const CARD_ID_SET = new Set(CARD_IDS);
const CARD_CHOICES = new Map(
  SITUATION_CARDS.map((card) => [
    card.id,
    new Set([...card.choices.map((choice) => choice.id), "ignored", "suppressed"]),
  ]),
);
const SYSTEM_MODIFIERS = new Set([
  "accepted_delay",
  "replacement_contractors",
  "closed_oversight",
  "false_plan_in_circulation",
  "emergency_rule",
  "parallel_contractors",
  "capacity_drift",
]);
const STATIC_ADVISOR_MEMORIES = new Set([
  "protected_whistleblower",
  "contained_whistleblower",
  "protected_defector",
  "subjected_to_loyalty_audit",
  "shared_activation_authority",
  "ignored_coalition_vote",
  "ran_counter_lobby",
  "emergency_bill_vetoed",
  "silent_partner_channel",
  "containment_authority",
]);

function isNumericPartialRecord(value: unknown, keys: readonly string[]): boolean {
  return isRecord(value)
    && Object.entries(value).every(([key, item]) => keys.includes(key) && isFiniteNumber(item));
}

function isAdvisorDelta(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return Object.entries(value).every(([key, item]) =>
    key === "active" ? isBoolean(item) : ["loyalty", "alignment", "leverage", "competence"].includes(key)
      && isFiniteNumber(item),
  );
}

function isStateDelta(value: unknown): boolean {
  return isRecord(value)
    && isNumericPartialRecord(value.resources, RESOURCE_KEYS)
    && isNumericPartialRecord(value.pressures, ["stress", "panic"])
    && isNumericPartialRecord(value.tracks, TRACK_KEYS)
    && (value.institutions === undefined || isFiniteNumber(value.institutions))
    && (value.corporationProgress === undefined || isFiniteNumber(value.corporationProgress))
    && (value.corporationThreat === undefined || isFiniteNumber(value.corporationThreat))
    && isRecord(value.advisors)
    && Object.entries(value.advisors).every(
      ([advisorId, delta]) => ADVISOR_IDS.includes(advisorId as (typeof ADVISOR_IDS)[number])
        && isAdvisorDelta(delta),
    );
}

function isResolvedEffect(value: unknown): boolean {
  return isRecord(value) && isNonEmptyString(value.label) && isStateDelta(value.delta);
}

function isNullableResolvedEffect(value: unknown): boolean {
  return value === null || isResolvedEffect(value);
}

function isTurnResolution(value: unknown): boolean {
  return isRecord(value)
    && isInteger(value.month, 1)
    && isNullableResolvedEffect(value.ignoredSituation)
    && isResolvedEffect(value.commitment)
    && isNullableResolvedEffect(value.advisorReactions)
    && isNullableResolvedEffect(value.corporationResponse)
    && isNullableResolvedEffect(value.monthlyPressure);
}

function isMeterAudit(value: unknown): boolean {
  return isRecord(value)
    && ["before", "after", "actionOrCard", "corporationResponse", "basePressure", "completionPressure"]
      .every((key) => isFiniteNumber(value[key]));
}

function isMonthAudit(value: unknown): boolean {
  return isRecord(value)
    && isInteger(value.month, 1)
    && isOneOf(value.pressureTier, COMPLETION_TIERS)
    && isInteger(value.corporationResponseIntervalMonths, 1)
    && isBoolean(value.corporationResponded)
    && isMeterAudit(value.corporationProgress)
    && isMeterAudit(value.panic);
}

function isCardEncounter(value: unknown): boolean {
  if (!isRecord(value) || !isString(value.cardId) || !CARD_ID_SET.has(value.cardId)) return false;
  if (!isInteger(value.turn, 1) || !isNullableString(value.choiceId) || !isNullableString(value.outcomeId)) {
    return false;
  }
  if (!isNullableString(value.causedByDecisionId) || !isOneOf(value.status, CARD_STATUSES)) return false;
  return value.choiceId === null || CARD_CHOICES.get(value.cardId)?.has(value.choiceId) === true;
}

function isDecisionSubject(value: unknown): boolean {
  if (value === null) return true;
  if (!isRecord(value) || !isNonEmptyString(value.kind)) return false;
  switch (value.kind) {
    case "card":
      return isNonEmptyString(value.cardId)
        && CARD_ID_SET.has(value.cardId)
        && isNonEmptyString(value.choiceId)
        && (CARD_CHOICES.get(value.cardId)?.has(value.choiceId) ?? false);
    case "deposit":
      return isOneOf(value.track, TRACK_KEYS)
        && isOneOf(value.size, ["standard", "large"] as const);
    case "counter":
      return isOneOf(value.strategy, CORPORATION_STRATEGIES)
        && isOneOf(value.outcome, ["correct", "wrong"] as const);
    case "advisor":
    case "consult":
      return isOneOf(value.advisorId, ADVISOR_IDS);
    case "recover":
      return isOneOf(value.resource, RESOURCE_KEYS);
    case "faction":
    case "institutions":
    case "activate":
      return true;
    default:
      return false;
  }
}

function isDecision(value: unknown): boolean {
  if (!isRecord(value)
    || !isNonEmptyString(value.id)
    || !isInteger(value.turn, 1)
    || !isOneOf(value.category, ACTION_CATEGORIES)
    || !isNonEmptyString(value.summary)
    || !isNullableString(value.cardId)
    || !isNullableString(value.choiceId)) {
    return false;
  }
  // `subject` is additive: absent on legacy saves, null or structured on new ones.
  if ("subject" in value && !isDecisionSubject(value.subject)) return false;
  if (value.cardId !== null && !CARD_ID_SET.has(value.cardId)) return false;
  const routeLists = [
    value.routesOpened,
    value.routesReopened,
    value.routesAdvanced,
    value.routesCompleted,
    value.routesClosed,
  ];
  if (!routeLists.every((list) => isStringArray(list, (item) => isOneOf(item, ROUTE_IDS)))) return false;
  if (!isStringArray(value.echoHints)
    || !isStringArray(value.echoTypes, (item) => isOneOf(item, ECHO_TYPES))
    || !isStringArray(value.flagsCreated)
    || !isStringArray(value.flagsConsumed)
    || !isStringArray(value.cardsAdded, (item) => CARD_ID_SET.has(item))
    || !isStringArray(value.cardsRemoved, (item) => CARD_ID_SET.has(item))
    || !isStringArray(value.endingContributors)
    || !isStringArray(value.systemModifiers, (item) => SYSTEM_MODIFIERS.has(item))
    || !isStringArray(value.advisorMemories)) {
    return false;
  }
  return [
    "linkedConsequences",
    "immediateDeltaScore",
    "persistentImpactScore",
    "corporationImpactScore",
    "resourceOpportunityCost",
    "irreversibilityScore",
    "narrativeScore",
    "strategicScore",
    "finalTurningPointScore",
    "pivotalScore",
  ].every((key) => isFiniteNumber(value[key]) && Number(value[key]) >= 0);
}

function isRouteTransition(value: unknown): boolean {
  return isRecord(value)
    && isOneOf(value.from, ROUTE_STATUSES)
    && isOneOf(value.to, ROUTE_STATUSES)
    && isOneOf(value.effect, ROUTE_EFFECTS)
    && isNonEmptyString(value.decisionId)
    && isInteger(value.turn, 1)
    && isNullableString(value.stepId)
    && isString(value.reason);
}

function isRouteState(value: unknown): boolean {
  return isRecord(value)
    && isOneOf(value.status, ROUTE_STATUSES)
    && isStringArray(value.discoveredSteps)
    && [
      "touchedByDecisionId",
      "openedByDecisionId",
      "closedByDecisionId",
      "reopenedByDecisionId",
      "completedByDecisionId",
    ].every((key) => isNullableString(value[key]))
    && [
      "touchedTurn",
      "openedTurn",
      "closedTurn",
      "reopenedTurn",
      "completedTurn",
    ].every((key) => value[key] === null || isInteger(value[key], 1))
    && Array.isArray(value.transitions)
    && value.transitions.every(isRouteTransition)
    && validateRouteIntegrity(
      value as unknown as GameState["routes"][(typeof ROUTE_IDS)[number]],
    ).length === 0;
}

function isConsultation(value: unknown): boolean {
  return isRecord(value)
    && isOneOf(value.advisorId, ADVISOR_IDS)
    && isNonEmptyString(value.message)
    && isOneOf(value.predictedStrategy, CORPORATION_STRATEGIES)
    && isOneOf(value.confidence, ["low", "medium", "high"] as const)
    && isBoolean(value.archetypeAbilityApplied);
}

function isKnownMemory(memory: string): boolean {
  return STATIC_ADVISOR_MEMORIES.has(memory)
    || (memory.startsWith("contained_") && CARD_ID_SET.has(memory.slice("contained_".length)));
}

function isDeck(value: unknown): boolean {
  if (!isRecord(value)
    || !isRecord(value.drawCounts)
    || !isRecord(value.lastDrawnTurn)
    || !isStringArray(value.addedCardIds, (item) => CARD_ID_SET.has(item))
    || !isStringArray(value.removedCardIds, (item) => CARD_ID_SET.has(item))
    || !isRecord(value.cardSources)) {
    return false;
  }
  return Object.entries(value.drawCounts).every(([id, count]) => CARD_ID_SET.has(id) && isInteger(count, 0))
    && Object.entries(value.lastDrawnTurn).every(([id, turn]) => CARD_ID_SET.has(id) && isInteger(turn, 1))
    && Object.entries(value.cardSources).every(([id, source]) =>
      CARD_ID_SET.has(id) && isNonEmptyString(source),
    );
}

export function isGameState(value: unknown): value is GameState {
  if (!isRecord(value)
    || value.version !== 5
    || !isNonEmptyString(value.runId)
    || !isInteger(value.seed, 0)
    || !isInteger(value.rngState, 0)
    || !isInteger(value.turn, 1)
    || !isOneOf(value.phase, PHASES)
    || !isOneOf(value.archetypeId, ARCHETYPE_IDS)
    || !isRecord(value.legacyDirective)
    || !(value.legacyDirective.equippedId === null
      || isOneOf(value.legacyDirective.equippedId, LEGACY_DIRECTIVE_IDS))
    || !isBoolean(value.legacyDirective.used)
    || !(value.legacyDirective.usedOnDecisionId === null
      || isNonEmptyString(value.legacyDirective.usedOnDecisionId))
    || (value.legacyDirective.used
      ? value.legacyDirective.equippedId === null
        || value.legacyDirective.usedOnDecisionId === null
      : value.legacyDirective.usedOnDecisionId !== null)
    || !(value.experiment === null || isString(value.experiment))
    || !isResourcePool(value.resources)
    || !isResourcePool(value.deposited, true)
    || !isPressurePool(value.pressures)
    || !isTrackPool(value.tracks)
    || !isMeter(value.institutions)
    || !isAdvisorRecord(value.advisors)
    || !isAdvisorRecord(value.advisorMemories, (memories) =>
      isStringArray(memories, isKnownMemory),
    )) {
    return false;
  }
  if (!isRecord(value.corporation)
    || !isOneOf(value.corporation.strategy, CORPORATION_STRATEGIES)
    || !isMeter(value.corporation.progress)
    || !isMeter(value.corporation.threat)
    || !(value.corporation.lastMove === null
      || isOneOf(value.corporation.lastMove, CORPORATION_STRATEGIES))
    || !isInteger(value.corporation.lastResponseMonth, 0)
    || !(value.lastMonthAudit === null || isMonthAudit(value.lastMonthAudit))
    || !(value.lastTurnResolution === null || isTurnResolution(value.lastTurnResolution))
    || !(value.activeCardId === null
      || (isString(value.activeCardId) && CARD_ID_SET.has(value.activeCardId)))
    || !isDeck(value.deck)
    || !Array.isArray(value.cardHistory)
    || !value.cardHistory.every(isCardEncounter)
    || !Array.isArray(value.decisionHistory)
    || !value.decisionHistory.every(isDecision)
    || !hasRecordKeys(value.routes, ROUTE_IDS, isRouteState)
    || !isStringArray(value.flags)
    || !isStringArray(value.systemModifiers, (item) => SYSTEM_MODIFIERS.has(item))
    || !isStringArray(value.endingContributors)
    || !isBoolean(value.archetypeAbilityUsed)
    || !isBoolean(value.suppressNextIgnoredCard)
    || !(value.consultation === null || isConsultation(value.consultation))
    || !Array.isArray(value.history)
    || !value.history.every((entry) =>
      isRecord(entry)
      && isInteger(entry.turn, 1)
      && isOneOf(entry.source, CONSEQUENCE_SOURCES)
      && isNonEmptyString(entry.message)
      && (entry.decisionId === undefined || isNonEmptyString(entry.decisionId))
      && (entry.causedByDecisionId === undefined || isNonEmptyString(entry.causedByDecisionId)))
    || !(value.ending === null || isEnding(value.ending))
    || !(value.report === null || isDeclassifiedReport(value.report))) {
    return false;
  }

  if ((value.phase === "ended") !== (value.ending !== null && value.report !== null)) return false;
  if (value.phase !== "consulted" && value.consultation !== null) return false;
  if (value.report && value.report.runId !== value.runId) return false;
  if (!isLegacyDirectiveCompatible(
    value.archetypeId,
    value.legacyDirective.equippedId,
  )) return false;

  const state = value as unknown as GameState;
  const decisionIds = new Set(state.decisionHistory.map((decision) => decision.id));
  if (decisionIds.size !== state.decisionHistory.length) return false;
  const knownDecision = (id: unknown) => id === null
    || id === undefined
    || (isString(id) && decisionIds.has(id));
  if (!Object.values(state.deck.cardSources).every(knownDecision)) return false;
  if (!knownDecision(state.legacyDirective.usedOnDecisionId)) return false;
  if (!state.cardHistory.every((encounter) => knownDecision(encounter.causedByDecisionId))) return false;
  if (!state.history.every((entry) =>
    knownDecision(entry.decisionId) && knownDecision(entry.causedByDecisionId))) return false;

  for (const route of Object.values(state.routes)) {
    if (!route.transitions.every((transition) => decisionIds.has(transition.decisionId))) return false;
    if (![
      route.touchedByDecisionId,
      route.openedByDecisionId,
      route.closedByDecisionId,
      route.reopenedByDecisionId,
      route.completedByDecisionId,
    ].every(knownDecision)) return false;
  }
  if (state.report) {
    const pivotIds = [
      state.report.pivotalDecision.decisionId,
      state.report.narrativePivot.decisionId,
      state.report.strategicPivot.decisionId,
      state.report.finalTurningPoint.decisionId,
    ];
    if (!pivotIds.every((id) => id === "system-no-decision" || decisionIds.has(id))) return false;
  }
  return true;
}

export function assertGameState(value: unknown): asserts value is GameState {
  if (!isGameState(value)) throw new Error("Unsupported or invalid BRB save.");
}
