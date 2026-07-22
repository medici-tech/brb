import { ADVISORS } from "./content";
import { addHistory, clamp } from "./state-helpers";
import {
  ADVISOR_IDS,
  type ActionCategory,
  type GameState,
  type MajorAction,
} from "./types";

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
      || advisor.leverage >= 90
    ) {
      advisor.active = false;
      addHistory(
        state,
        "advisor",
        advisor.leverage >= 90
          ? `${definition.name} used accumulated leverage to leave on their own terms.`
          : `${definition.name} resigned after Loyalty fell below ${definition.loyaltyBreakingPoint}.`,
      );
    }
  }
}
