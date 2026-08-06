import { randomInt } from "./rng";
import { applyEffects, clamp } from "./state-helpers";
import {
  LEGACY_DIRECTIVE_IDS,
  RESOURCE_KEYS,
  type ArchetypeId,
  type GameState,
  type LegacyDirective,
  type LegacyDirectiveDraft,
  type LegacyDirectiveId,
  type MajorAction,
  type ResourcePool,
} from "./types";

const ARCHETYPE_LABELS: Record<ArchetypeId, string> = {
  technocrat: "Technocrat",
  populist: "Populist",
  operator: "Operator",
};

export const LEGACY_DIRECTIVES: Record<LegacyDirectiveId, LegacyDirective> = {
  emergency_appropriation: {
    id: "emergency_appropriation",
    title: "Emergency Appropriation",
    rarity: "common",
    description: "Release a reserve appropriation before one commitment.",
    benefit: "Money +12",
    warning: "Stress +4",
    effects: { resources: { money: 12 }, pressures: { stress: 4 } },
  },
  coalition_whip: {
    id: "coalition_whip",
    title: "Coalition Whip",
    rarity: "common",
    description: "Force a temporary legislative majority into line.",
    benefit: "Influence +8",
    warning: "Panic +5",
    effects: { resources: { influence: 8 }, pressures: { panic: 5 } },
  },
  protected_channel: {
    id: "protected_channel",
    title: "Protected Channel",
    rarity: "common",
    description: "Open a classified intelligence channel for one commitment.",
    benefit: "Intelligence +10",
    warning: "Corporation Threat +5",
    effects: { resources: { intelligence: 10 }, corporationThreat: 5 },
  },
  public_confidence_reserve: {
    id: "public_confidence_reserve",
    title: "Public Confidence Reserve",
    rarity: "common",
    description: "Spend accumulated public confidence before one commitment.",
    benefit: "Trust +10",
    warning: "Corporation Progress +4",
    effects: { resources: { trust: 10 }, corporationProgress: 4 },
  },
  industrial_surge: {
    id: "industrial_surge",
    title: "Industrial Surge",
    rarity: "common",
    description: "Command a temporary industrial mobilization.",
    benefit: "Capacity +8",
    warning: "Institutions −5",
    effects: { resources: { capacity: 8 }, institutions: -5 },
  },
  continuity_freeze_order: {
    id: "continuity_freeze_order",
    title: "Continuity Freeze Order",
    rarity: "rare",
    description: "Freeze the Corporation's scheduled response for one month.",
    benefit: "Prevent this month’s Corporation response",
    warning: "Institutions −10 · Panic +6",
    effects: { pressures: { panic: 6 }, institutions: -10 },
    preventCorporationResponse: true,
  },
  containment_brief: {
    id: "containment_brief",
    title: "Containment Brief",
    rarity: "rare",
    description: "Authorize a quiet Fixer containment package before one commitment.",
    benefit: "Influence +6",
    warning: "Fixer Leverage +6",
    effects: {
      resources: { influence: 6 },
      advisors: { fixer: { leverage: 6 } },
    },
    requiredArchetypeId: "operator",
  },
};

/** Returns a player-facing reason when a Directive cannot equip for this doctrine. */
export function getLegacyDirectiveEquipError(
  archetypeId: ArchetypeId,
  directiveId: LegacyDirectiveId | null | undefined,
): string | null {
  if (!directiveId) return null;
  const required = LEGACY_DIRECTIVES[directiveId].requiredArchetypeId;
  if (!required || required === archetypeId) return null;
  return `${LEGACY_DIRECTIVES[directiveId].title} requires the ${ARCHETYPE_LABELS[required]} doctrine.`;
}

export const INITIAL_DIRECTIVE_REWARD_SEED = 0x4c454741;

export function getEquippedDirective(state: GameState): LegacyDirective | null {
  const id = state.legacyDirective.equippedId;
  return id ? LEGACY_DIRECTIVES[id] : null;
}

export function getLegacyDirectiveUseError(
  state: GameState,
  action: MajorAction,
): string | null {
  if (!state.legacyDirective.equippedId) {
    return "No Legacy Directive is equipped for this campaign.";
  }
  if (state.legacyDirective.used) {
    return "The equipped Legacy Directive has already been used this campaign.";
  }
  if (action.type === "activate_brb") {
    return "A Legacy Directive cannot be attached to the final activation order.";
  }
  return null;
}

export function getResourcesAfterLegacyDirective(
  state: GameState,
  startingResources: ResourcePool = state.resources,
): ResourcePool {
  const resources = { ...startingResources };
  const effects = getEquippedDirective(state)?.effects.resources ?? {};
  for (const resource of RESOURCE_KEYS) {
    resources[resource] = clamp(resources[resource] + (effects[resource] ?? 0));
  }
  return resources;
}

export function applyLegacyDirective(state: GameState): LegacyDirective {
  const directive = getEquippedDirective(state);
  if (!directive) throw new Error("No Legacy Directive is equipped.");
  applyEffects(state, directive.effects);
  return directive;
}

export function drawLegacyDirectiveDraft(
  rngState: number,
  unlockedDirectiveIds: readonly LegacyDirectiveId[],
): { draft: LegacyDirectiveDraft | null; rngState: number } {
  const unlocked = new Set(unlockedDirectiveIds);
  const remaining = LEGACY_DIRECTIVE_IDS.filter((id) => !unlocked.has(id));
  const candidates: LegacyDirectiveId[] = [];
  let nextState = rngState >>> 0;

  while (remaining.length > 0 && candidates.length < 3) {
    const weighted = remaining.flatMap((id) =>
      Array(LEGACY_DIRECTIVES[id].rarity === "common" ? 4 : 1).fill(id),
    );
    const drawn = randomInt(nextState, weighted.length);
    nextState = drawn.state;
    const id = weighted[drawn.value];
    if (!id) break;
    candidates.push(id);
    remaining.splice(remaining.indexOf(id), 1);
  }

  return {
    draft: candidates.length > 0 ? { candidateIds: candidates } : null,
    rngState: nextState,
  };
}
