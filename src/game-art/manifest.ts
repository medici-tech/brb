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
 * Frame geometry conventions (confirm against
 * `moderninteriors-win/2_Characters/Character_Generator/Spritesheet_animations_GUIDE.png`
 * once the LimeZu pack is available locally):
 *   - Character sprites are 16w x 32h px, 6 frames per direction.
 *     A single-direction idle/walk strip is therefore 96x32 →
 *     frameWidth 16, frameHeight 32, frameCount 6.
 *   - Static environment tiles use frameCount 1 (no animation).
 *
 * All numeric values that are not dictated by the character convention above are
 * best-guess PLACEHOLDERS; they will be tuned when the assets are curated. Each
 * entry is commented with its intended LimeZu source path (relative to the
 * `BRB Assets/` pack root).
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
  // Intended source: 3_Animated_objects/16x16/spritesheets (wall of screens / CRT loop).
  monitorScreens: {
    key: "monitorScreens",
    src: `${ART_BASE_PATH}/monitors/control-room-screens.png`,
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 4,
    fps: 4,
    scale: 3,
  },
  // Intended source: 3_Animated_objects/16x16/spritesheets (blinking server rack).
  monitorServer: {
    key: "monitorServer",
    src: `${ART_BASE_PATH}/monitors/control-room-server.png`,
    frameWidth: 16,
    frameHeight: 32,
    frameCount: 4,
    fps: 3,
    scale: 3,
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
  },

  // ── Environment (mostly static tiles / props) ─────────────────────────────
  // Intended source: 3_Animated_objects/16x16/spritesheets (panning CCTV camera),
  //   or a static prop from 1_Interiors if no animation is desired.
  envSecurityCamera: {
    key: "envSecurityCamera",
    src: `${ART_BASE_PATH}/environment/security-camera.png`,
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 4,
    fps: 2,
    scale: 3,
  },
  // Intended source: 1_Interiors/16x16/Theme_Sorter_Singles/13_Conference_Hall_Singles
  //   (conference desk prop; static).
  envConferenceDesk: {
    key: "envConferenceDesk",
    src: `${ART_BASE_PATH}/environment/conference-desk.png`,
    frameWidth: 48,
    frameHeight: 32,
    frameCount: 1,
    fps: 0,
    scale: 3,
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
  },
} satisfies Record<string, ArtEntry>;

/** Union of every valid semantic art key. */
export type ArtKey = keyof typeof ART;

/** Narrowed lookup helper. Returns the typed entry for a known key. */
export function getArtEntry(key: ArtKey): ArtEntry {
  return ART[key];
}
