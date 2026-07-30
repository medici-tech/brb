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

async function expectFullyContainedWithin(
  locator: Locator,
  container: Locator,
): Promise<void> {
  await expect.poll(async () => {
    const [bounds, containerBounds] = await Promise.all([
      locator.boundingBox(),
      container.boundingBox(),
    ]);
    if (!bounds || !containerBounds) return false;

    const tolerance = 0.5;
    return bounds.x >= containerBounds.x - tolerance
      && bounds.y >= containerBounds.y - tolerance
      && bounds.x + bounds.width
        <= containerBounds.x + containerBounds.width + tolerance
      && bounds.y + bounds.height
        <= containerBounds.y + containerBounds.height + tolerance;
  }).toBe(true);
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
    const dialogScale = await aftermath.evaluate((dialog) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(dialog).transform);
      return { x: matrix.a, y: matrix.d };
    });
    expect(dialogScale).toEqual({ x: 1, y: 1 });
    const aftermathSection = aftermath.locator("[data-aftermath-step]");
    const visualScene = aftermath.locator("[data-narrative-location]");
    const pixelRoom = visualScene.locator("[data-pixel-room]");
    const roomHolder = pixelRoom.locator("..");
    await expect(aftermathSection).toHaveAttribute(
      "data-aftermath-step",
      "setup",
    );
    await expect(
      aftermath.getByText("The appropriation arrives incomplete", {
        exact: true,
      }),
    ).toBeVisible();

    await aftermath.getByRole("button", { name: "Next beat" }).click();
    await expect(aftermathSection).toHaveAttribute(
      "data-aftermath-step",
      "action",
    );
    await expect(
      aftermath.getByText("Programs leave the page", { exact: true }),
    ).toBeVisible();
    await expectFullyContainedWithin(pixelRoom, roomHolder);

    await aftermath.getByRole("button", { name: "Previous beat" }).focus();
    await page.keyboard.press("Enter");
    await expect(aftermathSection).toHaveAttribute(
      "data-aftermath-step",
      "setup",
    );

    await aftermath.getByRole("button", { name: "Skip to consequence" }).focus();
    await page.keyboard.press("Enter");
    await expect(aftermathSection).toHaveAttribute(
      "data-aftermath-step",
      "consequence",
    );
    await expect(
      aftermath.getByText("The project is funded in an empty room", {
        exact: true,
      }),
    ).toBeVisible();
    await expectFullyContainedWithin(pixelRoom, roomHolder);

    await aftermath.getByRole("button", { name: "Previous beat" }).click();
    await expect(aftermathSection).toHaveAttribute(
      "data-aftermath-step",
      "action",
    );
    await aftermath.getByRole("button", { name: "Skip to consequence" }).click();
    await expect(aftermathSection).toHaveAttribute(
      "data-aftermath-step",
      "consequence",
    );
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
    const pixelRoom = narrativeScene.locator("[data-pixel-room]");
    await expect(narrativeScene).toHaveAttribute("data-motion", "reduced");
    await expect(
      aftermath.getByText("The appropriation arrives incomplete", {
        exact: true,
      }),
    ).toBeVisible();

    await aftermath.getByRole("button", { name: "Skip to consequence" }).click();
    await expect(aftermath.locator("[data-aftermath-step]")).toHaveAttribute(
      "data-aftermath-step",
      "consequence",
    );
    await expectFullyContainedWithin(pixelRoom, pixelRoom.locator(".."));

    const continueButton = aftermath.getByRole("button", {
      name: /Continue to Campaign Month 2/,
    });
    await continueButton.scrollIntoViewIfNeeded();
    await expectWithinViewport(continueButton, { width: 390, height: 844 });
    const buttonWidths = await continueButton.evaluate((button) => ({
      client: button.clientWidth,
      scroll: button.scrollWidth,
    }));
    expect(buttonWidths.scroll).toBeLessThanOrEqual(buttonWidths.client);

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
