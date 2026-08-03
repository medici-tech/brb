"use client";

import { useState } from "react";
import { ControlRoomPresentation } from "./ControlRoomPresentation";
import workspaceStyles from "./SituationWorkspace.module.css";
import styles from "./ControlRoomPreview.module.css";
import {
  getBrbVisualStage,
  resolveAuthority,
  resolveLighting,
  PRESENTATION_STATE_COPY,
  PRESENTATION_STATES,
  type LitStation,
  type PaperLoad,
  type PresentationFocus,
  type PresentationModel,
  type PresentationShot,
  type PresentationState,
  type PresentationTempo,
} from "./presentationStateResolver";
import { ENDING_IDS } from "@/game/types";
import type { AdvisorId, EndingId } from "@/game/types";
import type {
  PersistentRoomMarks,
} from "@/components/brb/narrative/sceneTypes";

const FOCUS_OPTIONS: PresentationFocus[] = [
  "assess",
  "investigate",
  "commit",
];
const SHOT_OPTIONS: PresentationShot[] = [
  "operations",
  "situation",
  "consultation",
  "commitment",
  "milestone",
  "ending",
];
const TEMPO_OPTIONS: PresentationTempo[] = [
  "ambient",
  "reading",
  "response",
  "critical",
  "still",
];
const STATION_OPTIONS: Array<Exclude<LitStation, null> | "none"> = [
  "none",
  "analysis",
  "operations",
  "institutions",
];
const PAPER_OPTIONS: PaperLoad[] = [
  "sparse",
  "working",
  "burdened",
  "saturated",
];
// Derived, not hand-listed. The old literal array omitted the advisor endings,
// so the one surface built to eyeball every ending could not select the two that
// had no treatment.
const ENDING_OPTIONS: Array<EndingId | "none"> = ["none", ...ENDING_IDS];
const HOLDER_OPTIONS: Array<AdvisorId[]> = [
  [],
  ["analyst"],
  ["fixer"],
  ["steward"],
  ["analyst", "steward"],
  ["analyst", "fixer", "steward"],
];
const CONDITION_OPTIONS: PersistentRoomMarks["institutionalCondition"][] = [
  "secure",
  "worn",
  "breached",
];
const CORPORATION_OPTIONS: PersistentRoomMarks["corporationPresence"][] = [
  "distant",
  "visible",
  "embedded",
];
const STAFF_OPTIONS: PresentationModel["staffLayout"]["mode"][] = [
  "full",
  "reduced",
  "skeleton",
];
const ADVISOR_OPTIONS = ["analyst", "fixer", "steward"] as const;

export function ControlRoomPreview() {
  const [state, setState] = useState<PresentationState>("calm");
  const [progress, setProgress] = useState(0);
  const [focus, setFocus] = useState<PresentationFocus>("assess");
  const [shot, setShot] = useState<PresentationShot>("operations");
  const [tempo, setTempo] = useState<PresentationTempo>("ambient");
  const [station, setStation] = useState<LitStation>(null);
  const [paperLoad, setPaperLoad] = useState<PaperLoad>("sparse");
  const [ending, setEnding] = useState<EndingId | null>(null);
  const [activeSituation, setActiveSituation] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [institutionalCondition, setInstitutionalCondition] =
    useState<PersistentRoomMarks["institutionalCondition"]>("secure");
  const [corporationPresence, setCorporationPresence] =
    useState<PersistentRoomMarks["corporationPresence"]>("distant");
  const [staffMode, setStaffMode] =
    useState<PresentationModel["staffLayout"]["mode"]>("full");
  const [departedAdvisors, setDepartedAdvisors] =
    useState<PersistentRoomMarks["departedAdvisors"]>([]);
  const [holders, setHolders] = useState<AdvisorId[]>([]);
  const copy = PRESENTATION_STATE_COPY[state];
  const brbStage = getBrbVisualStage(progress);
  const model: PresentationModel = {
    state,
    stateLabel: copy.label,
    caption: copy.caption,
    focus: focus === "investigate" ? "investigate" : "assess",
    brbProgress: progress,
    brbStage,
    shot,
    tempo,
    litStation: station,
    paperLoad,
    endingId: ending,
    lighting: resolveLighting(state, ending),
    authority: resolveAuthority(ending, holders),
    staffLayout: {
      mode: staffMode,
      crossingVisible: !activeSituation,
      crossingDirection: "left-to-right",
    },
    persistentRoomMarks: {
      emergencyLevel:
        state === "crisis" || state === "institutional-failure"
          ? "critical"
          : state === "strained" || state === "corporate-encroachment"
            ? "strained"
            : "routine",
      institutionalCondition,
      corporationPresence,
      brbConstruction:
        brbStage === "sealed"
          ? "sealed"
          : brbStage === "infrastructure"
            ? "framed"
            : brbStage === "construction"
              ? "active"
              : brbStage === "unstable"
                ? "unstable"
                : "ready",
      departedAdvisors,
      completedRouteCount: 0,
    },
  };

  function toggleDepartedAdvisor(
    advisor: (typeof ADVISOR_OPTIONS)[number],
    departed: boolean,
  ): void {
    setDepartedAdvisors((current) =>
      departed
        ? [...current, advisor]
        : current.filter((candidate) => candidate !== advisor));
  }

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
          Shot
          <select
            aria-label="Presentation shot"
            value={shot}
            onChange={(event) => {
              setShot(event.target.value as PresentationShot);
            }}
          >
            {SHOT_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Tempo
          <select
            aria-label="Presentation tempo"
            value={tempo}
            onChange={(event) => {
              setTempo(event.target.value as PresentationTempo);
            }}
          >
            {TEMPO_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Lit station
          <select
            aria-label="Lit station"
            value={station ?? "none"}
            onChange={(event) => {
              const value = event.target.value as LitStation | "none";
              setStation(value === "none" ? null : value);
            }}
          >
            {STATION_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Paper load
          <select
            aria-label="Paper load"
            value={paperLoad}
            onChange={(event) => {
              setPaperLoad(event.target.value as PaperLoad);
            }}
          >
            {PAPER_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Ending
          <select
            aria-label="Ending tableau"
            value={ending ?? "none"}
            onChange={(event) => {
              const value = event.target.value as EndingId | "none";
              setEnding(value === "none" ? null : value);
            }}
          >
            {ENDING_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Structure
          <select
            aria-label="Institutional condition"
            value={institutionalCondition}
            onChange={(event) => {
              setInstitutionalCondition(
                event.target.value as PersistentRoomMarks["institutionalCondition"],
              );
            }}
          >
            {CONDITION_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Corporation
          <select
            aria-label="Corporation presence"
            value={corporationPresence}
            onChange={(event) => {
              setCorporationPresence(
                event.target.value as PersistentRoomMarks["corporationPresence"],
              );
            }}
          >
            {CORPORATION_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Occupancy
          <select
            aria-label="Staff mode"
            value={staffMode}
            onChange={(event) => {
              setStaffMode(
                event.target.value as PresentationModel["staffLayout"]["mode"],
              );
            }}
          >
            {STAFF_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
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

        {ADVISOR_OPTIONS.map((advisor) => (
          <label className={styles.previewToggle} key={advisor}>
            {advisor} departed
            <input
              aria-label={`${advisor} departed`}
              checked={departedAdvisors.includes(advisor)}
              type="checkbox"
              onChange={(event) =>
                toggleDepartedAdvisor(advisor, event.target.checked)}
            />
          </label>
        ))}

        {/* Which advisors hold the state at a takeover ending. In real play this
            is derived from advisor leverage; here it is picked so both the coup
            and cabal compositions can be eyeballed, including the no-holder
            fallback a legacy save can produce. */}
        {ADVISOR_OPTIONS.map((advisor) => (
          <label className={styles.previewToggle} key={`holder-${advisor}`}>
            {advisor} holds state
            <input
              aria-label={`${advisor} holds state`}
              checked={holders.includes(advisor)}
              type="checkbox"
              onChange={(event) =>
                setHolders((current) =>
                  event.target.checked
                    ? [...current, advisor]
                    : current.filter((candidate) => candidate !== advisor))}
            />
          </label>
        ))}
      </section>

      <section className={styles.previewStage}>
        <div className={styles.previewRoom}>
          <ControlRoomPresentation
            model={model}
            turn={1}
            hasActiveSituation={activeSituation}
            reducedMotionOverride={reducedMotion}
            focusOverride={focus}
          />
        </div>

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
          <div
            className={`${workspaceStyles.noActiveFile} ${styles.previewStandby}`}
          >
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
