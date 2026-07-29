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
  // Intended source: 2_Characters/Character_Generator/0_Premade_Characters/16x16
  //   → seated variant (confirm frame count; some seated sets are 1–6 frames).
  staffStewardSeated: {
    key: "staffStewardSeated",
    src: `${ART_BASE_PATH}/staff/steward-seated.png`,
    frameWidth: CHARACTER_FRAME_WIDTH,
    frameHeight: CHARACTER_FRAME_HEIGHT,
    frameCount: CHARACTER_FRAME_COUNT,
    fps: 4,
    scale: 3,
    expectedWidth: 96,
    expectedHeight: 32,
  },
  // Intended source: 2_Characters/Character_Generator/0_Premade_Characters/16x16
  //   → walk cycle, single facing cropped to 96x32.
  staffCrossingWalk: {
    key: "staffCrossingWalk",
    src: `${ART_BASE_PATH}/staff/crossing-walk.png`,
    frameWidth: CHARACTER_FRAME_WIDTH,
    frameHeight: CHARACTER_FRAME_HEIGHT,
    frameCount: CHARACTER_FRAME_COUNT,
    fps: 8,
    scale: 3,
    expectedWidth: 96,
    expectedHeight: 32,
  },

  // ── Environment (mostly static tiles / props) ─────────────────────────────
  // Source: 3_Animated_objects/16x16/spritesheets/animated_security_camera_right.png.
  envSecurityCamera: {
    key: "envSecurityCamera",
    src: `${ART_BASE_PATH}/environment/security-camera.png`,
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 10,
    fps: 2,
    scale: 3,
    expectedWidth: 160,
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
} satisfies Record<string, ArtEntry>;

/** Union of every valid semantic art key. */
export type ArtKey = keyof typeof ART;

/** Narrowed lookup helper. Returns the typed entry for a known key. */
export function getArtEntry(key: ArtKey): ArtEntry {
  return ART[key];
}
