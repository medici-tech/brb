"use client";

import { useState } from "react";
import { ARCHETYPES } from "../../game/content";
import { LEGACY_DIRECTIVES } from "../../game/directives";
import { RESOURCE_LABELS, TRACK_LABELS } from "../../game/guidance";
import { formatCampaignTime } from "../../game/progression";
import {
  RESOURCE_KEYS,
  TRACK_KEYS,
  type ArchiveScarId,
  type ArchetypeId,
  type GameState,
  type LegacyDirectiveId,
  type ReplayIntent,
} from "../../game/types";
import { NECESSARY_REGIME_AFTERMATH_PANIC } from "../../game/replay";
import { Button } from "../ui/button";
import { ConfirmActionDialog } from "./ui/decisions";
import { CreditsDialog } from "./CreditsDialog";
import { HowToPlayDialog } from "./HowToPlayDialog";
import { PlayerRoomScene } from "./pixel-room/PlayerRoomScene";
import {
  ArchetypeCard,
  DossierPanel,
  GuidedObjective,
  Hero,
  SectionHeading,
} from "./ui";

type Props = {
  savedRun: GameState | null;
  replayIntent: ReplayIntent | null;
  unlockedDirectiveIds?: LegacyDirectiveId[];
  pendingScar?: ArchiveScarId | null;
  onStart: (archetypeId: ArchetypeId, directiveId: LegacyDirectiveId | null) => void;
  onResume: () => void;
  onOpenArchive: () => void;
  onOpenPlaytest?: () => void;
  onAbandonSavedRun?: () => void;
  newRunBlocked?: boolean;
};

function signedChange(value: number): string {
  return `${value > 0 ? "+" : "−"}${Math.abs(value)}`;
}

export function StartScreen({
  savedRun,
  replayIntent,
  unlockedDirectiveIds = [],
  pendingScar = null,
  onStart,
  onResume,
  onOpenArchive,
  onOpenPlaytest,
  onAbandonSavedRun,
  newRunBlocked = false,
}: Props) {
  const [selectedDirectiveId, setSelectedDirectiveId] = useState<LegacyDirectiveId | null>(null);
  const replayDirective = replayIntent?.legacyDirectiveId
    ? LEGACY_DIRECTIVES[replayIntent.legacyDirectiveId]
    : null;
  // A queued same-seed replay opens clean, so the banner must not claim the
  // scar applies to it. Mirrors getOpeningAftermathForRun in the engine.
  const aftermathHeld = replayIntent?.mode === "same_seed";
  return (
    <main className="shell start-shell">
      <header className="masthead">
        <p className="eyebrow">Federal Continuity Directorate · File BRB-01</p>
        <div className="header-actions">
          <HowToPlayDialog />
          <CreditsDialog />
          {onOpenPlaytest ? <button className="text-button internal-tool-button" type="button" onClick={onOpenPlaytest}>Playtest Journal</button> : null}
          <button className="text-button" type="button" onClick={onOpenArchive}>Intelligence Archive</button>
        </div>
      </header>

      <div className="start-brief-grid">
        <Hero
          eyebrow="OPERATIONAL BRIEF"
          title={<>Build the machine.<br />Decide what it costs.</>}
          summary="Permanently commit scarce political resources to a dangerous national project, then decide whether the state can survive its activation."
          stamp="TOP SECRET"
        >
        <aside className="grid max-w-3xl gap-2 border-l-4 border-destructive bg-[rgba(89,73,49,.07)] px-4 py-3.5" aria-label="Campaign objective and loss conditions">
          <strong>Your objective</strong>
          <p className="m-0 leading-6 text-dossier-ink/80">Raise Engineering, Access, Legitimacy, and Stability to 50, then activate the BRB.</p>
          <small className="text-xs leading-5 text-dossier-ink/75">
            The campaign ends if Corporation Progress reaches 100, Panic reaches 100,
            Institutions reaches 0, or every advisor leaves. It also ends if your
            advisors take over: one at Leverage 85 seizes control, or two at 50 or
            more govern without you. Stress drains Trust at 80 but never directly
            ends the run.
          </small>
        </aside>
        {pendingScar === "necessary_regime_aftermath" ? (
          <aside
            className="mt-4 grid max-w-3xl gap-1 border-l-4 border-signal bg-[rgba(89,73,49,.07)] px-4 py-3.5"
            aria-label="Necessary Regime aftermath"
            role="status"
          >
            <strong>Aftermath {aftermathHeld ? "held" : "active"}</strong>
            <p className="m-0 leading-6 text-dossier-ink/80">
              {aftermathHeld
                ? `Your last Necessary Regime left a scar. The queued same-seed replay is a controlled sample, so it opens clean and the scar is not spent; your next ordinary campaign starts with Panic +${NECESSARY_REGIME_AFTERMATH_PANIC}.`
                : `Your last Necessary Regime left a scar: the next campaign you open starts with Panic +${NECESSARY_REGIME_AFTERMATH_PANIC}. It is spent on your first commitment and lasts for that campaign only.`}
            </p>
          </aside>
        ) : null}
        {!savedRun ? (
          <Button
            className="mt-5"
            variant="authorize"
            type="button"
            onClick={() => document.getElementById("choose-director")?.scrollIntoView({ behavior: "auto", block: "start" })}
          >
            Choose an operating doctrine
          </Button>
        ) : null}
        {replayIntent ? (
          <GuidedObjective
            className="mt-6 max-w-3xl"
            eyebrow="COUNTERFACTUAL OBJECTIVE"
            title={replayIntent.experiment}
            description=""
            compact
          />
        ) : null}
        {savedRun ? (
          <>
            <Button className="mt-7" variant="authorize" onClick={onResume}>
              Resume file · {formatCampaignTime(savedRun.turn)}
            </Button>
            <p className="mt-3 mb-0 max-w-xl text-[13px] text-dossier-ink/70">Resume the active file, or abandon it to open a new one.</p>
            {onAbandonSavedRun ? (
              <ConfirmActionDialog
                trigger={<Button className="mt-3" variant="quiet" type="button">Abandon the active file</Button>}
                title="Abandon the active file?"
                description="The current campaign save is removed from this browser. Its journal entry is kept and marked abandoned."
                tone="critical"
                confirmAction={{ label: "Abandon the file", onSelect: onAbandonSavedRun }}
              />
            ) : null}
          </>
        ) : null}
        </Hero>
        <aside className="player-room-scene" aria-label="Intake office scene">
          <PlayerRoomScene
            variant="intake"
            ariaLabel="Federal intake office. Two officials prepare the operational brief."
          />
        </aside>
      </div>

      <DossierPanel
        className="my-6"
        eyebrow="LEGACY DIRECTIVE · OPTIONAL"
        title="Carry one authorization into the next file."
        titleId="directive-loadout-title"
        summary="An equipped Directive can modify one commitment during the campaign. It remains permanently unlocked and is not consumed."
      >
        {replayIntent ? (
          <div className="grid gap-2 border border-[color:var(--paper-line)] bg-white/20 p-4">
            <strong>Replay loadout</strong>
            <span className="text-xs leading-5 text-dossier-ink/70">
              {replayDirective
                ? `${replayDirective.title} · ${replayDirective.benefit} · ${replayDirective.warning}`
                : "No Directive equipped"}
            </span>
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-3" role="group" aria-label="Choose a Legacy Directive">
            <Button
              type="button"
              variant="dossier"
              className={`h-auto min-h-16 flex-col items-start text-left whitespace-normal ${selectedDirectiveId === null ? "outline-3 outline-destructive outline-offset-2" : ""}`}
              aria-pressed={selectedDirectiveId === null}
              onClick={() => setSelectedDirectiveId(null)}
            >
              <strong>No Directive</strong>
              <span className="text-xs leading-5 opacity-70">Preserve the baseline campaign.</span>
            </Button>
            {unlockedDirectiveIds.map((id) => {
              const directive = LEGACY_DIRECTIVES[id];
              return (
                <Button
                  type="button"
                  variant="dossier"
                  className={`h-auto min-h-16 flex-col items-start text-left whitespace-normal ${selectedDirectiveId === id ? "outline-3 outline-destructive outline-offset-2" : ""}`}
                  aria-pressed={selectedDirectiveId === id}
                  key={id}
                  onClick={() => setSelectedDirectiveId(id)}
                >
                  <strong>{directive.title} · {directive.rarity}</strong>
                  <span className="text-xs leading-5 opacity-70">{directive.benefit} · {directive.warning}</span>
                </Button>
              );
            })}
          </div>
        )}
      </DossierPanel>

      <section className="mt-14" aria-labelledby="choose-director">
        <SectionHeading eyebrow="SELECT OPERATING DOCTRINE" title="Who are you when the pressure starts?" titleId="choose-director" />
        <div className="grid gap-4 lg:grid-cols-3">
          {(Object.keys(ARCHETYPES) as ArchetypeId[]).map((id) => {
            const archetype = ARCHETYPES[id];
            const startingChanges = [
              ...RESOURCE_KEYS.flatMap((resource) => {
                const amount = archetype.resourceChanges[resource];
                return amount ? [`${RESOURCE_LABELS[resource]} ${signedChange(amount)}`] : [];
              }),
              ...TRACK_KEYS.flatMap((track) => {
                const amount = archetype.trackChanges[track];
                return amount ? [`${TRACK_LABELS[track]} ${signedChange(amount)}`] : [];
              }),
            ];
            return (
              <ArchetypeCard
                index={`0${Object.keys(ARCHETYPES).indexOf(id) + 1}`}
                title={archetype.name}
                description={archetype.description}
                details={[
                  { label: "Starting position", value: startingChanges.join(" · ") },
                  { label: "Situations seen more often", value: `${archetype.favoredCardType} files` },
                  { label: "Liability", value: archetype.liability },
                ]}
                action={(
                  <Button
                    variant="critical"
                    disabled={newRunBlocked}
                    onClick={() => onStart(id, replayIntent?.legacyDirectiveId ?? selectedDirectiveId)}
                  >
                    Open {archetype.name} File
                  </Button>
                )}
                key={id}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}
