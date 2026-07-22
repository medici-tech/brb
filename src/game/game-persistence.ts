import type { GameState } from "./types";
import { assertGameState } from "./validation";

export function serializeGame(state: GameState): string {
  return JSON.stringify(state);
}

export function deserializeGame(serialized: string): GameState {
  const parsed: unknown = JSON.parse(serialized);
  if (
    !parsed
    || typeof parsed !== "object"
    || !("version" in parsed)
    || (parsed.version !== 3 && parsed.version !== 4)
  ) {
    throw new Error("Unsupported or invalid BRB save.");
  }

  const migrated = structuredClone(parsed) as Record<string, unknown>;
  if (migrated.version === 3) {
    migrated.version = 4;
    if (typeof migrated.lastTurnResolution === "undefined") {
      migrated.lastTurnResolution = null;
    }
    if (typeof migrated.lastMonthAudit === "undefined") {
      migrated.lastMonthAudit = null;
    }
    if (
      migrated.corporation
      && typeof migrated.corporation === "object"
      && Number.isInteger(migrated.turn)
      && !Number.isInteger(
        (migrated.corporation as Record<string, unknown>).lastResponseMonth,
      )
    ) {
      (migrated.corporation as Record<string, unknown>).lastResponseMonth =
        Math.max(0, Number(migrated.turn) - 1);
    }
    if (migrated.report && typeof migrated.report === "object") {
      const report = migrated.report as Record<string, unknown>;
      if (!Number.isInteger(report.rulesVersion)) report.rulesVersion = 0;
      if (typeof report.finalSnapshot === "undefined") report.finalSnapshot = null;
    }
  }

  assertGameState(migrated);
  return migrated;
}
