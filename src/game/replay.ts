import { ROUTE_DEFINITIONS, SITUATION_CARDS } from "./content";
import {
  drawLegacyDirectiveDraft,
  INITIAL_DIRECTIVE_REWARD_SEED,
} from "./directives";
import {
  ADVISOR_IDS,
  LEGACY_DIRECTIVE_IDS,
  ROUTE_IDS,
  type ArchiveScarId,
  type ArchiveV1,
  type ArchiveV0,
  type DeclassifiedReport,
  type DecisionRecord,
  type EndingId,
  type GameState,
  type LegacyDirectiveId,
  type ReplayIntent,
  type ReportFinalSnapshot,
  type RouteId,
  type UnseenRouteHint,
} from "./types";
import { assertArchiveV0, assertArchiveV1 } from "./persisted-data-validation";
import { isRecord } from "./validation-primitives";

export const REPORT_RULES_VERSION = 2;

/** Panic added at the start of the next campaign after Necessary Regime. */
export const NECESSARY_REGIME_AFTERMATH_PANIC = 6;

export function getClearanceGainForEnding(endingId: EndingId): number {
  if (endingId === "civic_legacy") return 3;
  if (endingId === "compromised_activation") return 2;
  return 1;
}

export function getEndingResultLabel(endingId: EndingId): string {
  if (endingId === "civic_legacy") return "VICTORY · CIVIC LEGACY";
  if (endingId === "compromised_activation") return "VICTORY · COMPROMISED";
  return "LOSS";
}

export function consumePendingScar(archive: ArchiveV1): ArchiveV1 {
  if (archive.pendingScar === null) return archive;
  const next = structuredClone(archive);
  next.pendingScar = null;
  return next;
}

function routeCompletionIsValid(state: GameState, routeId: RouteId): boolean {
  const route = state.routes[routeId];
  if (route.status !== "completed" || !route.completedByDecisionId || route.completedTurn === null) return false;
  const completion = [...route.transitions].reverse().find((transition) => transition.effect === "complete");
  return completion?.from === "open" || completion?.from === "reopened";
}

export function scoreDecision(decision: DecisionRecord): number {
  return (
    (decision.routesOpened.length + decision.routesReopened.length + decision.routesClosed.length) * 40 +
    (decision.routesAdvanced.length + decision.routesCompleted.length) * 30 +
    (decision.cardsAdded.length + decision.cardsRemoved.length) * 20 +
    decision.endingContributors.length * 20 +
    decision.systemModifiers.length * 15 +
    decision.advisorMemories.length * 10 +
    decision.linkedConsequences * 5 +
    Math.min(15, decision.immediateDeltaScore)
  );
}

export function scoreStrategicDecision(decision: DecisionRecord): number {
  const routeImpact =
    decision.routesOpened.length +
    decision.routesReopened.length +
    decision.routesAdvanced.length +
    decision.routesCompleted.length +
    decision.routesClosed.length;
  return Math.round(
    Math.min(20, decision.immediateDeltaScore) +
    Math.min(20, decision.persistentImpactScore) +
    routeImpact * 20 +
    decision.endingContributors.length * 15 +
    (decision.cardsAdded.length + decision.cardsRemoved.length) * 10 +
    Math.min(20, decision.corporationImpactScore * 1.5) +
    Math.min(12, decision.irreversibilityScore * 0.15) +
    decision.advisorMemories.length * 8 +
    decision.systemModifiers.length * 15,
  );
}

function scoreFinalTurningPoint(decision: DecisionRecord): number {
  return (
    scoreStrategicDecision(decision) +
    decision.endingContributors.length * 20 +
    decision.routesCompleted.length * 20 +
    decision.linkedConsequences * 5
  );
}

function fallbackDecision(state: GameState): DecisionRecord {
  return {
    id: "system-no-decision",
    turn: state.turn,
    category: "activate",
    summary: "The campaign ended before a major decision could be recorded.",
    cardId: null,
    choiceId: null,
    subject: { kind: "activate" },
    echoHints: ["The unopened Situation Deck remains classified."],
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

type ScoredDecision = {
  decision: DecisionRecord;
  score: number;
};

function selectPivotalDecisions(state: GameState): {
  narrative: ScoredDecision;
  strategic: ScoredDecision;
  finalTurningPoint: ScoredDecision;
} {
  const fallback = fallbackDecision(state);
  const narrative = state.decisionHistory
    .map((decision) => ({ decision, score: scoreDecision(decision) }))
    .sort((a, b) => b.score - a.score || a.decision.turn - b.decision.turn)[0]
    ?? { decision: fallback, score: 0 };
  const strategic = state.decisionHistory
    .map((decision) => ({ decision, score: scoreStrategicDecision(decision) }))
    .sort((a, b) => b.score - a.score || a.decision.turn - b.decision.turn)[0]
    ?? { decision: fallback, score: 0 };
  const finalWindowStart = Math.max(1, state.turn - 5);
  const lateDecisions = state.decisionHistory.filter((decision) => decision.turn >= finalWindowStart);
  const finalTurningPoint = (lateDecisions.length > 0 ? lateDecisions : state.decisionHistory)
    .map((decision) => ({ decision, score: scoreFinalTurningPoint(decision) }))
    .sort((a, b) => b.score - a.score || b.decision.turn - a.decision.turn)[0]
    ?? { decision: fallback, score: 0 };
  return { narrative, strategic, finalTurningPoint };
}

function asPivot(decision: DecisionRecord, score: number): DeclassifiedReport["pivotalDecision"] {
  return {
    decisionId: decision.id,
    turn: decision.turn,
    summary: decision.summary,
    score,
    echoHints: [...decision.echoHints],
  };
}

function chooseUnseenRouteHint(state: GameState, pivotal: DecisionRecord): UnseenRouteHint {
  const closedByPivotal = ROUTE_IDS.find(
    (routeId) =>
      state.routes[routeId].status === "closed" &&
      state.routes[routeId].closedByDecisionId === pivotal.id,
  );
  const incomplete = ROUTE_IDS.find(
    (routeId) =>
      state.routes[routeId].status === "open" ||
      state.routes[routeId].status === "reopened" ||
      state.routes[routeId].status === "touched" ||
      (state.routes[routeId].status === "closed" && state.routes[routeId].discoveredSteps.length > 0),
  );
  const routeId = closedByPivotal ?? incomplete;
  if (routeId) {
    const route = ROUTE_DEFINITIONS[routeId];
    return {
      routeId,
      label: route.label,
      message: route.partialHint,
      visibility: "partial",
    };
  }

  const untouched = ROUTE_IDS.find((id) => state.routes[id].status === "unseen") ?? "labor_coalition";
  return {
    routeId: null,
    label: "████████ — CLASSIFIED",
    message: ROUTE_DEFINITIONS[untouched].classifiedHint,
    visibility: "classified",
  };
}

function suggestedExperiment(
  state: GameState,
  pivotal: DecisionRecord,
  hint: UnseenRouteHint,
): string {
  if (hint.routeId === "labor_coalition") {
    return "Reach Gate Seven and support the organizers without suppressing the national march.";
  }
  if (hint.routeId === "corporate_exposure") {
    return "Follow the audit discrepancy and expose the hidden contractor before activation.";
  }
  if (pivotal.cardId) {
    const card = SITUATION_CARDS.find((candidate) => candidate.id === pivotal.cardId);
    return card
      ? `Return to “${card.title}” and choose the road left unopened.`
      : "Change the pivotal Situation Card decision and follow its echo.";
  }
  if (pivotal.category === "deposit") {
    return `Delay the Month ${pivotal.turn} deposit and answer the political pressure first.`;
  }
  if (state.archetypeId === "technocrat") return "Activate without using an opaque solution.";
  if (state.archetypeId === "populist") return "Reach activation without betraying a public promise.";
  return "Reach activation without giving the Fixer decisive leverage.";
}

export function buildDeclassifiedReport(state: GameState): DeclassifiedReport {
  if (!state.ending) throw new Error("A Declassified Report requires a completed run.");
  const pivots = selectPivotalDecisions(state);
  const hint = chooseUnseenRouteHint(state, pivots.narrative.decision);
  const completedRoute = ROUTE_IDS.find((id) => routeCompletionIsValid(state, id)) ?? null;
  const narrativePivot = asPivot(pivots.narrative.decision, pivots.narrative.score);
  const finalSnapshot: ReportFinalSnapshot = {
    resources: structuredClone(state.resources),
    pressures: structuredClone(state.pressures),
    tracks: structuredClone(state.tracks),
    institutions: state.institutions,
    corporation: {
      progress: state.corporation.progress,
      threat: state.corporation.threat,
    },
    advisors: Object.fromEntries(
      ADVISOR_IDS.map((advisorId) => {
        const advisor = state.advisors[advisorId];
        return [
          advisorId,
          {
            active: advisor.active,
            alignment: advisor.alignment,
            loyalty: advisor.loyalty,
            leverage: advisor.leverage,
          },
        ];
      }),
    ) as ReportFinalSnapshot["advisors"],
  };
  return {
    rulesVersion: REPORT_RULES_VERSION,
    runId: state.runId,
    seed: state.seed,
    archetypeId: state.archetypeId,
    legacyDirective: structuredClone(state.legacyDirective),
    ending: structuredClone(state.ending),
    pivotalDecision: narrativePivot,
    narrativePivot,
    strategicPivot: asPivot(pivots.strategic.decision, pivots.strategic.score),
    finalTurningPoint: asPivot(
      pivots.finalTurningPoint.decision,
      pivots.finalTurningPoint.score,
    ),
    completedRoute,
    unseenRouteHint: hint,
    suggestedExperiment: suggestedExperiment(state, pivots.narrative.decision, hint),
    finalSnapshot,
  };
}

export function createEmptyArchive(): ArchiveV1 {
  return {
    version: 1,
    processedRunIds: [],
    cards: {},
    endings: {},
    routes: {
      labor_coalition: { highestStep: 0, completed: false },
      corporate_exposure: { highestStep: 0, completed: false },
    },
    clearance: 0,
    rewardRngState: INITIAL_DIRECTIVE_REWARD_SEED,
    unlockedDirectiveIds: [],
    pendingDirectiveDraft: null,
    pendingScar: null,
  };
}

function createPendingDirectiveDraft(archive: ArchiveV1): void {
  if (
    archive.pendingDirectiveDraft
    || archive.clearance < 3
    || archive.unlockedDirectiveIds.length >= LEGACY_DIRECTIVE_IDS.length
  ) {
    return;
  }
  const result = drawLegacyDirectiveDraft(
    archive.rewardRngState,
    archive.unlockedDirectiveIds,
  );
  archive.rewardRngState = result.rngState;
  if (result.draft) {
    archive.clearance -= 3;
    archive.pendingDirectiveDraft = result.draft;
  }
}

export function mergeRunIntoArchive(archive: ArchiveV1, state: GameState): ArchiveV1 {
  if (!state.ending || !state.report) throw new Error("Only completed runs can enter the Archive.");
  if (archive.processedRunIds.includes(state.runId)) return structuredClone(archive);

  const next = structuredClone(archive);
  next.processedRunIds.push(state.runId);
  next.endings[state.ending.id] = (next.endings[state.ending.id] ?? 0) + 1;
  if (next.unlockedDirectiveIds.length < LEGACY_DIRECTIVE_IDS.length) {
    next.clearance += getClearanceGainForEnding(state.ending.id);
  }
  if (state.ending.id === "civic_legacy") {
    next.pendingScar = null;
  } else if (state.ending.id === "compromised_activation") {
    next.pendingScar = "necessary_regime_aftermath" satisfies ArchiveScarId;
  }

  for (const encounter of state.cardHistory) {
    const existing = next.cards[encounter.cardId] ?? { encounters: 0, choices: {}, outcomes: [] };
    existing.encounters += 1;
    if (encounter.choiceId) {
      existing.choices[encounter.choiceId] = (existing.choices[encounter.choiceId] ?? 0) + 1;
    }
    if (encounter.outcomeId && !existing.outcomes.includes(encounter.outcomeId)) {
      existing.outcomes.push(encounter.outcomeId);
    }
    next.cards[encounter.cardId] = existing;
  }

  for (const routeId of ROUTE_IDS) {
    const route = state.routes[routeId];
    next.routes[routeId].highestStep = Math.max(
      next.routes[routeId].highestStep,
      route.discoveredSteps.length,
    );
    if (routeCompletionIsValid(state, routeId)) next.routes[routeId].completed = true;
  }
  createPendingDirectiveDraft(next);
  return next;
}

export function claimLegacyDirective(
  archive: ArchiveV1,
  directiveId: LegacyDirectiveId,
): ArchiveV1 {
  if (!archive.pendingDirectiveDraft?.candidateIds.includes(directiveId)) {
    throw new Error("That Legacy Directive is not in the pending reward draft.");
  }
  if (archive.unlockedDirectiveIds.includes(directiveId)) {
    throw new Error("That Legacy Directive is already unlocked.");
  }
  const next = structuredClone(archive);
  next.unlockedDirectiveIds.push(directiveId);
  next.pendingDirectiveDraft = null;
  createPendingDirectiveDraft(next);
  return next;
}

export function createReplayIntent(
  report: DeclassifiedReport,
  mode: ReplayIntent["mode"],
): ReplayIntent {
  return {
    mode,
    seed: mode === "same_seed" ? report.seed : (report.seed + 0x9e3779b9) >>> 0,
    archetypeId: report.archetypeId,
    experiment: report.suggestedExperiment,
    legacyDirectiveId: report.legacyDirective.equippedId,
  };
}

export function serializeArchive(archive: ArchiveV1): string {
  return JSON.stringify(archive);
}

function migrateArchiveV0(archive: ArchiveV0): ArchiveV1 {
  return {
    ...structuredClone(archive),
    version: 1,
    clearance: 0,
    rewardRngState: INITIAL_DIRECTIVE_REWARD_SEED,
    unlockedDirectiveIds: [],
    pendingDirectiveDraft: null,
    pendingScar: null,
  };
}

function normalizeArchiveV1Blob(value: unknown): unknown {
  if (!isRecord(value) || value.version !== 1) return value;
  if (!("pendingScar" in value)) {
    return { ...value, pendingScar: null };
  }
  return value;
}

export function deserializeArchive(serialized: string): ArchiveV1 {
  const parsed: unknown = JSON.parse(serialized);
  if (
    parsed
    && typeof parsed === "object"
    && "version" in parsed
    && parsed.version === 0
  ) {
    assertArchiveV0(parsed);
    return migrateArchiveV0(parsed);
  }
  const normalized = normalizeArchiveV1Blob(parsed);
  assertArchiveV1(normalized);
  return normalized;
}
