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
  type ActionCategory,
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
    };
  }
  const seed = seedOrOptions.seed >>> 0;
  const chosenArchetype = seedOrOptions.archetypeId ?? "technocrat";
  return {
    seed,
    archetypeId: chosenArchetype,
    runId: seedOrOptions.runId ?? `run-${seed}-${chosenArchetype}`,
    experiment: seedOrOptions.experiment ?? null,
  };
}

export function createGame(
  seedOrOptions: number | CreateGameOptions,
  archetypeId: ArchetypeId = "technocrat",
): GameState {
  const options = normalizeCreateOptions(seedOrOptions, archetypeId);
  const firstRandom = randomInt(options.seed, CORPORATION_STRATEGIES.length);
  const state: GameState = {
    version: 4,
    runId: options.runId,
    seed: options.seed,
    rngState: firstRandom.state,
    turn: 1,
    phase: "briefing",
    archetypeId: options.archetypeId,
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

export function getActionCategory(action: MajorAction): ActionCategory {
  if (action.type === "resolve_card") return "card";
  if (action.type === "counter_corporation") return "counter";
  if (action.type === "strengthen_faction") return "faction";
  if (action.type === "manage_advisor") return "advisor";
  if (action.type === "recover_resource") return "recover";
  if (action.type === "protect_institutions") return "institutions";
  if (action.type === "activate_brb") return "activate";
  return "deposit";
}

function applyAdvisorReactions(state: GameState, category: ActionCategory): void {
  for (const advisorId of ADVISOR_IDS) {
    const definition = ADVISORS[advisorId];
    const advisor = state.advisors[advisorId];
    if (!advisor.active) continue;
    if (definition.agenda.includes(category)) {
      advisor.alignment = clamp(advisor.alignment + 4);
      advisor.loyalty = clamp(advisor.loyalty + 1, 0, definition.loyaltyCeiling);
    } else {
      advisor.alignment = clamp(advisor.alignment - 2);
      advisor.loyalty = clamp(advisor.loyalty - 2);
    }

    if (advisor.loyalty < definition.loyaltyBreakingPoint || advisor.leverage >= 90) {
      advisor.active = false;
      addHistory(
        state,
        "advisor",
        advisor.leverage >= 90
          ? `${definition.name} used accumulated leverage to leave on their own terms.`
          : `${definition.name} resigned after Loyalty fell below ${definition.loyaltyBreakingPoint}.`,
      );
    }
  }
}

function scaleAdverseAmount(amount: number, multiplier: number, adverse: "positive" | "negative"): number {
  if ((adverse === "positive" && amount <= 0) || (adverse === "negative" && amount >= 0)) {
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
    scaled.institutions = scaleAdverseAmount(effects.institutions, multiplier, "negative");
  }
  if (effects.corporationProgress !== undefined) {
    scaled.corporationProgress = scaleAdverseAmount(
      effects.corporationProgress,
      multiplier,
      "positive",
    );
  }
  // Threat determines the multiplier, so its own increase is deliberately never amplified.
  if (effects.corporationThreat !== undefined) scaled.corporationThreat = effects.corporationThreat;
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

function applyCorporationMove(state: GameState, blocked: boolean, causedByDecisionId: string | null): void {
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
    scaleCorporationEffects(CORPORATION_MOVES[strategy].effects, pressure.severityMultiplier),
  );
  addHistory(
    state,
    "corporation",
    CORPORATION_MOVES[strategy].description,
    causedByDecisionId ? { causedByDecisionId } : undefined,
  );
  linkConsequence(state, causedByDecisionId);
}

function chooseCorporationStrategy(state: GameState, action: MajorAction): void {
  const scores: Record<CorporationStrategy, number> = {
    expanding: 5 + Math.max(0, 50 - state.corporation.progress) / 12,
    infiltrating: 4 + state.tracks.access / 12 + Math.max(0, 35 - state.resources.capacity) / 8,
    discrediting: 4 + state.tracks.legitimacy / 14 + Math.max(0, 40 - state.resources.trust) / 7,
    buying_influence: 4 + Math.max(0, 40 - state.resources.influence) / 7 + state.advisors.fixer.leverage / 25,
  };
  if (action.type === "deposit") {
    if (action.track === "engineering" || action.track === "access") scores.infiltrating += 5;
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

function endingVariation(state: GameState, ending: Ending): {
  variationId: EndingVariationId | null;
  variationTitle: string | null;
} {
  if (!ending.victory) return { variationId: null, variationTitle: null };
  if (
    state.archetypeId === "technocrat" &&
    (state.endingContributors.includes("technocratic_opacity") || state.resources.trust < 30)
  ) {
    return { variationId: "perfect_machine_empty_state", variationTitle: "Perfect Machine, Empty State" };
  }
  if (
    state.archetypeId === "populist" &&
    ["normal", "reconciled"].includes(getRouteCompletionKind(state.routes.labor_coalition) ?? "")
  ) {
    return { variationId: "crowd_presses_button", variationTitle: "The Crowd Presses the Button" };
  }
  if (
    state.archetypeId === "operator" &&
    (state.systemModifiers.includes("emergency_rule") || state.advisors.fixer.leverage >= 60)
  ) {
    return { variationId: "government_by_command", variationTitle: "Government by Command" };
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
  addHistory(state, "system", `${ending.variationTitle ?? ending.title}: ${ending.reason}`);
  state.report = buildDeclassifiedReport(state);
}

export function evaluateCivicLegacy(state: GameState): CivicLegacyEvaluation {
  const highestLeverage = Math.max(...Object.values(state.advisors).map((advisor) => advisor.leverage));
  const laborCompletionKind = getRouteCompletionKind(state.routes.labor_coalition);
  const civicHistory =
    laborCompletionKind === "normal" ||
    laborCompletionKind === "reconciled" ||
    state.endingContributors.includes("public_testimony");
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
  return { eligible: observations.every((observation) => observation.passed), observations };
}

function activate(state: GameState): void {
  const civic = evaluateCivicLegacy(state);
  if (!civic.observations.find((observation) => observation.id === "corporation_access_safe")?.passed) {
    endRun(state, makeEnding("corporate_capture", "The Corporation held the decisive access point."));
    return;
  }
  if (civic.eligible) {
    endRun(state, makeEnding("civic_legacy", "The project remained under durable public control."));
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
      if (observation.id === "no_emergency_rule") return "emergency rule remained active";
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

function evaluateTerminalState(state: GameState): void {
  if (state.corporation.progress >= 100) {
    endRun(state, makeEnding("corporate_capture", "The Corporation completed its objective first."));
  } else if (state.pressures.panic >= 100) {
    endRun(state, makeEnding("state_collapse", "Public Panic reached the breaking point."));
  } else if (state.institutions <= 0) {
    endRun(state, makeEnding("state_collapse", "Institutions could no longer sustain the state."));
  } else if (Object.values(state.advisors).every((advisor) => !advisor.active)) {
    endRun(state, makeEnding("state_collapse", "No advisor remained willing to operate the government."));
  }
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
  const playerResult = applyPlayerAction(next, action);
  const commitmentLabel = next.decisionHistory.at(-1)?.summary ?? "Commitment resolved";
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
  const corporationResponded = isCorporationResponseDue(next, pressureTier);
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
