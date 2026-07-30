// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PixelSprite } from "../../src/components/brb/pixel/PixelSprite.js";

describe("PixelSprite", () => {
  it("renders the fallback when the sprite sheet fails to load", () => {
    const { container } = render(
      <PixelSprite
        artKey="staffAnalystIdle"
        fallback={<span data-testid="fallback">offline</span>}
      />,
    );

    const probe = container.querySelector("img");
    expect(probe).not.toBeNull();

    // Happy DOM settles unknown images as complete with zero width, which is the
    // same fail-closed state as a browser 404 that lands before React observes it.
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
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

  it("freezes on the requested frame when reduced motion is enabled", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });

    const { container } = render(
      <PixelSprite
        artKey="envSecurityCamera"
        frameOffset={4}
        label="Frozen security camera"
      />,
    );
    fireEvent.load(container.querySelector("img")!);

    const sprite = screen.getByRole("img", { name: "Frozen security camera" });
    await waitFor(() => {
      expect(sprite).toHaveStyle({ "--sprite-frozen-frame": "4" });
      expect(sprite.className).not.toContain("animated");
    });
  });

  it("reports load state so a parent can choose art-aware framing", async () => {
    const onLoadStateChange = vi.fn();
    const { container } = render(
      <PixelSprite
        artKey="monitorScreens"
        onLoadStateChange={onLoadStateChange}
      />,
    );

    await waitFor(() => {
      expect(onLoadStateChange).toHaveBeenCalledWith("pending");
    });
    fireEvent.load(container.querySelector("img")!);
    await waitFor(() => {
      expect(onLoadStateChange).toHaveBeenCalledWith("loaded");
    });
  });

  it("recognizes a cached image that completed before its load event was observed", async () => {
    const onLoadStateChange = vi.fn();
    const geometry = {
      frameWidth: 16,
      frameHeight: 16,
      frameCount: 1,
      fps: 0,
      scale: 1,
    };
    const { container, rerender } = render(
      <PixelSprite
        src="/assets/brb/control-room/environment/cache-a.png"
        {...geometry}
        onLoadStateChange={onLoadStateChange}
      />,
    );
    const probe = container.querySelector("img")!;
    Object.defineProperty(probe, "complete", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(probe, "naturalWidth", {
      configurable: true,
      value: 16,
    });

    rerender(
      <PixelSprite
        src="/assets/brb/control-room/environment/cache-b.png"
        {...geometry}
        onLoadStateChange={onLoadStateChange}
      />,
    );

    await waitFor(() => {
      expect(onLoadStateChange).toHaveBeenCalledWith("loaded");
    });
  });
});
