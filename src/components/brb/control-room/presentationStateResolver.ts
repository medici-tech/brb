import { getBrbCompletionPercent } from "../../../game/progression";
import type {
  AdvisorId,
  CardType,
  EndingId,
  GameState,
} from "../../../game/types";
import {
  PRESENTATION_THRESHOLDS,
  type PresentationThresholds,
} from "./presentationThresholds";

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
  };
}
