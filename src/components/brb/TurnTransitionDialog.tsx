"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCampaignTime } from "../../game/progression";
import type {
  EchoType,
  GameState,
  TurnBeat as TurnBeatModel,
  TurnResolution,
} from "../../game/types";
import { LastTurnResult } from "./LastTurnResult";
import { NarrativeAftermath } from "./narrative/NarrativeAftermath";
import { NARRATIVE_SCENE_REGISTRY } from "./narrative/sceneRegistry";
import { resolveNarrativeSceneCues } from "./narrative/sceneResolver";
import { TurnBeat, TurnBeatSequence } from "./ui";

const BEAT_LABELS: Record<TurnBeatModel["kind"], string> = {
  improvement: "01 · IMPROVEMENT",
  discovery: "02 · STRATEGIC CONNECTION",
  milestone: "03 · MILESTONE",
  problem: "04 · NEW PROBLEM",
};

type Props = {
  beats: TurnBeatModel[];
  echoTypes: EchoType[];
  nextTurn: number;
  onContinue: () => void;
  open: boolean;
  resolution: TurnResolution | null;
  state: GameState;
};

export function TurnTransitionDialog({
  beats,
  echoTypes,
  nextTurn,
  onContinue,
  open,
  resolution,
  state,
}: Props) {
  if (!resolution) return null;
  const narrativeCues = resolveNarrativeSceneCues(
    state,
    NARRATIVE_SCENE_REGISTRY,
  );

  return (
    <Dialog open={open}>
      <DialogContent
        className="brb-paper-texture flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] min-w-0 max-w-5xl flex-col overflow-hidden rounded-sm border-dossier-ink/60 bg-dossier text-dossier-ink shadow-[10px_10px_0_rgba(0,0,0,0.5)] sm:max-w-5xl [&>*]:min-w-0 [&>*]:max-w-full [&_h2]:break-words [&_p]:break-words"
        showCloseButton={false}
        zoomAnimation={false}
      >
        {/* The record scrolls on its own so the month's primary action below it
            never scrolls out of reach and never covers the beat controls. */}
        <div className="grid min-w-0 flex-1 content-start gap-4 overflow-x-hidden overflow-y-auto [&>*]:min-w-0 [&>*]:max-w-full">
        <DialogHeader className="min-w-0">
          <p className="file-label text-destructive">
            COMMITMENT RESOLVED · MONTH {resolution.month}
          </p>
          <DialogTitle className="brb-display break-words text-4xl leading-none font-semibold">
            The campaign moved. Now it pushes back.
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-6 text-dossier-ink/70">
            Follow the sequence from improvement to the problem your next commitment
            may need to solve.
          </DialogDescription>
        </DialogHeader>
        {narrativeCues.length > 0 ? (
          <NarrativeAftermath cues={narrativeCues} turnBeats={beats} />
        ) : null}
        {beats.length > 0 ? (
          <section aria-label="Commitment outcome" aria-live="polite">
            <TurnBeatSequence className="mt-1.5">
              {beats.map((beat) => (
                <TurnBeat
                  dataBeatKind={beat.kind}
                  description={beat.explanation}
                  details={beat.exactChanges.length > 0 ? (
                    <ul className="flex list-none flex-wrap gap-1.5 p-0">
                      {beat.exactChanges.map((change) => (
                        <li
                          className="brb-telemetry border border-dossier-ink/35 px-2 py-1 text-[10px] font-semibold text-dossier-ink/80"
                          key={change}
                        >
                          {change}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  key={`${beat.kind}-${beat.title}-${beat.linkedDecisionIds.join("-")}`}
                  label={BEAT_LABELS[beat.kind]}
                  title={beat.title}
                  tone={beat.kind}
                />
              ))}
            </TurnBeatSequence>
          </section>
        ) : null}
        <details className="mt-3 border-t border-dashed border-dossier-ink/50">
          <summary className="brb-telemetry cursor-pointer px-0.5 pt-3.5 text-[11px] font-bold tracking-[0.08em] text-dossier-ink/70 uppercase">
            Open exact action-to-consequence record
          </summary>
          <LastTurnResult
            echoTypes={echoTypes}
            heading="ACTION-TO-CONSEQUENCE RECORD"
            resolution={resolution}
          />
        </details>
        </div>
        <DialogFooter className="mt-4 shrink-0 border-t border-dossier-ink/40 pt-4">
          <Button
            className="h-auto min-h-12 min-w-0 max-w-full whitespace-normal break-words px-4 py-3 text-center sm:w-auto sm:px-6"
            variant="dossier"
            size="lg"
            onClick={onContinue}
          >
            Continue to {formatCampaignTime(nextTurn)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
