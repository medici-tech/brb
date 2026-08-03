import { describe, expect, it } from "vitest";
import { createGame } from "../../src/game/engine.js";
import { ENDING_IDS } from "../../src/game/types.js";
import {
  derivePresentationInputs,
  resolveAuthority,
  resolveLighting,
  resolveTakeoverAdvisors,
  getBrbVisualStage,
  resolveLitStation,
  resolvePaperLoad,
  resolvePresentationModel,
  resolvePresentationShot,
  resolvePresentationState,
  resolveStaffLayout,
  type PresentationInputs,
  type PresentationState,
} from "../../src/components/brb/control-room/presentationStateResolver.js";

function calmInputs(
  overrides: Partial<PresentationInputs> = {},
): PresentationInputs {
  return {
    stress: 12,
    panic: 8,
    institutions: 60,
    corporationProgress: 8,
    corporationThreat: 15,
    brbProgress: 0,
    activeSituationType: null,
    phase: "briefing",
    turn: 1,
    consultedAdvisorId: null,
    pendingCommitment: false,
    pendingMilestone: false,
    ending: null,
    takeoverAdvisors: [],
    ...overrides,
  };
}

describe("control room presentation resolver", () => {
  it.each([
    ["stress", { stress: 80 }, { stress: 79 }, "crisis", "strained"],
    ["panic", { panic: 75 }, { panic: 74 }, "crisis", "strained"],
    [
      "low institutions crisis",
      { institutions: 35 },
      { institutions: 36 },
      "crisis",
      "strained",
    ],
    [
      "Corporation progress",
      { corporationProgress: 60 },
      { corporationProgress: 59 },
      "corporate-encroachment",
      "strained",
    ],
    [
      "Corporation threat",
      { corporationThreat: 75 },
      { corporationThreat: 74 },
      "corporate-encroachment",
      "strained",
    ],
    ["strained stress", { stress: 50 }, { stress: 49 }, "strained", "calm"],
    ["strained panic", { panic: 50 }, { panic: 49 }, "strained", "calm"],
    [
      "strained institutions",
      { institutions: 50 },
      { institutions: 51 },
      "strained",
      "calm",
    ],
    [
      "strained Corporation progress",
      { corporationProgress: 40 },
      { corporationProgress: 39 },
      "strained",
      "calm",
    ],
    [
      "strained Corporation threat",
      { corporationThreat: 50 },
      { corporationThreat: 49 },
      "strained",
      "calm",
    ],
    [
      "BRB progress",
      { brbProgress: 50 },
      { brbProgress: 49 },
      "strained",
      "calm",
    ],
  ] satisfies [
    string,
    Partial<PresentationInputs>,
    Partial<PresentationInputs>,
    PresentationState,
    PresentationState,
  ][])(
    "uses the configured %s boundary",
    (_label, atBoundary, belowBoundary, expectedState, fallbackState) => {
      expect(resolvePresentationState(calmInputs(atBoundary))).toBe(
        expectedState,
      );
      expect(resolvePresentationState(calmInputs(belowBoundary))).toBe(
        fallbackState,
      );
    },
  );

  it("uses the institutional-failure boundary before the crisis boundary", () => {
    expect(
      resolvePresentationState(calmInputs({ institutions: 20 })),
    ).toBe("institutional-failure");
    expect(
      resolvePresentationState(calmInputs({ institutions: 21 })),
    ).toBe("crisis");
  });

  it("allows active Situation types to influence presentation only", () => {
    expect(
      resolvePresentationState(
        calmInputs({ activeSituationType: "crisis" }),
      ),
    ).toBe("crisis");
    expect(
      resolvePresentationState(
        calmInputs({ activeSituationType: "corporation" }),
      ),
    ).toBe("corporate-encroachment");
    expect(
      resolvePresentationState(
        calmInputs({ activeSituationType: "advisor" }),
      ),
    ).toBe("strained");
  });

  it("keeps severe states ahead of milder competing signals", () => {
    expect(
      resolvePresentationState(
        calmInputs({
          institutions: 20,
          panic: 100,
          corporationProgress: 100,
        }),
      ),
    ).toBe("institutional-failure");
    expect(
      resolvePresentationState(
        calmInputs({ panic: 75, corporationProgress: 100 }),
      ),
    ).toBe("crisis");
    expect(
      resolvePresentationState(
        calmInputs({ corporationProgress: 60, stress: 50 }),
      ),
    ).toBe("corporate-encroachment");
  });

  it.each([
    [0, "sealed"],
    [24, "sealed"],
    [25, "infrastructure"],
    [49, "infrastructure"],
    [50, "construction"],
    [74, "construction"],
    [75, "unstable"],
    [99, "unstable"],
    [100, "activation-ready"],
  ] as const)("maps %i%% BRB progress to %s", (progress, expected) => {
    expect(getBrbVisualStage(progress)).toBe(expected);
  });

  it("maps campaign phase to presentation focus", () => {
    expect(resolvePresentationModel(calmInputs()).focus).toBe("assess");
    expect(
      resolvePresentationModel(calmInputs({ phase: "consulted" })).focus,
    ).toBe("investigate");
  });

  it("uses ending → milestone → commitment → consultation → Situation precedence", () => {
    const base = calmInputs({
      activeSituationType: "advisor",
      consultedAdvisorId: "steward",
      pendingCommitment: true,
      pendingMilestone: true,
      ending: "civic_legacy",
    });
    expect(resolvePresentationShot(base)).toBe("ending");
    expect(resolvePresentationShot({ ...base, ending: null })).toBe("milestone");
    expect(resolvePresentationShot({
      ...base,
      ending: null,
      pendingMilestone: false,
    })).toBe("commitment");
    expect(resolvePresentationShot({
      ...base,
      ending: null,
      pendingMilestone: false,
      pendingCommitment: false,
    })).toBe("consultation");
    expect(resolvePresentationShot({
      ...base,
      ending: null,
      pendingMilestone: false,
      pendingCommitment: false,
      consultedAdvisorId: null,
      phase: "briefing",
    })).toBe("situation");
  });

  // Lighting is the reason the advisor endings shipped invisible: they fell
  // through an if-chain to "calm" and rendered as a quiet operations shot.
  it.each([
    ["civic_legacy", "calm"],
    ["compromised_activation", "strained"],
    ["corporate_capture", "crisis"],
    ["state_collapse", "failure"],
    ["advisor_coup", "captured"],
    ["advisor_cabal", "captured"],
  ] as const)("grades the %s tableau as %s", (ending, lighting) => {
    expect(resolvePresentationModel(calmInputs({ ending })).lighting)
      .toBe(lighting);
  });

  it("lets presentation state decide the grade when the ending has no opinion", () => {
    // civic_legacy is the one ending that does not override, so a won campaign
    // still looks like the campaign it was.
    expect(resolveLighting("crisis", "civic_legacy")).toBe("crisis");
    expect(resolveLighting("calm", "civic_legacy")).toBe("calm");
    // An override wins over the state.
    expect(resolveLighting("crisis", "advisor_coup")).toBe("captured");
  });

  it.each([
    ["civic_legacy", "public"],
    ["compromised_activation", "public"],
    ["corporate_capture", "public"],
    ["state_collapse", "public"],
    ["advisor_coup", "seized"],
    ["advisor_cabal", "shared"],
  ] as const)("reports %s authority as %s", (ending, mode) => {
    expect(resolvePresentationModel(calmInputs({ ending })).authority.mode)
      .toBe(mode);
  });

  it("only carries holders for a takeover", () => {
    expect(resolveAuthority(null, ["fixer"]).holders).toEqual([]);
    expect(resolveAuthority("state_collapse", ["fixer"]).holders).toEqual([]);
    expect(resolveAuthority("advisor_coup", ["fixer"]).holders).toEqual(["fixer"]);
  });

  describe("takeover holder derivation", () => {
    function stateWithLeverage(
      leverage: Partial<Record<"analyst" | "fixer" | "steward", number>>,
      inactive: readonly string[] = [],
    ) {
      const state = createGame({ seed: 4242, archetypeId: "technocrat" });
      for (const [id, value] of Object.entries(leverage)) {
        state.advisors[id as "analyst"]!.leverage = value!;
      }
      for (const id of inactive) {
        state.advisors[id as "analyst"]!.active = false;
      }
      return state;
    }

    it("names the single advisor holding a coup", () => {
      expect(
        resolveTakeoverAdvisors(stateWithLeverage({ fixer: 90 }), "advisor_coup"),
      ).toEqual(["fixer"]);
    });

    it("names every cabal member", () => {
      expect(
        resolveTakeoverAdvisors(
          stateWithLeverage({ analyst: 60, steward: 55 }),
          "advisor_cabal",
        ),
      ).toEqual(["analyst", "steward"]);
    });

    it("keeps a coup singular when two advisors clear the bar", () => {
      // endings.ts records a coup with ADVISOR_IDS.find, so presentation must
      // not light two stations for an ending the engine considers one
      // advisor's. This locks `find` against a future `filter`.
      const holders = resolveTakeoverAdvisors(
        stateWithLeverage({ analyst: 90, fixer: 95 }),
        "advisor_coup",
      );
      expect(holders).toHaveLength(1);
    });

    it("derives no holders for a non-takeover ending", () => {
      expect(
        resolveTakeoverAdvisors(stateWithLeverage({ fixer: 95 }), "state_collapse"),
      ).toEqual([]);
      expect(resolveTakeoverAdvisors(stateWithLeverage({ fixer: 95 }), null))
        .toEqual([]);
    });

    it("respects the coup and cabal leverage boundaries", () => {
      expect(resolveTakeoverAdvisors(stateWithLeverage({ fixer: 85 }), "advisor_coup"))
        .toEqual(["fixer"]);
      expect(resolveTakeoverAdvisors(stateWithLeverage({ fixer: 84 }), "advisor_coup"))
        .toEqual([]);
      expect(
        resolveTakeoverAdvisors(
          stateWithLeverage({ analyst: 50, steward: 50 }),
          "advisor_cabal",
        ),
      ).toEqual(["analyst", "steward"]);
      expect(
        resolveTakeoverAdvisors(
          stateWithLeverage({ analyst: 49, steward: 49 }),
          "advisor_cabal",
        ),
      ).toEqual([]);
    });

    it("excludes a departed advisor however high their leverage", () => {
      expect(
        resolveTakeoverAdvisors(
          stateWithLeverage({ fixer: 95 }, ["fixer"]),
          "advisor_coup",
        ),
      ).toEqual([]);
    });

    it("still reads as a takeover when no holder can be derived", () => {
      // A legacy save can carry the ending without the leverage that produced
      // it. The room must keep the takeover grade rather than fall back to a
      // collapse-shaped blackout with nothing lit.
      const model = resolvePresentationModel(
        calmInputs({ ending: "advisor_coup", takeoverAdvisors: [] }),
      );
      expect(model.authority.mode).toBe("seized");
      expect(model.authority.holders).toEqual([]);
      expect(model.lighting).toBe("captured");
    });
  });

  it.each(ENDING_IDS)("preserves ending identity for the %s tableau", (ending) => {
    const model = resolvePresentationModel(calmInputs({ ending }));
    expect(model.shot).toBe("ending");
    expect(model.tempo).toBe("still");
    expect(model.endingId).toBe(ending);
  });

  it.each([
    ["analyst", null, "analysis"],
    ["fixer", null, "operations"],
    ["steward", null, "institutions"],
    [null, "corporation", "analysis"],
    [null, "crisis", "operations"],
    [null, "advisor", "institutions"],
    [null, null, null],
  ] as const)(
    "maps advisor %s and card %s to station %s",
    (advisor, cardType, expected) => {
      expect(resolveLitStation(calmInputs({
        consultedAdvisorId: advisor,
        activeSituationType: cardType,
      }))).toBe(expected);
    },
  );

  it.each([
    [1, "sparse"],
    [3, "sparse"],
    [4, "working"],
    [8, "working"],
    [9, "burdened"],
    [15, "burdened"],
    [16, "saturated"],
  ] as const)("maps turn %i to %s paper load", (turn, expected) => {
    expect(resolvePaperLoad(turn)).toBe(expected);
  });

  it("schedules crossing staff deterministically on standby turns only", () => {
    const scheduled = calmInputs({ turn: 2 });
    expect(
      resolveStaffLayout(scheduled, "calm", "operations").crossingVisible,
    ).toBe(true);
    expect(
      resolveStaffLayout(scheduled, "calm", "situation").crossingVisible,
    ).toBe(false);
    expect(
      resolveStaffLayout(calmInputs({ turn: 3 }), "calm", "operations")
        .crossingVisible,
    ).toBe(false);
  });

  it("derives presentation inputs without mutating gameplay state", () => {
    const state = createGame(404);
    const before = structuredClone(state);
    const inputs = derivePresentationInputs(state, "advisor");
    const frozenInputs = Object.freeze({ ...inputs });

    resolvePresentationModel(frozenInputs);

    expect(state).toEqual(before);
    expect(frozenInputs).toEqual(inputs);
  });
});
