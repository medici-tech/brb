import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  createActiveRunFixture,
  installActiveRun,
  resumeInstalledRun,
} from "./fixtures";

type MotionSample = {
  animationName: string;
  backgroundPositionX: string;
  frameWidth: number;
  frozenFrame: number;
};

async function readMotion(sprite: Locator): Promise<MotionSample> {
  return sprite.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      animationName: style.animationName,
      backgroundPositionX: style.backgroundPositionX,
      // Background positioning uses the sprite's local CSS width. The room's
      // whole-canvas transform changes the bounding box but not this coordinate.
      frameWidth: Number.parseFloat(style.width),
      frozenFrame: Number(style.getPropertyValue("--sprite-frozen-frame")),
    };
  });
}

async function openCampaignRoom(
  page: Page,
  selector: string,
): Promise<Locator> {
  await installActiveRun(page, createActiveRunFixture());
  await resumeInstalledRun(page);
  const sprite = page.locator(`[data-brb-room] ${selector} .pixelated`);
  await expect(sprite).toBeVisible();
  return sprite;
}

test("sprite sheets advance frames in Chromium", async ({ page }, testInfo) => {
  test.skip(
    process.env.BRB_ART_QA !== "1",
    "Run `npm run test:browser:art` when reviewing licensed sprite playback.",
  );
  test.skip(
    testInfo.project.name !== "chromium-desktop",
    "One Chromium project covers the CSS animation engine contract",
  );

  const sprite = await openCampaignRoom(
    page,
    '[data-room-actor="analyst"]',
  );
  await expect.poll(async () => (await readMotion(sprite)).animationName)
    .toContain("brb-pixel-sprite");

  const first = await readMotion(sprite);
  await page.waitForTimeout(240);
  const second = await readMotion(sprite);

  expect(first.backgroundPositionX).not.toBe(second.backgroundPositionX);
});

test("reduced motion parks sprite sheets on their frozen frame", async ({
  page,
}, testInfo) => {
  test.skip(
    process.env.BRB_ART_QA !== "1",
    "Run `npm run test:browser:art` when reviewing licensed sprite playback.",
  );
  test.skip(
    testInfo.project.name !== "chromium-desktop",
    "One Chromium project covers the CSS animation engine contract",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });

  const sprite = await openCampaignRoom(
    page,
    '[data-room-object="security-camera"]',
  );
  await expect(page.locator("[data-brb-room]")).toHaveAttribute(
    "data-motion",
    "reduced",
  );

  const first = await readMotion(sprite);
  await page.waitForTimeout(240);
  const second = await readMotion(sprite);

  expect(first.animationName).toBe("none");
  expect(first.frozenFrame).toBe(4);
  expect(Number.parseFloat(first.backgroundPositionX)).toBe(
    -first.frameWidth * first.frozenFrame,
  );
  expect(first.backgroundPositionX).toBe(second.backgroundPositionX);
});
