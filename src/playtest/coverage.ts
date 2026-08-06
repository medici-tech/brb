import { ARCHETYPES, SITUATION_CARDS } from "../game/content";
import { ENDING_IDS, LEGACY_DIRECTIVE_IDS } from "../game/types";
import type { ArchetypeId, EndingId, LegacyDirectiveId } from "../game/types";
import type { PlaytestJournalV2, PlaytestRunEntry } from "./types";

/**
 * What free play reports instead of a prescribed run order. Coverage is
 * information, never a gate: `missing` exists so a gap is visible, not so the
 * app can withhold anything.
 */
export type CoverageAxis<K extends string> = {
  covered: number;
  total: number;
  counts: Partial<Record<K, number>>;
  missing: K[];
};

/** "none" is a real, coverable choice — playing without a Directive is a plan. */
export type DirectiveCoverageKey = LegacyDirectiveId | "none";

export type MonthHistogramBucket = { label: string; runs: number };

export type PlaytestCoverage = {
  runs: { total: number; completed: number; abandoned: number; active: number };
  archetypes: CoverageAxis<ArchetypeId>;
  directives: CoverageAxis<DirectiveCoverageKey>;
  endings: CoverageAxis<EndingId>;
  cards: CoverageAxis<string>;
  months: {
    shortest: number | null;
    longest: number | null;
    median: number | null;
    histogram: MonthHistogramBucket[];
  };
  markers: { total: number; campaign: number; report: number };
  replayComplete: { complete: number; total: number };
};

const MONTH_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "1-6", min: 1, max: 6 },
  { label: "7-12", min: 7, max: 12 },
  { label: "13-18", min: 13, max: 18 },
  { label: "19-24", min: 19, max: 24 },
  { label: "25+", min: 25, max: Number.POSITIVE_INFINITY },
];

function axisOf<K extends string>(universe: readonly K[], observed: K[]): CoverageAxis<K> {
  const counts: Partial<Record<K, number>> = {};
  for (const key of observed) counts[key] = (counts[key] ?? 0) + 1;
  const missing = universe.filter((key) => !(key in counts));
  return { covered: universe.length - missing.length, total: universe.length, counts, missing };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
    : sorted[middle] ?? null;
}

function directiveKey(run: PlaytestRunEntry): DirectiveCoverageKey {
  return run.legacyDirectiveId ?? "none";
}

/**
 * Completed runs feed endings and campaign length, because an abandoned run has
 * neither. Every run feeds archetypes, Directives, and cards — an abandoned
 * Operator campaign still proves an Operator was played.
 */
export function summarizePlaytestCoverage(journal: PlaytestJournalV2): PlaytestCoverage {
  const { runs, markers } = journal;
  const completed = runs.filter((run) => run.status === "completed");
  const months = completed.flatMap((run) => (run.months === null ? [] : [run.months]));

  const archetypeIds = Object.keys(ARCHETYPES) as ArchetypeId[];
  const directiveKeys: DirectiveCoverageKey[] = ["none", ...LEGACY_DIRECTIVE_IDS];
  const cardIds = SITUATION_CARDS.map((card) => card.id);

  return {
    runs: {
      total: runs.length,
      completed: completed.length,
      abandoned: runs.filter((run) => run.status === "abandoned").length,
      active: runs.filter((run) => run.status === "active").length,
    },
    archetypes: axisOf(archetypeIds, runs.map((run) => run.archetypeId)),
    directives: axisOf(directiveKeys, runs.map(directiveKey)),
    endings: axisOf(ENDING_IDS, completed.flatMap((run) => (run.endingId ? [run.endingId] : []))),
    cards: axisOf(cardIds, runs.flatMap((run) => run.cardsSeen)),
    months: {
      shortest: months.length > 0 ? Math.min(...months) : null,
      longest: months.length > 0 ? Math.max(...months) : null,
      median: median(months),
      histogram: MONTH_BUCKETS.map((bucket) => ({
        label: bucket.label,
        runs: months.filter((month) => month >= bucket.min && month <= bucket.max).length,
      })),
    },
    markers: {
      total: markers.length,
      campaign: markers.filter((marker) => marker.location === "campaign").length,
      report: markers.filter((marker) => marker.location === "report").length,
    },
    replayComplete: {
      complete: runs.filter((run) => run.replayComplete).length,
      total: runs.length,
    },
  };
}
