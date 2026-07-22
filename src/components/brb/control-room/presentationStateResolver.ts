import { getBrbCompletionPercent } from "../../../game/progression";
import type { CardType, GameState } from "../../../game/types";
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
};

export type PresentationModel = {
  state: PresentationState;
  stateLabel: string;
  caption: string;
  focus: Exclude<PresentationFocus, "commit">;
  brbProgress: number;
  brbStage: BrbVisualStage;
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

export function resolvePresentationModel(
  inputs: Readonly<PresentationInputs>,
  thresholds: PresentationThresholds = PRESENTATION_THRESHOLDS,
): PresentationModel {
  const state = resolvePresentationState(inputs, thresholds);
  const copy = PRESENTATION_STATE_COPY[state];

  return {
    state,
    stateLabel: copy.label,
    caption: copy.caption,
    focus: inputs.phase === "consulted" ? "investigate" : "assess",
    brbProgress: inputs.brbProgress,
    brbStage: getBrbVisualStage(inputs.brbProgress),
  };
}
