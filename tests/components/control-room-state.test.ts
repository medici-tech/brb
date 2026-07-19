import { describe, expect, it } from "vitest";
import { createGame } from "../../src/game/engine.js";
import {
  derivePresentationInputs,
  getBrbVisualStage,
  resolvePresentationModel,
  resolvePresentationState,
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

  it("derives presentation inputs without mutating gameplay state", () => {
    const state = createGame(404);
    const before = structuredClone(state);
    const inputs = derivePresentationInputs(state, "advisor");
    const frozenInputs = Object.freeze({ ...inputs });

    resolvePresentationState(frozenInputs);

    expect(state).toEqual(before);
    expect(frozenInputs).toEqual(inputs);
  });
});
