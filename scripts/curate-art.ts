/**
 * Runtime-art curator for BRB (RUN LOCALLY ONLY).
 *
 * Copies/crops SELECTED files out of the local LimeZu pack (`BRB Assets/...`) into
 * the gitignored runtime tree (`public/assets/brb/...`) under the STABLE filenames
 * that `src/game-art/manifest.ts` expects. This is what a maintainer runs to refresh
 * local art; for deploys the same tree is injected from private storage instead
 * (see docs/BRB_ART_PIPELINE.md).
 *
 * Nothing here is committed: the LimeZu pack and `public/assets/brb/` are both
 * gitignored (redistribution-restricted, public repo). The script is idempotent —
 * re-running reproduces the same outputs — and shells out to ImageMagick
 * (`magick`/`convert`) for cropping.
 *
 * Usage:
 *   tsx scripts/curate-art.ts           # curate every configured key
 *   tsx scripts/curate-art.ts staffAnalystIdle staffOperatorIdle
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ART, type ArtKey } from "../src/game-art/manifest.js";
import {
  ROOM_COMPOSITE_KEYS,
  ROOM_RECIPES,
  type RoomCompositeKey,
  type RoomCompositeRecipe,
} from "./room-recipes.js";

const PROJECT_ROOT = process.cwd();
const PACK_ROOT = path.join(PROJECT_ROOT, "BRB Assets");
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public");
const INTERIORS_PACK = "moderninteriors-win";

/** Pixel rectangle to crop out of the source sheet. */
type Crop = { readonly width: number; readonly height: number; readonly x: number; readonly y: number };

/** Deterministic left-to-right frame extraction from a cropped (or full) sheet. */
export type FrameSequence = {
  readonly frameWidth: number;
  readonly frameHeight: number;
  /** Zero-based source frame indices, written in this order into the output strip. */
  readonly indices: readonly number[];
};

export type CurationStep = {
  /** Source file, relative to `BRB Assets/` (INTERIORS_PACK prefix optional). */
  readonly source: string;
  /** Optional crop; omit to copy the source through unchanged. */
  readonly crop?: Crop;
  /**
   * Optional deterministic frame sequence. Applied after `crop` (or to the full
   * source). Produces a horizontal strip of `indices.length` frames.
   */
  readonly frameSequence?: FrameSequence;
  /** Human-readable provenance note for the log + future auditing. */
  readonly note: string;
};

type SourceArtKey = Exclude<ArtKey, RoomCompositeKey>;

/**
 * Curation table — one entry per manifest key. These selections and crops were
 * verified against the supplied pack on 2026-07-29 / 2026-07-30. Character strips
 * are 96x32 (16x32 × 6 frames) cut from a wider premade sheet.
 */
export const CURATION: Record<SourceArtKey, CurationStep> = {
  // Wall of monitors — complete 11-frame, 64×48-per-frame strip.
  monitorScreens: {
    source: "3_Animated_objects/16x16/spritesheets/animated_control_room_screens.png",
    note: "Control-room screen wall → 11×(64×48) frames.",
  },
  // Server rack blink — complete 3-frame, 16×48-per-frame strip.
  monitorServer: {
    source: "3_Animated_objects/16x16/spritesheets/animated_control_room_server.png",
    note: "Control-room server rack → 3×(16×48) frames.",
  },
  // Analyst — single-facing idle strip (96×32) from the first premade character.
  staffAnalystIdle: {
    source: "2_Characters/Character_Generator/0_Premade_Characters/16x16/Premade_Character_01.png",
    crop: { width: 96, height: 32, x: 0, y: 32 },
    note: "Premade char 01, front-idle strip → 6×(16×32).",
  },
  // Operator — a second premade character's idle strip.
  staffOperatorIdle: {
    source: "2_Characters/Character_Generator/0_Premade_Characters/16x16/Premade_Character_02.png",
    crop: { width: 96, height: 32, x: 0, y: 32 },
    note: "Premade char 02, front-idle strip → 6×(16×32).",
  },
  // Steward — front-idle strip (seated variant deferred; true sit rows come later).
  staffStewardIdle: {
    source: "2_Characters/Character_Generator/0_Premade_Characters/16x16/Premade_Character_03.png",
    crop: { width: 96, height: 32, x: 0, y: 32 },
    note: "Premade char 03, front-idle strip (row y=32) → 6×(16×32).",
  },
  // Crossing courier — walk-right strip for left-to-right travel.
  staffCrossingWalkRight: {
    source: "2_Characters/Character_Generator/0_Premade_Characters/16x16/Premade_Character_04.png",
    crop: { width: 96, height: 32, x: 0, y: 128 },
    note: "Premade char 04, walk-right strip (row y=128) → 6×(16×32).",
  },
  // Crossing courier — walk-left strip for right-to-left travel.
  staffCrossingWalkLeft: {
    source: "2_Characters/Character_Generator/0_Premade_Characters/16x16/Premade_Character_04.png",
    crop: { width: 96, height: 32, x: 0, y: 160 },
    note: "Premade char 04, walk-left strip (row y=160) → 6×(16×32).",
  },
  // Security camera — preserve the source GIF's 0.5s endpoint holds at 10 fps.
  envSecurityCamera: {
    source: "3_Animated_objects/16x16/spritesheets/animated_security_camera_right.png",
    frameSequence: {
      frameWidth: 16,
      frameHeight: 16,
      indices: [0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 5, 5, 5, 5, 6, 7, 8, 9],
    },
    note: "Right-facing CCTV pan → 18×(16×16) frames reproducing the 1.8-second GIF timing.",
  },
  // Conference desk/lectern — static prop from the conference-hall singles.
  envConferenceDesk: {
    // NOT _25: that file is the left END-CAP of a conference-table run — the desk is
    // cut flush at the right edge with dead space on the left, so used as a
    // standalone prop it renders as a truncated fragment. _32 is a complete
    // free-standing lectern (mic + neutral grey screen), which also reads as a
    // briefing station rather than furniture.
    source: "1_Interiors/16x16/Theme_Sorter_Singles/13_Conference_Hall_Singles/Conference_Hall_Singles_32.png",
    note: "Conference lectern single, mic + grey screen (static, 16×32).",
  },
  // ── Room-builder shells ───────────────────────────────────────────────────
  // Floors: tileable 16×16 singles, one per room mood. Every crop below was
  // checked for a seamless self-repeat (left edge flows into right edge) before
  // being committed — LimeZu floors are authored as 3×3 pattern blocks, so an
  // arbitrary tile out of a block will seam.
  //
  // Each floor is also PAIRED with a wall style by luminance, not by taste. A
  // room whose floor and wall sit within ~20 relative-luminance points has no
  // visible architecture at all: the shell just reads as more floor. Measured
  // wall-face luminance is slate 94, pale 204, warm 191; every pairing below
  // clears a 60-point gap.
  envFloor: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Floors_16x16.png",
    // NOT the old (128,272) pick: that tile is a diagonally striped carpet, and
    // the diagonal runs against the 16px grid every room is built on, which
    // reads as a moiré rather than a floor once the camera scales it.
    crop: { width: 16, height: 16, x: 128, y: 544 },
    note: "Mid-grey institutional tile (lum 159) → slate-walled operational rooms.",
  },
  envFloorAdmin: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Floors_16x16.png",
    crop: { width: 16, height: 16, x: 192, y: 384 },
    note: "Darker grey tile grid (lum 112) → pale-walled civil-administrative rooms.",
  },
  envFloorWood: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Floors_16x16.png",
    crop: { width: 16, height: 16, x: 192, y: 432 },
    note: "Dark wood plank (lum 80) → warm-walled private/corporate interiors.",
  },
  envFloorWorks: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Floors_16x16.png",
    crop: { width: 16, height: 16, x: 0, y: 576 },
    note: "Pale poured concrete (lum 181) → slate-walled worksite and civic perimeter.",
  },

  // Walls. The source sheet lays every wall variant out as a 32px band:
  //   +0  1px navy outline
  //   +1  4px white crown (the top of the wall, seen from above)
  //   +5  1px navy outline
  //   +6  23px wall face
  //   +29 1px navy outline
  //   +30 1px baseboard
  //   +31 1px navy outline
  // Within a band, x=16..31 is the gutter-free interior of a three-tile run, so
  // it is the only 16px column that tiles cleanly in both shapes. Band origins:
  // slate y=544, pale y=64, warm y=352.
  //
  // The *Crown crops take the WHOLE 32px band. That is the fix for rooms reading
  // as carpet with grey gutters: a face-only slice (what this file used to cut)
  // has no crown and no baseboard, so a room edge had no architecture in it.
  envWall: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Walls_16x16.png",
    // NOT the 16px-wide single at x=80: that block's outermost columns are painted
    // navy (#3A3A50) borders — verified x=80 and x=95 — so cropping it bakes a
    // separator into the tile and repeats a hard dark bar every 16px. Take the
    // interior of the 64px-wide run of the same wall on the same row instead.
    crop: { width: 16, height: 16, x: 16, y: 552 },
    note: "Slate wall face (band 17) → side/near edges and interior partitions.",
  },
  envWallCrown: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Walls_16x16.png",
    crop: { width: 16, height: 32, x: 16, y: 544 },
    note: "Slate wall segment, crown + face + baseboard → far-edge wall band.",
  },
  envWallPale: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Walls_16x16.png",
    crop: { width: 16, height: 16, x: 16, y: 72 },
    note: "Pale wall face (band 2) → civil-administrative side edges.",
  },
  envWallPaleCrown: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Walls_16x16.png",
    crop: { width: 16, height: 32, x: 16, y: 64 },
    note: "Pale wall segment, crown + face + baseboard → far-edge wall band.",
  },
  envWallWarm: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Walls_16x16.png",
    crop: { width: 16, height: 16, x: 16, y: 360 },
    note: "Warm tan wall face (band 11) → private/corporate side edges.",
  },
  envWallWarmCrown: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Walls_16x16.png",
    crop: { width: 16, height: 32, x: 16, y: 352 },
    note: "Warm tan wall segment, crown + face + baseboard → far-edge wall band.",
  },

  // Records progression. These three must read as ONE shelf filling up, so they
  // are ordered by visible empty space, not by which sheet they came from. The
  // previous picks (67 / 60 / 74) were three equally-crammed shelves, so the
  // Archive's accumulation was invisible.
  envRecordsShelfSparse: {
    source:
      "1_Interiors/16x16/Theme_Sorter_Black_Shadow_Singles/5_Classroom_and_Library_Black_Shadow_Singles_16x16/Classroom_and_Library_Singles_56.png",
    note: "Records shelves with bare sections → 32×48, the empty end of the progression.",
  },
  envRecordsShelfFull: {
    source:
      "1_Interiors/16x16/Theme_Sorter_Black_Shadow_Singles/5_Classroom_and_Library_Black_Shadow_Singles_16x16/Classroom_and_Library_Singles_57.png",
    note: "Records shelves stocked on every level → 32×48, same frame as sparse.",
  },
  envRecordsShelfOverflow: {
    source:
      "1_Interiors/16x16/Theme_Sorter_Black_Shadow_Singles/5_Classroom_and_Library_Black_Shadow_Singles_16x16/Classroom_and_Library_Singles_74.png",
    note: "Records shelves crammed past capacity → 32×48, the overflow end.",
  },
  envOversightBroadcast: {
    source: "3_Animated_objects/16x16/spritesheets/animated_TV_reportage.png",
    note: "Television reportage camera → 24×(48×32) frames for the oversight chamber.",
  },
  envSecureSafe: {
    source: "3_Animated_objects/16x16/spritesheets/animated_safe_empty.png",
    note: "Secure evidence safe → 6×(16×32) frames for compartmented briefings.",
  },
  envInfrastructureToolbox: {
    source:
      "modernexteriors-win/Modern_Exteriors_16x16/Animated_16x16/Animated_sheets_16x16/Worksite_toolbox_full_16x16.png",
    frameSequence: {
      frameWidth: 32,
      frameHeight: 48,
      indices: [0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 8, 9, 10, 11, 12, 13],
    },
    note: "Worksite toolbox → 22×(32×48) frames preserving the supplied GIF holds.",
  },
  envCorporateDoor: {
    source:
      "modernexteriors-win/Modern_Exteriors_16x16/Animated_16x16/Animated_sheets_16x16/Office_Door_Lime_Corp_1_16x16.png",
    frameSequence: {
      frameWidth: 48,
      frameHeight: 32,
      indices: [0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 8, 9, 10, 11, 12, 13],
    },
    note: "Corporation office door → 22×(48×32) frames preserving closed/open holds.",
  },
  envCivicBarrier: {
    source:
      "modernexteriors-win/Modern_Exteriors_16x16/Animated_16x16/Animated_sheets_16x16/Automatic_Barrier_1_16x16.png",
    frameSequence: {
      frameWidth: 80,
      frameHeight: 80,
      indices: [0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 8, 9, 10, 11, 12, 13],
    },
    note: "Civic automatic barrier → 22×(80×80) frames preserving open/closed holds.",
  },
};

class UsageError extends Error {}

function imageMagick(subcommand: "convert" | "identify"): string[] {
  const candidates =
    subcommand === "convert"
      ? [["magick"], ["convert"]]
      : [["magick", "identify"], ["identify"]];
  for (const candidate of candidates) {
    try {
      execFileSync(candidate[0]!, [...candidate.slice(1), "--version"], { stdio: "ignore" });
      return candidate;
    } catch {
      // try next form
    }
  }
  throw new UsageError(
    `ImageMagick '${subcommand}' not found. Install ImageMagick (e.g. 'brew install imagemagick') and retry.`,
  );
}

function resolveSource(source: string): string {
  const direct = path.join(PACK_ROOT, source);
  if (existsSync(direct)) return direct;
  const nested = path.join(PACK_ROOT, INTERIORS_PACK, source);
  if (existsSync(nested)) return nested;
  throw new UsageError(
    `Source not found: '${source}'.\n  Looked in: ${direct}\n        and: ${nested}`,
  );
}

/** Absolute output path from the manifest's public `src`. */
function outputPath(key: ArtKey): string {
  // manifest src is an absolute public path like "/assets/brb/control-room/...".
  return path.join(PUBLIC_ROOT, ART[key].src);
}

/** Tile height, in 16px tiles, of one far-edge wall band (crown + face + base). */
export const WALL_BAND_TILES = 2;

/**
 * BRB_ART_DIRECTION.md §6: a room's floor and its wall must differ by at least
 * 40 points of relative luminance. Target 60+.
 */
export const MIN_SHELL_CONTRAST = 40;

/**
 * Committed relative luminance of every shell tile, measured off the curated PNG
 * with §6's formula (0.2126R + 0.7152G + 0.0722B) over the wall's FACE rows —
 * which is what `envWall*` (as opposed to `envWall*Crown`) already is.
 *
 * Committed for the same reason `FURNITURE_TILE_SIZE` is committed in
 * room-recipes.ts: `validateRoomRecipe` runs without the pack, so the contrast
 * law has to be checkable from data alone. `assertShellContrast` re-measures the
 * real PNGs whenever the pack IS present, so the two numbers cannot drift.
 *
 * §6 records this rule being missed twice — Δ 7.7 in the original single-shell
 * rooms, then Δ 6 on the first repair attempt, because "structural work with no
 * measurement behind it can leave the problem exactly where it was."
 */
export const SHELL_TILE_LUMINANCE: Partial<Record<ArtKey, number>> = {
  envFloor: 159.2,
  envFloorAdmin: 112.3,
  envFloorWood: 80.2,
  envFloorWorks: 181.4,
  envWall: 93.9,
  envWallPale: 204.0,
  envWallWarm: 191.4,
};

/** Luminance drift tolerated between the committed number and the real PNG. */
const LUMINANCE_TOLERANCE = 1.0;

function shellLuminance(key: ArtKey, recipeKey: string, role: string): number {
  const committed = SHELL_TILE_LUMINANCE[key];
  if (committed === undefined) {
    throw new UsageError(
      `${recipeKey}: ${role} tile '${key}' has no SHELL_TILE_LUMINANCE entry. `
        + `Measure it and commit the value so the §6 contrast law stays checkable `
        + `without the pack.`,
    );
  }
  return committed;
}

export function validateRoomRecipe(recipe: RoomCompositeRecipe): void {
  if (
    !Number.isInteger(recipe.widthTiles)
    || !Number.isInteger(recipe.heightTiles)
    || recipe.widthTiles <= 0
    || recipe.heightTiles <= 0
  ) {
    throw new UsageError(`${recipe.key}: room dimensions must be positive integers.`);
  }

  // A room's shell tiles must be the shapes the compositor assumes: 16×16 for
  // anything tiled freely, 16×32 for the crown band (one tile wide, two tall).
  for (const [role, key, height] of [
    ["floor", recipe.floorArtKey, 16],
    ["wall face", recipe.wallFaceArtKey, 16],
    ["wall crown", recipe.wallCrownArtKey, 32],
  ] as const) {
    const tile = ART[key];
    if (tile.expectedWidth !== 16 || tile.expectedHeight !== height) {
      throw new UsageError(
        `${recipe.key}: ${role} tile '${key}' must be 16×${height}, got ${tile.expectedWidth}×${tile.expectedHeight}.`,
      );
    }
  }

  for (const band of recipe.wallBands) {
    if (
      !Number.isInteger(band.x)
      || !Number.isInteger(band.y)
      || !Number.isInteger(band.widthTiles)
      || band.x < 0
      || band.y < 0
      || band.widthTiles <= 0
      || band.x + band.widthTiles > recipe.widthTiles
      || band.y + WALL_BAND_TILES > recipe.heightTiles
    ) {
      throw new UsageError(`${recipe.key}: wall band falls outside the room.`);
    }
  }

  for (const wall of recipe.walls) {
    const values = [wall.x, wall.y, wall.width, wall.height];
    if (values.some((value) => !Number.isInteger(value))) {
      throw new UsageError(`${recipe.key}: wall rectangles must use integer tile coordinates.`);
    }
    if (
      wall.x < 0
      || wall.y < 0
      || wall.width <= 0
      || wall.height <= 0
      || wall.x + wall.width > recipe.widthTiles
      || wall.y + wall.height > recipe.heightTiles
    ) {
      throw new UsageError(`${recipe.key}: wall rectangle falls outside the room.`);
    }
  }

  for (const zone of recipe.lightingZones) {
    const values = [zone.x, zone.y, zone.width, zone.height];
    if (
      values.some((value) => !Number.isInteger(value))
      || zone.x < 0
      || zone.y < 0
      || zone.width <= 0
      || zone.height <= 0
      || zone.x + zone.width > recipe.widthTiles
      || zone.y + zone.height > recipe.heightTiles
    ) {
      throw new UsageError(`${recipe.key}: lighting zone falls outside the room.`);
    }
  }

  for (const anchors of [
    recipe.spriteAnchors,
    recipe.dynamicOverlayAnchors,
  ]) {
    for (const [name, point] of Object.entries(anchors)) {
      if (
        !Number.isInteger(point.x)
        || !Number.isInteger(point.y)
        || point.x < 0
        || point.y < 0
        || point.x >= recipe.widthTiles
        || point.y >= recipe.heightTiles
      ) {
        throw new UsageError(
          `${recipe.key}: anchor '${name}' falls outside the room.`,
        );
      }
    }
  }

  for (const placement of recipe.furniture) {
    if (
      !Number.isInteger(placement.x)
      || !Number.isInteger(placement.y)
      || !Number.isInteger(placement.widthTiles)
      || !Number.isInteger(placement.heightTiles)
      || placement.x < 0
      || placement.y < 0
      || placement.widthTiles <= 0
      || placement.heightTiles <= 0
      || placement.x + placement.widthTiles > recipe.widthTiles
      || placement.y + placement.heightTiles > recipe.heightTiles
    ) {
      throw new UsageError(
        `${recipe.key}: furniture '${placement.source}' falls outside the room.`,
      );
    }
  }

  const entry = ART[recipe.key];
  if (
    entry.expectedWidth !== recipe.widthTiles * 16
    || entry.expectedHeight !== recipe.heightTiles * 16
    || entry.frameWidth !== entry.expectedWidth
    || entry.frameHeight !== entry.expectedHeight
    || entry.frameCount !== 1
  ) {
    throw new UsageError(
      `${recipe.key}: manifest geometry must describe the complete 16px-grid room as one frame.`,
    );
  }

  assertShellContrast(recipe);
  assertNoFurnitureOverlap(recipe);
  assertReservedAnchorsClear(recipe);
}

/**
 * §6, the contrast law: floor and wall must differ by ≥40 relative-luminance
 * points. Uses the committed table so this runs without the pack.
 */
function assertShellContrast(recipe: RoomCompositeRecipe): void {
  const floor = shellLuminance(recipe.floorArtKey, recipe.key, "floor");
  const wall = shellLuminance(recipe.wallFaceArtKey, recipe.key, "wall face");
  const delta = Math.abs(floor - wall);
  if (delta < MIN_SHELL_CONTRAST) {
    throw new UsageError(
      `${recipe.key}: floor '${recipe.floorArtKey}' (lum ${floor.toFixed(1)}) and wall `
        + `'${recipe.wallFaceArtKey}' (lum ${wall.toFixed(1)}) differ by only Δ${delta.toFixed(1)}. `
        + `BRB_ART_DIRECTION.md §6 requires Δ≥${MIN_SHELL_CONTRAST}, target 60+. `
        + `Below that the shell disappears into the floor and the room reads as `
        + `"carpet with grey gutters".`,
    );
  }
}

/** Every tile a placement covers, as "x,y" keys. */
function occupiedTiles(
  recipe: RoomCompositeRecipe,
): Map<string, string> {
  const occupied = new Map<string, string>();
  for (const placement of recipe.furniture) {
    for (let dx = 0; dx < placement.widthTiles; dx++) {
      for (let dy = 0; dy < placement.heightTiles; dy++) {
        const tile = `${placement.x + dx},${placement.y + dy}`;
        const previous = occupied.get(tile);
        if (previous === undefined) {
          occupied.set(tile, placement.source);
        } else {
          occupied.set(tile, `${previous} + ${placement.source}`);
        }
      }
    }
  }
  return occupied;
}

/**
 * Two baked props may not claim the same tile. Paint order is last-wins, so an
 * overlap silently truncates whichever prop was placed first — that is how a
 * worksite sign ended up with its post painted over by a timber stack.
 */
function assertNoFurnitureOverlap(recipe: RoomCompositeRecipe): void {
  const seen = new Map<string, string>();
  for (const placement of recipe.furniture) {
    for (let dx = 0; dx < placement.widthTiles; dx++) {
      for (let dy = 0; dy < placement.heightTiles; dy++) {
        const tile = `${placement.x + dx},${placement.y + dy}`;
        const previous = seen.get(tile);
        if (previous !== undefined && previous !== placement.source) {
          throw new UsageError(
            `${recipe.key}: baked furniture overlaps at tile (${tile}) — `
              + `'${previous}' and '${placement.source}'. Paint order is last-wins, `
              + `so one of them is silently truncated.`,
          );
        }
        seen.set(tile, placement.source);
      }
    }
  }
}

/**
 * §11.4: "Leave the reserved tiles empty." A runtime layer or actor anchored on
 * top of a baked prop overpaints it at exactly the moment the state it signals
 * matters — the facility annex shipped a copier under both the Corporation
 * terminal and the institutional-damage anchor, so three objects piled into one
 * 2×3 footprint and none of them read.
 *
 * Anchors are points, not footprints: the recipe cannot know how large a sprite
 * a component will attach. A point landing on a baked prop is the signal.
 */
function assertReservedAnchorsClear(recipe: RoomCompositeRecipe): void {
  const occupied = occupiedTiles(recipe);
  for (const [name, point] of Object.entries(recipe.dynamicOverlayAnchors)) {
    if (recipe.anchorsAllowedOverFurniture?.includes(name)) continue;
    const tile = `${point.x},${point.y}`;
    const source = occupied.get(tile);
    if (source !== undefined) {
      throw new UsageError(
        `${recipe.key}: overlay anchor '${name}' at (${tile}) sits on baked `
          + `'${source}'. Clear the tile, move the anchor, or — if the prop is `
          + `meant to be stood on, like a chair — list '${name}' in the recipe's `
          + `anchorsAllowedOverFurniture with a reason.`,
      );
    }
  }
}

/** Resolved shell tile paths for one room composite. */
export type RoomShellTiles = {
  readonly floor: string;
  readonly wallFace: string;
  readonly wallCrown: string;
};

/**
 * ImageMagick arguments for one metadata-stripped room composite.
 * Exported so tests can verify the exact source-pixel contract without the pack.
 *
 * Paint order is strictly back-to-front, and it matters:
 *   1. floor over the whole canvas,
 *   2. flat wall FACE over the side/near edges and interior partitions,
 *   3. the two-tile crown BAND over every far edge — drawn after the faces so a
 *      band's baseboard lands on top of the corner it shares with a side wall,
 *   4. furniture.
 */
export function buildRoomCompositeConvertArgs(
  recipe: RoomCompositeRecipe,
  tiles: RoomShellTiles,
  furnitureSources: readonly string[],
  dest: string,
): string[] {
  validateRoomRecipe(recipe);
  if (furnitureSources.length !== recipe.furniture.length) {
    throw new UsageError(
      `${recipe.key}: expected ${recipe.furniture.length} resolved furniture sources, received ${furnitureSources.length}.`,
    );
  }

  const width = recipe.widthTiles * 16;
  const height = recipe.heightTiles * 16;
  const args: string[] = ["-size", `${width}x${height}`, `tile:${tiles.floor}`];

  for (const wall of recipe.walls) {
    args.push(
      "(",
      "-size",
      `${wall.width * 16}x${wall.height * 16}`,
      `tile:${tiles.wallFace}`,
      ")",
      "-geometry",
      `+${wall.x * 16}+${wall.y * 16}`,
      "-composite",
    );
  }

  for (const band of recipe.wallBands) {
    args.push(
      "(",
      "-size",
      `${band.widthTiles * 16}x${WALL_BAND_TILES * 16}`,
      `tile:${tiles.wallCrown}`,
      ")",
      "-geometry",
      `+${band.x * 16}+${band.y * 16}`,
      "-composite",
    );
  }

  recipe.furniture.forEach((placement, index) => {
    args.push(
      furnitureSources[index]!,
      "-geometry",
      `+${placement.x * 16}+${placement.y * 16}`,
      "-composite",
    );
  });

  args.push("-strip", dest);
  return args;
}

/**
 * Build ImageMagick argv that writes `dest` from `source` according to the step.
 * Exported for unit tests so frame sequencing stays deterministic without I/O.
 */
export function buildCurationConvertArgs(
  step: CurationStep,
  source: string,
  dest: string,
): string[] {
  const cropArgs = step.crop
    ? [
        "-crop",
        `${step.crop.width}x${step.crop.height}+${step.crop.x}+${step.crop.y}`,
        "+repage",
      ]
    : [];

  if (!step.frameSequence) {
    return [source, ...cropArgs, "-strip", dest];
  }

  const { frameWidth, frameHeight, indices } = step.frameSequence;
  if (indices.length === 0) {
    throw new UsageError("frameSequence.indices must contain at least one frame.");
  }

  // Load + optional crop into mpr:sheet, then clone named frames and append.
  // `-clone 0` is required; `+clone` inside later parentheses can latch onto a
  // prior 1-frame crop and fail geometry checks.
  const sequenceOps: string[] = [];
  for (const index of indices) {
    sequenceOps.push(
      "(",
      "mpr:sheet",
      "-crop",
      `${frameWidth}x${frameHeight}+${index * frameWidth}+0`,
      "+repage",
      ")",
    );
  }

  return [
    source,
    ...cropArgs,
    "-write",
    "mpr:sheet",
    "+delete",
    ...sequenceOps,
    "+append",
    "-strip",
    dest,
  ];
}

function curate(key: SourceArtKey, convertCmd: string[]): void {
  const step = CURATION[key];
  const source = resolveSource(step.source);
  const dest = outputPath(key);
  mkdirSync(path.dirname(dest), { recursive: true });

  const args = buildCurationConvertArgs(step, source, dest);
  execFileSync(convertCmd[0]!, [...convertCmd.slice(1), ...args], {
    stdio: "inherit",
  });

  const entry = ART[key];
  if (step.frameSequence) {
    const expectedFrames = step.frameSequence.indices.length;
    if (entry.frameCount !== expectedFrames) {
      throw new UsageError(
        `${key}: manifest frameCount ${entry.frameCount} does not match sequenced ${expectedFrames} frames.`,
      );
    }
    if (entry.expectedWidth !== step.frameSequence.frameWidth * expectedFrames) {
      throw new UsageError(
        `${key}: manifest expectedWidth ${entry.expectedWidth} does not match sequenced strip width.`,
      );
    }
  }

  console.error(
    `✓ ${key}: ${path.relative(PROJECT_ROOT, source)} → ${path.relative(PROJECT_ROOT, dest)}  (${step.note})`,
  );
}

/**
 * Confirm the recipe's COMMITTED tile size for each placement matches the real
 * PNG on disk.
 *
 * `validateRoomRecipe` runs without the pack, so it can only check that a
 * placement fits the room using the size the recipe claims. If that claim is
 * wrong the room still composites — the prop is just silently mis-sized and can
 * overhang the camera or collide with a neighbour. This is the only point in the
 * pipeline that has both numbers, so it is the only place the drift can be caught.
 */
function assertFurnitureGeometry(
  recipe: RoomCompositeRecipe,
  resolved: readonly string[],
  identifyCmd: string[],
): void {
  recipe.furniture.forEach((placement, index) => {
    const raw = execFileSync(
      identifyCmd[0]!,
      [...identifyCmd.slice(1), "-format", "%w %h", resolved[index]!],
      { encoding: "utf8" },
    );
    const [width, height] = raw.trim().split(/\s+/).map(Number);
    const expectedWidth = placement.widthTiles * 16;
    const expectedHeight = placement.heightTiles * 16;
    if (width !== expectedWidth || height !== expectedHeight) {
      throw new UsageError(
        `${recipe.key}: '${placement.source}' is ${width}×${height} on disk but the recipe `
          + `commits ${expectedWidth}×${expectedHeight} (${placement.widthTiles}×${placement.heightTiles} tiles). `
          + `Fix FURNITURE_TILE_SIZE in scripts/room-recipes.ts.`,
      );
    }
  });
}

/**
 * Confirm the COMMITTED shell luminance matches the real curated PNG.
 *
 * `validateRoomRecipe` checks §6 against `SHELL_TILE_LUMINANCE` so it can run
 * without the pack; this is the other half, and the same two-sided pattern as
 * `FURNITURE_TILE_SIZE`/`assertFurnitureGeometry`. A committed number nobody
 * re-measures is how the Δ 6 pairing shipped the first time.
 *
 * The `-colorspace sRGB` is load-bearing, not defensive: `wall-pale.png` is a
 * Grayscale-type PNG, and ImageMagick reports `mean.g`/`mean.b` as 0 for those.
 * Without the conversion this measures its luminance as 43 instead of 204.
 */
function assertShellLuminance(
  recipe: RoomCompositeRecipe,
  identifyCmd: string[],
): void {
  for (const [role, key] of [
    ["floor", recipe.floorArtKey],
    ["wall face", recipe.wallFaceArtKey],
  ] as const) {
    const committed = shellLuminance(key, recipe.key, role);
    const raw = execFileSync(
      identifyCmd[0]!,
      [
        ...identifyCmd.slice(1),
        "-colorspace",
        "sRGB",
        "-format",
        "%[fx:mean.r] %[fx:mean.g] %[fx:mean.b]",
        outputPath(key),
      ],
      { encoding: "utf8" },
    );
    const [r, g, b] = raw.trim().split(/\s+/).map(Number) as [number, number, number];
    const measured = (0.2126 * r + 0.7152 * g + 0.0722 * b) * 255;
    if (Math.abs(measured - committed) > LUMINANCE_TOLERANCE) {
      throw new UsageError(
        `${recipe.key}: ${role} tile '${key}' measures lum ${measured.toFixed(1)} on disk `
          + `but SHELL_TILE_LUMINANCE commits ${committed.toFixed(1)}. Re-measure and update `
          + `the table (and BRB_ART_DIRECTION.md §4) — the §6 contrast check is only as `
          + `good as these numbers.`,
      );
    }
  }
}

function curateRoom(
  key: RoomCompositeKey,
  convertCmd: string[],
  identifyCmd: string[],
): void {
  const recipe = ROOM_RECIPES[key];
  validateRoomRecipe(recipe);
  assertShellLuminance(recipe, identifyCmd);
  const dest = outputPath(key);
  mkdirSync(path.dirname(dest), { recursive: true });

  const furnitureSources = recipe.furniture.map((placement) =>
    resolveSource(placement.source));
  assertFurnitureGeometry(recipe, furnitureSources, identifyCmd);
  const args = buildRoomCompositeConvertArgs(
    recipe,
    {
      floor: outputPath(recipe.floorArtKey),
      wallFace: outputPath(recipe.wallFaceArtKey),
      wallCrown: outputPath(recipe.wallCrownArtKey),
    },
    furnitureSources,
    dest,
  );
  execFileSync(convertCmd[0]!, [...convertCmd.slice(1), ...args], {
    stdio: "inherit",
  });

  console.error(
    `✓ ${key}: ${recipe.widthTiles}×${recipe.heightTiles} tiles → ${path.relative(PROJECT_ROOT, dest)}  (${recipe.note})`,
  );
}

function main(): void {
  if (!existsSync(PACK_ROOT)) {
    throw new UsageError(
      `LimeZu source pack not found at '${PACK_ROOT}'.\n` +
        `  This script is RUN LOCALLY by a maintainer who owns the full-version pack.\n` +
        `  Place (or symlink) the pack at 'BRB Assets/' and retry. Outputs under\n` +
        `  'public/assets/brb/' are gitignored and never committed.`,
    );
  }

  const convertCmd = imageMagick("convert");
  const identifyCmd = imageMagick("identify");
  const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  const sourceKeys = Object.keys(CURATION) as SourceArtKey[];
  const allKeys: ArtKey[] = [...sourceKeys, ...ROOM_COMPOSITE_KEYS];

  const unknown = requested.filter((name) => !allKeys.includes(name as ArtKey));
  if (unknown.length) {
    throw new UsageError(
      `Unknown key(s): ${unknown.join(", ")}. Known keys: ${allKeys.join(", ")}`,
    );
  }

  const keys = requested.length ? (requested as ArtKey[]) : allKeys;
  let failures = 0;
  // A room composite is assembled from already-curated shell tiles on disk, so
  // every floor/wall tile its recipe names has to exist before it is built —
  // including when the caller asked for a single room by name.
  const requestedRooms = keys.filter((key) =>
    ROOM_COMPOSITE_KEYS.includes(key as RoomCompositeKey)) as RoomCompositeKey[];
  const prerequisites = new Set<SourceArtKey>();
  for (const room of requestedRooms) {
    const recipe = ROOM_RECIPES[room];
    prerequisites.add(recipe.floorArtKey as SourceArtKey);
    prerequisites.add(recipe.wallFaceArtKey as SourceArtKey);
    prerequisites.add(recipe.wallCrownArtKey as SourceArtKey);
  }
  for (const prerequisite of prerequisites) {
    if (!keys.includes(prerequisite) || !existsSync(outputPath(prerequisite))) {
      curate(prerequisite, convertCmd);
    }
  }

  for (const key of keys) {
    try {
      if (ROOM_COMPOSITE_KEYS.includes(key as RoomCompositeKey)) {
        curateRoom(key as RoomCompositeKey, convertCmd, identifyCmd);
      } else {
        curate(key as SourceArtKey, convertCmd);
      }
    } catch (error) {
      failures += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`✗ ${key}: ${message}`);
    }
  }

  console.error(
    `Curated ${keys.length - failures}/${keys.length} keys into ${path.relative(PROJECT_ROOT, PUBLIC_ROOT)}/assets/brb/.`,
  );
  if (failures > 0) process.exitCode = 1;
}

const isMainModule =
  typeof process.argv[1] === "string"
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  try {
    main();
  } catch (error) {
    if (error instanceof UsageError) {
      console.error(`\n${error.message}\n`);
      process.exit(1);
    }
    throw error;
  }
}
