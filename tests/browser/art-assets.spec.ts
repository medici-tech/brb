import { expect, test } from "@playwright/test";
import { ART } from "../../src/game-art/manifest.js";

test("strict artwork QA serves and decodes the complete licensed manifest", async ({
  page,
}, testInfo) => {
  test.skip(
    process.env.BRB_ART_QA !== "1",
    "Run `npm run test:browser:art` when reviewing licensed artwork or animation.",
  );
  test.skip(
    testInfo.project.name !== "chromium-desktop",
    "One browser project is sufficient for deterministic asset delivery validation.",
  );

  await page.goto("/");
  const results = await page.evaluate(async (entries) => Promise.all(
    entries.map((entry) => new Promise<{
      key: string;
      loaded: boolean;
      width: number;
      height: number;
    }>((resolve) => {
      const image = new Image();
      image.onload = () => resolve({
        key: entry.key,
        loaded: true,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      image.onerror = () => resolve({
        key: entry.key,
        loaded: false,
        width: 0,
        height: 0,
      });
      image.src = entry.src;
    })),
  ), Object.values(ART).map((entry) => ({
    key: entry.key,
    src: entry.src,
    expectedWidth: entry.expectedWidth,
    expectedHeight: entry.expectedHeight,
  })));

  expect(results).toEqual(
    Object.values(ART).map((entry) => ({
      key: entry.key,
      loaded: true,
      width: entry.expectedWidth,
      height: entry.expectedHeight,
    })),
  );
});
