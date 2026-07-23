import { getActiveCard, getCardChoiceCost } from "./cards";
import { DEPOSIT_COSTS } from "./content";
import {
  getLegacyDirectiveUseError,
  getResourcesAfterLegacyDirective,
} from "./directives";
import {
  RESOURCE_KEYS,
  TRACK_KEYS,
  type CommitOptions,
  type GameState,
  type MajorAction,
  type ResourcePool,
  type TrackKey,
} from "./types";

export function getDepositCost(
  track: TrackKey,
  size: "standard" | "large",
): ResourcePool {
  const multiplier = size === "large" ? 1.75 : 1;
  const cost = { ...DEPOSIT_COSTS[track] };
  for (const resource of RESOURCE_KEYS) {
    cost[resource] = Math.ceil(cost[resource] * multiplier);
  }
  return cost;
}

export function getActionCost(
  state: GameState,
  action: MajorAction,
): Partial<ResourcePool> {
  if (action.type === "deposit") {
    const cost: Partial<ResourcePool> = getDepositCost(action.track, action.size);
    if (
      action.track === "engineering"
      && state.systemModifiers.includes("replacement_contractors")
    ) {
      cost.capacity = (cost.capacity ?? 0) + 3;
    }
    return cost;
  }
  if (action.type === "resolve_card") {
    const choice = getActiveCard(state)?.choices.find(
      (candidate) => candidate.id === action.choiceId,
    );
    return choice ? getCardChoiceCost(state, choice) : {};
  }
  if (action.type === "counter_corporation") {
    return state.systemModifiers.includes("emergency_rule")
      ? { intelligence: 5, influence: 2 }
      : { intelligence: 7, influence: 3 };
  }
  if (action.type === "strengthen_faction") return { influence: 8 };
  if (action.type === "manage_advisor") return { influence: 4 };
  if (action.type === "protect_institutions") return { money: 6, trust: 4 };
  return {};
}

export function canAfford(
  resources: ResourcePool,
  cost: Partial<ResourcePool>,
): boolean {
  return RESOURCE_KEYS.every(
    (resource) => resources[resource] >= (cost[resource] ?? 0),
  );
}

export function spendResources(
  state: GameState,
  cost: Partial<ResourcePool>,
): void {
  for (const resource of RESOURCE_KEYS) {
    state.resources[resource] -= cost[resource] ?? 0;
  }
}

export function getActionError(
  state: GameState,
  action: MajorAction,
  options: CommitOptions = {},
): string | null {
  if (state.phase === "ended") return "The run has ended.";
  if (options.useLegacyDirective) {
    const directiveError = getLegacyDirectiveUseError(state, action);
    if (directiveError) return directiveError;
  }
  const availableResources = options.useLegacyDirective
    ? getResourcesAfterLegacyDirective(state)
    : state.resources;
  if (
    state.activeCardId
    && action.type !== "resolve_card"
    && !options.confirmCardAbandonment
  ) {
    return "Confirm that the active Situation Card will be abandoned before choosing another commitment.";
  }
  if (action.type === "deposit") {
    if (state.tracks[action.track] >= 100) {
      return "That BRB track is already complete at 100.";
    }
    if (!canAfford(availableResources, getActionCost(state, action))) {
      return "The deposit costs more resources than are available.";
    }
  }
  if (action.type === "resolve_card") {
    const card = getActiveCard(state);
    if (!card) return "There is no active Situation Card.";
    if (!card.choices.some((choice) => choice.id === action.choiceId)) {
      return "That choice does not belong to the active Situation Card.";
    }
    if (!canAfford(availableResources, getActionCost(state, action))) {
      return "That Situation choice costs more resources than are available.";
    }
  }
  if (action.type === "counter_corporation") {
    const cost = getActionCost(state, action);
    if (!canAfford(availableResources, cost)) {
      return `Countering the Corporation requires ${cost.intelligence} Intelligence and ${cost.influence} Influence.`;
    }
  }
  if (
    action.type === "strengthen_faction"
    && !canAfford(availableResources, getActionCost(state, action))
  ) {
    return "Strengthening the coalition requires 8 Influence.";
  }
  if (action.type === "manage_advisor") {
    if (!state.advisors[action.advisorId].active) {
      return "That advisor is no longer active.";
    }
    if (!canAfford(availableResources, getActionCost(state, action))) {
      return "Managing an advisor requires 4 Influence.";
    }
  }
  if (
    action.type === "protect_institutions"
    && !canAfford(availableResources, getActionCost(state, action))
  ) {
    return "Protecting institutions requires 6 Money and 4 Trust.";
  }
  if (
    action.type === "activate_brb"
    && TRACK_KEYS.some((track) => state.tracks[track] < 50)
  ) {
    return "Every BRB track must reach 50 before activation.";
  }
  return null;
}
