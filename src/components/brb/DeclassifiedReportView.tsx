import { ARCHETYPES, ROUTE_DEFINITIONS } from "../../game/content";
import type { DeclassifiedReport } from "../../game/types";
import type { BookmarkInput } from "../../playtest/journal";
import type { PlaytestRecap, PlaytestRunEntry } from "../../playtest/types";
import { HowToPlayDialog } from "./HowToPlayDialog";
import { PlaytestBookmarkDialog } from "./PlaytestBookmarkDialog";
import { PlaytestRecapForm } from "./PlaytestRecapForm";

type Props = {
  report: DeclassifiedReport;
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
  return (
    <main className="shell report-shell">
      <header className="masthead">
        <p className="eyebrow">Declassification Authority · {report.runId}</p>
        <div className="header-actions">
          <HowToPlayDialog />
          {onBookmark ? <PlaytestBookmarkDialog onSave={onBookmark} /> : null}
          {onOpenPlaytest ? <button className="text-button" type="button" onClick={onOpenPlaytest}>Playtest Journal</button> : null}
          <button className="text-button" type="button" onClick={onArchive}>Intelligence Archive</button>
        </div>
      </header>
      <article className="paper-panel report-paper">
        <div className="stamp angled">DECLASSIFIED</div>
        <p className="file-label">CAMPAIGN OUTCOME</p>
        <h1>{report.ending.variationTitle ?? report.ending.title}</h1>
        {report.ending.variationTitle ? <p className="parent-ending">Official classification: {report.ending.title}</p> : null}
        <p className="report-lede">{report.ending.description}</p>
        <dl className="report-metadata">
          <div><dt>Doctrine</dt><dd>{ARCHETYPES[report.archetypeId].name}</dd></div>
          <div><dt>Seed</dt><dd>{report.seed}</dd></div>
          <div><dt>Chain completed</dt><dd>{report.completedRoute ? ROUTE_DEFINITIONS[report.completedRoute].label : "None"}</dd></div>
        </dl>

        <section className="report-section">
          <p className="file-label">NARRATIVE PIVOT · MONTH {report.narrativePivot.turn}</p>
          <h2>{report.narrativePivot.summary}</h2>
          <p className="score-label">Narrative weight {report.narrativePivot.score}</p>
          <ul className="echo-list">
            {report.narrativePivot.echoHints.length > 0
              ? report.narrativePivot.echoHints.map((echo) => <li key={echo}>{echo}</li>)
              : <li>No delayed echo was recovered from this decision.</li>}
          </ul>
        </section>

        <section className="report-section">
          <p className="file-label">STRATEGIC PIVOT · MONTH {report.strategicPivot.turn}</p>
          <h2>{report.strategicPivot.summary}</h2>
          <p className="score-label">Strategic weight {report.strategicPivot.score}</p>
        </section>

        <section className="report-section">
          <p className="file-label">FINAL TURNING POINT · MONTH {report.finalTurningPoint.turn}</p>
          <h2>{report.finalTurningPoint.summary}</h2>
          <p className="score-label">Final weight {report.finalTurningPoint.score}</p>
        </section>

        <section className="report-section classified-section">
          <p className="file-label">UNSEEN ROUTE</p>
          <h2>{report.unseenRouteHint.label}</h2>
          <p>{report.unseenRouteHint.message}</p>
        </section>

        <section className="experiment-panel">
          <p className="file-label">RECOMMENDED NEXT-RUN EXPERIMENT</p>
          <h2>{report.suggestedExperiment}</h2>
          <div className="report-actions">
            <button className="primary-button" disabled={guidedReplayRequired && recapRequired} onClick={onTestTheory}>Test This Theory</button>
            <button className="secondary-button" onClick={onOpenNewFile}>Open a New File</button>
          </div>
          <small>{guidedReplayRequired && recapRequired ? "Save the playtest recap before beginning the required replay sample. " : null}Test This Theory repeats the seed. Open a New File creates a fresh seed. Neither grants power.</small>
        </section>

        {playtestRun && onSaveRecap ? <PlaytestRecapForm key={playtestRun.runId} existing={playtestRun.recap} onSave={onSaveRecap} /> : null}
      </article>
    </main>
  );
}
