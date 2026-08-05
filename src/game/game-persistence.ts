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
    || (parsed.version !== 3 && parsed.version !== 4 && parsed.version !== 5)
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
  if (migrated.version === 4) {
    migrated.version = 5;
    migrated.legacyDirective = {
      equippedId: null,
      used: false,
      usedOnDecisionId: null,
    };
    if (migrated.report && typeof migrated.report === "object") {
      const report = migrated.report as Record<string, unknown>;
      report.legacyDirective = {
        equippedId: null,
        used: false,
        usedOnDecisionId: null,
      };
    }
  }

  // Additive openingAftermath: saves written before the Archive scar omit it on
  // both the run and its embedded report; normalize to null rather than bump v5.
  if (typeof migrated.openingAftermath === "undefined") {
    migrated.openingAftermath = null;
  }
  if (migrated.report && typeof migrated.report === "object") {
    const report = migrated.report as Record<string, unknown>;
    if (typeof report.openingAftermath === "undefined") {
      report.openingAftermath = null;
    }
  }

  // Additive DecisionRecord.subject: legacy saves omit it; normalize to null.
  if (Array.isArray(migrated.decisionHistory)) {
    for (const decision of migrated.decisionHistory) {
      if (
        decision
        && typeof decision === "object"
        && !("subject" in decision)
      ) {
        (decision as Record<string, unknown>).subject = null;
      }
    }
  }

  assertGameState(migrated);
  return migrated;
}
