"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ART, type ArtEntry, type ArtKey } from "@/game-art/manifest";
import { useReducedMotion } from "@/components/brb/control-room/useReducedMotion";
import styles from "./PixelSprite.module.css";

/** Explicit sprite-sheet geometry, used when a caller does not reference the manifest. */
type SheetGeometry = Pick<
  ArtEntry,
  "src" | "frameWidth" | "frameHeight" | "frameCount" | "fps" | "scale"
>;

type CommonProps = {
  className?: string;
  /** Rendered instead of the sprite when the sheet fails to load (e.g. gitignored/uninjected asset 404s). */
  fallback?: ReactNode;
  /**
   * Starting frame index. Used to pick a facing/pose for a STATIC or reduced-motion
   * render. When the sprite is actively animating it plays the full strip from frame 0.
   */
  frameOffset?: number;
  /** Accessible label; when omitted the sprite is treated as decorative (aria-hidden). */
  label?: string;
};

type PixelSpriteProps = CommonProps &
  ({ artKey: ArtKey } | SheetGeometry);

function resolveGeometry(props: PixelSpriteProps): SheetGeometry {
  if ("artKey" in props) {
    const entry = ART[props.artKey];
    return {
      src: entry.src,
      frameWidth: entry.frameWidth,
      frameHeight: entry.frameHeight,
      frameCount: entry.frameCount,
      fps: entry.fps,
      scale: entry.scale,
    };
  }
  return {
    src: props.src,
    frameWidth: props.frameWidth,
    frameHeight: props.frameHeight,
    frameCount: props.frameCount,
    fps: props.fps,
    scale: props.scale,
  };
}

/**
 * Reusable pixel-art sprite primitive.
 *
 * Renders a fixed-size box scaled by an integer factor, painting a sprite sheet as
 * its background with `image-rendering: pixelated`. Multi-frame strips animate their
 * `background-position` with a CSS `steps()` keyframe at the sheet's `fps`. If the
 * sheet 404s (the curated assets are gitignored and injected at deploy) the
 * `fallback` is rendered instead of a broken sprite. Animation is frozen when a
 * `data-motion="reduced"` ancestor is present or the user prefers reduced motion.
 */
export function PixelSprite(props: PixelSpriteProps) {
  const { className, fallback, frameOffset = 0, label } = props;
  const { src, frameWidth, frameHeight, frameCount, fps, scale } =
    resolveGeometry(props);

  const rootRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [ancestorReduced, setAncestorReduced] = useState(false);
  const [loadState, setLoadState] = useState<"pending" | "loaded" | "error">(
    "pending",
  );

  // Detect a `data-motion="reduced"` ancestor after mount (SSR-safe).
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    setAncestorReduced(node.closest('[data-motion="reduced"]') !== null);
  }, []);

  // Reset load probing whenever the sheet source changes.
  useEffect(() => {
    setLoadState("pending");
  }, [src]);

  const reducedMotion = prefersReducedMotion || ancestorReduced;
  const shouldAnimate =
    frameCount > 1 && fps > 0 && !reducedMotion && loadState !== "error";

  const displayWidth = frameWidth * scale;
  const displayHeight = frameHeight * scale;
  const stripWidth = displayWidth * frameCount;
  // Travel one full strip width to the left across `frameCount` discrete steps.
  const travel = -stripWidth;
  const durationSeconds = fps > 0 ? frameCount / fps : 0;
  // Frozen frame (static sheets, reduced motion, or picking a facing) is clamped in range.
  const frozenFrame = Math.min(Math.max(frameOffset, 0), Math.max(frameCount - 1, 0));

  const style: CSSProperties = {
    width: displayWidth,
    height: displayHeight,
    backgroundImage: `url("${src}")`,
    backgroundSize: `${stripWidth}px ${displayHeight}px`,
    backgroundPositionX: shouldAnimate ? 0 : -(displayWidth * frozenFrame),
    // Consumed by the `brb-pixel-sprite` keyframe (globals.css).
    ["--pixel-sprite-travel" as string]: `${travel}px`,
    ...(shouldAnimate
      ? {
          animationDuration: `${durationSeconds}s`,
          animationTimingFunction: `steps(${frameCount})`,
        }
      : {}),
  };

  // When the sheet failed to load, prefer the caller's fallback.
  if (loadState === "error") {
    // Keep the probe mounted so a later successful reload (src change) can recover.
    return (
      <>
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className={styles.probe}
          onLoad={() => setLoadState("loaded")}
          onError={() => setLoadState("error")}
        />
        {fallback ?? null}
      </>
    );
  }

  return (
    <span
      ref={rootRef}
      className={`${styles.root} pixelated${shouldAnimate ? ` ${styles.animated}` : ""}${className ? ` ${className}` : ""}`}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {/* Offscreen probe: the sole source of truth for load success/failure. */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={styles.probe}
        onLoad={() => setLoadState("loaded")}
        onError={() => setLoadState("error")}
      />
    </span>
  );
}
