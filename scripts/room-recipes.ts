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

/**
 * A far-edge wall run painted with the complete crown+face+baseboard segment.
 * Always two tiles tall (see `WALL_BAND_TILES`); only the run length varies.
 */
export type WallBand = {
  readonly x: number;
  readonly y: number;
  readonly widthTiles: number;
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
  /** Tileable 16×16 floor. Chosen per room so nine fixed cameras stay distinct. */
  readonly floorArtKey: ArtKey;
  /** Flat 16×16 wall face for side/near edges and interior partitions. */
  readonly wallFaceArtKey: ArtKey;
  /** Complete 16×32 wall segment for far edges. */
  readonly wallCrownArtKey: ArtKey;
  readonly walls: readonly TileRect[];
  readonly wallBands: readonly WallBand[];
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
const studio =
  "1_Interiors/16x16/Theme_Sorter_Black_Shadow_Singles/23_Television_and_Film_Studio_Black_Shadow_Singles_16x16";
// Modern EXTERIORS. The interiors pack has no utility/plant theme — its
// "Basement" sorter is a rec room (pool tables, cushions, dart boards), which is
// what the worksite and the civic perimeter used to be furnished from.
const worksite =
  "modernexteriors-win/Modern_Exteriors_16x16/ME_Theme_Sorter_16x16/8_Worksite_Singles_16x16";

const conferenceSingle = (number: number) =>
  `${conference}/Conference_Hall_Shadow_Singles_${number}.png`;
const librarySingle = (number: number) =>
  `${library}/Classroom_and_Library_Singles_${number}.png`;
const studioSingle = (number: number) =>
  `${studio}/Television_and_Film_Studio_Black_Shadow_Singles_${number}.png`;
const worksiteSingle = (name: string) =>
  `${worksite}/ME_Singles_Worksite_16x16_${name}.png`;

/**
 * Committed source dimensions, so a recipe can be validated without the pack.
 *
 * Read the shape of a single before using it. Several conference-hall entries
 * are fragments of a larger assembly, not free-standing props:
 *   - 1 and 6 are the LEFT and RIGHT end caps of a horizontal table run. Butted
 *     straight together they produce a lumpy blob with a stray seat notch; a
 *     table needs cap + middles + cap (see CONFERENCE_TABLE below).
 *   - 14..17 are angled table corner leaves. Placed on open floor they read as
 *     floating slivers of wood.
 *   - 25/27/28 are catering counters (27 carries a plate of food) — they are not
 *     workstations. The monitor consoles are 29..32.
 */
const FURNITURE_TILE_SIZE: Readonly<
  Record<string, { readonly widthTiles: number; readonly heightTiles: number }>
> = {
  // Conference hall.
  [conferenceSingle(1)]: { widthTiles: 2, heightTiles: 3 }, // table left cap
  [conferenceSingle(2)]: { widthTiles: 1, heightTiles: 3 }, // table middle
  [conferenceSingle(3)]: { widthTiles: 1, heightTiles: 3 }, // table middle
  [conferenceSingle(4)]: { widthTiles: 1, heightTiles: 3 }, // table middle (seat)
  [conferenceSingle(6)]: { widthTiles: 2, heightTiles: 3 }, // table right cap
  [conferenceSingle(25)]: { widthTiles: 2, heightTiles: 2 },
  [conferenceSingle(29)]: { widthTiles: 1, heightTiles: 2 }, // lit console
  [conferenceSingle(30)]: { widthTiles: 1, heightTiles: 2 }, // lit console
  [conferenceSingle(31)]: { widthTiles: 1, heightTiles: 2 }, // dark console
  [conferenceSingle(32)]: { widthTiles: 1, heightTiles: 2 }, // dark console
  [conferenceSingle(37)]: { widthTiles: 1, heightTiles: 2 }, // grey chair
  [conferenceSingle(38)]: { widthTiles: 1, heightTiles: 2 }, // grey chair
  [conferenceSingle(40)]: { widthTiles: 1, heightTiles: 2 }, // wooden chair
  [conferenceSingle(41)]: { widthTiles: 1, heightTiles: 2 }, // wall terminal
  [conferenceSingle(43)]: { widthTiles: 1, heightTiles: 2 }, // notice cabinet
  [conferenceSingle(50)]: { widthTiles: 1, heightTiles: 3 }, // flipchart
  [conferenceSingle(51)]: { widthTiles: 1, heightTiles: 3 }, // flipchart
  [conferenceSingle(59)]: { widthTiles: 1, heightTiles: 2 }, // fire extinguisher
  [conferenceSingle(67)]: { widthTiles: 2, heightTiles: 3 }, // projection screen
  // Classroom and library.
  [librarySingle(25)]: { widthTiles: 2, heightTiles: 2 },
  [librarySingle(26)]: { widthTiles: 2, heightTiles: 3 },
  [librarySingle(31)]: { widthTiles: 2, heightTiles: 2 }, // wall map
  [librarySingle(36)]: { widthTiles: 2, heightTiles: 2 }, // wall board
  [librarySingle(39)]: { widthTiles: 2, heightTiles: 2 }, // standing board
  [librarySingle(40)]: { widthTiles: 1, heightTiles: 2 }, // grey cabinet
  [librarySingle(54)]: { widthTiles: 2, heightTiles: 3 }, // copier
  [librarySingle(56)]: { widthTiles: 2, heightTiles: 3 },
  [librarySingle(57)]: { widthTiles: 2, heightTiles: 3 },
  [librarySingle(60)]: { widthTiles: 2, heightTiles: 3 },
  [librarySingle(67)]: { widthTiles: 2, heightTiles: 3 },
  [librarySingle(74)]: { widthTiles: 2, heightTiles: 3 },
  // Television and film studio.
  [studioSingle(1)]: { widthTiles: 2, heightTiles: 2 },
  // Worksite (Modern Exteriors).
  [worksiteSingle("Stacked_Material_1")]: { widthTiles: 2, heightTiles: 3 },
  [worksiteSingle("Stacked_Material_3")]: { widthTiles: 2, heightTiles: 3 },
  [worksiteSingle("Stacked_Material_5")]: { widthTiles: 2, heightTiles: 3 },
  [worksiteSingle("Stacked_Material_6")]: { widthTiles: 1, heightTiles: 3 },
  [worksiteSingle("Tool_Box_1")]: { widthTiles: 2, heightTiles: 2 },
  [worksiteSingle("Tool_Box_2")]: { widthTiles: 2, heightTiles: 3 },
  [worksiteSingle("Cone_2")]: { widthTiles: 1, heightTiles: 2 },
  [worksiteSingle("Sign_2")]: { widthTiles: 1, heightTiles: 3 },
  [worksiteSingle("Fence_1_2")]: { widthTiles: 1, heightTiles: 2 },
  [worksiteSingle("Fence_1_5")]: { widthTiles: 1, heightTiles: 2 },
  [worksiteSingle("Fence_1_7")]: { widthTiles: 1, heightTiles: 2 },
  [worksiteSingle("Door_1_1")]: { widthTiles: 3, heightTiles: 2 },
  [worksiteSingle("Scissor_Lifter_1")]: { widthTiles: 3, heightTiles: 4 },
};

/** A run of interlocking site fence panels, capped with hazard-striped sections. */
function fenceRun(x: number, y: number, count: number): FurniturePlacement[] {
  return Array.from({ length: count }, (_, index) => {
    const panel = index === 0 || index === count - 1 ? "Fence_1_7" : "Fence_1_5";
    return place(worksiteSingle(panel), x + index, y);
  });
}

function place(source: string, x: number, y: number): FurniturePlacement {
  const size = FURNITURE_TILE_SIZE[source];
  if (!size) {
    throw new Error(`Missing committed tile dimensions for '${source}'.`);
  }
  return { source, x, y, ...size };
}

/**
 * A complete six-tile conference table anchored at its top-left tile.
 * Left cap, two middles, right cap — the assembly the source art was cut for.
 */
function conferenceTable(x: number, y: number): FurniturePlacement[] {
  return [
    place(conferenceSingle(1), x, y),
    place(conferenceSingle(2), x + 2, y),
    place(conferenceSingle(4), x + 3, y),
    place(conferenceSingle(6), x + 4, y),
  ];
}

/** A run of monitor consoles along a wall band, alternating lit and dark screens. */
function consoleBank(x: number, y: number, count: number): FurniturePlacement[] {
  const faces = [29, 31, 30, 32];
  return Array.from({ length: count }, (_, index) =>
    place(conferenceSingle(faces[index % faces.length]!), x + index, y));
}

/**
 * The standard shell for a 14×10 aftermath/office room: a two-tile far wall
 * across the top, flat wall faces down the sides and across the near edge.
 * Leaves a 12×7 floor from (1,2) to (12,8).
 */
const STANDARD_WALL_BANDS: readonly WallBand[] = [{ x: 0, y: 0, widthTiles: 14 }];
const STANDARD_WALLS: readonly TileRect[] = [
  { x: 0, y: 2, width: 1, height: 8 },
  { x: 13, y: 2, width: 1, height: 8 },
  { x: 1, y: 9, width: 12, height: 1 },
];

function roomLightingZones(
  roomId: keyof typeof ROOM_DEFINITIONS,
): readonly TileRect[] {
  return ROOM_DEFINITIONS[roomId].lightingZones.map((zone) => ({
    x: zone.position.x,
    y: zone.position.y,
    width: zone.widthTiles,
    height: zone.heightTiles,
  }));
}

/**
 * Committed source-pixel room recipes. Every coordinate is an integer tile;
 * scripts/curate-art.ts multiplies it by 16 exactly once while composing.
 *
 * Two placement rules keep these readable:
 *   - Anything that hangs on a wall (maps, boards, screens, consoles, notice
 *     cabinets, extinguishers) is anchored at y=0 or y=1 so it sits IN the far
 *     wall band. Free-standing furniture starts at y=2 or below.
 *   - Tiles that a runtime layer or actor already owns are left empty. The
 *     anchors in roomDefinitions.ts are the reservation list.
 */
export const ROOM_RECIPES: Record<RoomCompositeKey, RoomCompositeRecipe> = {
  roomFacility: {
    key: "roomFacility",
    widthTiles: 22,
    heightTiles: 14,
    floorArtKey: "envFloor",
    wallFaceArtKey: "envWall",
    wallCrownArtKey: "envWallCrown",
    wallBands: [
      // Far wall across the whole facility, plus the head of the service corridor.
      { x: 0, y: 0, widthTiles: 22 },
      { x: 1, y: 9, widthTiles: 5 },
      { x: 8, y: 9, widthTiles: 4 },
    ],
    walls: [
      { x: 0, y: 2, width: 1, height: 12 },
      { x: 21, y: 2, width: 1, height: 12 },
      { x: 0, y: 13, width: 22, height: 1 },
      // Divider between the command floor and the secured wing. It stops above
      // row 11 so the service corridor stays walkable end to end — the courier
      // crosses 17 tiles along row 11 and must not be cut in half by a wall.
      { x: 12, y: 2, width: 1, height: 3 },
      { x: 12, y: 7, width: 1, height: 4 },
    ],
    furniture: [
      // Far wall, command side. Columns 4..7 are left clear for the animated
      // monitor wall and column 11 for the security camera.
      place(conferenceSingle(59), 1, 1),
      place(conferenceSingle(43), 2, 1),
      ...consoleBank(8, 1, 3),
      // Central command floor.
      ...conferenceTable(3, 3),
      place(conferenceSingle(37), 5, 6),
      place(conferenceSingle(40), 7, 6),
      place(librarySingle(39), 1, 3),
      // Secured BRB chamber. Deliberately under-furnished: runtime layers build
      // the machinery over the campaign, so the chamber has to read as an empty
      // sealed project rather than a finished room.
      // Only column 18 is free on the chamber wall: the activation-ready state
      // paints an animated monitor bank across 14..17 and the servers sit at
      // 19..20, so a 2-tile board here would be overpainted at exactly the
      // moment the chamber matters most.
      place(conferenceSingle(43), 18, 1),
      place(worksiteSingle("Stacked_Material_5"), 13, 4),
      place(worksiteSingle("Tool_Box_2"), 19, 4),
      // Records and analysis annex.
      place(librarySingle(40), 13, 7),
      place(librarySingle(57), 14, 7),
      place(librarySingle(60), 16, 7),
      place(librarySingle(54), 19, 7),
    ],
    spriteAnchors: ROOM_DEFINITIONS.facility.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.facility.anchors,
    lightingZones: roomLightingZones("facility"),
    note:
      "22×14 continuity facility: walled command floor with a console far wall, an empty state-built machinery chamber, a records annex, and a two-tile service corridor.",
  },
  roomIntake: {
    key: "roomIntake",
    widthTiles: 14,
    heightTiles: 10,
    floorArtKey: "envFloorAdmin",
    wallFaceArtKey: "envWallPale",
    wallCrownArtKey: "envWallPaleCrown",
    wallBands: STANDARD_WALL_BANDS,
    walls: STANDARD_WALLS,
    furniture: [
      // Hung on the far wall, not stranded in the middle of the floor.
      place(librarySingle(31), 9, 0),
      place(conferenceSingle(43), 2, 1),
      place(librarySingle(54), 11, 1),
      // Floor: one intake desk with a chair either side of it.
      place(librarySingle(26), 6, 3),
      place(conferenceSingle(37), 4, 6),
      place(conferenceSingle(40), 8, 6),
      place(librarySingle(40), 1, 3),
    ],
    spriteAnchors: ROOM_DEFINITIONS.intake.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.intake.anchors,
    lightingZones: roomLightingZones("intake"),
    note: "Compact federal intake office for the operational brief.",
  },
  roomRecords: {
    key: "roomRecords",
    widthTiles: 14,
    heightTiles: 10,
    floorArtKey: "envFloorAdmin",
    wallFaceArtKey: "envWallPale",
    wallCrownArtKey: "envWallPaleCrown",
    wallBands: STANDARD_WALL_BANDS,
    walls: STANDARD_WALLS,
    furniture: [
      // Rows 2..4 stay clear: the Archive's shelves are runtime layers anchored
      // at shelfA/B/C so accumulated knowledge physically fills this office.
      place(librarySingle(54), 1, 1),
      place(conferenceSingle(43), 12, 1),
      place(librarySingle(25), 4, 6),
      place(librarySingle(26), 10, 5),
      place(conferenceSingle(37), 6, 6),
    ],
    spriteAnchors: ROOM_DEFINITIONS.records.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.records.anchors,
    lightingZones: roomLightingZones("records"),
    note: "Evidence records office shared by Report and Archive.",
  },
  roomContinuity: {
    key: "roomContinuity",
    widthTiles: 14,
    heightTiles: 10,
    floorArtKey: "envFloor",
    wallFaceArtKey: "envWall",
    wallCrownArtKey: "envWallCrown",
    wallBands: STANDARD_WALL_BANDS,
    walls: STANDARD_WALLS,
    furniture: [
      ...consoleBank(4, 1, 6),
      place(conferenceSingle(59), 1, 1),
      ...conferenceTable(4, 4),
      place(conferenceSingle(37), 3, 7),
      place(conferenceSingle(38), 6, 7),
      place(conferenceSingle(37), 9, 7),
      place(librarySingle(40), 12, 3),
    ],
    spriteAnchors: ROOM_DEFINITIONS.continuity.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.continuity.anchors,
    lightingZones: roomLightingZones("continuity"),
    note: "Continuity floor: a console far wall over the standing command table.",
  },
  roomOversight: {
    key: "roomOversight",
    widthTiles: 14,
    heightTiles: 10,
    floorArtKey: "envFloorAdmin",
    wallFaceArtKey: "envWallPale",
    wallCrownArtKey: "envWallPaleCrown",
    wallBands: STANDARD_WALL_BANDS,
    walls: STANDARD_WALLS,
    furniture: [
      // Hearing room: the bench faces the chamber, cameras and seal behind it.
      place(librarySingle(36), 6, 0),
      place(conferenceSingle(41), 2, 1),
      place(conferenceSingle(41), 11, 1),
      ...conferenceTable(4, 2),
      place(studioSingle(1), 1, 5),
      place(conferenceSingle(50), 12, 5),
      place(conferenceSingle(37), 4, 7),
      place(conferenceSingle(38), 6, 7),
      place(conferenceSingle(37), 8, 7),
    ],
    spriteAnchors: ROOM_DEFINITIONS.oversight.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.oversight.anchors,
    lightingZones: roomLightingZones("oversight"),
    note: "Federal oversight hearing room: raised bench, broadcast rig, public floor.",
  },
  roomSecureBriefing: {
    key: "roomSecureBriefing",
    widthTiles: 14,
    heightTiles: 10,
    floorArtKey: "envFloor",
    wallFaceArtKey: "envWall",
    wallCrownArtKey: "envWallCrown",
    wallBands: STANDARD_WALL_BANDS,
    walls: STANDARD_WALLS,
    furniture: [
      // Compartmented: a screen and nothing else on the wall, no windows, and
      // storage rather than displays down the sides.
      place(conferenceSingle(67), 6, 0),
      place(conferenceSingle(59), 1, 1),
      ...conferenceTable(4, 4),
      place(librarySingle(40), 11, 3),
      place(librarySingle(40), 12, 3),
      place(librarySingle(40), 1, 3),
      place(conferenceSingle(37), 5, 7),
      place(conferenceSingle(38), 8, 7),
    ],
    spriteAnchors: ROOM_DEFINITIONS.secureBriefing.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.secureBriefing.anchors,
    lightingZones: roomLightingZones("secureBriefing"),
    note: "Compartmented briefing room: one screen, sealed storage, no public seating.",
  },
  roomInfrastructure: {
    key: "roomInfrastructure",
    widthTiles: 14,
    heightTiles: 10,
    floorArtKey: "envFloorWorks",
    wallFaceArtKey: "envWall",
    wallCrownArtKey: "envWallCrown",
    wallBands: STANDARD_WALL_BANDS,
    walls: STANDARD_WALLS,
    furniture: [
      place(worksiteSingle("Sign_2"), 2, 1),
      place(conferenceSingle(59), 12, 1),
      place(worksiteSingle("Stacked_Material_1"), 1, 3),
      place(worksiteSingle("Stacked_Material_3"), 4, 2),
      place(worksiteSingle("Stacked_Material_5"), 10, 2),
      place(worksiteSingle("Tool_Box_2"), 7, 6),
      place(worksiteSingle("Tool_Box_1"), 11, 6),
      place(worksiteSingle("Cone_2"), 4, 7),
      place(worksiteSingle("Cone_2"), 6, 5),
      place(worksiteSingle("Stacked_Material_6"), 1, 6),
    ],
    spriteAnchors: ROOM_DEFINITIONS.infrastructure.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.infrastructure.anchors,
    lightingZones: roomLightingZones("infrastructure"),
    note: "BRB infrastructure workroom: bare concrete, plant, crates, no seating.",
  },
  roomCorporate: {
    key: "roomCorporate",
    widthTiles: 14,
    heightTiles: 10,
    floorArtKey: "envFloorWood",
    wallFaceArtKey: "envWallWarm",
    wallCrownArtKey: "envWallWarmCrown",
    wallBands: STANDARD_WALL_BANDS,
    walls: STANDARD_WALLS,
    furniture: [
      // Executive suite: wood floor, warm walls, one long table and no consoles.
      place(librarySingle(31), 6, 0),
      place(conferenceSingle(43), 11, 1),
      ...conferenceTable(4, 3),
      place(librarySingle(25), 1, 2),
      place(conferenceSingle(25), 11, 5),
      place(conferenceSingle(40), 5, 6),
      place(conferenceSingle(40), 8, 6),
    ],
    spriteAnchors: ROOM_DEFINITIONS.corporate.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.corporate.anchors,
    lightingZones: roomLightingZones("corporate"),
    note: "Corporation executive suite: wood floor, warm panelling, no public kit.",
  },
  roomCivicGate: {
    key: "roomCivicGate",
    widthTiles: 14,
    heightTiles: 10,
    floorArtKey: "envFloorWorks",
    wallFaceArtKey: "envWall",
    wallCrownArtKey: "envWallCrown",
    // A perimeter, not a room: the far wall runs the full width but the near
    // edge is left open in the middle so the gate reads as a way through.
    wallBands: [{ x: 0, y: 0, widthTiles: 14 }],
    walls: [
      { x: 0, y: 2, width: 1, height: 8 },
      { x: 13, y: 2, width: 1, height: 8 },
      { x: 1, y: 9, width: 4, height: 1 },
      { x: 9, y: 9, width: 4, height: 1 },
    ],
    furniture: [
      // A checkpoint reads as a LINE you are stopped at, so the barrier runs
      // across the room rather than being scattered as loose props.
      place(worksiteSingle("Door_1_1"), 1, 1),
      place(worksiteSingle("Sign_2"), 11, 1),
      ...fenceRun(1, 4, 5),
      ...fenceRun(9, 4, 4),
      place(worksiteSingle("Cone_2"), 6, 6),
      place(worksiteSingle("Cone_2"), 8, 7),
      place(worksiteSingle("Stacked_Material_6"), 2, 6),
    ],
    spriteAnchors: ROOM_DEFINITIONS.civicGate.anchors,
    dynamicOverlayAnchors: ROOM_DEFINITIONS.civicGate.anchors,
    lightingZones: roomLightingZones("civicGate"),
    note: "Civic perimeter gate: concrete, barriers, and an open near edge.",
  },
};
