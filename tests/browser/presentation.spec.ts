import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  createActiveRunFixture,
  createIgnoredSituationFixture,
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
      const first = (resolved.split(",")[0] ?? "").trim().replace(/^["']|["']$/g, "");
      if (!approved.includes(first)) {
        offBrand.add(`${first} on <${element.tagName.toLowerCase()}>`);
      }
    }
    return [...offBrand];
  }, APPROVED_FACES);
}

async function expectFullyContained(
  child: Locator,
  parent: Locator,
): Promise<void> {
  const [childBounds, parentBounds] = await Promise.all([
    child.boundingBox(),
    parent.boundingBox(),
  ]);
  expect(childBounds).not.toBeNull();
  expect(parentBounds).not.toBeNull();
  if (!childBounds || !parentBounds) return;

  const tolerance = 0.5;
  expect(childBounds.x).toBeGreaterThanOrEqual(parentBounds.x - tolerance);
  expect(childBounds.y).toBeGreaterThanOrEqual(parentBounds.y - tolerance);
  expect(childBounds.x + childBounds.width).toBeLessThanOrEqual(
    parentBounds.x + parentBounds.width + tolerance,
  );
  expect(childBounds.y + childBounds.height).toBeLessThanOrEqual(
    parentBounds.y + parentBounds.height + tolerance,
  );
}

test("every screen renders only the three approved faces", async ({ page }) => {
  await page.goto("/");
  expect(await collectOffBrandFaces(page)).toEqual([]);

  await page.getByRole("button", { name: "Field Manual" }).click();
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
  await page.getByRole("button", { name: "Playtest Journal" }).click();
  await expect(
    page.getByRole("heading", { name: "Play consistently. Record the moments that matter." }),
  ).toBeVisible();
  expect(await collectOffBrandFaces(page)).toEqual([]);
});

test("control-room sprites use approved integer display scales", async ({ page }) => {
  await installActiveRun(page, createActiveRunFixture());
  await resumeInstalledRun(page);

  const dimensions = await page.locator("[data-brb-room] .pixelated").evaluateAll(
    (sprites) => sprites.map((sprite) => {
      const style = getComputedStyle(sprite);
      const frameWidth = Number(style.getPropertyValue("--sprite-frame-w"));
      const frameHeight = Number(style.getPropertyValue("--sprite-frame-h"));
      const rect = sprite.getBoundingClientRect();
      return {
        visible: rect.width > 0 && rect.height > 0,
        widthScale: rect.width / frameWidth,
        heightScale: rect.height / frameHeight,
      };
    }),
  );

  for (const sprite of dimensions.filter((entry) => entry.visible)) {
    expect(sprite.widthScale).toBe(sprite.heightScale);
    expect(Number.isInteger(sprite.widthScale)).toBe(true);
    expect([1, 2, 3, 4, 6]).toContain(sprite.widthScale);
  }
});

test("the complete facility remains contained across the scale breakpoint", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium-desktop",
    "One desktop browser covers the intermediate-width contract",
  );
  await installActiveRun(page, createActiveRunFixture());
  await resumeInstalledRun(page);

  for (const width of [1200, 1140, 1120, 1101]) {
    await page.setViewportSize({ width, height: 900 });
    const stage = page.locator("[data-room-stage]");
    const room = stage.locator("[data-pixel-room]");
    const canvas = room.locator(":scope > div");
    await expect(room).toBeVisible();
    await expectFullyContained(room, stage);
    await expectFullyContained(canvas, room);

    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);

    const bounds = await room.boundingBox();
    const canvasBounds = await canvas.boundingBox();
    expect(bounds?.width).toBe(width > 1180 ? 704 : 352);
    expect(bounds?.height).toBe(width > 1180 ? 448 : 224);
    expect(canvasBounds?.width).toBe(bounds?.width);
    expect(canvasBounds?.height).toBe(bounds?.height);
  }
});

test("Situation responses compare side by side only when the dossier is wide enough", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium-desktop",
    "One desktop browser covers the dossier container breakpoint",
  );
  await installActiveRun(page, createIgnoredSituationFixture());
  await resumeInstalledRun(page);

  const choices = page.getByRole("group", { name: "Situation responses" });

  await page.setViewportSize({ width: 1440, height: 1100 });
  await expect(choices).toBeVisible();
  expect(
    await choices.evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length
    ),
  ).toBe(2);

  const wideChoiceWidths = await choices
    .getByRole("button")
    .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().width));
  expect(wideChoiceWidths.every((width) => width >= 250)).toBe(true);

  await page.setViewportSize({ width: 1320, height: 900 });
  expect(
    await choices.evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length
    ),
  ).toBe(1);
});

test("the narrow campaign leads with the complete room and contains every pressure meter", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium-narrow",
    "The 390px project covers the phone hierarchy and meter contract",
  );
  await installActiveRun(page, createIgnoredSituationFixture());
  await resumeInstalledRun(page);

  const masthead = page.locator(".masthead");
  const workspace = page.getByRole("region", { name: "Situation workspace" });
  const stage = workspace.locator("[data-room-stage]");
  const room = stage.locator("[data-pixel-room]");
  const dossierHeading = workspace.getByRole("heading", {
    name: "The Missing Appropriation",
  });
  const onboarding = page.locator(".first-turn-guide");
  const pressureStrip = page.getByRole("region", { name: "Pressure meters" });
  const consultation = page.locator(".campaign-consultation");

  await expect(stage.locator("[data-mobile-room-readout]")).toContainText(
    /live/i,
  );
  await expectFullyContained(room, stage);

  const [mastheadBounds, stageBounds, dossierBounds] = await Promise.all([
    masthead.boundingBox(),
    stage.boundingBox(),
    dossierHeading.boundingBox(),
  ]);
  expect(mastheadBounds).not.toBeNull();
  expect(stageBounds).not.toBeNull();
  expect(dossierBounds).not.toBeNull();
  if (mastheadBounds && stageBounds && dossierBounds) {
    expect(stageBounds.y).toBeGreaterThanOrEqual(
      mastheadBounds.y + mastheadBounds.height,
    );
    expect(stageBounds.width).toBe(352);
    expect(stageBounds.height).toBe(224);
    expect(stageBounds.y + stageBounds.height).toBeLessThan(dossierBounds.y);
  }

  const [workspaceBounds, onboardingBounds, pressureBounds, consultationBounds] =
    await Promise.all([
      workspace.boundingBox(),
      onboarding.boundingBox(),
      pressureStrip.boundingBox(),
      consultation.boundingBox(),
    ]);
  expect(workspaceBounds).not.toBeNull();
  expect(onboardingBounds).not.toBeNull();
  expect(pressureBounds).not.toBeNull();
  expect(consultationBounds).not.toBeNull();
  if (
    workspaceBounds
    && onboardingBounds
    && pressureBounds
    && consultationBounds
  ) {
    expect(workspaceBounds.y + workspaceBounds.height).toBeLessThanOrEqual(
      onboardingBounds.y,
    );
    expect(onboardingBounds.y + onboardingBounds.height).toBeLessThanOrEqual(
      pressureBounds.y,
    );
    expect(pressureBounds.y + pressureBounds.height).toBeLessThanOrEqual(
      consultationBounds.y,
    );
  }

  const pressureLayout = await pressureStrip.evaluate((element) => ({
    columns: getComputedStyle(element).gridTemplateColumns
      .split(" ")
      .filter(Boolean).length,
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(pressureLayout.columns).toBe(2);
  expect(pressureLayout.scrollWidth).toBeLessThanOrEqual(
    pressureLayout.clientWidth,
  );

  const pressureMeters = pressureStrip.locator(":scope > div");
  await expect(pressureMeters).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    await expectFullyContained(pressureMeters.nth(index), pressureStrip);
  }
  for (const label of [
    "Stress",
    "Panic",
    "Institutions",
    "Corporation Progress",
  ]) {
    await expect(pressureStrip.getByText(label, { exact: true })).toBeVisible();
  }

  const pageWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.clientWidth);
});
