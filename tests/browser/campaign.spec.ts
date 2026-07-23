import { expect, test } from "@playwright/test";
import { deserializeGame, STORAGE_KEYS } from "../../src/game";
import {
  createActiveRunFixture,
  FIXTURE_SEED,
  installActiveRun,
  openReportFromReadyRun,
  openResourceRecovery,
  resumeInstalledRun,
} from "./fixtures";

test("starts a new campaign from the opening file", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Technocrat File" }).click();

  await expect(page.getByText("Consult one advisor before committing", { exact: true })).toBeVisible();
});

test("consults, commits, explains the consequence, and resumes the save", async ({ page }) => {
  await installActiveRun(page, createActiveRunFixture());
  await resumeInstalledRun(page);

  await page.getByText("Consult one advisor before committing", { exact: true }).click();
  await page.getByRole("button", { name: "Consult The Analyst" }).click();
  await expect(page.getByText("ADVISORY OPINION · INTERESTED ADVICE", { exact: true })).toBeVisible();

  await openResourceRecovery(page);
  await page.getByRole("button", { name: /^Recover Money/ }).click();
  const confirmation = page.getByRole("dialog");
  await expect(confirmation.getByRole("heading", { name: "Commit to “Recover Money”?" })).toBeVisible();
  await confirmation.getByRole("button", { name: "Authorize and end Month 1" }).click();

  const aftermath = page.getByRole("dialog");
  await expect(page.getByText("Confirmation required", { exact: true })).toBeHidden();
  await expect(aftermath.getByRole("heading", { name: "The campaign moved. Now it pushes back." })).toBeVisible();
  await expect(aftermath.getByText("01 · IMPROVEMENT", { exact: true })).toBeVisible();
  await expect(aftermath.getByText("04 · NEW PROBLEM", { exact: true })).toBeVisible();
  await aftermath.getByText("Open exact action-to-consequence record", { exact: true }).click();
  await expect(aftermath.getByText("ACTION-TO-CONSEQUENCE RECORD", { exact: true })).toBeVisible();
  await aftermath.getByRole("button", { name: /Continue to Campaign Month 2/ }).click();

  const saved = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEYS.activeRun);
  expect(saved).not.toBeNull();
  expect(deserializeGame(saved ?? "").turn).toBe(2);

  await page.reload();
  await expect(page.getByRole("button", { name: /Resume file · Campaign Month 2/ })).toBeVisible();
});

test("opens a report, starts an exact-seed replay, and gives Archive access", async ({ page }) => {
  await openReportFromReadyRun(page);

  await expect(page.getByText(`Replay code (seed)${FIXTURE_SEED}`, { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Intelligence Archive" }).click();
  await expect(page.getByRole("heading", { name: "What has been witnessed cannot be unwitnessed." })).toBeVisible();
  await page.getByRole("button", { name: "Return to report" }).click();

  await page.getByRole("button", { name: "Test This Theory" }).click();
  const replayRaw = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEYS.activeRun);
  const replay = deserializeGame(replayRaw ?? "");
  expect(replay.seed).toBe(FIXTURE_SEED);
  expect(replay.runId).not.toBe("browser-report-run");
  await expect(page.getByText("Consult one advisor before committing", { exact: true })).toBeVisible();
});
