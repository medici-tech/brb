import { describe, expect, it } from "vitest";
import { SITUATION_CARDS } from "../../src/game/content.js";
import { commitAction, createGame } from "../../src/game/engine.js";
import { emptyDecision } from "../../src/game/state-helpers.js";
import {
  ACTION_SCENE_SCRIPTS,
  CONSULTATION_SCENE_SCRIPTS,
} from "../../src/components/brb/narrative/sceneCatalogActions.js";
import { NARRATIVE_LOCATIONS } from "../../src/components/brb/narrative/sceneLocations.js";
import {
  derivePersistentRoomMarks,
  getDecisionSceneKey,
  getDepositSceneKeys,
  getMissingCardSceneKeys,
  resolveNarrativeSceneCues,
} from "../../src/components/brb/narrative/sceneResolver.js";
import {
  CARD_SCENE_SCRIPTS,
  NARRATIVE_SCENE_REGISTRY,
} from "../../src/components/brb/narrative/sceneRegistry.js";
import { NARRATIVE_SCENE_IDS } from "../../src/components/brb/narrative/sceneTypes.js";
import type {
  DecisionRecord,
  DecisionSubject,
  GameState,
  ResolvedEffect,
  StateDelta,
} from "../../src/game/types.js";

function emptyDelta(): StateDelta {
  return {
    resources: {},
    pressures: {},
    tracks: {},
    advisors: {},
  };
}

function effect(label: string): ResolvedEffect {
  return { label, delta: emptyDelta() };
}

function withResolution(state: GameState): GameState {
  state.lastTurnResolution = {
    month: state.turn,
    ignoredSituation: null,
    commitment: effect("Commitment"),
    advisorReactions: null,
    corporationResponse: null,
    monthlyPressure: null,
  };
  return state;
}

function decision(
  state: GameState,
  category: DecisionRecord["category"],
  summary: string,
  cardId: string | null = null,
  choiceId: string | null = null,
  subject: DecisionSubject | null = null,
): DecisionRecord {
  return emptyDecision(state, category, summary, cardId, choiceId, subject);
}

describe("narrative scene registry", () => {
  it("defines all six approved top-down locations", () => {
    expect(Object.keys(NARRATIVE_LOCATIONS).sort()).toEqual(
      [...NARRATIVE_SCENE_IDS].sort(),
    );
  });

  it("covers all 30 selected and 15 ignored Situation outcomes", () => {
    expect(SITUATION_CARDS).toHaveLength(15);
    expect(Object.keys(CARD_SCENE_SCRIPTS)).toHaveLength(45);
    expect(
      getMissingCardSceneKeys(SITUATION_CARDS, NARRATIVE_SCENE_REGISTRY),
    ).toEqual([]);
  });

  it("keeps every authored card script unique and ordered", () => {
    const scripts = Object.values(CARD_SCENE_SCRIPTS);
    const titles = scripts.flatMap((script) =>
      script.beats.map((beat) => beat.title)
    );
    const descriptions = scripts.flatMap((script) =>
      script.beats.map((beat) => beat.description)
    );

    expect(new Set(titles).size).toBe(135);
    expect(new Set(descriptions).size).toBe(135);
    for (const script of scripts) {
      expect(script.beats.map((beat) => beat.id)).toEqual([
        "setup",
        "action",
        "consequence",
      ]);
      expect(script.sourceKey).toBe(
        Object.entries(CARD_SCENE_SCRIPTS).find(
          ([, candidate]) => candidate === script,
        )?.[0],
      );
    }
  });

  it("keeps every resolved three-beat script on its fixed 14×10 tile grid", () => {
    for (const script of Object.values(NARRATIVE_SCENE_REGISTRY)) {
      expect(script.beats.map((beat) => beat.id)).toEqual([
        "setup",
        "action",
        "consequence",
      ]);
      for (const beat of script.beats) {
        const positions = [
          beat.focus,
          ...beat.actors.map((actor) => actor.position),
          ...beat.props.map((prop) => prop.position),
        ];
        for (const position of positions) {
          expect(Number.isInteger(position.x)).toBe(true);
          expect(Number.isInteger(position.y)).toBe(true);
          expect(position.x).toBeGreaterThanOrEqual(0);
          expect(position.x).toBeLessThan(14);
          expect(position.y).toBeGreaterThanOrEqual(0);
          expect(position.y).toBeLessThan(10);
        }
      }
    }
  });

  it("covers every non-card commitment subtype and consultation", () => {
    const expected = [
      ...getDepositSceneKeys(),
      ...["expanding", "infiltrating", "discrediting", "buying_influence"].flatMap(
        (strategy) => [
          `action:counter:${strategy}:correct`,
          `action:counter:${strategy}:wrong`,
        ],
      ),
      ...["analyst", "fixer", "steward"].map(
        (advisor) => `action:advisor:${advisor}`,
      ),
      ...["money", "influence", "intelligence", "capacity", "trust"].map(
        (resource) => `action:recover:${resource}`,
      ),
      "action:faction",
      "action:institutions",
      "action:activate",
    ];

    expect(expected.every((key) => ACTION_SCENE_SCRIPTS[key])).toBe(true);
    expect(Object.keys(CONSULTATION_SCENE_SCRIPTS).sort()).toEqual([
      "consult:analyst",
      "consult:fixer",
      "consult:steward",
    ]);
  });
});

describe("narrative scene resolver", () => {
  it("derives stable semantic keys from structured DecisionSubject", () => {
    const state = createGame(902);
    expect(
      getDecisionSceneKey(
        decision(
          state,
          "deposit",
          "Large engineering deposit permanently committed.",
          null,
          null,
          { kind: "deposit", track: "engineering", size: "large" },
        ),
      ),
    ).toBe("action:deposit:engineering:large");
    expect(
      getDecisionSceneKey(
        decision(
          state,
          "counter",
          "The counter-operation targeted the wrong strategy.",
          null,
          null,
          {
            kind: "counter",
            strategy: "buying_influence",
            outcome: "wrong",
          },
        ),
      ),
    ).toBe("action:counter:buying_influence:wrong");
    expect(
      getDecisionSceneKey(
        decision(
          state,
          "card",
          "A Regional Blackout: Restore public service first",
          "regional_blackout",
          "public",
        ),
      ),
    ).toBe("card:regional_blackout:public");
    expect(
      getDecisionSceneKey(
        decision(
          state,
          "advisor",
          "The Fixer received authority to contain the next ignored Situation Card.",
          null,
          null,
          { kind: "consult", advisorId: "fixer" },
        ),
      ),
    ).toBe("consult:fixer");
  });

  it("keys wrong-strategy counters from engine subjects without summary prose", () => {
    const initial = createGame(905);
    initial.activeCardId = null;
    initial.corporation.strategy = "expanding";
    initial.resources.intelligence = 20;
    initial.resources.influence = 20;

    const result = commitAction(initial, {
      type: "counter_corporation",
      predictedStrategy: "buying_influence",
    });

    expect(result.accepted).toBe(true);
    const recorded = result.state.decisionHistory.at(-1);
    expect(recorded?.summary).toBe(
      "The counter-operation targeted the wrong strategy.",
    );
    expect(recorded?.subject).toEqual({
      kind: "counter",
      strategy: "buying_influence",
      outcome: "wrong",
    });
    expect(getDecisionSceneKey(recorded!)).toBe(
      "action:counter:buying_influence:wrong",
    );
    expect(NARRATIVE_SCENE_REGISTRY[getDecisionSceneKey(recorded!)]).toBeDefined();
  });

  it("preserves ignored-card precedence before the selected commitment", () => {
    const state = withResolution(createGame(903));
    const ignored = decision(
      state,
      "card",
      "The Missing Appropriation: Ignored and escalated",
      "budget_shortfall",
      "ignored",
    );
    const commitment = decision(
      state,
      "institutions",
      "Institutional safeguards were reinforced.",
      null,
      null,
      { kind: "institutions" },
    );
    state.decisionHistory.push(ignored, commitment);

    const cues = resolveNarrativeSceneCues(state, NARRATIVE_SCENE_REGISTRY);

    expect(cues.map((cue) => cue.script.sourceKey)).toEqual([
      "card:budget_shortfall:ignored",
      "action:institutions",
    ]);
  });

  it("derives major persistent scars from canonical game state", () => {
    const state = createGame(904);
    state.pressures.stress = 80;
    state.institutions = 20;
    state.corporation.progress = 60;
    state.tracks = {
      engineering: 50,
      access: 50,
      legitimacy: 50,
      stability: 50,
    };
    state.advisors.fixer.active = false;
    const firstRoute = Object.values(state.routes)[0];
    if (firstRoute) firstRoute.status = "completed";

    expect(derivePersistentRoomMarks(state)).toEqual({
      emergencyLevel: "critical",
      institutionalCondition: "breached",
      corporationPresence: "embedded",
      brbConstruction: "ready",
      departedAdvisors: ["fixer"],
      completedRouteCount: 1,
    });
  });
});
