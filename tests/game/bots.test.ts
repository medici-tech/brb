import { describe, expect, it } from "vitest";
import { chooseBotAction, createGame, playBotRun } from "../../src/game/index.js";

describe("replay-aware bot policy", () => {
  it("values opening Corporate Exposure over the better immediate audit payout", () => {
    const state = createGame(52, "technocrat");
    state.turn = 4;
    state.activeCardId = "audit_discrepancy";

    expect(chooseBotAction(state, "balanced")).toEqual({
      type: "resolve_card",
      choiceId: "follow",
    });
  });

  it("prioritizes and completes a chain follow-up once it appears", () => {
    const state = createGame(53, "operator");
    state.activeCardId = "silent_partner";
    state.flags.push("audit_started");
    state.deck.addedCardIds.push("silent_partner");

    expect(chooseBotAction(state, "balanced")).toEqual({
      type: "resolve_card",
      choiceId: "seize",
    });
  });

  it("lets covert strategies choose the contaminated Corporate Exposure deal", () => {
    const state = createGame({ seed: 7, archetypeId: "operator" });
    state.turn = 6;
    state.activeCardId = "silent_partner";
    state.deck.addedCardIds.push("silent_partner");

    expect(chooseBotAction(state, "fixer")).toEqual({
      type: "resolve_card",
      choiceId: "deal",
    });
    expect(chooseBotAction(state, "command")).toEqual({
      type: "resolve_card",
      choiceId: "deal",
    });
  });

  it("consults the Fixer only when the forecast supports an immediate counter", () => {
    const routine = createGame(81, "operator");
    routine.turn = 2;

    const routineRun = playBotRun(routine, "fixer");
    expect(routineRun.trace[0]?.consultationAdvisorId).toBeNull();

    const danger = createGame(81, "operator");
    danger.activeCardId = null;
    danger.corporation.progress = 70;

    const dangerRun = playBotRun(danger, "fixer");
    expect(dangerRun.trace[0]).toMatchObject({
      consultationAdvisorId: "fixer",
      action: { type: "counter_corporation" },
    });
  });

  it("consults the Fixer when containment will suppress an ignored card", () => {
    const state = createGame(82, "operator");
    state.activeCardId = "budget_shortfall";
    state.cardHistory.push(
      {
        cardId: "audit_discrepancy",
        turn: 1,
        choiceId: "close",
        outcomeId: "audit_closed",
        causedByDecisionId: null,
        status: "resolved",
      },
      {
        cardId: "whistleblower",
        turn: 2,
        choiceId: "contain",
        outcomeId: "whistleblower_contained",
        causedByDecisionId: null,
        status: "resolved",
      },
      {
        cardId: "budget_shortfall",
        turn: state.turn,
        choiceId: null,
        outcomeId: null,
        causedByDecisionId: null,
        status: "presented",
      },
    );

    const result = playBotRun(state, "fixer");

    expect(result.trace[0]).toMatchObject({
      consultationAdvisorId: "fixer",
      confirmedCardAbandonment: true,
    });
  });
});
