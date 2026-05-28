export interface Resources {
  money: number;
  influence: number;
  intel: number;
  trust: number;
  stress: number;
  panic: number;
}

export interface BRBTracks {
  engineering: number;
  access: number;
  legitimacy: number;
  stability: number;
}

export interface CPUState {
  progress: number;
  shield: number;
  pressure: number;
  nextMoveReduced: boolean;
  lastMove: string | null;
}

export type AdvisorId = 'operator' | 'fixer' | 'analyst';

export type AdvisorStateLabel =
  | 'Reliable'
  | 'Useful'
  | 'Ambitious'
  | 'Alienated'
  | 'Dangerous'
  | 'Kingmaker'
  | 'Rival Power Center';

export interface AdvisorRuntimeState {
  loyalty: number;
  alignment: number;
  leverage: number;
  loyaltyCeiling: number;
  cooperationBought: boolean;
}

export interface AdvisorDef {
  id: AdvisorId;
  name: string;
  role: string;
  quote: string;
  rival: AdvisorId;
  startingLoyalty: number;
  startingAlignment: number;
  startingLeverage: number;
  startingCeiling: number;
}

export interface ResourceCost {
  money?: number;
  influence?: number;
  intel?: number;
  trust?: number;
  stress?: number;
  panic?: number;
  [key: string]: number | undefined;
}

export interface ResourceEffect {
  money?: number;
  influence?: number;
  intel?: number;
  trust?: number;
  stress?: number;
  panic?: number;
  engineering?: number;
  access?: number;
  legitimacy?: number;
  stability?: number;
}

export interface AdvisorEffect {
  advisorId: AdvisorId;
  loyalty?: number;
  alignment?: number;
  leverage?: number;
}

export interface ActionDef {
  id: string;
  advisorId: AdvisorId;
  name: string;
  description: string;
  cost: ResourceCost;
  resourceEffect: ResourceEffect;
  advisorEffects: AdvisorEffect[];
  cpuProgressDelta?: number;
  cpuShieldDelta?: number;
  reducesNextFixer?: boolean;
  reducesNextCPU?: boolean;
  targetAdvisorCooperation?: boolean;
}

export interface DepositDef {
  id: string;
  name: string;
  description: string;
  cost: ResourceCost;
  resourceEffect: ResourceEffect;
  advisorEffects: AdvisorEffect[];
}

export interface RecoveryActionDef {
  id: string;
  name: string;
  description: string;
  resourceEffect: ResourceEffect;
  advisorEffects: AdvisorEffect[];
  cpuProgressDelta?: number;
}

export interface ArchetypeDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  resourceModifiers: Partial<Resources>;
  brbModifiers: Partial<BRBTracks>;
  advisorModifiers: Partial<Record<AdvisorId, Partial<AdvisorRuntimeState>>>;
}

export interface RandomEventDef {
  id: string;
  title: string;
  narrative: string;
  triggerCondition: (state: GameState) => boolean;
  weight: number;
  resourceEffect: ResourceEffect;
  advisorEffects: AdvisorEffect[];
  cpuProgressDelta?: number;
}

export interface LogEntry {
  id: number;
  turn: number;
  text: string;
  type: 'player' | 'cpu' | 'event' | 'system';
}

export type EndingType =
  | 'Controlled Activation'
  | 'Dirty Victory'
  | 'Catastrophic Misfire'
  | 'Coup Button'
  | 'Panic Mandate'
  | 'Corporate Capture'
  | 'Cold Stalemate'
  | 'The Crowd Pressed It'
  | 'Mental Collapse'
  | 'Mass Panic'
  | 'Financial Ruin'
  | 'Council Collapse';

export interface GameOverResult {
  type: EndingType;
  title: string;
  flavor: string;
  isVictory: boolean;
}

export type GamePhase = 'start' | 'playing' | 'gameOver';

export type ActionTab = 'advisor' | 'deposit' | 'recovery';

export interface GameState {
  turn: number;
  phase: GamePhase;
  archetypeId: string | null;
  resources: Resources;
  brb: BRBTracks;
  cpu: CPUState;
  advisors: Record<AdvisorId, AdvisorRuntimeState>;
  eventLog: LogEntry[];
  activeEvent: RandomEventDef | null;
  gameOver: GameOverResult | null;
  turnActionTaken: boolean;
  nextFixerRiskReduced: boolean;
  nextCPUReduced: boolean;
  logIdCounter: number;
  turnsSinceDecay: number;
}
