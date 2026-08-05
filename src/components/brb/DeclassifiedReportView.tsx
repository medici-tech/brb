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
import { Button } from "../ui/button";
import { CreditsDialog } from "./CreditsDialog";
import { HowToPlayDialog } from "./HowToPlayDialog";
import { PlaytestMarkerBar } from "./PlaytestMarkerBar";
import { PlayerRoomScene } from "./pixel-room/PlayerRoomScene";
import {
  DossierPanel,
  ReportMetadata,
  ReportOutcomeSummary,
  ReportSection,
  ReportStat,
  ReportStatGrid,
} from "./ui";

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
  onMark?: (note: string) => void;
};

export function DeclassifiedReportView({
  report,
  archive,
  onClaimDirective,
  onTestTheory,
  onOpenNewFile,
  onArchive,
  onOpenPlaytest,
  onMark,
}: Props) {
  const resultLabel = report.ending.victory ? "VICTORY" : "LOSS";
  const legacyReport = report.rulesVersion < REPORT_RULES_VERSION;
  return (
    <main className="shell report-shell">
      <header className="masthead">
        <p className="eyebrow">Declassification Authority · {report.runId}</p>
        <div className="header-actions">
          <HowToPlayDialog />
          <CreditsDialog />
          {onMark ? <PlaytestMarkerBar onSave={onMark} momentLabel="the Declassified Report" /> : null}
          {onOpenPlaytest ? <button className="text-button internal-tool-button" type="button" onClick={onOpenPlaytest}>Playtest Journal</button> : null}
          <button className="text-button" type="button" onClick={onArchive}>Intelligence Archive</button>
        </div>
      </header>
      <div className="records-screen-grid">
        <DossierPanel
          eyebrow="CAMPAIGN OUTCOME"
          title={report.ending.variationTitle ?? report.ending.title}
          headingLevel="h1"
          summary={report.ending.description}
          classification="DECLASSIFIED"
          className="overflow-visible"
        >
        {report.ending.variationTitle ? <p className="font-semibold text-destructive">Official classification: {report.ending.title}</p> : null}

        {legacyReport ? (
          <aside className="mt-6 border-2 border-destructive bg-destructive/10 p-5 text-[#55211e]" role="status">
            <p className="file-label">OLDER RULES BUILD</p>
            <h2 className="brb-display my-2 text-3xl leading-none font-semibold">This report is preserved as historical playtest evidence.</h2>
            <p className="m-0 leading-6">
              Its recorded ending may not match the current rules. Stress no longer
              causes State Collapse; replaying this seed uses the current rules and may
              produce a different campaign.
            </p>
          </aside>
        ) : null}

        <ReportOutcomeSummary
          result={(
            <p className={`brb-telemetry m-0 inline-block px-2.5 py-1.5 text-[11px] font-bold tracking-[0.12em] ${report.ending.victory ? "bg-phosphor text-dossier-ink" : "bg-destructive text-white"}`}>
              RESULT · {resultLabel}
            </p>
          )}
          reasonTitle={legacyReport ? "Recorded reason in that build" : "Why this run ended"}
          reason={report.ending.reason}
          rule={OUTCOME_RULES[report.ending.id]}
          nextTitle="Try this instead"
          nextStep={report.suggestedExperiment}
        />

        {archive ? (
          <ReportSection
            eyebrow={`LEGACY CLEARANCE · ${archive.clearance} / 3`}
            titleId="directive-reward-title"
            title={archive.pendingDirectiveDraft
              ? "Choose one authorization to preserve."
              : archive.unlockedDirectiveIds.length === Object.keys(LEGACY_DIRECTIVES).length
                ? "Every Legacy Directive has been recovered."
                : "Clearance is accumulating."}
          >
            {archive.pendingDirectiveDraft ? (
              <>
                <p>
                  This seeded draft is fixed for the completed campaign. Choose one
                  permanent unlock; the card will remain available for later files.
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {archive.pendingDirectiveDraft.candidateIds.map((id) => {
                    const directive = LEGACY_DIRECTIVES[id];
                    return (
                      <article className="grid gap-2.5 border-l-4 border-[color:var(--paper-line)] py-1 pl-4" key={id}>
                        <span className="brb-telemetry text-[9px] font-bold tracking-[0.1em] uppercase">{directive.rarity}</span>
                        <h3 className="brb-display m-0 text-2xl leading-none font-semibold">{directive.title}</h3>
                        <p className="m-0">{directive.description}</p>
                        <strong>{directive.benefit}</strong>
                        <small className="text-destructive">Cost: {directive.warning}</small>
                        <Button
                          className="h-auto min-h-10 whitespace-normal px-2 text-center leading-4"
                          variant="command"
                          type="button"
                          onClick={() => onClaimDirective?.(id)}
                        >
                          Preserve {directive.title}
                        </Button>
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
          </ReportSection>
        ) : null}

        {report.finalSnapshot ? (
          <section className="mt-9 border border-[color:var(--paper-line)] bg-white/20 p-5 sm:p-7" aria-labelledby="final-state-title">
            <p className="file-label">FINAL STATE · WHAT THE CAMPAIGN LEFT BEHIND</p>
            <h2 className="brb-display mt-2 mb-5 text-[clamp(1.625rem,4vw,2.5rem)] leading-none font-semibold" id="final-state-title">The ending in numbers</h2>
            <ReportStatGrid>
              <ReportStat label="Stress" value={`${report.finalSnapshot.pressures.stress} / 100`} helper="Drains Trust at 80; never directly ends the run." />
              <ReportStat label="Panic" value={`${report.finalSnapshot.pressures.panic} / 100`} helper="State Collapse at 100." />
              <ReportStat label="Institutions" value={`${report.finalSnapshot.institutions} / 100`} helper="State Collapse at 0." />
              <ReportStat label="Corporation Progress" value={`${report.finalSnapshot.corporation.progress} / 100`} helper="Corporate Capture at 100; unsafe activation at 80+." />
            </ReportStatGrid>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div>
                <h3 className="m-0 text-base">BRB readiness</h3>
                {TRACK_KEYS.map((track) => (
                  <p className="my-1.5 flex justify-between gap-3 text-xs leading-5 text-dossier-ink/75" key={track}><span>{TRACK_LABELS[track]}</span><strong>{report.finalSnapshot?.tracks[track]} / 50</strong></p>
                ))}
              </div>
              <div>
                <h3 className="m-0 text-base">Remaining reserves</h3>
                {RESOURCE_KEYS.map((resource) => (
                  <p className="my-1.5 flex justify-between gap-3 text-xs leading-5 text-dossier-ink/75" key={resource}><span>{RESOURCE_LABELS[resource]}</span><strong>{report.finalSnapshot?.resources[resource]}</strong></p>
                ))}
              </div>
              <div>
                <h3 className="m-0 text-base">Advisor position</h3>
                {ADVISOR_IDS.map((advisorId) => {
                  const advisor = report.finalSnapshot?.advisors[advisorId];
                  return (
                    <p className="my-1.5 flex justify-between gap-3 text-xs leading-5 text-dossier-ink/75" key={advisorId}>
                      <span>{ADVISORS[advisorId].name}</span>
                      <strong>{advisor?.active ? `Loyalty ${advisor.loyalty} · Leverage ${advisor.leverage}` : "Departed"}</strong>
                    </p>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        <ReportMetadata
          items={[
            { label: "Doctrine", value: ARCHETYPES[report.archetypeId].name },
            {
              label: "Legacy Directive",
              value: report.legacyDirective.equippedId
                ? `${LEGACY_DIRECTIVES[report.legacyDirective.equippedId].title} · ${report.legacyDirective.used ? "used" : "held"}`
                : "None equipped",
            },
            { label: "Story route completed", value: report.completedRoute ? ROUTE_DEFINITIONS[report.completedRoute].label : "None this run" },
            { label: "Replay code (seed)", value: report.seed },
          ]}
        />

        <aside className="mb-1 border-l-4 border-[#6f756a] bg-[rgba(87,73,49,.07)] px-5 py-4">
          <p className="file-label">HOW TO READ THE REST OF THIS REPORT</p>
          <p className="mb-0 max-w-3xl leading-6 text-dossier-ink/75">
            The three choices below are not a grade or a list of mistakes. They are
            the decisions that most strongly shaped your story, strategy, and final
            stretch.
          </p>
        </aside>

        <ReportSection eyebrow={`STORY-DEFINING CHOICE · MONTH ${report.narrativePivot.turn}`} title={report.narrativePivot.summary}>
          <p>
            This choice created the strongest delayed story consequences in this run.
          </p>
          <ul className="pl-5 leading-7">
            {report.narrativePivot.echoHints.length > 0
              ? report.narrativePivot.echoHints.map((echo) => <li key={echo}>{echo}</li>)
              : <li>No delayed echo was recovered from this decision.</li>}
          </ul>
        </ReportSection>

        <ReportSection eyebrow={`MOST CONSEQUENTIAL COMMITMENT · MONTH ${report.strategicPivot.turn}`} title={report.strategicPivot.summary}>
          <p>
            This commitment changed your resources, permanent progress, political
            pressure, or available routes more than any other.
          </p>
        </ReportSection>

        <ReportSection eyebrow={`FINAL-STRETCH TURNING POINT · MONTH ${report.finalTurningPoint.turn}`} title={report.finalTurningPoint.summary}>
          <p>
            This was the most consequential decision during the campaign’s final five
            months.
          </p>
        </ReportSection>

        <ReportSection className="bg-[rgba(87,73,49,.07)] px-6" eyebrow="A PATH LEFT UNFINISHED" title={report.unseenRouteHint.label}>
          <p>{report.unseenRouteHint.message}</p>
          <small className="mt-4 block">This is a replay hint, not a requirement or a failed objective.</small>
        </ReportSection>

        <section className="mt-11 border-2 border-destructive p-5 sm:p-7">
          <p className="file-label">CHOOSE YOUR NEXT FILE</p>
          <h2 className="brb-display my-2.5 max-w-3xl text-[clamp(1.625rem,4vw,2.625rem)] leading-none font-semibold">Replay this exact situation, or begin somewhere new.</h2>
          <p className="max-w-3xl font-semibold leading-6 text-dossier-ink/80">
            Recommended experiment: {report.suggestedExperiment}
          </p>
          <div className="my-6 flex flex-col gap-2.5 sm:flex-row">
            <Button variant="command" onClick={onTestTheory}>Test This Theory</Button>
            <Button variant="outline" onClick={onOpenNewFile}>Open a New File</Button>
          </div>
          <small className="text-dossier-ink/65">Test This Theory repeats the seed and equipped Directive under current rules. Open a New File creates a fresh seed with the same loadout.</small>
        </section>

        </DossierPanel>
        <aside className="player-room-scene" aria-label="Completed-run records office scene">
          <PlayerRoomScene
            variant="records"
            ariaLabel="Records office. The completed campaign evidence is boxed and under review."
            evidenceLoad={report.finalSnapshot ? 3 : 2}
          />
        </aside>
      </div>
    </main>
  );
}
