import type { ArtKey } from "../src/game-art/manifest.js";
import { ROOM_DEFINITIONS } from "../src/components/brb/pixel-room/roomDefinitions.js";
import type { GridPoint } from "../src/components/brb/pixel-room/roomTypes.js";

export const ROOM_COMPOSITE_KEYS = [
  "roomFacility",
  "roomIntake",
  "roomRecords",
  "roomContinuity",
  "roomOversight",
  "roomSecureBriefing",
  "roomInfrastructure",
  "roomCorporate",
  "roomCivicGate",
] as const satisfies readonly ArtKey[];

export type RoomCompositeKey = (typeof ROOM_COMPOSITE_KEYS)[number];

export type TileRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};
export type FurniturePlacement = {
  /** LimeZu source file relative to the Modern Interiors pack. */
  readonly source: string;
  /** Integer 16px tile coordinate. */
  readonly x: number;
  /** Integer 16px tile coordinate. */
  readonly y: number;
  /** Complete source width in 16px tiles. */
  readonly widthTiles: number;
  /** Complete source height in 16px tiles. */
  readonly heightTiles: number;
};

export type RoomCompositeRecipe = {
  readonly key: RoomCompositeKey;
  readonly widthTiles: number;
  readonly heightTiles: number;
  readonly walls: readonly TileRect[];
  readonly furniture: readonly FurniturePlacement[];
  /** Runtime sprite and actor attachment points for the same fixed camera. */
  readonly spriteAnchors: Readonly<Record<string, GridPoint>>;
  /** State-driven prop attachment points; aliases the canonical room anchors. */
  readonly dynamicOverlayAnchors: Readonly<Record<string, GridPoint>>;
  readonly lightingZones: readonly TileRect[];
  readonly note: string;
};

const conference =
  "1_Interiors/16x16/Theme_Sorter_Black_Shadow_Singles/13_Conference_Hall_Black_Shadow_Singles_16x16";
const library =
  "1_Interiors/16x16/Theme_Sorter_Black_Shadow_Singles/5_Classroom_and_Library_Black_Shadow_Singles_16x16";
const basement =
  "1_Interiors/16x16/Theme_Sorter_Black_Shadow_Singles/14_Basement_Black_Shadow_Singles_16x16";
const studio =
  "1_Interiors/16x16/Theme_Sorter_Black_Shadow_Singles/23_Television_and_Film_Studio_Black_Shadow_Singles_16x16";

const conferenceSingle = (number: number) =>
  `${conference}/Conference_Hall_Shadow_Singles_${number}.png`;
const librarySingle = (number: number) =>
  `${library}/Classroom_and_Library_Singles_${number}.png`;
const basementSingle = (number: number) =>
  `${basement}/Basement_Shadow_Singles_${number}.png`;
const studioSingle = (number: number) =>
  `${studio}/Television_and_Film_Studio_Black_Shadow_Singles_${number}.png`;

const FURNITURE_TILE_SIZE: Readonly<
  Record<string, { readonly widthTiles: number; readonly heightTiles: number }>
> = {
  [conferenceSingle(1)]: { widthTiles: 2, heightTiles: 3 },
  [conferenceSingle(6)]: { widthTiles: 2, heightTiles: 3 },
  [conferenceSingle(14)]: { widthTiles: 1, heightTiles: 2 },
  [conferenceSingle(16)]: { widthTiles: 1, heightTiles: 2 },
  [conferenceSingle(25)]: { widthTiles: 2, heightTiles: 2 },
  [conferenceSingle(27)]: { widthTiles: 2, heightTiles: 2 },
  [conferenceSingle(28)]: { widthTiles: 1, heightTiles: 2 },
  [conferenceSingle(30)]: { widthTiles: 1, heightTiles: 2 },
  [conferenceSingle(37)]: { widthTiles: 1, heightTiles: 2 },
  [conferenceSingle(40)]: { widthTiles: 1, heightTiles: 2 },
  [librarySingle(25)]: { widthTiles: 2, heightTiles: 2 },
  [librarySingle(26)]: { widthTiles: 2, heightTiles: 3 },
  [librarySingle(31)]: { widthTiles: 2, heightTiles: 2 },
  [librarySingle(54)]: { widthTiles: 2, heightTiles: 3 },
  [librarySingle(60)]: { widthTiles: 2, heightTiles: 3 },
  [librarySingle(67)]: { widthTiles: 2, heightTiles: 3 },
  [basementSingle(26)]: { widthTiles: 2, heightTiles: 2 },
  [basementSingle(30)]: { widthTiles: 2, heightTiles: 2 },
  [basementSingle(72)]: { widthTiles: 1, heightTiles: 3 },
  [basementSingle(79)]: { widthTiles: 2, heightTiles: 3 },
  [basementSingle(85)]: { widthTiles: 2, heightTiles: 3 },
  [basementSingle(88)]: { widthTiles: 2, heightTiles: 3 },
  [basementSingle(91)]: { widthTiles: 2, heightTiles: 3 },
  [studioSingle(1)]: { widthTiles: 2, heightTiles: 2 },
  [studioSingle(24)]: { widthTiles: 2, heightTiles: 2 },
};

function place(source: string, x: number, y: number): FurniturePlacement {
  const size = FURNITURE_TILE_SIZE[source];
  if (!size) {
    throw new Error(`Missing committed tile dimensions for '${source}'.`);
  }
  return { source, x, y, ...size };
}

function border(width: number, height: number): TileRect[] {
  return [
    { x: 0, y: 0, width, height: 1 },
    { x: 0, y: height - 1, width, height: 1 },
    { x: 0, y: 1, width: 1, height: height - 2 },
    { x: width - 1, y: 1, width: 1, height: height - 2 },
  ];
}

const standardWalls = border(14, 10);

/**
 * Committed source-pixel room recipes. Every coordinate is an integer tile;
 * scripts/curate-art.ts multiplies it by 16 exactly once while composing.
 */
export const ROOM_RECIPES: Record<RoomCompositeKey, RoomCompositeRecipe> = {
  roomFacility: {
    key: "roomFacility",
    widthTiles: 22,
    heightTiles: 14,
    walls: [
      ...border(22, 14),
      { x: 12, y: 1, width: 1, height: 4 },
      { x: 12, y: 6, width: 1, height: 4 },
      { x: 13, y: 6, width: 8, height: 1 },
      { x: 1, y: 10, width: 6, height: 1 },
      { x: 8, y: 10, width: 7, height: 1 },
      { x: 16, y: 10, width: 5, height: 1 },
    ],
    furniture: [
      // Central command floor: one conference table and three matched stations.
      place(conferenceSingle(1), 4, 4),
      place(conferenceSingle(6), 6, 4),
      place(conferenceSingle(14), 4, 7),
      place(conferenceSingle(16), 6, 7),
      place(conferenceSingle(25), 2, 6),
      place(conferenceSingle(27), 8, 6),
      place(conferenceSingle(28), 10, 6),
      // Secured BRB chamber.
      place(basementSingle(85), 14, 2),
      place(basementSingle(88), 17, 3),
      place(basementSingle(91), 19, 3),
      // Records and analysis annex.
      place(librarySingle(54), 14, 7),
      place(librarySingle(60), 16, 7),
      place(librarySingle(67), 18, 7),
      place(librarySingle(25), 15, 8),
    ],
    spriteAnchors: ROOM_DEFINITIONS.facility.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.facility.anchors,
    lightingZones: [{ x: 0, y: 0, width: 22, height: 14 }],
    note:
      "22×14 continuity facility: command floor, secured machinery chamber, records annex, and two-tile service corridor.",
  },
  roomIntake: {
    key: "roomIntake",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      place(conferenceSingle(25), 5, 4),
      place(conferenceSingle(37), 4, 6),
      place(conferenceSingle(40), 8, 6),
      place(librarySingle(54), 1, 2),
      place(librarySingle(31), 10, 2),
    ],
    spriteAnchors: ROOM_DEFINITIONS.intake.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.intake.anchors,
    lightingZones: [{ x: 0, y: 0, width: 14, height: 10 }],
    note: "Compact federal intake office for the operational brief.",
  },
  roomRecords: {
    key: "roomRecords",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      // Shelves are dynamic runtime layers so Archive knowledge is visible.
      place(librarySingle(54), 1, 2),
      place(librarySingle(25), 5, 6),
      place(librarySingle(26), 8, 5),
    ],
    spriteAnchors: ROOM_DEFINITIONS.records.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.records.anchors,
    lightingZones: [{ x: 0, y: 0, width: 14, height: 10 }],
    note: "Evidence records office shared by Report and Archive.",
  },
  roomContinuity: {
    key: "roomContinuity",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      place(conferenceSingle(1), 5, 4),
      place(conferenceSingle(25), 2, 5),
      place(conferenceSingle(27), 10, 5),
      place(conferenceSingle(28), 6, 2),
    ],
    spriteAnchors: ROOM_DEFINITIONS.continuity.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.continuity.anchors,
    lightingZones: [{ x: 0, y: 0, width: 14, height: 10 }],
    note: "Fixed continuity-floor aftermath room.",
  },
  roomOversight: {
    key: "roomOversight",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      place(conferenceSingle(25), 5, 2),
      place(conferenceSingle(1), 5, 5),
      place(conferenceSingle(37), 3, 7),
      place(conferenceSingle(40), 9, 7),
      place(studioSingle(1), 1, 3),
    ],
    spriteAnchors: ROOM_DEFINITIONS.oversight.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.oversight.anchors,
    lightingZones: [{ x: 0, y: 0, width: 14, height: 10 }],
    note: "Fixed federal oversight hearing room.",
  },
  roomSecureBriefing: {
    key: "roomSecureBriefing",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      place(conferenceSingle(1), 5, 4),
      place(conferenceSingle(28), 6, 2),
      place(basementSingle(85), 10, 4),
      place(conferenceSingle(37), 3, 6),
      place(conferenceSingle(40), 9, 6),
    ],
    spriteAnchors: ROOM_DEFINITIONS.secureBriefing.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.secureBriefing.anchors,
    lightingZones: [{ x: 0, y: 0, width: 14, height: 10 }],
    note: "Fixed compartmented briefing room.",
  },
  roomInfrastructure: {
    key: "roomInfrastructure",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      place(basementSingle(85), 5, 3),
      place(basementSingle(88), 2, 5),
      place(basementSingle(91), 9, 5),
      place(basementSingle(79), 6, 7),
      place(basementSingle(72), 11, 2),
    ],
    spriteAnchors: ROOM_DEFINITIONS.infrastructure.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.infrastructure.anchors,
    lightingZones: [{ x: 0, y: 0, width: 14, height: 10 }],
    note: "Fixed BRB infrastructure workroom.",
  },
  roomCorporate: {
    key: "roomCorporate",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      place(conferenceSingle(27), 5, 3),
      place(conferenceSingle(1), 5, 5),
      place(conferenceSingle(28), 2, 3),
      place(conferenceSingle(30), 10, 3),
      place(conferenceSingle(37), 4, 7),
      place(conferenceSingle(40), 8, 7),
    ],
    spriteAnchors: ROOM_DEFINITIONS.corporate.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.corporate.anchors,
    lightingZones: [{ x: 0, y: 0, width: 14, height: 10 }],
    note: "Fixed Corporation executive suite.",
  },
  roomCivicGate: {
    key: "roomCivicGate",
    widthTiles: 14,
    heightTiles: 10,
    walls: [
      { x: 0, y: 0, width: 14, height: 1 },
      { x: 0, y: 9, width: 5, height: 1 },
      { x: 9, y: 9, width: 5, height: 1 },
      { x: 0, y: 1, width: 1, height: 8 },
      { x: 13, y: 1, width: 1, height: 8 },
    ],
    furniture: [
      place(basementSingle(26), 2, 3),
      place(basementSingle(30), 10, 3),
      place(basementSingle(79), 6, 2),
      place(studioSingle(24), 6, 6),
    ],
    spriteAnchors: ROOM_DEFINITIONS.civicGate.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.civicGate.anchors,
    lightingZones: [{ x: 0, y: 0, width: 14, height: 10 }],
    note: "Fixed civic-perimeter gate room.",
  },
};
