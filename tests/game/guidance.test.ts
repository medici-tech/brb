import { describe, expect, it } from "vitest";
import {
  actionKey,
  commitAction,
  consultAdvisor,
  createGame,
  getActionCost,
  getActionPreview,
  getAdvisorRecommendation,
  getConsultationCost,
  getConsultationError,
  getCorporationPressure,
  getValidActions,
} from "../../src/game/index.js";

describe("cause-and-effect guidance", () => {
  it("shows exact costs without exposing classified delayed content", () => {
    const state = createGame(14, "technocrat");
    state.activeCardId = "audit_discrepancy";

    const preview = getActionPreview(state, { type: "resolve_card", choiceId: "close" });

    expect(preview.costs).toEqual(["8 Trust"]);
    expect(preview.result).toMatch(/secures money/i);
    expect(preview.result).not.toContain("+7");
    expect(preview.risk).toMatch(/advisor leverage/i);
    expect(preview.delayedConsequence).toMatch(/situation deck/i);
    expect(JSON.stringify(preview)).not.toMatch(/silent_partner|corporate_exposure|audit_closed/i);
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

    state.resources.money = 0;
    expect(getActionPreview(state, {
      type: "deposit",
      track: "engineering",
      size: "standard",
    }).disabledReason).toMatch(/costs more resources/i);
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
});

describe("functional Corporation Threat", () => {
  it("maps Threat tiers to cadence and severity and combines them with completion pressure", () => {
    const state = createGame(18);
    state.activeCardId = null;
    state.tracks = { engineering: 0, access: 0, legitimacy: 0, stability: 0 };

    state.corporation.threat = 24;
    expect(getCorporationPressure(state)).toMatchObject({
      tier: "monitored",
      responseIntervalMonths: 4,
      severityMultiplier: 1,
    });
    state.corporation.threat = 25;
    expect(getCorporationPressure(state)).toMatchObject({
      tier: "mobilized",
      responseIntervalMonths: 4,
      severityMultiplier: 1.1,
    });
    state.corporation.threat = 50;
    expect(getCorporationPressure(state)).toMatchObject({
      tier: "aggressive",
      responseIntervalMonths: 3,
      severityMultiplier: 1.25,
    });
    state.corporation.threat = 75;
    expect(getCorporationPressure(state)).toMatchObject({
      tier: "critical",
      responseIntervalMonths: 2,
      severityMultiplier: 1.5,
    });

    state.tracks = { engineering: 50, access: 50, legitimacy: 0, stability: 0 };
    expect(getCorporationPressure(state).responseIntervalMonths).toBe(1);
  });

  it("scales adverse Corporation effects but not Threat's own increase", () => {
    const state = createGame(19);
    state.activeCardId = null;
    state.turn = 4;
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
