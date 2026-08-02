"use client";

import { useEffect, useRef, useState } from "react";
import { PixelRoom } from "@/components/brb/pixel-room/PixelRoom";
import { ROOM_DEFINITIONS } from "@/components/brb/pixel-room/roomDefinitions";
import type {
  GridPoint,
  RoomActor,
  RoomLayer,
} from "@/components/brb/pixel-room/roomTypes";
import type {
  BrbVisualStage,
  PaperLoad,
  PresentationFocus,
  PresentationModel,
} from "./presentationStateResolver";
import styles from "./ControlRoomPresentation.module.css";
import { useReducedMotion } from "./useReducedMotion";

type ControlRoomPresentationProps = {
  model: PresentationModel;
  turn: number;
  hasActiveSituation: boolean;
  /**
   * A reviewed decision ID. Campaign play supplies this only after the
   * aftermath record closes, so the room response is visible instead of
   * flashing behind the modal. Preview and ending surfaces may omit it and
   * retain the turn-based fallback.
   */
  commitSignalKey?: string | null;
  reducedMotionOverride?: boolean;
  focusOverride?: PresentationFocus;
};

type RoomLighting = "calm" | "strained" | "crisis" | "failure";

/**
 * Tile anchors are declared once on the room definition. Read them here rather
 * than repeating literals, so a moved anchor moves the sprite with it.
 */
const FACILITY = ROOM_DEFINITIONS.facility;
const AT = FACILITY.anchors;

function resolveLighting(model: PresentationModel): RoomLighting {
  if (
    model.state === "institutional-failure"
    || model.endingId === "state_collapse"
  ) {
    return "failure";
  }
  if (
    model.state === "crisis"
    || model.endingId === "corporate_capture"
  ) {
    return "crisis";
  }
  if (
    model.state === "strained"
    || model.state === "corporate-encroachment"
    || model.endingId === "compromised_activation"
  ) {
    return "strained";
  }
  return "calm";
}

function brbLayers(stage: BrbVisualStage): RoomLayer[] {
  if (stage === "sealed") return [];

  const layers: RoomLayer[] = [];

  if (stage === "activation-ready") {
    layers.push({
      id: "brb-activation-bank",
      kind: "brb-activation",
      artKey: "monitorScreens",
      position: AT.serverBank,
      frameOffset: 5,
    });
  } else {
    layers.push({
      id: "brb-infrastructure",
      kind: "brb-machinery",
      artKey: "envInfrastructureToolbox",
      position: AT.brbMachine,
      frameOffset: stage === "infrastructure" ? 0 : 7,
    });
  }

  if (stage !== "infrastructure") {
    layers.push({
      id: "brb-server-a",
      kind: "brb-machinery",
      artKey: "monitorServer",
      position: AT.brbServerA,
    });
  }
  if (stage === "unstable" || stage === "activation-ready") {
    layers.push({
      id: "brb-server-b",
      kind: "brb-machinery",
      artKey: "monitorServer",
      position: AT.brbServerB,
      frameOffset: stage === "unstable" ? 2 : 1,
    });
  }

  return layers;
}

function clutterLayers(paperLoad: PaperLoad): RoomLayer[] {
  if (paperLoad === "sparse") return [];

  const layers: RoomLayer[] = [
    {
      id: "evidence-load-a",
      kind: "evidence-clutter",
      artKey: "envSecureSafe",
      position: AT.clutterA,
      frameOffset: 2,
    },
  ];
  if (paperLoad === "burdened" || paperLoad === "saturated") {
    layers.push({
      id: "equipment-load",
      kind: "equipment-clutter",
      artKey: "envInfrastructureToolbox",
      position: AT.equipmentClutter,
      frameOffset: 7,
    });
  }
  if (paperLoad === "saturated") {
    layers.push({
      id: "evidence-load-b",
      kind: "evidence-clutter",
      artKey: "envSecureSafe",
      position: AT.clutterB,
      frameOffset: 4,
    });
  }
  return layers;
}

function persistentLayers(model: PresentationModel): RoomLayer[] {
  const marks = model.persistentRoomMarks;
  const corporationPresence =
    marks?.corporationPresence ?? "distant";
  const institutionalCondition =
    marks?.institutionalCondition
    ?? (model.state === "institutional-failure" ? "breached" : "secure");

  const layers: RoomLayer[] = [];
  if (corporationPresence !== "distant") {
    layers.push({
      id: "corporation-door",
      kind: "corporation-presence",
      artKey: "envCorporateDoor",
      position: AT.corporationDoor,
      frameOffset: corporationPresence === "embedded" ? 7 : 0,
    });
  }
  if (corporationPresence === "embedded") {
    layers.push({
      id: "corporation-terminal",
      kind: "corporation-presence",
      artKey: "monitorServer",
      position: AT.corporationTerminal,
      frameOffset: 2,
    });
  }

  if (institutionalCondition !== "secure") {
    layers.push({
      id: "damage-a",
      kind: "architectural-damage",
      artKey: "envInfrastructureToolbox",
      position: AT.damageA,
      frameOffset: 11,
    });
  }
  if (institutionalCondition === "breached") {
    layers.push({
      id: "damage-b",
      kind: "architectural-damage",
      artKey: "envSecureSafe",
      position: AT.damageB,
      frameOffset: 5,
    });
  }
  return layers;
}

function transientLayers(model: PresentationModel): RoomLayer[] {
  const corporationPresence =
    model.persistentRoomMarks?.corporationPresence ?? "distant";

  // A Corporation Situation should visibly seize a channel even before it has
  // earned a persistent foothold. This is a transient presentation cue only;
  // it deliberately does not promote the saved room mark or add an officer.
  if (
    model.state === "corporate-encroachment"
    && corporationPresence === "distant"
  ) {
    return [
      {
        id: "corporation-channel",
        kind: "corporation-channel",
        artKey: "monitorServer",
        position: AT.corporationTerminal,
        frameOffset: 2,
      },
    ];
  }

  return [];
}

function roomActors(model: PresentationModel): RoomActor[] {
  const departed = new Set(model.persistentRoomMarks?.departedAdvisors ?? []);
  const actors: RoomActor[] = [];
  const staff: readonly {
    id: "analyst" | "fixer" | "steward";
    artKey: RoomActor["artKey"];
    position: GridPoint;
  }[] = [
    { id: "analyst", artKey: "staffAnalystIdle", position: AT.analyst },
    { id: "fixer", artKey: "staffOperatorIdle", position: AT.operator },
    { id: "steward", artKey: "staffStewardIdle", position: AT.steward },
  ];

  for (const person of staff) {
    const occupied =
      model.staffLayout.mode === "full"
      || (model.staffLayout.mode === "reduced" && person.id !== "steward")
      || (model.staffLayout.mode === "skeleton" && person.id === "fixer");
    if (occupied && !departed.has(person.id)) {
      actors.push({
        id: person.id,
        artKey: person.artKey,
        position: person.position,
        motion: "idle",
      });
    }
  }

  const corporationPresence =
    model.persistentRoomMarks?.corporationPresence ?? "distant";
  if (corporationPresence !== "distant") {
    actors.push({
      id: "corporation-officer",
      artKey: "staffStewardIdle",
      position: AT.corporationOfficer,
      motion: "observe",
    });
  }

  if (model.staffLayout.crossingVisible) {
    const rightward =
      model.staffLayout.crossingDirection === "left-to-right";
    actors.push({
      id: "courier",
      artKey: rightward
        ? "staffCrossingWalkRight"
        : "staffCrossingWalkLeft",
      position: rightward ? AT.corridorLeft : AT.corridorRight,
      motion: rightward ? "corridor-right" : "corridor-left",
    });
  }

  return actors;
}

export function ControlRoomPresentation({
  model,
  turn,
  hasActiveSituation,
  commitSignalKey,
  reducedMotionOverride,
  focusOverride,
}: ControlRoomPresentationProps) {
  const reducedMotion = useReducedMotion(reducedMotionOverride);
  const signalValue =
    commitSignalKey === undefined ? `turn:${turn}` : commitSignalKey;
  const previousSignal = useRef<string | null>(signalValue);
  const previousTurn = useRef(turn);
  const [showCommitFocus, setShowCommitFocus] = useState(false);

  useEffect(() => {
    if (commitSignalKey === undefined && turn <= previousTurn.current) {
      previousTurn.current = turn;
      previousSignal.current = signalValue;
      setShowCommitFocus(false);
      return;
    }
    previousTurn.current = turn;

    if (signalValue === null || signalValue === previousSignal.current) {
      previousSignal.current = signalValue;
      setShowCommitFocus(false);
      return;
    }

    previousSignal.current = signalValue;
    setShowCommitFocus(true);
    // Reduced motion keeps the same brief, static acknowledgement; CSS removes
    // its flash while preserving the change in border/status treatment.
    const resetFocus = window.setTimeout(() => setShowCommitFocus(false), 900);
    return () => window.clearTimeout(resetFocus);
  }, [commitSignalKey, signalValue, turn]);

  const focus = focusOverride
    ?? (showCommitFocus ? "commit" : model.focus);
  const layers = [
    {
      id: "monitor-bank",
      kind: "monitor-bank",
      artKey: "monitorScreens",
      position: AT.monitorBank,
      frameOffset: model.state === "institutional-failure" ? 0 : 4,
      hidden: model.state === "institutional-failure",
    },
    {
      id: "security-camera",
      kind: "security-camera",
      artKey: "envSecurityCamera",
      position: AT.securityCamera,
      frameOffset: 4,
    },
    ...brbLayers(model.brbStage),
    ...clutterLayers(model.paperLoad),
    ...persistentLayers(model),
    ...transientLayers(model),
  ] satisfies RoomLayer[];
  const actors = roomActors(model);
  const occupiedStations = actors.filter((actor) =>
    ["analyst", "fixer", "steward"].includes(actor.id)).length;
  const corporationPresence =
    model.persistentRoomMarks?.corporationPresence ?? "distant";
  const institutionalCondition =
    model.persistentRoomMarks?.institutionalCondition ?? "secure";
  const roomAriaLabel =
    `Fixed continuity facility: ${model.stateLabel}; `
    + `${occupiedStations} public staff stations occupied; `
    + `BRB readiness ${Math.round(model.brbProgress)} percent, stage ${model.brbStage}; `
    + `Corporation presence ${corporationPresence}; structure ${institutionalCondition}.`;
  const ariaLabel = `Living control room: ${model.stateLabel}`;

  return (
    <section
      aria-label={ariaLabel}
      className={styles.presentation}
      data-active-situation={hasActiveSituation ? "true" : "false"}
      data-brb-room=""
      data-brb-stage={model.brbStage}
      data-completed-routes={
        model.persistentRoomMarks?.completedRouteCount ?? 0
      }
      data-corporation-presence={corporationPresence}
      data-emergency-level={
        model.persistentRoomMarks?.emergencyLevel ?? "routine"
      }
      data-ending={model.endingId ?? "none"}
      data-focus={focus}
      data-institutional-condition={institutionalCondition}
      data-lit-station={model.litStation ?? "none"}
      data-motion={reducedMotion ? "reduced" : "full"}
      data-paper-load={model.paperLoad}
      data-presentation-state={model.state}
      data-shot={model.shot}
      data-staff-mode={model.staffLayout.mode}
      data-tempo={model.tempo}
    >
      <PixelRoom
        definition={FACILITY}
        ariaLabel={roomAriaLabel}
        actors={actors}
        layers={layers}
        className={styles.room!}
        lighting={resolveLighting(model)}
        reducedMotion={reducedMotion}
        testId="continuity-facility"
      />
    </section>
  );
}
