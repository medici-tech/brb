import { CORPORATION_MOVES } from "./content";
import { getCorporationPressure } from "./progression";
import { nextRandom } from "./rng";
import { addHistory, applyEffects, linkConsequence } from "./state-helpers";
import type {
  CorporationStrategy,
  Effects,
  GameState,
  MajorAction,
} from "./types";

const CORPORATION_STRATEGIES = Object.keys(
  CORPORATION_MOVES,
) as CorporationStrategy[];

function scaleAdverseAmount(
  amount: number,
  multiplier: number,
  adverse: "positive" | "negative",
): number {
  if (
    (adverse === "positive" && amount <= 0)
    || (adverse === "negative" && amount >= 0)
  ) {
    return amount;
  }
  const scaled = amount * multiplier;
  return scaled < 0 ? Math.floor(scaled) : Math.ceil(scaled);
}

function scaleCorporationEffects(effects: Effects, multiplier: number): Effects {
  if (multiplier === 1) return effects;
  const scaled: Effects = {};
  if (effects.resources) {
    scaled.resources = Object.fromEntries(
      Object.entries(effects.resources).map(([key, amount]) => [
        key,
        scaleAdverseAmount(amount, multiplier, "negative"),
      ]),
    );
  }
  if (effects.pressures) {
    scaled.pressures = Object.fromEntries(
      Object.entries(effects.pressures).map(([key, amount]) => [
        key,
        scaleAdverseAmount(amount, multiplier, "positive"),
      ]),
    );
  }
  if (effects.tracks) {
    scaled.tracks = Object.fromEntries(
      Object.entries(effects.tracks).map(([key, amount]) => [
        key,
        scaleAdverseAmount(amount, multiplier, "negative"),
      ]),
    );
  }
  if (effects.institutions !== undefined) {
    scaled.institutions = scaleAdverseAmount(
      effects.institutions,
      multiplier,
      "negative",
    );
  }
  if (effects.corporationProgress !== undefined) {
    scaled.corporationProgress = scaleAdverseAmount(
      effects.corporationProgress,
      multiplier,
      "positive",
    );
  }
  // Threat determines the multiplier, so its own increase is deliberately never amplified.
  if (effects.corporationThreat !== undefined) {
    scaled.corporationThreat = effects.corporationThreat;
  }
  if (effects.advisors) {
    scaled.advisors = Object.fromEntries(
      Object.entries(effects.advisors).map(([advisorId, changes]) => [
        advisorId,
        Object.fromEntries(
          Object.entries(changes).map(([key, amount]) => [
            key,
            typeof amount === "number"
              ? scaleAdverseAmount(
                  amount,
                  multiplier,
                  key === "leverage" ? "positive" : "negative",
                )
              : amount,
          ]),
        ),
      ]),
    );
  }
  return scaled;
}

export function applyCorporationMove(
  state: GameState,
  blocked: boolean,
  causedByDecisionId: string | null,
): void {
  const strategy = state.corporation.strategy;
  state.corporation.lastMove = strategy;
  state.corporation.lastResponseMonth = state.turn;
  if (blocked) {
    addHistory(
      state,
      "corporation",
      `${CORPORATION_MOVES[strategy].name} failed.`,
      causedByDecisionId ? { causedByDecisionId } : undefined,
    );
    linkConsequence(state, causedByDecisionId);
    return;
  }

  const pressure = getCorporationPressure(state);
  applyEffects(
    state,
    scaleCorporationEffects(
      CORPORATION_MOVES[strategy].effects,
      pressure.severityMultiplier,
    ),
  );
  addHistory(
    state,
    "corporation",
    CORPORATION_MOVES[strategy].description,
    causedByDecisionId ? { causedByDecisionId } : undefined,
  );
  linkConsequence(state, causedByDecisionId);
}

export function chooseCorporationStrategy(
  state: GameState,
  action: MajorAction,
): void {
  const scores: Record<CorporationStrategy, number> = {
    expanding: 5 + Math.max(0, 50 - state.corporation.progress) / 12,
    infiltrating: 4
      + state.tracks.access / 12
      + Math.max(0, 35 - state.resources.capacity) / 8,
    discrediting: 4
      + state.tracks.legitimacy / 14
      + Math.max(0, 40 - state.resources.trust) / 7,
    buying_influence: 4
      + Math.max(0, 40 - state.resources.influence) / 7
      + state.advisors.fixer.leverage / 25,
  };
  if (action.type === "deposit") {
    if (action.track === "engineering" || action.track === "access") {
      scores.infiltrating += 5;
    }
    if (action.track === "legitimacy") scores.discrediting += 5;
    if (action.track === "stability") scores.expanding += 5;
  }

  const ranked = CORPORATION_STRATEGIES.map((strategy, index) => {
    const random = nextRandom(state.rngState);
    state.rngState = random.state;
    return {
      strategy,
      index,
      score: scores[strategy] + random.value * 2,
    };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
  state.corporation.strategy = ranked[0]?.strategy ?? "expanding";
}
