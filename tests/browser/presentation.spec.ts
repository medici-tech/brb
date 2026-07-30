import { expect, test, type Page } from "@playwright/test";
import {
  createActiveRunFixture,
  installActiveRun,
  openReportFromReadyRun,
  openResourceRecovery,
  resumeInstalledRun,
} from "./fixtures";

/**
 * The three faces bundled by `next/font/local` in src/app/layout.tsx. Next
 * generates these family names itself — they are reachable ONLY through the
 * --font-brb-display/-body/-mono variables.
 *
 * This suite exists because naming the real families ("IBM Plex Sans") in CSS
 * matches nothing and silently falls back to a system font. That defect shipped
 * unnoticed: every screen rendered in San Francisco while the CSS claimed
 * otherwise. Computed styles are the only place the bug is visible, so the
 * guard has to live in the browser suite.
 */
const APPROVED_FACES = ["displayFont", "bodyFont", "monoFont"];

async function collectOffBrandFaces(page: Page): Promise<string[]> {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate((approved) => {
    const offBrand = new Set<string>();
    for (const element of document.querySelectorAll("body *")) {
      if (!element.textContent?.trim()) continue;
      if (element.getAttribute("aria-hidden") === "true") continue;
      const resolved = getComputedStyle(element).fontFamily;
      const first = resolved.split(",")[0].trim().replace(/^["']|["']$/g, "");
      if (!approved.includes(first)) {
        offBrand.add(`${first} on <${element.tagName.toLowerCase()}>`);
      }
    }
    return [...offBrand];
  }, APPROVED_FACES);
}

test("every screen renders only the three approved faces", async ({ page }) => {
  await page.goto("/");
  expect(await collectOffBrandFaces(page)).toEqual([]);

  await page.getByRole("button", { name: "How to Play" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await collectOffBrandFaces(page)).toEqual([]);
  await page.keyboard.press("Escape");

  await installActiveRun(page, createActiveRunFixture());
  await resumeInstalledRun(page);
  expect(await collectOffBrandFaces(page)).toEqual([]);

  await openResourceRecovery(page);
  await page.getByRole("button", { name: /^Recover Money/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await collectOffBrandFaces(page)).toEqual([]);
});

test("report and Archive render only the three approved faces", async ({ page }) => {
  await openReportFromReadyRun(page);
  expect(await collectOffBrandFaces(page)).toEqual([]);

  await page.getByRole("button", { name: "Intelligence Archive" }).click();
  await expect(
    page.getByRole("heading", { name: "What has been witnessed cannot be unwitnessed." }),
  ).toBeVisible();
  expect(await collectOffBrandFaces(page)).toEqual([]);
});

test("internal playtest tools render only the three approved faces", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Internal Playtest" }).click();
  await expect(
    page.getByRole("heading", { name: "Play consistently. Record the moments that matter." }),
  ).toBeVisible();
  expect(await collectOffBrandFaces(page)).toEqual([]);
});
