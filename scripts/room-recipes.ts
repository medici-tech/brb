import type { ArtKey } from "../src/game-art/manifest.js";

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
};

export type RoomCompositeRecipe = {
  readonly key: RoomCompositeKey;
  readonly widthTiles: number;
  readonly heightTiles: number;
  readonly walls: readonly TileRect[];
  readonly furniture: readonly FurniturePlacement[];
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
      { source: conferenceSingle(1), x: 4, y: 4 },
      { source: conferenceSingle(6), x: 6, y: 4 },
      { source: conferenceSingle(14), x: 4, y: 7 },
      { source: conferenceSingle(16), x: 6, y: 7 },
      { source: conferenceSingle(25), x: 2, y: 6 },
      { source: conferenceSingle(27), x: 8, y: 6 },
      { source: conferenceSingle(28), x: 10, y: 6 },
      // Secured BRB chamber.
      { source: basementSingle(85), x: 14, y: 2 },
      { source: basementSingle(88), x: 17, y: 3 },
      { source: basementSingle(91), x: 19, y: 3 },
      // Records and analysis annex.
      { source: librarySingle(54), x: 14, y: 7 },
      { source: librarySingle(60), x: 16, y: 7 },
      { source: librarySingle(67), x: 18, y: 7 },
      { source: librarySingle(25), x: 15, y: 8 },
      // Service corridor fixtures.
      { source: studioSingle(12), x: 3, y: 11 },
      { source: studioSingle(13), x: 10, y: 11 },
      { source: studioSingle(14), x: 18, y: 11 },
    ],
    note:
      "22×14 continuity facility: command floor, secured machinery chamber, records annex, and two-tile service corridor.",
  },
  roomIntake: {
    key: "roomIntake",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      { source: conferenceSingle(25), x: 5, y: 4 },
      { source: conferenceSingle(37), x: 4, y: 6 },
      { source: conferenceSingle(40), x: 8, y: 6 },
      { source: librarySingle(54), x: 1, y: 2 },
      { source: librarySingle(31), x: 10, y: 2 },
    ],
    note: "Compact federal intake office for the operational brief.",
  },
  roomRecords: {
    key: "roomRecords",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      { source: librarySingle(54), x: 1, y: 2 },
      { source: librarySingle(60), x: 3, y: 2 },
      { source: librarySingle(67), x: 5, y: 2 },
      { source: librarySingle(70), x: 8, y: 2 },
      { source: librarySingle(74), x: 10, y: 2 },
      { source: librarySingle(25), x: 5, y: 6 },
      { source: librarySingle(26), x: 8, y: 5 },
    ],
    note: "Evidence records office shared by Report and Archive.",
  },
  roomContinuity: {
    key: "roomContinuity",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      { source: conferenceSingle(1), x: 5, y: 4 },
      { source: conferenceSingle(25), x: 2, y: 5 },
      { source: conferenceSingle(27), x: 10, y: 5 },
      { source: conferenceSingle(28), x: 6, y: 2 },
    ],
    note: "Fixed continuity-floor aftermath room.",
  },
  roomOversight: {
    key: "roomOversight",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      { source: conferenceSingle(25), x: 5, y: 2 },
      { source: conferenceSingle(1), x: 5, y: 5 },
      { source: conferenceSingle(37), x: 3, y: 7 },
      { source: conferenceSingle(40), x: 9, y: 7 },
      { source: studioSingle(1), x: 1, y: 3 },
    ],
    note: "Fixed federal oversight hearing room.",
  },
  roomSecureBriefing: {
    key: "roomSecureBriefing",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      { source: conferenceSingle(1), x: 5, y: 4 },
      { source: conferenceSingle(28), x: 6, y: 2 },
      { source: basementSingle(85), x: 10, y: 4 },
      { source: conferenceSingle(37), x: 3, y: 6 },
      { source: conferenceSingle(40), x: 9, y: 6 },
    ],
    note: "Fixed compartmented briefing room.",
  },
  roomInfrastructure: {
    key: "roomInfrastructure",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      { source: basementSingle(85), x: 5, y: 3 },
      { source: basementSingle(88), x: 2, y: 5 },
      { source: basementSingle(91), x: 9, y: 5 },
      { source: basementSingle(79), x: 6, y: 7 },
      { source: basementSingle(72), x: 11, y: 2 },
    ],
    note: "Fixed BRB infrastructure workroom.",
  },
  roomCorporate: {
    key: "roomCorporate",
    widthTiles: 14,
    heightTiles: 10,
    walls: standardWalls,
    furniture: [
      { source: conferenceSingle(27), x: 5, y: 3 },
      { source: conferenceSingle(1), x: 5, y: 5 },
      { source: conferenceSingle(28), x: 2, y: 3 },
      { source: conferenceSingle(30), x: 10, y: 3 },
      { source: conferenceSingle(37), x: 4, y: 7 },
      { source: conferenceSingle(40), x: 8, y: 7 },
    ],
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
      { source: basementSingle(26), x: 2, y: 3 },
      { source: basementSingle(30), x: 10, y: 3 },
      { source: basementSingle(79), x: 6, y: 2 },
      { source: studioSingle(24), x: 6, y: 6 },
    ],
    note: "Fixed civic-perimeter gate room.",
  },
};
