import type {
  ActionCategory,
  AdvisorId,
  ArchetypeId,
  CorporationStrategy,
  EndingId,
  PressurePool,
  ResourcePool,
  TrackPool,
} from "../game/types";

export const PLAYTEST_BOOKMARK_CATEGORIES = [
  "bug",
  "confusion",
  "pacing",
  "balance",
  "consequence_clarity",
  "replay_idea",
  "delight",
] as const;

export const PLAYTEST_SEVERITIES = ["low", "medium", "high"] as const;

export type PlaytestBookmarkCategory = (typeof PLAYTEST_BOOKMARK_CATEGORIES)[number];
export type PlaytestSeverity = (typeof PLAYTEST_SEVERITIES)[number];
export type PlaytestRunKind = "primary" | "replay";
export type PlaytestRunStatus = "active" | "completed" | "checkpoint_reached" | "abandoned";
export type PlaytestMatrixStatus =
  | "pending"
  | "active"
  | "awaiting_recap"
  | "awaiting_replay"
  | "replay_active"
  | "completed";

export type PlaytestMatrixSlot = {
  id: string;
  order: number;
  archetypeId: ArchetypeId;
  label: string;
  strategy: string;
  replayRequired: boolean;
  status: PlaytestMatrixStatus;
  primaryRunId: string | null;
  replayRunId: string | null;
  replayCommitments: number;
};

type PlaytestStateCapture = {
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
};

export type PlaytestMomentSnapshot = PlaytestStateCapture & {
  decisionId: string | null;
  category: ActionCategory | null;
  summary: string | null;
  cardId: string | null;
  choiceId: string | null;
};

export type PlaytestDecisionSnapshot = PlaytestStateCapture & {
  decisionId: string;
  category: ActionCategory;
  summary: string;
  cardId: string | null;
  choiceId: string | null;
};

export type PlaytestRecap = {
  fairness: 1 | 2 | 3 | 4 | 5;
  pacing: "too_short" | "about_right" | "too_long";
  lateGamePressure: "gradual" | "sudden" | "unclear";
  consequenceClarity: 1 | 2 | 3 | 4 | 5;
  strategyViability: 1 | 2 | 3 | 4 | 5;
  replayInterest: 1 | 2 | 3 | 4 | 5;
  nextExperiment: string;
  recordedAt: string;
};

export type PlaytestRunEntry = {
  runId: string;
  slotId: string;
  kind: PlaytestRunKind;
  seed: number;
  archetypeId: ArchetypeId;
  experiment: string | null;
  startedAt: string;
  completedAt: string | null;
  status: PlaytestRunStatus;
  endingId: EndingId | null;
  months: number | null;
  decisions: PlaytestDecisionSnapshot[];
  finalSnapshot: PlaytestDecisionSnapshot | null;
  recap: PlaytestRecap | null;
};

export type PlaytestBookmark = {
  id: string;
  runId: string;
  slotId: string;
  location: "campaign" | "report";
  category: PlaytestBookmarkCategory;
  severity: PlaytestSeverity;
  note: string;
  createdAt: string;
  snapshot: PlaytestMomentSnapshot | null;
};

export type PlaytestJournalV1 = {
  version: 1;
  buildId: "guided-internal-v1";
  createdAt: string;
  updatedAt: string;
  matrix: PlaytestMatrixSlot[];
  runs: PlaytestRunEntry[];
  bookmarks: PlaytestBookmark[];
};

export type PlaytestJournalSummary = {
  completedSlots: number;
  totalSlots: number;
  endings: Partial<Record<EndingId, number>>;
  averageCampaignMonths: number | null;
  bookmarkCategories: Partial<Record<PlaytestBookmarkCategory, number>>;
  recurringHighSeverityCategories: PlaytestBookmarkCategory[];
  replayDivergence: Record<string, number | null>;
};
