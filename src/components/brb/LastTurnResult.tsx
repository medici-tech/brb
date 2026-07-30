import { formatStateDelta } from "../../game/guidance";
import type { EchoType, ResolvedEffect, TurnResolution } from "../../game/types";
import { OutcomeNotice } from "./ui";

const ECHO_LABELS: Record<EchoType, string> = {
  card: "Situation Deck",
  relationship: "advisor relationship",
  system: "operating doctrine",
  ending: "final record",
};

function ResultGroup({ effect }: { effect: ResolvedEffect }) {
  const changes = formatStateDelta(effect.delta);
  return (
    <section className="border-l-[3px] border-dossier-ink/25 py-0.5 pl-3.5">
      <strong className="text-[13px]">{effect.label}</strong>
      {changes.length > 0 ? (
        <ul className="mt-2 flex list-none flex-wrap gap-1.5 p-0">
          {changes.map((change) => (
            <li
              className="brb-telemetry border border-dossier-ink/35 px-1.5 py-1 text-[10px] font-semibold text-dossier-ink/80"
              key={change}
            >
              {change}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 mb-0 text-[11px] text-dossier-ink/65">
          No meter changed immediately.
        </p>
      )}
    </section>
  );
}

type Props = {
  resolution: TurnResolution | null;
  echoTypes: EchoType[];
  heading?: string;
};

export function LastTurnResult({
  resolution,
  echoTypes,
  heading = "LAST MONTH’S RESULT · EXACT CHANGES",
}: Props) {
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
    <aside className="mt-7" aria-label="Last month’s result">
      <OutcomeNotice
        eyebrow={heading}
        surface="paper"
        description={
          <div className="w-full">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {groups.map((effect) => <ResultGroup effect={effect} key={effect.label} />)}
            </div>
            {delayedCategories.length > 0 ? (
              <p className="mt-3 border-t border-dashed border-dossier-ink/35 pt-3 text-xs leading-5 text-dossier-ink/70">
                <strong>Delayed Echo registered:</strong>{" "}
                {delayedCategories.join(", ")}. Details remain classified until they surface in the
                campaign or Declassified Report.
              </p>
            ) : null}
          </div>
        }
      />
    </aside>
  );
}
