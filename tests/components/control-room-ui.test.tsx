// @vitest-environment happy-dom

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CampaignScreen } from "../../src/components/brb/CampaignScreen.js";
import { ControlRoomPresentation } from "../../src/components/brb/control-room/ControlRoomPresentation.js";
import { resolveLighting } from "../../src/components/brb/control-room/presentationStateResolver.js";
import type {
  BrbVisualStage,
  PresentationModel,
} from "../../src/components/brb/control-room/presentationStateResolver.js";
import { createGame } from "../../src/game/engine.js";

const calmModel: PresentationModel = {
  state: "calm",
  stateLabel: "Calm",
  caption: "Routine channels remain open.",
  focus: "assess",
  brbProgress: 0,
  brbStage: "sealed",
  shot: "operations",
  tempo: "ambient",
  litStation: null,
  paperLoad: "sparse",
  endingId: null,
  lighting: "calm",
  authority: { mode: "public", holders: [] },
  staffLayout: {
    mode: "full",
    crossingVisible: false,
    crossingDirection: "left-to-right",
  },
};

/**
 * Build a scenario model the way `resolvePresentationModel` would.
 *
 * `lighting` is a model field rather than something the component re-derives, so
 * a hand-written literal can now claim `state: "crisis"` while still carrying
 * `lighting: "calm"`. Deriving it here keeps these fixtures honest and means the
 * scenarios exercise the real grade mapping rather than restating it.
 */
function scenarioModel(
  overrides: Partial<PresentationModel>,
): PresentationModel {
  const merged = { ...calmModel, ...overrides };
  return {
    ...merged,
    lighting: resolveLighting(merged.state, merged.endingId),
  };
}

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
    const artSources = [...document.querySelectorAll("img")].map((image) =>
      image.getAttribute("src"),
    );
    expect(artSources).toEqual(
      expect.arrayContaining([
        "/assets/brb/control-room/rooms/continuity-facility.png",
        "/assets/brb/control-room/monitors/control-room-screens.png",
        "/assets/brb/control-room/environment/security-camera.png",
        "/assets/brb/control-room/staff/analyst-idle.png",
        "/assets/brb/control-room/staff/operator-idle.png",
        "/assets/brb/control-room/staff/steward-idle.png",
      ]),
    );
    expect(
      within(workspace).getByText(/routine channels remain open/i),
    ).toBeInTheDocument();
    expect(state).toEqual(before);
  });

  it("uses the complete room base without an in-room label layer", () => {
    const { container } = render(
      <ControlRoomPresentation
        model={calmModel}
        turn={1}
        hasActiveSituation={false}
      />,
    );

    expect(
      container.querySelector(
        'img[src="/assets/brb/control-room/rooms/continuity-facility.png"]',
      ),
    ).not.toBeNull();
    expect(container.querySelector("[data-art]")).toBeNull();
    expect(container.querySelector("[data-room-layer='ui']")).toBeNull();
    expect(container.textContent).not.toMatch(
      /analysis|operations|institutions|private system|focus:/i,
    );
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
    expect(workspace.querySelector("[data-room-stage]")).not.toBeNull();
    expect(
      within(workspace).getByRole("heading", { name: /the missing appropriation/i }),
    ).toBeInTheDocument();
    expect(
      within(workspace).getByRole("button", { name: /cut public programs/i }),
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
      vi.advanceTimersByTime(900);
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

  it("keeps a static Commit acknowledgement in reduced-motion mode", () => {
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
    expect(controlRoom).toHaveAttribute("data-focus", "commit");

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(controlRoom).toHaveAttribute("data-focus", "assess");
  });

  it.each([
    {
      name: "calm sealed room",
      model: calmModel,
      lighting: "calm",
      staff: ["analyst", "fixer", "steward"],
      objects: ["monitor-bank", "security-camera"],
    },
    {
      name: "strained construction room",
      model: scenarioModel({
        state: "strained",
        stateLabel: "Strained",
        brbProgress: 55,
        brbStage: "construction",
        paperLoad: "burdened",
      }),
      lighting: "strained",
      staff: ["analyst", "fixer", "steward"],
      objects: [
        "brb-machinery",
        "evidence-clutter",
        "equipment-clutter",
      ],
    },
    {
      name: "institutional failure",
      model: scenarioModel({
        state: "institutional-failure",
        stateLabel: "Institutional Failure",
        staffLayout: {
          ...calmModel.staffLayout,
          mode: "skeleton",
        },
        persistentRoomMarks: {
          emergencyLevel: "critical",
          institutionalCondition: "breached",
          corporationPresence: "distant",
          brbConstruction: "unstable",
          departedAdvisors: [],
          completedRouteCount: 2,
        },
      }),
      lighting: "failure",
      staff: ["fixer"],
      objects: ["architectural-damage"],
    },
    {
      name: "embedded Corporation",
      model: scenarioModel({
        state: "corporate-encroachment",
        stateLabel: "Corporate Encroachment",
        persistentRoomMarks: {
          emergencyLevel: "strained",
          institutionalCondition: "worn",
          corporationPresence: "embedded",
          brbConstruction: "framed",
          departedAdvisors: ["analyst"],
          completedRouteCount: 1,
        },
      }),
      lighting: "strained",
      staff: ["fixer", "steward", "corporation-officer"],
      objects: ["corporation-presence", "architectural-damage"],
    },
  ])("renders physical state for $name without mutating the model", (scenario) => {
    const before = structuredClone(scenario.model);
    const { container } = render(
      <ControlRoomPresentation
        model={scenario.model}
        turn={8}
        hasActiveSituation={false}
        reducedMotionOverride
      />,
    );

    expect(
      screen.getByTestId("continuity-facility"),
    ).toHaveAttribute("data-lighting", scenario.lighting);
    for (const actor of scenario.staff) {
      expect(
        container.querySelector(`[data-room-actor="${actor}"]`),
      ).not.toBeNull();
    }
    for (const object of scenario.objects) {
      expect(
        container.querySelector(`[data-room-object="${object}"]`),
      ).not.toBeNull();
    }
    expect(scenario.model).toEqual(before);
  });

  it("shows a transient Corporation channel without promoting persistent presence", () => {
    const model = {
      ...calmModel,
      state: "corporate-encroachment",
      stateLabel: "Corporate Encroachment",
      persistentRoomMarks: {
        emergencyLevel: "routine",
        institutionalCondition: "secure",
        corporationPresence: "distant",
        brbConstruction: "sealed",
        departedAdvisors: [],
        completedRouteCount: 0,
      },
    } satisfies PresentationModel;
    const { container } = render(
      <ControlRoomPresentation
        model={model}
        turn={3}
        hasActiveSituation
        reducedMotionOverride
      />,
    );

    expect(
      container.querySelector('[data-room-object="corporation-channel"]'),
    ).not.toBeNull();
    expect(screen.getByLabelText(/living control room/i)).toHaveAttribute(
      "data-corporation-presence",
      "distant",
    );
  });

  it.each<BrbVisualStage>([
    "sealed",
    "infrastructure",
    "construction",
    "unstable",
    "activation-ready",
  ])("renders the %s BRB machinery stage without changing presentation state", (stage) => {
    const model = {
      ...calmModel,
      brbStage: stage,
    } satisfies PresentationModel;
    const before = structuredClone(model);
    const { container } = render(
      <ControlRoomPresentation
        model={model}
        turn={5}
        hasActiveSituation={false}
        reducedMotionOverride
      />,
    );

    expect(screen.getByLabelText(/living control room/i)).toHaveAttribute(
      "data-brb-stage",
      stage,
    );
    const machinery = container.querySelectorAll(
      '[data-room-object="brb-machinery"]',
    );
    expect(machinery).toHaveLength(
      stage === "sealed"
        ? 0
        : stage === "infrastructure"
          ? 1
          : stage === "construction"
            ? 2
            : stage === "unstable"
              ? 3
              : 2,
    );
    expect(
      container.querySelectorAll('[data-room-object="brb-activation"]'),
    ).toHaveLength(stage === "activation-ready" ? 1 : 0);
    expect(model).toEqual(before);
  });
});
