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
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { ART, type ArtKey } from "../src/game-art/manifest.js";

const PROJECT_ROOT = process.cwd();
const PACK_ROOT = path.join(PROJECT_ROOT, "BRB Assets");
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public");
const INTERIORS_PACK = "moderninteriors-win";

/** Pixel rectangle to crop out of the source sheet. */
type Crop = { readonly width: number; readonly height: number; readonly x: number; readonly y: number };

type CurationStep = {
  /** Source file, relative to `BRB Assets/` (INTERIORS_PACK prefix optional). */
  readonly source: string;
  /** Optional crop; omit to copy the source through unchanged. */
  readonly crop?: Crop;
  /** Human-readable provenance note for the log + future auditing. */
  readonly note: string;
};

/**
 * Curation table — one entry PER MANIFEST KEY. Sources are best-guess placeholders
 * a maintainer confirms against the pack (and against
 * `2_Characters/Character_Generator/Spritesheet_animations_GUIDE.png` for character
 * frame geometry). Crops assume the manifest geometry: character strips are 96x32
 * (16x32 × 6 frames) cut from a wider premade sheet.
 */
const CURATION: Record<ArtKey, CurationStep> = {
  // Wall of monitors — first 4 frames of an animated screen loop.
  monitorScreens: {
    source: "3_Animated_objects/16x16/spritesheets/Screen_animation.png",
    crop: { width: 128, height: 32, x: 0, y: 0 },
    note: "Animated screens loop → 4×(32×32) frames.",
  },
  // Server rack blink — first 4 frames of a tower/rack animation.
  monitorServer: {
    source: "3_Animated_objects/16x16/spritesheets/Computer_animation.png",
    crop: { width: 64, height: 32, x: 0, y: 0 },
    note: "Server/computer blink → 4×(16×32) frames.",
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
  staffStewardSeated: {
    source: "2_Characters/Character_Generator/0_Premade_Characters/16x16/Premade_Character_03.png",
    crop: { width: 96, height: 32, x: 0, y: 32 },
    note: "Premade char 03, front-idle strip (row y=32) → 6×(16×32).",
  },
  // Crossing pedestrian — a walk cycle strip, single facing.
  staffCrossingWalk: {
    source: "2_Characters/Character_Generator/0_Premade_Characters/16x16/Premade_Character_04.png",
    crop: { width: 96, height: 32, x: 0, y: 64 },
    note: "Premade char 04, walk-down strip (row y=64) → 6×(16×32).",
  },
  // Security camera — panning CCTV animation, first 4 frames.
  envSecurityCamera: {
    source: "3_Animated_objects/16x16/spritesheets/Security_camera_animation.png",
    crop: { width: 64, height: 16, x: 0, y: 0 },
    note: "CCTV pan → 4×(16×16) frames.",
  },
  // Conference desk — static prop from the conference-hall singles.
  envConferenceDesk: {
    source: "1_Interiors/16x16/Theme_Sorter_Singles/13_Conference_Hall_Singles/Conference_table.png",
    note: "Conference table single (static, ~48×32).",
  },
  // Floor tile — single tileable floor from the room builder set.
  envFloor: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Floors_16x16.png",
    crop: { width: 16, height: 16, x: 0, y: 0 },
    note: "Room builder floor → one 16×16 tile.",
  },
  // Wall tile — single tileable wall from the room builder set.
  envWall: {
    source: "1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Walls_16x16.png",
    crop: { width: 16, height: 16, x: 0, y: 0 },
    note: "Room builder wall → one 16×16 tile.",
  },
};

class UsageError extends Error {}

function imageMagick(subcommand: "convert" | "identify"): string[] {
  for (const candidate of [["magick", subcommand], [subcommand]]) {
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

function curate(key: ArtKey, convertCmd: string[]): void {
  const step = CURATION[key];
  const source = resolveSource(step.source);
  const dest = outputPath(key);
  mkdirSync(path.dirname(dest), { recursive: true });

  if (step.crop) {
    const { width, height, x, y } = step.crop;
    execFileSync(
      convertCmd[0]!,
      [
        ...convertCmd.slice(1),
        source,
        "-crop",
        `${width}x${height}+${x}+${y}`,
        "+repage",
        dest,
      ],
      { stdio: "inherit" },
    );
  } else {
    copyFileSync(source, dest);
  }

  console.error(
    `✓ ${key}: ${path.relative(PROJECT_ROOT, source)} → ${path.relative(PROJECT_ROOT, dest)}  (${step.note})`,
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
  const allKeys = Object.keys(CURATION) as ArtKey[];

  const unknown = requested.filter((name) => !allKeys.includes(name as ArtKey));
  if (unknown.length) {
    throw new UsageError(
      `Unknown key(s): ${unknown.join(", ")}. Known keys: ${allKeys.join(", ")}`,
    );
  }

  const keys = requested.length ? (requested as ArtKey[]) : allKeys;
  let failures = 0;
  for (const key of keys) {
    try {
      curate(key, convertCmd);
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

try {
  main();
} catch (error) {
  if (error instanceof UsageError) {
    console.error(`\n${error.message}\n`);
    process.exit(1);
  }
  throw error;
}
