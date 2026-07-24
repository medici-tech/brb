"use client";

import { useState, type FormEvent } from "react";
import type { PlaytestRecap } from "../../playtest/types";

type RecapInput = Omit<PlaytestRecap, "recordedAt">;

type Props = {
  existing: PlaytestRecap | null;
  onSave: (recap: RecapInput) => void;
};

const RATINGS = [1, 2, 3, 4, 5] as const;

export function PlaytestRecapForm({ existing, onSave }: Props) {
  const [fairness, setFairness] = useState<RecapInput["fairness"]>(existing?.fairness ?? 3);
  const [pacing, setPacing] = useState<RecapInput["pacing"]>(existing?.pacing ?? "about_right");
  const [lateGamePressure, setLateGamePressure] = useState<RecapInput["lateGamePressure"]>(existing?.lateGamePressure ?? "unclear");
  const [consequenceClarity, setConsequenceClarity] = useState<RecapInput["consequenceClarity"]>(existing?.consequenceClarity ?? 3);
  const [strategyViability, setStrategyViability] = useState<RecapInput["strategyViability"]>(existing?.strategyViability ?? 3);
  const [replayInterest, setReplayInterest] = useState<RecapInput["replayInterest"]>(existing?.replayInterest ?? 3);
  const [directiveUseMonth, setDirectiveUseMonth] = useState(
    existing?.directiveUseMonth?.toString() ?? "",
  );
  const [directiveTimingReason, setDirectiveTimingReason] = useState(existing?.directiveTimingReason ?? "");
  const [directiveDrawbackMeaning, setDirectiveDrawbackMeaning] = useState<RecapInput["directiveDrawbackMeaning"]>(existing?.directiveDrawbackMeaning ?? 3);
  const [ignoredOrderingClarity, setIgnoredOrderingClarity] = useState<RecapInput["ignoredOrderingClarity"]>(existing?.ignoredOrderingClarity ?? 3);
  const [nextExperiment, setNextExperiment] = useState(existing?.nextExperiment ?? "");

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSave({
      fairness,
      pacing,
      lateGamePressure,
      consequenceClarity,
      strategyViability,
      replayInterest,
      directiveUseMonth: directiveUseMonth === "" ? null : Number(directiveUseMonth),
      directiveTimingReason,
      directiveDrawbackMeaning,
      ignoredOrderingClarity,
      nextExperiment,
    });
  }

  function ratingField(
    label: string,
    value: 1 | 2 | 3 | 4 | 5,
    onChange: (value: 1 | 2 | 3 | 4 | 5) => void,
  ) {
    return (
      <label>
        {label}
        <select value={value} onChange={(event) => onChange(Number(event.target.value) as 1 | 2 | 3 | 4 | 5)}>
          {RATINGS.map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
        </select>
      </label>
    );
  }

  return (
    <section className="playtest-recap" aria-labelledby="playtest-recap-title">
      <p className="file-label">SOLO PLAYTEST RECAP</p>
      <h2 id="playtest-recap-title">Record the run before replaying.</h2>
      <p className="rating-guide">For 1–5 ratings, 1 means poor or unclear and 5 means excellent or completely clear.</p>
      <form className="playtest-form" onSubmit={submit}>
        {ratingField("Fairness", fairness, setFairness)}
        {ratingField("Consequence clarity", consequenceClarity, setConsequenceClarity)}
        {ratingField("Strategy viability", strategyViability, setStrategyViability)}
        {ratingField("Replay interest", replayInterest, setReplayInterest)}
        {ratingField("Directive drawback felt meaningful", directiveDrawbackMeaning, setDirectiveDrawbackMeaning)}
        {ratingField("Ignored-file ordering clarity", ignoredOrderingClarity, setIgnoredOrderingClarity)}
        <label>
          Pacing
          <select value={pacing} onChange={(event) => setPacing(event.target.value as RecapInput["pacing"])}>
            <option value="too_short">Too short</option>
            <option value="about_right">About right</option>
            <option value="too_long">Too long</option>
          </select>
        </label>
        <label>
          Directive use month
          <input
            min={1}
            inputMode="numeric"
            type="number"
            value={directiveUseMonth}
            onChange={(event) => setDirectiveUseMonth(event.target.value)}
            placeholder="Leave blank if held"
          />
        </label>
        <label className="full-field">
          Directive timing
          <textarea
            required
            rows={3}
            value={directiveTimingReason}
            onChange={(event) => setDirectiveTimingReason(event.target.value)}
            placeholder="Why did you spend it then, or why did you hold it?"
          />
        </label>
        <label>
          Late-game pressure
          <select value={lateGamePressure} onChange={(event) => setLateGamePressure(event.target.value as RecapInput["lateGamePressure"])}>
            <option value="gradual">Gradual</option>
            <option value="sudden">Sudden</option>
            <option value="unclear">Unclear</option>
          </select>
        </label>
        <label className="full-field">
          Next experiment
          <textarea rows={3} value={nextExperiment} onChange={(event) => setNextExperiment(event.target.value)} placeholder="What will you try differently next time?" />
        </label>
        <button className="primary-button full-field" type="submit">{existing ? "Update recap" : "Save recap"}</button>
      </form>
    </section>
  );
}
