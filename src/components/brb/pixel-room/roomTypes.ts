import type { ArtKey } from "@/game-art/manifest";

/** One integer point on BRB's shared 16px source grid. */
export type GridPoint = {
  readonly x: number;
  readonly y: number;
};

/**
 * Room-wide colour grade, applied over finished art rather than baked into it
 * (see BRB_ART_DIRECTION.md §5). Drives `[data-lighting]` in PixelRoom.module.css.
 *
 * `captured` is the advisor-takeover grade: the building is intact and fully
 * staffed, but its own institutional light has narrowed to one or two stations.
 * It is deliberately NOT `failure` — that grade is red-black and drops the light
 * zones to near-zero, which is collapse's language, not a takeover's.
 */
export type RoomLighting =
  | "calm"
  | "strained"
  | "crisis"
  | "failure"
  | "captured";
export type RoomLayer = {
  readonly id: string;
  readonly artKey: ArtKey;
  readonly position: GridPoint;
  readonly frameOffset?: number;
  readonly hidden?: boolean;
  readonly kind?: string;
};

export type RoomActor = {
  readonly id: string;
  readonly artKey: ArtKey;
  readonly position: GridPoint;
  readonly frameOffset?: number;
  readonly hidden?: boolean;
  readonly motion?: string;
};

export type RoomLightingZone = {
  readonly id: string;
  readonly position: GridPoint;
  readonly widthTiles: number;
  readonly heightTiles: number;
};

export type RoomDefinition = {
  readonly id: string;
  readonly widthTiles: number;
  readonly heightTiles: number;
  readonly baseArtKey: ArtKey;
  readonly anchors: Readonly<Record<string, GridPoint>>;
  readonly lightingZones: readonly RoomLightingZone[];
};
