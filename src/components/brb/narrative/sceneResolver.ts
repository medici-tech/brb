import { getBrbCompletionPercent } from "@/game/progression";
import type { DecisionRecord, GameState, TrackKey } from "@/game/types";
import type {
  NarrativeSceneCue,
  NarrativeSceneScript,
  PersistentRoomMarks,
} from "./sceneTypes";

export type NarrativeSceneRegistry = Readonly<Record<string, NarrativeSceneScript>>;

const TRACK_LABELS: Record<TrackKey, string> = {
  engineering: "engineering",
  access: "access",
  legitimacy: "legitimacy",
  stability: "stability",
};

export function getDecisionSceneKey(decision: Readonly<DecisionRecord>): string {
  if (decision.cardId && decision.choiceId) {
    return `card:${decision.cardId}:${decision.choiceId}`;
  }

  if (decision.category === "deposit") {
    const match = /^(Large|Standard) (engineering|access|legitimacy|stability) deposit/.exec(
      decision.summary,
    );
    if (match) {
      return `action:deposit:${match[2]}:${match[1]?.toLowerCase()}`;
    }
  }

  if (decision.category === "counter") {
    const strategy = /(expanding|infiltrating|discrediting|buying influence)/.exec(
      decision.summary,
    )?.[1]?.replace(" ", "_");
    const outcome = decision.summary.includes("was countered") ? "correct" : "wrong";
    return strategy
      ? `action:counter:${strategy}:${outcome}`
      : `action:counter:unknown:${outcome}`;
  }

  if (decision.category === "advisor") {
    if (decision.summary.includes("converted public Trust")) {
      return "consult:steward";
    }
    if (decision.summary.includes("authority to contain")) {
      return "consult:fixer";
    }
    const advisor = decision.summary.startsWith("The Analyst")
      ? "analyst"
      : decision.summary.startsWith("The Fixer")
        ? "fixer"
        : decision.summary.startsWith("The Steward")
          ? "steward"
          : "advisor";
    return `action:advisor:${advisor}`;
  }

  if (decision.category === "recover") {
    const resource = /^(money|influence|intelligence|capacity|trust) was recovered/.exec(
      decision.summary,
    )?.[1];
    return `action:recover:${resource ?? "resource"}`;
  }

  return `action:${decision.category}`;
}

export function derivePersistentRoomMarks(
  state: Readonly<GameState>,
): PersistentRoomMarks {
  const completion = getBrbCompletionPercent(state);
  const departedAdvisors = (["analyst", "fixer", "steward"] as const).filter(
    (advisorId) => !state.advisors[advisorId].active,
  );
  const completedRouteCount = Object.values(state.routes).filter(
    (route) => route.status === "completed",
  ).length;

  return {
    emergencyLevel:
      state.pressures.stress >= 80 || state.pressures.panic >= 75
        ? "critical"
        : state.pressures.stress >= 50 || state.pressures.panic >= 50
          ? "strained"
          : "routine",
    institutionalCondition:
      state.institutions <= 20
        ? "breached"
        : state.institutions <= 50
          ? "worn"
          : "secure",
    corporationPresence:
      state.corporation.progress >= 60 || state.corporation.threat >= 75
        ? "embedded"
        : state.corporation.progress >= 40 || state.corporation.threat >= 50
          ? "visible"
          : "distant",
    brbConstruction:
      completion >= 100
        ? "ready"
        : completion >= 75
          ? "unstable"
          : completion >= 50
            ? "active"
            : completion >= 25
              ? "framed"
              : "sealed",
    departedAdvisors,
    completedRouteCount,
  };
}

export function resolveNarrativeSceneCue(
  state: Readonly<GameState>,
  registry: NarrativeSceneRegistry,
): NarrativeSceneCue | null {
  return resolveNarrativeSceneCues(state, registry).at(-1) ?? null;
}

export function resolveNarrativeSceneCues(
  state: Readonly<GameState>,
  registry: NarrativeSceneRegistry,
): NarrativeSceneCue[] {
  if (!state.lastTurnResolution) return [];
  const persistentMarks = derivePersistentRoomMarks(state);

  const decisionCues = state.decisionHistory
    .filter((decision) => decision.turn === state.lastTurnResolution?.month)
    .flatMap((decision) => {
      const sourceKey = getDecisionSceneKey(decision);
      const script = registry[sourceKey];
      if (!script) return [];
      return [{
        decisionId: decision.id,
        decisionSummary: decision.summary,
        script,
        persistentMarks,
      }];
    });
  const endingScript = state.ending
    ? registry[`ending:${state.ending.id}`]
    : undefined;
  if (!endingScript) return decisionCues;
  const finalDecision = state.decisionHistory.at(-1);
  return [
    ...decisionCues,
    {
      decisionId: finalDecision
        ? `${finalDecision.id}:ending`
        : `${state.runId}:ending`,
      decisionSummary: state.ending?.reason ?? "The campaign ended.",
      script: endingScript,
      persistentMarks,
    },
  ];
}

export function getMissingCardSceneKeys(
  cards: readonly {
    readonly id: string;
    readonly choices: readonly { readonly id: string }[];
  }[],
  registry: NarrativeSceneRegistry,
): string[] {
  return cards.flatMap((card) => [
    ...card.choices
      .map((choice) => `card:${card.id}:${choice.id}`)
      .filter((key) => !registry[key]),
    `card:${card.id}:ignored`,
  ]).filter((key) => !registry[key]);
}

export function getDepositSceneKeys(): string[] {
  return Object.values(TRACK_LABELS).flatMap((track) =>
    ["standard", "large"].map((size) => `action:deposit:${track}:${size}`)
  );
}
