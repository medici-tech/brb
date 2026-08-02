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

  it("scales the complete room canvas and fit-scales instead of cropping", () => {
    const renderer = read(path.join(PIXEL_ROOM, "PixelRoom.module.css"));

    expect(renderer).toMatch(/--pixel-room-scale:\s*2/);
    expect(renderer).toMatch(/--pixel-room-scale:\s*1/);
    expect(renderer).toMatch(/container-type:\s*inline-size/);
    // The fit is still measured off the container, but it is no longer applied
    // raw: an upscale must land on a whole number or every sprite resamples.
    expect(renderer).toMatch(
      /--pixel-room-fit:\s*calc\(100cqi\s*\/\s*\(var\(--pixel-room-width\)\s*\*\s*1px\)\)/,
    );
    expect(renderer).toMatch(
      /transform:\s*scale\(var\(--pixel-room-render-scale\)\)/,
    );
    expect(renderer).toMatch(
      /round\(down,\s*var\(--pixel-room-fit\),\s*1\)/,
    );
    // Shrinking below 1× must stay continuous — the next integer step down is
    // 0.5×, which would halve the room on a phone.
    expect(renderer).toMatch(/min\(var\(--pixel-room-fit\),\s*1\)/);
    // The unsnapped fit has to survive as the fallback for engines without
    // `round()`, or the declaration drops and the room renders at 1×.
    expect(renderer).toMatch(
      /--pixel-room-render-scale:\s*var\(--pixel-room-fit\)/,
    );
    expect(renderer).toMatch(/aspect-ratio:\s*var\(--pixel-room-width\)/);
    expect(renderer).toMatch(/--sprite-scale-override:\s*1/);
    expect(renderer).toMatch(/@media \(max-width:\s*1180px\)/);
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

  it("keeps the complete fixed camera outside the dossier and leads with the phone feed", () => {
    const workspace = read(
      path.join(CONTROL_ROOM, "SituationWorkspace.module.css"),
    );

    expect(workspace).toMatch(/grid-template-columns:\s*704px/);
    expect(workspace).toMatch(/width:\s*704px/);
    expect(workspace).toMatch(/aspect-ratio:\s*352\s*\/\s*224/);
    expect(workspace).toMatch(/width:\s*352px/);
    expect(workspace).toMatch(/width:\s*min\(100%,\s*352px\)/);
    expect(workspace).toMatch(/\.dossierColumn\s*\{[\s\S]*order:\s*2/);
    expect(workspace).toMatch(/\.sceneStage\s*\{[\s\S]*order:\s*1/);
    expect(workspace).not.toMatch(/margin:\s*-\d/);
    expect(workspace).not.toMatch(/aspect-ratio:\s*auto/);
    expect(workspace).not.toMatch(/max-height:\s*120px/);
    expect(workspace).not.toMatch(/\.sceneStage\s*\{[^}]*border:\s*1px/);
  });

  it("slows ambient loops while reading and freezes still tempo on a pose", () => {
    const spriteCss = read(
      path.join(process.cwd(), "src/components/brb/pixel/PixelSprite.module.css"),
    );

    expect(spriteCss).toMatch(
      // Must keep a local class: a bare :global(...) block fails the CSS Modules
      // purity check and breaks `next build`.
      /\[data-tempo="reading"\]\)\s+\.animated\s*\{\s*--room-tempo:/,
    );
    expect(spriteCss).not.toMatch(/data-room-part/);
    expect(spriteCss).toMatch(
      /\[data-tempo="still"\]\)\s*\.animated\s*\{[\s\S]*animation:\s*none/,
    );
    expect(spriteCss).toMatch(/--sprite-frozen-frame/);
  });

  it("keeps narrative rooms orthographic and free of actor labels", () => {
    const narrativeRoot = path.join(
      process.cwd(),
      "src/components/brb/narrative",
    );
    const narrativeCss = read(
      path.join(narrativeRoot, "NarrativeScene.module.css"),
    );
    const narrativeComponent = read(
      path.join(narrativeRoot, "NarrativeScene.tsx"),
    );

    expect(narrativeCss).not.toMatch(/\bperspective\s*\(/i);
    expect(narrativeCss).not.toMatch(/\brotate[XY]\s*\(/i);
    expect(narrativeCss).not.toMatch(/--sprite-scale-override:\s*[2-9]/);
    expect(narrativeCss).not.toMatch(
      /\[data-room-object=[^\]]+\][^{]*\{[^}]*filter:/,
    );
    expect(narrativeComponent).not.toMatch(/<small>\{actor\.label\}<\/small>/);
    expect(narrativeComponent).toContain("<PixelRoom");
    expect(narrativeComponent).toContain("envOversightBroadcast");
    expect(narrativeComponent).not.toMatch(/data-focus-[xy]/);
  });

  it("wires reduced motion through player-facing room scenes", () => {
    const playerScene = read(
      path.join(PIXEL_ROOM, "PlayerRoomScene.tsx"),
    );

    expect(playerScene).toContain("useReducedMotion");
    expect(playerScene).toMatch(/reducedMotion=\{reducedMotion\}/);
  });
});
