import type { RoomDefinition } from "./roomTypes";

export const ROOM_DEFINITIONS = {
  facility: {
    id: "facility",
    widthTiles: 22,
    heightTiles: 14,
    baseArtKey: "roomFacility",
    anchors: {
      monitorBank: { x: 3, y: 1 },
      serverBank: { x: 14, y: 1 },
      analyst: { x: 3, y: 6 },
      operator: { x: 8, y: 6 },
      steward: { x: 10, y: 6 },
      corridorLeft: { x: 2, y: 11 },
      corridorRight: { x: 19, y: 11 },
      corporationDoor: { x: 17, y: 1 },
      securityCamera: { x: 11, y: 1 },
      brbMachine: { x: 15, y: 2 },
      clutterA: { x: 2, y: 8 },
      clutterB: { x: 10, y: 8 },
      damageA: { x: 1, y: 9 },
      damageB: { x: 19, y: 9 },
    },
  },
  intake: {
    id: "intake",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomIntake",
    anchors: {
      visitor: { x: 4, y: 6 },
      director: { x: 8, y: 6 },
      desk: { x: 6, y: 4 },
    },
  },
  records: {
    id: "records",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomRecords",
    anchors: {
      clerk: { x: 6, y: 6 },
      evidenceA: { x: 2, y: 7 },
      evidenceB: { x: 10, y: 7 },
    },
  },
  continuity: {
    id: "continuity",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomContinuity",
    anchors: {},
  },
  oversight: {
    id: "oversight",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomOversight",
    anchors: {},
  },
  secureBriefing: {
    id: "secureBriefing",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomSecureBriefing",
    anchors: {},
  },
  infrastructure: {
    id: "infrastructure",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomInfrastructure",
    anchors: {},
  },
  corporate: {
    id: "corporate",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomCorporate",
    anchors: {},
  },
  civicGate: {
    id: "civicGate",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomCivicGate",
    anchors: {},
  },
} as const satisfies Record<string, RoomDefinition>;

export type RoomDefinitionKey = keyof typeof ROOM_DEFINITIONS;
