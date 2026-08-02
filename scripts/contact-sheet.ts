/**
 * Contact-sheet generator for the LimeZu source pack (RUN LOCALLY ONLY).
 *
 * Builds labeled montage grids from selected `BRB Assets/...` folders into
 * `scratchpad/contact-sheets/` so a human can eyeball candidate tiles/characters
 * before curating them into runtime assets (see `scripts/curate-art.ts`).
 *
 * The LimeZu pack is redistribution-restricted and lives ONLY on the maintainer's
 * machine (gitignored `BRB Assets/`, ~886MB). This script is never run in CI and
 * never commits binaries — it only reads the local pack and writes to the gitignored
 * `scratchpad/` directory. It shells out to ImageMagick (`magick`/`montage`,
 * `magick`/`convert`); nothing here runs without the pack + ImageMagick present.
 *
 * Usage:
 *   tsx scripts/contact-sheet.ts            # build every configured group
 *   tsx scripts/contact-sheet.ts characters-16   # build a single group by name
 *   tsx scripts/contact-sheet.ts --list     # list configured group names
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const PACK_ROOT = path.join(PROJECT_ROOT, "BRB Assets");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "scratchpad", "contact-sheets");
// The Modern Interiors pack root; candidate folders that omit this prefix are
// resolved relative to it as a fallback (see resolveSource).
const INTERIORS_PACK = "moderninteriors-win";

type ContactSheetGroup = {
  /** Output sheet base name (also the CLI selector). */
  readonly name: string;
  /** Source folder, relative to `BRB Assets/` (INTERIORS_PACK prefix optional). */
  readonly source: string;
  /**
   * When set, every PNG in the source is treated as a GIANT sheet and sliced into
   * `slice`x`slice` px cells before montaging. Leave unset for folders that already
   * contain individual singles.
   */
  readonly slice?: number;
  /** Integer upscale factor applied to each tile (pixel-art safe, nearest-neighbour). */
  readonly upscale: number;
  /** Recurse into subfolders when collecting PNGs. */
  readonly recursive?: boolean;
};

/**
 * Candidate folders to survey. Paths mirror the task brief; those without a pack
 * prefix are resolved under `moderninteriors-win/` if not found at the pack root.
 */
const GROUPS: readonly ContactSheetGroup[] = [
  {
    name: "characters-16",
    source: "2_Characters/Character_Generator/0_Premade_Characters/16x16",
    upscale: 4,
  },
  {
    name: "characters-32",
    source: "2_Characters/Character_Generator/0_Premade_Characters/32x32",
    upscale: 3,
  },
  {
    name: "characters-48",
    source: "2_Characters/Character_Generator/0_Premade_Characters/48x48",
    upscale: 2,
  },
  {
    name: "conference-hall",
    source: "1_Interiors/16x16/Theme_Sorter_Singles/13_Conference_Hall_Singles",
    upscale: 4,
    recursive: true,
  },
  {
    name: "room-builder",
    source: "1_Interiors/16x16/Room_Builder_subfiles",
    upscale: 4,
    recursive: true,
  },
  {
    name: "animated-objects",
    source: "3_Animated_objects/16x16/spritesheets",
    // These are large animation strips — slice into 16px cells first.
    slice: 16,
    upscale: 4,
  },
  {
    name: "ui-elements",
    source: "4_User_Interface_Elements",
    upscale: 3,
    recursive: true,
  },
  {
    name: "modern-exteriors",
    source: "modernexteriors-win/Modern_Exteriors_16x16",
    upscale: 3,
    recursive: true,
  },
  {
    name: "palettes",
    source: "moderninteriors-win/Palettes",
    upscale: 4,
    recursive: true,
  },
];

class UsageError extends Error {}

/** True if an ImageMagick sub-command is available; supports IM7 (`magick x`) and IM6 (`x`). */
function imageMagick(subcommand: "montage" | "convert" | "identify"): string[] {
  for (const candidate of [["magick", subcommand], [subcommand]]) {
    try {
      execFileSync(candidate[0]!, [...candidate.slice(1), "--version"], {
        stdio: "ignore",
      });
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
    `Source folder not found for group: '${source}'.\n` +
      `  Looked in: ${direct}\n` +
      `        and: ${nested}\n` +
      `  Confirm the LimeZu pack layout under 'BRB Assets/'.`,
  );
}

function collectPngs(dir: string, recursive: boolean): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) out.push(...collectPngs(full, recursive));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      out.push(full);
    }
  }
  return out.sort();
}

/** Slice every source PNG into `slice`px cells inside a temp dir; returns the cell files. */
function sliceSheets(
  convertCmd: string[],
  pngs: string[],
  slice: number,
  tempDir: string,
): string[] {
  mkdirSync(tempDir, { recursive: true });
  const cells: string[] = [];
  pngs.forEach((png, index) => {
    const prefix = path.join(tempDir, `sheet${String(index).padStart(3, "0")}`);
    // -crop AxA +repage cuts a giant sheet into a grid of A×A tiles.
    execFileSync(
      convertCmd[0]!,
      [
        ...convertCmd.slice(1),
        png,
        "-crop",
        `${slice}x${slice}`,
        "+repage",
        `${prefix}_%04d.png`,
      ],
      { stdio: "inherit" },
    );
    for (const file of readdirSync(tempDir)) {
      if (file.startsWith(path.basename(prefix)) && file.endsWith(".png")) {
        cells.push(path.join(tempDir, file));
      }
    }
  });
  return cells.sort();
}

// Homebrew ImageMagick on macOS ships without a configured default font, so
// `montage -label` aborts with "unable to read font". Pick the first system font
// that exists and pass it explicitly; if none is found, labels are dropped rather
// than failing the whole sheet.
const LABEL_FONT = [
  "/System/Library/Fonts/Monaco.ttf",
  "/System/Library/Fonts/Menlo.ttc",
  "/System/Library/Fonts/Supplemental/Arial.ttf",
  "/Library/Fonts/Arial.ttf",
].find((candidate) => existsSync(candidate));

function buildGroup(group: ContactSheetGroup): void {
  const sourceDir = resolveSource(group.source);
  const montageCmd = imageMagick("montage");

  mkdirSync(OUTPUT_DIR, { recursive: true });

  let tiles = collectPngs(sourceDir, group.recursive ?? false);
  if (tiles.length === 0) {
    console.warn(`No PNGs found for group '${group.name}' in ${sourceDir}; skipping.`);
    return;
  }

  const tempDir = path.join(OUTPUT_DIR, `.tmp-${group.name}`);
  if (group.slice) {
    const convertCmd = imageMagick("convert");
    tiles = sliceSheets(convertCmd, tiles, group.slice, tempDir);
    if (tiles.length === 0) {
      console.warn(`Slicing produced no cells for group '${group.name}'; skipping.`);
      return;
    }
  }

  const outFile = path.join(OUTPUT_DIR, `${group.name}.png`);
  // `-background none` keeps transparency; `-label %f` prints each filename beneath
  // its tile; geometry with a scale keeps upscaled pixels crisp via `-filter point`.
  const args = [
    ...montageCmd.slice(1),
    "-background",
    "none",
    "-filter",
    "point",
    ...(LABEL_FONT ? ["-font", LABEL_FONT] : []),
    "-label",
    "%f",
    "-tile",
    "8x",
    "-geometry",
    `${group.upscale * 100}%x${group.upscale * 100}%+6+6`,
    ...tiles,
    outFile,
  ];

  console.error(
    `Montaging ${tiles.length} tiles for '${group.name}' → ${path.relative(PROJECT_ROOT, outFile)}`,
  );
  execFileSync(montageCmd[0]!, args, { stdio: "inherit" });

  if (group.slice && existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes("--list")) {
    console.log(GROUPS.map((group) => group.name).join("\n"));
    return;
  }

  if (!existsSync(PACK_ROOT)) {
    throw new UsageError(
      `LimeZu source pack not found at '${PACK_ROOT}'.\n` +
        `  This script is RUN LOCALLY by a maintainer who owns the full-version pack.\n` +
        `  Place (or symlink) the pack at 'BRB Assets/' and retry. It is never committed.`,
    );
  }

  const selected = args.filter((arg) => !arg.startsWith("--"));
  const groups = selected.length
    ? GROUPS.filter((group) => selected.includes(group.name))
    : GROUPS;

  if (selected.length && groups.length !== selected.length) {
    const known = GROUPS.map((group) => group.name).join(", ");
    const unknown = selected.filter(
      (name) => !GROUPS.some((group) => group.name === name),
    );
    throw new UsageError(`Unknown group(s): ${unknown.join(", ")}. Known groups: ${known}`);
  }

  for (const group of groups) {
    try {
      buildGroup(group);
    } catch (error) {
      if (error instanceof UsageError) {
        console.error(`✗ ${group.name}: ${error.message}`);
      } else {
        throw error;
      }
    }
  }

  console.error(`Contact sheets written to ${path.relative(PROJECT_ROOT, OUTPUT_DIR)}/`);
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
