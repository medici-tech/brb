import { describe, expect, it } from "vitest";
import {
  claimLegacyDirective,
  commitAction,
  createEmptyArchive,
  createGame,
  createReplayIntent,
  drawLegacyDirectiveDraft,
  getLegacyDirectiveEquipError,
  LEGACY_DIRECTIVE_IDS,
  LEGACY_DIRECTIVES,
  mergeRunIntoArchive,
} from "../../src/game/index.js";
import type { ArchetypeId, GameState, LegacyDirectiveId } from "../../src/game/types.js";

function completeVictory(runId: string, seed = 71): GameState {
  const state = createGame({ seed, runId });
  state.activeCardId = null;
  state.tracks = {
    engineering: 50,
    access: 50,
    legitimacy: 75,
    stability: 75,
  };
  state.corporation.progress = 20;
  state.endingContributors = ["public_testimony"];
  return commitAction(state, { type: "activate_brb" }).state;
}

function completeCompromised(runId: string, seed = 72): GameState {
  const state = createGame({ seed, runId });
  state.activeCardId = null;
  state.tracks = {
    engineering: 50,
    access: 50,
    legitimacy: 50,
    stability: 50,
  };
  state.corporation.progress = 20;
  return commitAction(state, { type: "activate_brb" }).state;
}

function useDirective(
  id: LegacyDirectiveId,
  seed = 31,
  archetypeId: ArchetypeId = "technocrat",
): GameState {
  const state = createGame({ seed, archetypeId, legacyDirectiveId: id });
  state.activeCardId = null;
  return commitAction(
    state,
    { type: "recover_resource", resource: "intelligence" },
    { useLegacyDirective: true },
  ).state;
}

describe("Legacy Directives", () => {
  it("applies each authored benefit and drawback to the accepted commitment", () => {
    const appropriation = useDirective("emergency_appropriation");
    expect(appropriation.lastTurnResolution?.commitment.delta.resources.money).toBe(12);
    expect(appropriation.lastTurnResolution?.commitment.delta.pressures.stress).toBe(11);

    const whip = useDirective("coalition_whip");
    expect(whip.lastTurnResolution?.commitment.delta.resources.influence).toBe(8);
    expect(whip.lastTurnResolution?.commitment.delta.pressures.panic).toBe(5);

    const channel = useDirective("protected_channel");
    expect(channel.lastTurnResolution?.commitment.delta.corporationThreat).toBe(5);

    const confidence = useDirective("public_confidence_reserve");
    expect(confidence.lastTurnResolution?.commitment.delta.resources.trust).toBe(10);
    expect(confidence.lastTurnResolution?.commitment.delta.corporationProgress).toBe(7);

    const surge = useDirective("industrial_surge");
    expect(surge.lastTurnResolution?.commitment.delta.resources.capacity).toBe(8);
    expect(surge.lastTurnResolution?.commitment.delta.institutions).toBe(-5);

    const brief = useDirective("containment_brief", 31, "operator");
    expect(brief.lastTurnResolution?.commitment.delta.resources.influence).toBe(6);
    expect(brief.lastTurnResolution?.commitment.delta.advisors.fixer?.leverage).toBe(6);
  });

  it("gates Containment Brief to the Operator doctrine", () => {
    expect(LEGACY_DIRECTIVES.containment_brief.requiredArchetypeId).toBe("operator");
    expect(getLegacyDirectiveEquipError("operator", "containment_brief")).toBeNull();
    expect(getLegacyDirectiveEquipError("technocrat", "containment_brief")).toMatch(
      /Operator doctrine/i,
    );
    expect(getLegacyDirectiveEquipError("populist", "containment_brief")).toMatch(
      /Operator doctrine/i,
    );

    const stripped = createGame({
      seed: 35,
      archetypeId: "technocrat",
      legacyDirectiveId: "containment_brief",
    });
    expect(stripped.legacyDirective.equippedId).toBeNull();

    const equipped = createGame({
      seed: 35,
      archetypeId: "operator",
      legacyDirectiveId: "containment_brief",
    });
    expect(equipped.legacyDirective.equippedId).toBe("containment_brief");
  });

  it("rejects Containment Brief if an invalid in-memory state changes doctrine", () => {
    const state = createGame({
      seed: 36,
      archetypeId: "operator",
      legacyDirectiveId: "containment_brief",
    });
    state.archetypeId = "technocrat";
    state.activeCardId = null;

    const result = commitAction(
      state,
      { type: "recover_resource", resource: "intelligence" },
      { useLegacyDirective: true },
    );

    expect(result.accepted).toBe(false);
    expect(result.error).toMatch(/requires the Operator doctrine/i);
    expect(result.state.legacyDirective.used).toBe(false);
  });

  it("prevents a scheduled Corporation response with the rare Freeze Order", () => {
    const state = createGame({
      seed: 32,
      legacyDirectiveId: "continuity_freeze_order",
    });
    state.activeCardId = null;
    state.turn = 5;
    state.corporation.lastResponseMonth = 0;

    const result = commitAction(
      state,
      { type: "recover_resource", resource: "money" },
      { useLegacyDirective: true },
    );

    expect(result.accepted).toBe(true);
    expect(result.state.lastTurnResolution?.corporationResponse).toBeNull();
    expect(result.state.lastTurnResolution?.commitment.delta.institutions).toBe(-10);
    expect(result.state.lastTurnResolution?.commitment.delta.pressures.panic).toBe(6);
  });

  it("uses a Directive once, preserves provenance, and does not consume it on rejection", () => {
    const invalid = createGame({
      seed: 33,
      legacyDirectiveId: "emergency_appropriation",
    });
    invalid.activeCardId = null;
    const rejected = commitAction(
      invalid,
      { type: "resolve_card", choiceId: "not-a-choice" },
      { useLegacyDirective: true },
    );
    expect(rejected.accepted).toBe(false);
    expect(rejected.state.legacyDirective.used).toBe(false);

    const accepted = useDirective("emergency_appropriation", 33);
    const decisionId = accepted.decisionHistory.at(-1)?.id;
    expect(accepted.legacyDirective).toEqual({
      equippedId: "emergency_appropriation",
      used: true,
      usedOnDecisionId: decisionId,
    });
    expect(accepted.history).toContainEqual(expect.objectContaining({
      decisionId,
      message: expect.stringMatching(/Legacy Directive used: Emergency Appropriation/i),
    }));

    const second = commitAction(
      accepted,
      { type: "recover_resource", resource: "money" },
      { useLegacyDirective: true },
    );
    expect(second.accepted).toBe(false);
    expect(second.error).toMatch(/already been used/i);
  });

  it("allows a resource Directive to make an otherwise unaffordable action valid", () => {
    const state = createGame({
      seed: 34,
      legacyDirectiveId: "emergency_appropriation",
    });
    state.activeCardId = null;
    state.resources.money = 0;

    expect(commitAction(state, { type: "protect_institutions" }).accepted).toBe(false);
    const result = commitAction(
      state,
      { type: "protect_institutions" },
      { useLegacyDirective: true },
    );
    expect(result.accepted).toBe(true);
    expect(result.state.legacyDirective.used).toBe(true);
  });
});

describe("Legacy Directive rewards", () => {
  it("creates a deterministic weighted draft without unlocked duplicates", () => {
    const first = drawLegacyDirectiveDraft(12345, ["emergency_appropriation"]);
    const second = drawLegacyDirectiveDraft(12345, ["emergency_appropriation"]);
    expect(first).toEqual(second);
    expect(first.draft?.candidateIds).toHaveLength(3);
    expect(first.draft?.candidateIds).not.toContain("emergency_appropriation");
    expect(new Set(first.draft?.candidateIds).size).toBe(3);
  });

  it("grants a victory draft, claims one permanent unlock, and merges idempotently", () => {
    const completed = completeVictory("directive-victory");
    expect(completed.ending?.id).toBe("civic_legacy");
    const rewarded = mergeRunIntoArchive(createEmptyArchive(), completed);
    expect(rewarded.clearance).toBe(0);
    expect(rewarded.pendingDirectiveDraft?.candidateIds).toHaveLength(3);
    expect(rewarded.pendingScar).toBeNull();

    const duplicate = mergeRunIntoArchive(rewarded, completed);
    expect(duplicate).toEqual(rewarded);

    const choice = rewarded.pendingDirectiveDraft?.candidateIds[0];
    if (!choice) throw new Error("Expected a Directive reward");
    const claimed = claimLegacyDirective(rewarded, choice);
    expect(claimed.unlockedDirectiveIds).toEqual([choice]);
    expect(claimed.pendingDirectiveDraft).toBeNull();
  });

  it("grants Clearance 2 and a Panic aftermath scar for Necessary Regime", () => {
    const completed = completeCompromised("directive-compromised");
    expect(completed.ending?.id).toBe("compromised_activation");
    const archive = mergeRunIntoArchive(createEmptyArchive(), completed);
    expect(archive.clearance).toBe(2);
    expect(archive.pendingScar).toBe("necessary_regime_aftermath");
    expect(archive.pendingDirectiveDraft).toBeNull();
  });

  it("turns three completed losses into a draft while preserving leftover Clearance", () => {
    let archive = createEmptyArchive();
    for (let index = 0; index < 3; index += 1) {
      const state = createGame({ seed: 90 + index, runId: `loss-${index}` });
      state.activeCardId = null;
      state.turn = 5;
      state.corporation.progress = 99;
      state.corporation.lastResponseMonth = 0;
      const completed = commitAction(
        state,
        { type: "recover_resource", resource: "money" },
      ).state;
      expect(completed.ending?.victory).toBe(false);
      archive = mergeRunIntoArchive(archive, completed);
    }
    expect(archive.clearance).toBe(0);
    expect(archive.pendingDirectiveDraft).not.toBeNull();
  });

  it("preserves the equipped Directive in reports and same-seed replay intent", () => {
    const state = createGame({
      seed: 72,
      runId: "directive-report",
      legacyDirectiveId: "coalition_whip",
    });
    state.activeCardId = null;
    state.tracks = {
      engineering: 50,
      access: 50,
      legitimacy: 50,
      stability: 50,
    };
    const completed = commitAction(state, { type: "activate_brb" }).state;
    if (!completed.report) throw new Error("Expected report");

    expect(completed.report.legacyDirective.equippedId).toBe("coalition_whip");
    expect(createReplayIntent(completed.report, "same_seed")).toMatchObject({
      seed: completed.seed,
      legacyDirectiveId: "coalition_whip",
    });
    expect(LEGACY_DIRECTIVE_IDS).toHaveLength(7);
  });
});
