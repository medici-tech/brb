import type { Page } from "@playwright/test";
import { createGame, serializeGame, STORAGE_KEYS, type GameState } from "../../src/game";

export const FIXTURE_SEED = 20260715;

export function createActiveRunFixture(): GameState {
  const state = createGame({
    seed: FIXTURE_SEED,
    archetypeId: "technocrat",
    runId: "browser-active-run",
  });
  state.activeCardId = null;
  return state;
}

export function createActivationReadyFixture(): GameState {
  const state = createGame({
    seed: FIXTURE_SEED,
    archetypeId: "technocrat",
    runId: "browser-report-run",
  });
  state.activeCardId = null;
  state.tracks = {
    engineering: 60,
    access: 60,
    legitimacy: 60,
    stability: 60,
  };
  state.corporation.progress = 20;
  return state;
}

export async function installActiveRun(page: Page, state: GameState): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => {
      if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, value);
    },
    { key: STORAGE_KEYS.activeRun, value: serializeGame(state) },
  );
}

export async function resumeInstalledRun(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: /^Resume file/ }).click();
  await page.getByText("Consult one advisor before committing", { exact: true }).waitFor();
}

export async function openResourceRecovery(page: Page): Promise<void> {
  await page.getByText("Recover a resource reserve", { exact: true }).click();
}

export async function openReportFromReadyRun(page: Page): Promise<void> {
  await installActiveRun(page, createActivationReadyFixture());
  await resumeInstalledRun(page);
  await page.getByRole("button", { name: /^Activate BRB/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Activate BRB and end campaign" }).click();
  await page.getByText("CAMPAIGN OUTCOME", { exact: true }).waitFor();
}
