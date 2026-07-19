// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CampaignScreen } from "../../src/components/brb/CampaignScreen.js";
import { HowToPlayDialog } from "../../src/components/brb/HowToPlayDialog.js";
import { PlaytestBookmarkDialog } from "../../src/components/brb/PlaytestBookmarkDialog.js";
import { PlaytestJournalView } from "../../src/components/brb/PlaytestJournalView.js";
import { PlaytestRecapForm } from "../../src/components/brb/PlaytestRecapForm.js";
import { StartScreen } from "../../src/components/brb/StartScreen.js";
import { commitAction, consultAdvisor, createGame } from "../../src/game/index.js";
import { createEmptyPlaytestJournal } from "../../src/playtest/journal.js";

describe("guided playtest UI", () => {
  it("keeps an in-game mechanics guide available", () => {
    render(<HowToPlayDialog />);
    fireEvent.click(screen.getByRole("button", { name: /how to play/i }));
    expect(screen.getByRole("dialog")).toHaveTextContent(/one optional consultation and one commitment/i);
    expect(screen.getByRole("dialog")).toHaveTextContent(/deposits permanently advance/i);
    expect(screen.getByRole("dialog")).toHaveTextContent(/corporation watch/i);
    expect(screen.getByRole("dialog")).toHaveTextContent(/delayed echo/i);
  });

  it("surfaces pressure thresholds and a concrete guided directive", () => {
    const state = createGame(22);
    render(
      <CampaignScreen
        state={state}
        error={null}
        onCommit={vi.fn()}
        onConsult={vi.fn()}
        onOpenArchive={vi.fn()}
        guidedObjective={{
          label: "Technocrat · slow defense",
          strategy: "Stabilize the state before accelerating the BRB.",
          checklist: ["Favor Standard Deposits.", "Consult before countering."],
        }}
      />,
    );
    expect(screen.getByLabelText(/state pressure/i)).toHaveTextContent(/at 100.*campaign ends/i);
    expect(screen.getByRole("heading", { name: /technocrat · slow defense/i })).toBeInTheDocument();
    expect(screen.getByText(/favor standard deposits/i)).toBeInTheDocument();
  });

  it("keeps normal consultation separate from an archetype ability", () => {
    const state = createGame(23, "operator");
    const onConsult = vi.fn();
    render(
      <CampaignScreen
        state={state}
        error={null}
        onCommit={vi.fn()}
        onConsult={onConsult}
        onOpenArchive={vi.fn()}
      />,
    );
    fireEvent.click(screen.getAllByRole("button", { name: /^consult$/i })[1]!);
    expect(onConsult).toHaveBeenCalledWith("fixer", false);
    fireEvent.click(screen.getByRole("button", { name: /contain the next file/i }));
    expect(onConsult).toHaveBeenCalledWith("fixer", true);
  });

  it("turns a consultation into a specific biased recommendation", () => {
    const state = createGame(24);
    const consulted = consultAdvisor(state, "steward").state;
    render(
      <CampaignScreen
        state={consulted}
        error={null}
        onCommit={vi.fn()}
        onConsult={vi.fn()}
        onOpenArchive={vi.fn()}
      />,
    );
    expect(screen.getByText(/advisory opinion · not an optimality claim/i)).toBeInTheDocument();
    expect(screen.getByText(/recommended commitment/i)).toBeInTheDocument();
    expect(screen.getByText(/the steward advises/i)).toBeInTheDocument();
  });

  it("advances the progressive briefing across the first three commitments", () => {
    const state = createGame(12);
    const { rerender } = render(<CampaignScreen state={state} error={null} onCommit={vi.fn()} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /read the stakes before you commit/i })).toBeInTheDocument();

    state.activeCardId = null;
    const advanced = commitAction(state, { type: "recover_resource", resource: "money" }).state;
    rerender(<CampaignScreen state={advanced} error={null} onCommit={vi.fn()} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /every change has a source/i })).toBeInTheDocument();
  });

  it("moves keyboard focus and the viewport to the Situation after a commitment", () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    const state = createGame(12);
    const { rerender, unmount } = render(<CampaignScreen state={state} error={null} onCommit={vi.fn()} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);
    const prepared = structuredClone(state);
    prepared.activeCardId = null;
    const advanced = commitAction(prepared, { type: "recover_resource", resource: "money" }).state;

    rerender(<CampaignScreen state={advanced} error={null} onCommit={vi.fn()} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);

    const workspace = screen.getByRole("region", { name: /situation workspace/i });
    expect(workspace).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });

    unmount();
    scrollIntoView.mockClear();
    render(<CampaignScreen state={advanced} error={null} onCommit={vi.fn()} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);
    expect(screen.getByRole("region", { name: /situation workspace/i })).not.toHaveFocus();
    expect(scrollIntoView).not.toHaveBeenCalled();
    Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  });

  it("offers a visible first step toward the doctrine controls", () => {
    render(
      <StartScreen
        savedRun={null}
        replayIntent={null}
        onStart={vi.fn()}
        onResume={vi.fn()}
        onOpenArchive={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /choose an operating doctrine/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /open .* file/i })).toHaveLength(3);
  });

  it("collects a categorized bookmark note", () => {
    const onSave = vi.fn();
    render(<PlaytestBookmarkDialog onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: /bookmark this moment/i }));
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "bug" } });
    fireEvent.change(screen.getByLabelText(/severity/i), { target: { value: "high" } });
    fireEvent.change(screen.getByLabelText(/short note/i), { target: { value: "The save did not resume." } });
    fireEvent.click(screen.getByRole("button", { name: /save bookmark/i }));
    expect(onSave).toHaveBeenCalledWith({ category: "bug", severity: "high", note: "The save did not resume." });
  });

  it("saves the structured end-of-run recap", () => {
    const onSave = vi.fn();
    render(<PlaytestRecapForm existing={null} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText(/next experiment/i), { target: { value: "Protect institutions earlier." } });
    fireEvent.click(screen.getByRole("button", { name: /save recap/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      fairness: 3,
      pacing: "about_right",
      nextExperiment: "Protect institutions earlier.",
    }));
  });

  it("shows matrix progress and supports repeat journal exports", () => {
    const createObjectURL = vi.fn(() => "blob:journal");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    render(
      <PlaytestJournalView
        journal={createEmptyPlaytestJournal("2026-07-16T12:00:00.000Z")}
        hasActiveRun={false}
        hasLatestReport={false}
        onBack={vi.fn()}
        onStartSlot={vi.fn()}
        onResumeActiveRun={vi.fn()}
        onOpenLatestReport={vi.fn()}
        onClearActiveRun={vi.fn()}
        onDeleteJournal={vi.fn()}
      />,
    );
    expect(screen.getByText(/0 \/ 6 matrix runs complete/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /complete prior run/i })).toHaveLength(5);
    const exportButton = screen.getByRole("button", { name: /export playtest journal/i });
    fireEvent.click(exportButton);
    fireEvent.click(exportButton);
    expect(createObjectURL).toHaveBeenCalledTimes(2);
    expect(click).toHaveBeenCalledTimes(2);
    click.mockRestore();
  });
});
