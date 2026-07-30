import type { RoomDefinition } from "./roomTypes";

const FACILITY_LIGHTING = [
  {
    id: "whole-facility",
    position: { x: 0, y: 0 },
    widthTiles: 22,
    heightTiles: 14,
  },
] as const;

const STANDARD_ROOM_LIGHTING = [
  {
    id: "whole-room",
    position: { x: 0, y: 0 },
    widthTiles: 14,
    heightTiles: 10,
  },
] as const;

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
      corporationTerminal: { x: 19, y: 2 },
      corporationOfficer: { x: 18, y: 4 },
      securityCamera: { x: 11, y: 1 },
      brbMachine: { x: 14, y: 2 },
      brbServerA: { x: 17, y: 2 },
      brbServerB: { x: 19, y: 2 },
      clutterA: { x: 2, y: 8 },
      clutterB: { x: 10, y: 8 },
      equipmentClutter: { x: 8, y: 7 },
      damageA: { x: 1, y: 8 },
      damageB: { x: 19, y: 8 },
    },
    lightingZones: FACILITY_LIGHTING,
  },
  intake: {
    id: "intake",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomIntake",
    anchors: {
      officer: { x: 4, y: 6 },
      director: { x: 8, y: 6 },
      desk: { x: 6, y: 4 },
    },
    lightingZones: STANDARD_ROOM_LIGHTING,
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
      evidenceEquipment: { x: 8, y: 5 },
      shelfA: { x: 3, y: 2 },
      shelfB: { x: 6, y: 2 },
      shelfC: { x: 9, y: 2 },
    },
    lightingZones: STANDARD_ROOM_LIGHTING,
  },
  continuity: {
    id: "continuity",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomContinuity",
    anchors: {},
    lightingZones: STANDARD_ROOM_LIGHTING,
  },
  oversight: {
    id: "oversight",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomOversight",
    anchors: {},
    lightingZones: STANDARD_ROOM_LIGHTING,
  },
  secureBriefing: {
    id: "secureBriefing",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomSecureBriefing",
    anchors: {},
    lightingZones: STANDARD_ROOM_LIGHTING,
  },
  infrastructure: {
    id: "infrastructure",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomInfrastructure",
    anchors: {},
    lightingZones: STANDARD_ROOM_LIGHTING,
  },
  corporate: {
    id: "corporate",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomCorporate",
    anchors: {},
    lightingZones: STANDARD_ROOM_LIGHTING,
  },
  civicGate: {
    id: "civicGate",
    widthTiles: 14,
    heightTiles: 10,
    baseArtKey: "roomCivicGate",
    anchors: {},
    lightingZones: STANDARD_ROOM_LIGHTING,
  },
} as const satisfies Record<string, RoomDefinition>;

export type RoomDefinitionKey = keyof typeof ROOM_DEFINITIONS;
