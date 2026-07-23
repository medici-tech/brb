import { describe, expect, it } from "vitest";
import {
  commitAction,
  consultAdvisor,
  createGame,
  deriveTurnBeats,
} from "../../src/game/index.js";

function resolveCurrentTurn(
  state: ReturnType<typeof createGame>,
  action: Parameters<typeof commitAction>[1],
) {
  const resolved = commitAction(state, action).state;
  return {
    state: resolved,
    beats: deriveTurnBeats(resolved, resolved.lastTurnResolution),
  };
}

describe("turn improvement beats", () => {
  it("orders an ordinary gain before the problem it creates", () => {
    const state = createGame(301);
    state.activeCardId = null;
    state.resources.money = 40;

    const { beats } = resolveCurrentTurn(state, {
      type: "recover_resource",
      resource: "money",
    });

    expect(beats.map((beat) => beat.kind)).toEqual(["improvement", "problem"]);
    expect(beats[0]?.exactChanges).toContain("Money +30");
    expect(beats[1]?.exactChanges).toEqual(expect.arrayContaining([
      expect.stringMatching(/Stress \+7/),
      expect.stringMatching(/Corporation Progress \+3/),
    ]));
  });

  it("marks the first permanent deposit and a newly ready track", () => {
    const state = createGame(302);
    state.activeCardId = null;
    state.tracks = { engineering: 25, access: 0, legitimacy: 0, stability: 0 };
    state.resources = {
      money: 100,
      influence: 100,
      intelligence: 100,
      trust: 100,
      capacity: 100,
    };

    const { beats } = resolveCurrentTurn(state, {
      type: "deposit",
      track: "engineering",
      size: "standard",
    });

    const milestoneTitles = beats
      .filter((beat) => beat.kind === "milestone")
      .map((beat) => beat.title);
    expect(milestoneTitles).toContain("The first permanent commitment");
    expect(milestoneTitles).toContain("A BRB track is ready");
    expect(beats.find((beat) => beat.title === "A BRB track is ready")?.explanation)
      .toMatch(/Engineering.*50-point/i);
  });

  it("marks activation readiness when the final track reaches its threshold", () => {
    const state = createGame(3021);
    state.activeCardId = null;
    state.tracks = { engineering: 25, access: 50, legitimacy: 50, stability: 50 };
    state.resources = {
      money: 100,
      influence: 100,
      intelligence: 100,
      trust: 100,
      capacity: 100,
    };

    const { beats } = resolveCurrentTurn(state, {
      type: "deposit",
      track: "engineering",
      size: "standard",
    });

    expect(beats.find((beat) => beat.title === "BRB activation is now available"))
      .toMatchObject({
        kind: "milestone",
        exactChanges: ["All four BRB tracks meet the 50-point threshold"],
      });
  });

  it("recognizes a route opening without exposing its future card", () => {
    const state = createGame(303);
    state.activeCardId = "audit_discrepancy";
    state.cardHistory.push({
      cardId: "audit_discrepancy",
      turn: state.turn,
      choiceId: null,
      outcomeId: null,
      causedByDecisionId: null,
      status: "presented",
    });

    const { beats } = resolveCurrentTurn(state, {
      type: "resolve_card",
      choiceId: "follow",
    });
    const text = JSON.stringify(beats);

    expect(beats.find((beat) => beat.kind === "discovery")?.explanation)
      .toMatch(/Corporate Exposure/i);
    expect(beats.find((beat) => beat.title === "A political route opened"))
      .toBeDefined();
    expect(text).not.toMatch(/silent_partner|The Silent Partner/i);
  });

  it("recognizes when an earlier System Echo changes a later action", () => {
    const state = createGame(304);
    state.activeCardId = "budget_shortfall";
    state.cardHistory.push({
      cardId: "budget_shortfall",
      turn: state.turn,
      choiceId: null,
      outcomeId: null,
      causedByDecisionId: null,
      status: "presented",
    });
    const delayed = commitAction(state, {
      type: "resolve_card",
      choiceId: "delay",
    }).state;
    delayed.activeCardId = null;

    const { beats } = resolveCurrentTurn(delayed, {
      type: "recover_resource",
      resource: "money",
    });

    const discovery = beats.find(
      (beat) => beat.title === "An earlier doctrine changed this month",
    );
    expect(discovery?.explanation).toMatch(/accepted delay.*additional progress/i);
    expect(discovery?.linkedDecisionIds).toHaveLength(2);
  });

  it("recognizes when advisor memory changes a later forecast", () => {
    const state = createGame(305);
    state.activeCardId = "whistleblower";
    state.cardHistory.push({
      cardId: "whistleblower",
      turn: state.turn,
      choiceId: null,
      outcomeId: null,
      causedByDecisionId: null,
      status: "presented",
    });
    const remembered = commitAction(state, {
      type: "resolve_card",
      choiceId: "protect",
    }).state;
    remembered.activeCardId = null;
    const consulted = consultAdvisor(remembered, "steward").state;

    const { beats } = resolveCurrentTurn(consulted, {
      type: "recover_resource",
      resource: "money",
    });

    expect(beats.find((beat) => beat.title === "A remembered choice changed the forecast")
      ?.explanation).toMatch(/earlier relationship.*forecast/i);
  });

  it("recognizes an archetype consultation ability as a strategic connection", () => {
    const state = createGame(306, "operator");
    state.activeCardId = null;
    const consulted = consultAdvisor(state, "fixer", true).state;

    const { beats } = resolveCurrentTurn(consulted, {
      type: "recover_resource",
      resource: "money",
    });

    expect(beats.find((beat) => beat.title === "Doctrine and advice combined")
      ?.explanation).toMatch(/contain the next ignored Situation Card/i);
  });

  it("explains a newly crossed Completion Pressure tier with current cadence", () => {
    const state = createGame(307);
    state.activeCardId = null;
    state.tracks = { engineering: 25, access: 0, legitimacy: 0, stability: 0 };
    state.resources = {
      money: 100,
      influence: 100,
      intelligence: 100,
      trust: 100,
      capacity: 100,
    };

    const { beats } = resolveCurrentTurn(state, {
      type: "deposit",
      track: "access",
      size: "standard",
    });
    const problem = beats.find((beat) => beat.kind === "problem");

    expect(problem?.explanation).toMatch(/quiet to watched/i);
    expect(problem?.explanation).toMatch(/Corporation responses.*every/i);
    expect(problem?.exactChanges).toContain("BRB visibility quiet → watched");
  });
});
