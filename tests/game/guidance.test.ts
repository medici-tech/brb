import { describe, expect, it } from "vitest";
import {
  actionKey,
  commitAction,
  consultAdvisor,
  createGame,
  getActionCost,
  getActionPreview,
  getAdvisorForecastAccuracy,
  getAdvisorRecommendation,
  getBriefing,
  getConsultationCost,
  getConsultationError,
  getCorporationPressure,
  getKnownActionDelta,
  getTurnEchoTypes,
  getValidActions,
} from "../../src/game/index.js";
import { ADVISOR_IDS, CORPORATION_STRATEGIES } from "../../src/game/types.js";

describe("cause-and-effect guidance", () => {
  it("shows exact costs without exposing classified delayed content", () => {
    const state = createGame(14, "technocrat");
    state.activeCardId = "audit_discrepancy";

    const preview = getActionPreview(state, { type: "resolve_card", choiceId: "close" });

    expect(preview.costs).toEqual(["3 Trust"]);
    expect(preview.result).toMatch(/secures money/i);
    expect(preview.result).not.toContain("+7");
    expect(preview.risk).toMatch(/loses 5 Trust/i);
    expect(preview.risk).toMatch(/advisor leverage/i);
    expect(preview.delayedConsequence).toMatch(/situation deck/i);
    expect(JSON.stringify(preview)).not.toMatch(/silent_partner|corporate_exposure|audit_closed/i);
  });

  it("stacks authored and doctrine card costs without treating damage as payment", () => {
    const state = createGame(141, "technocrat");
    state.activeCardId = "whistleblower";
    state.systemModifiers.push("closed_oversight");

    const preview = getActionPreview(state, {
      type: "resolve_card",
      choiceId: "contain",
    });

    expect(preview.costs).toEqual(["5 Influence", "5 Trust"]);
    expect(preview.risk).toMatch(/institutions/i);
  });

  it("distinguishes Standard and Large Deposits and reports affordability", () => {
    const state = createGame(15);
    state.activeCardId = null;
    const standard = getActionPreview(state, {
      type: "deposit",
      track: "engineering",
      size: "standard",
    });
    const large = getActionPreview(state, {
      type: "deposit",
      track: "engineering",
      size: "large",
    });

    expect(standard.costs).toEqual(["10 Money", "3 Intel", "7 Capacity"]);
    expect(large.costs).toEqual(["18 Money", "6 Intel", "13 Capacity"]);
    expect(standard.result).toMatch(/moderately/i);
    expect(large.result).toMatch(/substantially/i);
    expect(standard.knownChanges).toEqual([
      "Money −10",
      "Intel −3",
      "Capacity −7",
      "Engineering +25",
      "Corporation Threat +3",
    ]);

    state.resources.money = 0;
    expect(getActionPreview(state, {
      type: "deposit",
      track: "engineering",
      size: "standard",
    }).disabledReason).toMatch(/costs more resources/i);
  });

  it("keeps Situation outcomes qualitative while routine commitments expose exact known changes", () => {
    const state = createGame(151);
    state.activeCardId = "whistleblower";

    const card = getActionPreview(state, {
      type: "resolve_card",
      choiceId: "protect",
    });
    const routine = getActionPreview(
      { ...state, activeCardId: null },
      { type: "recover_resource", resource: "money" },
    );

    expect(card.costs).toEqual(["5 Intel"]);
    expect(card.knownChanges).toBeNull();
    expect(card.result).toMatch(/trust|institutions/i);
    expect(routine.knownChanges).toEqual([
      "Money +30",
      "Stress +7",
      "Corporation Progress +3",
    ]);
  });

  it("uses the same engine selectors for displayed costs and consultation eligibility", () => {
    const state = createGame(20, "operator");
    state.activeCardId = null;
    state.systemModifiers.push("emergency_rule");
    const counter = {
      type: "counter_corporation",
      predictedStrategy: "expanding",
    } as const;

    expect(getActionCost(state, counter)).toEqual({ intelligence: 5, influence: 2 });
    expect(getActionPreview(state, counter).costs).toEqual(["5 Intel", "2 Influence"]);
    expect(getConsultationCost(state)).toEqual({ intelligence: 2, leverage: 4 });

    state.resources.intelligence = 1;
    const error = getConsultationError(state, "fixer");
    expect(error).toBe("Consultation requires 2 Intelligence.");
    expect(consultAdvisor(state, "fixer").error).toBe(error);
  });

  it("keeps the Corporation counter a bet: outcome is never previewable", () => {
    const state = createGame(31, "technocrat");
    state.activeCardId = null;
    state.corporation.strategy = "infiltrating";
    for (const predictedStrategy of CORPORATION_STRATEGIES) {
      const counter = { type: "counter_corporation", predictedStrategy } as const;
      // The block-or-waste result depends on the hidden posture, so neither the
      // raw delta nor the preview's known changes may reveal which target is right.
      expect(getKnownActionDelta(state, counter)).toBeNull();
      expect(getActionPreview(state, counter).knownChanges).toBeNull();
    }
  });

  it("does not surface the prepared posture in the briefing", () => {
    const state = createGame(32, "technocrat");
    state.corporation.strategy = "discrediting";
    const briefing = getBriefing(state).join(" ");
    expect(briefing).not.toMatch(/Posture: discrediting/i);
    expect(briefing.toLowerCase()).toContain("hidden");
    expect(briefing.toLowerCase()).toContain("consult");
  });

  it("never recommends a blind counter when no forecast has been taken", () => {
    const state = createGame(33, "operator");
    state.activeCardId = null;
    // Make a counter attractive on paper (high Corporation progress) but with no
    // consultation, so the recommender must not steer into a blind guess.
    state.corporation.progress = 92;
    state.corporation.threat = 80;
    expect(state.consultation).toBeNull();
    for (const advisorId of ADVISOR_IDS) {
      const recommendation = getAdvisorRecommendation(state, advisorId);
      expect(recommendation?.action.type).not.toBe("counter_corporation");
    }
  });

  it("produces deterministic, legal, personality-specific advice", () => {
    const state = createGame(16);
    state.activeCardId = null;
    state.resources = {
      money: 100,
      influence: 100,
      intelligence: 100,
      trust: 100,
      capacity: 100,
    };
    state.institutions = 20;
    const analyst = getAdvisorRecommendation(state, "analyst", "expanding");
    const steward = getAdvisorRecommendation(state, "steward", "expanding");
    const validKeys = getValidActions(state).map(actionKey);

    expect(analyst).not.toBeNull();
    expect(steward).not.toBeNull();
    expect(validKeys).toContain(analyst?.actionKey);
    expect(validKeys).toContain(steward?.actionKey);
    expect(getAdvisorRecommendation(state, "analyst", "expanding")).toEqual(analyst);
    expect(analyst?.actionKey).not.toBe(steward?.actionKey);
    expect(steward?.action.type).toBe("protect_institutions");
  });

  it("uses Loyalty, memories, and false-plan doctrine in forecast quality", () => {
    const state = createGame(161, "operator");
    state.advisors.steward.loyalty = 50;
    const baseline = getAdvisorForecastAccuracy(state, "steward");

    state.advisors.steward.loyalty = 60;
    expect(getAdvisorForecastAccuracy(state, "steward")).toBeCloseTo(baseline + 4);

    state.advisorMemories.steward.push(
      "protected_whistleblower",
      "shared_activation_authority",
      "contained_budget_shortfall",
    );
    expect(getAdvisorForecastAccuracy(state, "steward")).toBeCloseTo(baseline + 16);

    state.systemModifiers.push("false_plan_in_circulation");
    expect(getAdvisorForecastAccuracy(state, "steward")).toBeCloseTo(baseline + 6);
  });

  it("records exact effects separately by source without revealing future IDs", () => {
    const state = createGame(17, "technocrat");
    state.activeCardId = "audit_discrepancy";
    state.cardHistory.push({
      cardId: "audit_discrepancy",
      turn: 1,
      choiceId: null,
      outcomeId: null,
      causedByDecisionId: null,
      status: "presented",
    });

    const result = commitAction(state, {
      type: "resolve_card",
      choiceId: "close",
    }).state.lastTurnResolution;

    expect(result?.commitment.delta.resources).toMatchObject({ money: 7, trust: -8 });
    expect(result?.commitment.delta.advisors.fixer).toMatchObject({ leverage: 3 });
    expect(result?.advisorReactions?.delta.advisors).toBeDefined();
    expect(JSON.stringify(result)).not.toMatch(/silent_partner|corporate_exposure|audit_closed/i);
  });

  it("combines ignored-Situation and commitment echoes from the resolved month", () => {
    const state = createGame(171);
    state.activeCardId = "budget_shortfall";
    state.cardHistory.push({
      cardId: "budget_shortfall",
      turn: state.turn,
      choiceId: null,
      outcomeId: null,
      causedByDecisionId: null,
      status: "presented",
    });

    const result = commitAction(
      state,
      { type: "recover_resource", resource: "money" },
      { confirmCardAbandonment: true },
    ).state;

    expect(getTurnEchoTypes(result, 1)).toContain("ending");
  });
});

describe("functional Corporation Threat", () => {
  it("maps Threat tiers to cadence and severity and combines them with completion pressure", () => {
    const state = createGame(18);
    state.activeCardId = null;
    state.tracks = { engineering: 0, access: 0, legitimacy: 0, stability: 0 };

    state.corporation.threat = 24;
    expect(getCorporationPressure(state)).toMatchObject({
      tier: "monitored",
      responseIntervalMonths: 5,
      severityMultiplier: 1,
    });
    state.corporation.threat = 25;
    expect(getCorporationPressure(state)).toMatchObject({
      tier: "mobilized",
      responseIntervalMonths: 5,
      severityMultiplier: 1.1,
    });
    state.corporation.threat = 50;
    expect(getCorporationPressure(state)).toMatchObject({
      tier: "aggressive",
      responseIntervalMonths: 4,
      severityMultiplier: 1.25,
    });
    state.corporation.threat = 75;
    expect(getCorporationPressure(state)).toMatchObject({
      tier: "critical",
      responseIntervalMonths: 3,
      severityMultiplier: 1.5,
    });

    state.tracks = { engineering: 50, access: 50, legitimacy: 0, stability: 0 };
    state.corporation.threat = 50;
    expect(getCorporationPressure(state).responseIntervalMonths).toBe(2);

    state.tracks = { engineering: 50, access: 50, legitimacy: 50, stability: 30 };
    state.corporation.threat = 75;
    expect(getCorporationPressure(state).responseIntervalMonths).toBe(1);
  });

  it("scales adverse Corporation effects but not Threat's own increase", () => {
    const state = createGame(19);
    state.activeCardId = null;
    state.turn = 5;
    state.corporation.lastResponseMonth = 0;
    state.corporation.strategy = "infiltrating";
    state.corporation.threat = 25;
    state.resources = {
      money: 100,
      influence: 100,
      intelligence: 100,
      trust: 100,
      capacity: 100,
    };

    const result = commitAction(state, {
      type: "recover_resource",
      resource: "money",
    }).state.lastTurnResolution?.corporationResponse;

    expect(result?.delta.resources).toMatchObject({ intelligence: -4, capacity: -5 });
    expect(result?.delta.corporationProgress).toBe(5);
    expect(result?.delta.corporationThreat).toBe(5);
  });
});
