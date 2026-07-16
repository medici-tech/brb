import { describe, expect, it } from "vitest";
import { chooseBotAction, createGame } from "../../src/game/index.js";

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
});
