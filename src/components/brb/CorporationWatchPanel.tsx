import {
  describeCorporationPosture,
  describeCorporationPressure,
} from "../../game/guidance";
import {
  describeCompletionPressure,
  getCompletionPressure,
  getCorporationPressure,
} from "../../game/progression";
import type { GameState } from "../../game/types";

interface Props {
  state: GameState;
}

export function CorporationWatchPanel({ state }: Props) {
  const corporationPressure = getCorporationPressure(state);
  const completionPressure = getCompletionPressure(state);

  return (
    <article className="dark-panel briefing-panel">
      <p className="file-label">CORPORATION WATCH</p>
      <div className="watch-meter">
        <span>Progress</span>
        <strong>{state.corporation.progress}<small>/ 100</small></strong>
        <p>At 100, the Corporation wins. At 80 or more, activating the BRB risks Corporate Capture.</p>
      </div>
      <div className="watch-section">
        <span>Threat · response speed and severity · {corporationPressure.tier}</span>
        <strong>{state.corporation.threat} / 100</strong>
        <p>{describeCorporationPressure(state)}</p>
      </div>
      <div className="watch-section">
        <span>Posture · move being prepared</span>
        <strong>{state.corporation.strategy.replaceAll("_", " ")}</strong>
        <p>{describeCorporationPosture(state.corporation.strategy)}</p>
      </div>
      <div className="watch-section">
        <span>Response clock · when the move happens</span>
        <strong>
          {corporationPressure.monthsUntilResponse === 0
            ? "Response due now"
            : `${corporationPressure.monthsUntilResponse} month${corporationPressure.monthsUntilResponse === 1 ? "" : "s"}`}
        </strong>
        <p>
          Expected Month {corporationPressure.nextResponseMonth}. A correct counter pushes
          back Progress and Threat; a wrong counter raises Threat.
        </p>
      </div>
      <details className="watch-details">
        <summary>Why pressure is rising</summary>
        <p>
          BRB completion pressure is {completionPressure.tier} at{" "}
          {completionPressure.completionPercent}%.
          {` ${describeCompletionPressure(completionPressure)}.`}
        </p>
      </details>
    </article>
  );
}
