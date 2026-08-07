/**
 * Player-visible LimeZu credit catalog.
 *
 * Only packs that currently supply at least one `ART` manifest entry are
 * returned by `getRepresentedLimeZuPacks`. Adding a new pack to the catalog
 * does nothing until a curated key maps to it.
 */

import { ART, type ArtKey } from "./manifest";

export type LimeZuPackId =
  | "modern_interiors"
  | "modern_exteriors"
  | "modern_office"
  | "character_generator";

export type LimeZuPackCredit = {
  readonly id: LimeZuPackId;
  readonly name: string;
  readonly url: string;
  readonly usage: string;
};

/** Artist credit required by the LimeZu license. */
export const LIMEZU_ARTIST = {
  name: "LimeZu",
  url: "https://limezu.itch.io",
} as const;

/**
 * Full catalog of owned LimeZu packs BRB may credit. Keep Modern Exteriors
 * here so later location work can opt in without inventing a second list.
 */
export const LIMEZU_PACK_CATALOG: readonly LimeZuPackCredit[] = [
  {
    id: "modern_interiors",
    name: "Modern Interiors (full version)",
    url: "https://limezu.itch.io/moderninteriors",
    usage:
      "Orthographic facility and aftermath rooms, furniture, monitors, server racks, security cameras, floors, and walls.",
  },
  {
    id: "modern_exteriors",
    name: "Modern Exteriors (full version)",
    url: "https://limezu.itch.io/modernexteriors",
    usage: "Exterior civic and infrastructure locations.",
  },
  {
    id: "modern_office",
    name: "Modern Office (Revamped v1.2)",
    url: "https://limezu.itch.io/modernoffice",
    usage:
      "Office furniture, workstations, paper and evidence load states, and equipment cabinets.",
  },
  {
    id: "character_generator",
    name: "Character Generator (full version)",
    url: "https://limezu.itch.io/moderninteriors",
    usage: "Ambient station idle strips and directional courier walk cycles.",
  },
] as const;

/** Which owned LimeZu pack supplies each curated runtime art key. */
export const ART_PACK_IDS: Record<ArtKey, LimeZuPackId> = {
  monitorScreens: "modern_interiors",
  monitorServer: "modern_interiors",
  staffAnalystIdle: "character_generator",
  staffOperatorIdle: "character_generator",
  staffStewardIdle: "character_generator",
  staffCrossingWalkRight: "character_generator",
  staffCrossingWalkLeft: "character_generator",
  envSecurityCamera: "modern_interiors",
  envConferenceDesk: "modern_interiors",
  envFloor: "modern_interiors",
  envFloorAdmin: "modern_interiors",
  envFloorWood: "modern_interiors",
  envFloorWorks: "modern_interiors",
  envWall: "modern_interiors",
  envWallCrown: "modern_interiors",
  envWallPale: "modern_interiors",
  envWallPaleCrown: "modern_interiors",
  envWallWarm: "modern_interiors",
  envWallWarmCrown: "modern_interiors",
  roomFacility: "modern_interiors",
  roomIntake: "modern_interiors",
  roomRecords: "modern_interiors",
  roomContinuity: "modern_interiors",
  roomOversight: "modern_interiors",
  roomSecureBriefing: "modern_interiors",
  roomInfrastructure: "modern_interiors",
  roomCorporate: "modern_interiors",
  roomCivicGate: "modern_interiors",
  envRecordsShelfSparse: "modern_interiors",
  envRecordsShelfFull: "modern_interiors",
  envRecordsShelfOverflow: "modern_interiors",
  envOversightBroadcast: "modern_interiors",
  envSecureSafe: "modern_interiors",
  envInfrastructureToolbox: "modern_exteriors",
  envCorporateDoor: "modern_exteriors",
  envCivicBarrier: "modern_exteriors",
};

/** Packs currently represented by the runtime art manifest. */
export function getRepresentedLimeZuPacks(): LimeZuPackCredit[] {
  const represented = new Set<LimeZuPackId>();
  for (const key of Object.keys(ART) as ArtKey[]) {
    represented.add(ART_PACK_IDS[key]);
  }
  return LIMEZU_PACK_CATALOG.filter((pack) => represented.has(pack.id));
}
