import { getBrbCompletionPercent } from "@/game/progression";
import type { DecisionRecord, DecisionSubject, GameState, TrackKey } from "@/game/types";
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

function sceneKeyFromSubject(subject: DecisionSubject): string {
  switch (subject.kind) {
    case "card":
      return `card:${subject.cardId}:${subject.choiceId}`;
    case "deposit":
      return `action:deposit:${subject.track}:${subject.size}`;
    case "counter":
      return `action:counter:${subject.strategy}:${subject.outcome}`;
    case "advisor":
      return `action:advisor:${subject.advisorId}`;
    case "consult":
      return `consult:${subject.advisorId}`;
    case "recover":
      return `action:recover:${subject.resource}`;
    case "faction":
      return "action:faction";
    case "institutions":
      return "action:institutions";
    case "activate":
      return "action:activate";
  }
}

export function getDecisionSceneKey(decision: Readonly<DecisionRecord>): string {
  if (decision.subject) {
    return sceneKeyFromSubject(decision.subject);
  }

  // Legacy saves / incomplete records: cards still carry structured IDs.
  if (decision.cardId && decision.choiceId) {
    return `card:${decision.cardId}:${decision.choiceId}`;
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
