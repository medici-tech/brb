import type {
  AdvisorDefinition,
  ArchetypeDefinition,
  CorporationMove,
  Ending,
  EndingId,
  ResourcePool,
  TrackKey,
} from "./types";

export const BASE_RESOURCES: ResourcePool = {
  money: 48,
  influence: 42,
  intelligence: 38,
  trust: 46,
  capacity: 44,
};

export const CARD_APPEARANCE_CHANCE = 0.55;
export const DEPOSIT_PROGRESS = { standard: 25, large: 40 } as const;

export const ADVISORS: Record<AdvisorDefinition["id"], AdvisorDefinition> = {
  analyst: {
    id: "analyst",
    name: "The Analyst",
    specialty: "Forecasts and Corporation intelligence",
    agenda: ["counter", "deposit"],
    crisisSpecialty: "infiltrating",
    baseCompetence: 82,
    loyaltyCeiling: 76,
    loyaltyBreakingPoint: 24,
    bias: "Prefers precise plans even when delay is dangerous.",
  },
  fixer: {
    id: "fixer",
    name: "The Fixer",
    specialty: "Crisis control and political deals",
    agenda: ["advisor", "faction", "counter"],
    crisisSpecialty: "buying_influence",
    baseCompetence: 76,
    loyaltyCeiling: 70,
    loyaltyBreakingPoint: 20,
    bias: "Treats personal leverage as the price of effective action.",
  },
  steward: {
    id: "steward",
    name: "The Steward",
    specialty: "Public trust and institutional stability",
    agenda: ["card", "institutions", "deposit"],
    crisisSpecialty: "discrediting",
    baseCompetence: 70,
    loyaltyCeiling: 84,
    loyaltyBreakingPoint: 30,
    bias: "Rejects shortcuts that weaken legitimacy.",
  },
};

export const ARCHETYPES: Record<ArchetypeDefinition["id"], ArchetypeDefinition> = {
  technocrat: {
    id: "technocrat",
    name: "Technocrat",
    description: "Precise forecasts and technical execution, with a weaker public connection.",
    resourceChanges: { intelligence: 10, capacity: 8, trust: -8 },
    trackChanges: { engineering: 5 },
    advisorChanges: { analyst: { loyalty: 8, alignment: 8 } },
    favoredCardType: "corporation",
    liability: "Opaque choices cost 3 additional Trust.",
    endingVariationTitle: "Perfect Machine, Empty State",
  },
  populist: {
    id: "populist",
    name: "Populist",
    description: "Strong public energy with dangerous consequences when that public is betrayed.",
    resourceChanges: { trust: 12, influence: 6, intelligence: -6 },
    trackChanges: { legitimacy: 5 },
    advisorChanges: { steward: { loyalty: 6 }, fixer: { leverage: 5 } },
    favoredCardType: "crisis",
    liability: "Public betrayal choices add 5 additional Panic.",
    endingVariationTitle: "The Crowd Presses the Button",
  },
  operator: {
    id: "operator",
    name: "Operator",
    description: "Efficient crisis control bought with rapidly rising advisor leverage.",
    resourceChanges: { money: 8, influence: 8, trust: -5 },
    trackChanges: { access: 5 },
    advisorChanges: { fixer: { competence: 8, leverage: 8 } },
    favoredCardType: "advisor",
    liability: "Consultations create twice the normal leverage.",
    endingVariationTitle: "Government by Command",
  },
};

export const DEPOSIT_COSTS: Record<TrackKey, ResourcePool> = {
  engineering: { money: 10, influence: 0, intelligence: 3, trust: 0, capacity: 7 },
  access: { money: 0, influence: 9, intelligence: 7, trust: 0, capacity: 3 },
  legitimacy: { money: 0, influence: 6, intelligence: 0, trust: 10, capacity: 2 },
  stability: { money: 6, influence: 0, intelligence: 0, trust: 6, capacity: 6 },
};

export const CORPORATION_MOVES: Record<CorporationMove["id"], CorporationMove> = {
  expanding: {
    id: "expanding",
    name: "Expand",
    description: "The Corporation advances its project while the player is distracted.",
    effects: { corporationProgress: 6, corporationThreat: 2 },
  },
  infiltrating: {
    id: "infiltrating",
    name: "Infiltrate",
    description: "Insiders compromise technical capacity and intelligence.",
    effects: {
      resources: { capacity: -4, intelligence: -3 },
      corporationProgress: 4,
      corporationThreat: 5,
    },
  },
  discrediting: {
    id: "discrediting",
    name: "Discredit",
    description: "A public campaign attacks the project's legitimacy.",
    effects: {
      resources: { trust: -6 },
      pressures: { panic: 5 },
      corporationProgress: 3,
      corporationThreat: 3,
    },
  },
  buying_influence: {
    id: "buying_influence",
    name: "Buy Influence",
    description: "The Corporation buys allies and makes the coalition expensive to hold.",
    effects: {
      resources: { influence: -5 },
      corporationProgress: 5,
      corporationThreat: 3,
      advisors: { fixer: { leverage: 2 } },
    },
  },
};

export const ENDING_COPY: Record<
  EndingId,
  Omit<Ending, "reason" | "variationId" | "variationTitle">
> = {
  civic_legacy: {
    id: "civic_legacy",
    title: "A Republic Still Standing",
    description: "The BRB activates under public and institutional control.",
    victory: true,
  },
  compromised_activation: {
    id: "compromised_activation",
    title: "The Necessary Regime",
    description: "The BRB activates, but the shortcuts used to finish it become permanent rule.",
    victory: true,
  },
  corporate_capture: {
    id: "corporate_capture",
    title: "Terms and Conditions",
    description: "The Corporation controls the project, its operators, or the state around it.",
    victory: false,
  },
  state_collapse: {
    id: "state_collapse",
    title: "The Project Outlived the State",
    description: "The campaign ends before the player can safely activate the BRB.",
    victory: false,
  },
  advisor_coup: {
    id: "advisor_coup",
    title: "The Indispensable Man",
    description: "One advisor's leverage over a dependent government becomes control of it.",
    victory: false,
  },
  advisor_cabal: {
    id: "advisor_cabal",
    title: "Government of Creditors",
    description: "The advisors who hold the government's debts jointly decide its policy.",
    victory: false,
  },
};

// Advisor-takeover thresholds. Departure at Leverage 90 remains the default;
// these bars decide when leverage becomes seizure instead of resignation.
// Tuned against the fixed-seed baseline — see BRB Balance Targets.
export const ADVISOR_TAKEOVER_RULES = {
  // A capped advisor (Leverage >= 90) seizes power instead of leaving when the
  // state is structurally dependent on them: weakened Institutions or no other
  // active advisor remaining.
  coupLeverageMinimum: 90,
  coupInstitutionsMaximum: 55,
  // Two or more active advisors at or above this Leverage jointly dominate.
  cabalMemberLeverageMinimum: 60,
} as const;
