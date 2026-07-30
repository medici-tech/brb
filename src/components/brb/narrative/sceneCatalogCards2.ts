import type {
  NarrativeSceneBeat,
  NarrativeSceneId,
  NarrativeSceneScript,
  SceneActorRole,
  SceneFacing,
  SceneMotion,
  ScenePropKind,
  SceneTone,
} from "./sceneTypes";

type Point = readonly [x: number, y: number];
type ActorPlan = readonly [
  id: string,
  role: SceneActorRole,
  label: string,
  x: number,
  y: number,
  facing: SceneFacing,
  motion: SceneMotion,
];
type PropPlan = readonly [
  id: string,
  kind: ScenePropKind,
  x: number,
  y: number,
  state?: "normal" | "active" | "damaged" | "secured" | "abandoned",
];
type BeatPlan = {
  readonly title: string;
  readonly description: string;
  readonly tone: SceneTone;
  readonly focus: Point;
  readonly actors: readonly ActorPlan[];
  readonly props?: readonly PropPlan[];
};

function buildBeat(
  id: NarrativeSceneBeat["id"],
  eyebrow: string,
  plan: BeatPlan,
): NarrativeSceneBeat {
  return {
    id,
    eyebrow,
    title: plan.title,
    description: plan.description,
    tone: plan.tone,
    focus: { x: plan.focus[0], y: plan.focus[1] },
    actors: plan.actors.map(
      ([actorId, role, label, x, y, facing, motion]) => ({
        id: actorId,
        role,
        label,
        position: { x, y },
        facing,
        motion,
      }),
    ),
    props: (plan.props ?? []).map(([propId, kind, x, y, state]) => ({
      id: propId,
      kind,
      position: { x, y },
      ...(state ? { state } : {}),
    })),
  };
}

function cardScene(
  sourceKey: string,
  sceneId: NarrativeSceneId,
  title: string,
  plans: readonly [BeatPlan, BeatPlan, BeatPlan],
): NarrativeSceneScript {
  return {
    id: `scene-${sourceKey.replaceAll(":", "-")}`,
    sourceKey,
    sceneId,
    title,
    beats: [
      buildBeat("setup", "Setup", plans[0]),
      buildBeat("action", "Action", plans[1]),
      buildBeat("consequence", "Consequence", plans[2]),
    ],
  };
}

export const CARD_SCENE_SCRIPTS_2 = {
  "card:intelligence_leak:audit": cardScene(
    "card:intelligence_leak:audit",
    "secure-briefing",
    "The Cabinet Is Searched",
    [
      {
        title: "The leaked briefing returns to the table",
        description:
          "The Analyst places the forwarded projections between all three advisors.",
        tone: "covert",
        focus: [50, 50],
        actors: [
          ["analyst", "analyst", "The Analyst", 34, 58, "right", "address"],
          ["fixer", "fixer", "The Fixer", 64, 56, "left", "observe"],
          ["steward", "steward", "The Steward", 63, 66, "left", "observe"],
          ["director", "director", "Director", 50, 70, "up", "idle"],
        ],
        props: [["leaked-briefing", "dossier", 50, 50, "active"]],
      },
      {
        title: "Every station comes under the lens",
        description:
          "The Analyst crosses from advisor to advisor while the security feed records each search.",
        tone: "covert",
        focus: [51, 54],
        actors: [
          ["analyst", "analyst", "The Analyst", 49, 58, "right", "cross"],
          ["fixer", "fixer", "The Fixer", 69, 57, "left", "confront"],
          ["steward", "steward", "The Steward", 34, 66, "right", "confront"],
          ["director", "director", "Director", 50, 71, "up", "observe"],
        ],
        props: [
          ["advisor-files", "document-box", 51, 51, "active"],
          ["audit-feed", "monitor-bank", 50, 22, "active"],
        ],
      },
      {
        title: "The leak closes and the cabinet separates",
        description:
          "The compromised feed goes dark as the advisors retreat to opposite sides of the room.",
        tone: "institutional",
        focus: [50, 25],
        actors: [
          ["analyst", "analyst", "The Analyst", 37, 59, "left", "idle"],
          ["fixer", "fixer", "The Fixer", 76, 60, "right", "withdraw"],
          ["steward", "steward", "The Steward", 23, 66, "left", "withdraw"],
          ["director", "director", "Director", 50, 68, "up", "observe"],
        ],
        props: [
          ["closed-leak-feed", "monitor-bank", 50, 22, "secured"],
          ["advisor-files", "document-box", 51, 51, "secured"],
        ],
      },
    ],
  ),
  "card:intelligence_leak:false": cardScene(
    "card:intelligence_leak:false",
    "corporate-suite",
    "A False Plan Enters the Corporation",
    [
      {
        title: "The decoy timeline is prepared",
        description:
          "The Analyst seals false milestones inside a document box bound for the executive suite.",
        tone: "covert",
        focus: [43, 52],
        actors: [
          ["analyst", "analyst", "The Analyst", 34, 59, "right", "work"],
          ["courier", "staff", "Controlled courier", 58, 60, "left", "idle"],
          ["director", "director", "Director", 50, 70, "up", "observe"],
        ],
        props: [
          ["false-plan", "dossier", 43, 50, "secured"],
          ["decoy-box", "document-box", 52, 53, "secured"],
        ],
      },
      {
        title: "The courier crosses the private threshold",
        description:
          "The decoy box reaches a Corporation executive while BRB staff watch from the hidden feed.",
        tone: "covert",
        focus: [62, 57],
        actors: [
          ["courier", "staff", "Controlled courier", 50, 61, "right", "cross"],
          ["corporate", "corporate", "Corporation executive", 71, 59, "left", "enter"],
          ["analyst", "analyst", "The Analyst", 29, 60, "right", "observe"],
        ],
        props: [
          ["decoy-box", "document-box", 59, 53, "secured"],
          ["hidden-feed", "monitor-bank", 30, 25, "active"],
        ],
      },
      {
        title: "Executives organize around the wrong future",
        description:
          "The false timeline fills the corporate display while the real BRB channel stays concealed.",
        tone: "corporate",
        focus: [57, 26],
        actors: [
          ["corporate", "corporate", "Corporation executive", 61, 58, "up", "work"],
          ["corporate-aide", "corporate", "Operations aide", 73, 62, "left", "observe"],
          ["analyst", "analyst", "The Analyst", 27, 62, "up", "observe"],
        ],
        props: [
          ["false-timeline-feed", "monitor-bank", 57, 23, "active"],
          ["sealed-real-plan", "document-box", 28, 51, "secured"],
        ],
      },
    ],
  ),
  "card:intelligence_leak:ignored": cardScene(
    "card:intelligence_leak:ignored",
    "corporate-suite",
    "The Leak Becomes Confirmed Intelligence",
    [
      {
        title: "One corporate monitor holds the projection",
        description:
          "Executives study the forwarded briefing while the government channel remains silent.",
        tone: "corporate",
        focus: [50, 24],
        actors: [
          ["corporate", "corporate", "Corporation executive", 46, 58, "up", "observe"],
          ["operations", "corporate", "Operations aide", 64, 61, "left", "idle"],
        ],
        props: [["leaked-projection", "monitor-bank", 50, 22, "active"]],
      },
      {
        title: "The projection is copied without resistance",
        description:
          "Aides carry matching files from the monitor bank to every operating station.",
        tone: "corporate",
        focus: [55, 55],
        actors: [
          ["corporate", "corporate", "Corporation executive", 45, 58, "right", "address"],
          ["operations", "corporate", "Operations aide", 60, 59, "right", "cross"],
          ["courier", "corporate", "Internal courier", 76, 62, "right", "exit"],
        ],
        props: [
          ["leaked-projection", "monitor-bank", 50, 22, "active"],
          ["copied-briefings", "document-box", 61, 53, "active"],
        ],
      },
      {
        title: "Every screen now agrees on the target",
        description:
          "Synchronized projections and a warning beacon mark the Corporation's confirmed advantage.",
        tone: "crisis",
        focus: [50, 24],
        actors: [
          ["corporate", "corporate", "Corporation executive", 43, 58, "up", "idle"],
          ["operations", "corporate", "Operations aide", 61, 59, "up", "work"],
        ],
        props: [
          ["confirmed-intelligence", "monitor-bank", 50, 22, "active"],
          ["corporate-alert", "warning-beacon", 78, 35, "active"],
        ],
      },
    ],
  ),
  "card:regional_blackout:public": cardScene(
    "card:regional_blackout:public",
    "infrastructure-site",
    "The Public Grid Comes First",
    [
      {
        title: "One crew faces two dark systems",
        description:
          "A civic service server and the BRB generator wait on opposite sides of the failed grid.",
        tone: "crisis",
        focus: [51, 53],
        actors: [
          ["engineer", "worker", "Grid engineer", 50, 64, "up", "observe"],
          ["public-crew", "worker", "Public-service crew", 30, 63, "right", "idle"],
          ["brb-crew", "worker", "BRB systems crew", 71, 63, "left", "idle"],
          ["director", "director", "Director", 50, 73, "up", "enter"],
        ],
        props: [
          ["public-grid", "server", 30, 49, "damaged"],
          ["brb-generator", "generator", 72, 53, "normal"],
          ["blackout-beacon", "warning-beacon", 50, 35, "active"],
        ],
      },
      {
        title: "Capacity is routed toward public service",
        description:
          "The Director sends both engineers to the civic server while BRB cables remain disconnected.",
        tone: "constructive",
        focus: [31, 54],
        actors: [
          ["director", "director", "Director", 47, 68, "left", "address"],
          ["engineer", "worker", "Grid engineer", 37, 61, "left", "cross"],
          ["public-crew", "worker", "Public-service crew", 27, 60, "right", "work"],
          ["brb-crew", "worker", "BRB systems crew", 43, 64, "left", "work"],
        ],
        props: [
          ["public-grid", "server", 30, 49, "active"],
          ["brb-generator", "generator", 72, 53, "abandoned"],
        ],
      },
      {
        title: "Civic lights return before BRB",
        description:
          "The public server glows under working lights while the prototype generator stays dim.",
        tone: "public",
        focus: [30, 45],
        actors: [
          ["engineer", "worker", "Grid engineer", 33, 60, "up", "work"],
          ["public-crew", "worker", "Public-service crew", 21, 63, "right", "work"],
          ["director", "director", "Director", 48, 69, "left", "observe"],
          ["brb-crew", "worker", "BRB systems crew", 69, 64, "left", "idle"],
        ],
        props: [
          ["public-grid", "server", 30, 49, "active"],
          ["public-lights", "work-lights", 30, 24, "active"],
          ["brb-generator", "generator", 72, 53, "abandoned"],
        ],
      },
    ],
  ),
  "card:regional_blackout:project": cardScene(
    "card:regional_blackout:project",
    "infrastructure-site",
    "BRB Keeps the Power",
    [
      {
        title: "The blackout divides the switchyard",
        description:
          "Public service and the prototype compete for the same emergency connection.",
        tone: "crisis",
        focus: [51, 54],
        actors: [
          ["engineer", "worker", "Grid engineer", 50, 64, "up", "observe"],
          ["public-crew", "worker", "Public-service crew", 29, 63, "right", "idle"],
          ["brb-crew", "worker", "BRB systems crew", 71, 63, "left", "idle"],
          ["director", "director", "Director", 50, 73, "up", "enter"],
        ],
        props: [
          ["public-grid", "server", 29, 49, "damaged"],
          ["brb-generator", "generator", 72, 53, "normal"],
        ],
      },
      {
        title: "The emergency cable locks into BRB",
        description:
          "The systems crew energizes the prototype as the public-service team is ordered back.",
        tone: "crisis",
        focus: [70, 54],
        actors: [
          ["director", "director", "Director", 53, 68, "right", "address"],
          ["engineer", "worker", "Grid engineer", 64, 61, "right", "cross"],
          ["brb-crew", "worker", "BRB systems crew", 73, 61, "left", "work"],
          ["public-crew", "worker", "Public-service crew", 25, 64, "left", "withdraw"],
        ],
        props: [
          ["public-grid", "server", 29, 49, "damaged"],
          ["brb-generator", "generator", 72, 53, "active"],
        ],
      },
      {
        title: "The prototype glows over a dark region",
        description:
          "BRB work lights burn at full strength while public infrastructure disappears into blackout.",
        tone: "public",
        focus: [72, 44],
        actors: [
          ["brb-crew", "worker", "BRB systems crew", 70, 61, "up", "work"],
          ["director", "director", "Director", 54, 68, "right", "observe"],
          ["public", "public", "Darkened public district", 23, 68, "left", "withdraw"],
        ],
        props: [
          ["public-grid", "server", 29, 49, "abandoned"],
          ["brb-generator", "generator", 72, 53, "active"],
          ["brb-lights", "work-lights", 72, 24, "active"],
          ["panic-beacon", "warning-beacon", 47, 34, "active"],
        ],
      },
    ],
  ),
  "card:regional_blackout:ignored": cardScene(
    "card:regional_blackout:ignored",
    "infrastructure-site",
    "The Grid Fails Without an Order",
    [
      {
        title: "Both crews wait beside the failed transformer",
        description:
          "Public-service and BRB engineers hold position for a decision that does not arrive.",
        tone: "crisis",
        focus: [50, 56],
        actors: [
          ["public-crew", "worker", "Public-service crew", 33, 63, "right", "idle"],
          ["brb-crew", "worker", "BRB systems crew", 67, 63, "left", "idle"],
          ["dispatcher", "staff", "Grid dispatcher", 50, 67, "up", "observe"],
        ],
        props: [
          ["failed-server", "server", 33, 49, "damaged"],
          ["failed-generator", "generator", 69, 52, "damaged"],
        ],
      },
      {
        title: "The failure outruns the waiting teams",
        description:
          "Warning beacons spread across the site while every crew remains without authority.",
        tone: "crisis",
        focus: [50, 43],
        actors: [
          ["public-crew", "worker", "Public-service crew", 29, 64, "left", "withdraw"],
          ["brb-crew", "worker", "BRB systems crew", 71, 64, "right", "withdraw"],
          ["dispatcher", "staff", "Grid dispatcher", 50, 67, "up", "confront"],
        ],
        props: [
          ["failed-server", "server", 33, 49, "damaged"],
          ["failed-generator", "generator", 69, 52, "damaged"],
          ["grid-alarm-a", "warning-beacon", 43, 34, "active"],
          ["grid-alarm-b", "warning-beacon", 59, 34, "active"],
        ],
      },
      {
        title: "The entire site goes dark",
        description:
          "Abandoned systems and emergency signals become evidence of state incapacity.",
        tone: "public",
        focus: [50, 48],
        actors: [
          ["dispatcher", "staff", "Grid dispatcher", 50, 67, "down", "withdraw"],
          ["public", "public", "Stranded public", 24, 72, "right", "enter"],
        ],
        props: [
          ["failed-server", "server", 33, 49, "abandoned"],
          ["failed-generator", "generator", 69, 52, "abandoned"],
          ["grid-alarm-a", "warning-beacon", 43, 34, "active"],
          ["grid-alarm-b", "warning-beacon", 59, 34, "active"],
        ],
      },
    ],
  ),
  "card:coalition_vote:share": cardScene(
    "card:coalition_vote:share",
    "oversight-chamber",
    "Authority Is Shared",
    [
      {
        title: "The coalition brings its ballots",
        description:
          "The Steward seats delegates around the activation-authority file.",
        tone: "institutional",
        focus: [50, 53],
        actors: [
          ["steward", "steward", "The Steward", 36, 59, "right", "address"],
          ["delegate-a", "official", "Coalition delegate", 64, 56, "left", "idle"],
          ["delegate-b", "official", "Coalition delegate", 65, 66, "left", "idle"],
          ["director", "director", "Director", 50, 71, "up", "enter"],
        ],
        props: [
          ["authority-file", "dossier", 50, 51, "normal"],
          ["ballot-box", "document-box", 57, 52, "normal"],
        ],
      },
      {
        title: "The center seat opens to the coalition",
        description:
          "The Director steps aside as every delegate places a ballot around the shared file.",
        tone: "constructive",
        focus: [52, 53],
        actors: [
          ["director", "director", "Director", 34, 66, "right", "withdraw"],
          ["steward", "steward", "The Steward", 42, 59, "right", "observe"],
          ["delegate-a", "official", "Coalition delegate", 58, 57, "left", "work"],
          ["delegate-b", "official", "Coalition delegate", 58, 65, "up", "work"],
        ],
        props: [
          ["shared-authority-file", "dossier", 50, 51, "active"],
          ["ballot-box", "document-box", 55, 52, "active"],
        ],
      },
      {
        title: "A shared charter replaces unilateral control",
        description:
          "The delegates remain at the table beneath a secured institutional agreement.",
        tone: "constructive",
        focus: [50, 44],
        actors: [
          ["director", "director", "Director", 37, 65, "right", "idle"],
          ["steward", "steward", "The Steward", 43, 58, "right", "idle"],
          ["delegate-a", "official", "Coalition delegate", 59, 57, "left", "idle"],
          ["delegate-b", "official", "Coalition delegate", 60, 65, "left", "idle"],
        ],
        props: [
          ["coalition-charter", "dossier", 50, 49, "secured"],
          ["sealed-ballots", "document-box", 56, 51, "secured"],
        ],
      },
    ],
  ),
  "card:coalition_vote:pressure": cardScene(
    "card:coalition_vote:pressure",
    "oversight-chamber",
    "The Coalition Is Pressured",
    [
      {
        title: "The holdouts sit apart",
        description:
          "Coalition delegates keep their ballots closed while the Fixer watches the divided table.",
        tone: "institutional",
        focus: [57, 55],
        actors: [
          ["steward", "steward", "The Steward", 34, 60, "right", "observe"],
          ["fixer", "fixer", "The Fixer", 69, 58, "left", "idle"],
          ["holdout-a", "official", "Coalition holdout", 57, 57, "left", "idle"],
          ["holdout-b", "official", "Coalition holdout", 58, 67, "left", "idle"],
        ],
        props: [["closed-ballots", "document-box", 51, 52, "normal"]],
      },
      {
        title: "Access papers become leverage",
        description:
          "The Fixer and security close around the holdouts while their authorization files are stamped.",
        tone: "crisis",
        focus: [58, 58],
        actors: [
          ["fixer", "fixer", "The Fixer", 64, 59, "left", "confront"],
          ["security", "security", "Chamber security", 72, 64, "left", "confront"],
          ["holdout-a", "official", "Coalition holdout", 54, 57, "right", "withdraw"],
          ["holdout-b", "official", "Coalition holdout", 54, 67, "right", "withdraw"],
          ["steward", "steward", "The Steward", 31, 62, "right", "observe"],
        ],
        props: [
          ["pressure-file", "dossier", 58, 51, "active"],
          ["forced-ballots", "document-box", 51, 52, "active"],
        ],
      },
      {
        title: "The vote passes over empty chairs",
        description:
          "Stamped access papers remain as the holdouts leave and the institutional desk shows damage.",
        tone: "public",
        focus: [55, 49],
        actors: [
          ["fixer", "fixer", "The Fixer", 62, 59, "up", "idle"],
          ["security", "security", "Chamber security", 72, 64, "left", "observe"],
          ["holdout-a", "official", "Coalition holdout", 22, 70, "left", "exit"],
          ["steward", "steward", "The Steward", 31, 62, "left", "withdraw"],
        ],
        props: [
          ["forced-ballots", "document-box", 52, 52, "secured"],
          ["damaged-authority-file", "dossier", 58, 50, "damaged"],
        ],
      },
    ],
  ),
  "card:coalition_vote:ignored": cardScene(
    "card:coalition_vote:ignored",
    "oversight-chamber",
    "The Coalition Leaves the Table",
    [
      {
        title: "The Steward waits with the ballot box",
        description:
          "Coalition delegates hold their seats around an unanswered authority file.",
        tone: "institutional",
        focus: [50, 53],
        actors: [
          ["steward", "steward", "The Steward", 39, 59, "right", "idle"],
          ["delegate-a", "official", "Coalition delegate", 62, 57, "left", "idle"],
          ["delegate-b", "official", "Coalition delegate", 62, 66, "left", "idle"],
        ],
        props: [
          ["unanswered-authority", "dossier", 50, 51, "abandoned"],
          ["waiting-ballots", "document-box", 56, 52, "normal"],
        ],
      },
      {
        title: "The Steward carries the vote away",
        description:
          "With no Director present, the delegates follow the ballot box out of the chamber.",
        tone: "public",
        focus: [66, 64],
        actors: [
          ["steward", "steward", "The Steward", 62, 61, "right", "cross"],
          ["delegate-a", "official", "Coalition delegate", 72, 64, "right", "exit"],
          ["delegate-b", "official", "Coalition delegate", 68, 70, "right", "exit"],
        ],
        props: [
          ["departing-ballots", "document-box", 62, 54, "secured"],
          ["unanswered-authority", "dossier", 50, 51, "abandoned"],
        ],
      },
      {
        title: "A separate coalition begins planning",
        description:
          "The chamber table is empty while an independent map lights beyond government control.",
        tone: "crisis",
        focus: [72, 25],
        actors: [
          ["steward", "steward", "The Steward", 76, 62, "up", "address"],
          ["delegate-a", "official", "Coalition delegate", 67, 66, "up", "observe"],
          ["delegate-b", "official", "Coalition delegate", 82, 68, "up", "observe"],
        ],
        props: [
          ["coalition-map", "monitor-bank", 72, 22, "active"],
          ["abandoned-authority", "dossier", 44, 51, "abandoned"],
        ],
      },
    ],
  ),
  "card:corporate_lobby:expose": cardScene(
    "card:corporate_lobby:expose",
    "corporate-suite",
    "The Guest List Goes Public",
    [
      {
        title: "The dinner seats its private coalition",
        description:
          "Corporation executives and legislators gather around named place files.",
        tone: "corporate",
        focus: [50, 54],
        actors: [
          ["host", "corporate", "Corporation host", 38, 58, "right", "address"],
          ["executive", "corporate", "Corporation executive", 65, 57, "left", "idle"],
          ["legislator-a", "official", "Legislator", 42, 68, "right", "idle"],
          ["legislator-b", "official", "Legislator", 64, 67, "left", "idle"],
        ],
        props: [
          ["guest-list", "dossier", 50, 51, "secured"],
          ["dinner-records", "document-box", 58, 53, "normal"],
        ],
      },
      {
        title: "The guest list appears over dinner",
        description:
          "The Analyst projects every attendee as a press crew enters the executive suite.",
        tone: "public",
        focus: [50, 25],
        actors: [
          ["analyst", "analyst", "The Analyst", 30, 59, "right", "work"],
          ["press", "staff", "Press camera", 75, 63, "left", "enter"],
          ["host", "corporate", "Corporation host", 42, 58, "left", "confront"],
          ["legislator-a", "official", "Legislator", 57, 67, "right", "withdraw"],
          ["legislator-b", "official", "Legislator", 68, 67, "right", "withdraw"],
        ],
        props: [
          ["exposed-guest-list", "monitor-bank", 50, 22, "active"],
          ["guest-list", "dossier", 50, 51, "active"],
        ],
      },
      {
        title: "The table empties around the evidence",
        description:
          "Guests scatter while the public guest list and abandoned place files remain.",
        tone: "constructive",
        focus: [50, 49],
        actors: [
          ["analyst", "analyst", "The Analyst", 32, 60, "up", "observe"],
          ["press", "staff", "Press camera", 72, 63, "left", "work"],
          ["host", "corporate", "Corporation host", 82, 67, "right", "exit"],
        ],
        props: [
          ["public-evidence", "dossier", 50, 50, "secured"],
          ["exposed-guest-list", "monitor-bank", 50, 22, "active"],
        ],
      },
    ],
  ),
  "card:corporate_lobby:outbid": cardScene(
    "card:corporate_lobby:outbid",
    "corporate-suite",
    "The Fixer Runs a Counter-Lobby",
    [
      {
        title: "Corporation favors circle the table",
        description:
          "Executives offer private document boxes to legislators under the Corporation seal.",
        tone: "corporate",
        focus: [52, 54],
        actors: [
          ["host", "corporate", "Corporation host", 38, 58, "right", "address"],
          ["executive", "corporate", "Corporation executive", 65, 57, "left", "idle"],
          ["legislator-a", "official", "Legislator", 43, 68, "right", "idle"],
          ["legislator-b", "official", "Legislator", 64, 68, "left", "idle"],
          ["fixer", "fixer", "The Fixer", 22, 63, "right", "enter"],
        ],
        props: [["corporate-favors", "document-box", 52, 52, "active"]],
      },
      {
        title: "The Fixer replaces every offer",
        description:
          "Government favor boxes and rapid calls move across the table ahead of the Corporation's.",
        tone: "covert",
        focus: [48, 55],
        actors: [
          ["fixer", "fixer", "The Fixer", 43, 59, "right", "work"],
          ["host", "corporate", "Corporation host", 66, 58, "left", "confront"],
          ["legislator-a", "official", "Legislator", 48, 67, "left", "cross"],
          ["legislator-b", "official", "Legislator", 56, 68, "left", "cross"],
        ],
        props: [
          ["counter-favors", "document-box", 47, 52, "active"],
          ["fixer-ledger", "dossier", 40, 51, "secured"],
        ],
      },
      {
        title: "The votes move and the Fixer keeps the price",
        description:
          "Legislators change sides while the Corporation host retreats and the private ledger stays with the Fixer.",
        tone: "covert",
        focus: [43, 54],
        actors: [
          ["fixer", "fixer", "The Fixer", 42, 59, "up", "idle"],
          ["host", "corporate", "Corporation host", 79, 63, "right", "withdraw"],
          ["legislator-a", "official", "Legislator", 32, 67, "left", "idle"],
          ["legislator-b", "official", "Legislator", 51, 67, "left", "idle"],
        ],
        props: [
          ["spent-favors", "document-box", 50, 52, "abandoned"],
          ["fixer-ledger", "dossier", 42, 51, "secured"],
        ],
      },
    ],
  ),
  "card:corporate_lobby:ignored": cardScene(
    "card:corporate_lobby:ignored",
    "corporate-suite",
    "Dinner Becomes Committee Language",
    [
      {
        title: "The private dinner proceeds uninterrupted",
        description:
          "Executives and legislators settle around agreement folders with no opposition present.",
        tone: "corporate",
        focus: [50, 54],
        actors: [
          ["host", "corporate", "Corporation host", 38, 58, "right", "address"],
          ["executive", "corporate", "Corporation executive", 65, 58, "left", "idle"],
          ["legislator-a", "official", "Legislator", 42, 68, "right", "idle"],
          ["legislator-b", "official", "Legislator", 64, 68, "left", "idle"],
        ],
        props: [["agreement-folders", "document-box", 52, 52, "normal"]],
      },
      {
        title: "Matching folders pass around the table",
        description:
          "The host distributes identical talking points while the Corporation feed records agreement.",
        tone: "corporate",
        focus: [52, 53],
        actors: [
          ["host", "corporate", "Corporation host", 46, 59, "right", "work"],
          ["executive", "corporate", "Corporation executive", 63, 58, "left", "observe"],
          ["legislator-a", "official", "Legislator", 42, 68, "up", "work"],
          ["legislator-b", "official", "Legislator", 62, 68, "up", "work"],
        ],
        props: [
          ["distributed-folders", "document-box", 52, 52, "active"],
          ["agreement-feed", "monitor-bank", 50, 22, "active"],
        ],
      },
      {
        title: "The talking points leave for committee",
        description:
          "Legislators exit with synchronized dossiers as the Corporation progress display advances.",
        tone: "crisis",
        focus: [70, 62],
        actors: [
          ["host", "corporate", "Corporation host", 45, 59, "right", "idle"],
          ["legislator-a", "official", "Legislator", 69, 63, "right", "exit"],
          ["legislator-b", "official", "Legislator", 77, 68, "right", "exit"],
        ],
        props: [
          ["committee-folders", "document-box", 67, 55, "secured"],
          ["corporate-progress", "monitor-bank", 50, 22, "active"],
        ],
      },
    ],
  ),
  "card:emergency_powers:sign": cardScene(
    "card:emergency_powers:sign",
    "oversight-chamber",
    "Emergency Rule Is Signed",
    [
      {
        title: "The bill arrives beneath crisis alarms",
        description:
          "The Fixer places emergency authority before an empty committee and a waiting Director.",
        tone: "crisis",
        focus: [50, 53],
        actors: [
          ["fixer", "fixer", "The Fixer", 38, 59, "right", "address"],
          ["director", "director", "Director", 50, 69, "up", "observe"],
          ["committee", "official", "Committee clerk", 70, 47, "left", "withdraw"],
        ],
        props: [
          ["emergency-bill", "dossier", 50, 52, "active"],
          ["alarm", "warning-beacon", 72, 35, "active"],
        ],
      },
      {
        title: "The signature bypasses the chamber",
        description:
          "The Director stamps the bill while the committee clerk leaves and construction staff rush through.",
        tone: "crisis",
        focus: [50, 54],
        actors: [
          ["director", "director", "Director", 50, 61, "up", "work"],
          ["fixer", "fixer", "The Fixer", 38, 59, "right", "observe"],
          ["committee", "official", "Committee clerk", 79, 53, "right", "exit"],
          ["construction", "worker", "Emergency construction crew", 68, 67, "right", "cross"],
        ],
        props: [
          ["signed-bill", "dossier", 50, 52, "secured"],
          ["alarm", "warning-beacon", 72, 35, "active"],
        ],
      },
      {
        title: "Construction advances over a broken seal",
        description:
          "Emergency crews depart with the signed order as the public gallery empties and oversight fractures.",
        tone: "public",
        focus: [54, 46],
        actors: [
          ["fixer", "fixer", "The Fixer", 40, 59, "up", "idle"],
          ["director", "director", "Director", 52, 61, "up", "idle"],
          ["construction", "worker", "Emergency construction crew", 82, 68, "right", "exit"],
          ["public", "public", "Public gallery", 22, 73, "left", "withdraw"],
        ],
        props: [
          ["signed-bill", "dossier", 50, 52, "secured"],
          ["damaged-oversight", "hearing-desk", 50, 30, "damaged"],
        ],
      },
    ],
  ),
  "card:emergency_powers:veto": cardScene(
    "card:emergency_powers:veto",
    "oversight-chamber",
    "Normal Authority Holds",
    [
      {
        title: "The Fixer offers the shortcut",
        description:
          "The emergency bill sits beside the slower committee docket under warning lights.",
        tone: "crisis",
        focus: [52, 52],
        actors: [
          ["fixer", "fixer", "The Fixer", 39, 59, "right", "address"],
          ["director", "director", "Director", 54, 67, "up", "observe"],
          ["clerk", "official", "Committee clerk", 70, 49, "left", "idle"],
        ],
        props: [
          ["emergency-bill", "dossier", 48, 52, "active"],
          ["normal-docket", "document-box", 61, 51, "normal"],
        ],
      },
      {
        title: "The bill returns unsigned",
        description:
          "The Director moves emergency authority into the normal docket despite the Fixer's objection.",
        tone: "institutional",
        focus: [61, 52],
        actors: [
          ["director", "director", "Director", 55, 60, "right", "work"],
          ["fixer", "fixer", "The Fixer", 39, 59, "left", "confront"],
          ["clerk", "official", "Committee clerk", 69, 52, "left", "work"],
        ],
        props: [
          ["vetoed-bill", "dossier", 60, 51, "secured"],
          ["normal-docket", "document-box", 66, 52, "active"],
        ],
      },
      {
        title: "The institution survives the delay",
        description:
          "The clerk keeps the bill in process while the Fixer recedes and the stress clock remains lit.",
        tone: "constructive",
        focus: [63, 48],
        actors: [
          ["director", "director", "Director", 54, 61, "up", "idle"],
          ["fixer", "fixer", "The Fixer", 24, 64, "left", "withdraw"],
          ["clerk", "official", "Committee clerk", 67, 52, "left", "work"],
        ],
        props: [
          ["vetoed-bill", "dossier", 61, 50, "secured"],
          ["normal-docket", "document-box", 68, 52, "active"],
          ["stress-beacon", "warning-beacon", 78, 35, "active"],
        ],
      },
    ],
  ),
  "card:emergency_powers:ignored": cardScene(
    "card:emergency_powers:ignored",
    "oversight-chamber",
    "The Emergency Expands Without Authority",
    [
      {
        title: "The bill lies between two empty decisions",
        description:
          "The Fixer waits on one side of the chamber while the committee chair remains vacant.",
        tone: "crisis",
        focus: [50, 52],
        actors: [
          ["fixer", "fixer", "The Fixer", 38, 59, "right", "idle"],
          ["security", "security", "Chamber security", 70, 62, "left", "observe"],
        ],
        props: [
          ["unanswered-bill", "dossier", 50, 52, "abandoned"],
          ["warning", "warning-beacon", 72, 35, "active"],
        ],
      },
      {
        title: "Crews receive conflicting orders",
        description:
          "Security and emergency staff cross in opposite directions as alarms overtake the hearing.",
        tone: "crisis",
        focus: [53, 62],
        actors: [
          ["fixer", "fixer", "The Fixer", 39, 59, "right", "confront"],
          ["security", "security", "Chamber security", 58, 62, "left", "cross"],
          ["emergency-crew", "worker", "Emergency crew", 67, 66, "right", "cross"],
          ["clerk", "official", "Committee clerk", 31, 67, "left", "exit"],
        ],
        props: [
          ["unanswered-bill", "dossier", 50, 52, "abandoned"],
          ["warning", "warning-beacon", 72, 35, "active"],
        ],
      },
      {
        title: "Indecision becomes the emergency policy",
        description:
          "The chamber is left damaged, the bill unanswered, and every warning beacon active.",
        tone: "public",
        focus: [50, 47],
        actors: [
          ["fixer", "fixer", "The Fixer", 38, 59, "down", "withdraw"],
          ["security", "security", "Chamber security", 63, 64, "right", "confront"],
          ["emergency-crew", "worker", "Emergency crew", 78, 67, "right", "exit"],
        ],
        props: [
          ["unanswered-bill", "dossier", 50, 52, "abandoned"],
          ["damaged-chamber", "hearing-desk", 50, 30, "damaged"],
          ["warning-a", "warning-beacon", 35, 35, "active"],
          ["warning-b", "warning-beacon", 72, 35, "active"],
        ],
      },
    ],
  ),
} satisfies Readonly<Record<string, NarrativeSceneScript>>;
