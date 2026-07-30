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
  // Floor tile — single tileable floor from the room builder set.
  envFloor: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Floors_16x16.png",
    crop: { width: 16, height: 16, x: 128, y: 272 },
    note: "Muted blue-charcoal institutional floor → one opaque 16×16 tile.",
  },
  // Wall tile — single tileable wall from the room builder set.
  envWall: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Walls_16x16.png",
    // NOT the 16px-wide single at x=80: that block's outermost columns are painted
    // navy (#3A3A50) borders — verified x=80 and x=95 — so cropping it bakes a
    // separator into the tile and repeats a hard dark bar every 16px. Take the
    // interior of the 64px-wide run of the same wall on the same row instead.
    crop: { width: 16, height: 16, x: 16, y: 492 },
    note: "Neutral institutional wall panel, gutter-free interior → one opaque 16×16 tile.",
  },
  envRecordsShelfSparse: {
    source:
      "1_Interiors/16x16/Theme_Sorter_Black_Shadow_Singles/5_Classroom_and_Library_Black_Shadow_Singles_16x16/Classroom_and_Library_Singles_67.png",
    note: "Sparse records shelves → one static 32×48 black-shadow furniture single.",
  },
  envRecordsShelfFull: {
    source:
      "1_Interiors/16x16/Theme_Sorter_Black_Shadow_Singles/5_Classroom_and_Library_Black_Shadow_Singles_16x16/Classroom_and_Library_Singles_60.png",
    note: "Filled records shelves → one static 32×48 black-shadow furniture single.",
  },
  envRecordsShelfOverflow: {
    source:
      "1_Interiors/16x16/Theme_Sorter_Black_Shadow_Singles/5_Classroom_and_Library_Black_Shadow_Singles_16x16/Classroom_and_Library_Singles_74.png",
    note: "Overflow records shelves → one static 32×48 black-shadow furniture single.",
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

export function validateRoomRecipe(recipe: RoomCompositeRecipe): void {
  if (
    !Number.isInteger(recipe.widthTiles)
    || !Number.isInteger(recipe.heightTiles)
    || recipe.widthTiles <= 0
    || recipe.heightTiles <= 0
  ) {
    throw new UsageError(`${recipe.key}: room dimensions must be positive integers.`);
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
}

/**
 * ImageMagick arguments for one metadata-stripped room composite.
 * Exported so tests can verify the exact source-pixel contract without the pack.
 */
export function buildRoomCompositeConvertArgs(
  recipe: RoomCompositeRecipe,
  floorTile: string,
  wallTile: string,
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
  const args: string[] = ["-size", `${width}x${height}`, `tile:${floorTile}`];

  for (const wall of recipe.walls) {
    args.push(
      "(",
      "-size",
      `${wall.width * 16}x${wall.height * 16}`,
      `tile:${wallTile}`,
      ")",
      "-geometry",
      `+${wall.x * 16}+${wall.y * 16}`,
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

function curateRoom(key: RoomCompositeKey, convertCmd: string[]): void {
  const recipe = ROOM_RECIPES[key];
  validateRoomRecipe(recipe);
  const dest = outputPath(key);
  mkdirSync(path.dirname(dest), { recursive: true });

  const furnitureSources = recipe.furniture.map((placement) =>
    resolveSource(placement.source));
  const args = buildRoomCompositeConvertArgs(
    recipe,
    outputPath("envFloor"),
    outputPath("envWall"),
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
  const needsRoomPrerequisites = keys.some((key) =>
    ROOM_COMPOSITE_KEYS.includes(key as RoomCompositeKey));
  if (needsRoomPrerequisites) {
    for (const prerequisite of ["envFloor", "envWall"] as const) {
      if (!keys.includes(prerequisite) || !existsSync(outputPath(prerequisite))) {
        curate(prerequisite, convertCmd);
      }
    }
  }

  for (const key of keys) {
    try {
      if (ROOM_COMPOSITE_KEYS.includes(key as RoomCompositeKey)) {
        curateRoom(key as RoomCompositeKey, convertCmd);
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
