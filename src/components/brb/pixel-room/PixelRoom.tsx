"use client";

import type { CSSProperties } from "react";
import { PixelSprite } from "@/components/brb/pixel/PixelSprite";
import type {
  RoomActor,
  RoomDefinition,
  RoomLayer,
  RoomLighting,
} from "./roomTypes";
import styles from "./PixelRoom.module.css";

type PixelRoomProps = {
  readonly definition: RoomDefinition;
  readonly ariaLabel: string;
  readonly actors?: readonly RoomActor[];
  readonly layers?: readonly RoomLayer[];
  readonly className?: string;
  readonly lighting?: RoomLighting;
  readonly reducedMotion?: boolean;
  readonly testId?: string;
};

/**
 * A stable 0..1 loop offset for the sprite at this tile.
 *
 * Sprites all mount in the same frame, so identical sheets would otherwise run
 * in lockstep and the room would blink as one object. Derived from the tile
 * coordinate (not `Math.random`) so the phase is deterministic: the same room
 * always looks the same, and the server and client agree during hydration. The
 * multipliers are coprime with the modulus so neighbouring tiles land far apart
 * in the cycle rather than in a visible diagonal wave.
 */
function spritePhase(x: number, y: number): number {
  return ((x * 7 + y * 13) % 17) / 17;
}

function positionStyle(
  x: number,
  y: number,
  zIndex: number,
): CSSProperties {
  return {
    left: `${x * 16}px`,
    top: `${y * 16}px`,
    zIndex,
    ["--sprite-phase" as string]: spritePhase(x, y),
  };
}

function lightingZoneStyle(
  x: number,
  y: number,
  widthTiles: number,
  heightTiles: number,
): CSSProperties {
  return {
    left: `${x * 16}px`,
    top: `${y * 16}px`,
    width: `${widthTiles * 16}px`,
    height: `${heightTiles * 16}px`,
  };
}

/**
 * Shared fixed-camera room renderer.
 *
 * React places semantic sprites on an integer tile grid. CSS scales the complete
 * source-pixel canvas as one unit, so no child can drift into a different visual
 * scale. When licensed art is absent, the base becomes a simple flat schematic.
 */
export function PixelRoom({
  definition,
  ariaLabel,
  actors = [],
  layers = [],
  className,
  lighting = "calm",
  reducedMotion = false,
  testId,
}: PixelRoomProps) {
  const width = definition.widthTiles * 16;
  const height = definition.heightTiles * 16;
  const roomStyle = {
    ["--pixel-room-width" as string]: width,
    ["--pixel-room-height" as string]: height,
  } satisfies CSSProperties;

  return (
    <div
      className={`${styles.viewport}${className ? ` ${className}` : ""}`}
      style={roomStyle}
      role="img"
      aria-label={ariaLabel}
      data-lighting={lighting}
      data-motion={reducedMotion ? "reduced" : "full"}
      data-pixel-room={definition.id}
      data-testid={testId}
    >
      <div className={styles.canvas}>
        <PixelSprite
          artKey={definition.baseArtKey}
          className={styles.base!}
          fallback={<span className={styles.schematic} aria-hidden="true" />}
        />

        {layers.map((layer, index) =>
          layer.hidden ? null : (
            <span
              key={layer.id}
              className={styles.object}
              style={positionStyle(layer.position.x, layer.position.y, 10 + index)}
              data-room-object={layer.kind ?? layer.id}
              aria-hidden="true"
            >
              <PixelSprite
                artKey={layer.artKey}
                {...(layer.frameOffset === undefined
                  ? {}
                  : { frameOffset: layer.frameOffset })}
                fallback={<span className={styles.objectFallback} />}
              />
            </span>
          ),
        )}

        {actors.map((actor, index) =>
          actor.hidden ? null : (
            <span
              key={actor.id}
              className={styles.actor}
              style={positionStyle(actor.position.x, actor.position.y, 50 + index)}
              data-room-actor={actor.id}
              data-motion-cue={actor.motion}
              aria-hidden="true"
            >
              <PixelSprite
                artKey={actor.artKey}
                {...(actor.frameOffset === undefined
                  ? {}
                  : { frameOffset: actor.frameOffset })}
                fallback={<span className={styles.actorFallback} />}
              />
            </span>
          ),
        )}

        {definition.lightingZones.map((zone) => (
          <span
            className={styles.light}
            data-light-zone={zone.id}
            style={lightingZoneStyle(
              zone.position.x,
              zone.position.y,
              zone.widthTiles,
              zone.heightTiles,
            )}
            key={zone.id}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
