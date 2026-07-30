"use client";

import type { ArtKey } from "@/game-art/manifest";
import { PixelRoom } from "@/components/brb/pixel-room/PixelRoom";
import { ROOM_DEFINITIONS } from "@/components/brb/pixel-room/roomDefinitions";
import type {
  GridPoint,
  RoomActor,
  RoomLayer,
} from "@/components/brb/pixel-room/roomTypes";
import { NARRATIVE_LOCATIONS } from "./sceneLocations";
import type {
  NarrativeSceneRendererProps,
  SceneActor,
  ScenePropKind,
} from "./sceneTypes";
import styles from "./NarrativeScene.module.css";

const PROP_ART: Record<ScenePropKind, ArtKey> = {
  "briefing-table": "envConferenceDesk",
  dossier: "envSecureSafe",
  "monitor-bank": "monitorScreens",
  "hearing-desk": "envConferenceDesk",
  barrier: "envCivicBarrier",
  server: "monitorServer",
  generator: "envInfrastructureToolbox",
  "work-lights": "envInfrastructureToolbox",
  "corporate-seal": "envCorporateDoor",
  podium: "envConferenceDesk",
  "crowd-line": "envCivicBarrier",
  "document-box": "envSecureSafe",
  "brb-chamber": "monitorServer",
  "warning-beacon": "envSecurityCamera",
};

function getActorArt(actor: SceneActor): ArtKey {
  if (actor.role === "analyst") return "staffAnalystIdle";
  if (actor.role === "fixer") return "staffOperatorIdle";
  if (actor.role === "steward") return "staffStewardIdle";
  return actor.facing === "left"
    ? "staffCrossingWalkLeft"
    : "staffCrossingWalkRight";
}

function clampLayerPosition(position: GridPoint, artKey: ArtKey): GridPoint {
  const footprint: Partial<Record<ArtKey, GridPoint>> = {
    monitorScreens: { x: 4, y: 3 },
    monitorServer: { x: 1, y: 3 },
    envConferenceDesk: { x: 1, y: 2 },
    envSecureSafe: { x: 1, y: 2 },
    envInfrastructureToolbox: { x: 2, y: 3 },
    envCorporateDoor: { x: 3, y: 2 },
    envCivicBarrier: { x: 5, y: 5 },
  };
  const size = footprint[artKey] ?? { x: 1, y: 1 };
  return {
    x: Math.min(Math.max(position.x, 0), 14 - size.x),
    y: Math.min(Math.max(position.y, 0), 10 - size.y),
  };
}

function persistentLayers(
  marks: NarrativeSceneRendererProps["persistentMarks"],
): RoomLayer[] {
  const layers: RoomLayer[] = [];

  if (marks.corporationPresence !== "distant") {
    layers.push({
      id: "persistent-corporation-door",
      kind: "corporation-presence",
      artKey: "envCorporateDoor",
      position: { x: 9, y: 1 },
      frameOffset: marks.corporationPresence === "embedded" ? 7 : 0,
    });
  }
  if (marks.corporationPresence === "embedded") {
    layers.push({
      id: "persistent-corporation-terminal",
      kind: "corporation-presence",
      artKey: "monitorServer",
      position: { x: 11, y: 2 },
      frameOffset: 2,
    });
  }

  if (marks.institutionalCondition !== "secure") {
    layers.push({
      id: "persistent-damage-a",
      kind: "architectural-damage",
      artKey: "envInfrastructureToolbox",
      position: { x: 1, y: 6 },
      frameOffset: 11,
    });
  }
  if (marks.institutionalCondition === "breached") {
    layers.push({
      id: "persistent-damage-b",
      kind: "architectural-damage",
      artKey: "envSecureSafe",
      position: { x: 11, y: 6 },
      frameOffset: 5,
    });
  }

  if (marks.brbConstruction !== "sealed") {
    layers.push({
      id: "persistent-brb-a",
      kind: "brb-machinery",
      artKey:
        marks.brbConstruction === "framed"
          ? "envInfrastructureToolbox"
          : "monitorServer",
      position: { x: 10, y: 3 },
      frameOffset: marks.brbConstruction === "unstable" ? 2 : 1,
    });
  }
  if (
    marks.brbConstruction === "unstable"
    || marks.brbConstruction === "ready"
  ) {
    layers.push({
      id: "persistent-brb-b",
      kind: "brb-machinery",
      artKey: "monitorServer",
      position: { x: 12, y: 3 },
      frameOffset: marks.brbConstruction === "unstable" ? 2 : 1,
    });
  }

  return layers;
}

function resolveLighting(
  marks: NarrativeSceneRendererProps["persistentMarks"],
): "calm" | "strained" | "crisis" | "failure" {
  if (marks.institutionalCondition === "breached") return "failure";
  if (marks.emergencyLevel === "critical") return "crisis";
  if (
    marks.emergencyLevel === "strained"
    || marks.corporationPresence !== "distant"
  ) {
    return "strained";
  }
  return "calm";
}

export function NarrativeScene({
  beat,
  location,
  persistentMarks,
  reducedMotion = false,
}: NarrativeSceneRendererProps) {
  const locationDefinition = NARRATIVE_LOCATIONS[location];
  const roomDefinition = ROOM_DEFINITIONS[locationDefinition.roomDefinition];
  const propLayers = beat.props.map((prop): RoomLayer => {
    const artKey = PROP_ART[prop.kind];
    return {
      id: prop.id,
      kind: prop.kind,
      artKey,
      position: clampLayerPosition(prop.position, artKey),
      frameOffset:
        prop.state === "active"
          ? 1
          : prop.state === "damaged" || prop.state === "abandoned"
            ? 2
            : 0,
    };
  });
  const actors = beat.actors.map((actor): RoomActor => ({
    id: actor.id,
    artKey: getActorArt(actor),
    position: actor.position,
    motion: actor.motion,
  }));
  const occupantSummary = beat.actors.map((actor) => actor.label).join(", ");
  const sceneLabel = `${locationDefinition.shortLabel}: ${beat.title}`;
  const roomLabel =
    `${locationDefinition.label}. Fixed orthographic room. `
    + `Occupants: ${occupantSummary || "none"}.`;

  return (
    <section
      aria-label={sceneLabel}
      className={styles.scene}
      data-beat={beat.id}
      data-brb-construction={persistentMarks.brbConstruction}
      data-corporation-presence={persistentMarks.corporationPresence}
      data-emergency-level={persistentMarks.emergencyLevel}
      data-institutional-condition={persistentMarks.institutionalCondition}
      data-motion={reducedMotion ? "reduced" : "full"}
      data-narrative-location={location}
      data-focus-x={beat.focus.x}
      data-focus-y={beat.focus.y}
    >
      <div className={styles.sceneRoom}>
        <PixelRoom
          definition={roomDefinition}
          ariaLabel={roomLabel}
          actors={actors}
          layers={[...propLayers, ...persistentLayers(persistentMarks)]}
          className={styles.pixelRoom!}
          lighting={resolveLighting(persistentMarks)}
          reducedMotion={reducedMotion}
        />
      </div>

      <div className={styles.sceneCaption}>
        <span>{beat.eyebrow}</span>
        <strong>{beat.title}</strong>
        <p>{beat.description}</p>
      </div>
    </section>
  );
}
