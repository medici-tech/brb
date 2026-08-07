import type { PersistentRoomMarks } from "@/components/brb/narrative/sceneTypes";
import type { RoomLighting } from "@/components/brb/pixel-room/roomTypes";
import type {
  BrbVisualStage,
  LitStation,
  PaperLoad,
  PresentationInputs,
  PresentationShot,
  PresentationState,
  PresentationTempo,
  StaffLayout,
} from "./presentationStateResolver";

export type PresentationFixtureId =
  | "calm-early"
  | "strained-mid"
  | "crisis-situation"
  | "corporate-embedded"
  | "institutions-breached"
  | "brb-infrastructure"
  | "brb-construction"
  | "brb-unstable"
  | "brb-activation"
  | "consult-analyst"
  | "ending-civic"
  | "worst-case-audit";

/**
 * Player-observable fields the resolver must produce for a fixture.
 * The preview readout and tests both read this — never hand-build a model.
 */
export type PresentationFixtureContract = {
  state: PresentationState;
  shot: PresentationShot;
  tempo: PresentationTempo;
  staffMode: StaffLayout["mode"];
  paperLoad: PaperLoad;
  brbStage: BrbVisualStage;
  litStation: LitStation;
  lighting: RoomLighting;
};

export type PresentationFixture = {
  id: PresentationFixtureId;
  label: string;
  summary: string;
  inputs: PresentationInputs;
  hasActiveSituation: boolean;
  expected: PresentationFixtureContract;
  notes?: string;
};

function baseInputs(
  overrides: Partial<PresentationInputs> = {},
): PresentationInputs {
  return {
    stress: 12,
    panic: 8,
    institutions: 60,
    corporationProgress: 8,
    corporationThreat: 15,
    brbProgress: 0,
    activeSituationType: null,
    phase: "briefing",
    turn: 1,
    consultedAdvisorId: null,
    pendingCommitment: false,
    pendingMilestone: false,
    ending: null,
    takeoverAdvisors: [],
    ...overrides,
  };
}

function roomMarks(
  overrides: Partial<PersistentRoomMarks> = {},
): PersistentRoomMarks {
  return {
    emergencyLevel: "routine",
    institutionalCondition: "secure",
    corporationPresence: "distant",
    brbConstruction: "sealed",
    departedAdvisors: [],
    completedRouteCount: 0,
    ...overrides,
  };
}

/**
 * Named, reachable presentation looks. Each entry is `PresentationInputs` only —
 * always run through `resolvePresentationModel` before rendering.
 */
export const PRESENTATION_FIXTURES: readonly PresentationFixture[] = [
  {
    id: "calm-early",
    label: "Calm · early campaign",
    summary: "Baseline operations: sparse paper, sealed BRB, full staff, ambient tempo.",
    inputs: baseInputs({
      persistentRoomMarks: roomMarks(),
    }),
    hasActiveSituation: false,
    expected: {
      state: "calm",
      shot: "operations",
      tempo: "ambient",
      staffMode: "full",
      paperLoad: "sparse",
      brbStage: "sealed",
      litStation: null,
      lighting: "calm",
    },
  },
  {
    id: "strained-mid",
    label: "Strained · mid pressure",
    summary: "Stress and panic at the strained thresholds; working paper load.",
    inputs: baseInputs({
      stress: 50,
      panic: 50,
      turn: 4,
      persistentRoomMarks: roomMarks({ emergencyLevel: "strained" }),
    }),
    hasActiveSituation: false,
    expected: {
      state: "strained",
      shot: "operations",
      tempo: "ambient",
      staffMode: "full",
      paperLoad: "working",
      brbStage: "sealed",
      litStation: null,
      lighting: "strained",
    },
  },
  {
    id: "crisis-situation",
    label: "Crisis · active Situation",
    summary: "Crisis Situation file open: situation shot, reading tempo, operations station lit.",
    inputs: baseInputs({
      stress: 80,
      activeSituationType: "crisis",
      turn: 5,
      persistentRoomMarks: roomMarks({ emergencyLevel: "critical" }),
    }),
    hasActiveSituation: true,
    expected: {
      state: "crisis",
      shot: "situation",
      tempo: "reading",
      staffMode: "reduced",
      paperLoad: "working",
      brbStage: "sealed",
      litStation: "operations",
      lighting: "crisis",
    },
  },
  {
    id: "corporate-embedded",
    label: "Corporate · embedded",
    summary: "Encroachment grade with Corporation presence embedded in the annex.",
    inputs: baseInputs({
      corporationProgress: 60,
      turn: 6,
      persistentRoomMarks: roomMarks({
        emergencyLevel: "strained",
        corporationPresence: "embedded",
      }),
    }),
    hasActiveSituation: false,
    expected: {
      state: "corporate-encroachment",
      shot: "operations",
      tempo: "ambient",
      staffMode: "full",
      paperLoad: "working",
      brbStage: "sealed",
      litStation: null,
      lighting: "strained",
    },
  },
  {
    id: "institutions-breached",
    label: "Institutions · breached",
    summary: "Institutional failure with structural damage layers; skeleton staff.",
    inputs: baseInputs({
      institutions: 18,
      turn: 8,
      persistentRoomMarks: roomMarks({
        emergencyLevel: "critical",
        institutionalCondition: "breached",
      }),
    }),
    hasActiveSituation: false,
    expected: {
      state: "institutional-failure",
      shot: "operations",
      tempo: "critical",
      staffMode: "skeleton",
      paperLoad: "working",
      brbStage: "sealed",
      litStation: null,
      lighting: "failure",
    },
  },
  {
    id: "brb-infrastructure",
    label: "BRB · infrastructure",
    summary: "First machinery stage at 25% readiness; still calm otherwise.",
    inputs: baseInputs({
      brbProgress: 25,
      persistentRoomMarks: roomMarks({ brbConstruction: "framed" }),
    }),
    hasActiveSituation: false,
    expected: {
      state: "calm",
      shot: "operations",
      tempo: "ambient",
      staffMode: "full",
      paperLoad: "sparse",
      brbStage: "infrastructure",
      litStation: null,
      lighting: "calm",
    },
  },
  {
    id: "brb-construction",
    label: "BRB · construction",
    summary: "50% readiness crosses the strained BRB threshold and the construction stage.",
    inputs: baseInputs({
      brbProgress: 50,
      persistentRoomMarks: roomMarks({
        emergencyLevel: "strained",
        brbConstruction: "active",
      }),
    }),
    hasActiveSituation: false,
    expected: {
      state: "strained",
      shot: "operations",
      tempo: "ambient",
      staffMode: "full",
      paperLoad: "sparse",
      brbStage: "construction",
      litStation: null,
      lighting: "strained",
    },
  },
  {
    id: "brb-unstable",
    label: "BRB · unstable",
    summary: "75% readiness: unstable machinery stage under strained grade.",
    inputs: baseInputs({
      brbProgress: 75,
      persistentRoomMarks: roomMarks({
        emergencyLevel: "strained",
        brbConstruction: "unstable",
      }),
    }),
    hasActiveSituation: false,
    expected: {
      state: "strained",
      shot: "operations",
      tempo: "ambient",
      staffMode: "full",
      paperLoad: "sparse",
      brbStage: "unstable",
      litStation: null,
      lighting: "strained",
    },
  },
  {
    id: "brb-activation",
    label: "BRB · activation-ready",
    summary: "100% readiness: activation bank lit; still strained from BRB progress.",
    inputs: baseInputs({
      brbProgress: 100,
      persistentRoomMarks: roomMarks({
        emergencyLevel: "strained",
        brbConstruction: "ready",
      }),
    }),
    hasActiveSituation: false,
    expected: {
      state: "strained",
      shot: "operations",
      tempo: "ambient",
      staffMode: "full",
      paperLoad: "sparse",
      brbStage: "activation-ready",
      litStation: null,
      lighting: "strained",
    },
  },
  {
    id: "consult-analyst",
    label: "Consultation · Analyst",
    summary: "Consulted Analyst: consultation shot, reading tempo, analysis station lit.",
    inputs: baseInputs({
      phase: "consulted",
      consultedAdvisorId: "analyst",
      persistentRoomMarks: roomMarks(),
    }),
    hasActiveSituation: false,
    expected: {
      state: "calm",
      shot: "consultation",
      tempo: "reading",
      staffMode: "full",
      paperLoad: "sparse",
      brbStage: "sealed",
      litStation: "analysis",
      lighting: "calm",
    },
  },
  {
    id: "ending-civic",
    label: "Ending · Civic Legacy",
    summary: "Victory tableau: ending shot, still tempo; lighting follows campaign state.",
    inputs: baseInputs({
      ending: "civic_legacy",
      brbProgress: 100,
      persistentRoomMarks: roomMarks({
        emergencyLevel: "strained",
        brbConstruction: "ready",
      }),
    }),
    hasActiveSituation: false,
    expected: {
      // brbProgress 100 still strains the room; civic_legacy does not override lighting.
      state: "strained",
      shot: "ending",
      tempo: "still",
      staffMode: "full",
      paperLoad: "sparse",
      brbStage: "activation-ready",
      litStation: null,
      lighting: "strained",
    },
  },
  {
    id: "worst-case-audit",
    label: "Worst case · audit recomposition",
    summary:
      "Saturated paper, breached structure, embedded Corporation, unstable BRB — crisis path.",
    inputs: baseInputs({
      stress: 80,
      institutions: 40,
      corporationProgress: 55,
      brbProgress: 75,
      turn: 16,
      activeSituationType: "crisis",
      persistentRoomMarks: roomMarks({
        emergencyLevel: "critical",
        institutionalCondition: "breached",
        corporationPresence: "embedded",
        brbConstruction: "unstable",
      }),
    }),
    hasActiveSituation: true,
    notes:
      "Reachable resolver coupling: crisis yields reduced staff (the 2026-08-06 audit recomposition forced full occupancy). Shared toolbox/safe/server artKeys still carry multiple meanings (audit P1) — states may look samey until that curation lands.",
    expected: {
      state: "crisis",
      shot: "situation",
      tempo: "reading",
      staffMode: "reduced",
      paperLoad: "saturated",
      brbStage: "unstable",
      litStation: "operations",
      lighting: "crisis",
    },
  },
] as const;

const FIXTURE_BY_ID: ReadonlyMap<PresentationFixtureId, PresentationFixture> =
  new Map(PRESENTATION_FIXTURES.map((fixture) => [fixture.id, fixture]));

export function listPresentationFixtures(): readonly PresentationFixture[] {
  return PRESENTATION_FIXTURES;
}

export function getPresentationFixture(
  id: PresentationFixtureId,
): PresentationFixture {
  const fixture = FIXTURE_BY_ID.get(id);
  if (!fixture) {
    throw new Error(`Unknown presentation fixture: ${id}`);
  }
  return fixture;
}
