"use client";

import type { CSSProperties } from "react";
import { PixelSprite } from "../pixel/PixelSprite";
import type { ArtKey } from "@/game-art/manifest";
import { NARRATIVE_LOCATIONS } from "./sceneLocations";
import type {
  NarrativeSceneRendererProps,
  SceneActor,
  SceneProp,
  ScenePropKind,
} from "./sceneTypes";
import styles from "./NarrativeScene.module.css";

type PositionedStyle = CSSProperties & {
  "--scene-x": string;
  "--scene-y": string;
};

type ScenePaletteStyle = CSSProperties & {
  "--scene-wall": string;
  "--scene-floor": string;
  "--scene-shadow": string;
  "--scene-signal": string;
  "--scene-focus-x": string;
  "--scene-focus-y": string;
};

function positionedStyle(position: { x: number; y: number }): PositionedStyle {
  return {
    "--scene-x": `${position.x}%`,
    "--scene-y": `${position.y}%`,
  };
}

function SceneActorFigure({ actor }: { actor: SceneActor }) {
  const artKey = getActorArt(actor);
  return (
    <span
      className={styles.actor}
      data-facing={actor.facing}
      data-motion-cue={actor.motion}
      data-role={actor.role}
      style={positionedStyle(actor.position)}
      title={actor.label}
    >
      <i className={styles.actorShadow} />
      <PixelSprite
        artKey={artKey}
        className={styles.actorSprite ?? ""}
        fallback={
          <>
            <i className={styles.actorBody} />
            <i className={styles.actorHead} />
          </>
        }
      />
      <small>{actor.label}</small>
    </span>
  );
}

function getActorArt(actor: SceneActor): ArtKey {
  if (actor.role === "analyst") return "staffAnalystIdle";
  if (actor.role === "fixer") return "staffOperatorIdle";
  if (actor.role === "steward") return "staffStewardIdle";
  return actor.facing === "left"
    ? "staffCrossingWalkLeft"
    : "staffCrossingWalkRight";
}

function ScenePropFigure({
  location,
  prop,
}: {
  location: NarrativeSceneRendererProps["location"];
  prop: SceneProp;
}) {
  const artKey = getPropArt(location, prop.kind);
  return (
    <span
      className={styles.prop}
      data-prop={prop.kind}
      data-prop-state={prop.state ?? "normal"}
      style={positionedStyle(prop.position)}
    >
      {artKey ? (
        <PixelSprite
          artKey={artKey}
          className={styles.propSprite ?? ""}
          fallback={<i />}
        />
      ) : (
        <i />
      )}
    </span>
  );
}

const PROP_ART: Partial<Record<ScenePropKind, ArtKey>> = {
  "briefing-table": "envConferenceDesk",
  "monitor-bank": "monitorScreens",
  server: "monitorServer",
};

function getPropArt(
  location: NarrativeSceneRendererProps["location"],
  kind: ScenePropKind,
): ArtKey | undefined {
  if (location === "oversight-chamber" && kind === "monitor-bank") {
    return "envOversightBroadcast";
  }
  if (location === "secure-briefing" && kind === "document-box") {
    return "envSecureSafe";
  }
  if (
    location === "infrastructure-site"
    && (kind === "generator" || kind === "work-lights")
  ) {
    return "envInfrastructureToolbox";
  }
  if (location === "corporate-suite" && kind === "corporate-seal") {
    return "envCorporateDoor";
  }
  if (location === "civic-gate" && kind === "barrier") {
    return "envCivicBarrier";
  }
  return PROP_ART[kind];
}

export function NarrativeScene({
  beat,
  location,
  persistentMarks,
  reducedMotion = false,
}: NarrativeSceneRendererProps) {
  const definition = NARRATIVE_LOCATIONS[location];
  const palette = {
    "--scene-wall": definition.palette.wall,
    "--scene-floor": definition.palette.floor,
    "--scene-shadow": definition.palette.shadow,
    "--scene-signal": definition.palette.signal,
    "--scene-focus-x": `${beat.focus.x}%`,
    "--scene-focus-y": `${beat.focus.y}%`,
  } satisfies ScenePaletteStyle;
  const props = new Map(
    [...definition.baseProps, ...beat.props].map((prop) => [prop.id, prop]),
  );

  return (
    <section
      aria-label={`${definition.shortLabel}: ${beat.title}`}
      className={styles.scene}
      data-beat={beat.id}
      data-brb-construction={persistentMarks.brbConstruction}
      data-corporation-presence={persistentMarks.corporationPresence}
      data-emergency-level={persistentMarks.emergencyLevel}
      data-institutional-condition={persistentMarks.institutionalCondition}
      data-motion={reducedMotion ? "reduced" : "full"}
      data-narrative-location={location}
      style={palette as CSSProperties}
    >
      <div aria-hidden="true" className={styles.room}>
        <div className={styles.backWall}>
          <span>{definition.shortLabel}</span>
          <i />
        </div>
        <div className={styles.sideWallLeft} />
        <div className={styles.sideWallRight} />
        <div className={styles.floor}>
          <i className={styles.floorGrid} />
          <i className={styles.focusPool} />
          <i className={styles.institutionCrack} />
          <i className={styles.corporateCable} />
        </div>

        <div className={styles.propLayer}>
          {[...props.values()].map((prop) => (
            <ScenePropFigure key={prop.id} location={location} prop={prop} />
          ))}
        </div>

        <div className={styles.actorLayer}>
          {beat.actors.map((actor) => (
            <SceneActorFigure actor={actor} key={actor.id} />
          ))}
        </div>

        <div className={styles.foreground}>
          <i />
          <i />
        </div>
        <div className={styles.alertWash} />
        <div className={styles.vignette} />
      </div>

      <div className={styles.sceneCaption}>
        <span>{beat.eyebrow}</span>
        <strong>{beat.title}</strong>
        <p>{beat.description}</p>
      </div>
    </section>
  );
}
