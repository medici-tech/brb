import { expect, test } from "@playwright/test";
import { createActiveRunFixture, installActiveRun, resumeInstalledRun } from "../../tests/browser/fixtures";

const CASES = [
  { w: 1280, scale: 2, host: 704 },
  { w: 1440, scale: 2, host: 704 },
  { w: 1599, scale: 2, host: 704 },
  { w: 1600, scale: 3, host: 1056 },
  { w: 1920, scale: 3, host: 1056 },
];

for (const c of CASES) {
  test(`camera tier at ${c.w}px is exactly ${c.scale}x`, async ({ page }) => {
    await page.setViewportSize({ width: c.w, height: 950 });
    await installActiveRun(page, createActiveRunFixture());
    await resumeInstalledRun(page);
    const room = page.locator("[data-pixel-room]").first();
    const got = await room.evaluate((el) => {
      const m = new DOMMatrixReadOnly(getComputedStyle(el.firstElementChild!).transform);
      return { host: Math.round(el.getBoundingClientRect().width), scale: +m.a.toFixed(3) };
    });
    expect(got).toEqual({ host: c.host, scale: c.scale });
    // No layout may overflow the page at any tier.
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
  });
}
