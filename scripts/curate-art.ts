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

const PROJECT_ROOT = process.cwd();
const PACK_ROOT = path.join(PROJECT_ROOT, "BRB Assets");
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public");
const INTERIORS_PACK = "moderninteriors-win";

/** Pixel rectangle to crop out of the source sheet. */
type Crop = { readonly width: number; readonly height: number; readonly x: number; readonly y: number };

export type CurationStep = {
  /** Source file, relative to `BRB Assets/` (INTERIORS_PACK prefix optional). */
  readonly source: string;
  /** Optional crop; omit to copy the source through unchanged. */
  readonly crop?: Crop;
  /** Human-readable provenance note for the log + future auditing. */
  readonly note: string;
};

/**
 * Curation table — one entry per manifest key. These selections and crops were
 * verified against the supplied pack on 2026-07-29. Character strips are 96x32
 * (16x32 × 6 frames) cut from a wider premade sheet.
 */
export const CURATION: Record<ArtKey, CurationStep> = {
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
    source: "3_Animated_objects/16x16/spritesheets/animated_security_camera_right.png",
    note: "Right-facing CCTV pan → 10×(16×16) frames.",
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
    crop: { width: 16, height: 16, x: 192, y: 256 },
    note: "Neutral dark stone floor → one opaque 16×16 tile.",
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

function curate(key: ArtKey, convertCmd: string[]): void {
  const step = CURATION[key];
  const source = resolveSource(step.source);
  const dest = outputPath(key);
  mkdirSync(path.dirname(dest), { recursive: true });

  const cropArgs = step.crop
    ? [
        "-crop",
        `${step.crop.width}x${step.crop.height}+${step.crop.x}+${step.crop.y}`,
        "+repage",
      ]
    : [];
  execFileSync(
    convertCmd[0]!,
    [
      ...convertCmd.slice(1),
      source,
      ...cropArgs,
      "-strip",
      dest,
    ],
    { stdio: "inherit" },
  );

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
