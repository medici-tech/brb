// @vitest-environment happy-dom

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CampaignScreen } from "../../src/components/brb/CampaignScreen.js";
import { ControlRoomPresentation } from "../../src/components/brb/control-room/ControlRoomPresentation.js";
import type { PresentationModel } from "../../src/components/brb/control-room/presentationStateResolver.js";
import { createGame } from "../../src/game/engine.js";

const calmModel: PresentationModel = {
  state: "calm",
  stateLabel: "Calm",
  caption: "Routine channels remain open.",
  focus: "assess",
  brbProgress: 0,
  brbStage: "sealed",
};

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: originalMatchMedia,
  });
});

describe("Living Control Room UI", () => {
  it("shows an integrated control room when no Situation is active", () => {
    const state = createGame(501);
    state.activeCardId = null;
    const before = structuredClone(state);

    render(
      <CampaignScreen
        state={state}
        error={null}
        onCommit={vi.fn()}
        onConsult={vi.fn()}
        onOpenArchive={vi.fn()}
      />,
    );

    const workspace = screen.getByRole("region", { name: /situation workspace/i });
    expect(
      within(workspace).getByRole("heading", { name: /no active file/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/living control room/i),
    ).toHaveAttribute("data-active-situation", "false");
    expect(screen.getByText(/routine channels remain open/i)).toBeInTheDocument();
    expect(state).toEqual(before);
  });

  it("keeps active Situation content and interactions available", () => {
    const state = createGame(502);
    state.activeCardId = "budget_shortfall";
    const before = structuredClone(state);
    const onCommit = vi.fn();

    render(
      <CampaignScreen
        state={state}
        error={null}
        onCommit={onCommit}
        onConsult={vi.fn()}
        onOpenArchive={vi.fn()}
      />,
    );

    const workspace = screen.getByRole("region", { name: /situation workspace/i });
    expect(
      within(workspace).getByRole("heading", { name: /the missing appropriation/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/living control room/i),
    ).toHaveAttribute("data-active-situation", "true");
    fireEvent.click(screen.getByRole("button", { name: /cut public programs/i }));
    expect(onCommit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /authorize and end month 1/i }));
    expect(onCommit).toHaveBeenCalledWith({
      type: "resolve_card",
      choiceId: "cut",
    });
    expect(state).toEqual(before);
  });

  it("selects static presentation behavior for reduced motion", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <ControlRoomPresentation
        model={calmModel}
        turn={1}
        hasActiveSituation={false}
      />,
    );

    expect(
      screen.getByLabelText(/living control room/i),
    ).toHaveAttribute("data-motion", "reduced");
    expect(screen.getByText(/routine channels remain open/i)).toBeInTheDocument();
  });

  it("responds when the system reduced-motion preference changes", () => {
    let matches = false;
    let notifyPreferenceChange: (() => void) | undefined;
    const mediaQuery = {
      get matches() {
        return matches;
      },
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(
        (_event: string, listener: () => void) => {
          notifyPreferenceChange = listener;
        },
      ),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => mediaQuery),
    });

    render(
      <ControlRoomPresentation
        model={calmModel}
        turn={1}
        hasActiveSituation={false}
      />,
    );

    const controlRoom = screen.getByLabelText(/living control room/i);
    expect(controlRoom).toHaveAttribute("data-motion", "full");

    act(() => {
      matches = true;
      notifyPreferenceChange?.();
    });

    expect(controlRoom).toHaveAttribute("data-motion", "reduced");
  });

  it("briefly shifts focus to Commit after the turn advances", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <ControlRoomPresentation
        model={calmModel}
        turn={1}
        hasActiveSituation={false}
        reducedMotionOverride={false}
      />,
    );

    rerender(
      <ControlRoomPresentation
        model={calmModel}
        turn={2}
        hasActiveSituation={false}
        reducedMotionOverride={false}
      />,
    );

    const controlRoom = screen.getByLabelText(/living control room/i);
    expect(controlRoom).toHaveAttribute("data-focus", "commit");

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(controlRoom).toHaveAttribute("data-focus", "assess");
  });

  it("clears Commit focus if a new campaign rewinds the turn", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <ControlRoomPresentation
        model={calmModel}
        turn={1}
        hasActiveSituation={false}
        reducedMotionOverride={false}
      />,
    );

    rerender(
      <ControlRoomPresentation
        model={calmModel}
        turn={2}
        hasActiveSituation={false}
        reducedMotionOverride={false}
      />,
    );
    expect(screen.getByLabelText(/living control room/i)).toHaveAttribute(
      "data-focus",
      "commit",
    );

    rerender(
      <ControlRoomPresentation
        model={calmModel}
        turn={1}
        hasActiveSituation={false}
        reducedMotionOverride={false}
      />,
    );
    expect(screen.getByLabelText(/living control room/i)).toHaveAttribute(
      "data-focus",
      "assess",
    );
  });

  it("does not run the decorative Commit shift in reduced-motion mode", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <ControlRoomPresentation
        model={calmModel}
        turn={1}
        hasActiveSituation={false}
        reducedMotionOverride
      />,
    );

    rerender(
      <ControlRoomPresentation
        model={calmModel}
        turn={2}
        hasActiveSituation={false}
        reducedMotionOverride
      />,
    );

    const controlRoom = screen.getByLabelText(/living control room/i);
    expect(controlRoom).toHaveAttribute("data-motion", "reduced");
    expect(controlRoom).toHaveAttribute("data-focus", "assess");
  });
});
