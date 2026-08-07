import { describe, expect, it } from "vitest";
import {
  SITUATION_CARDS,
  buildDeclassifiedReport,
  canUseArchetypeConsultation,
  claimLegacyDirective,
  commitAction,
  consultAdvisor,
  createEmptyArchive,
  createGame,
  createReplayIntent,
  getClearanceGainForEnding,
  getEligibleSituationCards,
  getEndingResultLabel,
  getOpeningAftermathForRun,
  getRouteCompletionKind,
  mergeRunIntoArchive,
  validateRouteIntegrity,
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
      status: "presented",
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
    expect(followed.routes.corporate_exposure.status).toBe("open");
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
    expect(
      result.state.cardHistory.find(
        (encounter) => encounter.cardId === "budget_shortfall" && encounter.choiceId === "cut",
      )?.status,
    ).toBe("resolved");
  });

  it("classifies ignored, suppressed, and expired card presentations", () => {
    const ignored = commitAction(
      exposeCard(createGame(73), "budget_shortfall"),
      { type: "recover_resource", resource: "money" },
      { confirmCardAbandonment: true },
    ).state;
    expect(
      ignored.cardHistory.find(
        (encounter) => encounter.cardId === "budget_shortfall" && encounter.choiceId === "ignored",
      )?.status,
    ).toBe("ignored");

    const operator = consultAdvisor(createGame(74, "operator"), "fixer", true).state;
    const suppressed = commitAction(
      exposeCard(operator, "budget_shortfall"),
      { type: "recover_resource", resource: "money" },
      { confirmCardAbandonment: true },
    ).state;
    expect(
      suppressed.cardHistory.find(
        (encounter) => encounter.cardId === "budget_shortfall" && encounter.choiceId === "suppressed",
      )?.status,
    ).toBe("suppressed");

    const expiring = exposeCard(createGame(75), "budget_shortfall");
    expiring.tracks = { engineering: 60, access: 60, legitimacy: 60, stability: 60 };
    expiring.corporation.progress = 20;
    const expired = commitAction(
      expiring,
      { type: "activate_brb" },
      { confirmCardAbandonment: true },
    ).state;
    expect(expired.cardHistory.at(-1)?.status).toBe("expired");
  });

  it("records legal route transitions with decision and turn provenance", () => {
    const opened = commitAction(exposeCard(createGame(81), "audit_discrepancy"), {
      type: "resolve_card",
      choiceId: "follow",
    }).state;
    const route = opened.routes.corporate_exposure;

    expect(route.transitions.map((transition) => `${transition.from}->${transition.to}`)).toEqual([
      "unseen->touched",
      "touched->open",
    ]);
    expect(route.openedByDecisionId).toBe(opened.decisionHistory[0]?.id);
    expect(route.openedTurn).toBe(opened.decisionHistory[0]?.turn);
    expect(validateRouteIntegrity(route)).toEqual([]);
  });

  it("requires an explicit reconciliation before a closed Labor Coalition completes", () => {
    const closed = commitAction(exposeCard(createGame(82), "protest_spark"), {
      type: "resolve_card",
      choiceId: "clear",
    }).state;
    expect(closed.routes.labor_coalition.status).toBe("closed");

    const reconciled = commitAction(exposeCard(closed, "national_march"), {
      type: "resolve_card",
      choiceId: "address",
    }).state;
    const route = reconciled.routes.labor_coalition;

    expect(route.status).toBe("completed");
    expect(route.transitions.slice(-2).map((transition) => transition.effect)).toEqual([
      "reopen",
      "complete",
    ]);
    expect(route.reopenedByDecisionId).toBe(route.completedByDecisionId);
    expect(getRouteCompletionKind(route)).toBe("reconciled");
    expect(validateRouteIntegrity(route)).toEqual([]);
  });

  it("rejects a completion that has no legitimate open or reopen", () => {
    const invalid = exposeCard(createGame(83), "silent_partner");
    expect(() => commitAction(invalid, { type: "resolve_card", choiceId: "seize" })).toThrow(
      /illegal corporate_exposure transition touched -> completed/i,
    );
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
    expect(followed.routes.corporate_exposure.status).toBe("open");
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

  it("derives a report without mutating the supplied final state", () => {
    const completed = finishRun(createGame({ seed: 93, runId: "pure-report" }));
    const before = structuredClone(completed);

    const report = buildDeclassifiedReport(completed);

    expect(report).toEqual(completed.report);
    expect(completed).toEqual(before);
  });

  it("separates a narrative card pivot from an irreversible strategic deposit", () => {
    let state = commitAction(exposeCard(createGame({ seed: 92, runId: "pivot-run" }), "audit_discrepancy"), {
      type: "resolve_card",
      choiceId: "close",
    }).state;
    state.resources = { money: 100, influence: 100, intelligence: 100, trust: 100, capacity: 100 };
    state = commitAction(
      state,
      { type: "deposit", track: "engineering", size: "large" },
      state.activeCardId ? { confirmCardAbandonment: true } : {},
    ).state;
    const completed = finishRun(state);

    expect(completed.report?.narrativePivot.summary).toMatch(/audit/i);
    expect(completed.report?.strategicPivot.summary).toMatch(/engineering deposit/i);
    expect(completed.report?.strategicPivot.decisionId).not.toBe(
      completed.report?.narrativePivot.decisionId,
    );
    expect(completed.report?.finalTurningPoint.turn).toBeGreaterThanOrEqual(completed.turn - 5);
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

describe("Clearance ladder and Necessary Regime aftermath", () => {
  function activateWithTracks(
    runId: string,
    tracks: GameState["tracks"],
    extras: Partial<Pick<GameState, "endingContributors">> = {},
  ): GameState {
    const state = createGame({ seed: 201, runId });
    state.activeCardId = null;
    state.tracks = tracks;
    state.corporation.progress = 20;
    if (extras.endingContributors) {
      state.endingContributors = extras.endingContributors;
    }
    return commitAction(state, { type: "activate_brb" }).state;
  }

  it("awards Clearance by ending grade and sets, preserves, then clears the aftermath scar", () => {
    const lossState = createGame({ seed: 202, runId: "clearance-loss" });
    lossState.activeCardId = null;
    lossState.turn = 5;
    lossState.corporation.progress = 99;
    lossState.corporation.lastResponseMonth = 0;
    const loss = commitAction(lossState, { type: "recover_resource", resource: "money" }).state;
    expect(loss.ending?.victory).toBe(false);

    let archive = mergeRunIntoArchive(createEmptyArchive(), loss);
    expect(archive.clearance).toBe(1);
    expect(archive.pendingScar).toBeNull();

    const compromised = activateWithTracks("clearance-compromised", {
      engineering: 50,
      access: 50,
      legitimacy: 50,
      stability: 50,
    });
    expect(compromised.ending?.id).toBe("compromised_activation");
    archive = mergeRunIntoArchive(archive, compromised);
    expect(archive.clearance).toBe(0);
    expect(archive.pendingScar).toBe("necessary_regime_aftermath");
    expect(archive.pendingDirectiveDraft?.candidateIds).toHaveLength(3);

    const draftId = archive.pendingDirectiveDraft?.candidateIds[0];
    if (!draftId) throw new Error("Expected a Directive draft after Clearance reached 3");
    archive = claimLegacyDirective(archive, draftId);

    const afterLoss = createGame({ seed: 203, runId: "clearance-loss-keeps-scar" });
    afterLoss.activeCardId = null;
    afterLoss.turn = 5;
    afterLoss.corporation.progress = 99;
    afterLoss.corporation.lastResponseMonth = 0;
    const secondLoss = commitAction(afterLoss, { type: "recover_resource", resource: "money" }).state;
    archive = mergeRunIntoArchive(archive, secondLoss);
    expect(archive.pendingScar).toBe("necessary_regime_aftermath");
    expect(archive.clearance).toBe(1);

    const civic = activateWithTracks(
      "clearance-civic",
      { engineering: 50, access: 50, legitimacy: 75, stability: 75 },
      { endingContributors: ["public_testimony"] },
    );
    expect(civic.ending?.id).toBe("civic_legacy");
    archive = mergeRunIntoArchive(archive, civic);
    expect(archive.pendingScar).toBeNull();
    expect(archive.clearance).toBe(1);
  });

  it("holds the scar back from a same-seed sample but spends it on an ordinary campaign", () => {
    const compromised = activateWithTracks("scar-provenance", {
      engineering: 50,
      access: 50,
      legitimacy: 50,
      stability: 50,
    });
    const archive = mergeRunIntoArchive(createEmptyArchive(), compromised);
    expect(archive.pendingScar).toBe("necessary_regime_aftermath");
    if (!compromised.report) throw new Error("Expected a report for the completed run");

    const sameSeed = createReplayIntent(compromised.report, "same_seed");
    const freshSeed = createReplayIntent(compromised.report, "fresh_seed");

    expect(getOpeningAftermathForRun(archive, sameSeed)).toBeNull();
    expect(getOpeningAftermathForRun(archive, freshSeed)).toBe("necessary_regime_aftermath");
    expect(getOpeningAftermathForRun(archive, null)).toBe("necessary_regime_aftermath");

    // Holding the scar back must not consume it.
    expect(archive.pendingScar).toBe("necessary_regime_aftermath");
    expect(getOpeningAftermathForRun(createEmptyArchive(), freshSeed)).toBeNull();
  });

  it("exposes ending result labels for report grades", () => {
    expect(getEndingResultLabel("civic_legacy")).toBe("VICTORY · CIVIC LEGACY");
    expect(getEndingResultLabel("compromised_activation")).toBe("VICTORY · COMPROMISED");
    expect(getEndingResultLabel("state_collapse")).toBe("LOSS");
    expect(getClearanceGainForEnding("civic_legacy")).toBe(3);
    expect(getClearanceGainForEnding("compromised_activation")).toBe(2);
    expect(getClearanceGainForEnding("corporate_capture")).toBe(1);
  });
});
