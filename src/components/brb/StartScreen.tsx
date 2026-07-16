import { ARCHETYPES } from "../../game/content";
import { formatCampaignTime } from "../../game/progression";
import type { ArchetypeId, GameState, ReplayIntent } from "../../game/types";

type Props = {
  savedRun: GameState | null;
  replayIntent: ReplayIntent | null;
  onStart: (archetypeId: ArchetypeId) => void;
  onResume: () => void;
  onOpenArchive: () => void;
};

export function StartScreen({ savedRun, replayIntent, onStart, onResume, onOpenArchive }: Props) {
  return (
    <main className="shell start-shell">
      <header className="masthead">
        <p className="eyebrow">Federal Continuity Directorate · File BRB-01</p>
        <button className="text-button" onClick={onOpenArchive}>Intelligence Archive</button>
      </header>

      <section className="hero paper-panel">
        <div className="stamp">TOP SECRET</div>
        <p className="file-label">OPERATIONAL BRIEF</p>
        <h1>Build the machine.<br />Decide what it costs.</h1>
        <p className="hero-copy">
          Every run builds a unique classified political history. Finish feeling you uncovered one
          version of the truth—not the entire game.
        </p>
        {replayIntent ? (
          <aside className="objective">
            <span>COUNTERFACTUAL OBJECTIVE</span>
            {replayIntent.experiment}
          </aside>
        ) : null}
        {savedRun ? (
          <button className="primary-button resume-button" onClick={onResume}>
            Resume file · {formatCampaignTime(savedRun.turn)}
          </button>
        ) : null}
      </section>

      <section aria-labelledby="choose-director" className="archetype-section">
        <div className="section-heading">
          <p className="file-label">SELECT OPERATING DOCTRINE</p>
          <h2 id="choose-director">Who are you when the pressure starts?</h2>
        </div>
        <div className="archetype-grid">
          {(Object.keys(ARCHETYPES) as ArchetypeId[]).map((id) => {
            const archetype = ARCHETYPES[id];
            return (
              <article className="archetype-card" key={id}>
                <span className="card-index">0{Object.keys(ARCHETYPES).indexOf(id) + 1}</span>
                <h3>{archetype.name}</h3>
                <p>{archetype.description}</p>
                <dl>
                  <div><dt>Bias</dt><dd>{archetype.favoredCardType} files</dd></div>
                  <div><dt>Liability</dt><dd>{archetype.liability}</dd></div>
                </dl>
                <button className="primary-button" onClick={() => onStart(id)}>
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
