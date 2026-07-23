import {
  ADVISORS,
  ARCHETYPES,
  BASE_RESOURCES,
  CORPORATION_MOVES,
  DEPOSIT_PROGRESS,
  DEPOSIT_COSTS,
  ENDING_COPY,
} from "./content";
import {
  getActionCost,
  getActionError,
  getDepositCost,
  spendResources,
} from "./actions";
import { applyAdvisorReactions, getActionCategory } from "./advisor-rules";
import { applyCorporationMove, chooseCorporationStrategy } from "./corporation-rules";
import { activate, evaluateCivicLegacy, evaluateTerminalState } from "./endings";
import { applyLegacyDirective } from "./directives";
import {
  applyIgnoredCard,
  drawSituationCard,
  expireActiveCard,
  getActiveCard,
  getCardChoiceCost,
  getEligibleSituationCards,
  resolveCard,
} from "./cards";
import {
  getAdvisorForecastProfile,
  modifierAppliesThisTurn,
  surfaceForecastEchoes,
  surfaceSystemModifier,
} from "./echoes";
import { buildDeclassifiedReport } from "./replay";
import {
  applyCompletionPressure,
  describeCompletionPressure,
  formatCampaignTime,
  getCompletionPressure,
  getCorporationPressure,
  isCorporationResponseDue,
} from "./progression";
import { nextRandom, randomInt } from "./rng";
import { getRouteCompletionKind, validateRouteIntegrity } from "./routes";
import {
  addHistory,
  applyEffects,
  clamp,
  cloneState,
  diffEffectSnapshots,
  hasStateDelta,
  linkConsequence,
  patchNumberRecord,
  pushUnique,
  recordSimpleDecision,
  snapshotGameEffects,
  type EffectSnapshot,
} from "./state-helpers";
import {
  ADVISOR_IDS,
  CARD_TYPES,
  RESOURCE_KEYS,
  ROUTE_IDS,
  TRACK_KEYS,
  type ActionResult,
  type AdvisorId,
  type AdvisorState,
  type ArchetypeId,
  type CivicLegacyEvaluation,
  type CommitOptions,
  type ConsultationResult,
  type CorporationStrategy,
  type CreateGameOptions,
  type Ending,
  type EndingVariationId,
  type Effects,
  type GameState,
  type MajorAction,
  type MeterAudit,
  type MonthAudit,
  type ResourcePool,
  type ResolvedEffect,
  type StateDelta,
  type TrackKey,
  type TurnResolution,
} from "./types";

export { getActiveCard, getEligibleSituationCards } from "./cards";
export { getActionCost, getActionError, getDepositCost } from "./actions";
export { getActionCategory } from "./advisor-rules";
export { evaluateCivicLegacy } from "./endings";
export { deserializeGame, serializeGame } from "./game-persistence";
export { getRouteCompletionKind, validateRouteIntegrity } from "./routes";
export { applyEffects } from "./state-helpers";

const CORPORATION_STRATEGIES = Object.keys(CORPORATION_MOVES) as CorporationStrategy[];

function applyArchetype(state: GameState): void {
  const archetype = ARCHETYPES[state.archetypeId];
  patchNumberRecord(state.resources, archetype.resourceChanges);
  patchNumberRecord(state.tracks, archetype.trackChanges);
  for (const [advisorId, changes] of Object.entries(archetype.advisorChanges) as [
    AdvisorId,
    Partial<AdvisorState>,
  ][]) {
    const advisor = state.advisors[advisorId];
    for (const [key, amount] of Object.entries(changes) as [keyof AdvisorState, number | boolean][]) {
      if (key === "active") advisor.active = Boolean(amount);
      else advisor[key] = clamp(advisor[key] + Number(amount));
    }
  }
}

function createAdvisorState(id: AdvisorId): AdvisorState {
  const definition = ADVISORS[id];
  return {
    loyalty: 60,
    alignment: 55,
    leverage: 10,
    competence: definition.baseCompetence,
    active: true,
  };
}

function normalizeCreateOptions(
  seedOrOptions: number | CreateGameOptions,
  archetypeId: ArchetypeId,
): Required<Omit<CreateGameOptions, "experiment">> & { experiment: string | null } {
  if (typeof seedOrOptions === "number") {
    const seed = seedOrOptions >>> 0;
    return {
      seed,
      archetypeId,
      runId: `run-${seed}-${archetypeId}`,
      experiment: null,
      legacyDirectiveId: null,
    };
  }
  const seed = seedOrOptions.seed >>> 0;
  const chosenArchetype = seedOrOptions.archetypeId ?? "technocrat";
  return {
    seed,
    archetypeId: chosenArchetype,
    runId: seedOrOptions.runId ?? `run-${seed}-${chosenArchetype}`,
    experiment: seedOrOptions.experiment ?? null,
    legacyDirectiveId: seedOrOptions.legacyDirectiveId ?? null,
  };
}

export function createGame(
  seedOrOptions: number | CreateGameOptions,
  archetypeId: ArchetypeId = "technocrat",
): GameState {
  const options = normalizeCreateOptions(seedOrOptions, archetypeId);
  const firstRandom = randomInt(options.seed, CORPORATION_STRATEGIES.length);
  const state: GameState = {
    version: 5,
    runId: options.runId,
    seed: options.seed,
    rngState: firstRandom.state,
    turn: 1,
    phase: "briefing",
    archetypeId: options.archetypeId,
    legacyDirective: {
      equippedId: options.legacyDirectiveId,
      used: false,
      usedOnDecisionId: null,
    },
    experiment: options.experiment,
    resources: { ...BASE_RESOURCES },
    deposited: { money: 0, influence: 0, intelligence: 0, trust: 0, capacity: 0 },
    pressures: { stress: 12, panic: 8 },
    tracks: { engineering: 0, access: 0, legitimacy: 0, stability: 0 },
    institutions: 60,
    advisors: {
      analyst: createAdvisorState("analyst"),
      fixer: createAdvisorState("fixer"),
      steward: createAdvisorState("steward"),
    },
    advisorMemories: { analyst: [], fixer: [], steward: [] },
    corporation: {
      strategy: CORPORATION_STRATEGIES[firstRandom.value] ?? "expanding",
      progress: 8,
      threat: 15,
      lastMove: null,
      lastResponseMonth: 0,
    },
    lastMonthAudit: null,
    lastTurnResolution: null,
    activeCardId: null,
    deck: {
      drawCounts: {},
      lastDrawnTurn: {},
      addedCardIds: [],
      removedCardIds: [],
      cardSources: {},
    },
    cardHistory: [],
    decisionHistory: [],
    routes: {
      labor_coalition: {
        status: "unseen",
        discoveredSteps: [],
        touchedByDecisionId: null,
        touchedTurn: null,
        openedByDecisionId: null,
        openedTurn: null,
        closedByDecisionId: null,
        closedTurn: null,
        reopenedByDecisionId: null,
        reopenedTurn: null,
        completedByDecisionId: null,
        completedTurn: null,
        transitions: [],
      },
      corporate_exposure: {
        status: "unseen",
        discoveredSteps: [],
        touchedByDecisionId: null,
        touchedTurn: null,
        openedByDecisionId: null,
        openedTurn: null,
        closedByDecisionId: null,
        closedTurn: null,
        reopenedByDecisionId: null,
        reopenedTurn: null,
        completedByDecisionId: null,
        completedTurn: null,
        transitions: [],
      },
    },
    flags: [],
    systemModifiers: [],
    endingContributors: [],
    archetypeAbilityUsed: false,
    suppressNextIgnoredCard: false,
    consultation: null,
    history: [],
    ending: null,
    report: null,
  };

  applyArchetype(state);
  drawSituationCard(state);
  addHistory(state, "system", `${ARCHETYPES[state.archetypeId].name} run started.`);
  return state;
}

export function consultAdvisor(
  state: GameState,
  advisorId: AdvisorId,
  useArchetypeAbility = false,
): ActionResult {
  const consultationError = getConsultationError(state, advisorId);
  if (consultationError) return { state, accepted: false, error: consultationError };

  const next = cloneState(state);
  const before = cloneState(next);
  const advisor = next.advisors[advisorId];
  const definition = ADVISORS[advisorId];
  const consultationCost = getConsultationCost(next);
  next.resources.intelligence -= consultationCost.intelligence;
  const leverageGain = consultationCost.leverage;
  advisor.leverage = clamp(advisor.leverage + leverageGain);
  advisor.loyalty = clamp(advisor.loyalty + 1, 0, definition.loyaltyCeiling);

  let archetypeAbilityApplied = false;
  if (useArchetypeAbility && !next.archetypeAbilityUsed) {
    if (next.archetypeId === "populist" && advisorId === "steward" && next.resources.trust >= 6) {
      next.resources.trust -= 6;
      next.resources.influence = clamp(next.resources.influence + 9);
      next.archetypeAbilityUsed = true;
      archetypeAbilityApplied = true;
      const decisionId = recordSimpleDecision(
        next,
        before,
        "advisor",
        "The Steward converted public Trust into emergency Influence.",
      );
      next.decisionHistory.at(-1)?.echoHints.push("The public mandate has been spent, not erased.");
      next.decisionHistory.at(-1)?.echoTypes.push("ending");
      next.decisionHistory.at(-1)?.endingContributors.push("spent_public_mandate");
      pushUnique(next.endingContributors, "spent_public_mandate");
      addHistory(next, "advisor", "The public mandate was converted into political force.", { causedByDecisionId: decisionId });
    } else if (next.archetypeId === "operator" && advisorId === "fixer") {
      next.suppressNextIgnoredCard = true;
      advisor.leverage = clamp(advisor.leverage + 8);
      next.archetypeAbilityUsed = true;
      archetypeAbilityApplied = true;
      const decisionId = recordSimpleDecision(
        next,
        before,
        "advisor",
        "The Fixer received authority to contain the next ignored Situation Card.",
      );
      next.decisionHistory.at(-1)?.echoHints.push("The Fixer will remember the authority you granted.");
      next.decisionHistory.at(-1)?.echoTypes.push("relationship");
      next.decisionHistory.at(-1)?.advisorMemories.push("fixer:containment_authority");
      pushUnique(next.advisorMemories.fixer, "containment_authority");
      addHistory(next, "advisor", "Containment authority is ready.", { causedByDecisionId: decisionId });
    }
  }

  const technocratPrecision = next.archetypeId === "technocrat" && advisorId === "analyst";
  let predictedStrategy = next.corporation.strategy;
  let confidence: ConsultationResult["confidence"] = "high";
  if (!technocratPrecision) {
    const profile = getAdvisorForecastProfile(next, advisorId);
    const accuracy = profile.accuracy;
    surfaceForecastEchoes(next, profile);
    const random = nextRandom(next.rngState);
    next.rngState = random.state;
    if (random.value * 100 > accuracy) {
      const alternate = CORPORATION_STRATEGIES.filter(
        (strategy) => strategy !== next.corporation.strategy,
      );
      const pick = randomInt(next.rngState, alternate.length);
      next.rngState = pick.state;
      predictedStrategy = alternate[pick.value] ?? "expanding";
    }
    confidence = accuracy >= 78 ? "high" : accuracy >= 58 ? "medium" : "low";
  }

  next.consultation = {
    advisorId,
    predictedStrategy,
    confidence,
    archetypeAbilityApplied,
    message: `${definition.name} predicts the Corporation is ${predictedStrategy.replace("_", " ")}.`,
  };
  next.phase = "consulted";
  addHistory(next, "advisor", next.consultation.message);
  return { state: next, accepted: true };
}

function applyDeposit(state: GameState, track: TrackKey, size: "standard" | "large"): void {
  const cost = getActionCost(state, { type: "deposit", track, size });
  for (const resource of RESOURCE_KEYS) {
    state.resources[resource] -= cost[resource] ?? 0;
    state.deposited[resource] += cost[resource] ?? 0;
  }
  state.tracks[track] = clamp(state.tracks[track] + DEPOSIT_PROGRESS[size]);
  const sideEffect = size === "large" ? 2 : 1;
  if (track === "engineering") state.corporation.threat = clamp(state.corporation.threat + 3 * sideEffect);
  else if (track === "access") state.advisors.fixer.leverage = clamp(state.advisors.fixer.leverage + 3 * sideEffect);
  else if (track === "legitimacy") {
    state.corporation.threat = clamp(state.corporation.threat + 2 * sideEffect);
    state.pressures.stress = clamp(state.pressures.stress + 2 * sideEffect);
  } else {
    state.pressures.stress = clamp(state.pressures.stress - 3 * sideEffect);
    state.corporation.progress = clamp(state.corporation.progress + 2 * sideEffect);
  }
}

function applyPlayerAction(state: GameState, action: MajorAction): {
  corporationBlocked: boolean;
  decisionId: string | null;
} {
  const before = cloneState(state);
  let corporationBlocked = false;
  let summary = "";
  if (action.type === "deposit") {
    applyDeposit(state, action.track, action.size);
    if (
      action.track === "engineering"
      && state.systemModifiers.includes("replacement_contractors")
    ) {
      surfaceSystemModifier(
        state,
        "replacement_contractors",
        "Replacement contractors increased a later Engineering deposit’s Capacity commitment.",
      );
    }
    summary = `${action.size === "large" ? "Large" : "Standard"} ${action.track} deposit permanently committed.`;
  } else if (action.type === "resolve_card") {
    return { corporationBlocked, decisionId: resolveCard(state, action.choiceId) };
  } else if (action.type === "counter_corporation") {
    spendResources(state, getActionCost(state, action));
    corporationBlocked = action.predictedStrategy === state.corporation.strategy;
    if (corporationBlocked) {
      state.corporation.progress = clamp(state.corporation.progress - 8);
      state.corporation.threat = clamp(state.corporation.threat - 6);
      summary = `The ${action.predictedStrategy.replace("_", " ")} move was countered.`;
    } else {
      state.corporation.threat = clamp(state.corporation.threat + 5);
      summary = "The counter-operation targeted the wrong strategy.";
    }
  } else if (action.type === "strengthen_faction") {
    spendResources(state, getActionCost(state, action));
    applyEffects(state, { resources: { trust: 6 }, institutions: 5 });
    summary = "The governing coalition was strengthened.";
  } else if (action.type === "manage_advisor") {
    spendResources(state, getActionCost(state, action));
    state.advisors[action.advisorId].loyalty = clamp(state.advisors[action.advisorId].loyalty + 10);
    state.advisors[action.advisorId].leverage = clamp(state.advisors[action.advisorId].leverage - 6);
    summary = `${ADVISORS[action.advisorId].name} was brought back into line.`;
  } else if (action.type === "recover_resource") {
    const parallelContractors = action.resource === "capacity"
      && state.systemModifiers.includes("parallel_contractors");
    const gain = action.resource === "capacity"
      ? 28 + (parallelContractors ? 8 : 0)
      : 30;
    state.resources[action.resource] = clamp(state.resources[action.resource] + gain);
    state.pressures.stress = clamp(state.pressures.stress + 7);
    const acceptedDelay = state.systemModifiers.includes("accepted_delay");
    state.corporation.progress = clamp(
      state.corporation.progress + 3 + (acceptedDelay ? 2 : 0),
    );
    if (parallelContractors) {
      surfaceSystemModifier(
        state,
        "parallel_contractors",
        "Parallel contractors increased a later Capacity recovery.",
      );
    }
    if (acceptedDelay) {
      surfaceSystemModifier(
        state,
        "accepted_delay",
        "Accepted delay gave the Corporation additional progress during a later recovery.",
      );
    }
    summary = `${action.resource} was recovered while the Corporation used the delay.`;
  } else if (action.type === "protect_institutions") {
    spendResources(state, getActionCost(state, action));
    applyEffects(state, {
      institutions: 11,
      pressures: { stress: -4, panic: -2 },
    });
    summary = "Institutional safeguards were reinforced.";
  } else {
    summary = "BRB activation was authorized.";
  }
  return {
    corporationBlocked,
    decisionId: recordSimpleDecision(state, before, getActionCategory(action), summary),
  };
}

export function getKnownActionDelta(
  state: GameState,
  action: MajorAction,
): StateDelta | null {
  if (action.type === "resolve_card" || action.type === "activate_brb") return null;
  const preview = cloneState(state);
  const before = snapshotGameEffects(preview);
  applyPlayerAction(preview, action);
  return diffEffectSnapshots(before, snapshotGameEffects(preview));
}

function applyPressure(state: GameState): void {
  const depleted = RESOURCE_KEYS.filter((resource) => state.resources[resource] <= 15).length;
  state.pressures.stress = clamp(state.pressures.stress + depleted * 3 - (depleted === 0 ? 1 : 0));
  if (state.corporation.progress >= 60) state.pressures.panic = clamp(state.pressures.panic + 3);
  if (state.institutions <= 30) state.pressures.panic = clamp(state.pressures.panic + 4);
  if (state.pressures.stress >= 80) state.resources.trust = clamp(state.resources.trust - 4);
  if (modifierAppliesThisTurn(state, "capacity_drift")) {
    state.tracks.engineering = clamp(state.tracks.engineering - 1);
    surfaceSystemModifier(
      state,
      "capacity_drift",
      "An earlier Capacity bottleneck reduced Engineering during monthly pressure.",
    );
  }
  if (state.systemModifiers.includes("emergency_rule")) state.institutions = clamp(state.institutions - 1);
}

type AuditSnapshot = {
  corporationProgress: number;
  panic: number;
};

function auditSnapshot(state: GameState): AuditSnapshot {
  return {
    corporationProgress: state.corporation.progress,
    panic: state.pressures.panic,
  };
}

function buildMeterAudit(
  key: keyof AuditSnapshot,
  start: AuditSnapshot,
  afterAction: AuditSnapshot,
  afterCorporation: AuditSnapshot,
  afterBasePressure: AuditSnapshot,
  afterCompletionPressure: AuditSnapshot,
): MeterAudit {
  return {
    before: start[key],
    after: afterCompletionPressure[key],
    actionOrCard: afterAction[key] - start[key],
    corporationResponse: afterCorporation[key] - afterAction[key],
    basePressure: afterBasePressure[key] - afterCorporation[key],
    completionPressure: afterCompletionPressure[key] - afterBasePressure[key],
  };
}

function buildMonthAudit(
  state: GameState,
  corporationResponded: boolean,
  start: AuditSnapshot,
  afterAction: AuditSnapshot,
  afterCorporation: AuditSnapshot,
  afterBasePressure: AuditSnapshot,
  afterCompletionPressure: AuditSnapshot,
): MonthAudit {
  const pressure = getCompletionPressure(state);
  const corporationPressure = getCorporationPressure(state);
  return {
    month: state.turn,
    pressureTier: pressure.tier,
    corporationResponseIntervalMonths: corporationPressure.responseIntervalMonths,
    corporationResponded,
    corporationProgress: buildMeterAudit(
      "corporationProgress",
      start,
      afterAction,
      afterCorporation,
      afterBasePressure,
      afterCompletionPressure,
    ),
    panic: buildMeterAudit(
      "panic",
      start,
      afterAction,
      afterCorporation,
      afterBasePressure,
      afterCompletionPressure,
    ),
  };
}

function resolvedEffect(
  label: string,
  before: EffectSnapshot,
  after: EffectSnapshot,
  includeWhenEmpty = false,
): ResolvedEffect | null {
  const delta = diffEffectSnapshots(before, after);
  return includeWhenEmpty || hasStateDelta(delta) ? { label, delta } : null;
}

export function commitAction(
  state: GameState,
  action: MajorAction,
  options: CommitOptions = {},
): ActionResult {
  const error = getActionError(state, action, options);
  if (error) return { state, accepted: false, error };

  const next = cloneState(state);
  const start = auditSnapshot(next);
  if (action.type === "activate_brb") {
    const beforeCommitment = snapshotGameEffects(next);
    applyPlayerAction(next, action);
    const afterAction = auditSnapshot(next);
    next.lastTurnResolution = {
      month: next.turn,
      ignoredSituation: null,
      commitment: resolvedEffect(
        "BRB activation authorized",
        beforeCommitment,
        snapshotGameEffects(next),
        true,
      ) as ResolvedEffect,
      advisorReactions: null,
      corporationResponse: null,
      monthlyPressure: null,
    };
    next.lastMonthAudit = buildMonthAudit(
      next,
      false,
      start,
      afterAction,
      afterAction,
      afterAction,
      afterAction,
    );
    activate(next);
    return { state: next, accepted: true };
  }

  let ignoredSituation: ResolvedEffect | null = null;
  if (next.activeCardId && action.type !== "resolve_card") {
    const ignoredTitle = getActiveCard(next)?.title ?? "Situation file";
    const beforeIgnored = snapshotGameEffects(next);
    applyIgnoredCard(next);
    ignoredSituation = resolvedEffect(
      `Ignored: ${ignoredTitle}`,
      beforeIgnored,
      snapshotGameEffects(next),
    );
  }
  const beforeCommitment = snapshotGameEffects(next);
  const appliedDirective = options.useLegacyDirective
    ? applyLegacyDirective(next)
    : null;
  const playerResult = applyPlayerAction(next, action);
  if (appliedDirective) {
    if (!playerResult.decisionId) {
      throw new Error("A Legacy Directive requires decision provenance.");
    }
    next.legacyDirective.used = true;
    next.legacyDirective.usedOnDecisionId = playerResult.decisionId;
    addHistory(
      next,
      "system",
      `Legacy Directive used: ${appliedDirective.title}. ${appliedDirective.benefit}; ${appliedDirective.warning}.`,
      { decisionId: playerResult.decisionId },
    );
  }
  const baseCommitmentLabel = next.decisionHistory.at(-1)?.summary ?? "Commitment resolved";
  const commitmentLabel = appliedDirective
    ? `${baseCommitmentLabel} · Directive: ${appliedDirective.title}`
    : baseCommitmentLabel;
  const commitment = resolvedEffect(
    commitmentLabel,
    beforeCommitment,
    snapshotGameEffects(next),
    true,
  ) as ResolvedEffect;
  const afterAction = auditSnapshot(next);
  const category = getActionCategory(action);
  const beforeAdvisorReactions = snapshotGameEffects(next);
  applyAdvisorReactions(next, category);
  const advisorReactions = resolvedEffect(
    "Advisor reactions",
    beforeAdvisorReactions,
    snapshotGameEffects(next),
  );
  const pressureTier = getCompletionPressure(next).tier;
  const corporationResponded = !appliedDirective?.preventCorporationResponse
    && isCorporationResponseDue(next, pressureTier);
  const beforeCorporation = snapshotGameEffects(next);
  const beforeCorporationStrategy = next.corporation.strategy;
  if (corporationResponded) {
    applyCorporationMove(next, playerResult.corporationBlocked, playerResult.decisionId);
  }
  const corporationResponse = corporationResponded
    ? resolvedEffect(
        playerResult.corporationBlocked
          ? `${CORPORATION_MOVES[beforeCorporationStrategy].name} operation blocked`
          : `Corporation response: ${CORPORATION_MOVES[beforeCorporationStrategy].name}`,
        beforeCorporation,
        snapshotGameEffects(next),
        true,
      )
    : null;
  const afterCorporation = auditSnapshot(next);
  const beforeMonthlyPressure = snapshotGameEffects(next);
  applyPressure(next);
  const afterBasePressure = auditSnapshot(next);
  applyCompletionPressure(next);
  const afterCompletionPressure = auditSnapshot(next);
  const monthlyPressure = resolvedEffect(
    "End-of-month pressure",
    beforeMonthlyPressure,
    snapshotGameEffects(next),
  );
  next.lastMonthAudit = buildMonthAudit(
    next,
    corporationResponded,
    start,
    afterAction,
    afterCorporation,
    afterBasePressure,
    afterCompletionPressure,
  );
  next.lastTurnResolution = {
    month: next.turn,
    ignoredSituation,
    commitment,
    advisorReactions,
    corporationResponse,
    monthlyPressure,
  };
  chooseCorporationStrategy(next, action);

  next.turn += 1;
  next.consultation = null;
  next.phase = "briefing";
  evaluateTerminalState(next);
  if (!next.ending) drawSituationCard(next);
  return { state: next, accepted: true };
}

export function getValidActions(state: GameState): MajorAction[] {
  if (state.phase === "ended") return [];
  const actions: MajorAction[] = [];
  const card = getActiveCard(state);
  if (card) {
    for (const choice of card.choices) {
      const candidate: MajorAction = { type: "resolve_card", choiceId: choice.id };
      if (!getActionError(state, candidate, { confirmCardAbandonment: true })) {
        actions.push(candidate);
      }
    }
  }
  for (const track of TRACK_KEYS) {
    for (const size of ["standard", "large"] as const) {
      const candidate: MajorAction = { type: "deposit", track, size };
      if (!getActionError(state, candidate, { confirmCardAbandonment: true })) actions.push(candidate);
    }
  }
  for (const predictedStrategy of CORPORATION_STRATEGIES) {
    const candidate: MajorAction = { type: "counter_corporation", predictedStrategy };
    if (!getActionError(state, candidate, { confirmCardAbandonment: true })) actions.push(candidate);
  }
  for (const advisorId of ADVISOR_IDS) {
    const candidate: MajorAction = { type: "manage_advisor", advisorId };
    if (!getActionError(state, candidate, { confirmCardAbandonment: true })) actions.push(candidate);
  }
  for (const resource of RESOURCE_KEYS) actions.push({ type: "recover_resource", resource });
  for (const action of [
    { type: "strengthen_faction" },
    { type: "protect_institutions" },
    { type: "activate_brb" },
  ] as MajorAction[]) {
    if (!getActionError(state, action, { confirmCardAbandonment: true })) actions.push(action);
  }
  return actions;
}

export function canUseArchetypeConsultation(state: GameState, advisorId: AdvisorId): boolean {
  if (state.archetypeAbilityUsed) return false;
  if (state.archetypeId === "populist") return advisorId === "steward" && state.resources.trust >= 6;
  if (state.archetypeId === "operator") return advisorId === "fixer";
  return false;
}

export function getConsultationCost(
  state: GameState,
): { intelligence: number; leverage: number } {
  return {
    intelligence: 2,
    leverage: state.archetypeId === "operator" ? 4 : 2,
  };
}

export function getConsultationError(
  state: GameState,
  advisorId: AdvisorId,
): string | null {
  if (state.phase === "ended") return "The run has ended.";
  if (state.phase !== "briefing") return "Only one consultation is allowed each turn.";
  if (!state.advisors[advisorId].active) return "That advisor is no longer active.";
  const cost = getConsultationCost(state);
  if (state.resources.intelligence < cost.intelligence) {
    return `Consultation requires ${cost.intelligence} Intelligence.`;
  }
  return null;
}

export function getBriefing(state: GameState): string[] {
  const card = getActiveCard(state);
  const completionPressure = getCompletionPressure(state);
  const corporationPressure = getCorporationPressure(state);
  const weakestResource = RESOURCE_KEYS.reduce((lowest, key) =>
    state.resources[key] < state.resources[lowest] ? key : lowest,
  );
  return [
    formatCampaignTime(state.turn),
    card ? `${card.title}: ${card.description}` : "No Situation Card demands an immediate response.",
    `Weakest resource: ${weakestResource} (${state.resources[weakestResource]})`,
    `Corporation Threat: ${state.corporation.threat} (${corporationPressure.tier}); Posture: ${state.corporation.strategy.replace("_", " ")}`,
    `Corporation response cadence: every ${corporationPressure.responseIntervalMonths} month${corporationPressure.responseIntervalMonths === 1 ? "" : "s"}; next response due Month ${corporationPressure.nextResponseMonth}.`,
    `BRB completion pressure: ${completionPressure.tier} (${completionPressure.completionPercent}%; ${describeCompletionPressure(completionPressure)}).`,
  ];
}

export const SITUATION_DECK_CARD_TYPES = CARD_TYPES;
export const PROTOTYPE_ROUTE_IDS = ROUTE_IDS;
