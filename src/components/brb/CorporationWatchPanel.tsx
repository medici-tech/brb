import { describeCorporationPressure } from "../../game/guidance";
import {
  describeCompletionPressure,
  getCompletionPressure,
  getCorporationPressure,
} from "../../game/progression";
import type { GameState } from "../../game/types";
import { ThreatPanel } from "./ui";

interface Props {
  state: GameState;
}

export function CorporationWatchPanel({ state }: Props) {
  const corporationPressure = getCorporationPressure(state);
  const completionPressure = getCompletionPressure(state);

  return (
    <ThreatPanel
      label="CORPORATION WATCH"
      progress={state.corporation.progress}
      progressDisplay={<>{state.corporation.progress}<small className="text-base text-muted-foreground">/ 100</small></>}
      footer={(
        <details className="text-xs text-foreground/80">
          <summary className="cursor-pointer">Why pressure is rising</summary>
          <p className="text-[11px] leading-5 text-muted-foreground">
            BRB completion pressure is {completionPressure.tier} at{" "}
            {completionPressure.completionPercent}%.
            {` ${describeCompletionPressure(completionPressure)}.`}
          </p>
        </details>
      )}
    >
      <div className="py-4">
        <span className="brb-telemetry text-[10px] font-bold tracking-[0.08em] text-muted-foreground uppercase">Progress</span>
        <p className="mb-0 text-[11px] leading-5 text-muted-foreground">At 100, the Corporation wins. At 80 or more, activating the BRB risks Corporate Capture.</p>
      </div>
      <div className="border-t border-border py-4">
        <span className="brb-telemetry text-[10px] font-bold tracking-[0.08em] text-muted-foreground uppercase">Threat · response speed and severity · {corporationPressure.tier}</span>
        <strong className="mt-2 block text-xl text-foreground">{state.corporation.threat} / 100</strong>
        <p className="mb-0 text-[11px] leading-5 text-muted-foreground">{describeCorporationPressure(state)}</p>
      </div>
      {/* The prepared posture stays concealed — showing it verbatim made the paid
          advisor forecast redundant and neutralized the consultation mechanic.
          Only the last observed move is surfaced, as a tell. */}
      <div className="border-t border-border py-4">
        <span className="brb-telemetry text-[10px] font-bold tracking-[0.08em] text-muted-foreground uppercase">Posture · being prepared (hidden)</span>
        <strong className="mt-2 block text-xl text-foreground capitalize">
          {state.corporation.lastMove
            ? `Last observed move: ${state.corporation.lastMove.replaceAll("_", " ")}`
            : "No move observed yet"}
        </strong>
        <p className="mb-0 text-[11px] leading-5 text-muted-foreground">
          The move the Corporation is preparing is concealed. Consult an advisor to
          forecast the posture before committing a counter-operation.
        </p>
      </div>
      <div className="border-t border-border py-4">
        <span className="brb-telemetry text-[10px] font-bold tracking-[0.08em] text-muted-foreground uppercase">Response clock · when the move happens</span>
        <strong className="mt-2 block text-xl text-foreground">
          {corporationPressure.monthsUntilResponse === 0
            ? "Response due now"
            : `${corporationPressure.monthsUntilResponse} month${corporationPressure.monthsUntilResponse === 1 ? "" : "s"}`}
        </strong>
        <p className="mb-0 text-[11px] leading-5 text-muted-foreground">
          Expected Month {corporationPressure.nextResponseMonth}. A correct counter pushes
          back Progress and Threat; a wrong counter raises Threat.
        </p>
      </div>
    </ThreatPanel>
  );
}
