import { ARCHETYPES, SITUATION_CARDS } from "../game/content";
import {
  ADVISOR_IDS,
  CORPORATION_STRATEGIES,
  ENDING_IDS,
  LEGACY_DIRECTIVE_IDS,
  RESOURCE_KEYS,
  TRACK_KEYS,
} from "../game/types";
import {
  isBoolean,
  isInteger,
  isNonEmptyString,
  isNullableString,
  isOneOf,
  isRecord,
  isString,
  isStringArray,
  type UnknownRecord,
} from "../game/validation-primitives";
import { PLAYTEST_BUILD_ID, PLAYTEST_JOURNAL_VERSION } from "./types";
import type {
  PlaytestActionStep,
  PlaytestJournalV2,
  PlaytestRunEntry,
} from "./types";

/**
 * Assert-style validation, following `src/game/game-persistence.ts` rather than
 * the boolean predicate this module used to carry. The journal is now the input
 * format of `npm run replay`, so a half-valid step log is worse than no journal
 * at all: it would produce a divergence report that says nothing about the
 * engine. Callers decide whether a failure throws or degrades.
 */

const RUN_KINDS = ["primary", "replay"] as const;
const RUN_STATUSES = ["active", "completed", "abandoned"] as const;
const MARKER_LOCATIONS = ["campaign", "report"] as const;
const GAME_PHASES = ["briefing", "consulted", "ended"] as const;
const ARCHETYPE_IDS = Object.keys(ARCHETYPES);
const CHOICE_IDS = SITUATION_CARDS.flatMap((card) => card.choices.map((choice) => choice.id));
const CARD_IDS = SITUATION_CARDS.map((card) => card.id);

function fail(what: string): never {
  throw new Error(`Invalid playtest journal: ${what}.`);
}

function assertRecord(value: unknown, what: string): UnknownRecord {
  if (!isRecord(value)) fail(`${what} is not an object`);
  return value;
}

function isNullableOneOf(value: unknown, values: readonly string[]): boolean {
  return value === null || isOneOf(value, values);
}

/**
 * A recorded input has to be replayable verbatim, so every field the engine
 * will consume is checked against the content it must name.
 */
function assertActionStep(value: unknown, where: string): PlaytestActionStep {
  const step = assertRecord(value, `${where} step`);

  if (step.kind === "consult") {
    if (!isOneOf(step.advisorId, ADVISOR_IDS)) fail(`${where} names an unknown advisor`);
    if (!isBoolean(step.useArchetypeAbility)) fail(`${where} is missing its archetype-ability flag`);
    return step as PlaytestActionStep;
  }

  if (step.kind !== "commit") fail(`${where} has an unknown step kind`);

  const action = assertRecord(step.action, `${where} action`);
  const options = assertRecord(step.options ?? {}, `${where} options`);
  for (const key of Object.keys(options)) {
    if (key !== "confirmCardAbandonment" && key !== "useLegacyDirective") {
      fail(`${where} carries an unknown commit option "${key}"`);
    }
    // Falsey flags are dropped on write; a stored `false` means the log was
    // hand-edited or written by something other than the recorder.
    if (options[key] !== true) fail(`${where} stores a non-canonical commit option "${key}"`);
  }

  switch (action.type) {
    case "deposit":
      if (!isOneOf(action.track, TRACK_KEYS)) fail(`${where} deposits into an unknown track`);
      if (!isOneOf(action.size, ["standard", "large"])) fail(`${where} has an unknown deposit size`);
      break;
    case "resolve_card":
      if (!isOneOf(action.choiceId, CHOICE_IDS)) fail(`${where} names an unknown card choice`);
      break;
    case "counter_corporation":
      if (!isOneOf(action.predictedStrategy, CORPORATION_STRATEGIES)) {
        fail(`${where} predicts an unknown Corporation strategy`);
      }
      break;
    case "manage_advisor":
      if (!isOneOf(action.advisorId, ADVISOR_IDS)) fail(`${where} manages an unknown advisor`);
      break;
    case "recover_resource":
      if (!isOneOf(action.resource, RESOURCE_KEYS)) fail(`${where} recovers an unknown resource`);
      break;
    case "strengthen_faction":
    case "protect_institutions":
    case "activate_brb":
      break;
    default:
      fail(`${where} has an unknown action type`);
  }

  return step as PlaytestActionStep;
}

function assertRun(value: unknown, index: number): PlaytestRunEntry {
  const where = `run ${index + 1}`;
  const run = assertRecord(value, where);

  if (!isNonEmptyString(run.runId)) fail(`${where} has no run ID`);
  if (!isOneOf(run.kind, RUN_KINDS)) fail(`${where} has an unknown kind`);
  if (!isOneOf(run.status, RUN_STATUSES)) fail(`${where} has an unknown status`);
  if (!isInteger(run.seed)) fail(`${where} has a non-integer seed`);
  if (!isOneOf(run.archetypeId, ARCHETYPE_IDS)) fail(`${where} has an unknown archetype`);
  if (!isNullableOneOf(run.legacyDirectiveId, LEGACY_DIRECTIVE_IDS)) fail(`${where} has an unknown Directive`);
  if (!isNullableOneOf(run.endingId, ENDING_IDS)) fail(`${where} has an unknown ending`);
  if (!isNonEmptyString(run.startedAt)) fail(`${where} has no start time`);
  if (!isNullableString(run.completedAt)) fail(`${where} has an invalid completion time`);
  if (run.months !== null && !isInteger(run.months, 0)) fail(`${where} has an invalid month count`);
  if (!isBoolean(run.replayComplete)) fail(`${where} is missing its replay-complete flag`);
  if (!isStringArray(run.cardsSeen, (card) => CARD_IDS.includes(card))) fail(`${where} lists an unknown card`);
  if (!Array.isArray(run.steps)) fail(`${where} has no step log`);

  run.steps.forEach((entry, stepIndex) => {
    const stepWhere = `${where} step ${stepIndex + 1}`;
    const record = assertRecord(entry, stepWhere);
    if (!isInteger(record.index, 1)) fail(`${stepWhere} has an invalid index`);
    assertActionStep(record.step, stepWhere);

    const after = assertRecord(record.after, `${stepWhere} checkpoint`);
    if (!isInteger(after.turn, 0)) fail(`${stepWhere} has an invalid turn`);
    if (!isInteger(after.rngState)) fail(`${stepWhere} has an invalid RNG state`);
    if (!isOneOf(after.phase, GAME_PHASES)) fail(`${stepWhere} has an unknown phase`);
    if (!isInteger(after.decisionCount, 0)) fail(`${stepWhere} has an invalid decision count`);
    if (!isNullableString(after.latestDecisionId)) fail(`${stepWhere} has an invalid decision ID`);
    if (!isNullableOneOf(after.endingId, ENDING_IDS)) fail(`${stepWhere} has an unknown ending`);
  });

  return run as unknown as PlaytestRunEntry;
}

export function assertPlaytestJournal(value: unknown): PlaytestJournalV2 {
  const journal = assertRecord(value, "journal");

  if (journal.version !== PLAYTEST_JOURNAL_VERSION) {
    fail(`unsupported version ${String(journal.version)}`);
  }
  if (journal.buildId !== PLAYTEST_BUILD_ID) fail("unrecognized build ID");
  if (!isNonEmptyString(journal.createdAt)) fail("no creation time");
  if (!isNonEmptyString(journal.updatedAt)) fail("no update time");
  if (!Array.isArray(journal.runs)) fail("no run list");
  if (!Array.isArray(journal.markers)) fail("no marker list");

  const runs = journal.runs.map(assertRun);
  const runIds = new Set(runs.map((run) => run.runId));

  journal.markers.forEach((value, index) => {
    const where = `marker ${index + 1}`;
    const marker = assertRecord(value, where);
    if (!isNonEmptyString(marker.id)) fail(`${where} has no ID`);
    if (!isNonEmptyString(marker.runId)) fail(`${where} has no run ID`);
    if (!runIds.has(marker.runId as string)) fail(`${where} points at a run the journal does not hold`);
    if (!isOneOf(marker.location, MARKER_LOCATIONS)) fail(`${where} has an unknown location`);
    if (!isNonEmptyString(marker.note)) fail(`${where} has no note`);
    if (!isNonEmptyString(marker.createdAt)) fail(`${where} has no timestamp`);
  });

  return journal as unknown as PlaytestJournalV2;
}

/**
 * Accepts either a raw journal or the exported envelope, so a file downloaded
 * from the Journal can be fed straight to `npm run replay`.
 */
export function deserializePlaytestJournal(raw: string | unknown): PlaytestJournalV2 {
  const parsed: unknown = isString(raw) ? JSON.parse(raw) : raw;
  const record = assertRecord(parsed, "payload");
  const candidate = "journal" in record ? record.journal : record;
  return assertPlaytestJournal(candidate);
}
