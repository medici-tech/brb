import { expect, test } from "@playwright/test";
import { createEmptyArchive, deserializeGame, STORAGE_KEYS } from "../../src/game";
import {
  createActiveRunFixture,
  createDirectiveRunFixture,
  createIgnoredSituationFixture,
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

test("keeps an Operator-only Directive lock keyboard-readable", async ({ page }) => {
  const archive = createEmptyArchive();
  archive.unlockedDirectiveIds = ["containment_brief"];
  await page.addInitScript(
    ({ key, value }) => {
      if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, value);
    },
    { key: STORAGE_KEYS.archive, value: JSON.stringify(archive) },
  );
  await page.goto("/");

  await page.getByRole("button", { name: /Containment Brief/i }).click();
  const technocrat = page.getByRole("button", { name: "Open Technocrat File" });
  await expect(technocrat).toHaveAttribute("aria-disabled", "true");
  await expect(page.locator("#doctrine-action-reason-technocrat")).toContainText(
    "Containment Brief requires the Operator doctrine",
  );

  await technocrat.focus();
  await expect(technocrat).toBeFocused();
  await technocrat.press("Enter");
  await expect(page.getByText("Consult one advisor before committing", { exact: true })).toBeHidden();

  await page.getByRole("button", { name: "Open Operator File" }).click();
  const saved = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEYS.activeRun);
  expect(deserializeGame(saved ?? "")).toMatchObject({
    archetypeId: "operator",
    legacyDirective: { equippedId: "containment_brief" },
  });
});

test("keeps a persisted replay doctrine fixed and rejects incompatible replay data", async ({ page }) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, value);
    },
    {
      key: STORAGE_KEYS.replayIntent,
      value: JSON.stringify({
        mode: "same_seed",
        seed: 42,
        archetypeId: "technocrat",
        experiment: "Repeat the file",
        legacyDirectiveId: "emergency_appropriation",
      }),
    },
  );
  await page.goto("/");

  const operator = page.getByRole("button", { name: "Open Operator File" });
  await expect(operator).toHaveAttribute("aria-disabled", "true");
  await operator.focus();
  await operator.press("Enter");
  await expect(page.getByText("Consult one advisor before committing", { exact: true })).toBeHidden();

  await page.getByRole("button", { name: "Replay Technocrat File" }).click();
  const replayRaw = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEYS.activeRun);
  expect(deserializeGame(replayRaw ?? "")).toMatchObject({
    seed: 42,
    archetypeId: "technocrat",
    legacyDirective: { equippedId: "emergency_appropriation" },
  });

  await page.evaluate((key) => {
    window.localStorage.clear();
    window.localStorage.setItem(key, JSON.stringify({
      mode: "same_seed",
      seed: 43,
      archetypeId: "technocrat",
      experiment: "Invalid doctrine pairing",
      legacyDirectiveId: "containment_brief",
    }));
  }, STORAGE_KEYS.replayIntent);
  await page.reload();
  await expect(page.getByText("COUNTERFACTUAL OBJECTIVE", { exact: true })).toBeHidden();
  await expect(page.getByRole("button", { name: "Open Technocrat File" })).toBeEnabled();
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

test("uses an equipped Legacy Directive with one normal commitment", async ({ page }) => {
  await installActiveRun(page, createDirectiveRunFixture());
  await resumeInstalledRun(page);

  await expect(page.getByRole("heading", { name: "Emergency Appropriation" })).toBeVisible();
  await openResourceRecovery(page);
  await page.getByRole("button", { name: /^Recover Intel/ }).click();
  const confirmation = page.getByRole("dialog");
  await expect(confirmation).toContainText("Money +12");
  await expect(confirmation).toContainText("Stress +4");
  await confirmation.getByRole("button", { name: "Use Legacy Directive" }).click();

  const aftermath = page.getByRole("dialog");
  await expect(aftermath).toContainText("Directive: Emergency Appropriation");
  await aftermath.getByRole("button", { name: /Continue to Campaign Month 2/ }).click();
  await expect(page.getByText("Authorization spent for this campaign.")).toBeVisible();

  const saved = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEYS.activeRun);
  const restored = deserializeGame(saved ?? "");
  expect(restored.legacyDirective).toMatchObject({
    equippedId: "emergency_appropriation",
    used: true,
  });
});

test("explains ignored-Situation ordering and Directive affordability", async ({ page }) => {
  await installActiveRun(page, createIgnoredSituationFixture());
  await resumeInstalledRun(page);

  const protect = page.getByRole("button", { name: /^Protect Institutions/ });
  await expect(protect).toBeEnabled();
  await protect.click();
  const confirmation = page.getByRole("dialog");
  await expect(confirmation).toContainText("Money −7 · Stress +5");
  await expect(confirmation).toContainText(
    "ignored Situation effect → optional Legacy Directive → selected commitment",
  );
  await expect(confirmation.getByRole("button", { name: "Use Legacy Directive" })).toBeEnabled();
  await expect(confirmation).not.toContainText("Neglect entered the record");
});

test("opens a report, starts an exact-seed replay, and gives Archive access", async ({ page }) => {
  await openReportFromReadyRun(page);

  await expect(page.getByRole("heading", { name: "Choose one authorization to preserve." })).toBeVisible();
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
