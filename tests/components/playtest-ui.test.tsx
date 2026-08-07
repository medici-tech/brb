// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CampaignScreen } from "../../src/components/brb/CampaignScreen.js";
import { HowToPlayDialog } from "../../src/components/brb/HowToPlayDialog.js";
import { PlaytestJournalView } from "../../src/components/brb/PlaytestJournalView.js";
import { PlaytestMarkerBar } from "../../src/components/brb/PlaytestMarkerBar.js";
import { StartScreen } from "../../src/components/brb/StartScreen.js";
import { commitAction, consultAdvisor, createGame } from "../../src/game/index.js";
import { createEmptyPlaytestJournal } from "../../src/playtest/journal.js";

describe("free-play playtest UI", () => {
  it("keeps an in-game mechanics guide available", () => {
    render(<HowToPlayDialog />);
    fireEvent.click(screen.getByRole("button", { name: /field manual/i }));
    expect(screen.getByRole("dialog")).toHaveTextContent(/consult optionally/i);
    expect(screen.getByRole("dialog")).toHaveTextContent(/deposited resources stay spent/i);
    expect(screen.getByRole("dialog")).toHaveTextContent(/corporation watch/i);
    expect(screen.getByRole("dialog")).toHaveTextContent(/delayed echo/i);
  });

  it("surfaces pressure thresholds without a prescribed playtest objective", () => {
    const state = createGame(22);
    render(
      <CampaignScreen
        state={state}
        error={null}
        onCommit={vi.fn()}
        onConsult={vi.fn()}
        onOpenArchive={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/state pressure/i)).toHaveTextContent(/at 100.*campaign ends/i);
    // Free play assigns nothing; the campaign carries no playtest directive.
    expect(screen.queryByText(/active playtest directive/i)).not.toBeInTheDocument();
  });

  it("shows doctrine-locked Directive metadata with player-facing labels", () => {
    const state = createGame({
      seed: 23,
      archetypeId: "operator",
      legacyDirectiveId: "containment_brief",
    });
    render(
      <CampaignScreen
        state={state}
        error={null}
        onCommit={vi.fn()}
        onConsult={vi.fn()}
        onOpenArchive={vi.fn()}
      />,
    );

    expect(screen.getByText(/legacy directive · rare · Operator doctrine/i)).toBeInTheDocument();
    expect(screen.queryByText(/legacy directive · rare · operator$/i)).not.toBeInTheDocument();
  });

  it("shows exact advisor and activation thresholds plus visible consultation blockers", () => {
    const state = createGame(220);
    state.resources.intelligence = 0;
    render(
      <CampaignScreen
        state={state}
        error={null}
        onCommit={vi.fn()}
        onConsult={vi.fn()}
        onOpenArchive={vi.fn()}
      />,
    );

    expect(screen.getAllByText(/consultation requires 2 intelligence/i)).toHaveLength(3);
    expect(screen.getByText(/loyalty.*leaves below 24/i)).toBeInTheDocument();
    expect(screen.getAllByText(/leverage.*leaves at 90/i)).toHaveLength(3);
    expect(screen.getByText(/activation outcome checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/corporation control remained below the capture threshold/i)).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("button", { name: /consult the fixer/i }));
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
    expect(screen.getByText(/advisory opinion · interested advice/i)).toBeInTheDocument();
    expect(screen.getByText(/recommended commitment/i)).toBeInTheDocument();
    expect(screen.getByText(/the steward advises/i)).toBeInTheDocument();
  });

  it("advances the progressive briefing across the first three commitments", () => {
    const state = createGame(12);
    const { rerender } = render(<CampaignScreen state={state} error={null} onCommit={vi.fn()} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /assess.*consult optionally.*commit/i })).toBeInTheDocument();

    state.activeCardId = null;
    const advanced = commitAction(state, { type: "recover_resource", resource: "money" }).state;
    rerender(<CampaignScreen state={advanced} error={null} onCommit={vi.fn()} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /continue to campaign month 2/i }));
    expect(screen.getByRole("heading", { name: /improve.*connect.*new problem/i })).toBeInTheDocument();
  });

  it("pauses on exact consequences before moving focus to the next Situation", () => {
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

    const transition = screen.getByRole("dialog");
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(transition).not.toHaveTextContent(/confirmation required/i);
    expect(transition).toHaveTextContent(/campaign moved.*pushes back/i);
    const beatKinds = Array.from(
      transition.querySelectorAll<HTMLElement>("[data-beat-kind]"),
      (element) => element.dataset.beatKind,
    );
    expect(beatKinds).toEqual(["improvement", "problem"]);
    expect(transition).toHaveTextContent(/money was recovered/i);
    expect(transition).toHaveTextContent(/stress \+7/i);
    expect(screen.getByText(/open exact action-to-consequence record/i)).toBeInTheDocument();
    const hiddenWorkspace = document.querySelector<HTMLElement>(
      '[aria-label="Situation workspace"]',
    );
    const controlRoom = document.querySelector<HTMLElement>("[data-brb-room]");
    expect(hiddenWorkspace).not.toBeNull();
    expect(hiddenWorkspace).not.toHaveFocus();
    expect(controlRoom).toHaveAttribute("data-focus", "assess");

    fireEvent.click(screen.getByRole("button", { name: /continue to campaign month 2/i }));

    const workspace = screen.getByRole("region", { name: /situation workspace/i });
    expect(workspace).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    expect(controlRoom).toHaveAttribute("data-focus", "commit");

    unmount();
    scrollIntoView.mockClear();
    render(<CampaignScreen state={advanced} error={null} onCommit={vi.fn()} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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
    expect(screen.getByLabelText(/campaign objective and loss conditions/i)).toHaveTextContent(
      /stress drains trust at 80 but never directly ends the run/i,
    );
    expect(screen.getByText(/intel \+10.*trust −8.*capacity \+8.*engineering \+5/i)).toBeInTheDocument();
    expect(screen.getAllByText(/situations seen more often/i)).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: /open .* file/i })).toHaveLength(3);
    expect(
      document.querySelector(
        'img[src="/assets/brb/control-room/rooms/intake-office.png"]',
      ),
    ).not.toBeNull();
  });

  it("equips one unlocked Directive or preserves the no-Directive baseline", () => {
    const onStart = vi.fn();
    render(
      <StartScreen
        savedRun={null}
        replayIntent={null}
        unlockedDirectiveIds={["industrial_surge"]}
        onStart={onStart}
        onResume={vi.fn()}
        onOpenArchive={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /no directive/i })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: /industrial surge/i }));
    expect(screen.getByRole("button", { name: /industrial surge/i })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: /open technocrat file/i }));
    expect(onStart).toHaveBeenCalledWith("technocrat", "industrial_surge");
  });

  it("keeps doctrine-locked starts focusable with an accessible reason", () => {
    const onStart = vi.fn();
    render(
      <StartScreen
        savedRun={null}
        replayIntent={null}
        unlockedDirectiveIds={["containment_brief"]}
        onStart={onStart}
        onResume={vi.fn()}
        onOpenArchive={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /containment brief/i }));
    const technocrat = screen.getByRole("button", { name: /open technocrat file/i });
    const populist = screen.getByRole("button", { name: /open populist file/i });
    const operator = screen.getByRole("button", { name: /open operator file/i });

    expect(technocrat).toHaveAttribute("aria-disabled", "true");
    expect(populist).toHaveAttribute("aria-disabled", "true");
    expect(operator).toHaveAttribute("aria-disabled", "false");
    expect(technocrat).not.toBeDisabled();
    expect(technocrat).toHaveClass("cursor-not-allowed", "opacity-45");
    expect(technocrat).toHaveAttribute("aria-describedby", "doctrine-action-reason-technocrat");
    expect(document.getElementById("doctrine-action-reason-technocrat")).toHaveTextContent(
      /Containment Brief requires the Operator doctrine/i,
    );

    fireEvent.click(technocrat);
    expect(onStart).not.toHaveBeenCalled();
    fireEvent.click(operator);
    expect(onStart).toHaveBeenCalledWith("operator", "containment_brief");
  });

  it("keeps replay doctrine fixed and labels the only available replay action accurately", () => {
    const onStart = vi.fn();
    render(
      <StartScreen
        savedRun={null}
        replayIntent={{
          mode: "same_seed",
          seed: 42,
          archetypeId: "technocrat",
          experiment: "Repeat the file",
          legacyDirectiveId: "emergency_appropriation",
        }}
        onStart={onStart}
        onResume={vi.fn()}
        onOpenArchive={vi.fn()}
      />,
    );

    const technocrat = screen.getByRole("button", { name: /replay technocrat file/i });
    const operator = screen.getByRole("button", { name: /open operator file/i });
    expect(technocrat).toHaveAttribute("aria-disabled", "false");
    expect(operator).toHaveAttribute("aria-disabled", "true");
    expect(operator).toHaveAttribute("aria-describedby", "doctrine-action-reason-operator");
    expect(document.getElementById("doctrine-action-reason-operator")).toHaveTextContent(
      /Replay preserves the Technocrat doctrine/i,
    );

    fireEvent.click(operator);
    expect(onStart).not.toHaveBeenCalled();
    fireEvent.click(technocrat);
    expect(onStart).toHaveBeenCalledWith("technocrat", "emergency_appropriation");
  });

  it("drops a one-line marker from the M shortcut", () => {
    const onSave = vi.fn();
    render(<PlaytestMarkerBar onSave={onSave} momentLabel="Month 4" />);

    fireEvent.keyDown(document.body, { key: "m" });
    const input = screen.getByLabelText(/one-line playtest marker/i);
    fireEvent.change(input, { target: { value: "  The save did not resume.  " } });
    // Enter is handled on the input rather than left to implicit form
    // submission, which does not fire reliably for a single-field form.
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSave).toHaveBeenCalledWith("The save did not resume.");
    expect(screen.getByRole("status")).toHaveTextContent(/marker saved at month 4/i);
    expect(screen.queryByLabelText(/one-line playtest marker/i)).not.toBeInTheDocument();
  });

  it("offers a visible control so the shortcut is not the only way in", () => {
    const onSave = vi.fn();
    render(<PlaytestMarkerBar onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: /drop marker/i }));
    expect(screen.getByLabelText(/one-line playtest marker/i)).toBeInTheDocument();
  });

  it("discards the note on Escape", () => {
    const onSave = vi.fn();
    render(<PlaytestMarkerBar onSave={onSave} />);
    fireEvent.keyDown(document.body, { key: "m" });
    const input = screen.getByLabelText(/one-line playtest marker/i);
    fireEvent.change(input, { target: { value: "never mind" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(/one-line playtest marker/i)).not.toBeInTheDocument();
  });

  it("refuses to save an empty note", () => {
    const onSave = vi.fn();
    render(<PlaytestMarkerBar onSave={onSave} />);
    fireEvent.keyDown(document.body, { key: "m" });
    const input = screen.getByLabelText(/one-line playtest marker/i);
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.submit(input.closest("form")!);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves exactly once when Enter also reaches the form", () => {
    const onSave = vi.fn();
    render(<PlaytestMarkerBar onSave={onSave} />);
    fireEvent.keyDown(document.body, { key: "m" });
    const input = screen.getByLabelText(/one-line playtest marker/i);
    fireEvent.change(input, { target: { value: "once only" } });

    const form = input.closest("form")!;
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.submit(form);

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("stays out of the way while the player is typing or reading a dialog", () => {
    render(
      <>
        <textarea aria-label="somewhere else" />
        <PlaytestMarkerBar onSave={vi.fn()} />
      </>,
    );

    fireEvent.keyDown(screen.getByLabelText(/somewhere else/i), { key: "m" });
    expect(screen.queryByLabelText(/one-line playtest marker/i)).not.toBeInTheDocument();

    // A modifier chord belongs to the browser or the OS, never to the marker.
    fireEvent.keyDown(document.body, { key: "m", metaKey: true });
    expect(screen.queryByLabelText(/one-line playtest marker/i)).not.toBeInTheDocument();

    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("data-state", "open");
    document.body.append(dialog);
    fireEvent.keyDown(document.body, { key: "m" });
    expect(screen.queryByLabelText(/one-line playtest marker/i)).not.toBeInTheDocument();
    dialog.remove();
  });

  it("reports coverage and supports repeat journal exports", () => {
    const createObjectURL = vi.fn(() => "blob:journal");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    render(
      <PlaytestJournalView
        journal={createEmptyPlaytestJournal("2026-07-16T12:00:00.000Z")}
        activeRunId={null}
        reportRunId={null}
        onBack={vi.fn()}
        onResumeActiveRun={vi.fn()}
        onOpenLatestReport={vi.fn()}
        onDeleteJournal={vi.fn()}
      />,
    );

    expect(screen.getByText(/0 runs recorded · 0 markers/i)).toBeInTheDocument();
    expect(screen.getByText(/not yet observed/i)).toBeInTheDocument();
    // Free play starts from the opening file; the journal never starts a run.
    expect(screen.queryByRole("button", { name: /start guided run/i })).not.toBeInTheDocument();

    const exportButton = screen.getByRole("button", { name: /export playtest journal/i });
    fireEvent.click(exportButton);
    fireEvent.click(exportButton);
    expect(createObjectURL).toHaveBeenCalledTimes(2);
    expect(click).toHaveBeenCalledTimes(2);
    click.mockRestore();
  });
});
