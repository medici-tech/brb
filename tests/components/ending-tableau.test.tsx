// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EndingTableauView } from "../../src/components/brb/EndingTableauView.js";
import { BRBApp } from "../../src/components/brb/BRBApp.js";
import { commitAction, createGame } from "../../src/game/engine.js";
import { saveLatestReport } from "../../src/game/storage.js";
import { ENDING_IDS } from "../../src/game/types.js";
import type { AdvisorId, EndingId, GameState } from "../../src/game/types.js";

// Derived from the union, not hand-listed. The previous literal array omitted
// the advisor endings, so the suite that exists to prove every ending renders a
// tableau silently skipped the two that had no treatment.
const ENDINGS: readonly EndingId[] = ENDING_IDS;

function endedState(
  endingId: EndingId,
  leverage: Partial<Record<AdvisorId, number>> = {},
): GameState {
  const state = createGame(808);
  state.phase = "ended";
  state.ending = {
    id: endingId,
    title: `Ending ${endingId}`,
    description: "The campaign is complete.",
    victory: endingId === "civic_legacy",
    reason: "The final state has been recorded.",
    variationId: null,
    variationTitle: null,
  };
  for (const [id, value] of Object.entries(leverage)) {
    state.advisors[id as AdvisorId].leverage = value!;
  }
  return state;
}

describe("ending tableau", () => {
  it("lights the seizing advisor's station on a coup", () => {
    const { container } = render(
      <EndingTableauView
        state={endedState("advisor_coup", { fixer: 92 })}
        onOpenReport={() => undefined}
      />,
    );
    const presentation = container.querySelector("[data-authority]")!;
    expect(presentation).toHaveAttribute("data-authority", "seized");
    expect(presentation).toHaveAttribute("data-authority-holders", "fixer");
    // Occupancy is the load-bearing signal: the building is captured, not
    // emptied, so every station stays staffed.
    expect(container.querySelectorAll("[data-room-actor]").length)
      .toBeGreaterThanOrEqual(3);
  });

  it("names every cabal member on a shared takeover", () => {
    const { container } = render(
      <EndingTableauView
        state={endedState("advisor_cabal", { analyst: 62, steward: 58 })}
        onOpenReport={() => undefined}
      />,
    );
    const presentation = container.querySelector("[data-authority]")!;
    expect(presentation).toHaveAttribute("data-authority", "shared");
    expect(presentation).toHaveAttribute(
      "data-authority-holders",
      "analyst steward",
    );
  });

  it("still reads as a takeover when no holder survives in the save", () => {
    // A legacy save can carry the ending without the leverage that produced it.
    const { container } = render(
      <EndingTableauView
        state={endedState("advisor_coup")}
        onOpenReport={() => undefined}
      />,
    );
    const presentation = container.querySelector("[data-authority]")!;
    expect(presentation).toHaveAttribute("data-authority", "seized");
    expect(presentation).toHaveAttribute("data-authority-holders", "none");
  });

  it.each(ENDINGS)("carries %s on the page shell for full-page treatment", (endingId) => {
    const { container } = render(
      <EndingTableauView
        state={endedState(endingId)}
        onOpenReport={() => undefined}
      />,
    );
    expect(container.querySelector("[data-ending-tableau]"))
      .toHaveAttribute("data-ending-tableau", endingId);
  });


  it.each(ENDINGS)("renders a player-paced %s tableau", async (endingId) => {
    const state = createGame(808);
    state.phase = "ended";
    state.ending = {
      id: endingId,
      title: `Ending ${endingId}`,
      description: "The campaign is complete.",
      victory: endingId === "civic_legacy",
      reason: "The final state has been recorded.",
      variationId: null,
      variationTitle: null,
    };
    const onOpenReport = vi.fn();

    render(
      <EndingTableauView state={state} onOpenReport={onOpenReport} />,
    );

    const heading = screen.getByRole("heading", {
      name: `Ending ${endingId}`,
    });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(
      screen.getByLabelText(/living control room/i),
    ).toHaveAttribute("data-ending", endingId);
    expect(
      screen.getByLabelText(/living control room/i),
    ).toHaveAttribute("data-tempo", "still");
    const facility = screen.getByTestId("continuity-facility");
    expect(
      facility.querySelector(
        'img[src="/assets/brb/control-room/rooms/continuity-facility.png"]',
      ),
    ).not.toBeNull();
    expect(facility.contains(heading)).toBe(false);

    const reportButton = screen.getByRole("button", {
      name: /open final report/i,
    });
    expect(facility.contains(reportButton)).toBe(false);
    fireEvent.click(reportButton);
    expect(onOpenReport).toHaveBeenCalledOnce();
  });

  it("restores a persisted final report directly after reload", async () => {
    window.localStorage.clear();
    const ready = createGame(909);
    ready.activeCardId = null;
    ready.tracks = {
      engineering: 50,
      access: 50,
      legitimacy: 50,
      stability: 50,
    };
    const completed = commitAction(ready, { type: "activate_brb" }).state;
    if (!completed.report) throw new Error("Expected a completed report.");
    saveLatestReport(window.localStorage, completed.report);

    render(<BRBApp />);

    expect(
      await screen.findByRole("heading", {
        name: completed.report.ending.variationTitle
          ?? completed.report.ending.title,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/campaign outcome/i),
    ).toBeInTheDocument();
  });
});
