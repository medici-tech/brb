import type {
  ActionCategory,
  ActivationFailureReason,
  AdvisorId,
  ArchetypeId,
  CampaignLengthBucket,
  CardEncounterStatus,
  CardRarity,
  CardType,
  CompletionPressureTier,
  EchoType,
  EndingId,
  EndingVariationId,
  MajorAction,
  LegacyDirectiveId,
  MonthAudit,
  PanicAuditSource,
  RouteId,
  RouteStatus,
  TrackPool,
} from "./types";

export type BotId =
  | "balanced"
  | "rush"
  | "defensive"
  | "fixer"
  | "institutionalist"
  | "command"
  | "coalition"
  | "engineering_first"
  | "legitimacy_first"
  | "stability_first"
  | "access_first"
  | "delayed_deposit"
  | "long_horizon";

export type CivicRequirementId =
  | "all_tracks_50"
  | "corporation_access_safe"
  | "legitimacy_75"
  | "stability_75"
  | "institutions_55"
  | "panic_below_60"
  | "leverage_below_65"
  | "no_emergency_rule"
  | "civic_history";

export type CivicRequirementObservation = {
  id: CivicRequirementId;
  label: string;
  passed: boolean;
  actual: number | boolean | string;
  target: string;
};

export type CivicLegacyEvaluation = {
  eligible: boolean;
  observations: CivicRequirementObservation[];
};

export type EndingFunnelStage = {
  id: string;
  label: string;
  entered: number;
  passed: number;
  dropped: number;
};

export type BotMonthTrace = {
  month: number;
  activeCardId: string | null;
  consultationAdvisorId: AdvisorId | null;
  action: MajorAction;
  confirmedCardAbandonment: boolean;
  abandonedCardId: string | null;
  tracks: TrackPool;
  corporationProgress: number;
  institutions: number;
  panic: number;
  highestLeverage: number;
  laborCoalitionStatus: RouteStatus;
  audit: MonthAudit;
};

export type ClosestAttemptTrace = {
  botId: "institutionalist";
  runIndex: number;
  seed: number;
  archetypeId: ArchetypeId;
  endingId: EndingId;
  matchedRequirements: number;
  totalRequirements: number;
  deficitScore: number;
  firstFailedStageId: string;
  observations: CivicRequirementObservation[];
  months: BotMonthTrace[];
};

export type LongestCampaignTrace = {
  runIndex: number;
  seed: number;
  botId: BotId;
  archetypeId: ArchetypeId;
  ending: EndingId;
  monthsSurvived: number;
  finalCorporationProgress: number;
  finalPanic: number;
  finalInstitutions: number;
  finalTracks: TrackPool;
  months: BotMonthTrace[];
};

export type EndingFunnel = {
  candidates: number;
  stages: EndingFunnelStage[];
  completions: number;
  closestAttempt?: ClosestAttemptTrace;
};

export type SimulationOptions = {
  runs: number;
  seed: number;
  bots?: BotId[];
  archetypes?: ArchetypeId[];
  legacyDirectiveId?: LegacyDirectiveId | null;
};

export type SimulationReport = {
  runs: number;
  seed: number;
  legacyDirectiveId: LegacyDirectiveId | null;
  endings: Record<EndingId, number>;
  endingVariations: Record<EndingVariationId, number>;
  victories: number;
  averageMonths: number;
  outcomeSummary: {
    activations: number;
    activationRate: number;
    collapseRate: number;
    corporateCaptureRate: number;
    premiumEndings: number;
    premiumEndingRate: number;
  };
  cardTempo: {
    presentedPerRun: number;
    activelyResolvedPerRun: number;
    ignoredPerRun: number;
  };
  campaignLength: {
    min: number;
    p25: number;
    median: number;
    p75: number;
    p90: number;
    p95: number;
    max: number;
    exceeding5Years: number;
    exceeding10Years: number;
  };
  longestCampaign: LongestCampaignTrace;
  corporationResponseCadence: Record<CompletionPressureTier, number>;
  outcomeByStrategy: Record<BotId, { runs: number; endings: Record<EndingId, number> }>;
  panicSources: Record<PanicAuditSource, {
    gained: number;
    reduced: number;
    net: number;
    netPerMonth: number;
  }>;
  meterGainByPressureTier: Record<CompletionPressureTier, {
    months: number;
    corporationResponses: number;
    corporationResponseRate: number;
    corporationGain: number;
    corporationGainPerMonth: number;
    corporationNet: number;
    corporationNetPerMonth: number;
    panicGain: number;
    panicGainPerMonth: number;
    panicNet: number;
    panicNetPerMonth: number;
  }>;
  monthsByPressureTier: Record<CompletionPressureTier, {
    months: number;
    perRun: number;
    sharePercent: number;
  }>;
  activationFailureReasons: Record<ActivationFailureReason, number>;
  outcomesByCampaignLength: Record<CampaignLengthBucket, {
    runs: number;
    endings: Record<EndingId, number>;
  }>;
  actionUsage: Record<ActionCategory, number>;
  cardDrawsByType: Record<CardType, number>;
  cardDrawsByRarity: Record<CardRarity, number>;
  echoCategories: Record<EchoType, number>;
  routesTouched: Record<RouteId, number>;
  routesOpened: Record<RouteId, number>;
  routesReopened: Record<RouteId, number>;
  chainsStarted: Record<RouteId, number>;
  chainsCompleted: Record<RouteId, number>;
  normalCompletions: Record<RouteId, number>;
  reconciledCompletions: Record<RouteId, number>;
  invalidCompletions: Record<RouteId, number>;
  openUnfinished: Record<RouteId, number>;
  closedPermanently: Record<RouteId, number>;
  routesClosed: Record<RouteId, number>;
  cardEncounterStatuses: Record<CardEncounterStatus, number>;
  cardChoiceSelections: Record<string, Record<string, number>>;
  pivotalDecisionCategories: Record<ActionCategory, number>;
  narrativePivotCategories: Record<ActionCategory, number>;
  strategicPivotCategories: Record<ActionCategory, number>;
  finalTurningPointCategories: Record<ActionCategory, number>;
  endingFunnels: Record<"civic_legacy" | "government_by_command", EndingFunnel>;
  endingContributorCounts: Record<string, number>;
  advisorConsultations: Record<AdvisorId, number>;
  averageFinalLeverage: Record<AdvisorId, number>;
  advisorDepartures: number;
  byBot: Record<BotId, { runs: number; victories: number }>;
  byArchetype: Record<ArchetypeId, { runs: number; victories: number }>;
};
