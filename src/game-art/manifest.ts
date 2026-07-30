/**
 * Typed art manifest for BRB control-room pixel art.
 *
 * This file is the single source of truth that maps STABLE semantic keys to the
 * curated runtime asset paths under `public/assets/brb/...` plus their sprite-sheet
 * frame geometry. Components reference these semantic keys only — never LimeZu's
 * source-folder names — so the source pack can be reorganised or re-curated without
 * touching component code.
 *
 * IMPORTANT: the referenced PNGs are gitignored (see `.gitignore`) and are injected
 * at deploy time / generated locally by `scripts/curate-art.ts`. This module must
 * compile and the app must build even when none of those files exist on disk; the
 * `PixelSprite` primitive renders a fallback when a sheet 404s.
 *
 * Frame geometry conventions (verified against the supplied LimeZu pack):
 *   - Character sprites are 16w x 32h px, 6 frames per direction.
 *     A single-direction idle/walk strip is therefore 96x32 →
 *     frameWidth 16, frameHeight 32, frameCount 6.
 *   - Static environment tiles use frameCount 1 (no animation).
 *
 * Each entry is commented with its selected LimeZu source path (relative to the
 * `BRB Assets/` pack root). `expectedWidth` and `expectedHeight` describe the
 * complete curated PNG and are checked by the private build-time injector.
 */

/** Public base path for all curated runtime art. */
export const ART_BASE_PATH = "/assets/brb/control-room" as const;

/** A single sprite-sheet entry: where the sheet lives and how to read its frames. */
export type ArtEntry = {
  /** Stable semantic key (matches the `ART` record key). */
  readonly key: string;
  /** Absolute public path to the sprite sheet (served from `public/`). */
  readonly src: string;
  /** Width of a single frame, in source pixels. */
  readonly frameWidth: number;
  /** Height of a single frame, in source pixels. */
  readonly frameHeight: number;
  /** Number of horizontal frames in the strip. 1 = static image. */
  readonly frameCount: number;
  /** Playback rate for animated strips, in frames per second. */
  readonly fps: number;
  /** Integer upscale factor applied when rendered (pixel art must scale by whole numbers). */
  readonly scale: number;
  /** Expected width of the complete curated PNG. */
  readonly expectedWidth: number;
  /** Expected height of the complete curated PNG. */
  readonly expectedHeight: number;
};

// Character convention: 16w x 32h, 6 frames per direction.
const CHARACTER_FRAME_WIDTH = 16;
const CHARACTER_FRAME_HEIGHT = 32;
const CHARACTER_FRAME_COUNT = 6;

/**
 * The manifest. Keys are semantic (role/purpose), not source-derived.
 *
 * `satisfies` keeps the record strongly typed while letting `ArtKey` be derived
 * from the literal keys below (so a typo in a component is a compile error).
 */
export const ART = {
  // ── Monitors ──────────────────────────────────────────────────────────────
  // Source: 3_Animated_objects/16x16/spritesheets/animated_control_room_screens.png.
  monitorScreens: {
    key: "monitorScreens",
    src: `${ART_BASE_PATH}/monitors/control-room-screens.png`,
    frameWidth: 64,
    frameHeight: 48,
    frameCount: 11,
    fps: 10,
    scale: 4,
    expectedWidth: 704,
    expectedHeight: 48,
  },
  // Source: 3_Animated_objects/16x16/spritesheets/animated_control_room_server.png.
  monitorServer: {
    key: "monitorServer",
    src: `${ART_BASE_PATH}/monitors/control-room-server.png`,
    frameWidth: 16,
    frameHeight: 48,
    frameCount: 3,
    fps: 2,
    scale: 3,
    expectedWidth: 48,
    expectedHeight: 48,
  },

  // ── Staff (characters) ────────────────────────────────────────────────────
  // Intended source: 2_Characters/Character_Generator/0_Premade_Characters/16x16
  //   → single-facing idle strip cropped to 96x32.
  staffAnalystIdle: {
    key: "staffAnalystIdle",
    src: `${ART_BASE_PATH}/staff/analyst-idle.png`,
    frameWidth: CHARACTER_FRAME_WIDTH,
    frameHeight: CHARACTER_FRAME_HEIGHT,
    frameCount: CHARACTER_FRAME_COUNT,
    fps: 6,
    scale: 3,
    expectedWidth: 96,
    expectedHeight: 32,
  },
  // Intended source: 2_Characters/Character_Generator/0_Premade_Characters/16x16
  //   → a second premade operator, idle strip cropped to 96x32.
  staffOperatorIdle: {
    key: "staffOperatorIdle",
    src: `${ART_BASE_PATH}/staff/operator-idle.png`,
    frameWidth: CHARACTER_FRAME_WIDTH,
    frameHeight: CHARACTER_FRAME_HEIGHT,
    frameCount: CHARACTER_FRAME_COUNT,
    fps: 6,
    scale: 3,
    expectedWidth: 96,
    expectedHeight: 32,
  },
  // Steward station — front-idle strip. Desk layering supplies seated occlusion.
  staffStewardIdle: {
    key: "staffStewardIdle",
    src: `${ART_BASE_PATH}/staff/steward-idle.png`,
    frameWidth: CHARACTER_FRAME_WIDTH,
    frameHeight: CHARACTER_FRAME_HEIGHT,
    frameCount: CHARACTER_FRAME_COUNT,
    fps: 4,
    scale: 3,
    expectedWidth: 96,
    expectedHeight: 32,
  },
  // Crossing courier — walk-right for left-to-right one-way travel.
  staffCrossingWalkRight: {
    key: "staffCrossingWalkRight",
    src: `${ART_BASE_PATH}/staff/crossing-walk-right.png`,
    frameWidth: CHARACTER_FRAME_WIDTH,
    frameHeight: CHARACTER_FRAME_HEIGHT,
    frameCount: CHARACTER_FRAME_COUNT,
    fps: 8,
    scale: 3,
    expectedWidth: 96,
    expectedHeight: 32,
  },
  // Crossing courier — walk-left for right-to-left one-way travel.
  staffCrossingWalkLeft: {
    key: "staffCrossingWalkLeft",
    src: `${ART_BASE_PATH}/staff/crossing-walk-left.png`,
    frameWidth: CHARACTER_FRAME_WIDTH,
    frameHeight: CHARACTER_FRAME_HEIGHT,
    frameCount: CHARACTER_FRAME_COUNT,
    fps: 8,
    scale: 3,
    expectedWidth: 96,
    expectedHeight: 32,
  },

  // ── Environment (mostly static tiles / props) ─────────────────────────────
  // Source: animated_security_camera_right.gif timing reproduced from its PNG strip.
  envSecurityCamera: {
    key: "envSecurityCamera",
    src: `${ART_BASE_PATH}/environment/security-camera.png`,
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 18,
    fps: 10,
    scale: 3,
    expectedWidth: 288,
    expectedHeight: 16,
  },
  // Source: 1_Interiors/16x16/Theme_Sorter_Singles/13_Conference_Hall_Singles/
  //   Conference_Hall_Singles_32.png (free-standing lectern: mic + grey screen).
  envConferenceDesk: {
    key: "envConferenceDesk",
    src: `${ART_BASE_PATH}/environment/conference-desk.png`,
    frameWidth: 16,
    frameHeight: 32,
    frameCount: 1,
    fps: 0,
    scale: 3,
    expectedWidth: 16,
    expectedHeight: 32,
  },
  // Intended source: 1_Interiors/16x16/Room_Builder_subfiles (floor tile; static, tileable).
  envFloor: {
    key: "envFloor",
    src: `${ART_BASE_PATH}/environment/floor.png`,
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 1,
    fps: 0,
    scale: 3,
    expectedWidth: 16,
    expectedHeight: 16,
  },
  // Intended source: 1_Interiors/16x16/Room_Builder_subfiles (wall tile; static, tileable).
  envWall: {
    key: "envWall",
    src: `${ART_BASE_PATH}/environment/wall.png`,
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 1,
    fps: 0,
    scale: 3,
    expectedWidth: 16,
    expectedHeight: 16,
  },

  // ── Complete orthographic room bases ─────────────────────────────────────
  // These are deterministic private composites assembled from 16px room-builder
  // tiles and black-shadow furniture singles by scripts/curate-art.ts.
  roomFacility: {
    key: "roomFacility",
    src: `${ART_BASE_PATH}/rooms/continuity-facility.png`,
    frameWidth: 352,
    frameHeight: 224,
    frameCount: 1,
    fps: 0,
    scale: 1,
    expectedWidth: 352,
    expectedHeight: 224,
  },
  roomIntake: {
    key: "roomIntake",
    src: `${ART_BASE_PATH}/rooms/intake-office.png`,
    frameWidth: 224,
    frameHeight: 160,
    frameCount: 1,
    fps: 0,
    scale: 1,
    expectedWidth: 224,
    expectedHeight: 160,
  },
  roomRecords: {
    key: "roomRecords",
    src: `${ART_BASE_PATH}/rooms/records-office.png`,
    frameWidth: 224,
    frameHeight: 160,
    frameCount: 1,
    fps: 0,
    scale: 1,
    expectedWidth: 224,
    expectedHeight: 160,
  },
  roomContinuity: {
    key: "roomContinuity",
    src: `${ART_BASE_PATH}/rooms/aftermath-continuity.png`,
    frameWidth: 224,
    frameHeight: 160,
    frameCount: 1,
    fps: 0,
    scale: 1,
    expectedWidth: 224,
    expectedHeight: 160,
  },
  roomOversight: {
    key: "roomOversight",
    src: `${ART_BASE_PATH}/rooms/aftermath-oversight.png`,
    frameWidth: 224,
    frameHeight: 160,
    frameCount: 1,
    fps: 0,
    scale: 1,
    expectedWidth: 224,
    expectedHeight: 160,
  },
  roomSecureBriefing: {
    key: "roomSecureBriefing",
    src: `${ART_BASE_PATH}/rooms/aftermath-secure-briefing.png`,
    frameWidth: 224,
    frameHeight: 160,
    frameCount: 1,
    fps: 0,
    scale: 1,
    expectedWidth: 224,
    expectedHeight: 160,
  },
  roomInfrastructure: {
    key: "roomInfrastructure",
    src: `${ART_BASE_PATH}/rooms/aftermath-infrastructure.png`,
    frameWidth: 224,
    frameHeight: 160,
    frameCount: 1,
    fps: 0,
    scale: 1,
    expectedWidth: 224,
    expectedHeight: 160,
  },
  roomCorporate: {
    key: "roomCorporate",
    src: `${ART_BASE_PATH}/rooms/aftermath-corporate.png`,
    frameWidth: 224,
    frameHeight: 160,
    frameCount: 1,
    fps: 0,
    scale: 1,
    expectedWidth: 224,
    expectedHeight: 160,
  },
  roomCivicGate: {
    key: "roomCivicGate",
    src: `${ART_BASE_PATH}/rooms/aftermath-civic-gate.png`,
    frameWidth: 224,
    frameHeight: 160,
    frameCount: 1,
    fps: 0,
    scale: 1,
    expectedWidth: 224,
    expectedHeight: 160,
  },

  // ── Narrative locations ──────────────────────────────────────────────────
  // Oversight chamber broadcast camera / public feed.
  envOversightBroadcast: {
    key: "envOversightBroadcast",
    src: `${ART_BASE_PATH}/narrative/oversight-broadcast.png`,
    frameWidth: 48,
    frameHeight: 32,
    frameCount: 24,
    fps: 10,
    scale: 2,
    expectedWidth: 1152,
    expectedHeight: 32,
  },
  // Secure briefing evidence safe.
  envSecureSafe: {
    key: "envSecureSafe",
    src: `${ART_BASE_PATH}/narrative/secure-safe.png`,
    frameWidth: 16,
    frameHeight: 32,
    frameCount: 6,
    fps: 10,
    scale: 2,
    expectedWidth: 96,
    expectedHeight: 32,
  },
  // Worksite toolbox, sequenced to preserve the source GIF's two hold frames.
  envInfrastructureToolbox: {
    key: "envInfrastructureToolbox",
    src: `${ART_BASE_PATH}/narrative/infrastructure-toolbox.png`,
    frameWidth: 32,
    frameHeight: 48,
    frameCount: 22,
    fps: 10,
    scale: 2,
    expectedWidth: 704,
    expectedHeight: 48,
  },
  // Corporation office door, sequenced to preserve open/closed holds.
  envCorporateDoor: {
    key: "envCorporateDoor",
    src: `${ART_BASE_PATH}/narrative/corporate-door.png`,
    frameWidth: 48,
    frameHeight: 32,
    frameCount: 22,
    fps: 10,
    scale: 2,
    expectedWidth: 1056,
    expectedHeight: 32,
  },
  // Civic perimeter barrier, sequenced to preserve open/closed holds.
  envCivicBarrier: {
    key: "envCivicBarrier",
    src: `${ART_BASE_PATH}/narrative/civic-barrier.png`,
    frameWidth: 80,
    frameHeight: 80,
    frameCount: 22,
    fps: 10,
    scale: 1,
    expectedWidth: 1760,
    expectedHeight: 80,
  },
} satisfies Record<string, ArtEntry>;

/** Union of every valid semantic art key. */
export type ArtKey = keyof typeof ART;

/** Narrowed lookup helper. Returns the typed entry for a known key. */
export function getArtEntry(key: ArtKey): ArtEntry {
  return ART[key];
}
