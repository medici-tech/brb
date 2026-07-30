import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  createIgnoredSituationFixture,
  installActiveRun,
  resumeInstalledRun,
} from "./fixtures";

const SITUATION_TITLE = "The Missing Appropriation";
const FIRST_ACTION = /^Cut public programs/;

async function commitBudgetCut(page: Page): Promise<Locator> {
  await page.getByRole("button", { name: FIRST_ACTION }).click();

  const confirmation = page.getByRole("dialog");
  await expect(
    confirmation.getByRole("heading", {
      name: `Resolve “${SITUATION_TITLE}” with “Cut public programs”?`,
    }),
  ).toBeVisible();
  await confirmation
    .getByRole("button", { name: "Authorize and end Month 1" })
    .click();

  const aftermath = page.getByRole("dialog");
  await expect(
    aftermath.getByRole("heading", {
      name: "The campaign moved. Now it pushes back.",
    }),
  ).toBeVisible();
  return aftermath;
}

async function expectWithinViewport(
  locator: Locator,
  viewport: { width: number; height: number },
): Promise<void> {
  const bounds = await locator.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) return;

  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
}

test(
  "keeps the Situation actionable at 1280×720 and supports stepped aftermath controls",
  async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-desktop",
      "Desktop narrative journey and viewport contract",
    );

    const viewport = { width: 1280, height: 720 };
    await page.setViewportSize(viewport);
    await installActiveRun(page, createIgnoredSituationFixture());
    await resumeInstalledRun(page);

    const title = page.getByRole("heading", {
      name: SITUATION_TITLE,
      exact: true,
    });
    const firstAction = page.getByRole("button", { name: FIRST_ACTION });
    await expect(title).toBeVisible();
    await expect(firstAction).toBeVisible();
    await expectWithinViewport(title, viewport);
    await expectWithinViewport(firstAction, viewport);

    const aftermath = await commitBudgetCut(page);
    const scene = aftermath.locator("[data-aftermath-step]");
    await expect(scene).toHaveAttribute("data-aftermath-step", "setup");
    await expect(
      aftermath.getByText("The appropriation arrives incomplete", {
        exact: true,
      }),
    ).toBeVisible();

    await aftermath.getByRole("button", { name: "Next beat" }).click();
    await expect(scene).toHaveAttribute("data-aftermath-step", "action");
    await expect(
      aftermath.getByText("Programs leave the page", { exact: true }),
    ).toBeVisible();

    await aftermath.getByRole("button", { name: "Previous beat" }).focus();
    await page.keyboard.press("Enter");
    await expect(scene).toHaveAttribute("data-aftermath-step", "setup");

    await aftermath.getByRole("button", { name: "Skip to consequence" }).focus();
    await page.keyboard.press("Enter");
    await expect(scene).toHaveAttribute("data-aftermath-step", "consequence");
    await expect(
      aftermath.getByText("The project is funded in an empty room", {
        exact: true,
      }),
    ).toBeVisible();

    await aftermath.getByRole("button", { name: "Previous beat" }).click();
    await expect(scene).toHaveAttribute("data-aftermath-step", "action");
    await aftermath.getByRole("button", { name: "Skip to consequence" }).click();
    await expect(scene).toHaveAttribute("data-aftermath-step", "consequence");
    await expect(
      aftermath.getByText("Visual consequence entered into the record.", {
        exact: true,
      }),
    ).toBeVisible();
  },
);

test(
  "keeps the 390×844 narrative aftermath contained and honors reduced motion",
  async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-narrow",
      "Narrow reduced-motion narrative check",
    );

    await page.emulateMedia({ reducedMotion: "reduce" });
    await installActiveRun(page, createIgnoredSituationFixture());
    await resumeInstalledRun(page);
    const aftermath = await commitBudgetCut(page);

    const narrativeScene = aftermath.locator("[data-narrative-location]");
    await expect(narrativeScene).toHaveAttribute("data-motion", "reduced");
    await expect(
      aftermath.getByText("The appropriation arrives incomplete", {
        exact: true,
      }),
    ).toBeVisible();

    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      reducedMotion: window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches,
      runningSceneAnimations: Array.from(
        document.querySelectorAll("[data-narrative-location]"),
      ).flatMap((scene) => scene.getAnimations({ subtree: true }))
        .filter((animation) => animation.playState === "running").length,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(layout.reducedMotion).toBe(true);
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
    expect(layout.runningSceneAnimations).toBe(0);
  },
);
