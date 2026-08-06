import type {
  ActionCategory,
  AdvisorId,
  ArchetypeId,
  CorporationStrategy,
  EndingId,
  GameState,
  LegacyDirectiveId,
  MajorAction,
  PressurePool,
  ResourcePool,
  TrackPool,
} from "../game/types";

/** Derived from the engine so the two cannot drift. */
export type PlaytestGamePhase = GameState["phase"];

/**
 * The version and build ID are part of the schema, so they live beside it —
 * both the writer and the validator need them, and neither should import the
 * other.
 */
export const PLAYTEST_JOURNAL_VERSION = 2 as const;
export const PLAYTEST_BUILD_ID = "free-play-v2" as const;

export type PlaytestRunKind = "primary" | "replay";
export type PlaytestRunStatus = "active" | "completed" | "abandoned";
export type PlaytestMarkerLocation = "campaign" | "report";

/**
 * Canonical `CommitOptions`: falsey flags are omitted rather than stored as
 * `false`, so an exported journal stays byte-stable and its diffs stay readable.
 */
export type PlaytestCommitOptions = {
  confirmCardAbandonment?: true;
  useLegacyDirective?: true;
};

/**
 * Exactly the arguments an engine entry point received, and nothing derived
 * from them. Replaying a run means folding these from a fresh `createGame`.
 *
 * The journal records inputs rather than `decisionHistory` because that history
 * is lossy: an ordinary consultation writes no `DecisionRecord` yet still
 * advances `rngState`, and `confirmCardAbandonment` has no output
 * representation at all. See `tests/game/replay-fold.test.ts`.
 */
export type PlaytestActionStep =
  | { kind: "consult"; advisorId: AdvisorId; useArchetypeAbility: boolean }
  | { kind: "commit"; action: MajorAction; options: PlaytestCommitOptions };

/** Engine state after a step. The replayer asserts each of these. */
export type PlaytestStepCheckpoint = {
  turn: number;
  rngState: number;
  phase: PlaytestGamePhase;
  decisionCount: number;
  latestDecisionId: string | null;
  endingId: EndingId | null;
};

export type PlaytestStepRecord = {
  /** 1-based position in the accepted-input sequence. */
  index: number;
  step: PlaytestActionStep;
  after: PlaytestStepCheckpoint;
  recordedAt: string;
};

/**
 * A full board capture, attached to a marker so a note can be read back against
 * the state that produced it.
 */
export type PlaytestMomentSnapshot = {
  turn: number;
  activeCardId: string | null;
  resources: ResourcePool;
  tracks: TrackPool;
  pressures: PressurePool;
  institutions: number;
  corporation: {
    strategy: CorporationStrategy;
    progress: number;
    threat: number;
  };
  advisorLeverage: Record<AdvisorId, number>;
  endingId: EndingId | null;
  capturedAt: string;
  decisionId: string | null;
  category: ActionCategory | null;
  summary: string | null;
  cardId: string | null;
  choiceId: string | null;
};

export type PlaytestRunEntry = {
  runId: string;
  kind: PlaytestRunKind;
  seed: number;
  archetypeId: ArchetypeId;
  legacyDirectiveId: LegacyDirectiveId | null;
  experiment: string | null;
  startedAt: string;
  completedAt: string | null;
  status: PlaytestRunStatus;
  endingId: EndingId | null;
  months: number | null;
  steps: PlaytestStepRecord[];
  /**
   * Every card the run drew, taken from `state.deck.drawCounts`. Sourced from
   * the deck rather than the step log so that ignored and expired cards — which
   * produce no commitment — still count toward coverage.
   */
  cardsSeen: string[];
  finalSnapshot: PlaytestMomentSnapshot | null;
  /**
   * False when the step log cannot reproduce the run: the journal was reset or
   * replaced mid-campaign, or a write failed. The replayer refuses these rather
   * than reporting a divergence that says nothing about the engine.
   */
  replayComplete: boolean;
};

export type PlaytestMarker = {
  id: string;
  runId: string;
  location: PlaytestMarkerLocation;
  /** One line, trimmed and non-empty. Triage assigns category and severity. */
  note: string;
  createdAt: string;
  snapshot: PlaytestMomentSnapshot | null;
};

export type PlaytestJournalV2 = {
  version: 2;
  buildId: "free-play-v2";
  createdAt: string;
  updatedAt: string;
  runs: PlaytestRunEntry[];
  markers: PlaytestMarker[];
};

/** The exported envelope, which is also the input format of `npm run replay`. */
export type PlaytestJournalExport = {
  exportedAt: string;
  version: 2;
  journal: PlaytestJournalV2;
};
