// @vitest-environment happy-dom

import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelSprite } from "../../src/components/brb/pixel/PixelSprite.js";

/**
 * Regression cover for a bug that silently froze EVERY sprite in the control room.
 *
 * `useReducedMotion` returns `true` from its server snapshot, so the presentation's
 * first client render emits `data-motion="reduced"`. `PixelSprite` used to read that
 * ancestor once in a `[]`-dependency effect, latching "reduced" forever — it never
 * saw the flip to `"full"` after hydration settled. The DOM said animate; React
 * state said frozen, and no test caught it because the markup still looked right.
 *
 * These assertions are about the ATTRIBUTE FLIP, not the initial state.
 */
describe("PixelSprite reduced-motion tracking", () => {
  function renderInHost(initialMotion: "full" | "reduced") {
    const host = document.createElement("div");
    host.setAttribute("data-motion", initialMotion);
    document.body.appendChild(host);
    const view = render(
      <PixelSprite artKey="staffAnalystIdle" frameOffset={2} />,
      { container: host },
    );
    fireEvent.load(host.querySelector("img")!);
    const sprite = () => host.querySelector("span");
    return { host, view, sprite };
  }

  const isAnimated = (el: Element | null) =>
    Boolean(el?.className.includes("animated"));

  it("starts animating when the ancestor is already data-motion='full'", async () => {
    const { sprite } = renderInHost("full");
    await waitFor(() => expect(isAnimated(sprite())).toBe(true));
  });

  it("does not animate under a data-motion='reduced' ancestor", async () => {
    const { sprite } = renderInHost("reduced");
    await waitFor(() => expect(isAnimated(sprite())).toBe(false));
  });

  it("resumes when the ancestor flips reduced -> full after mount", async () => {
    // This is the exact hydration sequence that produced the bug.
    const { host, sprite } = renderInHost("reduced");
    await waitFor(() => expect(isAnimated(sprite())).toBe(false));

    host.setAttribute("data-motion", "full");

    await waitFor(() => expect(isAnimated(sprite())).toBe(true));
  });

  it("freezes again when the ancestor flips full -> reduced after mount", async () => {
    const { host, sprite } = renderInHost("full");
    await waitFor(() => expect(isAnimated(sprite())).toBe(true));

    host.setAttribute("data-motion", "reduced");

    await waitFor(() => expect(isAnimated(sprite())).toBe(false));
  });

  it("exposes the frozen pose and sheet geometry as CSS custom properties", () => {
    // Sizing must stay in CSS so breakpoints can retune the scale by whole
    // numbers. The component may only publish the raw source numbers, and the
    // scale must be a BASE — writing `--sprite-scale` inline would outrank every
    // stylesheet rule and make responsive scaling impossible.
    const { sprite } = renderInHost("full");
    const style = sprite()?.getAttribute("style") ?? "";

    expect(style).toContain("--sprite-frame-w: 16");
    expect(style).toContain("--sprite-frame-h: 32");
    expect(style).toContain("--sprite-frames: 6");
    expect(style).toContain("--sprite-scale-base: 3");
    expect(style).toContain("--sprite-frozen-frame: 2");
    expect(style).toContain("--sprite-duration: 1s");
    expect(style).not.toContain("animation-duration:");
    expect(style).not.toMatch(/--sprite-scale:/);
    // No computed pixel sizes leak from JS.
    expect(style).not.toMatch(/width:\s*\d+px/);
  });
});
