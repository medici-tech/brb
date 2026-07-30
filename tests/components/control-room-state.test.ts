import { describe, expect, it } from "vitest";
import { createGame } from "../../src/game/engine.js";
import {
  derivePresentationInputs,
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

  it.each([
    "civic_legacy",
    "compromised_activation",
    "corporate_capture",
    "state_collapse",
  ] as const)("preserves ending identity for the %s tableau", (ending) => {
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
