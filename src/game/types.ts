export const RESOURCE_KEYS = [
  "money",
  "influence",
  "intelligence",
  "trust",
  "capacity",
] as const;

export const TRACK_KEYS = [
  "engineering",
  "access",
  "legitimacy",
  "stability",
] as const;

export const ADVISOR_IDS = ["analyst", "fixer", "steward"] as const;

export const CARD_TYPES = ["crisis", "advisor", "corporation"] as const;
export const CARD_RARITIES = ["common", "rare"] as const;
export const ECHO_TYPES = ["card", "relationship", "system", "ending"] as const;
export const ROUTE_IDS = ["labor_coalition", "corporate_exposure"] as const;

export type ResourceKey = (typeof RESOURCE_KEYS)[number];
export type TrackKey = (typeof TRACK_KEYS)[number];
export type CardType = (typeof CARD_TYPES)[number];
export type CardRarity = (typeof CARD_RARITIES)[number];
export type EchoType = (typeof ECHO_TYPES)[number];
export type RouteId = (typeof ROUTE_IDS)[number];
export type ResourcePool = Record<ResourceKey, number>;
export type TrackPool = Record<TrackKey, number>;

export type CompletionPressureTier = "quiet" | "watched" | "contested" | "severe" | "critical";
export type PanicAuditSource = "action_or_card" | "corporation_response" | "base_pressure" | "completion_pressure";
export type CampaignLengthBucket =
  | "under_1_year"
  | "year_2"
  | "years_3_to_5"
  | "years_6_to_10"
  | "over_10_years";
export type ActivationFailureReason =
  | "activated"
  | "activation_corporate_capture"
  | "tracks_never_ready"
  | "panic_before_activation"
  | "institutions_before_activation"
  | "advisors_before_activation"
  | "corporation_capture_before_activation"
  | "corporation_unsafe_before_activation"
  | "strategy_delayed_after_readiness";

export type PressurePool = {
  stress: number;
  panic: number;
};

export type AdvisorId = (typeof ADVISOR_IDS)[number];
export type ArchetypeId = "technocrat" | "populist" | "operator";
export type CorporationStrategy =
  | "expanding"
  | "infiltrating"
  | "discrediting"
  | "buying_influence";

export type ActionCategory =
  | "deposit"
  | "card"
  | "counter"
  | "faction"
  | "advisor"
  | "recover"
  | "institutions"
  | "activate";

export type AdvisorDefinition = {
  id: AdvisorId;
  name: string;
  specialty: string;
  agenda: ActionCategory[];
  crisisSpecialty: CorporationStrategy;
  baseCompetence: number;
  loyaltyCeiling: number;
  loyaltyBreakingPoint: number;
  bias: string;
};

export type AdvisorState = {
  loyalty: number;
  alignment: number;
  leverage: number;
  competence: number;
  active: boolean;
};

export type AdvisorDelta = Partial<
  Pick<AdvisorState, "loyalty" | "alignment" | "leverage" | "competence" | "active">
>;

export type StateDelta = {
  resources: Partial<ResourcePool>;
  pressures: Partial<PressurePool>;
  tracks: Partial<TrackPool>;
  institutions?: number;
  corporationProgress?: number;
  corporationThreat?: number;
  advisors: Partial<Record<AdvisorId, AdvisorDelta>>;
};

export type ResolvedEffect = {
  label: string;
  delta: StateDelta;
};

export type TurnResolution = {
  month: number;
  ignoredSituation: ResolvedEffect | null;
  commitment: ResolvedEffect;
  advisorReactions: ResolvedEffect | null;
  corporationResponse: ResolvedEffect | null;
  monthlyPressure: ResolvedEffect | null;
};

export type TurnBeatKind = "improvement" | "discovery" | "milestone" | "problem";

export type TurnBeat = {
  kind: TurnBeatKind;
  title: string;
  explanation: string;
  exactChanges: string[];
  linkedDecisionIds: string[];
};

export type ArchetypeDefinition = {
  id: ArchetypeId;
  name: string;
  description: string;
  resourceChanges: Partial<ResourcePool>;
  trackChanges: Partial<TrackPool>;
  advisorChanges: Partial<Record<AdvisorId, Partial<AdvisorState>>>;
  favoredCardType: CardType;
  liability: string;
  endingVariationTitle: string;
};

export type Effects = {
  resources?: Partial<ResourcePool>;
  pressures?: Partial<PressurePool>;
  tracks?: Partial<TrackPool>;
  institutions?: number;
  corporationProgress?: number;
  corporationThreat?: number;
  advisors?: Partial<Record<AdvisorId, Partial<AdvisorState>>>;
};

export type CardEcho =
  | {
      type: "card";
      hint: string;
      addCardIds?: string[];
      removeCardIds?: string[];
    }
  | {
      type: "relationship";
      hint: string;
      advisorId: AdvisorId;
      memory: string;
    }
  | {
      type: "system";
      hint: string;
      modifier: string;
    }
  | {
      type: "ending";
      hint: string;
      contributor: string;
    };

export type RouteChange = {
  routeId: RouteId;
  effect: "touch" | "open" | "advance" | "complete" | "close" | "reopen";
  stepId?: string;
  reason?: string;
};

export type SituationOutcome = {
  effects: Effects;
  echoHint: string;
  echoes: CardEcho[];
  setFlags?: string[];
  consumeFlags?: string[];
  routeChanges?: RouteChange[];
  tags?: ("opaque" | "public_betrayal")[];
};

export type SituationCardChoice = SituationOutcome & {
  id: string;
  label: string;
  costs: Partial<ResourcePool>;
};

export type CardRequirements = {
  minTurn?: number;
  maxTurn?: number;
  minTrack?: Partial<TrackPool>;
  maxResource?: Partial<ResourcePool>;
  requiredFlags?: string[];
  excludedFlags?: string[];
  requiredCorporationStrategies?: CorporationStrategy[];
};

export type SituationCard = {
  id: string;
  title: string;
  description: string;
  type: CardType;
  rarity: CardRarity;
  weight: number;
  cooldownTurns: number;
  maxPerRun: number;
  requirements?: CardRequirements;
  followUps: string[];
  choices: SituationCardChoice[];
  ignoredOutcome: SituationOutcome;
};

export type CorporationMove = {
  id: CorporationStrategy;
  name: string;
  description: string;
  effects: Effects;
};

export type EndingId =
  | "civic_legacy"
  | "compromised_activation"
  | "corporate_capture"
  | "state_collapse";

export type EndingVariationId =
  | "perfect_machine_empty_state"
  | "crowd_presses_button"
  | "government_by_command";

export type Ending = {
  id: EndingId;
  title: string;
  description: string;
  victory: boolean;
  reason: string;
  variationId: EndingVariationId | null;
  variationTitle: string | null;
};

export type Consequence = {
  turn: number;
  source: "player" | "advisor" | "corporation" | "card" | "pressure" | "system";
  message: string;
  decisionId?: string;
  causedByDecisionId?: string;
};

export type ConsultationResult = {
  advisorId: AdvisorId;
  message: string;
  predictedStrategy: CorporationStrategy;
  confidence: "low" | "medium" | "high";
  archetypeAbilityApplied: boolean;
};

export type ActionPreview = {
  actionKey: string;
  label: string;
  costs: string[];
  knownChanges: string[] | null;
  result: string;
  risk: string | null;
  delayedConsequence: string | null;
  permanent: boolean;
  disabledReason: string | null;
};

export type AdvisorRecommendation = {
  advisorId: AdvisorId;
  action: MajorAction;
  actionKey: string;
  actionLabel: string;
  rationale: string;
  warning: string;
};

export type CardEncounter = {
  cardId: string;
  turn: number;
  choiceId: string | null;
  outcomeId: string | null;
  causedByDecisionId: string | null;
  status: CardEncounterStatus;
};

export type CardEncounterStatus =
  | "presented"
  | "resolved"
  | "ignored"
  | "expired"
  | "auto_resolved"
  | "suppressed";

export type RouteStatus = "unseen" | "touched" | "open" | "closed" | "reopened" | "completed";

export type RouteTransition = {
  from: RouteStatus;
  to: RouteStatus;
  effect: RouteChange["effect"];
  decisionId: string;
  turn: number;
  stepId: string | null;
  reason: string;
};

export type RouteState = {
  status: RouteStatus;
  discoveredSteps: string[];
  touchedByDecisionId: string | null;
  touchedTurn: number | null;
  openedByDecisionId: string | null;
  openedTurn: number | null;
  closedByDecisionId: string | null;
  closedTurn: number | null;
  reopenedByDecisionId: string | null;
  reopenedTurn: number | null;
  completedByDecisionId: string | null;
  completedTurn: number | null;
  transitions: RouteTransition[];
};

export type DecisionRecord = {
  id: string;
  turn: number;
  category: ActionCategory;
  summary: string;
  cardId: string | null;
  choiceId: string | null;
  echoHints: string[];
  echoTypes: EchoType[];
  flagsCreated: string[];
  flagsConsumed: string[];
  cardsAdded: string[];
  cardsRemoved: string[];
  routesOpened: RouteId[];
  routesReopened: RouteId[];
  routesAdvanced: RouteId[];
  routesCompleted: RouteId[];
  routesClosed: RouteId[];
  endingContributors: string[];
  systemModifiers: string[];
  advisorMemories: string[];
  linkedConsequences: number;
  immediateDeltaScore: number;
  persistentImpactScore: number;
  corporationImpactScore: number;
  resourceOpportunityCost: number;
  irreversibilityScore: number;
  narrativeScore: number;
  strategicScore: number;
  finalTurningPointScore: number;
  pivotalScore: number;
};

export type PivotalDecision = {
  decisionId: string;
  turn: number;
  summary: string;
  score: number;
  echoHints: string[];
};

export type UnseenRouteHint = {
  routeId: RouteId | null;
  label: string;
  message: string;
  visibility: "classified" | "partial";
};

export type DeclassifiedReport = {
  rulesVersion: number;
  runId: string;
  seed: number;
  archetypeId: ArchetypeId;
  ending: Ending;
  pivotalDecision: PivotalDecision;
  narrativePivot: PivotalDecision;
  strategicPivot: PivotalDecision;
  finalTurningPoint: PivotalDecision;
  completedRoute: RouteId | null;
  unseenRouteHint: UnseenRouteHint;
  suggestedExperiment: string;
  finalSnapshot: ReportFinalSnapshot | null;
};

export type ReportFinalSnapshot = {
  resources: ResourcePool;
  pressures: PressurePool;
  tracks: TrackPool;
  institutions: number;
  corporation: {
    progress: number;
    threat: number;
  };
  advisors: Record<
    AdvisorId,
    Pick<AdvisorState, "active" | "alignment" | "loyalty" | "leverage">
  >;
};

export type DeckState = {
  drawCounts: Record<string, number>;
  lastDrawnTurn: Record<string, number>;
  addedCardIds: string[];
  removedCardIds: string[];
  cardSources: Record<string, string>;
};

export type MeterAudit = {
  before: number;
  after: number;
  actionOrCard: number;
  corporationResponse: number;
  basePressure: number;
  completionPressure: number;
};

export type MonthAudit = {
  month: number;
  pressureTier: CompletionPressureTier;
  corporationResponseIntervalMonths: number;
  corporationResponded: boolean;
  corporationProgress: MeterAudit;
  panic: MeterAudit;
};

export type CorporationThreatTier = "monitored" | "mobilized" | "aggressive" | "critical";

export type CorporationPressure = {
  tier: CorporationThreatTier;
  severityMultiplier: number;
  intervalModifierMonths: number;
  baseResponseIntervalMonths: number;
  responseIntervalMonths: number;
  nextResponseMonth: number;
  monthsUntilResponse: number;
};

export type GameState = {
  version: 4;
  runId: string;
  seed: number;
  rngState: number;
  turn: number;
  phase: "briefing" | "consulted" | "ended";
  archetypeId: ArchetypeId;
  experiment: string | null;
  resources: ResourcePool;
  deposited: ResourcePool;
  pressures: PressurePool;
  tracks: TrackPool;
  institutions: number;
  advisors: Record<AdvisorId, AdvisorState>;
  advisorMemories: Record<AdvisorId, string[]>;
  corporation: {
    strategy: CorporationStrategy;
    progress: number;
    threat: number;
    lastMove: CorporationStrategy | null;
    lastResponseMonth: number;
  };
  lastMonthAudit: MonthAudit | null;
  lastTurnResolution: TurnResolution | null;
  activeCardId: string | null;
  deck: DeckState;
  cardHistory: CardEncounter[];
  decisionHistory: DecisionRecord[];
  routes: Record<RouteId, RouteState>;
  flags: string[];
  systemModifiers: string[];
  endingContributors: string[];
  archetypeAbilityUsed: boolean;
  suppressNextIgnoredCard: boolean;
  consultation: ConsultationResult | null;
  history: Consequence[];
  ending: Ending | null;
  report: DeclassifiedReport | null;
};

export type CreateGameOptions = {
  seed: number;
  archetypeId?: ArchetypeId;
  runId?: string;
  experiment?: string;
};

export type DepositAction = {
  type: "deposit";
  track: TrackKey;
  size: "standard" | "large";
};

export type MajorAction =
  | DepositAction
  | { type: "resolve_card"; choiceId: string }
  | { type: "counter_corporation"; predictedStrategy: CorporationStrategy }
  | { type: "strengthen_faction" }
  | { type: "manage_advisor"; advisorId: AdvisorId }
  | { type: "recover_resource"; resource: ResourceKey }
  | { type: "protect_institutions" }
  | { type: "activate_brb" };

export type CommitOptions = {
  confirmCardAbandonment?: boolean;
};

export type ActionResult = {
  state: GameState;
  accepted: boolean;
  error?: string;
};

export type ArchiveCardRecord = {
  encounters: number;
  choices: Record<string, number>;
  outcomes: string[];
};

export type ArchiveRouteRecord = {
  highestStep: number;
  completed: boolean;
};

export type ArchiveV0 = {
  version: 0;
  processedRunIds: string[];
  cards: Record<string, ArchiveCardRecord>;
  endings: Partial<Record<EndingId, number>>;
  routes: Record<RouteId, ArchiveRouteRecord>;
};

export type ReplayIntent = {
  mode: "same_seed" | "fresh_seed";
  seed: number;
  archetypeId: ArchetypeId;
  experiment: string;
};

export type {
  BotId,
  BotMonthTrace,
  CivicLegacyEvaluation,
  CivicRequirementId,
  CivicRequirementObservation,
  ClosestAttemptTrace,
  EndingFunnel,
  EndingFunnelStage,
  LongestCampaignTrace,
  SimulationOptions,
  SimulationReport,
} from "./simulation-types";
