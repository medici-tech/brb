import { formatStateDelta } from "../../game/guidance";
import type { EchoType, ResolvedEffect, TurnResolution } from "../../game/types";

const ECHO_LABELS: Record<EchoType, string> = {
  card: "Situation Deck",
  relationship: "advisor relationship",
  system: "operating doctrine",
  ending: "final record",
};

function ResultGroup({ effect }: { effect: ResolvedEffect }) {
  const changes = formatStateDelta(effect.delta);
  return (
    <section className="result-group">
      <strong>{effect.label}</strong>
      {changes.length > 0 ? (
        <ul>{changes.map((change) => <li key={change}>{change}</li>)}</ul>
      ) : (
        <p>No meter changed immediately.</p>
      )}
    </section>
  );
}

type Props = {
  resolution: TurnResolution | null;
  echoTypes: EchoType[];
};

export function LastTurnResult({ resolution, echoTypes }: Props) {
  if (!resolution) return null;
  const groups = [
    resolution.ignoredSituation,
    resolution.commitment,
    resolution.advisorReactions,
    resolution.corporationResponse,
    resolution.monthlyPressure,
  ].filter((effect): effect is ResolvedEffect => effect !== null);
  const delayedCategories = [...new Set(echoTypes.map((type) => ECHO_LABELS[type]))];

  return (
    <aside className="consequence-box" aria-label="Last month’s result">
      <span>LAST MONTH’S RESULT · EXACT CHANGES</span>
      <div className="result-groups">
        {groups.map((effect) => <ResultGroup effect={effect} key={effect.label} />)}
      </div>
      {delayedCategories.length > 0 ? (
        <p className="classified-echo">
          <strong>Delayed Echo registered:</strong>{" "}
          {delayedCategories.join(", ")}. Details remain classified until they surface in the
          campaign or Declassified Report.
        </p>
      ) : null}
    </aside>
  );
}
