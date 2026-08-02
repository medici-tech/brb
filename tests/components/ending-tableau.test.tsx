// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EndingTableauView } from "../../src/components/brb/EndingTableauView.js";
import { BRBApp } from "../../src/components/brb/BRBApp.js";
import { commitAction, createGame } from "../../src/game/engine.js";
import { saveLatestReport } from "../../src/game/storage.js";
import type { EndingId } from "../../src/game/types.js";

const ENDINGS: EndingId[] = [
  "civic_legacy",
  "compromised_activation",
  "corporate_capture",
  "state_collapse",
];

describe("ending tableau", () => {
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
