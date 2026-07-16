import { playBotRun } from "./bots";
import { SITUATION_CARDS } from "./content";
import { createGame } from "./engine";
import type {
  ActionCategory,
  AdvisorId,
  ArchetypeId,
  BotId,
  CardRarity,
  CardType,
  EchoType,
  EndingId,
  EndingVariationId,
  RouteId,
  SimulationOptions,
  SimulationReport,
} from "./types";

const ALL_BOTS: BotId[] = ["balanced", "rush", "defensive"];
const ALL_ARCHETYPES: ArchetypeId[] = ["technocrat", "populist", "operator"];
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
  const chainsStarted = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const chainsCompleted = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const routesClosed = Object.fromEntries(ALL_ROUTES.map((id) => [id, 0])) as Record<RouteId, number>;
  const endingVariations = Object.fromEntries(ALL_VARIATIONS.map((id) => [id, 0])) as Record<EndingVariationId, number>;
  const pivotalDecisionCategories = Object.fromEntries(ALL_ACTIONS.map((id) => [id, 0])) as Record<ActionCategory, number>;
  const endingContributors: Record<string, number> = {};

  let victories = 0;
  let totalTurns = 0;
  let advisorDepartures = 0;
  for (let index = 0; index < options.runs; index += 1) {
    const bot = bots[index % bots.length] as BotId;
    const archetype = archetypes[Math.floor(index / bots.length) % archetypes.length] as ArchetypeId;
    const seed = (options.seed + Math.imul(index + 1, 2654435761)) >>> 0;
    const result = playBotRun(createGame({ seed, archetypeId: archetype, runId: `sim-${index}-${seed}` }), bot);
    const ending = result.state.ending;
    if (!ending) throw new Error("A completed simulation did not produce an ending.");

    endings[ending.id] += 1;
    byBot[bot].runs += 1;
    byArchetype[archetype].runs += 1;
    totalTurns += Math.min(result.state.turn, result.state.maxTurns);
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
    }
    for (const decision of result.state.decisionHistory) {
      for (const echoType of decision.echoTypes) echoCategories[echoType] += 1;
    }
    for (const routeId of ALL_ROUTES) {
      const route = result.state.routes[routeId];
      if (route.discoveredSteps.length > 0) routesTouched[routeId] += 1;
      if (route.openedByDecisionId !== null) routesOpened[routeId] += 1;
      const followUpId = ROUTE_FOLLOW_UPS[routeId];
      const followUpEnteredDeck =
        result.state.deck.addedCardIds.includes(followUpId) ||
        result.state.cardHistory.some((encounter) => encounter.cardId === followUpId);
      if (followUpEnteredDeck) chainsStarted[routeId] += 1;
      if (route.status === "completed") chainsCompleted[routeId] += 1;
      if (route.status === "closed") routesClosed[routeId] += 1;
    }
    if (ending.variationId) endingVariations[ending.variationId] += 1;
    for (const contributor of result.state.endingContributors) {
      endingContributors[contributor] = (endingContributors[contributor] ?? 0) + 1;
    }
    const pivotalId = result.state.report?.pivotalDecision.decisionId;
    const pivotal = result.state.decisionHistory.find((decision) => decision.id === pivotalId);
    if (pivotal) pivotalDecisionCategories[pivotal.category] += 1;
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
    averageTurns: Number((totalTurns / options.runs).toFixed(2)),
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
    chainsStarted,
    chainsCompleted,
    routesClosed,
    pivotalDecisionCategories,
    endingContributorCounts: endingContributors,
    endingVariations,
    byBot,
    byArchetype,
  };
}
