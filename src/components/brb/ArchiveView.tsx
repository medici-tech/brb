import { ENDING_COPY, ROUTE_DEFINITIONS, SITUATION_CARDS } from "../../game/content";
import type { ArchiveV0, EndingId, RouteId } from "../../game/types";

type Props = { archive: ArchiveV0; onBack: () => void };

export function ArchiveView({ archive, onBack }: Props) {
  const totalEncounters = Object.values(archive.cards).reduce((sum, card) => sum + card.encounters, 0);
  return (
    <main className="shell archive-shell">
      <header className="masthead">
        <div><p className="eyebrow">INTELLIGENCE ARCHIVE v0</p><strong>{archive.processedRunIds.length} files processed</strong></div>
        <button className="text-button" onClick={onBack}>Return to active file</button>
      </header>

      <section className="archive-intro paper-panel">
        <p className="file-label">KNOWLEDGE-ONLY PERSISTENCE</p>
        <h1>What has been witnessed cannot be unwitnessed.</h1>
        <p>{totalEncounters} card encounters recorded. The Archive changes what you know, never what you start with.</p>
      </section>

      <section className="archive-section">
        <div className="section-heading"><p className="file-label">SITUATION DECK</p><h2>Recovered cards</h2></div>
        <div className="archive-card-grid">
          {SITUATION_CARDS.map((card, index) => {
            const record = archive.cards[card.id];
            return record ? (
              <article className="archive-card discovered" key={card.id}>
                <span>{card.type} · {card.rarity}</span><h3>{card.title}</h3>
                <p>{record.encounters} encounters · {Object.keys(record.choices).length} choices witnessed</p>
              </article>
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
              </div>
            );
          })}
        </section>
        <section className="dark-panel">
          <p className="file-label">KNOWN ENDINGS</p>
          {(Object.keys(ENDING_COPY) as EndingId[]).map((endingId) => (
            <div className="route-record" key={endingId}>
              <strong>{archive.endings[endingId] ? ENDING_COPY[endingId].title : "████████ — CLASSIFIED"}</strong>
              <span>{archive.endings[endingId] ? `${archive.endings[endingId]} recorded` : "Not reached"}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
