import { deserializeGame, serializeGame } from "./engine";
import { deserializeArchive, serializeArchive } from "./replay";
import type { ArchiveV0, DeclassifiedReport, GameState, ReplayIntent } from "./types";
import {
  assertDeclassifiedReport,
  assertReplayIntent,
} from "./validation";

export const STORAGE_KEYS = {
  activeRun: "brb.active-run.v4",
  legacyActiveRun: "brb.active-run.v3",
  archive: "brb.archive.v0",
  latestReport: "brb.latest-report.v3",
  legacyLatestReport: "brb.latest-report.v2",
  replayIntent: "brb.replay-intent.v1",
} as const;

function safely<T>(read: () => T): T | null {
  try {
    return read();
  } catch {
    return null;
  }
}

export function loadActiveRun(storage: Storage): GameState | null {
  const raw = storage.getItem(STORAGE_KEYS.activeRun)
    ?? storage.getItem(STORAGE_KEYS.legacyActiveRun);
  return raw ? safely(() => deserializeGame(raw)) : null;
}

export function saveActiveRun(storage: Storage, state: GameState): void {
  storage.setItem(STORAGE_KEYS.activeRun, serializeGame(state));
  storage.removeItem(STORAGE_KEYS.legacyActiveRun);
}

export function clearActiveRun(storage: Storage): void {
  storage.removeItem(STORAGE_KEYS.activeRun);
  storage.removeItem(STORAGE_KEYS.legacyActiveRun);
}

export function loadArchive(storage: Storage): ArchiveV0 | null {
  const raw = storage.getItem(STORAGE_KEYS.archive);
  return raw ? safely(() => deserializeArchive(raw)) : null;
}

export function saveArchive(storage: Storage, archive: ArchiveV0): void {
  storage.setItem(STORAGE_KEYS.archive, serializeArchive(archive));
}

export function loadLatestReport(storage: Storage): DeclassifiedReport | null {
  const raw = storage.getItem(STORAGE_KEYS.latestReport)
    ?? storage.getItem(STORAGE_KEYS.legacyLatestReport);
  return raw
    ? safely(() => {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Invalid report");
        }
        const value = {
          ...parsed,
          rulesVersion: Number.isInteger((parsed as Partial<DeclassifiedReport>).rulesVersion)
            ? (parsed as Partial<DeclassifiedReport>).rulesVersion
            : 0,
          finalSnapshot: (parsed as Partial<DeclassifiedReport>).finalSnapshot ?? null,
        };
        assertDeclassifiedReport(value);
        return value;
      })
    : null;
}

export function saveLatestReport(storage: Storage, report: DeclassifiedReport): void {
  storage.setItem(STORAGE_KEYS.latestReport, JSON.stringify(report));
}

export function loadReplayIntent(storage: Storage): ReplayIntent | null {
  const raw = storage.getItem(STORAGE_KEYS.replayIntent);
  return raw
    ? safely(() => {
        const value: unknown = JSON.parse(raw);
        assertReplayIntent(value);
        return value;
      })
    : null;
}

export function saveReplayIntent(storage: Storage, intent: ReplayIntent): void {
  storage.setItem(STORAGE_KEYS.replayIntent, JSON.stringify(intent));
}

export function clearReplayIntent(storage: Storage): void {
  storage.removeItem(STORAGE_KEYS.replayIntent);
}
