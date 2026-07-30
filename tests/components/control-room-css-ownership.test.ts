import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CONTROL_ROOM = path.join(
  process.cwd(),
  "src/components/brb/control-room",
);
const PIXEL_ROOM = path.join(
  process.cwd(),
  "src/components/brb/pixel-room",
);

function read(file: string): string {
  return readFileSync(file, "utf8");
}

describe("orthographic control-room CSS contract", () => {
  it("contains no perspective camera or oversized sprite override", () => {
    const roomCss = readdirSync(CONTROL_ROOM)
      .filter((file) => file.endsWith(".css"))
      .map((file) => read(path.join(CONTROL_ROOM, file)))
      .join("\n");
    const rendererCss = read(path.join(PIXEL_ROOM, "PixelRoom.module.css"));
    const productionCss = `${roomCss}\n${rendererCss}`;

    expect(productionCss).not.toMatch(/\bperspective\s*\(/i);
    expect(productionCss).not.toMatch(/\brotate[XY]\s*\(/i);
    expect(productionCss).not.toMatch(/--sprite-scale-override:\s*[3-9]/);
  });

  it("scales only the complete room canvas by desktop 2x or narrow 1x", () => {
    const renderer = read(path.join(PIXEL_ROOM, "PixelRoom.module.css"));

    expect(renderer).toMatch(/--pixel-room-scale:\s*2/);
    expect(renderer).toMatch(/--pixel-room-scale:\s*1/);
    expect(renderer).toMatch(/transform:\s*scale\(var\(--pixel-room-scale\)\)/);
    expect(renderer).toMatch(/--sprite-scale-override:\s*1/);
  });

  it("keeps captions, monitor plates, and furniture CSS out of the room", () => {
    const component = read(
      path.join(CONTROL_ROOM, "ControlRoomPresentation.tsx"),
    );

    expect(component).toContain("<PixelRoom");
    expect(component).not.toMatch(
      /ambientCaption|monitorLabel|monitorChannel|operationsTable|advisorStation|corporateOverlay/,
    );
  });

  it("preserves reduced-motion behavior", () => {
    const presentation = read(
      path.join(CONTROL_ROOM, "ControlRoomPresentation.module.css"),
    );

    expect(presentation).toMatch(/\[data-motion="reduced"\]/);
    expect(presentation).toMatch(/prefers-reduced-motion:\s*reduce/);
  });

  it("keeps the dossier outside the full fixed camera at both integer scales", () => {
    const workspace = read(
      path.join(CONTROL_ROOM, "SituationWorkspace.module.css"),
    );

    expect(workspace).toMatch(/grid-template-columns:\s*704px/);
    expect(workspace).toMatch(/width:\s*704px/);
    expect(workspace).toMatch(/height:\s*448px/);
    expect(workspace).toMatch(/width:\s*352px/);
    expect(workspace).toMatch(/height:\s*224px/);
    expect(workspace).toMatch(/\.dossierColumn\s*\{[\s\S]*order:\s*1/);
    expect(workspace).toMatch(/\.sceneStage\s*\{[\s\S]*order:\s*2/);
    expect(workspace).not.toMatch(/margin:\s*-\d/);
    expect(workspace).not.toMatch(/max-height:\s*120px/);
  });
});
