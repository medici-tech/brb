"use client";

import { Children, useEffect, useMemo, useState } from "react";
import type { TurnBeat } from "@/game/types";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "../control-room/useReducedMotion";
import { NarrativeScene } from "./NarrativeScene";
import type { NarrativeSceneCue, SceneBeatId } from "./sceneTypes";
import styles from "./NarrativeAftermath.module.css";

type Props = {
  readonly cues: readonly NarrativeSceneCue[];
  readonly turnBeats: readonly TurnBeat[];
};

const STEP_LABELS = ["Setup", "Action", "Consequence"] as const;

function ProgressStep({
  current,
  index,
  label,
}: {
  readonly current: boolean;
  readonly index: number;
  readonly label: (typeof STEP_LABELS)[number];
}) {
  return (
    <li {...(current ? { "aria-current": "step" as const } : {})}>
      <span>{index + 1}</span>
      {label}
    </li>
  );
}

function beatsForStep(
  turnBeats: readonly TurnBeat[],
  stepId: SceneBeatId,
): readonly TurnBeat[] {
  if (turnBeats.length === 0) return [];
  if (stepId === "setup") {
    return turnBeats.filter((beat) => beat.kind === "improvement").slice(0, 1);
  }
  if (stepId === "action") {
    return turnBeats.filter(
      (beat) => beat.kind === "discovery" || beat.kind === "milestone",
    );
  }
  const problemBeats = turnBeats.filter((beat) => beat.kind === "problem");
  return problemBeats.length > 0 ? problemBeats : turnBeats.slice(-1);
}

export function NarrativeAftermath({ cues, turnBeats }: Props) {
  const [step, setStep] = useState(0);
  const reducedMotion = useReducedMotion();
  const cueKey = cues.map((cue) => cue.decisionId).join("|");
  const timeline = useMemo(
    () => cues.flatMap((cue) =>
      cue.script.beats.map((beat) => ({ beat, cue }))
    ),
    [cues],
  );
  const current = timeline[step] ?? timeline[0];
  const cue = current?.cue ?? cues[0];
  const beat = current?.beat ?? cue?.script.beats[0];
  const relatedBeats = useMemo(
    () => beat ? beatsForStep(turnBeats, beat.id) : [],
    [beat, turnBeats],
  );

  useEffect(() => {
    setStep(0);
  }, [cueKey]);

  if (!cue || !beat) return null;

  const cueStart = timeline.findIndex((item) => item.cue.decisionId === cue.decisionId);
  const cueStep = Math.max(0, step - cueStart);

  return (
    <section
      aria-labelledby="narrative-aftermath-title"
      className={styles.aftermath}
      data-aftermath-step={beat.id}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>FIELD RECORD · {cue.script.sceneId.replaceAll("-", " ")}</p>
          <h3 id="narrative-aftermath-title">{cue.script.title}</h3>
        </div>
        <ol aria-label="Aftermath scene progress" className={styles.progress}>
          <ProgressStep current={cueStep === 0} index={0} label="Setup" />
          <ProgressStep current={cueStep === 1} index={1} label="Action" />
          <ProgressStep current={cueStep === 2} index={2} label="Consequence" />
        </ol>
      </header>

      <NarrativeScene
        beat={beat}
        location={cue.script.sceneId}
        persistentMarks={cue.persistentMarks}
        reducedMotion={reducedMotion}
      />

      <div aria-live="polite" className={styles.linkedRecord}>
        <p>Linked written consequence</p>
        {relatedBeats.length > 0 ? (
          Children.toArray(relatedBeats.map((linkedBeat, index) => (
            <article key={`${linkedBeat.kind}-${linkedBeat.title}-${index}`}>
              <span>{linkedBeat.kind.replaceAll("_", " ")}</span>
              <strong>{linkedBeat.title}</strong>
              <small>{linkedBeat.explanation}</small>
            </article>
          )))
        ) : (
          <article>
            <span>decision record</span>
            <strong>{cue.decisionSummary}</strong>
            <small>The exact meter changes remain available below.</small>
          </article>
        )}
      </div>

      <footer className={styles.controls}>
        <Button
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          size="lg"
          type="button"
          variant="quiet"
        >
          Previous beat
        </Button>
        {step < timeline.length - 1 ? (
          <>
            <Button
              onClick={() =>
                setStep((current) =>
                  Math.min(timeline.length - 1, current + 1)
                )
              }
              size="lg"
              type="button"
              variant="dossier"
            >
              Next beat
            </Button>
            <Button
              onClick={() => setStep(timeline.length - 1)}
              size="lg"
              type="button"
              variant="quiet"
            >
              Skip to consequence
            </Button>
          </>
        ) : (
          <p role="status">Visual consequence entered into the record.</p>
        )}
      </footer>
    </section>
  );
}
