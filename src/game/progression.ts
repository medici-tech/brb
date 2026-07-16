import { TRACK_KEYS, type GameState } from "./types";
import { clamp } from "./state-helpers";

export type CompletionPressureTier = "quiet" | "watched" | "contested" | "severe" | "critical";

export type CompletionPressure = {
  completionPercent: number;
  tier: CompletionPressureTier;
  corporationProgressEveryMonths: number | null;
  panicEveryMonths: number | null;
};

export function getBrbCompletionPercent(state: GameState): number {
  const completedPoints = TRACK_KEYS.reduce(
    (total, track) => total + Math.min(50, state.tracks[track]),
    0,
  );
  return Math.floor((completedPoints / (TRACK_KEYS.length * 50)) * 100);
}

export function getCompletionPressure(state: GameState): CompletionPressure {
  const completionPercent = getBrbCompletionPercent(state);
  if (completionPercent >= 90) {
    return {
      completionPercent,
      tier: "critical",
      corporationProgressEveryMonths: 1,
      panicEveryMonths: 3,
    };
  }
  if (completionPercent >= 75) {
    return {
      completionPercent,
      tier: "severe",
      corporationProgressEveryMonths: 2,
      panicEveryMonths: 4,
    };
  }
  if (completionPercent >= 50) {
    return {
      completionPercent,
      tier: "contested",
      corporationProgressEveryMonths: 3,
      panicEveryMonths: null,
    };
  }
  if (completionPercent >= 25) {
    return {
      completionPercent,
      tier: "watched",
      corporationProgressEveryMonths: 4,
      panicEveryMonths: null,
    };
  }
  return {
    completionPercent,
    tier: "quiet",
    corporationProgressEveryMonths: null,
    panicEveryMonths: null,
  };
}

export function applyCompletionPressure(state: GameState): CompletionPressure {
  const pressure = getCompletionPressure(state);
  if (
    pressure.corporationProgressEveryMonths !== null &&
    state.turn % pressure.corporationProgressEveryMonths === 0
  ) {
    state.corporation.progress = clamp(state.corporation.progress + 1);
  }
  if (pressure.panicEveryMonths !== null && state.turn % pressure.panicEveryMonths === 0) {
    state.pressures.panic = clamp(state.pressures.panic + 1);
  }
  return pressure;
}

export function describeCompletionPressure(pressure: CompletionPressure): string {
  const corporation = pressure.corporationProgressEveryMonths === null
    ? "no extra Corporation progress"
    : pressure.corporationProgressEveryMonths === 1
      ? "+1 Corporation progress every month"
      : `+1 Corporation progress every ${pressure.corporationProgressEveryMonths} months`;
  const panic = pressure.panicEveryMonths === null
    ? "no extra Panic"
    : `+1 Panic every ${pressure.panicEveryMonths} months`;
  return `${corporation}; ${panic}`;
}

export function formatCampaignTime(month: number): string {
  const elapsedMonth = Math.max(1, Math.floor(month));
  const year = Math.floor((elapsedMonth - 1) / 12) + 1;
  const monthOfYear = ((elapsedMonth - 1) % 12) + 1;
  return `Month ${elapsedMonth} · Year ${year}, Month ${monthOfYear}`;
}
