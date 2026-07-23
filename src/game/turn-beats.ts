import { ROUTE_DEFINITIONS } from "./content";
import { formatStateDelta } from "./guidance";
import {
  getCompletionPressure,
  getCorporationPressure,
  describeCompletionPressure,
} from "./progression";
import {
  ADVISOR_IDS,
  RESOURCE_KEYS,
  TRACK_KEYS,
  type DecisionRecord,
  type GameState,
  type ResolvedEffect,
  type RouteId,
  type StateDelta,
  type TurnBeat,
  type TurnResolution,
} from "./types";

function emptyDelta(): StateDelta {
  return {
    resources: {},
    pressures: {},
    tracks: {},
    advisors: {},
  };
}

function improvementDelta(delta: StateDelta): StateDelta {
  const improvement = emptyDelta();
  for (const resource of RESOURCE_KEYS) {
    const amount = delta.resources[resource];
    if (amount !== undefined && amount > 0) improvement.resources[resource] = amount;
  }
  for (const pressure of ["stress", "panic"] as const) {
    const amount = delta.pressures[pressure];
    if (amount !== undefined && amount < 0) improvement.pressures[pressure] = amount;
  }
  for (const track of TRACK_KEYS) {
    const amount = delta.tracks[track];
    if (amount !== undefined && amount > 0) improvement.tracks[track] = amount;
  }
  const institutions = delta.institutions;
  if (institutions !== undefined && institutions > 0) improvement.institutions = institutions;
  const corporationProgress = delta.corporationProgress;
  if (corporationProgress !== undefined && corporationProgress < 0) {
    improvement.corporationProgress = corporationProgress;
  }
  const corporationThreat = delta.corporationThreat;
  if (corporationThreat !== undefined && corporationThreat < 0) {
    improvement.corporationThreat = corporationThreat;
  }
  for (const advisorId of ADVISOR_IDS) {
    const changes = delta.advisors[advisorId];
    if (!changes) continue;
    const advisorChanges: NonNullable<StateDelta["advisors"][typeof advisorId]> = {};
    for (const key of ["loyalty", "alignment", "competence"] as const) {
      const amount = changes[key];
      if (amount !== undefined && amount > 0) advisorChanges[key] = amount;
    }
    if (changes.leverage !== undefined && changes.leverage < 0) {
      advisorChanges.leverage = changes.leverage;
    }
    if (changes.active === true) advisorChanges.active = true;
    if (Object.keys(advisorChanges).length > 0) improvement.advisors[advisorId] = advisorChanges;
  }
  return improvement;
}

function adverseDelta(delta: StateDelta, includeResources: boolean): StateDelta {
  const adverse = emptyDelta();
  if (includeResources) {
    for (const resource of RESOURCE_KEYS) {
      const amount = delta.resources[resource];
      if (amount !== undefined && amount < 0) adverse.resources[resource] = amount;
    }
  }
  for (const pressure of ["stress", "panic"] as const) {
    const amount = delta.pressures[pressure];
    if (amount !== undefined && amount > 0) adverse.pressures[pressure] = amount;
  }
  for (const track of TRACK_KEYS) {
    const amount = delta.tracks[track];
    if (amount !== undefined && amount < 0) adverse.tracks[track] = amount;
  }
  const institutions = delta.institutions;
  if (institutions !== undefined && institutions < 0) adverse.institutions = institutions;
  const corporationProgress = delta.corporationProgress;
  if (corporationProgress !== undefined && corporationProgress > 0) {
    adverse.corporationProgress = corporationProgress;
  }
  const corporationThreat = delta.corporationThreat;
  if (corporationThreat !== undefined && corporationThreat > 0) {
    adverse.corporationThreat = corporationThreat;
  }
  for (const advisorId of ADVISOR_IDS) {
    const changes = delta.advisors[advisorId];
    if (!changes) continue;
    const advisorChanges: NonNullable<StateDelta["advisors"][typeof advisorId]> = {};
    for (const key of ["loyalty", "alignment", "competence"] as const) {
      const amount = changes[key];
      if (amount !== undefined && amount < 0) advisorChanges[key] = amount;
    }
    if (changes.leverage !== undefined && changes.leverage > 0) {
      advisorChanges.leverage = changes.leverage;
    }
    if (changes.active === false) advisorChanges.active = false;
    if (Object.keys(advisorChanges).length > 0) adverse.advisors[advisorId] = advisorChanges;
  }
  return adverse;
}

function resolvedEffects(resolution: TurnResolution): ResolvedEffect[] {
  return [
    resolution.ignoredSituation,
    resolution.commitment,
    resolution.advisorReactions,
    resolution.corporationResponse,
    resolution.monthlyPressure,
  ].filter((effect): effect is ResolvedEffect => effect !== null);
}

function decisionIds(decisions: DecisionRecord[]): string[] {
  return [...new Set(decisions.map((decision) => decision.id))];
}

function routeLabels(routeIds: RouteId[]): string {
  return [...new Set(routeIds)].map((routeId) => ROUTE_DEFINITIONS[routeId].label).join(" and ");
}

function getTracksBeforeResolution(
  state: GameState,
  resolution: TurnResolution,
): GameState["tracks"] {
  const totalChanges = Object.fromEntries(TRACK_KEYS.map((track) => [track, 0])) as Record<
    (typeof TRACK_KEYS)[number],
    number
  >;
  for (const effect of resolvedEffects(resolution)) {
    for (const track of TRACK_KEYS) {
      totalChanges[track] += effect.delta.tracks[track] ?? 0;
    }
  }
  return Object.fromEntries(
    TRACK_KEYS.map((track) => [track, state.tracks[track] - totalChanges[track]]),
  ) as GameState["tracks"];
}

function deriveDiscoveries(
  state: GameState,
  resolution: TurnResolution,
  decisions: DecisionRecord[],
  mainDecision: DecisionRecord | null,
): TurnBeat[] {
  const discoveries: TurnBeat[] = [];
  const routeDecisions = decisions.filter((decision) =>
    decision.routesOpened.length > 0
    || decision.routesReopened.length > 0
    || decision.routesAdvanced.length > 0
    || decision.routesCompleted.length > 0
  );
  const changedRoutes = routeDecisions.flatMap((decision) => [
    ...decision.routesOpened,
    ...decision.routesReopened,
    ...decision.routesAdvanced,
    ...decision.routesCompleted,
  ]);
  if (changedRoutes.length > 0) {
    discoveries.push({
      kind: "discovery",
      title: "A strategic connection surfaced",
      explanation: `${routeLabels(changedRoutes)} changed because this choice continued an earlier political path.`,
      exactChanges: [],
      linkedDecisionIds: decisionIds(routeDecisions),
    });
  }

  const surfacedConnections = state.history.filter((entry) =>
    entry.turn === resolution.month
    && entry.causedByDecisionId
    && state.decisionHistory.some((decision) =>
      decision.id === entry.causedByDecisionId && decision.turn < resolution.month
    )
  );
  const surfacedSourceDecisions = surfacedConnections
    .map((entry) =>
      state.decisionHistory.find((decision) => decision.id === entry.causedByDecisionId)
    )
    .filter((decision): decision is DecisionRecord => Boolean(decision));
  const doctrineConnections = surfacedSourceDecisions.filter(
    (decision) => decision.systemModifiers.length > 0,
  );
  const relationshipConnections = surfacedSourceDecisions.filter(
    (decision) => decision.advisorMemories.length > 0,
  );
  if (doctrineConnections.length > 0) {
    discoveries.push({
      kind: "discovery",
      title: "An earlier doctrine changed this month",
      explanation: surfacedConnections
        .filter((entry) => doctrineConnections.some((decision) => decision.id === entry.causedByDecisionId))
        .map((entry) => entry.message)
        .join(" "),
      exactChanges: [],
      linkedDecisionIds: [
        ...decisionIds(doctrineConnections),
        ...(mainDecision ? [mainDecision.id] : []),
      ],
    });
  }
  if (relationshipConnections.length > 0) {
    discoveries.push({
      kind: "discovery",
      title: "A remembered choice changed the forecast",
      explanation: surfacedConnections
        .filter((entry) =>
          relationshipConnections.some((decision) => decision.id === entry.causedByDecisionId)
        )
        .map((entry) => entry.message)
        .join(" "),
      exactChanges: [],
      linkedDecisionIds: [
        ...decisionIds(relationshipConnections),
        ...(mainDecision ? [mainDecision.id] : []),
      ],
    });
  }

  const abilityDecisions = decisions.filter((decision) =>
    decision.id !== mainDecision?.id
    && (
      decision.endingContributors.includes("spent_public_mandate")
      || decision.advisorMemories.includes("fixer:containment_authority")
    )
  );
  if (abilityDecisions.length > 0) {
    discoveries.push({
      kind: "discovery",
      title: "Doctrine and advice combined",
      explanation: abilityDecisions.map((decision) => decision.summary).join(" "),
      exactChanges: abilityDecisions.flatMap((decision) =>
        state.history
          .filter((entry) => entry.causedByDecisionId === decision.id)
          .map((entry) => entry.message)
      ),
      linkedDecisionIds: [
        ...decisionIds(abilityDecisions),
        ...(mainDecision ? [mainDecision.id] : []),
      ],
    });
  }
  return discoveries;
}

function deriveMilestones(
  state: GameState,
  resolution: TurnResolution,
  decisions: DecisionRecord[],
  mainDecision: DecisionRecord | null,
  tracksBefore: GameState["tracks"],
): TurnBeat[] {
  const milestones: TurnBeat[] = [];
  if (
    mainDecision?.category === "deposit"
    && state.decisionHistory.filter((decision) => decision.category === "deposit").length === 1
  ) {
    milestones.push({
      kind: "milestone",
      title: "The first permanent commitment",
      explanation: "The BRB is no longer only a plan. Deposited resources cannot be recovered.",
      exactChanges: formatStateDelta(improvementDelta(resolution.commitment.delta)),
      linkedDecisionIds: [mainDecision.id],
    });
  }

  const newlyReady = TRACK_KEYS.filter(
    (track) => tracksBefore[track] < 50 && state.tracks[track] >= 50,
  );
  if (newlyReady.length > 0) {
    milestones.push({
      kind: "milestone",
      title: newlyReady.length === 1 ? "A BRB track is ready" : "BRB tracks are ready",
      explanation: `${newlyReady
        .map((track) => `${track[0]?.toUpperCase()}${track.slice(1)}`)
        .join(" and ")} reached the 50-point activation threshold.`,
      exactChanges: newlyReady.map((track) => `${state.tracks[track]} / 50 · READY`),
      linkedDecisionIds: mainDecision ? [mainDecision.id] : [],
    });
  }

  const wasActivationReady = TRACK_KEYS.every((track) => tracksBefore[track] >= 50);
  const isActivationReady = TRACK_KEYS.every((track) => state.tracks[track] >= 50);
  if (!wasActivationReady && isActivationReady) {
    milestones.push({
      kind: "milestone",
      title: "BRB activation is now available",
      explanation: "Every track is ready. Activation can end the campaign, but control safeguards still determine the outcome.",
      exactChanges: ["All four BRB tracks meet the 50-point threshold"],
      linkedDecisionIds: mainDecision ? [mainDecision.id] : [],
    });
  }

  const opened = decisions.flatMap((decision) => [
    ...decision.routesOpened,
    ...decision.routesReopened,
  ]);
  const completed = decisions.flatMap((decision) => decision.routesCompleted);
  if (opened.length > 0) {
    milestones.push({
      kind: "milestone",
      title: "A political route opened",
      explanation: `${routeLabels(opened)} is now part of this campaign's known history.`,
      exactChanges: [],
      linkedDecisionIds: decisionIds(
        decisions.filter((decision) =>
          decision.routesOpened.length > 0 || decision.routesReopened.length > 0
        ),
      ),
    });
  }
  if (completed.length > 0) {
    milestones.push({
      kind: "milestone",
      title: "A political route was completed",
      explanation: `${routeLabels(completed)} now contributes to the final record.`,
      exactChanges: [],
      linkedDecisionIds: decisionIds(
        decisions.filter((decision) => decision.routesCompleted.length > 0),
      ),
    });
  }
  return milestones;
}

function deriveProblem(
  state: GameState,
  resolution: TurnResolution,
  mainDecision: DecisionRecord | null,
  tracksBefore: GameState["tracks"],
): TurnBeat | null {
  const adverseChanges = resolvedEffects(resolution).flatMap((effect) => {
    const changes = formatStateDelta(
      adverseDelta(effect.delta, effect !== resolution.commitment),
    );
    return changes.map((change) => `${effect.label} · ${change}`);
  });
  const priorState = structuredClone(state);
  priorState.tracks = tracksBefore;
  const priorPressure = getCompletionPressure(priorState);
  const currentPressure = getCompletionPressure(state);
  const pressureCrossed = priorPressure.tier !== currentPressure.tier
    && currentPressure.completionPercent > priorPressure.completionPercent;

  if (adverseChanges.length === 0 && !pressureCrossed) return null;

  const corporationPressure = getCorporationPressure(state);
  const pressureExplanation = pressureCrossed
    ? `BRB visibility moved from ${priorPressure.tier} to ${currentPressure.tier}: ${describeCompletionPressure(currentPressure)}. Corporation responses are currently scheduled every ${corporationPressure.responseIntervalMonths} month${corporationPressure.responseIntervalMonths === 1 ? "" : "s"}.`
    : "The same month created exposure that the next commitment may need to contain.";
  return {
    kind: "problem",
    title: `${mainDecision?.summary ?? "This commitment"} created a new problem`,
    explanation: pressureExplanation,
    exactChanges: [
      ...(pressureCrossed
        ? [`BRB visibility ${priorPressure.tier} → ${currentPressure.tier}`]
        : []),
      ...adverseChanges,
    ],
    linkedDecisionIds: mainDecision ? [mainDecision.id] : [],
  };
}

export function deriveTurnBeats(
  state: GameState,
  resolution: TurnResolution | null,
): TurnBeat[] {
  if (!resolution) return [];
  const decisions = state.decisionHistory.filter(
    (decision) => decision.turn === resolution.month,
  );
  const mainDecision = decisions.at(-1) ?? null;
  const tracksBefore = getTracksBeforeResolution(state, resolution);
  const improvements = formatStateDelta(improvementDelta(resolution.commitment.delta));
  const improvement: TurnBeat = {
    kind: "improvement",
    title: improvements.length > 0 ? "The commitment improved your position" : "The commitment changed your position",
    explanation: improvements.length > 0
      ? resolution.commitment.label
      : "No meter improved immediately; the exact record still shows what the commitment changed.",
    exactChanges: improvements,
    linkedDecisionIds: mainDecision ? [mainDecision.id] : [],
  };
  const problem = deriveProblem(state, resolution, mainDecision, tracksBefore);
  return [
    improvement,
    ...deriveDiscoveries(state, resolution, decisions, mainDecision),
    ...deriveMilestones(state, resolution, decisions, mainDecision, tracksBefore),
    ...(problem ? [problem] : []),
  ];
}
