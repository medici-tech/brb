import { expireActiveCard } from "./cards";
import { ENDING_COPY } from "./content";
import { buildDeclassifiedReport } from "./replay";
import { getRouteCompletionKind } from "./routes";
import { addHistory } from "./state-helpers";
import {
  TRACK_KEYS,
  type CivicLegacyEvaluation,
  type Ending,
  type EndingVariationId,
  type GameState,
} from "./types";

function endingVariation(state: GameState, ending: Ending): {
  variationId: EndingVariationId | null;
  variationTitle: string | null;
} {
  if (!ending.victory) return { variationId: null, variationTitle: null };
  if (
    state.archetypeId === "technocrat"
    && (
      state.endingContributors.includes("technocratic_opacity")
      || state.resources.trust < 30
    )
  ) {
    return {
      variationId: "perfect_machine_empty_state",
      variationTitle: "Perfect Machine, Empty State",
    };
  }
  if (
    state.archetypeId === "populist"
    && ["normal", "reconciled"].includes(
      getRouteCompletionKind(state.routes.labor_coalition) ?? "",
    )
  ) {
    return {
      variationId: "crowd_presses_button",
      variationTitle: "The Crowd Presses the Button",
    };
  }
  if (
    state.archetypeId === "operator"
    && (
      state.systemModifiers.includes("emergency_rule")
      || state.advisors.fixer.leverage >= 60
    )
  ) {
    return {
      variationId: "government_by_command",
      variationTitle: "Government by Command",
    };
  }
  return { variationId: null, variationTitle: null };
}

function makeEnding(id: Ending["id"], reason: string): Ending {
  return { ...ENDING_COPY[id], reason, variationId: null, variationTitle: null };
}

function endRun(state: GameState, ending: Ending): void {
  expireActiveCard(state);
  const variation = endingVariation(state, ending);
  ending.variationId = variation.variationId;
  ending.variationTitle = variation.variationTitle;
  state.ending = ending;
  state.phase = "ended";
  addHistory(
    state,
    "system",
    `${ending.variationTitle ?? ending.title}: ${ending.reason}`,
  );
  state.report = buildDeclassifiedReport(state);
}

export function evaluateCivicLegacy(state: GameState): CivicLegacyEvaluation {
  const highestLeverage = Math.max(
    ...Object.values(state.advisors).map((advisor) => advisor.leverage),
  );
  const laborCompletionKind = getRouteCompletionKind(
    state.routes.labor_coalition,
  );
  const civicHistory = laborCompletionKind === "normal"
    || laborCompletionKind === "reconciled"
    || state.endingContributors.includes("public_testimony");
  const observations: CivicLegacyEvaluation["observations"] = [
    {
      id: "all_tracks_50",
      label: "All BRB tracks reached 50",
      passed: TRACK_KEYS.every((track) => state.tracks[track] >= 50),
      actual: TRACK_KEYS.map((track) => `${track}:${state.tracks[track]}`).join(", "),
      target: "every track >= 50",
    },
    {
      id: "corporation_access_safe",
      label: "Corporation control remained below the capture threshold",
      passed: state.corporation.progress < 80 && state.tracks.access >= 50,
      actual: `Corporation ${state.corporation.progress}; Access ${state.tracks.access}`,
      target: "Corporation < 80 and Access >= 50",
    },
    {
      id: "legitimacy_75",
      label: "Legitimacy reached 75",
      passed: state.tracks.legitimacy >= 75,
      actual: state.tracks.legitimacy,
      target: ">= 75",
    },
    {
      id: "stability_75",
      label: "Stability reached 75",
      passed: state.tracks.stability >= 75,
      actual: state.tracks.stability,
      target: ">= 75",
    },
    {
      id: "institutions_55",
      label: "Institutions remained at 55",
      passed: state.institutions >= 55,
      actual: state.institutions,
      target: ">= 55",
    },
    {
      id: "panic_below_60",
      label: "Panic remained below 60",
      passed: state.pressures.panic < 60,
      actual: state.pressures.panic,
      target: "< 60",
    },
    {
      id: "leverage_below_65",
      label: "No advisor held decisive leverage",
      passed: highestLeverage < 65,
      actual: highestLeverage,
      target: "< 65",
    },
    {
      id: "no_emergency_rule",
      label: "Emergency rule was avoided",
      passed: !state.systemModifiers.includes("emergency_rule"),
      actual: state.systemModifiers.includes("emergency_rule"),
      target: "false",
    },
    {
      id: "civic_history",
      label: "A civic route or public testimony survived",
      passed: civicHistory,
      actual: civicHistory,
      target: "true",
    },
  ];
  return {
    eligible: observations.every((observation) => observation.passed),
    observations,
  };
}

export function activate(state: GameState): void {
  const civic = evaluateCivicLegacy(state);
  const accessSafe = civic.observations.find(
    (observation) => observation.id === "corporation_access_safe",
  )?.passed;
  if (!accessSafe) {
    endRun(
      state,
      makeEnding("corporate_capture", "The Corporation held the decisive access point."),
    );
    return;
  }
  if (civic.eligible) {
    endRun(
      state,
      makeEnding("civic_legacy", "The project remained under durable public control."),
    );
    return;
  }
  const failed = civic.observations
    .filter((observation) => !observation.passed)
    .map((observation) => {
      if (observation.id === "legitimacy_75") {
        return `Legitimacy was ${observation.actual} (needs 75)`;
      }
      if (observation.id === "stability_75") {
        return `Stability was ${observation.actual} (needs 75)`;
      }
      if (observation.id === "institutions_55") {
        return `Institutions were ${observation.actual} (needs 55)`;
      }
      if (observation.id === "panic_below_60") {
        return `Panic was ${observation.actual} (must stay below 60)`;
      }
      if (observation.id === "leverage_below_65") {
        return `highest advisor Leverage was ${observation.actual} (must stay below 65)`;
      }
      if (observation.id === "no_emergency_rule") {
        return "emergency rule remained active";
      }
      if (observation.id === "civic_history") {
        return "no civic route or public testimony survived";
      }
      return `${observation.label} failed (${String(observation.actual)}; ${observation.target})`;
    });
  endRun(
    state,
    makeEnding(
      "compromised_activation",
      `The BRB activated, but Civic Legacy remained out of reach: ${failed.join("; ")}.`,
    ),
  );
}

export function evaluateTerminalState(state: GameState): void {
  if (state.corporation.progress >= 100) {
    endRun(
      state,
      makeEnding("corporate_capture", "The Corporation completed its objective first."),
    );
  } else if (state.pressures.panic >= 100) {
    endRun(
      state,
      makeEnding("state_collapse", "Public Panic reached the breaking point."),
    );
  } else if (state.institutions <= 0) {
    endRun(
      state,
      makeEnding("state_collapse", "Institutions could no longer sustain the state."),
    );
  } else if (Object.values(state.advisors).every((advisor) => !advisor.active)) {
    endRun(
      state,
      makeEnding("state_collapse", "No advisor remained willing to operate the government."),
    );
  }
}
