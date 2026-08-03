import { getCabalMembers, isCoupCondition } from "../../../game/advisor-rules";
import { getBrbCompletionPercent } from "../../../game/progression";
import { ADVISOR_IDS } from "../../../game/types";
import type {
  AdvisorId,
  CardType,
  EndingId,
  GameState,
} from "../../../game/types";
import type { RoomLighting } from "../pixel-room/roomTypes";
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

/**
 * Who is actually holding the state in the current shot.
 *
 * `public` is every ordinary shot and the four endings that do not involve a
 * takeover. `seized` is one advisor; `shared` is a cabal. `holders` names the
 * stations to light and may be empty even for a takeover — a legacy save or a
 * synthetic fixture can carry the ending without the leverage that produced it,
 * and the room must still read as a takeover rather than as a collapse.
 */
export type AuthorityMode = "public" | "seized" | "shared";
export type RoomAuthority = {
  mode: AuthorityMode;
  holders: readonly AdvisorId[];
};

/**
 * Per-ending lighting OVERRIDE. `null` means the ending does not override and
 * the derived presentation state decides, which is why this cannot be a flat
 * `Record<EndingId, RoomLighting>`.
 *
 * Typed as a total record on purpose: a new ending that forgets a grade is a
 * compile error here rather than a tableau that silently renders `calm`. That is
 * precisely how the advisor pair shipped looking like a quiet operations shot.
 */
const ENDING_LIGHTING: Readonly<Record<EndingId, RoomLighting | null>> = {
  civic_legacy: null,
  compromised_activation: "strained",
  corporate_capture: "crisis",
  state_collapse: "failure",
  advisor_coup: "captured",
  advisor_cabal: "captured",
};

/** Per-ending authority mode. Total for the same reason as `ENDING_LIGHTING`. */
const ENDING_AUTHORITY: Readonly<Record<EndingId, AuthorityMode>> = {
  civic_legacy: "public",
  compromised_activation: "public",
  corporate_capture: "public",
  state_collapse: "public",
  advisor_coup: "seized",
  advisor_cabal: "shared",
};

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
  /**
   * Advisors holding the state at an advisor-takeover ending. Derived, never
   * persisted: `Ending` is validated by `isEnding` and guards both the saved run
   * and the saved report, so a required new field there would invalidate every
   * existing save. Re-running the same predicates on the same final state is
   * lossless — a coup advisor is still active at leverage >= 85 when the run ends.
   */
  takeoverAdvisors: readonly AdvisorId[];
  persistentRoomMarks?: PersistentRoomMarks;
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
  lighting: RoomLighting;
  authority: RoomAuthority;
  staffLayout: StaffLayout;
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

/**
 * The advisors who hold the state at a takeover ending, re-derived from the
 * final `GameState` using the engine's own predicates.
 *
 * `find`, not `filter`, for the coup: `endings.ts` records a coup with
 * `ADVISOR_IDS.find(...)`, so a run where two advisors both cross the bar is
 * recorded as singular. Filtering here would light two stations for an ending
 * the engine considers one advisor's.
 */
export function resolveTakeoverAdvisors(
  state: GameState,
  ending: EndingId | null,
): readonly AdvisorId[] {
  if (ending === "advisor_coup") {
    const holder = ADVISOR_IDS.find((id) => isCoupCondition(state, id));
    return holder ? [holder] : [];
  }
  if (ending === "advisor_cabal") return getCabalMembers(state);
  return [];
}

/**
 * The room's colour grade. The ending overrides the derived state when it has an
 * opinion; otherwise the state decides, which is what keeps `civic_legacy`
 * reading as whatever the campaign actually looked like when it was won.
 */
export function resolveLighting(
  state: PresentationState,
  ending: EndingId | null,
): RoomLighting {
  const override = ending ? ENDING_LIGHTING[ending] : null;
  if (override) return override;
  if (state === "institutional-failure") return "failure";
  if (state === "crisis") return "crisis";
  if (state === "strained" || state === "corporate-encroachment") {
    return "strained";
  }
  return "calm";
}

export function resolveAuthority(
  ending: EndingId | null,
  takeoverAdvisors: readonly AdvisorId[],
): RoomAuthority {
  const mode = ending ? ENDING_AUTHORITY[ending] : "public";
  return { mode, holders: mode === "public" ? [] : takeoverAdvisors };
}

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
  const ending = intent.ending ?? state.ending?.id ?? null;
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
    ending,
    takeoverAdvisors: resolveTakeoverAdvisors(state, ending),
    persistentRoomMarks: derivePersistentRoomMarks(state),
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
    lighting: resolveLighting(state, inputs.ending),
    authority: resolveAuthority(inputs.ending, inputs.takeoverAdvisors),
    staffLayout: resolveStaffLayout(inputs, state, shot, thresholds),
    ...(inputs.persistentRoomMarks
      ? { persistentRoomMarks: inputs.persistentRoomMarks }
      : {}),
  };
}
