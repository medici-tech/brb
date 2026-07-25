import { ADVISORS, ADVISOR_TAKEOVER_RULES } from "./content";
import { addHistory, clamp } from "./state-helpers";
import {
  ADVISOR_IDS,
  type ActionCategory,
  type AdvisorId,
  type GameState,
  type MajorAction,
} from "./types";

/**
 * A capped advisor (Leverage at or above the departure bar) seizes power rather
 * than resigning when the state is structurally dependent on them: Institutions
 * have weakened, or no other advisor remains active.
 */
export function isCoupCondition(state: GameState, advisorId: AdvisorId): boolean {
  const advisor = state.advisors[advisorId];
  if (!advisor.active || advisor.leverage < ADVISOR_TAKEOVER_RULES.coupLeverageMinimum) {
    return false;
  }
  const dependent =
    state.institutions <= ADVISOR_TAKEOVER_RULES.coupInstitutionsMaximum
    || ADVISOR_IDS.every((otherId) => otherId === advisorId || !state.advisors[otherId].active);
  return dependent;
}

/** Two or more active advisors at cabal-level Leverage jointly dominate. */
export function getCabalMembers(state: GameState): AdvisorId[] {
  return ADVISOR_IDS.filter(
    (advisorId) =>
      state.advisors[advisorId].active
      && state.advisors[advisorId].leverage >= ADVISOR_TAKEOVER_RULES.cabalMemberLeverageMinimum,
  );
}

export function getActionCategory(action: MajorAction): ActionCategory {
  if (action.type === "resolve_card") return "card";
  if (action.type === "counter_corporation") return "counter";
  if (action.type === "strengthen_faction") return "faction";
  if (action.type === "manage_advisor") return "advisor";
  if (action.type === "recover_resource") return "recover";
  if (action.type === "protect_institutions") return "institutions";
  if (action.type === "activate_brb") return "activate";
  return "deposit";
}

export function applyAdvisorReactions(
  state: GameState,
  category: ActionCategory,
): void {
  for (const advisorId of ADVISOR_IDS) {
    const definition = ADVISORS[advisorId];
    const advisor = state.advisors[advisorId];
    if (!advisor.active) continue;

    if (definition.agenda.includes(category)) {
      advisor.alignment = clamp(advisor.alignment + 4);
      advisor.loyalty = clamp(
        advisor.loyalty + 1,
        0,
        definition.loyaltyCeiling,
      );
    } else {
      advisor.alignment = clamp(advisor.alignment - 2);
      advisor.loyalty = clamp(advisor.loyalty - 2);
    }

    if (
      advisor.loyalty < definition.loyaltyBreakingPoint
      || advisor.leverage >= ADVISOR_TAKEOVER_RULES.coupLeverageMinimum
    ) {
      // A capped advisor the state depends on does not resign — they stay, and
      // the takeover resolves as an ending during the terminal check.
      if (isCoupCondition(state, advisorId)) {
        addHistory(
          state,
          "advisor",
          `${definition.name} no longer needs permission to stay.`,
        );
        continue;
      }
      advisor.active = false;
      addHistory(
        state,
        "advisor",
        advisor.leverage >= ADVISOR_TAKEOVER_RULES.coupLeverageMinimum
          ? `${definition.name} used accumulated leverage to leave on their own terms.`
          : `${definition.name} resigned after Loyalty fell below ${definition.loyaltyBreakingPoint}.`,
      );
    }
  }
}
