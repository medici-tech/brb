import type { GameState } from "../game/types";
import {
  PLAYTEST_BOOKMARK_CATEGORIES,
  PLAYTEST_SEVERITIES,
  type PlaytestBookmark,
  type PlaytestBookmarkCategory,
  type PlaytestDecisionSnapshot,
  type PlaytestJournalSummary,
  type PlaytestJournalV1,
  type PlaytestMatrixSlot,
  type PlaytestMomentSnapshot,
  type PlaytestRecap,
  type PlaytestRunEntry,
  type PlaytestSeverity,
} from "./types";

export const PLAYTEST_STORAGE_KEY = "brb.playtest-journal.v1";
export const PLAYTEST_BUILD_ID = "guided-internal-v1" as const;
export const REPLAY_CHECKPOINT_COMMITMENTS = 5;

const MATRIX_DEFINITIONS = [
  {
    id: "technocrat-natural",
    archetypeId: "technocrat",
    label: "Technocrat · natural play",
    strategy: "Play naturally without targeting a specific ending.",
    replayRequired: true,
  },
  {
    id: "populist-natural",
    archetypeId: "populist",
    label: "Populist · natural play",
    strategy: "Play naturally without targeting a specific ending.",
    replayRequired: true,
  },
  {
    id: "operator-natural",
    archetypeId: "operator",
    label: "Operator · natural play",
    strategy: "Play naturally without targeting a specific ending.",
    replayRequired: true,
  },
  {
    id: "technocrat-defensive",
    archetypeId: "technocrat",
    label: "Technocrat · slow defense",
    strategy: "Stabilize the state before accelerating the BRB.",
    replayRequired: false,
  },
  {
    id: "populist-coalition",
    archetypeId: "populist",
    label: "Populist · coalition legitimacy",
    strategy: "Build public backing before accepting expedient shortcuts.",
    replayRequired: false,
  },
  {
    id: "operator-counter",
    archetypeId: "operator",
    label: "Operator · access and countering",
    strategy: "Use intelligence and direct counter-operations to control Access.",
    replayRequired: false,
  },
] as const;

export type GuidedRunObjective = {
  label: string;
  strategy: string;
  checklist: string[];
};

const GUIDED_CHECKLISTS: Record<string, string[]> = {
  "technocrat-natural": [
    "Choose according to your own judgment; do not target a known ending.",
    "Consult only when the information feels worth its cost.",
    "Record any moment where the result does not match your expectation.",
  ],
  "populist-natural": [
    "Choose according to your own judgment; do not target a known ending.",
    "Notice when public promises compete with BRB progress.",
    "Record any moment where the result does not match your expectation.",
  ],
  "operator-natural": [
    "Choose according to your own judgment; do not target a known ending.",
    "Use the Fixer only when the dependence feels worthwhile.",
    "Record any moment where the result does not match your expectation.",
  ],
  "technocrat-defensive": [
    "Favor Standard Deposits over Large Deposits while pressure is elevated.",
    "Protect Institutions and recover resources before they become dangerously low.",
    "Consult before countering; avoid guessing at Corporation Posture.",
    "Do not rush BRB progress while Panic or Corporation Threat is high.",
  ],
  "populist-coalition": [
    "Favor coalition actions and Legitimacy Deposits.",
    "Protect Trust and choose public-facing Situation responses.",
    "Avoid opaque shortcuts even when they offer immediate resources.",
    "Watch whether public backing survives late-game pressure.",
  ],
  "operator-counter": [
    "Favor Access Deposits and direct Corporation counter-operations.",
    "Consult the Fixer when the added Leverage is worth the forecast or containment.",
    "Keep enough Intel and Influence available to counter the predicted Posture.",
    "Record whether rising Fixer Leverage changes your decisions.",
  ],
};

export function getGuidedRunObjective(slotId: string): GuidedRunObjective | null {
  const definition = MATRIX_DEFINITIONS.find((candidate) => candidate.id === slotId);
  if (!definition) return null;
  return {
    label: definition.label,
    strategy: definition.strategy,
    checklist: GUIDED_CHECKLISTS[slotId] ?? [],
  };
}

function timestamp(now?: string): string {
  return now ?? new Date().toISOString();
}

export function createPlaytestMatrix(): PlaytestMatrixSlot[] {
  return MATRIX_DEFINITIONS.map((definition, index) => ({
    ...definition,
    order: index + 1,
    status: "pending",
    primaryRunId: null,
    replayRunId: null,
    replayCommitments: 0,
  }));
}

export function createEmptyPlaytestJournal(now?: string): PlaytestJournalV1 {
  const createdAt = timestamp(now);
  return {
    version: 1,
    buildId: PLAYTEST_BUILD_ID,
    createdAt,
    updatedAt: createdAt,
    matrix: createPlaytestMatrix(),
    runs: [],
    bookmarks: [],
  };
}

function isValidJournal(value: unknown): value is PlaytestJournalV1 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PlaytestJournalV1>;
  const matrixStatuses = ["pending", "active", "awaiting_recap", "awaiting_replay", "replay_active", "completed"];
  const runStatuses = ["active", "completed", "checkpoint_reached", "abandoned"];
  return candidate.version === 1
    && candidate.buildId === PLAYTEST_BUILD_ID
    && typeof candidate.createdAt === "string"
    && typeof candidate.updatedAt === "string"
    && Array.isArray(candidate.matrix)
    && candidate.matrix.length === MATRIX_DEFINITIONS.length
    && candidate.matrix.every((slot, index) => slot?.id === MATRIX_DEFINITIONS[index]?.id
      && matrixStatuses.includes(slot.status)
      && typeof slot.order === "number"
      && typeof slot.replayRequired === "boolean"
      && typeof slot.replayCommitments === "number")
    && Array.isArray(candidate.runs)
    && candidate.runs.every((run) => typeof run?.runId === "string"
      && typeof run.slotId === "string"
      && (run.kind === "primary" || run.kind === "replay")
      && runStatuses.includes(run.status)
      && Number.isInteger(run.seed)
      && Array.isArray(run.decisions))
    && Array.isArray(candidate.bookmarks)
    && candidate.bookmarks.every((bookmark) => typeof bookmark?.id === "string"
      && typeof bookmark.runId === "string"
      && PLAYTEST_BOOKMARK_CATEGORIES.includes(bookmark.category)
      && PLAYTEST_SEVERITIES.includes(bookmark.severity)
      && typeof bookmark.note === "string");
}

export function loadPlaytestJournal(storage: Storage, now?: string): PlaytestJournalV1 {
  try {
    const raw = storage.getItem(PLAYTEST_STORAGE_KEY);
    if (!raw) return createEmptyPlaytestJournal(now);
    const value = JSON.parse(raw) as unknown;
    return isValidJournal(value) ? value : createEmptyPlaytestJournal(now);
  } catch {
    return createEmptyPlaytestJournal(now);
  }
}

export function savePlaytestJournal(storage: Storage, journal: PlaytestJournalV1): void {
  storage.setItem(PLAYTEST_STORAGE_KEY, JSON.stringify(journal));
}

export function clearPlaytestJournal(storage: Storage): void {
  storage.removeItem(PLAYTEST_STORAGE_KEY);
}

function cloneJournal(journal: PlaytestJournalV1, now?: string): PlaytestJournalV1 {
  const next = structuredClone(journal);
  next.updatedAt = timestamp(now);
  return next;
}

function captureState(state: GameState, now?: string): Omit<
  PlaytestMomentSnapshot,
  "decisionId" | "category" | "summary" | "cardId" | "choiceId"
> {
  return {
    turn: state.turn,
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
  };
}

function snapshotMoment(state: GameState, now?: string): PlaytestMomentSnapshot {
  const latestDecision = state.decisionHistory.at(-1);
  return {
    ...captureState(state, now),
    turn: latestDecision?.turn ?? state.turn,
    decisionId: latestDecision?.id ?? null,
    category: latestDecision?.category ?? null,
    summary: latestDecision?.summary ?? null,
    cardId: latestDecision?.cardId ?? null,
    choiceId: latestDecision?.choiceId ?? null,
  };
}

function snapshotState(state: GameState, now?: string): PlaytestDecisionSnapshot | null {
  const latestDecision = state.decisionHistory.at(-1);
  if (!latestDecision) return null;
  return {
    ...captureState(state, now),
    turn: latestDecision.turn,
    decisionId: latestDecision.id,
    category: latestDecision.category,
    summary: latestDecision.summary,
    cardId: latestDecision.cardId,
    choiceId: latestDecision.choiceId,
  };
}

function newRunEntry(
  slot: PlaytestMatrixSlot,
  state: GameState,
  kind: PlaytestRunEntry["kind"],
  now?: string,
): PlaytestRunEntry {
  return {
    runId: state.runId,
    slotId: slot.id,
    kind,
    seed: state.seed,
    archetypeId: state.archetypeId,
    experiment: state.experiment,
    startedAt: timestamp(now),
    completedAt: null,
    status: "active",
    endingId: null,
    months: null,
    decisions: [],
    finalSnapshot: null,
    recap: null,
  };
}

export function startPrimaryPlaytestRun(
  journal: PlaytestJournalV1,
  slotId: string,
  state: GameState,
  now?: string,
): PlaytestJournalV1 {
  const next = cloneJournal(journal, now);
  const slot = next.matrix.find((candidate) => candidate.id === slotId);
  if (!slot) throw new Error(`Unknown playtest matrix slot: ${slotId}`);
  if (slot.status !== "pending") throw new Error("This playtest slot has already started.");
  if (slot.archetypeId !== state.archetypeId) throw new Error("Run archetype does not match the playtest slot.");
  slot.status = "active";
  slot.primaryRunId = state.runId;
  next.runs.push(newRunEntry(slot, state, "primary", now));
  return next;
}

export function startReplayPlaytestRun(
  journal: PlaytestJournalV1,
  primaryRunId: string,
  state: GameState,
  now?: string,
): PlaytestJournalV1 {
  const next = cloneJournal(journal, now);
  const slot = next.matrix.find((candidate) => candidate.primaryRunId === primaryRunId);
  if (!slot || slot.status !== "awaiting_replay") {
    throw new Error("This run is not ready for its replay sample.");
  }
  if (state.seed !== next.runs.find((run) => run.runId === primaryRunId)?.seed) {
    throw new Error("Replay sample must use the original seed.");
  }
  slot.status = "replay_active";
  slot.replayRunId = state.runId;
  slot.replayCommitments = 0;
  next.runs.push(newRunEntry(slot, state, "replay", now));
  return next;
}

export type RecordPlaytestDecisionResult = {
  journal: PlaytestJournalV1;
  checkpointReached: boolean;
};

export function recordPlaytestDecision(
  journal: PlaytestJournalV1,
  state: GameState,
  now?: string,
): RecordPlaytestDecisionResult {
  const next = cloneJournal(journal, now);
  const run = next.runs.find((candidate) => candidate.runId === state.runId && candidate.status === "active");
  const snapshot = snapshotState(state, now);
  if (!run || !snapshot) return { journal: next, checkpointReached: false };
  if (!run.decisions.some((decision) => decision.decisionId === snapshot.decisionId)) {
    run.decisions.push(snapshot);
  }

  if (run.kind !== "replay" || state.phase === "ended") {
    return { journal: next, checkpointReached: false };
  }

  const slot = next.matrix.find((candidate) => candidate.id === run.slotId);
  if (!slot) return { journal: next, checkpointReached: false };
  slot.replayCommitments = run.decisions.length;
  if (run.decisions.length < REPLAY_CHECKPOINT_COMMITMENTS) {
    return { journal: next, checkpointReached: false };
  }

  run.status = "checkpoint_reached";
  run.completedAt = timestamp(now);
  run.finalSnapshot = snapshot;
  slot.status = "completed";
  return { journal: next, checkpointReached: true };
}

export function completePlaytestRun(
  journal: PlaytestJournalV1,
  state: GameState,
  now?: string,
): PlaytestJournalV1 {
  const next = cloneJournal(journal, now);
  const run = next.runs.find((candidate) => candidate.runId === state.runId);
  if (!run) return next;
  const snapshot = snapshotState(state, now) ?? run.decisions.at(-1) ?? null;
  if (snapshot && !run.decisions.some((decision) => decision.decisionId === snapshot.decisionId)) {
    run.decisions.push(snapshot);
  }
  run.status = "completed";
  run.completedAt = timestamp(now);
  run.endingId = state.ending?.id ?? null;
  run.months = state.turn;
  run.finalSnapshot = snapshot;
  const slot = next.matrix.find((candidate) => candidate.id === run.slotId);
  if (slot) slot.status = run.kind === "primary" ? "awaiting_recap" : "completed";
  return next;
}

export function savePlaytestRecap(
  journal: PlaytestJournalV1,
  runId: string,
  recap: Omit<PlaytestRecap, "recordedAt">,
  now?: string,
): PlaytestJournalV1 {
  const next = cloneJournal(journal, now);
  const run = next.runs.find((candidate) => candidate.runId === runId && candidate.kind === "primary");
  if (!run || run.status !== "completed") throw new Error("A completed primary run is required for a recap.");
  run.recap = { ...recap, nextExperiment: recap.nextExperiment.trim(), recordedAt: timestamp(now) };
  const slot = next.matrix.find((candidate) => candidate.id === run.slotId);
  if (slot) slot.status = slot.replayRequired ? "awaiting_replay" : "completed";
  return next;
}

export function abandonActivePlaytestRun(journal: PlaytestJournalV1, now?: string): PlaytestJournalV1 {
  const next = cloneJournal(journal, now);
  const run = [...next.runs].reverse().find((candidate) => candidate.status === "active");
  if (!run) return next;
  run.status = "abandoned";
  run.completedAt = timestamp(now);
  run.finalSnapshot = run.decisions.at(-1) ?? null;
  const slot = next.matrix.find((candidate) => candidate.id === run.slotId);
  if (slot) {
    if (run.kind === "primary") {
      slot.status = "pending";
      slot.primaryRunId = null;
    } else {
      slot.status = "awaiting_replay";
      slot.replayRunId = null;
      slot.replayCommitments = 0;
    }
  }
  return next;
}

export type BookmarkInput = {
  category: PlaytestBookmarkCategory;
  severity: PlaytestSeverity;
  note: string;
};

export function addPlaytestBookmark(
  journal: PlaytestJournalV1,
  runId: string,
  location: PlaytestBookmark["location"],
  input: BookmarkInput,
  state?: GameState | null,
  now?: string,
  bookmarkId?: string,
): PlaytestJournalV1 {
  if (!PLAYTEST_BOOKMARK_CATEGORIES.includes(input.category)) throw new Error("Invalid bookmark category.");
  if (!PLAYTEST_SEVERITIES.includes(input.severity)) throw new Error("Invalid bookmark severity.");
  if (!input.note.trim()) throw new Error("Bookmark note is required.");
  const next = cloneJournal(journal, now);
  const run = next.runs.find((candidate) => candidate.runId === runId);
  if (!run) throw new Error("Bookmark run was not found in the journal.");
  const currentSnapshot = state ? snapshotMoment(state, now) : null;
  const bookmark: PlaytestBookmark = {
    id: bookmarkId ?? `bookmark-${timestamp(now)}-${next.bookmarks.length + 1}`,
    runId,
    slotId: run.slotId,
    location,
    category: input.category,
    severity: input.severity,
    note: input.note.trim(),
    createdAt: timestamp(now),
    snapshot: currentSnapshot ?? run.finalSnapshot ?? run.decisions.at(-1) ?? null,
  };
  next.bookmarks.push(bookmark);
  return next;
}

function decisionSignature(snapshot: PlaytestDecisionSnapshot): string {
  return [snapshot.category, snapshot.cardId ?? "", snapshot.choiceId ?? "", snapshot.summary].join("|");
}

export function getReplayDivergence(
  journal: PlaytestJournalV1,
  slot: PlaytestMatrixSlot,
): number | null {
  if (!slot.primaryRunId || !slot.replayRunId) return null;
  const primary = journal.runs.find((run) => run.runId === slot.primaryRunId);
  const replay = journal.runs.find((run) => run.runId === slot.replayRunId);
  if (!primary || !replay) return null;
  const comparisonLength = Math.min(primary.decisions.length, replay.decisions.length);
  for (let index = 0; index < comparisonLength; index += 1) {
    if (decisionSignature(primary.decisions[index]!) !== decisionSignature(replay.decisions[index]!)) {
      return index + 1;
    }
  }
  return null;
}

export function summarizePlaytestJournal(journal: PlaytestJournalV1): PlaytestJournalSummary {
  const primaryRuns = journal.runs.filter((run) => run.kind === "primary" && run.status === "completed");
  const endings: PlaytestJournalSummary["endings"] = {};
  for (const run of primaryRuns) {
    if (run.endingId) endings[run.endingId] = (endings[run.endingId] ?? 0) + 1;
  }
  const bookmarkCategories: PlaytestJournalSummary["bookmarkCategories"] = {};
  const highSeverity: Partial<Record<PlaytestBookmarkCategory, number>> = {};
  for (const bookmark of journal.bookmarks) {
    bookmarkCategories[bookmark.category] = (bookmarkCategories[bookmark.category] ?? 0) + 1;
    if (bookmark.severity === "high") highSeverity[bookmark.category] = (highSeverity[bookmark.category] ?? 0) + 1;
  }
  const campaignMonths = primaryRuns.flatMap((run) => run.months === null ? [] : [run.months]);
  return {
    completedSlots: journal.matrix.filter((slot) => slot.status === "completed").length,
    totalSlots: journal.matrix.length,
    endings,
    averageCampaignMonths: campaignMonths.length > 0
      ? campaignMonths.reduce((sum, months) => sum + months, 0) / campaignMonths.length
      : null,
    bookmarkCategories,
    recurringHighSeverityCategories: PLAYTEST_BOOKMARK_CATEGORIES.filter((category) => (highSeverity[category] ?? 0) >= 2),
    replayDivergence: Object.fromEntries(journal.matrix
      .filter((slot) => slot.replayRequired)
      .map((slot) => [slot.id, getReplayDivergence(journal, slot)])),
  };
}

export function serializePlaytestJournal(journal: PlaytestJournalV1): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), journal }, null, 2);
}
