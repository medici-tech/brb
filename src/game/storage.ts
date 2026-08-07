import { deserializeGame, serializeGame } from "./engine";
import { deserializeArchive, serializeArchive } from "./replay";
import type { ArchiveV1, DeclassifiedReport, GameState, ReplayIntent } from "./types";
import {
  assertDeclassifiedReport,
  assertReplayIntent,
} from "./persisted-data-validation";

export const STORAGE_KEYS = {
  activeRun: "brb.active-run.v5",
  legacyActiveRun: "brb.active-run.v4",
  olderActiveRun: "brb.active-run.v3",
  archive: "brb.archive.v1",
  legacyArchive: "brb.archive.v0",
  latestReport: "brb.latest-report.v4",
  legacyLatestReport: "brb.latest-report.v3",
  olderLatestReport: "brb.latest-report.v2",
  replayIntent: "brb.replay-intent.v2",
  legacyReplayIntent: "brb.replay-intent.v1",
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
    ?? storage.getItem(STORAGE_KEYS.legacyActiveRun)
    ?? storage.getItem(STORAGE_KEYS.olderActiveRun);
  return raw ? safely(() => deserializeGame(raw)) : null;
}

export function saveActiveRun(storage: Storage, state: GameState): void {
  storage.setItem(STORAGE_KEYS.activeRun, serializeGame(state));
  storage.removeItem(STORAGE_KEYS.legacyActiveRun);
  storage.removeItem(STORAGE_KEYS.olderActiveRun);
}

export function clearActiveRun(storage: Storage): void {
  storage.removeItem(STORAGE_KEYS.activeRun);
  storage.removeItem(STORAGE_KEYS.legacyActiveRun);
  storage.removeItem(STORAGE_KEYS.olderActiveRun);
}

export function loadArchive(storage: Storage): ArchiveV1 | null {
  const raw = storage.getItem(STORAGE_KEYS.archive)
    ?? storage.getItem(STORAGE_KEYS.legacyArchive);
  return raw ? safely(() => deserializeArchive(raw)) : null;
}

export function saveArchive(storage: Storage, archive: ArchiveV1): void {
  storage.setItem(STORAGE_KEYS.archive, serializeArchive(archive));
  storage.removeItem(STORAGE_KEYS.legacyArchive);
}

export function loadLatestReport(storage: Storage): DeclassifiedReport | null {
  const raw = storage.getItem(STORAGE_KEYS.latestReport)
    ?? storage.getItem(STORAGE_KEYS.legacyLatestReport)
    ?? storage.getItem(STORAGE_KEYS.olderLatestReport);
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
          legacyDirective: (parsed as Partial<DeclassifiedReport>).legacyDirective ?? {
            equippedId: null,
            used: false,
            usedOnDecisionId: null,
          },
          openingAftermath:
            (parsed as Partial<DeclassifiedReport>).openingAftermath ?? null,
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
  const legacyRaw = storage.getItem(STORAGE_KEYS.legacyReplayIntent);
  return raw || legacyRaw
    ? safely(() => {
        const parsed: unknown = JSON.parse(raw ?? legacyRaw ?? "");
        const value = parsed && typeof parsed === "object"
          ? { ...parsed, legacyDirectiveId: "legacyDirectiveId" in parsed
            ? (parsed as ReplayIntent).legacyDirectiveId
            : null }
          : parsed;
        assertReplayIntent(value);
        return value;
      })
    : null;
}

export function saveReplayIntent(storage: Storage, intent: ReplayIntent): void {
  storage.setItem(STORAGE_KEYS.replayIntent, JSON.stringify(intent));
  storage.removeItem(STORAGE_KEYS.legacyReplayIntent);
}

export function clearReplayIntent(storage: Storage): void {
  storage.removeItem(STORAGE_KEYS.replayIntent);
  storage.removeItem(STORAGE_KEYS.legacyReplayIntent);
}
