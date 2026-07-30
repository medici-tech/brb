import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ROOM_DEFINITIONS } from "@/components/brb/pixel-room/roomDefinitions";

const CONTROL_ROOM_PRESENTATION = path.join(
  process.cwd(),
  "src/components/brb/control-room/ControlRoomPresentation.tsx",
);
const PLAYER_ROOM_SCENE = path.join(
  process.cwd(),
  "src/components/brb/pixel-room/PlayerRoomScene.tsx",
);

function read(file: string): string {
  return readFileSync(file, "utf8");
}

describe("room anchors are the single source of tile positions", () => {
  it("keeps every declared anchor on an integer tile inside its room", () => {
    for (const room of Object.values(ROOM_DEFINITIONS)) {
      for (const [name, point] of Object.entries(room.anchors)) {
        const where = `${room.id}.${name}`;
        expect(Number.isInteger(point.x), `${where} x must be an integer`)
          .toBe(true);
        expect(Number.isInteger(point.y), `${where} y must be an integer`)
          .toBe(true);
        expect(point.x, `${where} x is outside the room`)
          .toBeGreaterThanOrEqual(0);
        expect(point.y, `${where} y is outside the room`)
          .toBeGreaterThanOrEqual(0);
        expect(point.x, `${where} x is outside the room`)
          .toBeLessThan(room.widthTiles);
        expect(point.y, `${where} y is outside the room`)
          .toBeLessThan(room.heightTiles);
      }
      for (const zone of room.lightingZones) {
        expect(Number.isInteger(zone.position.x)).toBe(true);
        expect(Number.isInteger(zone.position.y)).toBe(true);
        expect(zone.position.x + zone.widthTiles).toBeLessThanOrEqual(
          room.widthTiles,
        );
        expect(zone.position.y + zone.heightTiles).toBeLessThanOrEqual(
          room.heightTiles,
        );
      }
    }
  });

  it("renders the facility from anchors rather than duplicated literals", () => {
    const source = read(CONTROL_ROOM_PRESENTATION);

    expect(source).toContain("ROOM_DEFINITIONS.facility");
    expect(source).toMatch(/const AT = FACILITY\.anchors/);
    // A literal here would silently diverge from the declared anchor.
    expect(source).not.toMatch(/position:\s*at\(/);
    expect(source).not.toMatch(/position:\s*\{\s*x:/);
  });

  it("renders intake and records scenes from anchors", () => {
    const source = read(PLAYER_ROOM_SCENE);

    expect(source).toContain("ROOM_DEFINITIONS.intake.anchors");
    expect(source).toContain("ROOM_DEFINITIONS.records.anchors");
    expect(source).not.toMatch(/position:\s*\{\s*x:/);
    expect(ROOM_DEFINITIONS.records.anchors).toMatchObject({
      shelfA: { x: 3, y: 2 },
      shelfB: { x: 6, y: 2 },
      shelfC: { x: 9, y: 2 },
    });
  });

  it("declares an anchor for every facility sprite the room places", () => {
    const anchors = ROOM_DEFINITIONS.facility.anchors;
    const required = [
      "monitorBank",
      "serverBank",
      "securityCamera",
      "analyst",
      "operator",
      "steward",
      "corridorLeft",
      "corridorRight",
      "corporationDoor",
      "corporationTerminal",
      "corporationOfficer",
      "brbMachine",
      "brbServerA",
      "brbServerB",
      "clutterA",
      "clutterB",
      "equipmentClutter",
      "damageA",
      "damageB",
    ] as const;

    for (const name of required) {
      expect(anchors, `facility is missing the ${name} anchor`)
        .toHaveProperty(name);
    }
  });
});
