import { ADVISORS, DEPOSIT_COSTS, FOLLOW_UP_CARD_IDS, SITUATION_CARDS } from "./content";
import {
  canUseArchetypeConsultation,
  commitAction,
  consultAdvisor,
  evaluateCivicLegacy,
  getActionCategory,
  getActionCost,
  getConsultationCost,
  getValidActions,
} from "./engine";
import {
  getCompletionPressure,
  isCorporationResponseDue,
} from "./progression";
import {
  ADVISOR_IDS,
  TRACK_KEYS,
  type AdvisorId,
  type BotId,
  type BotMonthTrace,
  type GameState,
  type MajorAction,
} from "./types";

const RUSH_BOTS: BotId[] = ["rush", "engineering_first", "access_first"];
// Profiles that lean on advisors on purpose: they consult every month, never
// discipline Leverage, and exist to exercise the advisor-takeover endings.
const ADVISOR_HEAVY_BOTS: BotId[] = ["advisor_dependent", "advisor_cabal"];
const BOT_NON_TERMINATION_GUARD_MONTHS = 1_200;
const PUBLIC_BOTS: BotId[] = [
  "defensive",
  "institutionalist",
  "coalition",
  "legitimacy_first",
  "stability_first",
  "civic_seeker",
];

function isOneOf(bot: BotId, bots: BotId[]): boolean {
  return bots.includes(bot);
}

function counterProgressThreshold(bot: BotId): number {
  if (bot === "long_horizon") return 18;
  // Civic Legacy requires Corporation Progress below 80 at activation, so the
  // civic seeker counters earlier than the institutionalist.
  if (bot === "civic_seeker") return 60;
  return bot === "institutionalist" ? 85 : isOneOf(bot, RUSH_BOTS) ? 66 : bot === "balanced" ? 58 : 48;
}

// Whether this bot would commit a counter-operation this month if it held a
// forecast. Posture is hidden, so a counter requires a consultation first; this
// predicate lets the bot consult *in order to* counter rather than only on a
// coincidental scheduled consult-turn. It fires only when the bot can afford
// both the consultation and the counter, so a consult is never wasted.
function botIntendsToCounter(state: GameState, bot: BotId): boolean {
  const counterCost = getActionCost(state, {
    type: "counter_corporation",
    predictedStrategy: "expanding",
  });
  const consultIntel = getConsultationCost(state).intelligence;
  const affordsBoth =
    state.resources.intelligence >= (counterCost.intelligence ?? 0) + consultIntel &&
    state.resources.influence >= (counterCost.influence ?? 0);
  return affordsBoth && state.corporation.progress >= counterProgressThreshold(bot);
}

function shouldResolvePresentedCard(state: GameState, bot: BotId): boolean {
  if (state.activeCardId && FOLLOW_UP_CARD_IDS.has(state.activeCardId)) return true;
  if (bot === "long_horizon") return true;
  const presentationNumber = Math.max(1, state.cardHistory.length);
  if (isOneOf(bot, RUSH_BOTS) || bot === "command") {
    const position = presentationNumber % 5;
    return position !== 0 && position !== 3;
  }
  if (isOneOf(bot, PUBLIC_BOTS)) return presentationNumber % 4 !== 0;
  return presentationNumber % 3 !== 0;
}

function chooseLongHorizonAction(state: GameState, valid: MajorAction[]): MajorAction {
  const cardChoices = valid.filter(
    (action): action is Extract<MajorAction, { type: "resolve_card" }> =>
      action.type === "resolve_card",
  );
  const bestCard = [...cardChoices].sort(
    (a, b) => effectScore(state, b, "long_horizon") - effectScore(state, a, "long_horizon"),
  )[0];
  if (bestCard) return bestCard;

  const activation = valid.find((action) => action.type === "activate_brb");
  if (activation && state.turn >= 97 && state.corporation.progress < 80) return activation;

  const predictedStrategy = state.consultation?.predictedStrategy ?? null;
  const counter = predictedStrategy
    ? valid.find(
        (action) =>
          action.type === "counter_corporation" &&
          action.predictedStrategy === predictedStrategy,
      )
    : undefined;
  if (counter && state.corporation.progress >= counterProgressThreshold("long_horizon")) return counter;

  const protect = valid.find((action) => action.type === "protect_institutions");
  if (
    protect &&
    (state.pressures.panic >= 25 || state.institutions < 80 || state.pressures.stress >= 65)
  ) return protect;

  const riskyAdvisor = ADVISOR_IDS
    .filter((id) => state.advisors[id].active)
    .sort((a, b) => state.advisors[b].leverage - state.advisors[a].leverage)[0];
  const manage = valid.find(
    (action) =>
      action.type === "manage_advisor" &&
      action.advisorId === riskyAdvisor,
  );
  if (manage && riskyAdvisor && state.advisors[riskyAdvisor].leverage >= 55) return manage;

  const lowestTrack = [...TRACK_KEYS].sort(
    (a, b) => state.tracks[a] - state.tracks[b],
  )[0] as (typeof TRACK_KEYS)[number];
  const scheduledDeposit = valid.find(
    (action) =>
      action.type === "deposit" &&
      action.track === lowestTrack &&
      action.size === "standard",
  );
  const completedDeposits = state.decisionHistory.filter(
    (decision) => decision.category === "deposit",
  ).length;
  if (
    scheduledDeposit &&
    state.turn >= (completedDeposits + 1) * 12 &&
    state.corporation.progress <= 35 &&
    state.pressures.panic <= 40 &&
    state.institutions >= 50
  ) return scheduledDeposit;

  const strengthen = valid.find((action) => action.type === "strengthen_faction");
  if (strengthen && state.resources.trust <= 70 && state.institutions <= 90) return strengthen;

  const recoveryTargets = {
    intelligence: 28,
    influence: 24,
    money: 24,
    trust: 28,
    capacity: 24,
  } as const;
  const recoveryResource = (Object.keys(recoveryTargets) as (keyof typeof recoveryTargets)[])
    .sort(
      (a, b) =>
        state.resources[a] / recoveryTargets[a] - state.resources[b] / recoveryTargets[b],
    )[0];
  const recovery = valid.find(
    (action) => action.type === "recover_resource" && action.resource === recoveryResource,
  );
  if (recovery) return recovery;
  if (counter) return counter;
  if (protect) return protect;
  return valid[0] as MajorAction;
}

function cardChoiceBonus(state: GameState, cardId: string, choiceId: string, bot: BotId): number {
  if (cardId === "silent_partner" && choiceId === "deal") {
    if (bot === "fixer") return 70;
    if (bot === "command") return 60;
    if (bot === "access_first") return 45;
    if (state.archetypeId === "operator") return 20;
  }
  if (cardId === "silent_partner" && choiceId === "seize" && isOneOf(bot, PUBLIC_BOTS)) return 15;
  if (cardId === "protest_spark" && choiceId === "meet" && ["institutionalist", "coalition"].includes(bot)) return 60;
  if (cardId === "protest_spark" && choiceId === "clear" && bot === "command") return 55;
  if (cardId === "national_march" && choiceId === "address" && ["institutionalist", "coalition"].includes(bot)) return 60;
  if (cardId === "national_march" && choiceId === "ban" && bot === "command") return 90;
  if (cardId === "national_march" && choiceId === "ban" && bot === "rush") return 55;
  if (cardId === "emergency_powers" && choiceId === "sign" && bot === "command") return 90;
  if (cardId === "emergency_powers" && choiceId === "sign" && bot === "fixer") return 60;
  return 0;
}

function effectScore(
  state: GameState,
  action: Extract<MajorAction, { type: "resolve_card" }>,
  bot: BotId,
): number {
  const card = SITUATION_CARDS.find((item) => item.id === state.activeCardId);
  const choice = card?.choices.find((item) => item.id === action.choiceId);
  if (!card || !choice) return -100;
  const resourceEffects = Object.values(choice.effects.resources ?? {}).reduce(
    (sum, value) => sum + value,
    0,
  );
  const mandatoryCost = Object.values(getActionCost(state, action)).reduce(
    (sum, value) => sum + value,
    0,
  );
  const resourceValue = resourceEffects - mandatoryCost;
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
      (changes.leverage ?? 0) *
        (bot === "fixer" || bot === "command" || isOneOf(bot, ADVISOR_HEAVY_BOTS)
          ? 0.1
          : isOneOf(bot, PUBLIC_BOTS) ? 0.8 : 0.5),
    0,
  );
  const routeValues = isOneOf(bot, RUSH_BOTS)
    ? { touch: 2, open: 6, advance: 8, complete: 15, close: 0, reopen: 8 }
    : isOneOf(bot, PUBLIC_BOTS)
      ? { touch: 8, open: 24, advance: 22, complete: 40, close: 0, reopen: 28 }
      : { touch: 8, open: 30, advance: 25, complete: 45, close: 0, reopen: 30 };
  const routeValue = (choice.routeChanges ?? []).reduce(
    (total, change) => total + routeValues[change.effect],
    0,
  );
  const cardsAdded = choice.echoes.reduce(
    (total, echo) => total + (echo.type === "card" ? (echo.addCardIds?.length ?? 0) : 0),
    0,
  );
  const futureCardValue = cardsAdded *
    (isOneOf(bot, RUSH_BOTS) ? 2 : isOneOf(bot, PUBLIC_BOTS) ? 12 : 18);
  const archetypeLiability =
    state.archetypeId === "technocrat" && choice.tags?.includes("opaque")
      ? -3
      : state.archetypeId === "populist" && choice.tags?.includes("public_betrayal")
        ? -6.5
        : 0;
  const alternativeChoiceBonus = card.choices[1]?.id === choice.id
    ? bot === "command"
      ? 55
      : bot === "fixer"
        ? 35
        : bot === "rush"
          ? 30
          : bot === "delayed_deposit"
            ? 25
            : 0
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
  ) + cardChoiceBonus(state, card.id, choice.id, bot) + alternativeChoiceBonus;
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
    const prediction = state.consultation?.predictedStrategy ?? null;
    const correctTarget =
      prediction === null ? -60 : action.predictedStrategy === prediction ? 22 : -40;
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

export function chooseBotAction(
  state: GameState,
  bot: BotId,
  useLegacyDirective = false,
): MajorAction {
  const valid = getValidActions(state, { useLegacyDirective });
  if (valid.length === 0) throw new Error("Bot has no valid actions in an active run.");
  if (bot === "long_horizon") return chooseLongHorizonAction(state, valid);

  const activation = valid.find((action) => action.type === "activate_brb");
  const civicReady =
    state.tracks.legitimacy >= 75 &&
    state.tracks.stability >= 75 &&
    state.institutions >= 55 &&
    state.pressures.panic < 60;
  const commandReady =
    state.archetypeId !== "operator" ||
    state.systemModifiers.includes("emergency_rule") ||
    state.advisors.fixer.leverage >= 60;
  // The civic seeker holds activation until every Civic Legacy condition passes,
  // accepting a compromised activation only when a loss is imminent — the
  // Corporation nearing victory or Panic nearing collapse.
  const civicSeekerReady =
    evaluateCivicLegacy(state).eligible
    || state.corporation.progress >= 75
    || state.pressures.panic >= 85;
  if (
    activation &&
    state.corporation.progress < 80 &&
    (bot !== "institutionalist" || civicReady) &&
    (bot !== "civic_seeker" || civicSeekerReady) &&
    (bot !== "command" || commandReady)
  ) return activation;

  const cardChoices = valid.filter(
    (action): action is Extract<MajorAction, { type: "resolve_card" }> =>
      action.type === "resolve_card",
  );
  const bestCard = cardChoices.sort(
    (a, b) => effectScore(state, b, bot) - effectScore(state, a, bot),
  )[0];
  if (bestCard && shouldResolvePresentedCard(state, bot)) return bestCard;

  const strengthen = valid.find((action) => action.type === "strengthen_faction");
  if (
    strengthen &&
    bot === "coalition" &&
    state.turn % 4 === 1
  ) return strengthen;

  const targetedProtection = valid.find((action) => action.type === "protect_institutions");
  if (
    targetedProtection &&
    ((bot === "defensive" && state.turn === 4) ||
      (bot === "institutionalist" && state.institutions < 30 && state.turn % 3 === 2))
  ) return targetedProtection;

  const predictedStrategy = state.consultation?.predictedStrategy ?? null;
  const counterThreshold = counterProgressThreshold(bot);
  const counter = predictedStrategy
    ? valid.find(
        (action) =>
          action.type === "counter_corporation" &&
          action.predictedStrategy === predictedStrategy,
      )
    : undefined;
  if (activation && counter) return counter;
  if (counter && state.corporation.progress >= counterThreshold) return counter;

  // The advisor-dependent bot never disciplines its advisors — accumulated
  // Leverage is the whole point of the profile — so it skips managing entirely.
  const leverageLimit =
    isOneOf(bot, ADVISOR_HEAVY_BOTS) ? Number.POSITIVE_INFINITY
    : bot === "fixer" ? 55
    : bot === "civic_seeker" ? 55
    : bot === "command" ? 86
    : state.archetypeId === "operator" ? 72
    : 65;
  const riskyAdvisor = ADVISOR_IDS.find(
    (id) => state.advisors[id].active && state.advisors[id].leverage >= leverageLimit,
  );
  const manage = valid.find(
    (action) => action.type === "manage_advisor" && action.advisorId === riskyAdvisor,
  );
  if (manage) return manage;

  const protect = valid.find((action) => action.type === "protect_institutions");
  const protectThreshold =
    bot === "civic_seeker" ? 50 : bot === "defensive" ? 38 : 25;
  if (protect && state.institutions <= protectThreshold) return protect;

  // The advisor-heavy profiles guard their consultation habit above all else:
  // when Intelligence runs low they restock so the monthly consult never lapses.
  if (isOneOf(bot, ADVISOR_HEAVY_BOTS) && state.resources.intelligence < 6) {
    const intelRecovery = valid.find(
      (action) => action.type === "recover_resource" && action.resource === "intelligence",
    );
    if (intelRecovery) return intelRecovery;
  }

  const lowestTrack = [...TRACK_KEYS].sort(
    (a, b) => state.tracks[a] - state.tracks[b],
  )[0] as (typeof TRACK_KEYS)[number];
  const focusTrack =
    bot === "engineering_first" && state.tracks.engineering < 50 ? "engineering" :
    bot === "access_first" && state.tracks.access < 50 ? "access" :
    bot === "legitimacy_first" && state.tracks.legitimacy < 50 ? "legitimacy" :
    bot === "stability_first" && state.tracks.stability < 50 ? "stability" :
    bot === "institutionalist" && state.tracks.legitimacy < 75 ? "legitimacy" :
    bot === "institutionalist" && state.tracks.stability < 75 ? "stability" :
    bot === "civic_seeker" && state.tracks.legitimacy < 75 ? "legitimacy" :
    bot === "civic_seeker" && state.tracks.stability < 75 ? "stability" :
    bot === "coalition" && state.tracks.legitimacy < 60 ? "legitimacy" :
    bot === "fixer" && state.tracks.access < 60 ? "access" :
    bot === "command" && state.tracks.access < 60 ? "access" :
    lowestTrack;
  const focusedDepositor = [
    "institutionalist",
    "civic_seeker",
    "command",
    "engineering_first",
    "legitimacy_first",
    "stability_first",
    "access_first",
  ].includes(bot);
  const preferredSize = state.tracks[focusTrack] < (focusedDepositor ? 60 : 32) ? "large" : "standard";
  const delayDeposit = bot === "delayed_deposit" && state.turn <= 5;
  const deposit = valid.find(
    (action) =>
      action.type === "deposit" &&
      action.track === focusTrack &&
      action.size === preferredSize,
  ) ?? valid.find(
    (action) =>
      action.type === "deposit" &&
      action.track === focusTrack &&
      action.size === "standard",
  );
  if (deposit && !delayDeposit) return deposit;

  const cost = DEPOSIT_COSTS[focusTrack];
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
  if (deposit) return deposit;
  return [...valid].sort((a, b) => scoreAction(state, b, bot) - scoreAction(state, a, bot))[0] as MajorAction;
}

function advisorForBot(state: GameState, bot: BotId): AdvisorId {
  if (bot === "long_horizon") return "analyst";
  if (["fixer", "command"].includes(bot)) return "fixer";
  if (["institutionalist", "coalition", "legitimacy_first", "stability_first", "defensive", "civic_seeker"].includes(bot)) {
    return "steward";
  }
  if (["rush", "engineering_first", "access_first"].includes(bot)) return "analyst";
  // The dependent profile leans hardest on whoever already has the most hold
  // over them — dependence concentrates, which is exactly how Leverage compounds
  // toward a single-advisor coup.
  if (bot === "advisor_dependent") {
    const active = ADVISOR_IDS.filter((id) => state.advisors[id].active);
    const primary = [...active].sort(
      (a, b) => state.advisors[b].leverage - state.advisors[a].leverage,
    )[0];
    if (primary) return primary;
  }
  // The cabal profile spreads reliance: it consults the lower of its two most
  // leveraged advisors, keeping a pair climbing in step toward the joint bar
  // without letting either run away into single-advisor coup territory.
  if (bot === "advisor_cabal") {
    const topTwo = ADVISOR_IDS
      .filter((id) => state.advisors[id].active)
      .sort((a, b) => state.advisors[b].leverage - state.advisors[a].leverage)
      .slice(0, 2);
    const laggard = [...topTwo].sort(
      (a, b) => state.advisors[a].leverage - state.advisors[b].leverage,
    )[0];
    if (laggard) return laggard;
  }
  // The prepared posture is hidden; steer the advisor choice off the last
  // observed move rather than peeking at the concealed strategy.
  const matching = ADVISOR_IDS.find(
    (id) => ADVISORS[id].crisisSpecialty === state.corporation.lastMove && state.advisors[id].active,
  );
  return matching ?? "fixer";
}

function shouldFixerConsult(state: GameState): boolean {
  const containmentIsImmediatelyUseful =
    !state.archetypeAbilityUsed &&
    state.activeCardId !== null &&
    !shouldResolvePresentedCard(state, "fixer");
  if (containmentIsImmediatelyUseful) return true;

  const affordableCounter = getValidActions(state).some(
    (action) => action.type === "counter_corporation",
  );
  return (
    state.corporation.progress >= 70 &&
    state.advisors.fixer.leverage <= 45 &&
    affordableCounter
  );
}

export function playBotRun(initialState: GameState, bot: BotId): {
  state: GameState;
  actionCounts: Record<ReturnType<typeof getActionCategory>, number>;
  consultationCounts: Record<AdvisorId, number>;
  trace: BotMonthTrace[];
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
  const trace: BotMonthTrace[] = [];

  while (state.phase !== "ended") {
    commitments += 1;
    if (commitments > BOT_NON_TERMINATION_GUARD_MONTHS) {
      throw new Error("Bot exceeded the 100-year simulation safety guard without reaching an ending.");
    }
    let consultationAdvisorId: keyof typeof ADVISORS | null = null;
    const wantsCounter = botIntendsToCounter(state, bot);
    const shouldConsult =
      state.resources.intelligence >= 2 &&
      (wantsCounter ||
        isOneOf(bot, ADVISOR_HEAVY_BOTS) ||
        (bot === "balanced" && state.turn % 3 === 0) ||
        (bot === "long_horizon" && state.turn % 4 === 0) ||
        (bot === "command" && state.advisors.fixer.leverage < 60) ||
        (["defensive", "coalition"].includes(bot) && state.turn % 2 === 0) ||
        (bot === "fixer" && shouldFixerConsult(state)) ||
        (isOneOf(bot, RUSH_BOTS) && state.turn % 4 === 0) ||
        (["legitimacy_first", "stability_first", "delayed_deposit", "civic_seeker"].includes(bot) && state.turn % 3 === 0));
    if (shouldConsult) {
      // When consulting to enable a counter, prefer the Analyst's more accurate
      // forecast; otherwise keep the bot's usual advisor personality. The Fixer
      // bot already consults the Fixer to counter (shouldFixerConsult), and the
      // dependent profile keeps its rotation — reliance is the point.
      const advisorId =
        wantsCounter && bot !== "fixer" && !isOneOf(bot, ADVISOR_HEAVY_BOTS) && state.advisors.analyst.active
          ? "analyst"
          : advisorForBot(state, bot);
      if (state.advisors[advisorId].active) {
        const result = consultAdvisor(
          state,
          advisorId,
          canUseArchetypeConsultation(state, advisorId),
        );
        if (result.accepted) {
          consultationCounts[advisorId] += 1;
          consultationAdvisorId = advisorId;
          state = result.state;
        }
      }
    }

    const activeCardId = state.activeCardId;
    const directiveReadyForSelection = Boolean(
      state.legacyDirective.equippedId
      && !state.legacyDirective.used
      && (
        state.legacyDirective.equippedId !== "continuity_freeze_order"
        || isCorporationResponseDue(state, getCompletionPressure(state).tier)
      )
    );
    const action = chooseBotAction(state, bot, directiveReadyForSelection);
    const confirmedCardAbandonment = activeCardId !== null && action.type !== "resolve_card";
    const useLegacyDirective = directiveReadyForSelection
      && action.type !== "activate_brb";
    actionCounts[getActionCategory(action)] += 1;
    const result = commitAction(
      state,
      action,
      {
        ...(confirmedCardAbandonment ? { confirmCardAbandonment: true } : {}),
        ...(useLegacyDirective ? { useLegacyDirective: true } : {}),
      },
    );
    if (!result.accepted) throw new Error(result.error ?? "Bot action was rejected.");
    state = result.state;
    if (!state.lastMonthAudit) throw new Error("Accepted bot action did not produce a monthly audit record.");
    trace.push({
      month: action.type === "activate_brb" ? state.turn : state.turn - 1,
      activeCardId,
      consultationAdvisorId,
      action,
      confirmedCardAbandonment,
      abandonedCardId: confirmedCardAbandonment ? activeCardId : null,
      tracks: { ...state.tracks },
      corporationProgress: state.corporation.progress,
      institutions: state.institutions,
      panic: state.pressures.panic,
      highestLeverage: Math.max(...Object.values(state.advisors).map((advisor) => advisor.leverage)),
      laborCoalitionStatus: state.routes.labor_coalition.status,
      audit: structuredClone(state.lastMonthAudit),
    });
  }

  return { state, actionCounts, consultationCounts, trace };
}
