import { ARCHETYPES, ENDING_COPY, ROUTE_DEFINITIONS, SITUATION_CARDS } from "../../game/content";
import { LEGACY_DIRECTIVES } from "../../game/directives";
import { NECESSARY_REGIME_AFTERMATH_PANIC } from "../../game/replay";
import {
  LEGACY_DIRECTIVE_IDS,
  type ArchiveV1,
  type EndingId,
  type RouteId,
} from "../../game/types";
import { CreditsDialog } from "./CreditsDialog";
import { PlayerRoomScene } from "./pixel-room/PlayerRoomScene";
import {
  ConsolePanel,
  DossierPanel,
  FileIndexCard,
  SectionHeading,
} from "./ui";

type Props = { archive: ArchiveV1; onBack: () => void; backLabel?: string };

function countLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function ArchiveView({ archive, onBack, backLabel = "Return" }: Props) {
  const totalEncounters = Object.values(archive.cards).reduce((sum, card) => sum + card.encounters, 0);
  const discoveredCards = Object.keys(archive.cards).length;
  const discoveredEndings = Object.keys(archive.endings).length;
  const discoveredRoutes = Object.values(archive.routes).filter((route) => route.highestStep > 0).length;
  return (
    <main className="shell">
      <header className="masthead">
        <div><p className="eyebrow">INTELLIGENCE ARCHIVE v1</p><strong>{archive.processedRunIds.length} files processed</strong></div>
        <div className="header-actions">
          <CreditsDialog />
          <button className="text-button" onClick={onBack}>{backLabel}</button>
        </div>
      </header>

      <div className="records-screen-grid">
        <DossierPanel
          eyebrow="KNOWLEDGE + LIMITED AUTHORITY"
          title="What has been witnessed cannot be unwitnessed."
          headingLevel="h1"
          summary={`${countLabel(totalEncounters, "card encounter")} recorded. Completed files also build Clearance (progress to next Directive unlock) toward optional, one-use campaign Directives.`}
        >
          <div
            className="grid gap-px border border-[color:var(--paper-line)] bg-[color:var(--paper-line)] sm:grid-cols-3"
            aria-label="Archive discovery progress"
          >
            {[
              [`${discoveredCards} / ${SITUATION_CARDS.length}`, "cards"],
              [`${discoveredRoutes} / ${Object.keys(ROUTE_DEFINITIONS).length}`, "routes"],
              [`${discoveredEndings} / ${Object.keys(ENDING_COPY).length}`, "endings"],
            ].map(([value, label]) => (
              <span className="brb-telemetry block bg-[color:var(--paper-200)] p-4 text-[10px] tracking-[0.08em] text-dossier-ink/75 uppercase" key={label}>
                <strong className="mb-1.5 block text-xl text-dossier-ink">{value}</strong>
                {label}
              </span>
            ))}
          </div>
        </DossierPanel>
        <aside className="player-room-scene" aria-label="Archive records office scene">
          <PlayerRoomScene
            variant="records"
            ariaLabel={`Archive records office. ${archive.processedRunIds.length} completed files fill the shelves and evidence boxes.`}
            evidenceLoad={Math.min(3, archive.processedRunIds.length)}
          />
        </aside>
      </div>

      <section className="mt-12" aria-labelledby="legacy-directives-title">
        <SectionHeading
          eyebrow={`LEGACY CLEARANCE · ${archive.clearance} / 3`}
          title="Preserved Directives"
          titleId="legacy-directives-title"
        />
        <p>
          Clearance is progress to next Directive unlock. Equip at most one when
          opening a file. An unlocked Directive can be used once in every campaign
          and is never consumed.
        </p>
        {archive.pendingScar === "necessary_regime_aftermath" ? (
          <p className="text-sm leading-6 text-muted-foreground" role="status">
            Aftermath pending: next campaign starts with Panic +{NECESSARY_REGIME_AFTERMATH_PANIC}
            from your last Necessary Regime.
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LEGACY_DIRECTIVE_IDS.map((id) => {
            const directive = LEGACY_DIRECTIVES[id];
            const unlocked = archive.unlockedDirectiveIds.includes(id);
            const doctrineName = directive.requiredArchetypeId
              ? ARCHETYPES[directive.requiredArchetypeId].name
              : null;
            return unlocked ? (
              <FileIndexCard
                fileId={`${directive.rarity} · unlocked${doctrineName ? ` · ${doctrineName} only` : ""}`}
                state="discovered"
                title={directive.title}
                metadata={directive.description}
                showStatus={false}
                key={id}
              >
                <strong className="text-sm text-foreground">{directive.benefit}</strong>
                <p className="mt-2 mb-0 text-xs leading-5 text-muted-foreground">Cost: {directive.warning}</p>
                {doctrineName ? (
                  <p className="mt-2 mb-0 text-xs leading-5 text-muted-foreground">
                    Equip only with the {doctrineName} doctrine.
                  </p>
                ) : null}
              </FileIndexCard>
            ) : (
              <FileIndexCard
                ariaLabel="Classified Legacy Directive"
                fileId={`${directive.rarity} · locked`}
                hiddenTitle="████████████"
                metadata="Earn Clearance to reveal this authorization."
                showStatus={false}
                state="classified"
                key={id}
              />
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading eyebrow="SITUATION DECK" title="Recovered cards" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SITUATION_CARDS.map((card, index) => {
            const record = archive.cards[card.id];
            return record ? (
              <FileIndexCard
                expandable
                fileId={`${card.type} · ${card.rarity}`}
                state="discovered"
                title={card.title}
                metadata={`${countLabel(record.encounters, "encounter")} · ${countLabel(Object.keys(record.choices).length, "choice")} witnessed`}
                showStatus={false}
                key={card.id}
              >
                <div className="grid gap-2">
                  <strong className="brb-telemetry text-[10px] tracking-[0.08em] text-muted-foreground uppercase">Witnessed outcomes</strong>
                  {Object.entries(record.choices).map(([choiceId, count]) => {
                    const label = card.choices.find((choice) => choice.id === choiceId)?.label
                      ?? (choiceId === "ignored"
                        ? "Ignored and escalated"
                        : choiceId === "suppressed"
                          ? "Contained by the Fixer"
                          : choiceId === "expired"
                            ? "Expired at activation"
                            : "Recorded outcome");
                    return (
                      <p className="m-0 flex justify-between gap-2.5 border-t border-border pt-2 text-[11px] text-foreground/80" key={choiceId}>
                        <span>{label}</span><b>{countLabel(count, "time")}</b>
                      </p>
                    );
                  })}
                </div>
              </FileIndexCard>
            ) : (
              <FileIndexCard
                ariaLabel="Classified card silhouette"
                fileId={`FILE ${String(index + 1).padStart(2, "0")}`}
                hiddenTitle="████████████"
                metadata="CLASSIFIED · NOT ENCOUNTERED"
                showStatus={false}
                state="classified"
                key={card.id}
              />
            );
          })}
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ConsolePanel>
          <p className="file-label">CHAIN INTELLIGENCE</p>
          {(Object.keys(ROUTE_DEFINITIONS) as RouteId[]).map((routeId) => {
            const route = archive.routes[routeId];
            return (
              <div className="flex flex-wrap justify-between gap-x-5 gap-y-2 border-b border-border py-4" key={routeId}>
                <strong>{route.highestStep > 0 ? ROUTE_DEFINITIONS[routeId].label : "████████ — CLASSIFIED"}</strong>
                <span className="text-muted-foreground">{route.completed ? "Completed" : route.highestStep > 0 ? `Partial · ${route.highestStep}/2` : "No recoverable evidence"}</span>
                {route.highestStep > 0 && !route.completed ? <small className="basis-full leading-5 text-muted-foreground">{ROUTE_DEFINITIONS[routeId].partialHint}</small> : null}
              </div>
            );
          })}
        </ConsolePanel>
        <ConsolePanel>
          <p className="file-label">KNOWN ENDINGS</p>
          {(Object.keys(ENDING_COPY) as EndingId[]).map((endingId) => (
            <div className="flex flex-wrap justify-between gap-x-5 gap-y-2 border-b border-border py-4" key={endingId}>
              <strong>{archive.endings[endingId] ? ENDING_COPY[endingId].title : "████████ — CLASSIFIED"}</strong>
              <span className="text-muted-foreground">{archive.endings[endingId] ? countLabel(archive.endings[endingId] ?? 0, "record") : "Not reached"}</span>
            </div>
          ))}
        </ConsolePanel>
      </div>
    </main>
  );
}
