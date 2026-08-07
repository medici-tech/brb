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
import { crc32, deflateSync } from "node:zlib";
import { afterEach, describe, expect, it } from "vitest";
import {
  CURATION,
  MIN_SHELL_CONTRAST,
  SHELL_TILE_LUMINANCE,
  buildCurationConvertArgs,
  buildRoomCompositeConvertArgs,
  validateRoomRecipe,
} from "../../scripts/curate-art.js";
import {
  ROOM_COMPOSITE_KEYS,
  ROOM_RECIPES,
} from "../../scripts/room-recipes.js";
import {
  ART_TARGET,
  findDuplicateArtPayloads,
  injectArt,
  prepareArt,
  readPngDimensions,
  validateArtDirectory,
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
  const chunk = (type: string, data: Buffer): Buffer => {
    const header = Buffer.alloc(8);
    header.writeUInt32BE(data.length, 0);
    header.write(type, 4, "ascii");
    const checksum = Buffer.alloc(4);
    checksum.writeUInt32BE(
      crc32(Buffer.concat([Buffer.from(type, "ascii"), data])) >>> 0,
      0,
    );
    return Buffer.concat([header, data, checksum]);
  };

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  const stride = width * 4 + 1;
  const pixels = Buffer.alloc(stride * height);
  for (let row = 0; row < height; row += 1) {
    pixels[row * stride] = 0;
  }
  pixels[1] = discriminator;
  pixels[4] = 255;

  return Buffer.concat([
    PNG_SIGNATURE,
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(pixels)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
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
        {
          floor: "/private/floor.png",
          wallFace: "/private/wall.png",
          wallCrown: "/private/wall-crown.png",
        },
        furniture,
        "/private/room.png",
      );
      expect(args.at(-2)).toBe("-strip");
      expect(args.at(-1)).toBe("/private/room.png");
      // Every room must carry at least one far-edge crown band; that band is
      // the only thing that makes the shell read as architecture.
      expect(recipe.wallBands.length).toBeGreaterThan(0);
      expect(args).toContain("tile:/private/wall-crown.png");
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

  it("rejects two baked props claiming the same tile", () => {
    const recipe = ROOM_RECIPES.roomFacility;
    const first = recipe.furniture[0]!;
    const invalid = {
      ...recipe,
      furniture: [first, { ...first, source: "other/prop.png" }],
    };

    expect(() => validateRoomRecipe(invalid)).toThrow(
      /baked furniture overlaps at tile/i,
    );
  });

  it("rejects an overlay anchor baked over by a prop", () => {
    const recipe = ROOM_RECIPES.roomFacility;
    const first = recipe.furniture[0]!;
    const invalid = {
      ...recipe,
      dynamicOverlayAnchors: { reserved: { x: first.x, y: first.y } },
      anchorsAllowedOverFurniture: [],
    };

    expect(() => validateRoomRecipe(invalid)).toThrow(
      /overlay anchor 'reserved'.+sits on baked/i,
    );
  });

  it("allows an anchor explicitly listed as meant to sit on furniture", () => {
    const recipe = ROOM_RECIPES.roomFacility;
    const first = recipe.furniture[0]!;
    const seated = {
      ...recipe,
      dynamicOverlayAnchors: { seated: { x: first.x, y: first.y } },
      anchorsAllowedOverFurniture: ["seated"],
    };

    expect(() => validateRoomRecipe(seated)).not.toThrow();
  });

  it("enforces the §6 contrast law on every shipped floor/wall pairing", () => {
    // The documented pairings, measured off the curated PNGs. §6 sets the floor
    // at 40 and the target at 60; all four clear the target.
    for (const key of ROOM_COMPOSITE_KEYS) {
      const recipe = ROOM_RECIPES[key];
      const floor = SHELL_TILE_LUMINANCE[recipe.floorArtKey];
      const wall = SHELL_TILE_LUMINANCE[recipe.wallFaceArtKey];
      expect(floor, `${key} floor luminance is committed`).toBeDefined();
      expect(wall, `${key} wall luminance is committed`).toBeDefined();
      expect(
        Math.abs(floor! - wall!),
        `${key} floor/wall contrast`,
      ).toBeGreaterThanOrEqual(60);
    }
  });

  it("rejects a floor and wall that disappear into each other", () => {
    // The regression §6 records twice: a pale wall (204) over a pale floor is
    // Δ 6 — structurally correct, visually identical to having no shell at all.
    const invalid = {
      ...ROOM_RECIPES.roomIntake,
      floorArtKey: "envWallPale",
    } as typeof ROOM_RECIPES.roomIntake;

    expect(() => validateRoomRecipe(invalid)).toThrow(
      new RegExp(`differ by only.+§6 requires Δ≥${MIN_SHELL_CONTRAST}`, "i"),
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

  it("rejects truncated and CRC-corrupt PNG payloads", () => {
    const complete = fakePng(16, 16);
    const truncated = complete.subarray(0, complete.length - 4);
    const corrupt = Buffer.from(complete);
    corrupt[20] = corrupt[20]! ^ 1;

    expect(() => readPngDimensions(truncated)).toThrow(
      /truncated|complete.+structure/i,
    );
    expect(() => readPngDimensions(corrupt)).toThrow(/crc/i);
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

  it("recognizes a complete local curation without reinjecting it", async () => {
    const root = makeTemporaryDirectory();
    const target = path.join(root, "public-assets-brb");
    writeFakePrivateSource(target);

    expect(validateArtDirectory(target)).toBe(Object.keys(ART).length);
    await expect(prepareArt({ targetRoot: target })).resolves.toEqual({
      mode: "licensed",
      origin: "local",
      count: Object.keys(ART).length,
    });
  });

  it("validates the installed runtime art when a local curation is present", () => {
    if (!existsSync(ART_TARGET)) return;
    expect(validateArtDirectory()).toBe(Object.keys(ART).length);
  });

  it("allows an absent art directory only when licensed art is not required", async () => {
    const root = makeTemporaryDirectory();
    const target = path.join(root, "public-assets-brb");

    await expect(prepareArt({ targetRoot: target })).resolves.toEqual({
      mode: "fallback",
      origin: "absent",
      count: 0,
    });
    await expect(
      prepareArt({ targetRoot: target, requireArt: true }),
    ).rejects.toThrow(/licensed art is required for visual qa/i);
  });

  it("rejects a partial local curation instead of mixing art and fallbacks", async () => {
    const root = makeTemporaryDirectory();
    const target = path.join(root, "public-assets-brb");
    writeFakePrivateSource(target, "envWall");

    expect(() => validateArtDirectory(target)).toThrow(
      /envWall: missing control-room\/environment\/wall\.png/i,
    );
    await expect(prepareArt({ targetRoot: target })).rejects.toThrow(
      /local curated art is incomplete or invalid/i,
    );
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
