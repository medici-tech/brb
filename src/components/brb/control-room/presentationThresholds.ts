export type PresentationThresholds = {
  institutionalFailure: {
    institutionsMaximum: number;
  };
  crisis: {
    stressMinimum: number;
    panicMinimum: number;
    institutionsMaximum: number;
  };
  corporateEncroachment: {
    corporationProgressMinimum: number;
    corporationThreatMinimum: number;
  };
  strained: {
    stressMinimum: number;
    panicMinimum: number;
    institutionsMaximum: number;
    corporationProgressMinimum: number;
    corporationThreatMinimum: number;
    brbProgressMinimum: number;
  };
  paperLoad: {
    workingTurnMinimum: number;
    burdenedTurnMinimum: number;
    saturatedTurnMinimum: number;
  };
  staffSchedule: {
    crossingInterval: number;
    crossingOffset: number;
  };
  staffPose: {
    /** Loyalty at or below this triggers stressed pose (near departure). */
    stressedLoyaltyMaximum: number;
    /** Loyalty at or below this triggers concerned pose. */
    concernedLoyaltyMaximum: number;
    /** Alignment at or below this triggers concerned pose. */
    concernedAlignmentMaximum: number;
    /** Leverage at or above this triggers concerned pose. */
    highLeverageMinimum: number;
  };
};

/**
 * Presentation-only warning thresholds for the Living Control Room.
 *
 * These values intentionally live outside the game engine. Changing them alters
 * only the room's appearance; it cannot change campaign rules or saved state.
 */
export const PRESENTATION_THRESHOLDS = {
  institutionalFailure: {
    institutionsMaximum: 20,
  },
  crisis: {
    stressMinimum: 80,
    panicMinimum: 75,
    institutionsMaximum: 35,
  },
  corporateEncroachment: {
    corporationProgressMinimum: 60,
    corporationThreatMinimum: 75,
  },
  strained: {
    stressMinimum: 50,
    panicMinimum: 50,
    institutionsMaximum: 50,
    corporationProgressMinimum: 40,
    corporationThreatMinimum: 50,
    brbProgressMinimum: 50,
  },
  paperLoad: {
    workingTurnMinimum: 4,
    burdenedTurnMinimum: 9,
    saturatedTurnMinimum: 16,
  },
  staffSchedule: {
    crossingInterval: 4,
    crossingOffset: 2,
  },
  staffPose: {
    stressedLoyaltyMaximum: 32,
    concernedLoyaltyMaximum: 45,
    concernedAlignmentMaximum: 35,
    highLeverageMinimum: 70,
  },
} as const satisfies PresentationThresholds;
