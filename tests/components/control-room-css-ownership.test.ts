import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CONTROL_ROOM = path.join(
  process.cwd(),
  "src/components/brb/control-room",
);

function readCss(fileName: string): string {
  return readFileSync(path.join(CONTROL_ROOM, fileName), "utf8");
}

describe("control-room CSS ownership", () => {
  it("keeps presentation-state selectors out of the base presentation module", () => {
    const presentation = readCss("ControlRoomPresentation.module.css");
    const state = readCss("roomState.module.css");

    expect(presentation).not.toMatch(
      /\.presentation\[data-presentation-state=/,
    );
    expect(presentation).not.toMatch(/\.presentation\[data-focus=/);
    expect(state).toMatch(/\.stateSurface\[data-presentation-state=/);
    expect(state).toMatch(/\.stateSurface\[data-focus=/);
  });

  it("keeps lighting and prop modules free of presentation-state cascades", () => {
    const lighting = readCss("roomLighting.module.css");
    const props = readCss("roomProps.module.css");

    expect(lighting).not.toMatch(/data-presentation-state=/);
    expect(props).not.toMatch(/data-presentation-state=/);
    expect(lighting).toMatch(/\.layerLight/);
    expect(props).toMatch(/\.deskEdge/);
  });

  it("preserves reduced-motion kill switch and integer sprite scale overrides", () => {
    const presentation = readCss("ControlRoomPresentation.module.css");
    const props = readCss("roomProps.module.css");

    expect(presentation).toMatch(/\[data-motion="reduced"\]/);
    expect(presentation).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(presentation).toMatch(/--sprite-scale-override:\s*[234]/);
    expect(props).toMatch(/--sprite-scale-override:\s*6/);
  });
});
