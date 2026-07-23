import { ENDING_COPY, ROUTE_DEFINITIONS, SITUATION_CARDS } from "../../game/content";
import { LEGACY_DIRECTIVES } from "../../game/directives";
import {
  LEGACY_DIRECTIVE_IDS,
  type ArchiveV1,
  type EndingId,
  type RouteId,
} from "../../game/types";

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
    <main className="shell archive-shell">
      <header className="masthead">
        <div><p className="eyebrow">INTELLIGENCE ARCHIVE v1</p><strong>{archive.processedRunIds.length} files processed</strong></div>
        <button className="text-button" onClick={onBack}>{backLabel}</button>
      </header>

      <section className="archive-intro paper-panel">
        <p className="file-label">KNOWLEDGE + LIMITED AUTHORITY</p>
        <h1>What has been witnessed cannot be unwitnessed.</h1>
        <p>{countLabel(totalEncounters, "card encounter")} recorded. Completed files also build Clearance toward optional, one-use campaign Directives.</p>
        <div className="archive-progress" aria-label="Archive discovery progress">
          <span><strong>{discoveredCards} / {SITUATION_CARDS.length}</strong> cards</span>
          <span><strong>{discoveredRoutes} / {Object.keys(ROUTE_DEFINITIONS).length}</strong> routes</span>
          <span><strong>{discoveredEndings} / {Object.keys(ENDING_COPY).length}</strong> endings</span>
        </div>
      </section>

      <section className="archive-section" aria-labelledby="legacy-directives-title">
        <div className="section-heading">
          <p className="file-label">LEGACY CLEARANCE · {archive.clearance} / 3</p>
          <h2 id="legacy-directives-title">Preserved Directives</h2>
        </div>
        <p>
          Equip at most one when opening a file. An unlocked Directive can be used
          once in every campaign and is never consumed.
        </p>
        <div className="archive-card-grid directive-collection">
          {LEGACY_DIRECTIVE_IDS.map((id) => {
            const directive = LEGACY_DIRECTIVES[id];
            const unlocked = archive.unlockedDirectiveIds.includes(id);
            return unlocked ? (
              <article className="archive-card discovered" key={id}>
                <span>{directive.rarity} · unlocked</span>
                <h3>{directive.title}</h3>
                <p>{directive.description}</p>
                <strong>{directive.benefit}</strong>
                <p>Cost: {directive.warning}</p>
              </article>
            ) : (
              <article
                aria-label="Classified Legacy Directive"
                className="archive-card silhouette"
                key={id}
              >
                <span>{directive.rarity} · locked</span>
                <h3>████████████</h3>
                <p>Earn Clearance to reveal this authorization.</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="archive-section">
        <div className="section-heading"><p className="file-label">SITUATION DECK</p><h2>Recovered cards</h2></div>
        <div className="archive-card-grid">
          {SITUATION_CARDS.map((card, index) => {
            const record = archive.cards[card.id];
            return record ? (
              <details className="archive-card discovered" key={card.id}>
                <summary>
                  <span>{card.type} · {card.rarity}</span><h3>{card.title}</h3>
                  <p>{countLabel(record.encounters, "encounter")} · {countLabel(Object.keys(record.choices).length, "choice")} witnessed</p>
                </summary>
                <div className="archive-choice-records">
                  <strong>Witnessed outcomes</strong>
                  {Object.entries(record.choices).map(([choiceId, count]) => {
                    const label = card.choices.find((choice) => choice.id === choiceId)?.label
                      ?? (choiceId === "ignored"
                        ? "Ignored and escalated"
                        : choiceId === "suppressed"
                          ? "Contained by the Fixer"
                          : choiceId === "expired"
                            ? "Expired at activation"
                            : "Recorded outcome");
                    return <p key={choiceId}><span>{label}</span><b>{countLabel(count, "time")}</b></p>;
                  })}
                </div>
              </details>
            ) : (
              <article aria-label="Classified card silhouette" className="archive-card silhouette" key={card.id}>
                <span>FILE {String(index + 1).padStart(2, "0")}</span><h3>████████████</h3><p>CLASSIFIED · NOT ENCOUNTERED</p>
              </article>
            );
          })}
        </div>
      </section>

      <div className="archive-lower-grid">
        <section className="dark-panel">
          <p className="file-label">CHAIN INTELLIGENCE</p>
          {(Object.keys(ROUTE_DEFINITIONS) as RouteId[]).map((routeId) => {
            const route = archive.routes[routeId];
            return (
              <div className="route-record" key={routeId}>
                <strong>{route.highestStep > 0 ? ROUTE_DEFINITIONS[routeId].label : "████████ — CLASSIFIED"}</strong>
                <span>{route.completed ? "Completed" : route.highestStep > 0 ? `Partial · ${route.highestStep}/2` : "No recoverable evidence"}</span>
                {route.highestStep > 0 && !route.completed ? <small>{ROUTE_DEFINITIONS[routeId].partialHint}</small> : null}
              </div>
            );
          })}
        </section>
        <section className="dark-panel">
          <p className="file-label">KNOWN ENDINGS</p>
          {(Object.keys(ENDING_COPY) as EndingId[]).map((endingId) => (
            <div className="route-record" key={endingId}>
              <strong>{archive.endings[endingId] ? ENDING_COPY[endingId].title : "████████ — CLASSIFIED"}</strong>
              <span>{archive.endings[endingId] ? countLabel(archive.endings[endingId] ?? 0, "record") : "Not reached"}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
