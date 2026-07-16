import { ADVISORS, DEPOSIT_COSTS, FOLLOW_UP_CARD_IDS, SITUATION_CARDS } from "./content";
import {
  canUseArchetypeConsultation,
  commitAction,
  consultAdvisor,
  getActionCategory,
  getValidActions,
} from "./engine";
import { TRACK_KEYS, type BotId, type GameState, type MajorAction } from "./types";

function effectScore(
  state: GameState,
  action: Extract<MajorAction, { type: "resolve_card" }>,
  bot: BotId,
): number {
  const card = SITUATION_CARDS.find((item) => item.id === state.activeCardId);
  const choice = card?.choices.find((item) => item.id === action.choiceId);
  if (!choice) return -100;
  const resourceValue = Object.values(choice.effects.resources ?? {}).reduce(
    (sum, value) => sum + value,
    0,
  );
  const pressureValue = Object.values(choice.effects.pressures ?? {}).reduce(
    (sum, value) => sum - value * 1.3,
    0,
  );
  const trackValue = Object.values(choice.effects.tracks ?? {}).reduce(
    (sum, value) => sum + value * 1.2,
    0,
  );
  const advisorValue = Object.values(choice.effects.advisors ?? {}).reduce(
    (total, changes) =>
      total +
      (changes.loyalty ?? 0) * 0.2 +
      (changes.alignment ?? 0) * 0.2 -
      (changes.leverage ?? 0) * (bot === "defensive" ? 0.8 : 0.5),
    0,
  );
  const routeValues = {
    balanced: { open: 30, advance: 25, complete: 45, close: 0 },
    defensive: { open: 24, advance: 22, complete: 40, close: 0 },
    rush: { open: 6, advance: 8, complete: 15, close: 0 },
  } as const;
  const routeValue = (choice.routeChanges ?? []).reduce(
    (total, change) => total + routeValues[bot][change.effect],
    0,
  );
  const cardsAdded = choice.echoes.reduce(
    (total, echo) => total + (echo.type === "card" ? (echo.addCardIds?.length ?? 0) : 0),
    0,
  );
  const futureCardValue = cardsAdded * (bot === "balanced" ? 18 : bot === "defensive" ? 12 : 2);
  const archetypeLiability =
    state.archetypeId === "technocrat" && choice.tags?.includes("opaque")
      ? -3
      : state.archetypeId === "populist" && choice.tags?.includes("public_betrayal")
        ? -6.5
        : 0;
  return (
    resourceValue +
    pressureValue +
    trackValue +
    advisorValue +
    routeValue +
    futureCardValue +
    archetypeLiability +
    (choice.effects.institutions ?? 0) * 1.2 -
    (choice.effects.corporationProgress ?? 0) * 1.2 -
    (choice.effects.corporationThreat ?? 0) * 0.6
  );
}

function scoreAction(state: GameState, action: MajorAction, bot: BotId): number {
  if (action.type === "activate_brb") return 1_000;
  if (action.type === "resolve_card") {
    const urgency =
      bot === "defensive"
        ? state.turn % 2 === 0 ? 82 : 34
        : bot === "balanced"
          ? state.turn % 3 === 0 ? 78 : 28
          : 12;
    return urgency + effectScore(state, action, bot);
  }
  if (action.type === "deposit") {
    const lowestTrack = Math.min(...TRACK_KEYS.map((key) => state.tracks[key]));
    const catchesUp = state.tracks[action.track] === lowestTrack ? 24 : 0;
    const style = bot === "rush" ? 86 : bot === "balanced" ? 58 : 50;
    const size = action.size === "large" ? (bot === "rush" ? 16 : -4) : 4;
    return style + catchesUp + size;
  }
  if (action.type === "counter_corporation") {
    const prediction = state.consultation?.predictedStrategy ?? state.corporation.strategy;
    const correctTarget = action.predictedStrategy === prediction ? 22 : -40;
    const danger = state.corporation.progress >= 70 ? 55 : state.corporation.progress * 0.28;
    const style = bot === "defensive" ? 18 : bot === "balanced" ? 10 : -5;
    return style + correctTarget + danger;
  }
  if (action.type === "protect_institutions") {
    return state.institutions <= 35
      ? 80 + (35 - state.institutions)
      : (100 - state.institutions) * (bot === "defensive" ? 0.45 : 0.2);
  }
  if (action.type === "strengthen_faction") {
    return (100 - state.resources.trust) * (bot === "defensive" ? 0.65 : 0.35);
  }
  if (action.type === "manage_advisor") {
    const advisor = state.advisors[action.advisorId];
    return advisor.leverage >= 65
      ? 75 + advisor.leverage * 0.2
      : advisor.leverage * 0.25 + (100 - advisor.alignment) * 0.15;
  }
  const resourceNeed = 100 - state.resources[action.resource];
  const crisisBonus = state.resources[action.resource] <= 15 ? 50 : 0;
  return resourceNeed * 0.28 + crisisBonus + (bot === "defensive" ? 6 : 0);
}

export function chooseBotAction(state: GameState, bot: BotId): MajorAction {
  const valid = getValidActions(state);
  if (valid.length === 0) throw new Error("Bot has no valid actions in an active run.");

  const activation = valid.find((action) => action.type === "activate_brb");
  if (activation && state.corporation.progress < 80) return activation;

  const cardChoices = valid.filter(
    (action): action is Extract<MajorAction, { type: "resolve_card" }> =>
      action.type === "resolve_card",
  );
  const bestCard = cardChoices.sort(
    (a, b) => effectScore(state, b, bot) - effectScore(state, a, bot),
  )[0];
  if (bestCard && state.activeCardId && FOLLOW_UP_CARD_IDS.has(state.activeCardId)) {
    return bestCard;
  }
  const cardInterval = bot === "rush" ? 5 : bot === "balanced" ? 4 : 3;
  if (bestCard && state.turn % cardInterval === 0) return bestCard;

  const predictedStrategy = state.consultation?.predictedStrategy ?? state.corporation.strategy;
  const counterThreshold = bot === "rush" ? 66 : bot === "balanced" ? 58 : 48;
  const counter = valid.find(
    (action) =>
      action.type === "counter_corporation" &&
      action.predictedStrategy === predictedStrategy,
  );
  if (activation && counter) return counter;
  if (counter && state.corporation.progress >= counterThreshold) return counter;

  const leverageLimit = state.archetypeId === "operator" ? 72 : 65;
  const riskyAdvisor = (Object.keys(state.advisors) as (keyof typeof state.advisors)[]).find(
    (id) => state.advisors[id].active && state.advisors[id].leverage >= leverageLimit,
  );
  const manage = valid.find(
    (action) => action.type === "manage_advisor" && action.advisorId === riskyAdvisor,
  );
  if (manage) return manage;

  const protect = valid.find((action) => action.type === "protect_institutions");
  if (protect && state.institutions <= (bot === "defensive" ? 38 : 25)) return protect;

  const lowestTrack = [...TRACK_KEYS].sort(
    (a, b) => state.tracks[a] - state.tracks[b],
  )[0] as (typeof TRACK_KEYS)[number];
  const preferredSize = state.tracks[lowestTrack] < 32 ? "large" : "standard";
  const deposit = valid.find(
    (action) =>
      action.type === "deposit" &&
      action.track === lowestTrack &&
      action.size === preferredSize,
  ) ?? valid.find(
    (action) =>
      action.type === "deposit" &&
      action.track === lowestTrack &&
      action.size === "standard",
  );
  if (deposit) return deposit;

  const cost = DEPOSIT_COSTS[lowestTrack];
  const missingResource = (Object.keys(cost) as (keyof typeof cost)[])
    .filter((resource) => state.resources[resource] < cost[resource])
    .sort(
      (a, b) =>
        cost[b] - state.resources[b] - (cost[a] - state.resources[a]),
    )[0];
  const recovery = valid.find(
    (action) => action.type === "recover_resource" && action.resource === missingResource,
  );
  if (recovery) return recovery;

  if (bestCard) return bestCard;
  return [...valid].sort((a, b) => scoreAction(state, b, bot) - scoreAction(state, a, bot))[0] as MajorAction;
}

function advisorForBot(state: GameState, bot: BotId): keyof typeof ADVISORS {
  if (bot === "rush") return "analyst";
  if (bot === "defensive") return "steward";
  const matching = (Object.keys(ADVISORS) as (keyof typeof ADVISORS)[]).find(
    (id) => ADVISORS[id].crisisSpecialty === state.corporation.strategy && state.advisors[id].active,
  );
  return matching ?? "fixer";
}

export function playBotRun(initialState: GameState, bot: BotId): {
  state: GameState;
  actionCounts: Record<ReturnType<typeof getActionCategory>, number>;
  consultationCounts: Record<keyof typeof ADVISORS, number>;
} {
  let state = initialState;
  let commitments = 0;
  const actionCounts = {
    deposit: 0,
    card: 0,
    counter: 0,
    faction: 0,
    advisor: 0,
    recover: 0,
    institutions: 0,
    activate: 0,
  };
  const consultationCounts = { analyst: 0, fixer: 0, steward: 0 };

  while (state.phase !== "ended") {
    commitments += 1;
    if (commitments > state.maxTurns + 2) {
      throw new Error("Bot exceeded the run turn limit without reaching an ending.");
    }
    const shouldConsult =
      state.resources.intelligence >= 2 &&
      ((bot === "balanced" && state.turn % 3 === 0) ||
        (bot === "defensive" && state.turn % 2 === 0) ||
        (bot === "rush" && state.turn % 4 === 0));
    if (shouldConsult) {
      const advisorId = advisorForBot(state, bot);
      if (state.advisors[advisorId].active) {
        const result = consultAdvisor(
          state,
          advisorId,
          canUseArchetypeConsultation(state, advisorId),
        );
        if (result.accepted) {
          consultationCounts[advisorId] += 1;
          state = result.state;
        }
      }
    }

    const action = chooseBotAction(state, bot);
    actionCounts[getActionCategory(action)] += 1;
    const result = commitAction(state, action);
    if (!result.accepted) throw new Error(result.error ?? "Bot action was rejected.");
    state = result.state;
  }

  return { state, actionCounts, consultationCounts };
}
