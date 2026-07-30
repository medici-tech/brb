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
  /**
   * Notified whenever the sheet's load state settles. Lets a parent lay out
   * differently when the curated art is present vs absent (e.g. the monitor wall
   * swaps between one pixel wall and four CSS monitor frames) without duplicating
   * the probe logic.
   */
  onLoadStateChange?: (state: SpriteLoadState) => void;
};

export type SpriteLoadState = "pending" | "loaded" | "error";

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
 * Renders a box scaled by an integer factor, painting a sprite sheet as its
 * background with `image-rendering: pixelated`. Multi-frame strips animate their
 * `background-position` with a CSS `steps()` keyframe at the sheet's `fps`. If the
 * sheet 404s (the curated assets are gitignored and injected at deploy) the
 * `fallback` is rendered instead of a broken sprite. Animation is frozen when a
 * `data-motion="reduced"` ancestor is present or the user prefers reduced motion,
 * parking on `frameOffset` so each sprite has a deliberate, legible still pose.
 *
 * Sizing is expressed as CSS custom properties rather than computed pixels, so a
 * consumer stylesheet can retune `--sprite-scale` at a breakpoint (3 → 2 → 1) and
 * keep the art crisp. The manifest's `scale` is only the default.
 */
export function PixelSprite(props: PixelSpriteProps) {
  const { className, fallback, frameOffset = 0, label, onLoadStateChange } = props;
  const { src, frameWidth, frameHeight, frameCount, fps, scale } =
    resolveGeometry(props);

  const rootRef = useRef<HTMLSpanElement>(null);
  const probeRef = useRef<HTMLImageElement>(null);
  const mountedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const [ancestorReduced, setAncestorReduced] = useState(false);
  const [loadState, setLoadState] = useState<SpriteLoadState>("pending");

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Keep the callback in a ref so a caller passing an inline arrow does not
  // re-fire the notify effect on every render.
  const notifyRef = useRef(onLoadStateChange);
  notifyRef.current = onLoadStateChange;
  useEffect(() => {
    notifyRef.current?.(loadState);
  }, [loadState]);

  // Track the nearest `[data-motion]` ancestor (SSR-safe: after mount only).
  //
  // This deliberately watches the attribute rather than reading it once. On the
  // first client render `useReducedMotion` returns its SERVER snapshot (`true`),
  // so the presentation renders `data-motion="reduced"`; a one-shot read latches
  // that value and never sees the flip to `"full"` once hydration settles, which
  // silently freezes every sprite in the room for the rest of the session. The
  // observer also makes the runtime toggle (dev preview checkbox, and any future
  // in-game motion setting) drive sprites immediately.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const host = node.closest("[data-motion]");
    if (!host) {
      setAncestorReduced(false);
      return;
    }

    const read = () =>
      setAncestorReduced(host.getAttribute("data-motion") === "reduced");
    read();

    const observer = new MutationObserver(read);
    observer.observe(host, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });
    return () => observer.disconnect();
  }, []);

  // Reset load probing whenever the sheet source changes.
  useEffect(() => {
    setLoadState("pending");
    const probe = probeRef.current;
    if (probe?.complete && probe.naturalWidth > 0) {
      setLoadState("loaded");
    }
  }, [src]);

  function settleLoadState(state: Exclude<SpriteLoadState, "pending">): void {
    if (mountedRef.current) setLoadState(state);
  }

  const reducedMotion = prefersReducedMotion || ancestorReduced;
  const shouldAnimate =
    frameCount > 1 && fps > 0 && !reducedMotion && loadState !== "error";

  const durationSeconds = fps > 0 ? frameCount / fps : 0;
  // Frozen frame (static sheets, reduced motion, or picking a facing) is clamped in range.
  const frozenFrame = Math.min(Math.max(frameOffset, 0), Math.max(frameCount - 1, 0));

  // Only the raw SOURCE numbers cross the JS/CSS boundary. Every pixel measurement
  // (box size, sheet size, frozen offset, animation travel) is derived in the CSS
  // module from these, so a breakpoint can override `--sprite-scale` with a
  // different integer and the whole sprite retunes without resampling.
  const style: CSSProperties = {
    backgroundImage: `url("${src}")`,
    ["--sprite-frame-w" as string]: frameWidth,
    ["--sprite-frame-h" as string]: frameHeight,
    ["--sprite-frames" as string]: frameCount,
    // The manifest scale is only a BASE. It must not be written to
    // `--sprite-scale` directly: an inline custom property outranks every
    // stylesheet rule, which would make consumer classes and breakpoints unable
    // to retune the scale at all. The CSS module resolves
    // `--sprite-scale-override` first and falls back to this.
    ["--sprite-scale-base" as string]: scale,
    ["--sprite-frozen-frame" as string]: frozenFrame,
    ...(shouldAnimate
      ? {
          ["--sprite-duration" as string]: `${durationSeconds}s`,
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
          ref={probeRef}
          src={src}
          alt=""
          aria-hidden="true"
          className={styles.probe}
          onLoad={() => settleLoadState("loaded")}
          onError={() => settleLoadState("error")}
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
        ref={probeRef}
        src={src}
        alt=""
        aria-hidden="true"
        className={styles.probe}
        onLoad={() => settleLoadState("loaded")}
        onError={() => settleLoadState("error")}
      />
    </span>
  );
}
