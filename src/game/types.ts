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

export type PressurePool = {
  stress: number;
  panic: number;
};

export type AdvisorId = "analyst" | "fixer" | "steward";
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
  breakingPoint: number;
  bias: string;
};

export type AdvisorState = {
  loyalty: number;
  alignment: number;
  leverage: number;
  competence: number;
  active: boolean;
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
  effect: "open" | "advance" | "complete" | "close";
  stepId?: string;
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

export type CardEncounter = {
  cardId: string;
  turn: number;
  choiceId: string | null;
  outcomeId: string | null;
  causedByDecisionId: string | null;
};

export type RouteStatus = "unknown" | "opened" | "completed" | "closed";

export type RouteState = {
  status: RouteStatus;
  discoveredSteps: string[];
  openedByDecisionId: string | null;
  closedByDecisionId: string | null;
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
  routesAdvanced: RouteId[];
  routesCompleted: RouteId[];
  routesClosed: RouteId[];
  endingContributors: string[];
  systemModifiers: string[];
  advisorMemories: string[];
  linkedConsequences: number;
  immediateDeltaScore: number;
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
  runId: string;
  seed: number;
  archetypeId: ArchetypeId;
  ending: Ending;
  pivotalDecision: PivotalDecision;
  completedRoute: RouteId | null;
  unseenRouteHint: UnseenRouteHint;
  suggestedExperiment: string;
};

export type DeckState = {
  drawCounts: Record<string, number>;
  lastDrawnTurn: Record<string, number>;
  addedCardIds: string[];
  removedCardIds: string[];
  cardSources: Record<string, string>;
};

export type GameState = {
  version: 2;
  runId: string;
  seed: number;
  rngState: number;
  turn: number;
  maxTurns: number;
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
  };
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
  maxTurns?: number;
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

export type BotId = "balanced" | "rush" | "defensive";

export type SimulationOptions = {
  runs: number;
  seed: number;
  bots?: BotId[];
  archetypes?: ArchetypeId[];
};

export type SimulationReport = {
  runs: number;
  endings: Record<EndingId, number>;
  endingVariations: Record<EndingVariationId, number>;
  victories: number;
  averageTurns: number;
  actionUsage: Record<ActionCategory, number>;
  cardDrawsByType: Record<CardType, number>;
  cardDrawsByRarity: Record<CardRarity, number>;
  echoCategories: Record<EchoType, number>;
  routesTouched: Record<RouteId, number>;
  routesOpened: Record<RouteId, number>;
  chainsStarted: Record<RouteId, number>;
  chainsCompleted: Record<RouteId, number>;
  routesClosed: Record<RouteId, number>;
  pivotalDecisionCategories: Record<ActionCategory, number>;
  endingContributorCounts: Record<string, number>;
  advisorConsultations: Record<AdvisorId, number>;
  averageFinalLeverage: Record<AdvisorId, number>;
  advisorDepartures: number;
  byBot: Record<BotId, { runs: number; victories: number }>;
  byArchetype: Record<ArchetypeId, { runs: number; victories: number }>;
};
