import type { ArtKey } from "@/game-art/manifest";

/** One integer point on BRB's shared 16px source grid. */
export type GridPoint = {
  readonly x: number;
  readonly y: number;
};
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
