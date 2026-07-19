import { ADVISORS, CORPORATION_MOVES } from "./content";
import {
  canUseArchetypeConsultation,
  getActionCategory,
  getActionCost,
  getActionError,
  getActiveCard,
  getValidActions,
} from "./engine";
import { getCorporationPressure } from "./progression";
import {
  RESOURCE_KEYS,
  type ActionPreview,
  type AdvisorId,
  type AdvisorRecommendation,
  type CorporationStrategy,
  type GameState,
  type MajorAction,
  type ResourceKey,
  type StateDelta,
  type SituationCardChoice,
  type TrackKey,
} from "./types";

export const RESOURCE_LABELS: Record<ResourceKey, string> = {
  money: "Money",
  influence: "Influence",
  intelligence: "Intel",
  trust: "Trust",
  capacity: "Capacity",
};

export const TRACK_LABELS: Record<TrackKey, string> = {
  engineering: "Engineering",
  access: "Access",
  legitimacy: "Legitimacy",
  stability: "Stability",
};

export const RESOURCE_GUIDANCE: Record<ResourceKey, string> = {
  money: "Funding and material support for construction, protection, and crisis response.",
  influence: "Political capital used for access, coalitions, advisors, and counter-operations.",
  intelligence: "Information and covert capacity used for forecasts, investigations, and counterplay.",
  trust: "Public and institutional confidence. Many shortcuts spend it faster than it can be restored.",
  capacity: "The administration’s ability to execute difficult work.",
};

export const TRACK_GUIDANCE: Record<
  TrackKey,
  { question: string; sideEffect: string }
> = {
  engineering: {
    question: "Can the BRB function?",
    sideEffect: "Construction activity raises Corporation Threat.",
  },
  access: {
    question: "Can you control its activation infrastructure?",
    sideEffect: "Access work gives the Fixer additional Leverage.",
  },
  legitimacy: {
    question: "Will the public and institutions tolerate activation?",
    sideEffect: "Public scrutiny raises Stress and Corporation Threat.",
  },
  stability: {
    question: "Can the state survive the project and its aftermath?",
    sideEffect: "Stability reduces Stress but gives the Corporation time to advance.",
  },
};

const POSTURE_RISKS: Record<CorporationStrategy, string> = {
  expanding: "advances Corporation Progress directly",
  infiltrating: "targets Capacity and Intel",
  discrediting: "targets Trust and raises Panic",
  buying_influence: "targets Influence and strengthens the Fixer’s Leverage",
};

function titleCase(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCost(resource: ResourceKey, amount: number): string {
  return `${amount} ${RESOURCE_LABELS[resource]}`;
}

export function actionKey(action: MajorAction): string {
  if (action.type === "deposit") return `deposit:${action.track}:${action.size}`;
  if (action.type === "resolve_card") return `card:${action.choiceId}`;
  if (action.type === "counter_corporation") return `counter:${action.predictedStrategy}`;
  if (action.type === "manage_advisor") return `advisor:${action.advisorId}`;
  if (action.type === "recover_resource") return `recover:${action.resource}`;
  return action.type;
}

export function getActionLabel(state: GameState, action: MajorAction): string {
  if (action.type === "deposit") {
    return `${action.size === "large" ? "Large" : "Standard"} ${TRACK_LABELS[action.track]} Deposit`;
  }
  if (action.type === "resolve_card") {
    return getActiveCard(state)?.choices.find((choice) => choice.id === action.choiceId)?.label
      ?? "Resolve Situation";
  }
  if (action.type === "counter_corporation") {
    return `Counter ${titleCase(action.predictedStrategy)}`;
  }
  if (action.type === "strengthen_faction") return "Strengthen Coalition";
  if (action.type === "manage_advisor") return `Manage ${ADVISORS[action.advisorId].name}`;
  if (action.type === "recover_resource") return `Recover ${RESOURCE_LABELS[action.resource]}`;
  if (action.type === "protect_institutions") return "Protect Institutions";
  return "Activate BRB";
}

function actionCosts(state: GameState, action: MajorAction): string[] {
  const cost = getActionCost(state, action);
  const displayOrder = action.type === "counter_corporation"
    ? (["intelligence", "influence"] as const)
    : RESOURCE_KEYS;
  return displayOrder
    .filter((resource) => (cost[resource] ?? 0) > 0)
    .map((resource) => formatCost(resource, cost[resource] ?? 0));
}

function qualitativeCardResult(choice: SituationCardChoice): string {
  const results: string[] = [];
  const resourceGains = Object.entries(choice.effects.resources ?? {})
    .filter(([, amount]) => amount > 0)
    .map(([resource]) => RESOURCE_LABELS[resource as ResourceKey]);
  if (resourceGains.length > 0) results.push(`secures ${resourceGains.join(" and ")}`);
  const trackGains = Object.entries(choice.effects.tracks ?? {})
    .filter(([, amount]) => amount > 0)
    .map(([track]) => TRACK_LABELS[track as TrackKey]);
  if (trackGains.length > 0) results.push(`advances ${trackGains.join(" and ")}`);
  if ((choice.effects.institutions ?? 0) > 0) results.push("reinforces Institutions");
  if ((choice.effects.corporationProgress ?? 0) < 0) results.push("pushes back Corporation Progress");
  if ((choice.effects.corporationThreat ?? 0) < 0) results.push("reduces Corporation Threat");
  if ((choice.effects.pressures?.stress ?? 0) < 0) results.push("relieves Stress");
  if ((choice.effects.pressures?.panic ?? 0) < 0) results.push("reduces Panic");
  return results.length > 0
    ? `${titleCase(results.join("; "))}.`
    : "Resolves the immediate file without a material gain.";
}

function qualitativeCardRisk(state: GameState, choice: SituationCardChoice): string | null {
  const risks: string[] = [];
  if ((choice.effects.pressures?.stress ?? 0) > 0) risks.push("raises Stress");
  if ((choice.effects.pressures?.panic ?? 0) > 0) risks.push("raises Panic");
  if ((choice.effects.institutions ?? 0) < 0) risks.push("weakens Institutions");
  if ((choice.effects.corporationProgress ?? 0) > 0) risks.push("advances Corporation Progress");
  if ((choice.effects.corporationThreat ?? 0) > 0) risks.push("raises Corporation Threat");
  if (
    Object.values(choice.effects.advisors ?? {}).some((changes) => (changes.leverage ?? 0) > 0)
  ) risks.push("increases advisor Leverage");
  if (
    Object.values(choice.effects.advisors ?? {}).some(
      (changes) => (changes.loyalty ?? 0) < 0 || (changes.alignment ?? 0) < 0,
    )
  ) risks.push("damages advisor relationships");
  if (state.archetypeId === "populist" && choice.tags?.includes("public_betrayal")) {
    risks.push("triggers additional Panic under Populist doctrine");
  }
  return risks.length > 0 ? `${titleCase(risks.join("; "))}.` : null;
}

function delayedCategory(choice: SituationCardChoice): string {
  const categories = [...new Set(choice.echoes.map((echo) => {
    if (echo.type === "card") return "Situation Deck";
    if (echo.type === "relationship") return "advisor relationship";
    if (echo.type === "system") return "operating doctrine";
    return "final record";
  }))];
  return `Delayed Echo: ${categories.join(" and ")} may change; details remain classified.`;
}

export function getActionPreview(state: GameState, action: MajorAction): ActionPreview {
  const disabledReason = getActionError(state, action, { confirmCardAbandonment: true });
  const base = {
    actionKey: actionKey(action),
    label: getActionLabel(state, action),
    costs: actionCosts(state, action),
    delayedConsequence: null,
    permanent: false,
    disabledReason,
  };

  if (action.type === "resolve_card") {
    const choice = getActiveCard(state)?.choices.find((candidate) => candidate.id === action.choiceId);
    if (!choice) {
      return {
        ...base,
        result: "This Situation option is no longer available.",
        risk: null,
      };
    }
    return {
      ...base,
      result: qualitativeCardResult(choice),
      risk: qualitativeCardRisk(state, choice),
      delayedConsequence: delayedCategory(choice),
    };
  }

  if (action.type === "deposit") {
    return {
      ...base,
      result: action.size === "large"
        ? `Substantially advances ${TRACK_LABELS[action.track]} toward its 50-point readiness threshold.`
        : `Moderately advances ${TRACK_LABELS[action.track]} toward its 50-point readiness threshold.`,
      risk: TRACK_GUIDANCE[action.track].sideEffect,
      permanent: true,
    };
  }

  if (action.type === "counter_corporation") {
    return {
      ...base,
      result: "A correct forecast pushes back Corporation Progress and Threat.",
      risk: "A wrong forecast wastes the operation and raises Corporation Threat.",
    };
  }
  if (action.type === "strengthen_faction") {
    return {
      ...base,
      result: "Reinforces Trust and Institutions.",
      risk: null,
    };
  }
  if (action.type === "manage_advisor") {
    return {
      ...base,
      result: `Restores ${ADVISORS[action.advisorId].name}’s Loyalty and reduces their Leverage.`,
      risk: "Other advisors still judge the policy category chosen this month.",
    };
  }
  if (action.type === "recover_resource") {
    return {
      ...base,
      result: `Restores a major reserve of ${RESOURCE_LABELS[action.resource]}.`,
      risk: "Consumes the month, raises Stress, and gives the Corporation time to advance.",
    };
  }
  if (action.type === "protect_institutions") {
    return {
      ...base,
      result: "Reinforces Institutions and relieves Stress and Panic.",
      risk: null,
    };
  }
  return {
    ...base,
    result: "Ends the campaign and evaluates who controls the completed BRB.",
    risk: "Unsafe Corporation control, Panic, weak Institutions, or advisor Leverage can compromise activation.",
  };
}

function choiceValue(choice: SituationCardChoice, advisorId: AdvisorId): number {
  const trust = choice.effects.resources?.trust ?? 0;
  const influence = choice.effects.resources?.influence ?? 0;
  const intelligence = choice.effects.resources?.intelligence ?? 0;
  const capacity = choice.effects.resources?.capacity ?? 0;
  const institutions = choice.effects.institutions ?? 0;
  const panic = choice.effects.pressures?.panic ?? 0;
  const stress = choice.effects.pressures?.stress ?? 0;
  const corporation = choice.effects.corporationProgress ?? 0;
  const leverage = Object.values(choice.effects.advisors ?? {})
    .reduce((sum, changes) => sum + (changes.leverage ?? 0), 0);
  if (advisorId === "analyst") {
    return intelligence * 2 + capacity - corporation * 2 - stress;
  }
  if (advisorId === "fixer") {
    return influence * 2 + capacity + Math.max(0, -corporation) * 2 + leverage - Math.max(0, -trust) * 0.25;
  }
  return trust * 2 + institutions * 3 - panic * 3 - stress - leverage * 2;
}

function recommendationScore(
  state: GameState,
  advisorId: AdvisorId,
  action: MajorAction,
  predictedStrategy: CorporationStrategy,
): number {
  const category = getActionCategory(action);
  let score = ADVISORS[advisorId].agenda.includes(category) ? 45 : 10;
  if (action.type === "resolve_card") {
    const choice = getActiveCard(state)?.choices.find((candidate) => candidate.id === action.choiceId);
    if (choice) score += 50 + choiceValue(choice, advisorId);
  }
  if (action.type === "counter_corporation") {
    score += action.predictedStrategy === predictedStrategy ? 75 : -100;
    if (advisorId === "analyst") score += 30;
    if (advisorId === "fixer") score += 15;
  }
  if (action.type === "deposit") {
    if (advisorId === "analyst") score += action.size === "standard" ? 35 : 22;
    if (advisorId === "fixer" && action.track === "access") score += 28;
    if (advisorId === "steward" && ["legitimacy", "stability"].includes(action.track)) score += 32;
    if (advisorId === "steward" && action.size === "large") score -= 12;
  }
  if (action.type === "protect_institutions") {
    if (advisorId === "steward") score += state.institutions < 55 ? 90 : 35;
    if (advisorId === "analyst") score += state.pressures.panic > 65 ? 20 : 0;
  }
  if (action.type === "strengthen_faction") {
    if (advisorId === "fixer") score += 50;
    if (advisorId === "steward") score += 35;
  }
  if (action.type === "manage_advisor") {
    if (advisorId === "fixer") score += state.advisors[action.advisorId].leverage;
  }
  if (action.type === "recover_resource") {
    score += Math.max(0, 30 - state.resources[action.resource]);
    if (advisorId === "analyst" && ["intelligence", "capacity"].includes(action.resource)) score += 25;
    if (advisorId === "fixer" && action.resource === "influence") score += 25;
    if (advisorId === "steward" && action.resource === "trust") score += 30;
  }
  if (action.type === "activate_brb") score += advisorId === "fixer" ? 35 : 10;
  return score;
}

export function getAdvisorRecommendation(
  state: GameState,
  advisorId: AdvisorId,
  predictedStrategy: CorporationStrategy = state.corporation.strategy,
): AdvisorRecommendation | null {
  const actions = getValidActions(state);
  if (actions.length === 0) return null;
  const ranked = actions
    .map((action, index) => ({
      action,
      index,
      score: recommendationScore(state, advisorId, action, predictedStrategy),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const selected = ranked[0]?.action;
  if (!selected) return null;
  const preview = getActionPreview(state, selected);
  const personality = advisorId === "analyst"
    ? "The Analyst favors controlled, information-led commitments."
    : advisorId === "fixer"
      ? "The Fixer favors immediate control and accepts political dependence."
      : "The Steward favors public confidence and durable Institutions.";
  return {
    advisorId,
    action: selected,
    actionKey: actionKey(selected),
    actionLabel: preview.label,
    rationale: `${personality} ${preview.result}`,
    warning: preview.risk ?? "No immediate operational warning identified.",
  };
}

export function getArchetypeAbilityPreview(
  state: GameState,
  advisorId: AdvisorId,
): { name: string; cost: string; result: string } | null {
  if (!canUseArchetypeConsultation(state, advisorId)) return null;
  if (state.archetypeId === "populist" && advisorId === "steward") {
    return {
      name: "Spend the Mandate",
      cost: "Consultation cost + 6 Trust",
      result: "Converts public Trust into emergency Influence.",
    };
  }
  if (state.archetypeId === "operator" && advisorId === "fixer") {
    return {
      name: "Contain the Next File",
      cost: "Consultation cost + 8 Fixer Leverage",
      result: "Suppresses the immediate damage from the next ignored Situation.",
    };
  }
  return null;
}

export function describeCorporationPosture(strategy: CorporationStrategy): string {
  return `${CORPORATION_MOVES[strategy].name}: ${POSTURE_RISKS[strategy]}.`;
}

export function describeCorporationPressure(state: GameState): string {
  const pressure = getCorporationPressure(state);
  const severity = Math.round(pressure.severityMultiplier * 100);
  return `${titleCase(pressure.tier)} Threat makes Corporation moves ${severity}% effective and schedules a response every ${pressure.responseIntervalMonths} month${pressure.responseIntervalMonths === 1 ? "" : "s"}.`;
}

function signed(value: number): string {
  return `${value > 0 ? "+" : "−"}${Math.abs(value)}`;
}

export function formatStateDelta(delta: StateDelta): string[] {
  const lines: string[] = [];
  for (const resource of RESOURCE_KEYS) {
    const amount = delta.resources[resource];
    if (amount) lines.push(`${RESOURCE_LABELS[resource]} ${signed(amount)}`);
  }
  for (const pressure of ["stress", "panic"] as const) {
    const amount = delta.pressures[pressure];
    if (amount) lines.push(`${titleCase(pressure)} ${signed(amount)}`);
  }
  for (const track of Object.keys(TRACK_LABELS) as TrackKey[]) {
    const amount = delta.tracks[track];
    if (amount) lines.push(`${TRACK_LABELS[track]} ${signed(amount)}`);
  }
  if (delta.institutions) lines.push(`Institutions ${signed(delta.institutions)}`);
  if (delta.corporationProgress) {
    lines.push(`Corporation Progress ${signed(delta.corporationProgress)}`);
  }
  if (delta.corporationThreat) {
    lines.push(`Corporation Threat ${signed(delta.corporationThreat)}`);
  }
  for (const [advisorId, changes] of Object.entries(delta.advisors) as [
    AdvisorId,
    NonNullable<StateDelta["advisors"][AdvisorId]>,
  ][]) {
    for (const key of ["loyalty", "alignment", "leverage", "competence"] as const) {
      const amount = changes[key];
      if (typeof amount === "number" && amount !== 0) {
        lines.push(`${ADVISORS[advisorId].name} ${titleCase(key)} ${signed(amount)}`);
      }
    }
    if (changes.active === false) lines.push(`${ADVISORS[advisorId].name} departed`);
    if (changes.active === true) lines.push(`${ADVISORS[advisorId].name} returned`);
  }
  return lines;
}
