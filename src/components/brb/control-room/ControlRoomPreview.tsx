"use client";

import { useState } from "react";
import { ControlRoomPresentation } from "./ControlRoomPresentation";
import workspaceStyles from "./SituationWorkspace.module.css";
import styles from "./ControlRoomPreview.module.css";
import { resolvePresentationModel } from "./presentationStateResolver";
import {
  getPresentationFixture,
  listPresentationFixtures,
  type PresentationFixtureId,
} from "./presentationFixtures";

const FIXTURES = listPresentationFixtures();
const DEFAULT_FIXTURE_ID: PresentationFixtureId = "calm-early";

export function ControlRoomPreview() {
  const [fixtureId, setFixtureId] =
    useState<PresentationFixtureId>(DEFAULT_FIXTURE_ID);
  const [reducedMotion, setReducedMotion] = useState(true);

  const fixture = getPresentationFixture(fixtureId);
  const model = resolvePresentationModel(fixture.inputs);
  const marks = model.persistentRoomMarks;

  return (
    <main className={`brb-design-system ${styles.previewShell}`}>
      <header className={styles.previewHeader}>
        <div>
          <p className="file-label">DEVELOPMENT FIXTURE · PRESENTATION ONLY</p>
          <h1>Living Control Room</h1>
        </div>
        <p>
          Named reachable looks only — each fixture is{" "}
          <code>PresentationInputs</code> run through{" "}
          <code>resolvePresentationModel</code>. No free-form mixer. Unavailable
          in production.
        </p>
      </header>

      <section
        aria-label="Control room preview controls"
        className={styles.previewControls}
      >
        <label>
          Fixture
          <select
            aria-label="Presentation fixture"
            value={fixtureId}
            onChange={(event) => {
              setFixtureId(event.target.value as PresentationFixtureId);
            }}
          >
            {FIXTURES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.previewToggle}>
          Reduced motion
          <input
            aria-label="Reduced motion"
            checked={reducedMotion}
            type="checkbox"
            onChange={(event) => setReducedMotion(event.target.checked)}
          />
        </label>

        <p className={styles.previewSummary}>{fixture.summary}</p>
      </section>

      <section className={styles.previewStage}>
        <div className={styles.previewRoom}>
          <ControlRoomPresentation
            model={model}
            turn={fixture.inputs.turn}
            hasActiveSituation={fixture.hasActiveSituation}
            reducedMotionOverride={reducedMotion}
          />
        </div>

        <aside
          aria-label="Resolved presentation contract"
          className={styles.previewReadout}
        >
          <p className="file-label">RESOLVED CONTRACT</p>
          <h2>{fixture.label}</h2>
          <dl className={styles.previewContract}>
            <div>
              <dt>state</dt>
              <dd>{model.state}</dd>
            </div>
            <div>
              <dt>lighting</dt>
              <dd>{model.lighting}</dd>
            </div>
            <div>
              <dt>shot</dt>
              <dd>{model.shot}</dd>
            </div>
            <div>
              <dt>tempo</dt>
              <dd>{model.tempo}</dd>
            </div>
            <div>
              <dt>staff</dt>
              <dd>{model.staffLayout.mode}</dd>
            </div>
            <div>
              <dt>paper</dt>
              <dd>{model.paperLoad}</dd>
            </div>
            <div>
              <dt>brb stage</dt>
              <dd>{model.brbStage}</dd>
            </div>
            <div>
              <dt>lit station</dt>
              <dd>{model.litStation ?? "none"}</dd>
            </div>
            <div>
              <dt>focus</dt>
              <dd>{model.focus}</dd>
            </div>
            <div>
              <dt>authority</dt>
              <dd>
                {model.authority.mode}
                {model.authority.holders.length > 0
                  ? ` · ${model.authority.holders.join(", ")}`
                  : ""}
              </dd>
            </div>
            <div>
              <dt>structure</dt>
              <dd>{marks?.institutionalCondition ?? "secure"}</dd>
            </div>
            <div>
              <dt>corporation</dt>
              <dd>{marks?.corporationPresence ?? "distant"}</dd>
            </div>
          </dl>

          <p className={styles.previewDataAttrs}>
            Expected{" "}
            <code>data-presentation-state=&quot;{model.state}&quot;</code>
            {" · "}
            <code>data-shot=&quot;{model.shot}&quot;</code>
            {" · "}
            <code>data-tempo=&quot;{model.tempo}&quot;</code>
            {" · "}
            <code>data-brb-stage=&quot;{model.brbStage}&quot;</code>
            {" · "}
            <code>data-paper-load=&quot;{model.paperLoad}&quot;</code>
            {" · "}
            <code>data-staff-mode=&quot;{model.staffLayout.mode}&quot;</code>
            {" · "}
            <code>
              data-lit-station=&quot;{model.litStation ?? "none"}&quot;
            </code>
            {" · "}
            <code>
              data-active-situation=&quot;
              {fixture.hasActiveSituation ? "true" : "false"}
              &quot;
            </code>
          </p>

          {fixture.notes ? (
            <p className={styles.previewNotes}>{fixture.notes}</p>
          ) : null}

          {fixture.hasActiveSituation ? (
            <article className={`paper-panel ${styles.previewFile}`}>
              <p className="file-label">SITUATION DECK · PREVIEW FILE</p>
              <h3>The Continuity Memorandum</h3>
              <p>
                Placeholder Situation framing: decision text stays dominant while
                the room is a subdued frame.
              </p>
            </article>
          ) : (
            <div
              className={`${workspaceStyles.noActiveFile} ${styles.previewStandby}`}
            >
              <p className="file-label">SITUATION DECK · STANDBY</p>
              <h3>No active file</h3>
              <p>
                The desk is quiet. Choose where to commit the administration.
              </p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
