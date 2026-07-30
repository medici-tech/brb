import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  CURATION,
  buildCurationConvertArgs,
  buildRoomCompositeConvertArgs,
  validateRoomRecipe,
} from "../../scripts/curate-art.js";
import {
  ROOM_COMPOSITE_KEYS,
  ROOM_RECIPES,
} from "../../scripts/room-recipes.js";
import {
  findDuplicateArtPayloads,
  injectArt,
  readPngDimensions,
  validateArtPng,
} from "../../scripts/inject-art.js";
import { ART } from "../../src/game-art/manifest.js";

const temporaryDirectories: string[] = [];
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function makeTemporaryDirectory(): string {
  const directory = mkdtempSync(path.join(os.tmpdir(), "brb-art-test-"));
  temporaryDirectories.push(directory);
  return directory;
}

function fakePng(width: number, height: number, discriminator = 0): Buffer {
  const bytes = Buffer.alloc(25);
  PNG_SIGNATURE.copy(bytes, 0);
  bytes.write("IHDR", 12, "ascii");
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  bytes[24] = discriminator;
  return bytes;
}

function writeFakePrivateSource(root: string, omitKey?: string): void {
  Object.values(ART).forEach((entry, index) => {
    if (entry.key === omitKey) return;
    const relativePath = entry.src.replace(/^\/assets\/brb\//, "");
    const file = path.join(root, relativePath);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(
      file,
      fakePng(entry.expectedWidth, entry.expectedHeight, index + 1),
    );
  });
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("BRB art pipeline", () => {
  it("keeps manifest and curator coverage one-to-one", () => {
    expect(
      [...Object.keys(CURATION), ...ROOM_COMPOSITE_KEYS].sort(),
    ).toEqual(Object.keys(ART).sort());
    expect(new Set(Object.values(ART).map((entry) => entry.src)).size).toBe(
      Object.keys(ART).length,
    );
  });

  it("keeps every room recipe on the 16px grid and inside its manifest frame", () => {
    for (const key of ROOM_COMPOSITE_KEYS) {
      const recipe = ROOM_RECIPES[key];
      expect(() => validateRoomRecipe(recipe)).not.toThrow();
      expect(ART[key].expectedWidth).toBe(recipe.widthTiles * 16);
      expect(ART[key].expectedHeight).toBe(recipe.heightTiles * 16);

      const furniture = recipe.furniture.map(
        (_, index) => `/private/furniture-${index}.png`,
      );
      const args = buildRoomCompositeConvertArgs(
        recipe,
        "/private/floor.png",
        "/private/wall.png",
        furniture,
        "/private/room.png",
      );
      expect(args.at(-2)).toBe("-strip");
      expect(args.at(-1)).toBe("/private/room.png");
      for (const placement of recipe.furniture) {
        expect(Number.isInteger(placement.x)).toBe(true);
        expect(Number.isInteger(placement.y)).toBe(true);
        expect(Number.isInteger(placement.widthTiles)).toBe(true);
        expect(Number.isInteger(placement.heightTiles)).toBe(true);
        expect(placement.x + placement.widthTiles).toBeLessThanOrEqual(
          recipe.widthTiles,
        );
        expect(placement.y + placement.heightTiles).toBeLessThanOrEqual(
          recipe.heightTiles,
        );
      }
      expect(recipe.lightingZones).not.toHaveLength(0);
    }
  });

  it("rejects furniture when any part of its source extends past the camera", () => {
    const recipe = ROOM_RECIPES.roomFacility;
    const first = recipe.furniture[0]!;
    const invalid = {
      ...recipe,
      furniture: [
        {
          ...first,
          x: recipe.widthTiles - first.widthTiles + 1,
        },
      ],
    };

    expect(() => validateRoomRecipe(invalid)).toThrow(
      /furniture.+falls outside the room/i,
    );
  });

  it("sequences security-camera frames with the supplied endpoint holds", () => {
    const step = CURATION.envSecurityCamera;
    expect(step.frameSequence?.indices).toEqual([
      0, 0, 0, 0, 0, 1, 2, 3, 4,
      5, 5, 5, 5, 5, 6, 7, 8, 9,
    ]);
    expect(ART.envSecurityCamera.frameCount).toBe(18);
    expect(ART.envSecurityCamera.fps).toBe(10);
    expect(ART.envSecurityCamera.expectedWidth).toBe(288);

    const args = buildCurationConvertArgs(
      step,
      "/tmp/source-camera.png",
      "/tmp/out-camera.png",
    );
    expect(args).toContain("+append");
    expect(args).toContain("mpr:sheet");
    expect(args.filter((part) => part === "mpr:sheet")).toHaveLength(19);
  });

  it("curates distinct left and right crossing walk strips", () => {
    expect(CURATION.staffCrossingWalkRight.crop).toEqual({
      width: 96,
      height: 32,
      x: 0,
      y: 128,
    });
    expect(CURATION.staffCrossingWalkLeft.crop).toEqual({
      width: 96,
      height: 32,
      x: 0,
      y: 160,
    });
    expect(ART.staffCrossingWalkRight.src).not.toEqual(
      ART.staffCrossingWalkLeft.src,
    );
  });

  it("describes complete horizontal sprite strips", () => {
    for (const entry of Object.values(ART)) {
      expect(entry.frameWidth * entry.frameCount).toBe(entry.expectedWidth);
      expect(entry.frameHeight).toBe(entry.expectedHeight);
      expect(Number.isInteger(entry.scale)).toBe(true);
      expect(entry.scale).toBeGreaterThan(0);
    }
  });

  it("reads and validates PNG geometry without ImageMagick", () => {
    const entry = ART.monitorScreens;
    const bytes = fakePng(entry.expectedWidth, entry.expectedHeight);

    expect(readPngDimensions(bytes)).toEqual({ width: 704, height: 48 });
    expect(() => validateArtPng(entry, bytes)).not.toThrow();
    expect(() => validateArtPng(entry, fakePng(64, 48))).toThrow(
      /expected 704×48/i,
    );
    expect(() => readPngDimensions(Buffer.from("not a png"))).toThrow(
      /not a valid png/i,
    );
  });

  it("detects duplicate binary payloads", () => {
    const same = fakePng(16, 16);
    expect(
      findDuplicateArtPayloads([
        { key: "floor", bytes: same },
        { key: "wall", bytes: same },
        { key: "camera", bytes: fakePng(16, 16, 1) },
      ]),
    ).toEqual([["floor", "wall"]]);
  });

  it("injects and validates a complete local private source", async () => {
    const root = makeTemporaryDirectory();
    const source = path.join(root, "source");
    const target = path.join(root, "public-assets-brb");
    writeFakePrivateSource(source);

    await expect(injectArt(source, "", target)).resolves.toBe(
      Object.keys(ART).length,
    );
    for (const entry of Object.values(ART)) {
      const installed = path.join(
        target,
        entry.src.replace(/^\/assets\/brb\//, ""),
      );
      expect(existsSync(installed)).toBe(true);
      expect(readFileSync(installed).length).toBeGreaterThanOrEqual(24);
    }
  });

  it("fails closed when a configured source is incomplete", async () => {
    const root = makeTemporaryDirectory();
    const source = path.join(root, "source");
    const target = path.join(root, "public-assets-brb");
    writeFakePrivateSource(source, "envWall");

    await expect(injectArt(source, "", target)).rejects.toThrow(
      /missing local asset/i,
    );
    expect(existsSync(target)).toBe(false);
  });
});
