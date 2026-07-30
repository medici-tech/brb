import { describe, expect, it } from "vitest";
import { SITUATION_CARDS } from "../../src/game/content.js";
import { createGame } from "../../src/game/engine.js";
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
): DecisionRecord {
  return emptyDecision(state, category, summary, cardId, choiceId);
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
  it("derives stable semantic keys without renderer state", () => {
    const state = createGame(902);
    expect(
      getDecisionSceneKey(
        decision(
          state,
          "deposit",
          "Large engineering deposit permanently committed.",
        ),
      ),
    ).toBe("action:deposit:engineering:large");
    expect(
      getDecisionSceneKey(
        decision(
          state,
          "counter",
          "The buying influence counter-operation targeted the wrong strategy.",
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
        ),
      ),
    ).toBe("consult:fixer");
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
