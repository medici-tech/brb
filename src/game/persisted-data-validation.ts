import { ARCHETYPES, SITUATION_CARDS } from "./content";
import {
  ADVISOR_IDS,
  ARCHIVE_SCAR_IDS,
  ENDING_IDS,
  LEGACY_DIRECTIVE_IDS,
  ROUTE_IDS,
  type ArchiveV1,
  type ArchiveV0,
  type DeclassifiedReport,
  type ReplayIntent,
} from "./types";
import {
  hasRecordKeys,
  isAdvisorRecord,
  isBoolean,
  isFiniteNumber,
  isInteger,
  isMeter,
  isNonEmptyString,
  isOneOf,
  isPressurePool,
  isRecord,
  isResourcePool,
  isStringArray,
  isTrackPool,
} from "./validation-primitives";

const ARCHETYPE_IDS = Object.keys(ARCHETYPES);
const ENDING_VARIATIONS = [
  "perfect_machine_empty_state",
  "crowd_presses_button",
  "government_by_command",
] as const;
const CARD_ID_SET = new Set(SITUATION_CARDS.map((card) => card.id));
const CARD_CHOICES = new Map(
  SITUATION_CARDS.map((card) => [
    card.id,
    new Set([...card.choices.map((choice) => choice.id), "ignored", "suppressed"]),
  ]),
);

function isLegacyDirectiveRunState(value: unknown): boolean {
  return isRecord(value)
    && (value.equippedId === null || isOneOf(value.equippedId, LEGACY_DIRECTIVE_IDS))
    && isBoolean(value.used)
    && (value.usedOnDecisionId === null || isNonEmptyString(value.usedOnDecisionId))
    && (value.used ? value.equippedId !== null && value.usedOnDecisionId !== null : value.usedOnDecisionId === null);
}

export function isEnding(value: unknown): boolean {
  return isRecord(value)
    && isOneOf(value.id, ENDING_IDS)
    && isNonEmptyString(value.title)
    && isNonEmptyString(value.description)
    && isBoolean(value.victory)
    && isNonEmptyString(value.reason)
    && (value.variationId === null || isOneOf(value.variationId, ENDING_VARIATIONS))
    && (value.variationTitle === null || isNonEmptyString(value.variationTitle));
}

function isPivot(value: unknown): boolean {
  return isRecord(value)
    && isNonEmptyString(value.decisionId)
    && isInteger(value.turn, 1)
    && isNonEmptyString(value.summary)
    && isFiniteNumber(value.score)
    && value.score >= 0
    && isStringArray(value.echoHints);
}

function isReportSnapshot(value: unknown): boolean {
  return isRecord(value)
    && isResourcePool(value.resources)
    && isPressurePool(value.pressures)
    && isTrackPool(value.tracks)
    && isMeter(value.institutions)
    && isRecord(value.corporation)
    && isMeter(value.corporation.progress)
    && isMeter(value.corporation.threat)
    && isAdvisorRecord(value.advisors, (advisor) =>
      isRecord(advisor)
      && isBoolean(advisor.active)
      && isMeter(advisor.alignment)
      && isMeter(advisor.loyalty)
      && isMeter(advisor.leverage),
    );
}

export function isDeclassifiedReport(
  value: unknown,
): value is DeclassifiedReport {
  if (
    !isRecord(value)
    || !isInteger(value.rulesVersion, 0)
    || !isNonEmptyString(value.runId)
    || !isInteger(value.seed, 0)
    || !isOneOf(value.archetypeId, ARCHETYPE_IDS)
    || !isLegacyDirectiveRunState(value.legacyDirective)
    || !isEnding(value.ending)
    || !isPivot(value.pivotalDecision)
    || !isPivot(value.narrativePivot)
    || !isPivot(value.strategicPivot)
    || !isPivot(value.finalTurningPoint)
    || !(value.completedRoute === null || isOneOf(value.completedRoute, ROUTE_IDS))
    || !isNonEmptyString(value.suggestedExperiment)
    || !(value.finalSnapshot === null || isReportSnapshot(value.finalSnapshot))
  ) {
    return false;
  }
  return isRecord(value.unseenRouteHint)
    && (
      value.unseenRouteHint.routeId === null
      || isOneOf(value.unseenRouteHint.routeId, ROUTE_IDS)
    )
    && isNonEmptyString(value.unseenRouteHint.label)
    && isNonEmptyString(value.unseenRouteHint.message)
    && isOneOf(
      value.unseenRouteHint.visibility,
      ["classified", "partial"] as const,
    );
}

export function isArchiveV0(value: unknown): value is ArchiveV0 {
  if (
    !isRecord(value)
    || value.version !== 0
    || !isStringArray(value.processedRunIds, isNonEmptyString)
    || new Set(value.processedRunIds).size !== value.processedRunIds.length
    || !isRecord(value.cards)
    || !isRecord(value.endings)
    || !hasRecordKeys(value.routes, ROUTE_IDS, (route) =>
      isRecord(route)
      && isInteger(route.highestStep, 0)
      && isBoolean(route.completed),
    )
  ) {
    return false;
  }
  const cardsValid = Object.entries(value.cards).every(([cardId, record]) =>
    CARD_ID_SET.has(cardId)
    && isRecord(record)
    && isInteger(record.encounters, 0)
    && isRecord(record.choices)
    && Object.entries(record.choices).every(([choiceId, count]) =>
      CARD_CHOICES.get(cardId)?.has(choiceId) === true && isInteger(count, 0),
    )
    && isStringArray(record.outcomes),
  );
  return cardsValid && Object.entries(value.endings).every(
    ([endingId, count]) => isOneOf(endingId, ENDING_IDS) && isInteger(count, 0),
  );
}

export function isArchiveV1(value: unknown): value is ArchiveV1 {
  if (
    !isRecord(value)
    || value.version !== 1
    || !isStringArray(value.processedRunIds, isNonEmptyString)
    || new Set(value.processedRunIds).size !== value.processedRunIds.length
    || !isRecord(value.cards)
    || !isRecord(value.endings)
    || !hasRecordKeys(value.routes, ROUTE_IDS, (route) =>
      isRecord(route)
      && isInteger(route.highestStep, 0)
      && isBoolean(route.completed),
    )
    || !isInteger(value.clearance, 0)
    || !isInteger(value.rewardRngState, 0)
    || !isStringArray(value.unlockedDirectiveIds, (id) =>
      isOneOf(id, LEGACY_DIRECTIVE_IDS),
    )
    || new Set(value.unlockedDirectiveIds).size !== value.unlockedDirectiveIds.length
    || !(
      value.pendingDirectiveDraft === null
      || (
        isRecord(value.pendingDirectiveDraft)
        && isStringArray(value.pendingDirectiveDraft.candidateIds, (id) =>
          isOneOf(id, LEGACY_DIRECTIVE_IDS)
          && !(value.unlockedDirectiveIds as unknown[]).includes(id),
        )
        && value.pendingDirectiveDraft.candidateIds.length > 0
        && value.pendingDirectiveDraft.candidateIds.length <= 3
        && new Set(value.pendingDirectiveDraft.candidateIds).size
          === value.pendingDirectiveDraft.candidateIds.length
      )
    )
    || !(
      value.pendingScar === null
      || isOneOf(value.pendingScar, ARCHIVE_SCAR_IDS)
    )
  ) {
    return false;
  }
  const cardsValid = Object.entries(value.cards).every(([cardId, record]) =>
    CARD_ID_SET.has(cardId)
    && isRecord(record)
    && isInteger(record.encounters, 0)
    && isRecord(record.choices)
    && Object.entries(record.choices).every(([choiceId, count]) =>
      CARD_CHOICES.get(cardId)?.has(choiceId) === true && isInteger(count, 0),
    )
    && isStringArray(record.outcomes),
  );
  return cardsValid && Object.entries(value.endings).every(
    ([endingId, count]) => isOneOf(endingId, ENDING_IDS) && isInteger(count, 0),
  );
}

export function isReplayIntent(value: unknown): value is ReplayIntent {
  return isRecord(value)
    && isOneOf(value.mode, ["same_seed", "fresh_seed"] as const)
    && isInteger(value.seed, 0)
    && isOneOf(value.archetypeId, ARCHETYPE_IDS)
    && isNonEmptyString(value.experiment)
    && (value.legacyDirectiveId === null
      || isOneOf(value.legacyDirectiveId, LEGACY_DIRECTIVE_IDS));
}

export function assertArchiveV0(value: unknown): asserts value is ArchiveV0 {
  if (!isArchiveV0(value)) {
    throw new Error("Unsupported or invalid BRB Archive.");
  }
}

export function assertArchiveV1(value: unknown): asserts value is ArchiveV1 {
  if (!isArchiveV1(value)) {
    throw new Error("Unsupported or invalid BRB Archive.");
  }
}

export function assertDeclassifiedReport(
  value: unknown,
): asserts value is DeclassifiedReport {
  if (!isDeclassifiedReport(value)) throw new Error("Invalid BRB report.");
}

export function assertReplayIntent(
  value: unknown,
): asserts value is ReplayIntent {
  if (!isReplayIntent(value)) throw new Error("Invalid replay intent.");
}
