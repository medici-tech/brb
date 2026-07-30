"use client";

import { useState } from "react";
import { ControlRoomPresentation } from "./ControlRoomPresentation";
import roomStyles from "./ControlRoomPresentation.module.css";
import workspaceStyles from "./SituationWorkspace.module.css";
import styles from "./ControlRoomPreview.module.css";
import {
  getBrbVisualStage,
  PRESENTATION_STATE_COPY,
  PRESENTATION_STATES,
  type PresentationFocus,
  type PresentationModel,
  type PresentationState,
} from "./presentationStateResolver";

const FOCUS_OPTIONS: PresentationFocus[] = [
  "assess",
  "investigate",
  "commit",
];

export function ControlRoomPreview() {
  const [state, setState] = useState<PresentationState>("calm");
  const [progress, setProgress] = useState(0);
  const [focus, setFocus] = useState<PresentationFocus>("assess");
  const [activeSituation, setActiveSituation] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const copy = PRESENTATION_STATE_COPY[state];
  const model: PresentationModel = {
    state,
    stateLabel: copy.label,
    caption: copy.caption,
    focus: focus === "investigate" ? "investigate" : "assess",
    brbProgress: progress,
    brbStage: getBrbVisualStage(progress),
    shot: activeSituation ? "situation" : "operations",
    tempo: activeSituation ? "reading" : "ambient",
    litStation: null,
    paperLoad: "sparse",
    endingId: null,
    staffLayout: {
      mode: "full",
      crossingVisible: !activeSituation,
      crossingDirection: "left-to-right",
    },
  };

  return (
    <main className={`brb-design-system ${styles.previewShell}`}>
      <header className={styles.previewHeader}>
        <div>
          <p className="file-label">DEVELOPMENT FIXTURE · PRESENTATION ONLY</p>
          <h1>Living Control Room</h1>
        </div>
        <p>
          Preview atmospheric states without starting a campaign or changing
          simulation data. These controls are unavailable in production.
        </p>
      </header>

      <section
        aria-label="Control room preview controls"
        className={styles.previewControls}
      >
        <label>
          Presentation state
          <select
            aria-label="Presentation state"
            value={state}
            onChange={(event) => {
              setState(event.target.value as PresentationState);
            }}
          >
            {PRESENTATION_STATES.map((option) => (
              <option key={option} value={option}>
                {PRESENTATION_STATE_COPY[option].label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Focus
          <select
            aria-label="Presentation focus"
            value={focus}
            onChange={(event) => {
              setFocus(event.target.value as PresentationFocus);
            }}
          >
            {FOCUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          BRB progress
          <input
            aria-label="BRB progress"
            max="100"
            min="0"
            type="range"
            value={progress}
            onChange={(event) => setProgress(Number(event.target.value))}
          />
          <span className={styles.previewValue}>
            {progress}% · {model.brbStage.replaceAll("-", " ")}
          </span>
        </label>

        <label className={styles.previewToggle}>
          Active Situation
          <input
            aria-label="Active Situation"
            checked={activeSituation}
            type="checkbox"
            onChange={(event) => setActiveSituation(event.target.checked)}
          />
        </label>

        <label className={styles.previewToggle}>
          Reduced motion
          <input
            aria-label="Reduced motion"
            checked={reducedMotion}
            type="checkbox"
            onChange={(event) => setReducedMotion(event.target.checked)}
          />
        </label>
      </section>

      <section className={styles.previewStage}>
        <ControlRoomPresentation
          model={model}
          turn={1}
          hasActiveSituation={activeSituation}
          reducedMotionOverride={reducedMotion}
          focusOverride={focus}
        />

        {activeSituation ? (
          <article className={`paper-panel ${styles.previewFile}`}>
            <p className="file-label">SITUATION DECK · PREVIEW FILE</p>
            <h2>The Continuity Memorandum</h2>
            <p>
              A placeholder Situation demonstrates that decision text remains
              dominant while the control room becomes a subdued frame.
            </p>
            <div className={styles.previewChoices}>
              <button type="button">Preserve public authority</button>
              <button type="button">Accept the private channel</button>
            </div>
          </article>
        ) : (
          <div className={workspaceStyles.noActiveFile}>
            <p className="file-label">SITUATION DECK · STANDBY</p>
            <h1>No active file</h1>
            <p>
              The desk is quiet. Choose where to commit the administration.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
