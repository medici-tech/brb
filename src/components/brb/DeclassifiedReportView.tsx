import { ADVISORS, ARCHETYPES, ROUTE_DEFINITIONS } from "../../game/content";
import { LEGACY_DIRECTIVES } from "../../game/directives";
import { RESOURCE_LABELS, TRACK_LABELS } from "../../game/guidance";
import { REPORT_RULES_VERSION } from "../../game/replay";
import {
  ADVISOR_IDS,
  RESOURCE_KEYS,
  TRACK_KEYS,
  type ArchiveV1,
  type DeclassifiedReport,
  type LegacyDirectiveId,
} from "../../game/types";
import type { BookmarkInput } from "../../playtest/journal";
import type { PlaytestRecap, PlaytestRunEntry } from "../../playtest/types";
import { HowToPlayDialog } from "./HowToPlayDialog";
import { PlaytestBookmarkDialog } from "./PlaytestBookmarkDialog";
import { PlaytestRecapForm } from "./PlaytestRecapForm";

const OUTCOME_RULES: Record<DeclassifiedReport["ending"]["id"], string> = {
  civic_legacy:
    "You activated the BRB while keeping public control, Institutions, and political pressure inside the safest limits.",
  compromised_activation:
    "You activated the BRB, but at least one safety, legitimacy, institutional, or advisor condition remained compromised.",
  corporate_capture:
    "Corporation Progress reached 100, or the Corporation controlled the decisive access point when you activated.",
  state_collapse:
    "State Collapse occurs when Panic reaches 100, Institutions falls to 0, or every advisor leaves.",
  advisor_coup:
    "An advisor reached decisive Leverage while the government depended on them — weakened Institutions or no other active advisor — and took control.",
  advisor_cabal:
    "Two or more active advisors each held cabal-level Leverage and jointly governed without you.",
};

type Props = {
  report: DeclassifiedReport;
  archive?: ArchiveV1;
  onClaimDirective?: (directiveId: LegacyDirectiveId) => void;
  onTestTheory: () => void;
  onOpenNewFile: () => void;
  onArchive: () => void;
  onOpenPlaytest?: () => void;
  onBookmark?: (input: BookmarkInput) => void;
  playtestRun?: PlaytestRunEntry | null;
  guidedReplayRequired?: boolean;
  onSaveRecap?: (recap: Omit<PlaytestRecap, "recordedAt">) => void;
};

export function DeclassifiedReportView({
  report,
  archive,
  onClaimDirective,
  onTestTheory,
  onOpenNewFile,
  onArchive,
  onOpenPlaytest,
  onBookmark,
  playtestRun = null,
  guidedReplayRequired = false,
  onSaveRecap,
}: Props) {
  const recapRequired = Boolean(playtestRun && !playtestRun.recap);
  const resultLabel = report.ending.victory ? "VICTORY" : "LOSS";
  const legacyReport = report.rulesVersion < REPORT_RULES_VERSION;
  return (
    <main className="shell report-shell">
      <header className="masthead">
        <p className="eyebrow">Declassification Authority · {report.runId}</p>
        <div className="header-actions">
          <HowToPlayDialog />
          {onBookmark ? <PlaytestBookmarkDialog onSave={onBookmark} /> : null}
          {onOpenPlaytest ? <button className="text-button internal-tool-button" type="button" onClick={onOpenPlaytest}>Internal Playtest</button> : null}
          <button className="text-button" type="button" onClick={onArchive}>Intelligence Archive</button>
        </div>
      </header>
      <article className="paper-panel report-paper">
        <div className="stamp angled">DECLASSIFIED</div>
        <p className="file-label">CAMPAIGN OUTCOME</p>
        <h1>{report.ending.variationTitle ?? report.ending.title}</h1>
        {report.ending.variationTitle ? <p className="parent-ending">Official classification: {report.ending.title}</p> : null}
        <p className="report-lede">{report.ending.description}</p>

        {legacyReport ? (
          <aside className="legacy-report-warning" role="status">
            <p className="file-label">OLDER RULES BUILD</p>
            <h2>This report is preserved as historical playtest evidence.</h2>
            <p>
              Its recorded ending may not match the current rules. Stress no longer
              causes State Collapse; replaying this seed uses the current rules and may
              produce a different campaign.
            </p>
          </aside>
        ) : null}

        <section className="report-outcome-summary" aria-label="Campaign result explained">
          <div className="outcome-explanation">
            <p className={`outcome-badge ${report.ending.victory ? "victory" : "loss"}`}>
              RESULT · {resultLabel}
            </p>
            <h2>{legacyReport ? "Recorded reason in that build" : "Why this run ended"}</h2>
            <p className="outcome-reason">{report.ending.reason}</p>
            <p className="outcome-rule">{OUTCOME_RULES[report.ending.id]}</p>
          </div>
          <div className="outcome-next-step">
            <p className="file-label">ONE CHANGE FOR YOUR NEXT RUN</p>
            <h2>Try this instead</h2>
            <p>{report.suggestedExperiment}</p>
          </div>
        </section>

        {archive ? (
          <section className="directive-reward report-section" aria-labelledby="directive-reward-title">
            <p className="file-label">LEGACY CLEARANCE · {archive.clearance} / 3</p>
            <h2 id="directive-reward-title">
              {archive.pendingDirectiveDraft
                ? "Choose one authorization to preserve."
                : archive.unlockedDirectiveIds.length === Object.keys(LEGACY_DIRECTIVES).length
                  ? "Every Legacy Directive has been recovered."
                  : "Clearance is accumulating."}
            </h2>
            {archive.pendingDirectiveDraft ? (
              <>
                <p>
                  This seeded draft is fixed for the completed campaign. Choose one
                  permanent unlock; the card will remain available for later files.
                </p>
                <div className="directive-draft">
                  {archive.pendingDirectiveDraft.candidateIds.map((id) => {
                    const directive = LEGACY_DIRECTIVES[id];
                    return (
                      <article key={id}>
                        <span>{directive.rarity}</span>
                        <h3>{directive.title}</h3>
                        <p>{directive.description}</p>
                        <strong>{directive.benefit}</strong>
                        <small>Cost: {directive.warning}</small>
                        <button
                          className="primary-button"
                          type="button"
                          onClick={() => onClaimDirective?.(id)}
                        >
                          Preserve {directive.title}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : (
              <p>
                Completed campaigns grant 1 Clearance point; victories grant 3.
                At 3 points, a seeded Directive draft becomes available.
              </p>
            )}
          </section>
        ) : null}

        {report.finalSnapshot ? (
          <section className="report-final-state" aria-labelledby="final-state-title">
            <p className="file-label">FINAL STATE · WHAT THE CAMPAIGN LEFT BEHIND</p>
            <h2 id="final-state-title">The ending in numbers</h2>
            <div className="final-danger-grid">
              <article><span>Stress</span><strong>{report.finalSnapshot.pressures.stress} / 100</strong><small>Drains Trust at 80; never directly ends the run.</small></article>
              <article><span>Panic</span><strong>{report.finalSnapshot.pressures.panic} / 100</strong><small>State Collapse at 100.</small></article>
              <article><span>Institutions</span><strong>{report.finalSnapshot.institutions} / 100</strong><small>State Collapse at 0.</small></article>
              <article><span>Corporation Progress</span><strong>{report.finalSnapshot.corporation.progress} / 100</strong><small>Corporate Capture at 100; unsafe activation at 80+.</small></article>
            </div>
            <div className="final-state-columns">
              <div>
                <h3>BRB readiness</h3>
                {TRACK_KEYS.map((track) => (
                  <p key={track}><span>{TRACK_LABELS[track]}</span><strong>{report.finalSnapshot?.tracks[track]} / 50</strong></p>
                ))}
              </div>
              <div>
                <h3>Remaining reserves</h3>
                {RESOURCE_KEYS.map((resource) => (
                  <p key={resource}><span>{RESOURCE_LABELS[resource]}</span><strong>{report.finalSnapshot?.resources[resource]}</strong></p>
                ))}
              </div>
              <div>
                <h3>Advisor position</h3>
                {ADVISOR_IDS.map((advisorId) => {
                  const advisor = report.finalSnapshot?.advisors[advisorId];
                  return (
                    <p key={advisorId}>
                      <span>{ADVISORS[advisorId].name}</span>
                      <strong>{advisor?.active ? `Loyalty ${advisor.loyalty} · Leverage ${advisor.leverage}` : "Departed"}</strong>
                    </p>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        <dl className="report-metadata">
          <div><dt>Doctrine</dt><dd>{ARCHETYPES[report.archetypeId].name}</dd></div>
          <div>
            <dt>Legacy Directive</dt>
            <dd>
              {report.legacyDirective.equippedId
                ? `${LEGACY_DIRECTIVES[report.legacyDirective.equippedId].title} · ${report.legacyDirective.used ? "used" : "held"}`
                : "None equipped"}
            </dd>
          </div>
          <div><dt>Story route completed</dt><dd>{report.completedRoute ? ROUTE_DEFINITIONS[report.completedRoute].label : "None this run"}</dd></div>
          <div><dt>Replay code (seed)</dt><dd>{report.seed}</dd></div>
        </dl>

        <aside className="report-reading-guide">
          <p className="file-label">HOW TO READ THE REST OF THIS REPORT</p>
          <p>
            The three choices below are not a grade or a list of mistakes. They are
            the decisions that most strongly shaped your story, strategy, and final
            stretch.
          </p>
        </aside>

        <section className="report-section">
          <p className="file-label">STORY-DEFINING CHOICE · MONTH {report.narrativePivot.turn}</p>
          <h2>{report.narrativePivot.summary}</h2>
          <p className="pivot-explanation">
            This choice created the strongest delayed story consequences in this run.
          </p>
          <ul className="echo-list">
            {report.narrativePivot.echoHints.length > 0
              ? report.narrativePivot.echoHints.map((echo) => <li key={echo}>{echo}</li>)
              : <li>No delayed echo was recovered from this decision.</li>}
          </ul>
        </section>

        <section className="report-section">
          <p className="file-label">MOST CONSEQUENTIAL COMMITMENT · MONTH {report.strategicPivot.turn}</p>
          <h2>{report.strategicPivot.summary}</h2>
          <p className="pivot-explanation">
            This commitment changed your resources, permanent progress, political
            pressure, or available routes more than any other.
          </p>
        </section>

        <section className="report-section">
          <p className="file-label">FINAL-STRETCH TURNING POINT · MONTH {report.finalTurningPoint.turn}</p>
          <h2>{report.finalTurningPoint.summary}</h2>
          <p className="pivot-explanation">
            This was the most consequential decision during the campaign’s final five
            months.
          </p>
        </section>

        <section className="report-section classified-section">
          <p className="file-label">A PATH LEFT UNFINISHED</p>
          <h2>{report.unseenRouteHint.label}</h2>
          <p>{report.unseenRouteHint.message}</p>
          <small>This is a replay hint, not a requirement or a failed objective.</small>
        </section>

        <section className="experiment-panel">
          <p className="file-label">CHOOSE YOUR NEXT FILE</p>
          <h2>Replay this exact situation, or begin somewhere new.</h2>
          <p className="experiment-reminder">
            Recommended experiment: {report.suggestedExperiment}
          </p>
          <div className="report-actions">
            <button className="primary-button" disabled={guidedReplayRequired && recapRequired} onClick={onTestTheory}>Test This Theory</button>
            <button className="secondary-button" onClick={onOpenNewFile}>Open a New File</button>
          </div>
          <small>{guidedReplayRequired && recapRequired ? "Save the playtest recap before beginning the required replay sample. " : null}Test This Theory repeats the seed and equipped Directive under current rules. Open a New File creates a fresh seed with the same loadout.</small>
        </section>

        {playtestRun && onSaveRecap ? <PlaytestRecapForm key={playtestRun.runId} existing={playtestRun.recap} onSave={onSaveRecap} /> : null}
      </article>
    </main>
  );
}
