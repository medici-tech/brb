import { describe, expect, it } from "vitest";
import {
  ADVISORS,
  CORPORATION_MOVES,
  DEPOSIT_COSTS,
  SITUATION_CARDS,
  SITUATION_CHAINS,
  commitAction,
  consultAdvisor,
  createGame,
  deserializeGame,
  formatCampaignTime,
  getActionCost,
  getCompletionPressure,
  getCorporationResponseInterval,
  serializeGame,
} from "../../src/game/index.js";

describe("Phase 1.5 content lock", () => {
  it("ships the agreed Situation Deck, chain, and Corporation move counts", () => {
    expect(SITUATION_CARDS).toHaveLength(15);
    expect(SITUATION_CHAINS).toHaveLength(2);
    expect(Object.keys(CORPORATION_MOVES)).toHaveLength(4);
    expect(new Set(SITUATION_CARDS.map((card) => card.type))).toEqual(
      new Set(["crisis", "advisor", "corporation"]),
    );
    expect(SITUATION_CARDS.filter((card) => card.rarity === "common")).toHaveLength(10);
    expect(SITUATION_CARDS.filter((card) => card.rarity === "rare")).toHaveLength(5);
    expect(SITUATION_CARDS.every((card) => card.choices.every((choice) => choice.echoes.length > 0))).toBe(true);
    expect(SITUATION_CARDS.every((card) => card.ignoredOutcome.echoes.length > 0)).toBe(true);
    expect(
      SITUATION_CARDS.every((card) =>
        card.choices.every((choice) =>
          Object.values(choice.costs).every((cost) => Number.isFinite(cost) && cost >= 0),
        ),
      ),
    ).toBe(true);
  });

  it("gives each BRB track a different resource cost", () => {
    const signatures = Object.values(DEPOSIT_COSTS).map((cost) => JSON.stringify(cost));
    expect(new Set(signatures).size).toBe(4);
  });
});

describe("seeded runs", () => {
  it("creates the same state from the same seed and archetype", () => {
    expect(createGame(42, "populist")).toEqual(createGame(42, "populist"));
  });

  it("round-trips a run through a local-save-safe JSON string", () => {
    const state = createGame(99, "operator");
    expect(deserializeGame(serializeGame(state))).toEqual(state);
  });

  it("persists the Corporation cadence clock after a response", () => {
    const state = createGame(100);
    state.activeCardId = null;
    state.turn = 4;
    state.resources = { money: 100, influence: 100, intelligence: 100, trust: 100, capacity: 100 };
    const responded = commitAction(state, { type: "recover_resource", resource: "money" }).state;

    expect(responded.lastMonthAudit?.corporationResponded).toBe(true);
    expect(responded.corporation.lastResponseMonth).toBe(4);
    expect(deserializeGame(serializeGame(responded))).toEqual(responded);
  });

  it("migrates an older version-3 save to a deterministic cadence clock", () => {
    const legacy = JSON.parse(serializeGame(createGame(102)));
    legacy.version = 3;
    legacy.turn = 9;
    delete legacy.corporation.lastResponseMonth;
    delete legacy.lastMonthAudit;
    delete legacy.lastTurnResolution;

    const restored = deserializeGame(JSON.stringify(legacy));
    expect(restored.version).toBe(4);
    expect(restored.corporation.lastResponseMonth).toBe(8);
    expect(restored.lastMonthAudit).toBeNull();
    expect(restored.lastTurnResolution).toBeNull();
  });

  it("rejects a malformed current-version save instead of repairing it", () => {
    const malformed = JSON.parse(serializeGame(createGame(103)));
    delete malformed.corporation.lastResponseMonth;

    expect(() => deserializeGame(JSON.stringify(malformed))).toThrow(
      /unsupported or invalid BRB save/i,
    );
  });
});

describe("consultation phase", () => {
  it("allows one consultation without consuming the major action", () => {
    const initial = createGame(12);
    const first = consultAdvisor(initial, "analyst");

    expect(first.accepted).toBe(true);
    expect(first.state.turn).toBe(initial.turn);
    expect(first.state.resources.intelligence).toBe(initial.resources.intelligence - 2);
    expect(first.state.advisors.analyst.leverage).toBeGreaterThan(
      initial.advisors.analyst.leverage,
    );

    const second = consultAdvisor(first.state, "fixer");
    expect(second.accepted).toBe(false);
    expect(second.error).toMatch(/one consultation/i);
  });
});

describe("major commitments", () => {
  it.each([
    ["analyst", ADVISORS.analyst.loyaltyBreakingPoint],
    ["fixer", ADVISORS.fixer.loyaltyBreakingPoint],
    ["steward", ADVISORS.steward.loyaltyBreakingPoint],
  ] as const)(
    "keeps %s at or above the Loyalty threshold and removes them below it",
    (advisorId, threshold) => {
      const resolveAtPostReactionLoyalty = (loyalty: number) => {
        const state = createGame(301);
        state.activeCardId = null;
        state.resources = {
          money: 100,
          influence: 100,
          intelligence: 100,
          trust: 100,
          capacity: 100,
        };
        for (const advisor of Object.values(state.advisors)) advisor.loyalty = 100;
        state.advisors[advisorId].loyalty = loyalty;
        return commitAction(state, { type: "recover_resource", resource: "money" }).state;
      };

      const above = resolveAtPostReactionLoyalty(threshold + 3);
      expect(above.advisors[advisorId]).toMatchObject({
        active: true,
        loyalty: threshold + 1,
      });

      const at = resolveAtPostReactionLoyalty(threshold + 2);
      expect(at.advisors[advisorId]).toMatchObject({
        active: true,
        loyalty: threshold,
      });

      const below = resolveAtPostReactionLoyalty(threshold + 1);
      expect(below.advisors[advisorId]).toMatchObject({
        active: false,
        loyalty: threshold - 1,
      });
    },
  );

  it("uses Leverage 90, but not 89, as an advisor departure threshold", () => {
    const state = createGame(302);
    state.activeCardId = null;
    state.resources = {
      money: 100,
      influence: 100,
      intelligence: 100,
      trust: 100,
      capacity: 100,
    };
    state.advisors.analyst.leverage = 89;
    state.advisors.fixer.leverage = 90;

    const result = commitAction(
      state,
      { type: "recover_resource", resource: "money" },
    ).state;

    expect(result.advisors.analyst.active).toBe(true);
    expect(result.advisors.fixer.active).toBe(false);
  });

  it("changes Alignment and Loyalty according to approval without using low Alignment to remove an advisor", () => {
    const state = createGame(303);
    state.activeCardId = null;
    state.resources = {
      money: 100,
      influence: 100,
      intelligence: 100,
      trust: 100,
      capacity: 100,
    };
    state.advisors.analyst.alignment = 0;
    const before = structuredClone(state.advisors);

    const result = commitAction(state, {
      type: "deposit",
      track: "engineering",
      size: "standard",
    }).state;

    expect(result.advisors.analyst).toMatchObject({
      active: true,
      alignment: 4,
      loyalty: before.analyst.loyalty + 1,
    });
    expect(result.advisors.steward).toMatchObject({
      alignment: before.steward.alignment + 4,
      loyalty: before.steward.loyalty + 1,
    });
    expect(result.advisors.fixer).toMatchObject({
      alignment: before.fixer.alignment - 2,
      loyalty: before.fixer.loyalty - 2,
    });
  });

  it("ends the campaign when the final commitment drives every advisor below Loyalty", () => {
    const state = createGame(304);
    state.activeCardId = null;
    state.resources = {
      money: 100,
      influence: 100,
      intelligence: 100,
      trust: 100,
      capacity: 100,
    };
    for (const advisorId of Object.keys(ADVISORS) as (keyof typeof ADVISORS)[]) {
      state.advisors[advisorId].loyalty =
        ADVISORS[advisorId].loyaltyBreakingPoint + 1;
    }

    const result = commitAction(
      state,
      { type: "recover_resource", resource: "money" },
    ).state;

    expect(Object.values(result.advisors).every((advisor) => !advisor.active)).toBe(true);
    expect(result.ending).toMatchObject({
      id: "state_collapse",
      reason: "No advisor remained willing to operate the government.",
    });
  });

  it("uses only the pressure tier to determine Corporation response cadence", () => {
    expect({
      quiet: getCorporationResponseInterval("quiet"),
      watched: getCorporationResponseInterval("watched"),
      contested: getCorporationResponseInterval("contested"),
      severe: getCorporationResponseInterval("severe"),
      critical: getCorporationResponseInterval("critical"),
    }).toEqual({ quiet: 4, watched: 3, contested: 2, severe: 1, critical: 1 });
  });

  it("resumes a saved Quiet cadence without resetting its response clock", () => {
    let state = createGame(101);
    state.activeCardId = null;
    state.resources = { money: 100, influence: 100, intelligence: 100, trust: 100, capacity: 100 };
    state.tracks = { engineering: 0, access: 0, legitimacy: 0, stability: 0 };

    for (const expectedMonth of [1, 2, 3]) {
      const result = commitAction(state, { type: "recover_resource", resource: "money" });
      expect(result.state.lastMonthAudit?.month).toBe(expectedMonth);
      expect(result.state.lastMonthAudit?.corporationResponded).toBe(false);
      state = deserializeGame(serializeGame(result.state));
      state.activeCardId = null;
    }

    const monthFour = commitAction(state, { type: "recover_resource", resource: "money" }).state;
    expect(monthFour.lastMonthAudit?.corporationResponded).toBe(true);
    expect(monthFour.corporation.lastResponseMonth).toBe(4);
  });

  it("treats commitments as months without ending at an arbitrary deadline", () => {
    const state = createGame(2);
    state.activeCardId = null;
    state.turn = 120;
    state.resources = { money: 100, influence: 100, intelligence: 100, trust: 100, capacity: 100 };
    state.corporation.progress = 0;
    state.pressures = { stress: 0, panic: 0 };
    state.institutions = 100;

    const result = commitAction(state, { type: "recover_resource", resource: "money" });

    expect(result.accepted).toBe(true);
    expect(result.state.phase).not.toBe("ended");
    expect(result.state.turn).toBe(121);
    expect(formatCampaignTime(120)).toBe("Campaign Month 120 · Year 10");
  });

  it("raises monthly pressure as BRB completion approaches readiness", () => {
    const state = createGame(3);
    state.tracks = { engineering: 0, access: 0, legitimacy: 0, stability: 0 };
    expect(getCompletionPressure(state)).toMatchObject({
      tier: "quiet",
      corporationProgressEveryMonths: null,
      panicEveryMonths: null,
    });

    state.tracks.engineering = 50;
    expect(getCompletionPressure(state)).toMatchObject({
      tier: "watched",
      corporationProgressEveryMonths: 4,
      panicEveryMonths: null,
    });

    state.tracks.access = 50;
    expect(getCompletionPressure(state)).toMatchObject({
      tier: "contested",
      corporationProgressEveryMonths: 3,
      panicEveryMonths: null,
    });

    state.tracks.legitimacy = 50;
    expect(getCompletionPressure(state)).toMatchObject({
      tier: "severe",
      corporationProgressEveryMonths: 2,
      panicEveryMonths: 4,
    });

    state.tracks.stability = 30;
    expect(getCompletionPressure(state)).toMatchObject({
      tier: "critical",
      corporationProgressEveryMonths: 1,
      panicEveryMonths: 3,
    });
  });

  it("applies the critical surcharge during an eligible month", () => {
    const low = createGame(8);
    low.activeCardId = null;
    low.turn = 12;
    low.tracks = { engineering: 0, access: 0, legitimacy: 0, stability: 0 };
    low.resources = { money: 100, influence: 100, intelligence: 100, trust: 100, capacity: 100 };
    low.corporation.progress = 0;
    low.corporation.strategy = "expanding";
    low.pressures = { stress: 0, panic: 0 };
    low.institutions = 100;

    const critical = structuredClone(low);
    critical.tracks = { engineering: 50, access: 50, legitimacy: 50, stability: 30 };
    const lowResult = commitAction(low, { type: "recover_resource", resource: "money" });
    const criticalResult = commitAction(critical, { type: "recover_resource", resource: "money" });

    expect(criticalResult.state.corporation.progress).toBe(lowResult.state.corporation.progress + 1);
    expect(criticalResult.state.pressures.panic).toBe(lowResult.state.pressures.panic + 1);
  });

  it("permanently transfers deposit costs and advances exactly one turn", () => {
    const initial = createGame(3, "technocrat");
    initial.activeCardId = null;
    initial.corporation.strategy = "expanding";
    const before = structuredClone(initial);

    const result = commitAction(initial, {
      type: "deposit",
      track: "engineering",
      size: "standard",
    });

    expect(result.accepted).toBe(true);
    expect(result.state.turn).toBe(before.turn + 1);
    expect(result.state.deposited.money).toBe(10);
    expect(result.state.deposited.intelligence).toBe(3);
    expect(result.state.deposited.capacity).toBe(7);
    expect(result.state.resources.money).toBe(before.resources.money - 10);
    expect(result.state.tracks.engineering).toBe(before.tracks.engineering + 25);
    expect(initial).toEqual(before);
  });

  it("adds 40 progress for a large deposit without changing its 175% cost", () => {
    const initial = createGame(4, "technocrat");
    initial.activeCardId = null;
    initial.resources = { money: 100, influence: 100, intelligence: 100, trust: 100, capacity: 100 };
    const result = commitAction(initial, { type: "deposit", track: "engineering", size: "large" });

    expect(result.state.tracks.engineering).toBe(initial.tracks.engineering + 40);
    expect(result.state.deposited.money).toBe(18);
    expect(result.state.deposited.intelligence).toBe(6);
    expect(result.state.deposited.capacity).toBe(13);
  });

  it("requires explicit confirmation before abandoning an active card", () => {
    const initial = createGame(73);
    initial.activeCardId = "budget_shortfall";
    initial.cardHistory.push({
      cardId: "budget_shortfall",
      turn: initial.turn,
      choiceId: null,
      outcomeId: null,
      causedByDecisionId: null,
      status: "presented",
    });
    const before = structuredClone(initial);

    const rejected = commitAction(initial, { type: "recover_resource", resource: "money" });
    expect(rejected.accepted).toBe(false);
    expect(rejected.error).toMatch(/confirm/i);
    expect(rejected.state).toEqual(before);

    const confirmed = commitAction(
      initial,
      { type: "recover_resource", resource: "money" },
      { confirmCardAbandonment: true },
    );
    expect(confirmed.accepted).toBe(true);
    expect(
      confirmed.state.cardHistory.some(
        (encounter) => encounter.cardId === "budget_shortfall" && encounter.status === "ignored",
      ),
    ).toBe(true);
    expect(confirmed.state.decisionHistory.at(-2)?.choiceId).toBe("ignored");
    expect(confirmed.state.decisionHistory.at(-1)?.category).toBe("recover");
  });

  it("blocks the Corporation when the player counters the predicted strategy", () => {
    const initial = createGame(5);
    initial.activeCardId = null;
    initial.turn = 4;
    initial.corporation.strategy = "expanding";
    initial.corporation.progress = 30;
    const result = commitAction(initial, {
      type: "counter_corporation",
      predictedStrategy: "expanding",
    });

    expect(result.accepted).toBe(true);
    expect(result.state.corporation.progress).toBe(22);
    expect(result.state.corporation.lastMove).toBe("expanding");
    expect(result.state.history.some((entry) => entry.message === "Expand failed.")).toBe(true);
  });

  it("rejects actions the player cannot afford without mutating state", () => {
    const initial = createGame(7);
    initial.activeCardId = null;
    initial.resources.money = 0;
    const before = structuredClone(initial);
    const result = commitAction(initial, {
      type: "deposit",
      track: "engineering",
      size: "standard",
    });

    expect(result.accepted).toBe(false);
    expect(result.error).toMatch(/costs more resources/i);
    expect(initial).toEqual(before);
  });

  it("requires mandatory Situation costs before granting their benefits", () => {
    const initial = createGame(71);
    initial.activeCardId = "capacity_bottleneck";
    initial.resources.money = 0;
    const before = structuredClone(initial);

    const rejected = commitAction(initial, {
      type: "resolve_card",
      choiceId: "hire",
    });

    expect(rejected.accepted).toBe(false);
    expect(rejected.error).toMatch(/costs more resources/i);
    expect(rejected.state).toEqual(before);
    expect(initial).toEqual(before);
  });

  it("spends mandatory Situation costs exactly once and floors consequence damage", () => {
    const hire = createGame(72);
    hire.activeCardId = "capacity_bottleneck";
    hire.resources.money = 10;
    hire.resources.capacity = 0;
    const hired = commitAction(hire, {
      type: "resolve_card",
      choiceId: "hire",
    });
    expect(hired.accepted).toBe(true);
    expect(hired.state.lastTurnResolution?.commitment.delta.resources).toMatchObject({
      money: -10,
      capacity: 9,
    });

    const cut = createGame(74);
    cut.activeCardId = "budget_shortfall";
    cut.resources.trust = 0;
    const cutResult = commitAction(cut, {
      type: "resolve_card",
      choiceId: "cut",
    });
    expect(cutResult.accepted).toBe(true);
    expect(cutResult.state.resources.trust).toBe(0);
    expect(cutResult.state.lastTurnResolution?.commitment.delta.resources.money).toBe(12);
  });

  it("rejects zero-progress deposits at 100 but allows a final partial deposit", () => {
    const complete = createGame(75);
    complete.activeCardId = null;
    complete.tracks.engineering = 100;
    const rejected = commitAction(complete, {
      type: "deposit",
      track: "engineering",
      size: "standard",
    });
    expect(rejected.accepted).toBe(false);
    expect(rejected.error).toMatch(/already complete/i);

    const nearlyComplete = createGame(76);
    nearlyComplete.activeCardId = null;
    nearlyComplete.tracks.engineering = 99;
    nearlyComplete.resources = {
      money: 100,
      influence: 100,
      intelligence: 100,
      trust: 100,
      capacity: 100,
    };
    const accepted = commitAction(nearlyComplete, {
      type: "deposit",
      track: "engineering",
      size: "standard",
    });
    expect(accepted.accepted).toBe(true);
    expect(accepted.state.tracks.engineering).toBe(100);
  });

  it("uses independent seeded jitter when choosing the next Corporation strategy", () => {
    function strategyFor(rngState: number) {
      const state = createGame(77);
      state.activeCardId = null;
      state.rngState = rngState;
      state.corporation.progress = 95;
      state.tracks = { engineering: 0, access: 0, legitimacy: 0, stability: 0 };
      state.resources = {
        money: 100,
        influence: 100,
        intelligence: 100,
        trust: 100,
        capacity: 100,
      };
      state.advisors.fixer.leverage = 10;
      return commitAction(state, {
        type: "recover_resource",
        resource: "money",
      }).state.corporation.strategy;
    }

    expect(strategyFor(1)).toBe("buying_influence");
    expect(strategyFor(2)).toBe("expanding");
    expect(strategyFor(1)).toBe(strategyFor(1));
  });
});

describe("endings", () => {
  it("keeps Stress nonterminal at 100", () => {
    const state = createGame(20);
    state.activeCardId = null;
    state.resources = {
      money: 100,
      influence: 15,
      intelligence: 100,
      trust: 100,
      capacity: 100,
    };
    state.corporation.progress = 0;
    state.pressures = { stress: 100, panic: 0 };
    state.institutions = 100;

    const result = commitAction(
      state,
      { type: "recover_resource", resource: "money" },
    ).state;
    expect(result.pressures.stress).toBe(100);
    expect(result.phase).not.toBe("ended");
    expect(result.ending).toBeNull();
  });

  it("produces the civic ending when activation is safe and legitimate", () => {
    const state = createGame(21);
    state.tracks = { engineering: 80, access: 80, legitimacy: 80, stability: 80 };
    state.institutions = 80;
    state.pressures.panic = 20;
    state.corporation.progress = 30;
    state.activeCardId = null;
    state.endingContributors.push("public_testimony");
    for (const advisor of Object.values(state.advisors)) advisor.leverage = 20;

    const result = commitAction(state, { type: "activate_brb" });
    expect(result.accepted).toBe(true);
    expect(result.state.phase).toBe("ended");
    expect(result.state.ending?.id).toBe("civic_legacy");
  });

  it("allows activation to become a Corporation loss", () => {
    const state = createGame(22);
    state.tracks = { engineering: 60, access: 60, legitimacy: 60, stability: 60 };
    state.corporation.progress = 85;
    state.activeCardId = null;

    const result = commitAction(state, { type: "activate_brb" });
    expect(result.state.ending?.id).toBe("corporate_capture");
  });

  it("makes Government by Command directly reachable for an Operator", () => {
    const state = createGame(23, "operator");
    state.tracks = { engineering: 60, access: 60, legitimacy: 60, stability: 60 };
    state.corporation.progress = 20;
    state.advisors.fixer.leverage = 60;
    state.activeCardId = null;

    const result = commitAction(state, { type: "activate_brb" });
    expect(result.state.ending?.id).toBe("compromised_activation");
    expect(result.state.ending?.variationId).toBe("government_by_command");
  });

  it("explains every failed Civic condition in a compromised activation", () => {
    const state = createGame(24);
    state.activeCardId = null;
    state.tracks = { engineering: 50, access: 50, legitimacy: 50, stability: 50 };
    state.corporation.progress = 20;
    state.institutions = 40;
    state.pressures.panic = 65;
    state.advisors.fixer.leverage = 70;
    state.systemModifiers.push("emergency_rule");

    const result = commitAction(state, { type: "activate_brb" }).state;

    expect(result.ending?.id).toBe("compromised_activation");
    expect(result.ending?.reason).toMatch(/Legitimacy was 50/i);
    expect(result.ending?.reason).toMatch(/Stability was 50/i);
    expect(result.ending?.reason).toMatch(/Institutions were 40/i);
    expect(result.ending?.reason).toMatch(/Panic was 65/i);
    expect(result.ending?.reason).toMatch(/Leverage was 70/i);
    expect(result.ending?.reason).toMatch(/emergency rule remained active/i);
    expect(result.ending?.reason).toMatch(/no civic route or public testimony/i);
  });
});

describe("delayed echo rules", () => {
  it("makes accepted delay increase later recovery Progress with provenance", () => {
    const state = createGame(181);
    state.activeCardId = "budget_shortfall";
    const delayed = commitAction(state, {
      type: "resolve_card",
      choiceId: "delay",
    }).state;
    const source = delayed.decisionHistory.find((decision) =>
      decision.systemModifiers.includes("accepted_delay"),
    );
    delayed.activeCardId = null;
    delayed.corporation.progress = 20;

    const recovered = commitAction(delayed, {
      type: "recover_resource",
      resource: "money",
    }).state;

    expect(recovered.lastTurnResolution?.commitment.delta.corporationProgress).toBe(5);
    expect(
      recovered.decisionHistory.find((decision) => decision.id === source?.id)
        ?.linkedConsequences,
    ).toBe(1);
    expect(recovered.history).toContainEqual(
      expect.objectContaining({ causedByDecisionId: source?.id }),
    );
  });

  it("applies replacement-contractor and closed-oversight surcharges", () => {
    const strike = createGame(182);
    strike.activeCardId = "contractor_strike";
    const replaced = commitAction(strike, {
      type: "resolve_card",
      choiceId: "replace",
    }).state;
    replaced.activeCardId = null;
    replaced.resources = {
      money: 100,
      influence: 100,
      intelligence: 100,
      trust: 100,
      capacity: 100,
    };

    expect(getActionCost(replaced, {
      type: "deposit",
      track: "engineering",
      size: "standard",
    }).capacity).toBe(10);
    const deposited = commitAction(replaced, {
      type: "deposit",
      track: "engineering",
      size: "standard",
    }).state;
    expect(deposited.deposited.capacity).toBe(10);

    const hearing = createGame(183, "technocrat");
    hearing.activeCardId = "public_hearing";
    const closed = commitAction(hearing, {
      type: "resolve_card",
      choiceId: "closed",
    }).state;
    closed.activeCardId = "whistleblower";
    expect(getActionCost(closed, {
      type: "resolve_card",
      choiceId: "contain",
    })).toMatchObject({ influence: 5, trust: 5 });
  });

  it("uses parallel contractors for Capacity recovery", () => {
    const state = createGame(184);
    state.activeCardId = "capacity_bottleneck";
    const hired = commitAction(state, {
      type: "resolve_card",
      choiceId: "hire",
    }).state;
    hired.activeCardId = null;
    hired.resources.capacity = 0;

    const recovered = commitAction(hired, {
      type: "recover_resource",
      resource: "capacity",
    }).state;

    expect(recovered.lastTurnResolution?.commitment.delta.resources.capacity).toBe(36);
  });

  it("starts Capacity drift in the month after the echo is created", () => {
    const state = createGame(185);
    state.activeCardId = "capacity_bottleneck";
    state.tracks.engineering = 50;

    const created = commitAction(
      state,
      { type: "recover_resource", resource: "money" },
      { confirmCardAbandonment: true },
    ).state;
    expect(created.systemModifiers).toContain("capacity_drift");
    expect(created.tracks.engineering).toBe(47);

    created.activeCardId = null;
    const drifted = commitAction(created, {
      type: "recover_resource",
      resource: "money",
    }).state;
    expect(drifted.lastTurnResolution?.monthlyPressure?.delta.tracks.engineering).toBe(-1);
    expect(drifted.tracks.engineering).toBe(46);
  });

  it("uses advisor memories in later forecasts and links the consequence", () => {
    const state = createGame(186, "operator");
    state.activeCardId = "whistleblower";
    const protectedState = commitAction(state, {
      type: "resolve_card",
      choiceId: "protect",
    }).state;
    const source = protectedState.decisionHistory.find((decision) =>
      decision.advisorMemories.includes("steward:protected_whistleblower"),
    );
    protectedState.activeCardId = null;

    const consulted = consultAdvisor(protectedState, "steward").state;

    expect(
      consulted.decisionHistory.find((decision) => decision.id === source?.id)
        ?.linkedConsequences,
    ).toBe(1);
    expect(consulted.history).toContainEqual(
      expect.objectContaining({ causedByDecisionId: source?.id }),
    );
  });
});
