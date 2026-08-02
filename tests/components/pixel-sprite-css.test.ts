import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const spriteCss = readFileSync(
  path.join(
    process.cwd(),
    "src/components/brb/pixel/PixelSprite.module.css",
  ),
  "utf8",
);
const globalCss = readFileSync(
  path.join(process.cwd(), "src/app/globals.css"),
  "utf8",
);

describe("PixelSprite CSS animation contract", () => {
  it("scopes the keyframe with the CSS Module class that references it", () => {
    expect(spriteCss).toMatch(
      /\.animated\s*\{[\s\S]*animation-name:\s*brb-pixel-sprite/,
    );
    expect(spriteCss).toMatch(
      /@keyframes brb-pixel-sprite[\s\S]*to\s*\{\s*background-position-x:\s*var\(--pixel-sprite-travel,\s*0px\)/,
    );
    expect(globalCss).not.toMatch(/@keyframes brb-pixel-sprite/);
  });

  it("retains stepped timing and deliberate frozen poses", () => {
    expect(spriteCss).toMatch(
      /\.animated\s*\{[\s\S]*animation-duration:\s*calc\(var\(--sprite-duration\)\s*\*\s*var\(--room-tempo,\s*1\)\)/,
    );
    expect(spriteCss).toMatch(
      /background-position-x:\s*calc\(var\(--sprite-w\)\s*\*\s*var\(--sprite-frozen-frame\)\s*\*\s*-1\)/,
    );
    expect(spriteCss).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*animation:\s*none\s*!important/,
    );
  });

  it("seeks each sheet into its own loop so a room does not blink in unison", () => {
    // Negative delay = seek into the cycle. A positive one would hold every
    // sprite on frame 0 and then release them together, which is the exact
    // lockstep this is meant to break.
    expect(spriteCss).toMatch(
      /animation-delay:\s*calc\([\s\S]*var\(--sprite-phase,\s*0\)\s*\*\s*-1\s*\)/,
    );
    // The phase has to scale with the same tempo as the duration, or a slowed
    // "reading" loop would be seeked by a full-speed offset.
    expect(spriteCss).toMatch(
      /animation-delay:\s*calc\(\s*var\(--sprite-duration\)\s*\*\s*var\(--room-tempo,\s*1\)/,
    );
  });
});
