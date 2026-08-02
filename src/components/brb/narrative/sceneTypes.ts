import type { GameState } from "@/game/types";
import type { GridPoint } from "@/components/brb/pixel-room/roomTypes";

export const NARRATIVE_SCENE_IDS = [
  "continuity-floor",
  "oversight-chamber",
  "secure-briefing",
  "infrastructure-site",
  "corporate-suite",
  "civic-gate",
] as const;

export type NarrativeSceneId = (typeof NARRATIVE_SCENE_IDS)[number];
export type SceneBeatId = "setup" | "action" | "consequence";
export type SceneTone =
  | "institutional"
  | "public"
  | "covert"
  | "corporate"
  | "crisis"
  | "constructive";
export type SceneFacing = "left" | "right" | "up" | "down";
export type SceneMotion =
  | "idle"
  | "enter"
  | "exit"
  | "cross"
  | "confront"
  | "address"
  | "work"
  | "observe"
  | "withdraw";
export type SceneActorRole =
  | "director"
  | "analyst"
  | "fixer"
  | "steward"
  | "staff"
  | "public"
  | "worker"
  | "security"
  | "corporate"
  | "official";
export type ScenePropKind =
  | "briefing-table"
  | "dossier"
  | "monitor-bank"
  | "hearing-desk"
  | "barrier"
  | "server"
  | "generator"
  | "work-lights"
  | "corporate-seal"
  | "podium"
  | "crowd-line"
  | "document-box"
  | "brb-chamber"
  | "warning-beacon";

/**
 * Integer tile coordinate on BRB's shared 16px orthographic grid.
 * Aftermath rooms are 14×10; values are not CSS percentages.
 */
export type ScenePosition = GridPoint;

export type SceneActor = {
  readonly id: string;
  readonly role: SceneActorRole;
  readonly label: string;
  readonly position: ScenePosition;
  readonly facing: SceneFacing;
  readonly motion: SceneMotion;
};

export type SceneProp = {
  readonly id: string;
  readonly kind: ScenePropKind;
  readonly position: ScenePosition;
  readonly state?: "normal" | "active" | "damaged" | "secured" | "abandoned";
};

export type NarrativeSceneBeat = {
  readonly id: SceneBeatId;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly tone: SceneTone;
  readonly focus: ScenePosition;
  readonly actors: readonly SceneActor[];
  readonly props: readonly SceneProp[];
};

export type NarrativeSceneScript = {
  readonly id: string;
  readonly sourceKey: string;
  readonly sceneId: NarrativeSceneId;
  readonly title: string;
  readonly beats: readonly [
    NarrativeSceneBeat,
    NarrativeSceneBeat,
    NarrativeSceneBeat,
  ];
};

export type PersistentRoomMarks = {
  readonly emergencyLevel: "routine" | "strained" | "critical";
  readonly institutionalCondition: "secure" | "worn" | "breached";
  readonly corporationPresence: "distant" | "visible" | "embedded";
  readonly brbConstruction: "sealed" | "framed" | "active" | "unstable" | "ready";
  readonly departedAdvisors: readonly ("analyst" | "fixer" | "steward")[];
  readonly completedRouteCount: number;
};

export type NarrativeSceneCue = {
  readonly decisionId: string;
  readonly decisionSummary: string;
  readonly script: NarrativeSceneScript;
  readonly persistentMarks: PersistentRoomMarks;
};

export type NarrativeSceneRendererProps = {
  readonly beat: NarrativeSceneBeat;
  readonly location: NarrativeSceneId;
  readonly persistentMarks: PersistentRoomMarks;
  readonly reducedMotion?: boolean;
};

export type SceneStateSource = Pick<
  GameState,
  | "advisors"
  | "corporation"
  | "institutions"
  | "pressures"
  | "routes"
  | "tracks"
>;
