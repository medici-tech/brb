"use client";

import { useEffect, useRef } from "react";
import type { GameState } from "../../game/types";
import { ControlRoomPresentation } from "./control-room/ControlRoomPresentation";
import {
  derivePresentationInputs,
  resolvePresentationModel,
} from "./control-room/presentationStateResolver";
import styles from "./EndingTableauView.module.css";

type Props = {
  state: GameState;
  onOpenReport: () => void;
};

const ENDING_KICKERS = {
  civic_legacy: "PUBLIC CONTROL MAINTAINED",
  compromised_activation: "AUTHORITY DIVIDED",
  corporate_capture: "PRIVATE SYSTEM ASCENDANT",
  state_collapse: "CONTINUITY SIGNAL LOST",
} as const;

export function EndingTableauView({ state, onOpenReport }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ending = state.ending;
  const model = resolvePresentationModel(
    derivePresentationInputs(state, null, {
      ending: ending?.id ?? null,
    }),
  );

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (!ending) return null;

  return (
    <main className={styles.shell} data-ending-tableau={ending.id}>
      <header className={styles.masthead}>
        <p>FCD · FINAL CONTROL-ROOM RECORD</p>
        <span>{state.runId}</span>
      </header>

      <section
        aria-labelledby="ending-tableau-title"
        className={styles.stage}
      >
        <ControlRoomPresentation
          model={model}
          turn={state.turn}
          hasActiveSituation={false}
        />
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
    </main>
  );
}
