// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelSprite } from "../../src/components/brb/pixel/PixelSprite.js";

describe("PixelSprite", () => {
  it("renders the fallback when the sprite sheet fails to load", () => {
    const { container } = render(
      <PixelSprite
        artKey="staffAnalystIdle"
        fallback={<span data-testid="fallback">offline</span>}
      />,
    );

    // Optimistically the sprite box is present and the fallback is not shown yet.
    expect(screen.queryByTestId("fallback")).toBeNull();
    const probe = container.querySelector("img");
    expect(probe).not.toBeNull();

    // The gitignored/uninjected asset 404s → the probe fires `error`.
    fireEvent.error(probe!);

    expect(screen.getByTestId("fallback")).toBeInTheDocument();
  });

  it("keeps showing the sprite (no fallback) once the sheet loads", () => {
    const { container } = render(
      <PixelSprite
        artKey="staffAnalystIdle"
        label="Analyst on shift"
        fallback={<span data-testid="fallback">offline</span>}
      />,
    );

    fireEvent.load(container.querySelector("img")!);

    expect(screen.queryByTestId("fallback")).toBeNull();
    expect(
      screen.getByRole("img", { name: "Analyst on shift" }),
    ).toBeInTheDocument();
  });

  it("supports explicit sheet geometry and falls back on error", () => {
    const { container } = render(
      <PixelSprite
        src="/assets/brb/control-room/staff/does-not-exist.png"
        frameWidth={16}
        frameHeight={32}
        frameCount={6}
        fps={6}
        scale={3}
        fallback={<span data-testid="fallback-explicit">missing</span>}
      />,
    );

    fireEvent.error(container.querySelector("img")!);

    expect(screen.getByTestId("fallback-explicit")).toBeInTheDocument();
  });
});
