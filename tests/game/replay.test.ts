import { describe, expect, it } from "vitest";
import {
  SITUATION_CARDS,
  buildDeclassifiedReport,
  canUseArchetypeConsultation,
  commitAction,
  consultAdvisor,
  createEmptyArchive,
  createGame,
  getEligibleSituationCards,
  mergeRunIntoArchive,
} from "../../src/game/index.js";
import type { GameState } from "../../src/game/index.js";

function exposeCard(state: GameState, cardId: string): GameState {
  const next = structuredClone(state);
  next.activeCardId = cardId;
  const existing = [...next.cardHistory].reverse().find(
    (encounter) => encounter.cardId === cardId && encounter.choiceId === null,
  );
  if (!existing) {
    next.cardHistory.push({
      cardId,
      turn: next.turn,
      choiceId: null,
      outcomeId: null,
      causedByDecisionId: next.deck.cardSources[cardId] ?? null,
    });
  }
  return next;
}

function finishRun(state: GameState): GameState {
  const ready = structuredClone(state);
  ready.activeCardId = null;
  ready.tracks = { engineering: 60, access: 60, legitimacy: 60, stability: 60 };
  ready.corporation.progress = 20;
  const result = commitAction(ready, { type: "activate_brb" });
  if (!result.accepted) throw new Error(result.error);
  return result.state;
}

describe("Situation Deck rules", () => {
  it("enforces Common cooldowns and Rare one-per-run limits", () => {
    const state = createGame(41);
    state.turn = 8;
    state.deck.drawCounts.budget_shortfall = 1;
    state.deck.lastDrawnTurn.budget_shortfall = 6;
    expect(getEligibleSituationCards(state).some((card) => card.id === "budget_shortfall")).toBe(false);

    state.turn = 10;
    expect(getEligibleSituationCards(state).some((card) => card.id === "budget_shortfall")).toBe(true);

    state.deck.drawCounts.intelligence_leak = 1;
    expect(getEligibleSituationCards(state).some((card) => card.id === "intelligence_leak")).toBe(false);
  });

  it("opens or closes Corporate Exposure and changes the future deck", () => {
    const followed = commitAction(exposeCard(createGame(51), "audit_discrepancy"), {
      type: "resolve_card",
      choiceId: "follow",
    }).state;
    expect(followed.deck.addedCardIds).toContain("silent_partner");
    expect(followed.routes.corporate_exposure.status).toBe("opened");
    expect(followed.deck.cardSources.silent_partner).toBe(
      followed.decisionHistory.find((decision) => decision.cardId === "audit_discrepancy")?.id,
    );

    const closed = commitAction(exposeCard(createGame(51), "audit_discrepancy"), {
      type: "resolve_card",
      choiceId: "close",
    }).state;
    expect(closed.deck.removedCardIds).toContain("silent_partner");
    expect(closed.routes.corporate_exposure.status).toBe("closed");
  });

  it("records immediate effects and echo provenance for every authored choice", () => {
    for (const card of SITUATION_CARDS) {
      for (const choice of card.choices) {
        expect(choice.echoes.length, `${card.id}:${choice.id}`).toBeGreaterThan(0);
        expect(choice.echoHint.length, `${card.id}:${choice.id}`).toBeGreaterThan(0);
      }
    }
    const result = commitAction(exposeCard(createGame(72), "budget_shortfall"), {
      type: "resolve_card",
      choiceId: "cut",
    });
    const decision = result.state.decisionHistory.find((item) => item.cardId === "budget_shortfall");
    expect(decision?.immediateDeltaScore).toBeGreaterThan(0);
    expect(decision?.echoTypes).toContain("ending");
    expect(result.state.history.some((entry) => entry.decisionId === decision?.id)).toBe(true);
  });
});

describe("counterfactual replay", () => {
  it("is deterministic until a changed choice creates a traceable divergence", () => {
    const first = exposeCard(createGame({ seed: 77, archetypeId: "technocrat", runId: "a" }), "audit_discrepancy");
    const second = exposeCard(createGame({ seed: 77, archetypeId: "technocrat", runId: "a" }), "audit_discrepancy");
    expect(first).toEqual(second);

    const followed = commitAction(first, { type: "resolve_card", choiceId: "follow" }).state;
    const closed = commitAction(second, { type: "resolve_card", choiceId: "close" }).state;
    expect(followed.history[0]).toEqual(closed.history[0]);
    expect(followed.routes.corporate_exposure.status).toBe("opened");
    expect(closed.routes.corporate_exposure.status).toBe("closed");
    expect(followed.decisionHistory[0]?.id).toBe(closed.decisionHistory[0]?.id);
  });

  it("builds a stable pivotal report and merges an Archive run only once", () => {
    const opened = commitAction(exposeCard(createGame({ seed: 91, runId: "archive-run" }), "audit_discrepancy"), {
      type: "resolve_card",
      choiceId: "close",
    }).state;
    const completed = finishRun(opened);
    expect(completed.report).toEqual(buildDeclassifiedReport(completed));
    expect(completed.report?.pivotalDecision.summary).toMatch(/audit/i);
    expect(completed.report?.unseenRouteHint.visibility).toBe("partial");
    expect(completed.report?.suggestedExperiment.length).toBeGreaterThan(20);

    const archive = mergeRunIntoArchive(createEmptyArchive(), completed);
    const duplicate = mergeRunIntoArchive(archive, completed);
    expect(duplicate).toEqual(archive);
    expect(archive.processedRunIds).toEqual(["archive-run"]);
    expect(archive.cards.audit_discrepancy?.encounters).toBe(1);
    expect(createGame(91).resources).toEqual(createGame(91).resources);
  });
});

describe("archetype replay differences", () => {
  it("applies the three consultation and liability rules", () => {
    const technocrat = consultAdvisor(createGame(12, "technocrat"), "analyst").state;
    expect(technocrat.consultation?.predictedStrategy).toBe(technocrat.corporation.strategy);

    const populist = createGame(13, "populist");
    const trustBefore = populist.resources.trust;
    const influenceBefore = populist.resources.influence;
    expect(canUseArchetypeConsultation(populist, "steward")).toBe(true);
    const converted = consultAdvisor(populist, "steward", true).state;
    expect(converted.resources.trust).toBe(trustBefore - 6);
    expect(converted.resources.influence).toBe(influenceBefore + 9);

    const operator = createGame(14, "operator");
    const leverageBefore = operator.advisors.fixer.leverage;
    const contained = consultAdvisor(operator, "fixer", true).state;
    expect(contained.suppressNextIgnoredCard).toBe(true);
    expect(contained.advisors.fixer.leverage).toBe(leverageBefore + 12);
  });
});
