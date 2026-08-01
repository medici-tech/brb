// @vitest-environment happy-dom

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelSprite } from "../../src/components/brb/pixel/PixelSprite.js";

describe("Tempo modulation CSS", () => {
  function renderInTempoHost(tempo: string, motion: "full" | "reduced" = "full") {
    const host = document.createElement("div");
    host.setAttribute("data-tempo", tempo);
    host.setAttribute("data-motion", motion);
    document.body.appendChild(host);
    const view = render(
      <PixelSprite artKey="staffAnalystIdle" frameOffset={2} />,
      { container: host },
    );
    fireEvent.load(host.querySelector("img")!);
    const sprite = () => host.querySelector("span");
    return { host, view, sprite };
  }

  describe("reading tempo (1.85x slower)", () => {
    it("sprite animates under reading tempo with full motion", async () => {
      const { sprite } = renderInTempoHost("reading", "full");
      const el = sprite();
      expect(el).not.toBeNull();
      expect(el?.className).toContain("animated");
    });
  });

  describe("response tempo (0.85x faster)", () => {
    it("sprite animates under response tempo", async () => {
      const { sprite } = renderInTempoHost("response", "full");
      const el = sprite();
      expect(el).not.toBeNull();
      expect(el?.className).toContain("animated");
    });
  });

  describe("critical tempo (0.7x faster)", () => {
    it("sprite animates under critical tempo", async () => {
      const { sprite } = renderInTempoHost("critical", "full");
      const el = sprite();
      expect(el).not.toBeNull();
      expect(el?.className).toContain("animated");
    });
  });

  describe("ambient tempo (default 1x)", () => {
    it("sprite animates under ambient tempo", async () => {
      const { sprite } = renderInTempoHost("ambient", "full");
      const el = sprite();
      expect(el).not.toBeNull();
      expect(el?.className).toContain("animated");
    });
  });

  describe("still tempo (frozen)", () => {
    it("sprite is animated class but CSS freezes it", async () => {
      const { sprite } = renderInTempoHost("still", "full");
      const el = sprite();
      expect(el).not.toBeNull();
      expect(el?.className).toContain("animated");
    });

    it("sprite has frozen frame style set", async () => {
      const { sprite } = renderInTempoHost("still", "full");
      const el = sprite();
      const style = el?.getAttribute("style") ?? "";
      expect(style).toContain("--sprite-frozen-frame: 2");
    });
  });

  describe("reduced motion interaction", () => {
    it("sprite does not animate under reduced motion regardless of tempo", async () => {
      const { sprite } = renderInTempoHost("ambient", "reduced");
      const el = sprite();
      expect(el?.className).not.toContain("animated");
    });

    it("reading tempo with reduced motion still freezes animation", async () => {
      const { sprite } = renderInTempoHost("reading", "reduced");
      const el = sprite();
      expect(el?.className).not.toContain("animated");
    });
  });
});

describe("Tempo CSS variable presence", () => {
  it("reading tempo sets --room-tempo via CSS (source verification)", async () => {
    const css = await import("fs").then((fs) =>
      fs.readFileSync(
        "src/components/brb/pixel/PixelSprite.module.css",
        "utf-8",
      ));
    expect(css).toContain('[data-tempo="reading"]');
    expect(css).toContain("--room-tempo: 1.85");
  });

  it("response tempo sets --room-tempo via CSS", async () => {
    const css = await import("fs").then((fs) =>
      fs.readFileSync(
        "src/components/brb/pixel/PixelSprite.module.css",
        "utf-8",
      ));
    expect(css).toContain('[data-tempo="response"]');
    expect(css).toContain("--room-tempo: 0.85");
  });

  it("critical tempo sets --room-tempo via CSS", async () => {
    const css = await import("fs").then((fs) =>
      fs.readFileSync(
        "src/components/brb/pixel/PixelSprite.module.css",
        "utf-8",
      ));
    expect(css).toContain('[data-tempo="critical"]');
    expect(css).toContain("--room-tempo: 0.7");
  });

  it("still tempo disables animation via CSS", async () => {
    const css = await import("fs").then((fs) =>
      fs.readFileSync(
        "src/components/brb/pixel/PixelSprite.module.css",
        "utf-8",
      ));
    expect(css).toContain('[data-tempo="still"]');
    expect(css).toContain("animation: none !important");
  });
});
