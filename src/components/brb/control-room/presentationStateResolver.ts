import { getBrbCompletionPercent } from "../../../game/progression";
import type {
  AdvisorId,
  CardType,
  EndingId,
  GameState,
} from "../../../game/types";
import { ADVISOR_IDS } from "../../../game/types";
import {
  PRESENTATION_THRESHOLDS,
  type PresentationThresholds,
} from "./presentationThresholds";
import { derivePersistentRoomMarks } from "../narrative/sceneResolver";
import type { PersistentRoomMarks } from "../narrative/sceneTypes";

export const PRESENTATION_STATES = [
  "calm",
  "strained",
  "crisis",
  "institutional-failure",
  "corporate-encroachment",
] as const;

export type PresentationState = (typeof PRESENTATION_STATES)[number];
export type PresentationFocus = "assess" | "investigate" | "commit";
export type PresentationShot =
  | "operations"
  | "situation"
  | "consultation"
  | "commitment"
  | "milestone"
  | "ending";
export type PresentationTempo =
  | "ambient"
  | "reading"
  | "response"
  | "critical"
  | "still";
export type LitStation =
  | "analysis"
  | "operations"
  | "institutions"
  | null;
export type PaperLoad = "sparse" | "working" | "burdened" | "saturated";
export type StaffLayout = {
  mode: "full" | "reduced" | "skeleton";
  crossingVisible: boolean;
  crossingDirection: "left-to-right" | "right-to-left";
};
export type BrbVisualStage =
  | "sealed"
  | "infrastructure"
  | "construction"
  | "unstable"
  | "activation-ready";

/** Presentation-relevant subset of advisor state for visual pose derivation. */
export type AdvisorVisualState = {
  readonly loyalty: number;
  readonly alignment: number;
  readonly leverage: number;
  readonly active: boolean;
};

/**
 * Visual pose for a staff sprite, derived from advisor relationship state.
 * Reinforces advisor tension by showing body language that matches meters.
 */
export type StaffPose = "calm" | "working" | "concerned" | "stressed";

export type PresentationInputs = {
  stress: number;
  panic: number;
  institutions: number;
  corporationProgress: number;
  corporationThreat: number;
  brbProgress: number;
  activeSituationType: CardType | null;
  phase: GameState["phase"];
  turn: number;
  consultedAdvisorId: AdvisorId | null;
  pendingCommitment: boolean;
  pendingMilestone: boolean;
  ending: EndingId | null;
  persistentRoomMarks?: PersistentRoomMarks;
  advisorStates: Record<AdvisorId, AdvisorVisualState>;
};

export type PresentationModel = {
  state: PresentationState;
  stateLabel: string;
  caption: string;
  focus: Exclude<PresentationFocus, "commit">;
  brbProgress: number;
  brbStage: BrbVisualStage;
  shot: PresentationShot;
  tempo: PresentationTempo;
  litStation: LitStation;
  paperLoad: PaperLoad;
  endingId: EndingId | null;
  staffLayout: StaffLayout;
  staffPoses: Record<AdvisorId, StaffPose>;
  persistentRoomMarks?: PersistentRoomMarks;
};

export const PRESENTATION_STATE_COPY: Record<
  PresentationState,
  { label: string; caption: string }
> = {
  calm: {
    label: "Calm",
    caption: "Routine channels remain open.",
  },
  strained: {
    label: "Strained",
    caption: "Staff are reallocating attention.",
  },
  crisis: {
    label: "Crisis",
    caption: "Emergency channels are active.",
  },
  "institutional-failure": {
    label: "Institutional Failure",
    caption: "Administrative continuity is failing.",
  },
  "corporate-encroachment": {
    label: "Corporate Encroachment",
    caption: "Private systems are replacing public controls.",
  },
};

export function derivePresentationInputs(
  state: GameState,
  activeSituationType: CardType | null,
  intent: Partial<
    Pick<
      PresentationInputs,
      "pendingCommitment" | "pendingMilestone" | "ending"
    >
  > = {},
): PresentationInputs {
  const advisorStates = {} as Record<AdvisorId, AdvisorVisualState>;
  for (const id of ADVISOR_IDS) {
    const advisor = state.advisors[id];
    advisorStates[id] = {
      loyalty: advisor.loyalty,
      alignment: advisor.alignment,
      leverage: advisor.leverage,
      active: advisor.active,
    };
  }

  return {
    stress: state.pressures.stress,
    panic: state.pressures.panic,
    institutions: state.institutions,
    corporationProgress: state.corporation.progress,
    corporationThreat: state.corporation.threat,
    brbProgress: getBrbCompletionPercent(state),
    activeSituationType,
    phase: state.phase,
    turn: state.turn,
    consultedAdvisorId: state.consultation?.advisorId ?? null,
    pendingCommitment: intent.pendingCommitment ?? false,
    pendingMilestone: intent.pendingMilestone ?? false,
    ending: intent.ending ?? state.ending?.id ?? null,
    persistentRoomMarks: derivePersistentRoomMarks(state),
    advisorStates,
  };
}

export function resolvePresentationState(
  inputs: Readonly<PresentationInputs>,
  thresholds: PresentationThresholds = PRESENTATION_THRESHOLDS,
): PresentationState {
  if (
    inputs.institutions
    <= thresholds.institutionalFailure.institutionsMaximum
  ) {
    return "institutional-failure";
  }

  if (
    inputs.stress >= thresholds.crisis.stressMinimum
    || inputs.panic >= thresholds.crisis.panicMinimum
    || inputs.institutions <= thresholds.crisis.institutionsMaximum
    || inputs.activeSituationType === "crisis"
  ) {
    return "crisis";
  }

  if (
    inputs.corporationProgress
      >= thresholds.corporateEncroachment.corporationProgressMinimum
    || inputs.corporationThreat
      >= thresholds.corporateEncroachment.corporationThreatMinimum
    || inputs.activeSituationType === "corporation"
  ) {
    return "corporate-encroachment";
  }

  if (
    inputs.stress >= thresholds.strained.stressMinimum
    || inputs.panic >= thresholds.strained.panicMinimum
    || inputs.institutions <= thresholds.strained.institutionsMaximum
    || inputs.corporationProgress
      >= thresholds.strained.corporationProgressMinimum
    || inputs.corporationThreat
      >= thresholds.strained.corporationThreatMinimum
    || inputs.brbProgress >= thresholds.strained.brbProgressMinimum
    || inputs.activeSituationType !== null
  ) {
    return "strained";
  }

  return "calm";
}

export function getBrbVisualStage(progress: number): BrbVisualStage {
  if (progress >= 100) return "activation-ready";
  if (progress >= 75) return "unstable";
  if (progress >= 50) return "construction";
  if (progress >= 25) return "infrastructure";
  return "sealed";
}

export function resolvePresentationShot(
  inputs: Readonly<PresentationInputs>,
): PresentationShot {
  if (inputs.ending) return "ending";
  if (inputs.pendingMilestone) return "milestone";
  if (inputs.pendingCommitment) return "commitment";
  if (inputs.consultedAdvisorId || inputs.phase === "consulted") {
    return "consultation";
  }
  if (inputs.activeSituationType) return "situation";
  return "operations";
}

export function resolveLitStation(
  inputs: Readonly<PresentationInputs>,
): LitStation {
  if (inputs.consultedAdvisorId === "analyst") return "analysis";
  if (inputs.consultedAdvisorId === "fixer") return "operations";
  if (inputs.consultedAdvisorId === "steward") return "institutions";
  if (inputs.activeSituationType === "corporation") return "analysis";
  if (inputs.activeSituationType === "crisis") return "operations";
  if (inputs.activeSituationType === "advisor") return "institutions";
  return null;
}

export function resolvePaperLoad(
  turn: number,
  thresholds: PresentationThresholds = PRESENTATION_THRESHOLDS,
): PaperLoad {
  if (turn >= thresholds.paperLoad.saturatedTurnMinimum) return "saturated";
  if (turn >= thresholds.paperLoad.burdenedTurnMinimum) return "burdened";
  if (turn >= thresholds.paperLoad.workingTurnMinimum) return "working";
  return "sparse";
}

export function resolveStaffLayout(
  inputs: Readonly<PresentationInputs>,
  state: PresentationState,
  shot: PresentationShot,
  thresholds: PresentationThresholds = PRESENTATION_THRESHOLDS,
): StaffLayout {
  const { crossingInterval, crossingOffset } = thresholds.staffSchedule;
  const crossingVisible =
    shot === "operations"
    && (inputs.turn - crossingOffset) % crossingInterval === 0;

  return {
    mode:
      state === "institutional-failure"
        ? "skeleton"
        : state === "crisis"
          ? "reduced"
          : "full",
    crossingVisible,
    crossingDirection:
      Math.floor(inputs.turn / crossingInterval) % 2 === 0
        ? "left-to-right"
        : "right-to-left",
  };
}

/**
 * Derive the visual pose for a staff sprite based on advisor relationship state.
 *
 * The pose reflects tension levels without revealing exact meter values:
 * - `stressed`: loyalty near departure threshold, most urgent body language
 * - `concerned`: low loyalty, low alignment, or high leverage
 * - `working`: normal engaged state
 * - `calm`: relaxed baseline (currently renders same as working)
 */
export function resolveStaffPose(
  advisorState: Readonly<AdvisorVisualState>,
  thresholds: PresentationThresholds = PRESENTATION_THRESHOLDS,
): StaffPose {
  if (!advisorState.active) {
    return "calm";
  }

  const { staffPose } = thresholds;

  if (advisorState.loyalty <= staffPose.stressedLoyaltyMaximum) {
    return "stressed";
  }

  if (
    advisorState.loyalty <= staffPose.concernedLoyaltyMaximum
    || advisorState.alignment <= staffPose.concernedAlignmentMaximum
    || advisorState.leverage >= staffPose.highLeverageMinimum
  ) {
    return "concerned";
  }

  return "working";
}

function resolveStaffPoses(
  inputs: Readonly<PresentationInputs>,
  thresholds: PresentationThresholds = PRESENTATION_THRESHOLDS,
): Record<AdvisorId, StaffPose> {
  return {
    analyst: resolveStaffPose(inputs.advisorStates.analyst, thresholds),
    fixer: resolveStaffPose(inputs.advisorStates.fixer, thresholds),
    steward: resolveStaffPose(inputs.advisorStates.steward, thresholds),
  };
}

export function resolvePresentationModel(
  inputs: Readonly<PresentationInputs>,
  thresholds: PresentationThresholds = PRESENTATION_THRESHOLDS,
): PresentationModel {
  const state = resolvePresentationState(inputs, thresholds);
  const copy = PRESENTATION_STATE_COPY[state];
  const shot = resolvePresentationShot(inputs);

  return {
    state,
    stateLabel: copy.label,
    caption: copy.caption,
    focus: inputs.phase === "consulted" ? "investigate" : "assess",
    brbProgress: inputs.brbProgress,
    brbStage: getBrbVisualStage(inputs.brbProgress),
    shot,
    tempo:
      shot === "ending"
        ? "still"
        : shot === "commitment" || shot === "milestone"
          ? "response"
          : shot === "situation" || shot === "consultation"
            ? "reading"
            : state === "crisis" || state === "institutional-failure"
              ? "critical"
              : "ambient",
    litStation: resolveLitStation(inputs),
    paperLoad: resolvePaperLoad(inputs.turn, thresholds),
    endingId: inputs.ending,
    staffLayout: resolveStaffLayout(inputs, state, shot, thresholds),
    staffPoses: resolveStaffPoses(inputs, thresholds),
    ...(inputs.persistentRoomMarks
      ? { persistentRoomMarks: inputs.persistentRoomMarks }
      : {}),
  };
}
