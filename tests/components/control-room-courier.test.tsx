// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ControlRoomPresentation } from "../../src/components/brb/control-room/ControlRoomPresentation.js";
import type { PresentationModel } from "../../src/components/brb/control-room/presentationStateResolver.js";

function baseModel(
  overrides: Partial<PresentationModel> = {},
): PresentationModel {
  return {
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
    staffLayout: {
      mode: "full",
      crossingVisible: false,
      crossingDirection: "left-to-right",
    },
    staffPoses: {
      analyst: "working",
      fixer: "working",
      steward: "working",
    },
    ...overrides,
  };
}

describe("Corridor courier animation", () => {
  it("does not render courier when crossingVisible is false", () => {
    const model = baseModel({
      staffLayout: {
        mode: "full",
        crossingVisible: false,
        crossingDirection: "left-to-right",
      },
    });

    render(
      <ControlRoomPresentation
        model={model}
        turn={1}
        hasActiveSituation={false}
        reducedMotionOverride
      />,
    );

    const room = screen.getByTestId("continuity-facility");
    expect(room.querySelector("[data-room-actor='courier']")).toBeNull();
  });

  it("renders courier with corridor-right motion when crossing left-to-right", () => {
    const model = baseModel({
      staffLayout: {
        mode: "full",
        crossingVisible: true,
        crossingDirection: "left-to-right",
      },
    });

    render(
      <ControlRoomPresentation
        model={model}
        turn={2}
        hasActiveSituation={false}
        reducedMotionOverride
      />,
    );

    const room = screen.getByTestId("continuity-facility");
    const courier = room.querySelector("[data-room-actor='courier']");
    expect(courier).not.toBeNull();
    expect(courier).toHaveAttribute("data-motion-cue", "corridor-right");
  });

  it("renders courier with corridor-left motion when crossing right-to-left", () => {
    const model = baseModel({
      staffLayout: {
        mode: "full",
        crossingVisible: true,
        crossingDirection: "right-to-left",
      },
    });

    render(
      <ControlRoomPresentation
        model={model}
        turn={6}
        hasActiveSituation={false}
        reducedMotionOverride
      />,
    );

    const room = screen.getByTestId("continuity-facility");
    const courier = room.querySelector("[data-room-actor='courier']");
    expect(courier).not.toBeNull();
    expect(courier).toHaveAttribute("data-motion-cue", "corridor-left");
  });

  it("renders courier sprite for left-to-right direction", () => {
    const model = baseModel({
      staffLayout: {
        mode: "full",
        crossingVisible: true,
        crossingDirection: "left-to-right",
      },
    });

    render(
      <ControlRoomPresentation
        model={model}
        turn={2}
        hasActiveSituation={false}
        reducedMotionOverride
      />,
    );

    const room = screen.getByTestId("continuity-facility");
    const courier = room.querySelector("[data-room-actor='courier']");
    expect(courier).not.toBeNull();
    expect(courier).toHaveAttribute("data-motion-cue", "corridor-right");
  });

  it("renders courier sprite for right-to-left direction", () => {
    const model = baseModel({
      staffLayout: {
        mode: "full",
        crossingVisible: true,
        crossingDirection: "right-to-left",
      },
    });

    render(
      <ControlRoomPresentation
        model={model}
        turn={6}
        hasActiveSituation={false}
        reducedMotionOverride
      />,
    );

    const room = screen.getByTestId("continuity-facility");
    const courier = room.querySelector("[data-room-actor='courier']");
    expect(courier).not.toBeNull();
    expect(courier).toHaveAttribute("data-motion-cue", "corridor-left");
  });

  it("courier respects reduced motion via data-motion attribute", () => {
    const model = baseModel({
      staffLayout: {
        mode: "full",
        crossingVisible: true,
        crossingDirection: "left-to-right",
      },
    });

    const { container } = render(
      <ControlRoomPresentation
        model={model}
        turn={2}
        hasActiveSituation={false}
        reducedMotionOverride
      />,
    );

    const presentation = container.querySelector("[data-motion]");
    expect(presentation).toHaveAttribute("data-motion", "reduced");
  });
});

describe("Staff sprite rendering with pose data", () => {
  it("renders all three staff actors in full mode", () => {
    const model = baseModel({
      staffLayout: { mode: "full", crossingVisible: false, crossingDirection: "left-to-right" },
      staffPoses: {
        analyst: "working",
        fixer: "concerned",
        steward: "stressed",
      },
    });

    render(
      <ControlRoomPresentation
        model={model}
        turn={1}
        hasActiveSituation={false}
        reducedMotionOverride
      />,
    );

    const room = screen.getByTestId("continuity-facility");
    expect(room.querySelector("[data-room-actor='analyst']")).not.toBeNull();
    expect(room.querySelector("[data-room-actor='fixer']")).not.toBeNull();
    expect(room.querySelector("[data-room-actor='steward']")).not.toBeNull();
  });

  it("renders reduced staff in reduced mode", () => {
    const model = baseModel({
      staffLayout: { mode: "reduced", crossingVisible: false, crossingDirection: "left-to-right" },
      staffPoses: {
        analyst: "working",
        fixer: "working",
        steward: "working",
      },
    });

    render(
      <ControlRoomPresentation
        model={model}
        turn={1}
        hasActiveSituation={false}
        reducedMotionOverride
      />,
    );

    const room = screen.getByTestId("continuity-facility");
    expect(room.querySelector("[data-room-actor='analyst']")).not.toBeNull();
    expect(room.querySelector("[data-room-actor='fixer']")).not.toBeNull();
    expect(room.querySelector("[data-room-actor='steward']")).toBeNull();
  });

  it("renders only fixer in skeleton mode", () => {
    const model = baseModel({
      staffLayout: { mode: "skeleton", crossingVisible: false, crossingDirection: "left-to-right" },
      staffPoses: {
        analyst: "working",
        fixer: "working",
        steward: "working",
      },
    });

    render(
      <ControlRoomPresentation
        model={model}
        turn={1}
        hasActiveSituation={false}
        reducedMotionOverride
      />,
    );

    const room = screen.getByTestId("continuity-facility");
    expect(room.querySelector("[data-room-actor='analyst']")).toBeNull();
    expect(room.querySelector("[data-room-actor='fixer']")).not.toBeNull();
    expect(room.querySelector("[data-room-actor='steward']")).toBeNull();
  });
});
