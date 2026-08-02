"use client";

import { useState, type FormEvent } from "react";
import type { PlaytestRecap } from "../../playtest/types";
import { Button } from "../ui/button";

type RecapInput = Omit<PlaytestRecap, "recordedAt">;

type Props = {
  existing: PlaytestRecap | null;
  onSave: (recap: RecapInput) => void;
};

const RATINGS = [1, 2, 3, 4, 5] as const;
const fieldClassName = "grid gap-2 text-xs font-bold tracking-[0.04em] uppercase";
const controlClassName = "w-full rounded-none border border-current bg-transparent p-3 font-sans text-sm leading-5 font-normal normal-case [&>option]:bg-[color:var(--paper-200)] [&>option]:text-dossier-ink";

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
      <label className={fieldClassName}>
        {label}
        <select className={controlClassName} value={value} onChange={(event) => onChange(Number(event.target.value) as 1 | 2 | 3 | 4 | 5)}>
          {RATINGS.map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
        </select>
      </label>
    );
  }

  return (
    <section className="mt-10 border-2 border-dashed border-[color:#8d806c] bg-[rgba(72,60,43,.05)] p-7 text-dossier-ink" aria-labelledby="playtest-recap-title">
      <p className="brb-telemetry m-0 text-[10px] tracking-[0.14em] uppercase opacity-65">SOLO PLAYTEST RECAP</p>
      <h2 className="brb-display my-2 text-[clamp(1.625rem,4vw,2.5rem)] leading-none font-semibold" id="playtest-recap-title">Record the run before replaying.</h2>
      <p className="col-span-full m-0 border-l-3 border-[color:#77766d] bg-[rgba(87,73,49,.06)] px-3 py-2.5 text-xs leading-5 text-dossier-ink/75">For 1–5 ratings, 1 means poor or unclear and 5 means excellent or completely clear.</p>
      <form className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2" onSubmit={submit}>
        {ratingField("Fairness", fairness, setFairness)}
        {ratingField("Consequence clarity", consequenceClarity, setConsequenceClarity)}
        {ratingField("Strategy viability", strategyViability, setStrategyViability)}
        {ratingField("Replay interest", replayInterest, setReplayInterest)}
        {ratingField("Directive drawback felt meaningful", directiveDrawbackMeaning, setDirectiveDrawbackMeaning)}
        {ratingField("Ignored-file ordering clarity", ignoredOrderingClarity, setIgnoredOrderingClarity)}
        <label className={fieldClassName}>
          Pacing
          <select className={controlClassName} value={pacing} onChange={(event) => setPacing(event.target.value as RecapInput["pacing"])}>
            <option value="too_short">Too short</option>
            <option value="about_right">About right</option>
            <option value="too_long">Too long</option>
          </select>
        </label>
        <label className={fieldClassName}>
          Directive use month
          <input
            className={controlClassName}
            min={1}
            inputMode="numeric"
            type="number"
            value={directiveUseMonth}
            onChange={(event) => setDirectiveUseMonth(event.target.value)}
            placeholder="Leave blank if held"
          />
        </label>
        <label className={`${fieldClassName} sm:col-span-2`}>
          Directive timing
          <textarea
            className={`${controlClassName} resize-y`}
            required
            rows={3}
            value={directiveTimingReason}
            onChange={(event) => setDirectiveTimingReason(event.target.value)}
            placeholder="Why did you spend it then, or why did you hold it?"
          />
        </label>
        <label className={fieldClassName}>
          Late-game pressure
          <select className={controlClassName} value={lateGamePressure} onChange={(event) => setLateGamePressure(event.target.value as RecapInput["lateGamePressure"])}>
            <option value="gradual">Gradual</option>
            <option value="sudden">Sudden</option>
            <option value="unclear">Unclear</option>
          </select>
        </label>
        <label className={`${fieldClassName} sm:col-span-2`}>
          Next experiment
          <textarea className={`${controlClassName} resize-y`} rows={3} value={nextExperiment} onChange={(event) => setNextExperiment(event.target.value)} placeholder="What will you try differently next time?" />
        </label>
        <Button className="min-h-11 sm:col-span-2" variant="command" type="submit">{existing ? "Update recap" : "Save recap"}</Button>
      </form>
    </section>
  );
}
