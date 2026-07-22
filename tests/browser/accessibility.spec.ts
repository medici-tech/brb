import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import {
  createActiveRunFixture,
  installActiveRun,
  openReportFromReadyRun,
  openResourceRecovery,
  resumeInstalledRun,
} from "./fixtures";

async function expectNoAxeViolations(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const finiteAnimations = document.getAnimations().filter((animation) => {
      const iterations = animation.effect?.getTiming().iterations;
      return iterations !== Infinity;
    });
    await Promise.all(finiteAnimations.map((animation) => animation.finished.catch(() => undefined)));
  });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

test("Start screen supports keyboard navigation and passes an accessibility scan", async ({ page }) => {
  await page.goto("/");
  await expectNoAxeViolations(page);

  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await page.getByRole("button", { name: "How to Play" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Build the BRB without losing the state." })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("campaign and confirmation dialog pass accessibility scans", async ({ page }) => {
  await installActiveRun(page, createActiveRunFixture());
  await resumeInstalledRun(page);
  await expectNoAxeViolations(page);

  await openResourceRecovery(page);
  await page.getByRole("button", { name: /^Recover Money/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expectNoAxeViolations(page);
});

test("report and Archive pass accessibility scans", async ({ page }) => {
  await openReportFromReadyRun(page);
  await expectNoAxeViolations(page);

  await page.getByRole("button", { name: "Intelligence Archive" }).click();
  await expect(page.getByRole("heading", { name: "What has been witnessed cannot be unwitnessed." })).toBeVisible();
  await expectNoAxeViolations(page);
});

test("narrow layout avoids page-level overflow and reduced motion is honored", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-narrow", "Narrow-only presentation check");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await installActiveRun(page, createActiveRunFixture());
  await resumeInstalledRun(page);

  const layout = await page.evaluate(() => ({
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    activeAnimations: document.getAnimations().length,
  }));

  expect(layout.reducedMotion).toBe(true);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  expect(layout.activeAnimations).toBe(0);
  await expect(page.getByText("Consult one advisor before committing", { exact: true })).toBeVisible();
});
