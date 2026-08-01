import { describe, expect, it } from "vitest";
import {
  resolveStaffPose,
  type AdvisorVisualState,
} from "../../src/components/brb/control-room/presentationStateResolver.js";
import { PRESENTATION_THRESHOLDS } from "../../src/components/brb/control-room/presentationThresholds.js";

function advisorState(
  overrides: Partial<AdvisorVisualState> = {},
): AdvisorVisualState {
  return {
    loyalty: 60,
    alignment: 55,
    leverage: 10,
    active: true,
    ...overrides,
  };
}

describe("resolveStaffPose", () => {
  describe("stressed pose (near departure)", () => {
    it("returns stressed when loyalty is at stressed threshold", () => {
      const state = advisorState({
        loyalty: PRESENTATION_THRESHOLDS.staffPose.stressedLoyaltyMaximum,
      });
      expect(resolveStaffPose(state)).toBe("stressed");
    });

    it("returns stressed when loyalty is below stressed threshold", () => {
      const state = advisorState({
        loyalty: PRESENTATION_THRESHOLDS.staffPose.stressedLoyaltyMaximum - 5,
      });
      expect(resolveStaffPose(state)).toBe("stressed");
    });

    it("prioritizes stressed over concerned conditions", () => {
      const state = advisorState({
        loyalty: PRESENTATION_THRESHOLDS.staffPose.stressedLoyaltyMaximum,
        alignment: PRESENTATION_THRESHOLDS.staffPose.concernedAlignmentMaximum,
        leverage: PRESENTATION_THRESHOLDS.staffPose.highLeverageMinimum,
      });
      expect(resolveStaffPose(state)).toBe("stressed");
    });
  });

  describe("concerned pose (tension indicators)", () => {
    it("returns concerned when loyalty is at concerned threshold", () => {
      const state = advisorState({
        loyalty: PRESENTATION_THRESHOLDS.staffPose.concernedLoyaltyMaximum,
      });
      expect(resolveStaffPose(state)).toBe("concerned");
    });

    it("returns concerned when loyalty is below concerned but above stressed", () => {
      const state = advisorState({
        loyalty: PRESENTATION_THRESHOLDS.staffPose.stressedLoyaltyMaximum + 5,
      });
      expect(resolveStaffPose(state)).toBe("concerned");
    });

    it("returns concerned when alignment is at concerned threshold", () => {
      const state = advisorState({
        alignment: PRESENTATION_THRESHOLDS.staffPose.concernedAlignmentMaximum,
      });
      expect(resolveStaffPose(state)).toBe("concerned");
    });

    it("returns concerned when alignment is below concerned threshold", () => {
      const state = advisorState({
        alignment: PRESENTATION_THRESHOLDS.staffPose.concernedAlignmentMaximum - 10,
      });
      expect(resolveStaffPose(state)).toBe("concerned");
    });

    it("returns concerned when leverage is at high threshold", () => {
      const state = advisorState({
        leverage: PRESENTATION_THRESHOLDS.staffPose.highLeverageMinimum,
      });
      expect(resolveStaffPose(state)).toBe("concerned");
    });

    it("returns concerned when leverage is above high threshold", () => {
      const state = advisorState({
        leverage: PRESENTATION_THRESHOLDS.staffPose.highLeverageMinimum + 10,
      });
      expect(resolveStaffPose(state)).toBe("concerned");
    });
  });

  describe("working pose (normal state)", () => {
    it("returns working when all meters are in normal range", () => {
      const state = advisorState({
        loyalty: 60,
        alignment: 55,
        leverage: 30,
      });
      expect(resolveStaffPose(state)).toBe("working");
    });

    it("returns working when loyalty is one above concerned threshold", () => {
      const state = advisorState({
        loyalty: PRESENTATION_THRESHOLDS.staffPose.concernedLoyaltyMaximum + 1,
      });
      expect(resolveStaffPose(state)).toBe("working");
    });

    it("returns working when alignment is one above concerned threshold", () => {
      const state = advisorState({
        alignment: PRESENTATION_THRESHOLDS.staffPose.concernedAlignmentMaximum + 1,
      });
      expect(resolveStaffPose(state)).toBe("working");
    });

    it("returns working when leverage is one below high threshold", () => {
      const state = advisorState({
        leverage: PRESENTATION_THRESHOLDS.staffPose.highLeverageMinimum - 1,
      });
      expect(resolveStaffPose(state)).toBe("working");
    });
  });

  describe("inactive advisor", () => {
    it("returns calm for departed advisor regardless of meters", () => {
      const state = advisorState({
        loyalty: 10,
        alignment: 10,
        leverage: 90,
        active: false,
      });
      expect(resolveStaffPose(state)).toBe("calm");
    });
  });

  describe("threshold boundary values", () => {
    const thresholds = PRESENTATION_THRESHOLDS.staffPose;

    it("stressed threshold boundary: at vs one above", () => {
      expect(resolveStaffPose(advisorState({ loyalty: thresholds.stressedLoyaltyMaximum }))).toBe("stressed");
      expect(resolveStaffPose(advisorState({ loyalty: thresholds.stressedLoyaltyMaximum + 1 }))).toBe("concerned");
    });

    it("concerned loyalty boundary: at vs one above", () => {
      expect(resolveStaffPose(advisorState({ loyalty: thresholds.concernedLoyaltyMaximum }))).toBe("concerned");
      expect(resolveStaffPose(advisorState({ loyalty: thresholds.concernedLoyaltyMaximum + 1 }))).toBe("working");
    });

    it("concerned alignment boundary: at vs one above", () => {
      expect(resolveStaffPose(advisorState({ alignment: thresholds.concernedAlignmentMaximum }))).toBe("concerned");
      expect(resolveStaffPose(advisorState({ alignment: thresholds.concernedAlignmentMaximum + 1 }))).toBe("working");
    });

    it("high leverage boundary: at vs one below", () => {
      expect(resolveStaffPose(advisorState({ leverage: thresholds.highLeverageMinimum }))).toBe("concerned");
      expect(resolveStaffPose(advisorState({ leverage: thresholds.highLeverageMinimum - 1 }))).toBe("working");
    });
  });
});
