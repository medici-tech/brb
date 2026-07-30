// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NarrativeAftermath } from "../../src/components/brb/narrative/NarrativeAftermath.js";
import { TurnTransitionDialog } from "../../src/components/brb/TurnTransitionDialog.js";
import { ACTION_SCENE_SCRIPTS } from "../../src/components/brb/narrative/sceneCatalogActions.js";
import { commitAction, createGame } from "../../src/game/engine.js";
import { deriveTurnBeats } from "../../src/game/turn-beats.js";
import type { NarrativeSceneCue } from "../../src/components/brb/narrative/sceneTypes.js";

function cue(): NarrativeSceneCue {
  const script = ACTION_SCENE_SCRIPTS["action:institutions"];
  if (!script) throw new Error("Institution scene fixture is missing.");
  return {
    decisionId: "D4-2",
    decisionSummary: "Institutional safeguards were reinforced.",
    script,
    persistentMarks: {
      emergencyLevel: "strained",
      institutionalCondition: "worn",
      corporationPresence: "visible",
      brbConstruction: "active",
      departedAdvisors: [],
      completedRouteCount: 1,
    },
  };
}

describe("Narrative aftermath UI", () => {
  it("lets the player step and skip through the visual consequence", () => {
    render(
      <NarrativeAftermath
        cues={[cue()]}
        turnBeats={[
          {
            kind: "improvement",
            title: "Institutions recovered",
            explanation: "Public safeguards rose.",
            exactChanges: ["Institutions +11"],
            linkedDecisionIds: ["D4-2"],
          },
          {
            kind: "problem",
            title: "The Corporation used the month",
            explanation: "The next commitment inherits a harder position.",
            exactChanges: [],
            linkedDecisionIds: ["D4-2"],
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("region", {
        name: /continuity floor: the room assembles around the choice/i,
      }),
    ).toHaveAttribute("data-beat", "setup");
    expect(screen.getByText("Institutions recovered")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next beat/i }));
    expect(
      screen.getByRole("region", {
        name: /continuity floor: institutional safeguards are reinforced/i,
      }),
    ).toHaveAttribute("data-beat", "action");

    fireEvent.click(
      screen.getByRole("button", { name: /skip to consequence/i }),
    );
    expect(
      screen.getByRole("region", {
        name: /continuity floor: the physical record remains/i,
      }),
    ).toHaveAttribute("data-beat", "consequence");
    expect(
      screen.getByText(/visual consequence entered into the record/i),
    ).toBeInTheDocument();
  });

  it("plays ignored-card choreography before the selected commitment", () => {
    const ignored = ACTION_SCENE_SCRIPTS["action:faction"];
    const commitment = ACTION_SCENE_SCRIPTS["action:institutions"];
    if (!ignored || !commitment) throw new Error("Scene fixtures are missing.");

    render(
      <NarrativeAftermath
        cues={[
          { ...cue(), decisionId: "D3-1", script: ignored },
          { ...cue(), decisionId: "D3-2", script: commitment },
        ]}
        turnBeats={[]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /skip to consequence/i }),
    );
    expect(
      screen.getByText("Institutional safeguards are reinforced"),
    ).toBeInTheDocument();
  });

  it("connects an accepted engine commitment to the aftermath dialog", () => {
    const initial = createGame(905);
    initial.activeCardId = null;
    const result = commitAction(initial, {
      type: "recover_resource",
      resource: "money",
    });
    expect(result.accepted).toBe(true);
    const state = result.state;

    render(
      <TurnTransitionDialog
        beats={deriveTurnBeats(state, state.lastTurnResolution)}
        echoTypes={[]}
        nextTurn={state.turn}
        onContinue={() => undefined}
        open
        resolution={state.lastTurnResolution}
        state={state}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /money recovered/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", {
        name: /corporate suite: the room assembles around the choice/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue to campaign month 2/i }),
    ).toBeInTheDocument();
  });
});
