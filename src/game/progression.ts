import {
  TRACK_KEYS,
  type CompletionPressureTier,
  type CorporationPressure,
  type CorporationThreatTier,
  type GameState,
} from "./types";
import { clamp } from "./state-helpers";

export type CompletionPressure = {
  completionPercent: number;
  tier: CompletionPressureTier;
  corporationProgressEveryMonths: number | null;
  panicEveryMonths: number | null;
};

const CORPORATION_RESPONSE_INTERVALS: Record<CompletionPressureTier, number> = {
  quiet: 4,
  watched: 3,
  contested: 2,
  severe: 1,
  critical: 1,
};

export function getCorporationResponseInterval(tier: CompletionPressureTier): number {
  return CORPORATION_RESPONSE_INTERVALS[tier];
}

const THREAT_RULES: Record<
  CorporationThreatTier,
  { minimum: number; intervalModifierMonths: number; severityMultiplier: number }
> = {
  monitored: { minimum: 0, intervalModifierMonths: 0, severityMultiplier: 1 },
  mobilized: { minimum: 25, intervalModifierMonths: 0, severityMultiplier: 1.1 },
  aggressive: { minimum: 50, intervalModifierMonths: 1, severityMultiplier: 1.25 },
  critical: { minimum: 75, intervalModifierMonths: 2, severityMultiplier: 1.5 },
};

export function getCorporationThreatTier(threat: number): CorporationThreatTier {
  if (threat >= THREAT_RULES.critical.minimum) return "critical";
  if (threat >= THREAT_RULES.aggressive.minimum) return "aggressive";
  if (threat >= THREAT_RULES.mobilized.minimum) return "mobilized";
  return "monitored";
}

export function getCorporationPressure(state: GameState): CorporationPressure {
  const completion = getCompletionPressure(state);
  const tier = getCorporationThreatTier(state.corporation.threat);
  const rule = THREAT_RULES[tier];
  const baseResponseIntervalMonths = getCorporationResponseInterval(completion.tier);
  const responseIntervalMonths = Math.max(
    1,
    baseResponseIntervalMonths - rule.intervalModifierMonths,
  );
  const nextResponseMonth = state.corporation.lastResponseMonth + responseIntervalMonths;
  return {
    tier,
    severityMultiplier: rule.severityMultiplier,
    intervalModifierMonths: rule.intervalModifierMonths,
    baseResponseIntervalMonths,
    responseIntervalMonths,
    nextResponseMonth,
    monthsUntilResponse: Math.max(0, nextResponseMonth - state.turn),
  };
}

export function isCorporationResponseDue(
  state: GameState,
  _tier: CompletionPressureTier = getCompletionPressure(state).tier,
): boolean {
  return state.turn - state.corporation.lastResponseMonth
    >= getCorporationPressure(state).responseIntervalMonths;
}

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
  return `Campaign Month ${elapsedMonth} · Year ${year}`;
}
