/**
 * Build-time private art injection.
 *
 * `BRB_ART_SOURCE` may be:
 *   - a local curated directory whose root contains `control-room/...`, or
 *   - an HTTPS base URL with the same layout.
 *
 * `BRB_ART_TOKEN` is optional and is sent as a bearer token for HTTPS sources.
 * When no source is configured the script is deliberately a no-op so the public
 * repository builds with CSS fallbacks. Once a source is explicitly configured,
 * every manifest asset is required and validated before it is installed.
 */

import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { crc32 } from "node:zlib";
import { ART, type ArtEntry } from "../src/game-art/manifest.js";

const PROJECT_ROOT = process.cwd();
export const ART_TARGET = path.join(PROJECT_ROOT, "public", "assets", "brb");
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export type PngDimensions = {
  readonly width: number;
  readonly height: number;
};

export type ArtPayload = {
  readonly key: string;
  readonly bytes: Uint8Array;
};

export function findDuplicateArtPayloads(
  payloads: readonly ArtPayload[],
): string[][] {
  const byHash = new Map<string, string[]>();
  for (const payload of payloads) {
    const hash = createHash("sha256").update(payload.bytes).digest("hex");
    const keys = byHash.get(hash) ?? [];
    keys.push(payload.key);
    byHash.set(hash, keys);
  }
  return [...byHash.values()].filter((keys) => keys.length > 1);
}

export function readPngDimensions(bytes: Uint8Array): PngDimensions {
  const buffer = Buffer.from(bytes);
  if (
    buffer.length < 33
    || !buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
  ) {
    throw new Error("file is not a valid PNG");
  }

  let offset = PNG_SIGNATURE.length;
  let dimensions: PngDimensions | null = null;
  let sawImageData = false;
  let sawEnd = false;

  while (offset < buffer.length) {
    if (offset + 12 > buffer.length) {
      throw new Error("PNG contains a truncated chunk header");
    }

    const length = buffer.readUInt32BE(offset);
    const typeStart = offset + 4;
    const dataStart = typeStart + 4;
    const dataEnd = dataStart + length;
    const chunkEnd = dataEnd + 4;
    if (chunkEnd > buffer.length) {
      throw new Error("PNG contains a truncated chunk payload");
    }

    const type = buffer.toString("ascii", typeStart, dataStart);
    const expectedCrc = buffer.readUInt32BE(dataEnd);
    const actualCrc = crc32(buffer.subarray(typeStart, dataEnd)) >>> 0;
    if (actualCrc !== expectedCrc) {
      throw new Error(`PNG ${type} chunk failed its CRC check`);
    }

    if (dimensions === null) {
      if (type !== "IHDR" || length !== 13) {
        throw new Error("PNG must begin with a 13-byte IHDR chunk");
      }
      const width = buffer.readUInt32BE(dataStart);
      const height = buffer.readUInt32BE(dataStart + 4);
      if (width === 0 || height === 0) {
        throw new Error("PNG dimensions must be positive");
      }
      dimensions = { width, height };
    } else if (type === "IHDR") {
      throw new Error("PNG contains more than one IHDR chunk");
    }

    if (type === "IDAT") sawImageData = true;
    if (type === "IEND") {
      if (length !== 0) {
        throw new Error("PNG IEND chunk must be empty");
      }
      if (!sawImageData) {
        throw new Error("PNG contains no image data");
      }
      if (chunkEnd !== buffer.length) {
        throw new Error("PNG contains trailing data after IEND");
      }
      sawEnd = true;
    }

    offset = chunkEnd;
    if (sawEnd) break;
  }

  if (!dimensions || !sawEnd) {
    throw new Error("PNG is missing a complete IHDR/IDAT/IEND structure");
  }

  return dimensions;
}

export function validateArtPng(entry: ArtEntry, bytes: Uint8Array): void {
  const dimensions = readPngDimensions(bytes);
  if (
    dimensions.width !== entry.expectedWidth
    || dimensions.height !== entry.expectedHeight
  ) {
    throw new Error(
      `${entry.key} expected ${entry.expectedWidth}×${entry.expectedHeight}, `
      + `received ${dimensions.width}×${dimensions.height}`,
    );
  }

  if (entry.frameWidth * entry.frameCount !== entry.expectedWidth) {
    throw new Error(
      `${entry.key} manifest geometry does not span its expected width`,
    );
  }
  if (entry.frameHeight !== entry.expectedHeight) {
    throw new Error(
      `${entry.key} manifest frame height does not match its expected height`,
    );
  }
}

function relativeAssetPath(entry: ArtEntry): string {
  const prefix = "/assets/brb/";
  if (!entry.src.startsWith(prefix)) {
    throw new Error(`${entry.key} is outside the private BRB art root`);
  }
  return entry.src.slice(prefix.length);
}

function isHttpsSource(source: string): boolean {
  return source.startsWith("https://");
}

/**
 * Validate an already-curated runtime directory against the complete manifest.
 *
 * An absent directory is a supported fallback mode, but a directory that exists
 * must be complete. This prevents development from quietly mixing licensed art
 * with per-sprite fallbacks after a partial curation or interrupted copy.
 */
export function validateArtDirectory(targetRoot = ART_TARGET): number {
  if (!existsSync(targetRoot)) {
    throw new Error(`curated art directory is absent: ${targetRoot}`);
  }

  const payloads: ArtPayload[] = [];
  const problems: string[] = [];

  for (const entry of Object.values(ART)) {
    const relativePath = relativeAssetPath(entry);
    const file = path.join(targetRoot, relativePath);
    if (!existsSync(file)) {
      problems.push(`${entry.key}: missing ${relativePath}`);
      continue;
    }

    try {
      const bytes = readFileSync(file);
      validateArtPng(entry, bytes);
      payloads.push({ key: entry.key, bytes });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      problems.push(`${entry.key}: ${message}`);
    }
  }

  const duplicates = findDuplicateArtPayloads(payloads);
  if (duplicates.length > 0) {
    problems.push(
      `duplicate payloads: ${duplicates
        .map((keys) => keys.join(" = "))
        .join("; ")}`,
    );
  }

  if (problems.length > 0) {
    throw new Error(
      `local curated art is incomplete or invalid:\n- ${problems.join("\n- ")}`,
    );
  }

  return Object.keys(ART).length;
}

async function loadAsset(
  source: string,
  relativePath: string,
  token?: string,
): Promise<Buffer> {
  if (!isHttpsSource(source)) {
    const sourcePath = path.resolve(PROJECT_ROOT, source, relativePath);
    if (!existsSync(sourcePath)) {
      throw new Error(`missing local asset: ${sourcePath}`);
    }
    return readFileSync(sourcePath);
  }

  const url = new URL(relativePath, `${source.replace(/\/+$/, "")}/`);
  const response = await fetch(
    url,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  );
  if (!response.ok) {
    throw new Error(`GET ${url.toString()} returned ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function injectArt(
  source: string,
  token = "",
  targetRoot = ART_TARGET,
): Promise<number> {
  if (!source.trim()) {
    throw new Error("art source must not be empty");
  }
  if (/^https?:\/\//.test(source) && !isHttpsSource(source)) {
    throw new Error("remote BRB_ART_SOURCE must use HTTPS");
  }

  const stagingRoot = mkdtempSync(path.join(os.tmpdir(), "brb-art-inject-"));
  const entries = Object.values(ART);
  const payloads: ArtPayload[] = [];

  try {
    for (const entry of entries) {
      const relativePath = relativeAssetPath(entry);
      const bytes = await loadAsset(source, relativePath, token || undefined);
      validateArtPng(entry, bytes);
      payloads.push({ key: entry.key, bytes });

      const stagedPath = path.join(stagingRoot, relativePath);
      mkdirSync(path.dirname(stagedPath), { recursive: true });
      writeFileSync(stagedPath, bytes);
    }

    const duplicates = findDuplicateArtPayloads(payloads);
    if (duplicates.length > 0) {
      throw new Error(
        `duplicate art payloads detected: ${duplicates
          .map((keys) => keys.join(" = "))
          .join("; ")}`,
      );
    }

    mkdirSync(path.dirname(targetRoot), { recursive: true });
    rmSync(targetRoot, { recursive: true, force: true });
    cpSync(stagingRoot, targetRoot, { recursive: true });
    return validateArtDirectory(targetRoot);
  } finally {
    rmSync(stagingRoot, { recursive: true, force: true });
  }
}

export type ArtDeliveryResult =
  | {
    readonly mode: "licensed";
    readonly origin: "injected" | "local";
    readonly count: number;
  }
  | {
    readonly mode: "fallback";
    readonly origin: "absent";
    readonly count: 0;
  };

type PrepareArtOptions = {
  readonly source?: string | undefined;
  readonly token?: string | undefined;
  readonly targetRoot?: string;
  readonly requireArt?: boolean;
};

export async function prepareArt({
  source,
  token = "",
  targetRoot = ART_TARGET,
  requireArt = false,
}: PrepareArtOptions = {}): Promise<ArtDeliveryResult> {
  const configuredSource = source?.trim();
  if (configuredSource) {
    const count = await injectArt(configuredSource, token.trim(), targetRoot);
    return { mode: "licensed", origin: "injected", count };
  }

  if (existsSync(targetRoot)) {
    const count = validateArtDirectory(targetRoot);
    return { mode: "licensed", origin: "local", count };
  }

  if (requireArt) {
    throw new Error(
      "licensed art is required for visual QA, but public/assets/brb/ is absent. "
      + "Run `npm run art:curate` or configure BRB_ART_SOURCE, then try again.",
    );
  }

  return { mode: "fallback", origin: "absent", count: 0 };
}

function printDeliveryStatus(result: ArtDeliveryResult): void {
  if (result.mode === "licensed") {
    const sourceLabel =
      result.origin === "injected" ? "private source" : "local curation";
    console.error(
      `[inject-art] LICENSED ART READY — validated ${result.count}/${Object.keys(ART).length} `
      + `manifest assets from ${sourceLabel}.`,
    );
    return;
  }

  console.error(
    [
      "[inject-art] ============================================================",
      "[inject-art] FALLBACK ART MODE — licensed sprites are not loaded.",
      "[inject-art] The app can run, but this session is not valid for artwork",
      "[inject-art] or animation QA. Run `npm run art:curate` (local pack) or",
      "[inject-art] configure BRB_ART_SOURCE, then run `npm run art:verify`.",
      "[inject-art] ============================================================",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const statusOnly = process.argv.includes("--status");
  const result = await prepareArt({
    // Status is deliberately read-only: it reports the currently installed
    // runtime tree even when a private injection source is configured.
    source: statusOnly ? undefined : process.env.BRB_ART_SOURCE,
    token: statusOnly ? undefined : process.env.BRB_ART_TOKEN,
    requireArt: process.argv.includes("--require"),
  });
  printDeliveryStatus(result);
}

const isMainModule =
  typeof process.argv[1] === "string"
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[inject-art] ${message}`);
    process.exitCode = 1;
  });
}
