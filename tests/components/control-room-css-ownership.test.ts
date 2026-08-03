import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ENDING_IDS } from "../../src/game/types.js";

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

  it("gives every ending a visual treatment", () => {
    // TypeScript cannot see CSS, so the total Record<EndingId, ...> maps in the
    // resolver cannot catch an ending that has a grade but no rule. This is the
    // only guard for that, and it is the gap the advisor endings fell through.
    const presentation = read(
      path.join(CONTROL_ROOM, "ControlRoomPresentation.module.css"),
    );
    for (const endingId of ENDING_IDS) {
      expect(
        presentation.includes(`[data-ending="${endingId}"]`),
        `no [data-ending="${endingId}"] rule in ControlRoomPresentation.module.css`,
      ).toBe(true);
    }
    expect(presentation).toMatch(/\[data-authority="seized"\]/);
    expect(presentation).toMatch(/\[data-authority="shared"\]/);
    // A takeover fires while the Corporation is "embedded", so the gold sheen
    // must be explicitly cancelled or the room reads as the wrong loss.
    expect(presentation).toMatch(
      /\[data-authority="seized"\]::before[\s\S]*?\[data-authority="shared"\]::before/,
    );
    // The holder glow must come after the subordinate dim, which outranks it.
    expect(
      presentation.indexOf("filter: brightness(0.58) saturate(0.5);"),
    ).toBeLessThan(
      presentation.lastIndexOf('[data-authority-holders~="analyst"]'),
    );

    // Every holder selector must carry the same
    // `[data-authority]:not([data-authority-holders="none"])` prefix as the
    // rest-dim. Without it the holder rule is one selector LESS specific than
    // the dim, so the held station is dimmed with everything else and the
    // takeover renders with no pool of light at all — which no rendering test
    // catches, because the attributes are still correct.
    for (const holder of ["analyst", "fixer", "steward"]) {
      const selector = `[data-authority-holders~="${holder}"]`;
      for (const occurrence of presentation
        .split("\n")
        .filter((line) => line.includes(selector))) {
        expect(
          occurrence.includes('[data-authority]:not([data-authority-holders="none"])'),
          `${selector} must match the rest-dim specificity, got: ${occurrence.trim()}`,
        ).toBe(true);
      }
    }
  });

  it("gives the advisor endings a page-shell treatment", () => {
    const tableau = read(
      path.join(process.cwd(), "src/components/brb/EndingTableauView.module.css"),
    );
    expect(tableau).toMatch(/\[data-ending-tableau="advisor_coup"\]/);
    expect(tableau).toMatch(/\[data-ending-tableau="advisor_cabal"\]/);
    // Rebinding --signal would silently restyle the primary action button,
    // which uses it as a background with dark text.
    expect(tableau).not.toMatch(/\[data-ending-tableau[^{]*\{[^}]*--signal:/);
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
    // Third tier for wide displays. 1056 is 352 x 3 exactly; a non-integer
    // multiple here would resample every sprite in the room.
    expect(workspace).toMatch(/@media \(min-width:\s*1600px\)/);
    expect(workspace).toMatch(/grid-template-columns:\s*1056px/);
    expect(workspace).toMatch(/width:\s*1056px/);
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
