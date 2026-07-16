import { ROUTE_DEFINITIONS, SITUATION_CARDS } from "./content";
import { ROUTE_IDS, type ArchiveV0, type DeclassifiedReport, type DecisionRecord, type GameState, type ReplayIntent, type RouteId, type UnseenRouteHint } from "./types";

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

function selectPivotalDecisions(state: GameState): {
  narrative: DecisionRecord;
  strategic: DecisionRecord;
  finalTurningPoint: DecisionRecord;
} {
  for (const decision of state.decisionHistory) {
    decision.narrativeScore = scoreDecision(decision);
    decision.strategicScore = scoreStrategicDecision(decision);
    decision.finalTurningPointScore = scoreFinalTurningPoint(decision);
    decision.pivotalScore = decision.narrativeScore;
  }
  const fallback = fallbackDecision(state);
  const narrative = [...state.decisionHistory].sort(
    (a, b) => b.narrativeScore - a.narrativeScore || a.turn - b.turn,
  )[0] ?? fallback;
  const strategic = [...state.decisionHistory].sort(
    (a, b) => b.strategicScore - a.strategicScore || a.turn - b.turn,
  )[0] ?? fallback;
  const finalWindowStart = Math.max(1, state.turn - 5);
  const lateDecisions = state.decisionHistory.filter((decision) => decision.turn >= finalWindowStart);
  const finalTurningPoint = [...(lateDecisions.length > 0 ? lateDecisions : state.decisionHistory)].sort(
    (a, b) => b.finalTurningPointScore - a.finalTurningPointScore || b.turn - a.turn,
  )[0] ?? fallback;
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
  const hint = chooseUnseenRouteHint(state, pivots.narrative);
  const completedRoute = ROUTE_IDS.find((id) => routeCompletionIsValid(state, id)) ?? null;
  const narrativePivot = asPivot(pivots.narrative, pivots.narrative.narrativeScore);
  return {
    runId: state.runId,
    seed: state.seed,
    archetypeId: state.archetypeId,
    ending: structuredClone(state.ending),
    pivotalDecision: narrativePivot,
    narrativePivot,
    strategicPivot: asPivot(pivots.strategic, pivots.strategic.strategicScore),
    finalTurningPoint: asPivot(
      pivots.finalTurningPoint,
      pivots.finalTurningPoint.finalTurningPointScore,
    ),
    completedRoute,
    unseenRouteHint: hint,
    suggestedExperiment: suggestedExperiment(state, pivots.narrative, hint),
  };
}

export function createEmptyArchive(): ArchiveV0 {
  return {
    version: 0,
    processedRunIds: [],
    cards: {},
    endings: {},
    routes: {
      labor_coalition: { highestStep: 0, completed: false },
      corporate_exposure: { highestStep: 0, completed: false },
    },
  };
}

export function mergeRunIntoArchive(archive: ArchiveV0, state: GameState): ArchiveV0 {
  if (!state.ending || !state.report) throw new Error("Only completed runs can enter the Archive.");
  if (archive.processedRunIds.includes(state.runId)) return structuredClone(archive);

  const next = structuredClone(archive);
  next.processedRunIds.push(state.runId);
  next.endings[state.ending.id] = (next.endings[state.ending.id] ?? 0) + 1;

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
  };
}

export function serializeArchive(archive: ArchiveV0): string {
  return JSON.stringify(archive);
}

export function deserializeArchive(serialized: string): ArchiveV0 {
  const parsed: unknown = JSON.parse(serialized);
  if (!parsed || typeof parsed !== "object" || !("version" in parsed) || parsed.version !== 0) {
    throw new Error("Unsupported or invalid BRB Archive.");
  }
  return parsed as ArchiveV0;
}
