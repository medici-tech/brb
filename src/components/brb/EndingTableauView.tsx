"use client";

import { useEffect, useRef } from "react";
import type { EndingId, GameState } from "../../game/types";
import { deriveTurnBeats } from "../../game/turn-beats";
import { ControlRoomPresentation } from "./control-room/ControlRoomPresentation";
import {
  derivePresentationInputs,
  resolvePresentationModel,
} from "./control-room/presentationStateResolver";
import { NarrativeAftermath } from "./narrative/NarrativeAftermath";
import { NARRATIVE_SCENE_REGISTRY } from "./narrative/sceneRegistry";
import { resolveNarrativeSceneCues } from "./narrative/sceneResolver";
import { CreditsDialog } from "./CreditsDialog";
import styles from "./EndingTableauView.module.css";

type Props = {
  state: GameState;
  onOpenReport: () => void;
};

/**
 * Typed as a total map over `EndingId` on purpose: a new loss ending must not be
 * able to reach the final tableau with an undefined kicker. The advisor-takeover
 * pair below was added after this view and would have rendered a blank line.
 */
const ENDING_KICKERS: Readonly<Record<EndingId, string>> = {
  civic_legacy: "PUBLIC CONTROL MAINTAINED",
  compromised_activation: "AUTHORITY DIVIDED",
  corporate_capture: "PRIVATE SYSTEM ASCENDANT",
  state_collapse: "CONTINUITY SIGNAL LOST",
  advisor_coup: "GOVERNMENT UNDER ADVISOR CONTROL",
  advisor_cabal: "DIRECTORATE CAPTURED FROM WITHIN",
};

export function EndingTableauView({ state, onOpenReport }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ending = state.ending;
  const model = resolvePresentationModel(
    derivePresentationInputs(state, null, {
      ending: ending?.id ?? null,
    }),
  );
  const narrativeCues = resolveNarrativeSceneCues(
    state,
    NARRATIVE_SCENE_REGISTRY,
  );
  const turnBeats = deriveTurnBeats(state, state.lastTurnResolution);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (!ending) return null;

  return (
    <main className={styles.shell} data-ending-tableau={ending.id}>
      <header className={styles.masthead}>
        <p>FCD · FINAL CONTROL-ROOM RECORD</p>
        <div className="header-actions">
          <CreditsDialog />
          <span>{state.runId}</span>
        </div>
      </header>

      <section
        aria-labelledby="ending-tableau-title"
        className={styles.stage}
      >
        <div className={styles.roomStage}>
          <ControlRoomPresentation
            model={model}
            turn={state.turn}
            hasActiveSituation={false}
          />
        </div>
        <div className={styles.caption}>
          <p>{ENDING_KICKERS[ending.id]}</p>
          <h1
            id="ending-tableau-title"
            ref={headingRef}
            tabIndex={-1}
          >
            {ending.variationTitle ?? ending.title}
          </h1>
          {ending.variationTitle ? (
            <span>Official classification · {ending.title}</span>
          ) : null}
          <strong>{ending.reason}</strong>
          <button type="button" onClick={onOpenReport}>
            Open final report
          </button>
        </div>
      </section>
      {narrativeCues.length > 0 ? (
        <NarrativeAftermath cues={narrativeCues} turnBeats={turnBeats} />
      ) : null}
    </main>
  );
}
