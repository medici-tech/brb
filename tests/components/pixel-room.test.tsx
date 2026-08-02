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

  it("gives co-located sprites distinct, deterministic loop phases", () => {
    const layers = [
      { id: "a", artKey: "monitorServer", position: { x: 3, y: 1 } },
      { id: "b", artKey: "monitorServer", position: { x: 4, y: 1 } },
      { id: "c", artKey: "monitorServer", position: { x: 5, y: 1 } },
    ] as const;
    const renderRoom = () =>
      render(
        <PixelRoom
          definition={ROOM_DEFINITIONS.facility}
          ariaLabel="Continuity facility."
          layers={[...layers]}
        />,
      );

    const first = renderRoom();
    const phases = [...layers].map(
      (layer) =>
        first.container
          .querySelector<HTMLElement>(`[data-room-object="${layer.id}"]`)!
          .style.getPropertyValue("--sprite-phase"),
    );

    // Identical sheets mounted in the same frame must not share a phase, or the
    // whole bank blinks as one object.
    expect(new Set(phases).size).toBe(phases.length);
    for (const phase of phases) {
      expect(Number(phase)).toBeGreaterThanOrEqual(0);
      expect(Number(phase)).toBeLessThan(1);
    }

    // Derived from the tile, not randomised: a re-render — and the server's
    // markup during hydration — must produce the same offsets.
    first.unmount();
    const second = renderRoom();
    expect(
      [...layers].map(
        (layer) =>
          second.container
            .querySelector<HTMLElement>(`[data-room-object="${layer.id}"]`)!
            .style.getPropertyValue("--sprite-phase"),
      ),
    ).toEqual(phases);
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
