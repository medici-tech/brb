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
import { ART, type ArtEntry } from "../src/game-art/manifest.js";

const PROJECT_ROOT = process.cwd();
const ART_TARGET = path.join(PROJECT_ROOT, "public", "assets", "brb");
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
    buffer.length < 24
    || !buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
    || buffer.toString("ascii", 12, 16) !== "IHDR"
  ) {
    throw new Error("file is not a valid PNG with an IHDR header");
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
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
    return entries.length;
  } finally {
    rmSync(stagingRoot, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  const source = process.env.BRB_ART_SOURCE?.trim();
  if (!source) {
    if (existsSync(ART_TARGET)) {
      console.error(
        "[inject-art] BRB_ART_SOURCE unset; using existing public/assets/brb/ (local curation).",
      );
    } else {
      console.error(
        "[inject-art] BRB_ART_SOURCE unset and no local art present — building with CSS fallbacks.",
      );
    }
    return;
  }

  const count = await injectArt(source, process.env.BRB_ART_TOKEN?.trim());
  console.error(`[inject-art] Validated and installed ${count} private art assets.`);
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
