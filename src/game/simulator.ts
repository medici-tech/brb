import { playBotRun } from "./bots";
import { SITUATION_CARDS } from "./content";
import {
  createGame,
  evaluateCivicLegacy,
  getRouteCompletionKind,
  validateRouteIntegrity,
} from "./engine";
import type {
  ActionCategory,
  AdvisorId,
  ArchetypeId,
  BotId,
  CardEncounterStatus,
  CardRarity,
  CardType,
  ClosestAttemptTrace,
  EchoType,
  EndingFunnel,
  EndingId,
  EndingVariationId,
  GameState,
  RouteId,
  SimulationOptions,
  SimulationReport,
} from "./types";

const CIVIC_STAGE_DEFINITIONS = [
  ["all_runs", "All simulated runs"],
  ["all_tracks_50", "All BRB tracks reached 50"],
  ["activation_attempted", "BRB activation was attempted"],
  ["corporation_access_safe", "Corporation and Access remained safe"],
  ["legitimacy_75", "Legitimacy reached 75"],
  ["stability_75", "Stability reached 75"],
  ["institutions_55", "Institutions remained at 55"],
  ["panic_below_60", "Panic remained below 60"],
  ["leverage_below_65", "Advisor leverage remained below 65"],
  ["no_emergency_rule", "Emergency rule was avoided"],
  ["civic_history", "A civic history survived"],
  ["civic_legacy", "Civic Legacy completed"],
] as const;

const COMMAND_STAGE_DEFINITIONS = [
  ["operator_runs", "Operator runs"],
  ["all_tracks_50", "All BRB tracks reached 50"],
  ["activation_attempted", "BRB activation was attempted"],
  ["activation_victory", "Activation succeeded"],
  ["command_authority", "Command authority was established"],
  ["government_by_command", "Government by Command completed"],
] as const;

function createEndingFunnel(
  definitions: ReadonlyArray<readonly [string, string]>,
): EndingFunnel {
  return {
    candidates: 0,
    stages: definitions.map(([id, label]) => ({ id, label, entered: 0, passed: 0, dropped: 0 })),
    completions: 0,
  };
}

function recordFunnelCandidate(funnel: EndingFunnel, checks: boolean[]): void {
  funnel.candidates += 1;
  let reached = true;
  for (const [index, stage] of funnel.stages.entries()) {
    if (!reached) break;
    stage.entered += 1;
    if (checks[index]) stage.passed += 1;
    else {
      stage.dropped += 1;
      reached = false;
    }
  }
}

function percent(count: number, total: number): number {
  return Number(((count / total) * 100).toFixed(2));
}

function civicDeficitScore(state: GameState): number {
  const highestLeverage = Math.max(...Object.values(state.advisors).map((advisor) => advisor.leverage));
  const civicHistory =
    ["normal", "reconciled"].includes(getRouteCompletionKind(state.routes.labor_coalition) ?? "") ||
    state.endingContributors.includes("public_testimony");
  return (
    Object.values(state.tracks).reduce((sum, value) => sum + Math.max(0, 50 - value), 0) +
    Math.max(0, state.corporation.progress - 79) +
    Math.max(0, 50 - state.tracks.access) +
    Math.max(0, 75 - state.tracks.legitimacy) +
    Math.max(0, 75 - state.tracks.stability) +
    Math.max(0, 55 - state.institutions) +
    Math.max(0, state.pressures.panic - 59) +
    Math.max(0, highestLeverage - 64) +
    (state.systemModifiers.includes("emergency_rule") ? 25 : 0) +
    (civicHistory ? 0 : 25)
  );
}

function isCloserAttempt(
  candidate: ClosestAttemptTrace,
  current: ClosestAttemptTrace | undefined,
): boolean {
  if (!current) return true;
  if (candidate.matchedRequirements !== current.matchedRequirements) {
    return candidate.matchedRequirements > current.matchedRequirements;
  }
  if (candidate.deficitScore !== current.deficitScore) {
    return candidate.deficitScore < current.deficitScore;
  }
  return candidate.runIndex < current.runIndex;
}

const ALL_BOTS: BotId[] = [
  "balanced",
  "rush",
  "defensive",
  "fixer",
  "institutionalist",
  "command",
  "coalition",
  "engineering_first",
  "legitimacy_first",
  "stability_first",
  "access_first",
  "delayed_deposit",
];
const ALL_ARCHETYPES: ArchetypeId[] = ["technocrat", "populist", "operator"];
const PREFERRED_ARCHETYPES: Partial<Record<BotId, ArchetypeId>> = {
  fixer: "operator",
  institutionalist: "populist",
  command: "operator",
  coalition: "populist",
  engineering_first: "technocrat",
  legitimacy_first: "populist",
  stability_first: "technocrat",
  access_first: "operator",
};
const ALL_ENDINGS: EndingId[] = [
  "civic_legacy",
  "compromised_activation",
  "corporate_capture",
  "state_collapse",
];
const ALL_ACTIONS: ActionCategory[] = [
  "deposit",
  "card",
  "counter",
  "faction",
  "advisor",
  "recover",
  "institutions",
  "activate",
];
const ALL_CARD_TYPES: CardType[] = ["crisis", "advisor", "corporation"];
const ALL_RARITIES: CardRarity[] = ["common", "rare"];
const ALL_ECHO_TYPES: EchoType[] = ["card", "relationship", "system", "ending"];
const ALL_CARD_STATUSES: CardEncounterStatus[] = [
  "presented",
  "resolved",
  "ignored",
  "expired",
  "auto_resolved",
  "suppressed",
];
const ALL_ROUTES: RouteId[] = ["labor_coalition", "corporate_exposure"];
const ROUTE_FOLLOW_UPS: Record<RouteId, string> = {
  labor_coalition: "national_march",
  corporate_exposure: "silent_partner",
};
const ALL_VARIATIONS: EndingVariationId[] = [
  "perfect_machine_empty_state",
  "crowd_presses_button",
  "government_by_command",
];

export function runSimulation(options: SimulationOptions): SimulationReport {
  if (!Number.isInteger(options.runs) || options.runs <= 0) {
    throw new Error("Simulation runs must be a positive integer.");
  }
  const bots = options.bots?.length ? options.bots : ALL_BOTS;
  const archetypes = options.archetypes?.length ? options.archetypes : ALL_ARCHETYPES;
  const hasExplicitArchetypes = Boolean(options.archetypes?.length);
  const endings = Object.fromEntries(ALL_ENDINGS.map((id) => [id, 0])) as Record<EndingId, number>;
  const actionUsage = Object.fromEntries(ALL_ACTIONS.map((id) => [id, 0])) as Record<ActionCategory, number>;
  const byBot = Object.fromEntries(
    ALL_BOTS.map((id) => [id, { runs: 0, victories: 0 }]),
  ) as SimulationReport["byBot"];
  const byArchetype = Object.fromEntries(
    ALL_ARCHETYPES.map((id) => [id, { runs: 0, victories: 0 }]),
  ) as SimulationReport["byArchetype"];
  const advisorConsultations: Record<AdvisorId, number> = { analyst: 0, fixer: 0, steward: 0 };
  const leverageTotals: Record<AdvisorId, number> = { analyst: 0, fixer: 0, steward: 0 };
  const cardDrawsByType = Object.fromEntries(ALL_CARD_TYPES.map((id) => [id, 0])) as Record<CardType, number>;
  const cardDrawsByRarity = Object.fromEntries(ALL_RARITIES.map((id) => [id, 0])) as Record<CardRarity, number>;
  const echoCategories = Object.fromEntries(ALL_ECHO_TYPES.map((id) => [id, 0])) as Record<EchoType, number>;
  const routesTouched = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const routesOpened = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const routesReopened = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const chainsStarted = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const chainsCompleted = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const normalCompletions = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const reconciledCompletions = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const invalidCompletions = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const openUnfinished = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const closedPermanently = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const routesClosed = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const cardEncounterStatuses = Object.fromEntries(
    ALL_CARD_STATUSES.map((id) => [id, 0]),
  ) as Record<CardEncounterStatus, number>;
  const cardChoiceSelections: Record<string, Record<string, number>> = {};
  const endingVariations = Object.fromEntries(ALL_VARIATIONS.map((id) => [id, 0])) as Record<EndingVariationId, number>;
  const pivotalDecisionCategories = Object.fromEntries(ALL_ACTIONS.map((id) => [id, 0])) as Record<ActionCategory, number>;
  const narrativePivotCategories = Object.fromEntries(ALL_ACTIONS.map((id) => [id, 0])) as Record<ActionCategory, number>;
  const strategicPivotCategories = Object.fromEntries(ALL_ACTIONS.map((id) => [id, 0])) as Record<ActionCategory, number>;
  const finalTurningPointCategories = Object.fromEntries(ALL_ACTIONS.map((id) => [id, 0])) as Record<ActionCategory, number>;
  const endingFunnels: SimulationReport["endingFunnels"] = {
    civic_legacy: createEndingFunnel(CIVIC_STAGE_DEFINITIONS),
    government_by_command: createEndingFunnel(COMMAND_STAGE_DEFINITIONS),
  };
  const endingContributors: Record<string, number> = {};

  let victories = 0;
  let premiumEndings = 0;
  let totalMonths = 0;
  let advisorDepartures = 0;
  for (let index = 0; index < options.runs; index += 1) {
    const bot = bots[index % bots.length] as BotId;
    const fallbackArchetype = archetypes[Math.floor(index / bots.length) % archetypes.length] as ArchetypeId;
    const archetype = hasExplicitArchetypes
      ? fallbackArchetype
      : (PREFERRED_ARCHETYPES[bot] ?? fallbackArchetype);
    const seed = (options.seed + Math.imul(index + 1, 2654435761)) >>> 0;
    const result = playBotRun(createGame({ seed, archetypeId: archetype, runId: `sim-${index}-${seed}` }), bot);
    const ending = result.state.ending;
    if (!ending) throw new Error("A completed simulation did not produce an ending.");

    endings[ending.id] += 1;
    byBot[bot].runs += 1;
    byArchetype[archetype].runs += 1;
    totalMonths += result.trace.length;
    if (ending.victory) {
      victories += 1;
      byBot[bot].victories += 1;
      byArchetype[archetype].victories += 1;
    }
    for (const action of ALL_ACTIONS) actionUsage[action] += result.actionCounts[action];
    for (const encounter of result.state.cardHistory) {
      const card = SITUATION_CARDS.find((candidate) => candidate.id === encounter.cardId);
      if (card) {
        cardDrawsByType[card.type] += 1;
        cardDrawsByRarity[card.rarity] += 1;
      }
      cardEncounterStatuses.presented += 1;
      if (encounter.status !== "presented") cardEncounterStatuses[encounter.status] += 1;
      if (encounter.status === "resolved" && encounter.choiceId) {
        const choices = cardChoiceSelections[encounter.cardId] ?? {};
        choices[encounter.choiceId] = (choices[encounter.choiceId] ?? 0) + 1;
        cardChoiceSelections[encounter.cardId] = choices;
      }
    }
    for (const decision of result.state.decisionHistory) {
      for (const echoType of decision.echoTypes) echoCategories[echoType] += 1;
    }
    for (const routeId of ALL_ROUTES) {
      const route = result.state.routes[routeId];
      if (route.discoveredSteps.length > 0) routesTouched[routeId] += 1;
      if (route.openedByDecisionId !== null) routesOpened[routeId] += 1;
      if (route.reopenedByDecisionId !== null) routesReopened[routeId] += 1;
      const followUpId = ROUTE_FOLLOW_UPS[routeId];
      const followUpEnteredDeck =
        result.state.deck.addedCardIds.includes(followUpId) ||
        result.state.cardHistory.some((encounter) => encounter.cardId === followUpId);
      if (followUpEnteredDeck) chainsStarted[routeId] += 1;
      const completionKind = getRouteCompletionKind(route);
      if (route.status === "completed") chainsCompleted[routeId] += 1;
      if (completionKind === "normal") normalCompletions[routeId] += 1;
      if (completionKind === "reconciled") reconciledCompletions[routeId] += 1;
      if (completionKind === "invalid" || validateRouteIntegrity(route).length > 0) {
        invalidCompletions[routeId] += 1;
      }
      if (route.status === "open" || route.status === "reopened") openUnfinished[routeId] += 1;
      if (route.status === "closed") {
        routesClosed[routeId] += 1;
        closedPermanently[routeId] += 1;
      }
    }
    if (ending.variationId) endingVariations[ending.variationId] += 1;
    if (ending.id === "civic_legacy" || ending.variationId !== null) premiumEndings += 1;
    for (const contributor of result.state.endingContributors) {
      endingContributors[contributor] = (endingContributors[contributor] ?? 0) + 1;
    }
    const pivotFields = [
      [result.state.report?.narrativePivot.decisionId, narrativePivotCategories],
      [result.state.report?.strategicPivot.decisionId, strategicPivotCategories],
      [result.state.report?.finalTurningPoint.decisionId, finalTurningPointCategories],
    ] as const;
    for (const [decisionId, bucket] of pivotFields) {
      const decision = result.state.decisionHistory.find((candidate) => candidate.id === decisionId);
      if (decision) bucket[decision.category] += 1;
    }
    for (const action of ALL_ACTIONS) {
      pivotalDecisionCategories[action] = narrativePivotCategories[action];
    }

    const civic = endingFunnels.civic_legacy;
    const civicEvaluation = evaluateCivicLegacy(result.state);
    const civicChecks = Object.fromEntries(
      civicEvaluation.observations.map((observation) => [observation.id, observation.passed]),
    ) as Record<string, boolean>;
    const activationAttempted = result.state.decisionHistory.some(
      (decision) => decision.category === "activate",
    );
    const stagedCivicChecks = [
      true,
      civicChecks.all_tracks_50 ?? false,
      activationAttempted,
      civicChecks.corporation_access_safe ?? false,
      civicChecks.legitimacy_75 ?? false,
      civicChecks.stability_75 ?? false,
      civicChecks.institutions_55 ?? false,
      civicChecks.panic_below_60 ?? false,
      civicChecks.leverage_below_65 ?? false,
      civicChecks.no_emergency_rule ?? false,
      civicChecks.civic_history ?? false,
      ending.id === "civic_legacy",
    ];
    recordFunnelCandidate(civic, stagedCivicChecks);
    if (ending.id === "civic_legacy") civic.completions += 1;

    if (bot === "institutionalist") {
      const firstFailedIndex = stagedCivicChecks.findIndex((passed) => !passed);
      const closestCandidate: ClosestAttemptTrace = {
        botId: "institutionalist",
        runIndex: index,
        seed,
        archetypeId: archetype,
        endingId: ending.id,
        matchedRequirements: civicEvaluation.observations.filter((observation) => observation.passed).length,
        totalRequirements: civicEvaluation.observations.length,
        deficitScore: civicDeficitScore(result.state),
        firstFailedStageId:
          civic.stages[firstFailedIndex]?.id ?? civic.stages.at(-1)?.id ?? "civic_legacy",
        observations: civicEvaluation.observations,
        months: result.trace,
      };
      if (isCloserAttempt(closestCandidate, civic.closestAttempt)) {
        civic.closestAttempt = closestCandidate;
      }
    }

    if (archetype === "operator") {
      const command = endingFunnels.government_by_command;
      recordFunnelCandidate(command, [
        true,
        civicChecks.all_tracks_50 ?? false,
        activationAttempted,
        ending.victory,
        result.state.systemModifiers.includes("emergency_rule") ||
          result.state.advisors.fixer.leverage >= 60,
        ending.variationId === "government_by_command",
      ]);
      if (ending.variationId === "government_by_command") command.completions += 1;
    }
    for (const advisorId of ["analyst", "fixer", "steward"] as AdvisorId[]) {
      advisorConsultations[advisorId] += result.consultationCounts[advisorId];
      leverageTotals[advisorId] += result.state.advisors[advisorId].leverage;
      if (!result.state.advisors[advisorId].active) advisorDepartures += 1;
    }
  }

  return {
    runs: options.runs,
    endings,
    victories,
    averageMonths: Number((totalMonths / options.runs).toFixed(2)),
    outcomeSummary: {
      activations: victories,
      activationRate: percent(victories, options.runs),
      collapseRate: percent(endings.state_collapse, options.runs),
      corporateCaptureRate: percent(endings.corporate_capture, options.runs),
      premiumEndings,
      premiumEndingRate: percent(premiumEndings, options.runs),
    },
    cardTempo: {
      presentedPerRun: Number((cardEncounterStatuses.presented / options.runs).toFixed(2)),
      activelyResolvedPerRun: Number((cardEncounterStatuses.resolved / options.runs).toFixed(2)),
      ignoredPerRun: Number((cardEncounterStatuses.ignored / options.runs).toFixed(2)),
    },
    actionUsage,
    advisorConsultations,
    averageFinalLeverage: {
      analyst: Number((leverageTotals.analyst / options.runs).toFixed(2)),
      fixer: Number((leverageTotals.fixer / options.runs).toFixed(2)),
      steward: Number((leverageTotals.steward / options.runs).toFixed(2)),
    },
    advisorDepartures,
    cardDrawsByType,
    cardDrawsByRarity,
    echoCategories,
    routesTouched,
    routesOpened,
    routesReopened,
    chainsStarted,
    chainsCompleted,
    normalCompletions,
    reconciledCompletions,
    invalidCompletions,
    openUnfinished,
    closedPermanently,
    routesClosed,
    cardEncounterStatuses,
    cardChoiceSelections,
    pivotalDecisionCategories,
    narrativePivotCategories,
    strategicPivotCategories,
    finalTurningPointCategories,
    endingFunnels,
    endingContributorCounts: endingContributors,
    endingVariations,
    byBot,
    byArchetype,
  };
}
