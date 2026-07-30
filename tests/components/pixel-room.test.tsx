// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelRoom } from "../../src/components/brb/pixel-room/PixelRoom.js";
import { ROOM_DEFINITIONS } from "../../src/components/brb/pixel-room/roomDefinitions.js";

describe("PixelRoom", () => {
  it("renders a complete fixed-camera facility at source-pixel coordinates", () => {
    const { container } = render(
      <PixelRoom
        definition={ROOM_DEFINITIONS.facility}
        ariaLabel="Continuity facility, calm and fully staffed."
        actors={[
          {
            id: "analyst",
            artKey: "staffAnalystIdle",
            position: { x: 3, y: 6 },
          },
        ]}
        layers={[
          {
            id: "screens",
            artKey: "monitorScreens",
            position: { x: 3, y: 1 },
          },
        ]}
      />,
    );

    const room = screen.getByRole("img", {
      name: /continuity facility, calm/i,
    });
    expect(room).toHaveStyle({
      "--pixel-room-width": "352",
      "--pixel-room-height": "224",
    });
    expect(container.querySelector('[data-room-actor="analyst"]')).toHaveStyle({
      left: "48px",
      top: "96px",
    });
    expect(container.querySelector('[data-room-object="screens"]')).toHaveStyle({
      left: "48px",
      top: "16px",
    });
  });

  it("fails visually closed to a flat schematic when private room art is absent", () => {
    const { container } = render(
      <PixelRoom
        definition={ROOM_DEFINITIONS.intake}
        ariaLabel="Intake office."
      />,
    );

    const roomProbe = container.querySelector(
      'img[src="/assets/brb/control-room/rooms/intake-office.png"]',
    );
    expect(roomProbe).not.toBeNull();
    fireEvent.error(roomProbe!);
    expect(container.querySelector('[class*="schematic"]')).not.toBeNull();
  });

  it("keeps reduced motion and lighting state on the room boundary", () => {
    render(
      <PixelRoom
        definition={ROOM_DEFINITIONS.records}
        ariaLabel="Records office."
        lighting="crisis"
        reducedMotion
      />,
    );

    expect(screen.getByRole("img", { name: "Records office." })).toHaveAttribute(
      "data-lighting",
      "crisis",
    );
    expect(screen.getByRole("img", { name: "Records office." })).toHaveAttribute(
      "data-motion",
      "reduced",
    );
  });
});
