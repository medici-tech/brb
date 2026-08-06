import type { CommitOptions, GameState } from "../game/types";
import { deserializePlaytestJournal } from "./journal-validation";
import { PLAYTEST_BUILD_ID, PLAYTEST_JOURNAL_VERSION } from "./types";
import type {
  PlaytestActionStep,
  PlaytestCommitOptions,
  PlaytestJournalExport,
  PlaytestJournalV2,
  PlaytestMarker,
  PlaytestMarkerLocation,
  PlaytestMomentSnapshot,
  PlaytestRunEntry,
  PlaytestRunKind,
  PlaytestStepCheckpoint,
} from "./types";

export const PLAYTEST_STORAGE_KEY = "brb.playtest-journal.v2";
export { PLAYTEST_BUILD_ID, PLAYTEST_JOURNAL_VERSION };

/**
 * Journals written before free play recorded a guided six-run matrix that no
 * longer exists. They are discarded rather than migrated, and the dead blob is
 * removed so it does not occupy a constrained localStorage forever.
 */
const PLAYTEST_LEGACY_STORAGE_KEYS = ["brb.playtest-journal.v1"];

/**
 * How many completed runs keep a full step log. Free play removes the six-run
 * cap the matrix used to impose, and localStorage is finite: older runs degrade
 * to their summary, markers, and coverage, which is what triage actually reads.
 */
export const RETAINED_STEP_LOG_RUNS = 25;

function timestamp(now?: string): string {
  return now ?? new Date().toISOString();
}

export function createEmptyPlaytestJournal(now?: string): PlaytestJournalV2 {
  const createdAt = timestamp(now);
  return {
    version: PLAYTEST_JOURNAL_VERSION,
    buildId: PLAYTEST_BUILD_ID,
    createdAt,
    updatedAt: createdAt,
    runs: [],
    markers: [],
  };
}

export function loadPlaytestJournal(storage: Storage, now?: string): PlaytestJournalV2 {
  try {
    const raw = storage.getItem(PLAYTEST_STORAGE_KEY);
    if (!raw) return createEmptyPlaytestJournal(now);
    return deserializePlaytestJournal(raw);
  } catch {
    // The journal is a record, never a source of truth for the campaign. A
    // corrupt or superseded one degrades to empty rather than blocking play.
    return createEmptyPlaytestJournal(now);
  }
}

/**
 * Returns false when the write failed, which in practice means the origin quota
 * is exhausted. Callers must treat a failed journal write as non-fatal: the
 * campaign save is the source of truth and has to land regardless.
 */
export function savePlaytestJournal(storage: Storage, journal: PlaytestJournalV2): boolean {
  try {
    storage.setItem(PLAYTEST_STORAGE_KEY, JSON.stringify(journal));
    for (const key of PLAYTEST_LEGACY_STORAGE_KEYS) storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function clearPlaytestJournal(storage: Storage): void {
  storage.removeItem(PLAYTEST_STORAGE_KEY);
  for (const key of PLAYTEST_LEGACY_STORAGE_KEYS) storage.removeItem(key);
}

function cloneJournal(journal: PlaytestJournalV2, now?: string): PlaytestJournalV2 {
  const next = structuredClone(journal);
  next.updatedAt = timestamp(now);
  return next;
}

/**
 * Drops `false` flags rather than storing them, so two identical commitments
 * always serialize identically.
 */
export function normalizePlaytestCommitOptions(options: CommitOptions = {}): PlaytestCommitOptions {
  const normalized: PlaytestCommitOptions = {};
  if (options.confirmCardAbandonment) normalized.confirmCardAbandonment = true;
  if (options.useLegacyDirective) normalized.useLegacyDirective = true;
  return normalized;
}

function checkpointOf(state: GameState): PlaytestStepCheckpoint {
  return {
    turn: state.turn,
    rngState: state.rngState,
    phase: state.phase,
    decisionCount: state.decisionHistory.length,
    latestDecisionId: state.decisionHistory.at(-1)?.id ?? null,
    endingId: state.ending?.id ?? null,
  };
}

function snapshotMoment(state: GameState, now?: string): PlaytestMomentSnapshot {
  const latestDecision = state.decisionHistory.at(-1);
  return {
    turn: latestDecision?.turn ?? state.turn,
    activeCardId: state.activeCardId,
    resources: structuredClone(state.resources),
    tracks: structuredClone(state.tracks),
    pressures: structuredClone(state.pressures),
    institutions: state.institutions,
    corporation: {
      strategy: state.corporation.strategy,
      progress: state.corporation.progress,
      threat: state.corporation.threat,
    },
    advisorLeverage: {
      analyst: state.advisors.analyst.leverage,
      fixer: state.advisors.fixer.leverage,
      steward: state.advisors.steward.leverage,
    },
    endingId: state.ending?.id ?? null,
    capturedAt: timestamp(now),
    decisionId: latestDecision?.id ?? null,
    category: latestDecision?.category ?? null,
    summary: latestDecision?.summary ?? null,
    cardId: latestDecision?.cardId ?? null,
    choiceId: latestDecision?.choiceId ?? null,
  };
}

function cardsSeenIn(state: GameState): string[] {
  return Object.keys(state.deck.drawCounts).sort();
}

function newRunEntry(
  state: GameState,
  kind: PlaytestRunKind,
  replayComplete: boolean,
  now?: string,
): PlaytestRunEntry {
  return {
    runId: state.runId,
    kind,
    seed: state.seed,
    archetypeId: state.archetypeId,
    legacyDirectiveId: state.legacyDirective.equippedId,
    experiment: state.experiment,
    startedAt: timestamp(now),
    completedAt: null,
    status: "active",
    endingId: null,
    months: null,
    steps: [],
    cardsSeen: cardsSeenIn(state),
    finalSnapshot: null,
    replayComplete,
  };
}

/**
 * Records a campaign the player just started. Free play imposes no archetype or
 * Directive; whatever they chose is what gets recorded.
 */
export function startPlaytestRun(
  journal: PlaytestJournalV2,
  state: GameState,
  kind: PlaytestRunKind = "primary",
  now?: string,
): PlaytestJournalV2 {
  const next = cloneJournal(journal, now);
  if (next.runs.some((run) => run.runId === state.runId)) return next;
  next.runs.push(newRunEntry(state, kind, true, now));
  return next;
}

/**
 * Adopts a campaign that is already under way but has no journal entry, which
 * happens when the journal is reset or replaced while the campaign save
 * survives. The run is marked unreproducible rather than given a step log that
 * would begin mid-campaign and make the replayer report a false divergence.
 */
export function adoptUntrackedRun(
  journal: PlaytestJournalV2,
  state: GameState,
  now?: string,
): PlaytestJournalV2 {
  const next = cloneJournal(journal, now);
  if (next.runs.some((run) => run.runId === state.runId)) return next;
  next.runs.push(newRunEntry(state, "primary", false, now));
  return next;
}

/**
 * Appends one accepted engine input and the state it produced. `state` must be
 * the state *after* the step; a rejected action must not be recorded, since the
 * engine returns the original state and nothing happened.
 */
export function recordPlaytestStep(
  journal: PlaytestJournalV2,
  step: PlaytestActionStep,
  state: GameState,
  now?: string,
): PlaytestJournalV2 {
  const next = cloneJournal(journal, now);
  const run = next.runs.find((candidate) => candidate.runId === state.runId && candidate.status === "active");
  if (!run) return next;
  run.steps.push({
    index: run.steps.length + 1,
    step,
    after: checkpointOf(state),
    recordedAt: timestamp(now),
  });
  run.cardsSeen = cardsSeenIn(state);
  return next;
}

/**
 * Degrades the step logs of every completed run beyond the newest
 * `RETAINED_STEP_LOG_RUNS`, so an unbounded number of sessions cannot exhaust
 * the origin quota. Coverage, markers, and the run summary all survive.
 */
function pruneStepLogs(journal: PlaytestJournalV2): void {
  const completed = journal.runs
    .filter((run) => run.status !== "active" && run.steps.length > 0)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  for (const run of completed.slice(RETAINED_STEP_LOG_RUNS)) {
    run.steps = [];
    run.replayComplete = false;
  }
}

export function completePlaytestRun(
  journal: PlaytestJournalV2,
  state: GameState,
  now?: string,
): PlaytestJournalV2 {
  const next = cloneJournal(journal, now);
  const run = next.runs.find((candidate) => candidate.runId === state.runId);
  if (!run) return next;
  run.status = "completed";
  run.completedAt = timestamp(now);
  run.endingId = state.ending?.id ?? null;
  run.months = state.turn;
  run.cardsSeen = cardsSeenIn(state);
  run.finalSnapshot = snapshotMoment(state, now);
  pruneStepLogs(next);
  return next;
}

export function abandonActivePlaytestRun(
  journal: PlaytestJournalV2,
  now?: string,
): PlaytestJournalV2 {
  const next = cloneJournal(journal, now);
  const run = [...next.runs].reverse().find((candidate) => candidate.status === "active");
  if (!run) return next;
  run.status = "abandoned";
  run.completedAt = timestamp(now);
  pruneStepLogs(next);
  return next;
}

export function addPlaytestMarker(
  journal: PlaytestJournalV2,
  runId: string,
  location: PlaytestMarkerLocation,
  note: string,
  state?: GameState | null,
  now?: string,
  markerId?: string,
): PlaytestJournalV2 {
  const trimmed = note.trim();
  if (!trimmed) throw new Error("A marker needs a note.");
  const next = cloneJournal(journal, now);
  const run = next.runs.find((candidate) => candidate.runId === runId);
  if (!run) throw new Error("Marker run was not found in the journal.");
  const marker: PlaytestMarker = {
    id: markerId ?? `marker-${timestamp(now)}-${next.markers.length + 1}`,
    runId,
    location,
    note: trimmed,
    createdAt: timestamp(now),
    snapshot: (state ? snapshotMoment(state, now) : null) ?? run.finalSnapshot ?? null,
  };
  next.markers.push(marker);
  return next;
}

export function serializePlaytestJournal(journal: PlaytestJournalV2): string {
  const payload: PlaytestJournalExport = {
    exportedAt: new Date().toISOString(),
    version: PLAYTEST_JOURNAL_VERSION,
    journal,
  };
  return JSON.stringify(payload, null, 2);
}
