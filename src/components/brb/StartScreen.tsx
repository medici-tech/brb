"use client";

import { useState } from "react";
import { ARCHETYPES } from "../../game/content";
import { LEGACY_DIRECTIVES } from "../../game/directives";
import { RESOURCE_LABELS, TRACK_LABELS } from "../../game/guidance";
import { formatCampaignTime } from "../../game/progression";
import {
  RESOURCE_KEYS,
  TRACK_KEYS,
  type ArchetypeId,
  type GameState,
  type LegacyDirectiveId,
  type ReplayIntent,
} from "../../game/types";
import { HowToPlayDialog } from "./HowToPlayDialog";

type Props = {
  savedRun: GameState | null;
  replayIntent: ReplayIntent | null;
  unlockedDirectiveIds?: LegacyDirectiveId[];
  onStart: (archetypeId: ArchetypeId, directiveId: LegacyDirectiveId | null) => void;
  onResume: () => void;
  onOpenArchive: () => void;
  onOpenPlaytest?: () => void;
  newRunBlocked?: boolean;
};

function signedChange(value: number): string {
  return `${value > 0 ? "+" : "−"}${Math.abs(value)}`;
}

export function StartScreen({
  savedRun,
  replayIntent,
  unlockedDirectiveIds = [],
  onStart,
  onResume,
  onOpenArchive,
  onOpenPlaytest,
  newRunBlocked = false,
}: Props) {
  const [selectedDirectiveId, setSelectedDirectiveId] = useState<LegacyDirectiveId | null>(null);
  const replayDirective = replayIntent?.legacyDirectiveId
    ? LEGACY_DIRECTIVES[replayIntent.legacyDirectiveId]
    : null;
  return (
    <main className="shell start-shell">
      <header className="masthead">
        <p className="eyebrow">Federal Continuity Directorate · File BRB-01</p>
        <div className="header-actions">
          <HowToPlayDialog />
          {onOpenPlaytest ? <button className="text-button internal-tool-button" type="button" onClick={onOpenPlaytest}>Internal Playtest</button> : null}
          <button className="text-button" type="button" onClick={onOpenArchive}>Intelligence Archive</button>
        </div>
      </header>

      <section className="hero paper-panel">
        <div className="stamp">TOP SECRET</div>
        <p className="file-label">OPERATIONAL BRIEF</p>
        <h1>Build the machine.<br />Decide what it costs.</h1>
        <p className="hero-copy">
          Permanently commit scarce political resources to a dangerous national project,
          then decide whether the state can survive its activation.
        </p>
        <aside className="mission-brief" aria-label="Campaign objective and loss conditions">
          <strong>Your objective</strong>
          <p>Raise Engineering, Access, Legitimacy, and Stability to 50, then activate the BRB.</p>
          <small>
            The campaign ends if Corporation Progress reaches 100, Panic reaches 100,
            Institutions reaches 0, or every advisor leaves. It also ends if your
            advisors take over: one at Leverage 85 seizes control, or two at 50 or
            more govern without you. Stress drains Trust at 80 but never directly
            ends the run.
          </small>
        </aside>
        {!savedRun ? (
          <button
            className="primary-button start-cta"
            type="button"
            onClick={() => document.getElementById("choose-director")?.scrollIntoView({ behavior: "auto", block: "start" })}
          >
            Choose an operating doctrine
          </button>
        ) : null}
        {replayIntent ? (
          <aside className="objective">
            <span>COUNTERFACTUAL OBJECTIVE</span>
            {replayIntent.experiment}
          </aside>
        ) : null}
        {savedRun ? (
          <>
            <button className="primary-button resume-button" onClick={onResume}>
              Resume file · {formatCampaignTime(savedRun.turn)}
            </button>
            <p className="saved-run-notice">Resume or clear the active file from Internal Playtest before starting another run.</p>
          </>
        ) : null}
      </section>

      <section className="directive-loadout paper-panel" aria-labelledby="directive-loadout-title">
        <p className="file-label">LEGACY DIRECTIVE · OPTIONAL</p>
        <h2 id="directive-loadout-title">Carry one authorization into the next file.</h2>
        <p>
          An equipped Directive can modify one commitment during the campaign. It remains
          permanently unlocked and is not consumed.
        </p>
        {replayIntent ? (
          <div className="directive-replay-lock">
            <strong>Replay loadout</strong>
            <span>
              {replayDirective
                ? `${replayDirective.title} · ${replayDirective.benefit} · ${replayDirective.warning}`
                : "No Directive equipped"}
            </span>
          </div>
        ) : (
          <div className="directive-options" role="group" aria-label="Choose a Legacy Directive">
            <button
              type="button"
              className={selectedDirectiveId === null ? "selected" : ""}
              aria-pressed={selectedDirectiveId === null}
              onClick={() => setSelectedDirectiveId(null)}
            >
              <strong>No Directive</strong>
              <span>Preserve the baseline campaign.</span>
            </button>
            {unlockedDirectiveIds.map((id) => {
              const directive = LEGACY_DIRECTIVES[id];
              return (
                <button
                  type="button"
                  className={selectedDirectiveId === id ? "selected" : ""}
                  aria-pressed={selectedDirectiveId === id}
                  key={id}
                  onClick={() => setSelectedDirectiveId(id)}
                >
                  <strong>{directive.title} · {directive.rarity}</strong>
                  <span>{directive.benefit} · {directive.warning}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="choose-director" className="archetype-section">
        <div className="section-heading">
          <p className="file-label">SELECT OPERATING DOCTRINE</p>
          <h2 id="choose-director">Who are you when the pressure starts?</h2>
        </div>
        <div className="archetype-grid">
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
              <article className="archetype-card" key={id}>
                <span className="card-index">0{Object.keys(ARCHETYPES).indexOf(id) + 1}</span>
                <h3>{archetype.name}</h3>
                <p>{archetype.description}</p>
                <dl>
                  <div><dt>Starting position</dt><dd>{startingChanges.join(" · ")}</dd></div>
                  <div><dt>Situations seen more often</dt><dd>{archetype.favoredCardType} files</dd></div>
                  <div><dt>Liability</dt><dd>{archetype.liability}</dd></div>
                </dl>
                <button
                  className="primary-button"
                  disabled={newRunBlocked}
                  onClick={() => onStart(id, replayIntent?.legacyDirectiveId ?? selectedDirectiveId)}
                >
                  Open {archetype.name} File
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
