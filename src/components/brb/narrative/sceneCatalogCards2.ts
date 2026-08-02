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
        focus: [7, 5],
        actors: [
          ["analyst", "analyst", "The Analyst", 5, 5, "right", "address"],
          ["fixer", "fixer", "The Fixer", 8, 5, "left", "observe"],
          ["steward", "steward", "The Steward", 8, 6, "left", "observe"],
          ["director", "director", "Director", 7, 6, "up", "idle"],
        ],
        props: [["leaked-briefing", "dossier", 7, 5, "active"]],
      },
      {
        title: "Every station comes under the lens",
        description:
          "The Analyst crosses from advisor to advisor while the security feed records each search.",
        tone: "covert",
        focus: [7, 5],
        actors: [
          ["analyst", "analyst", "The Analyst", 6, 5, "right", "cross"],
          ["fixer", "fixer", "The Fixer", 9, 5, "left", "confront"],
          ["steward", "steward", "The Steward", 5, 6, "right", "confront"],
          ["director", "director", "Director", 7, 6, "up", "observe"],
        ],
        props: [
          ["advisor-files", "document-box", 7, 5, "active"],
          ["audit-feed", "monitor-bank", 7, 3, "active"],
        ],
      },
      {
        title: "The leak closes and the cabinet separates",
        description:
          "The compromised feed goes dark as the advisors retreat to opposite sides of the room.",
        tone: "institutional",
        focus: [7, 3],
        actors: [
          ["analyst", "analyst", "The Analyst", 5, 5, "left", "idle"],
          ["fixer", "fixer", "The Fixer", 9, 5, "right", "withdraw"],
          ["steward", "steward", "The Steward", 4, 6, "left", "withdraw"],
          ["director", "director", "Director", 7, 6, "up", "observe"],
        ],
        props: [
          ["closed-leak-feed", "monitor-bank", 7, 3, "secured"],
          ["advisor-files", "document-box", 7, 5, "secured"],
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
        focus: [6, 5],
        actors: [
          ["analyst", "analyst", "The Analyst", 5, 5, "right", "work"],
          ["courier", "staff", "Controlled courier", 7, 5, "left", "idle"],
          ["director", "director", "Director", 7, 6, "up", "observe"],
        ],
        props: [
          ["false-plan", "dossier", 6, 5, "secured"],
          ["decoy-box", "document-box", 7, 5, "secured"],
        ],
      },
      {
        title: "The courier crosses the private threshold",
        description:
          "The decoy box reaches a Corporation executive while BRB staff watch from the hidden feed.",
        tone: "covert",
        focus: [8, 5],
        actors: [
          ["courier", "staff", "Controlled courier", 7, 5, "right", "cross"],
          ["corporate", "corporate", "Corporation executive", 9, 5, "left", "enter"],
          ["analyst", "analyst", "The Analyst", 4, 5, "right", "observe"],
        ],
        props: [
          ["decoy-box", "document-box", 7, 5, "secured"],
          ["hidden-feed", "monitor-bank", 4, 3, "active"],
        ],
      },
      {
        title: "Executives organize around the wrong future",
        description:
          "The false timeline fills the corporate display while the real BRB channel stays concealed.",
        tone: "corporate",
        focus: [7, 3],
        actors: [
          ["corporate", "corporate", "Corporation executive", 8, 5, "up", "work"],
          ["corporate-aide", "corporate", "Operations aide", 9, 5, "left", "observe"],
          ["analyst", "analyst", "The Analyst", 4, 5, "up", "observe"],
        ],
        props: [
          ["false-timeline-feed", "monitor-bank", 7, 3, "active"],
          ["sealed-real-plan", "document-box", 4, 5, "secured"],
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
        focus: [7, 3],
        actors: [
          ["corporate", "corporate", "Corporation executive", 6, 5, "up", "observe"],
          ["operations", "corporate", "Operations aide", 8, 5, "left", "idle"],
        ],
        props: [["leaked-projection", "monitor-bank", 7, 3, "active"]],
      },
      {
        title: "The projection is copied without resistance",
        description:
          "Aides carry matching files from the monitor bank to every operating station.",
        tone: "corporate",
        focus: [7, 5],
        actors: [
          ["corporate", "corporate", "Corporation executive", 6, 5, "right", "address"],
          ["operations", "corporate", "Operations aide", 8, 5, "right", "cross"],
          ["courier", "corporate", "Internal courier", 9, 5, "right", "exit"],
        ],
        props: [
          ["leaked-projection", "monitor-bank", 7, 3, "active"],
          ["copied-briefings", "document-box", 8, 5, "active"],
        ],
      },
      {
        title: "Every screen now agrees on the target",
        description:
          "Synchronized projections and a warning beacon mark the Corporation's confirmed advantage.",
        tone: "crisis",
        focus: [7, 3],
        actors: [
          ["corporate", "corporate", "Corporation executive", 6, 5, "up", "idle"],
          ["operations", "corporate", "Operations aide", 8, 5, "up", "work"],
        ],
        props: [
          ["confirmed-intelligence", "monitor-bank", 7, 3, "active"],
          ["corporate-alert", "warning-beacon", 10, 3, "active"],
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
        focus: [7, 5],
        actors: [
          ["engineer", "worker", "Grid engineer", 7, 5, "up", "observe"],
          ["public-crew", "worker", "Public-service crew", 4, 5, "right", "idle"],
          ["brb-crew", "worker", "BRB systems crew", 9, 5, "left", "idle"],
          ["director", "director", "Director", 7, 6, "up", "enter"],
        ],
        props: [
          ["public-grid", "server", 4, 4, "damaged"],
          ["brb-generator", "generator", 9, 5, "normal"],
          ["blackout-beacon", "warning-beacon", 7, 3, "active"],
        ],
      },
      {
        title: "Capacity is routed toward public service",
        description:
          "The Director sends both engineers to the civic server while BRB cables remain disconnected.",
        tone: "constructive",
        focus: [4, 5],
        actors: [
          ["director", "director", "Director", 6, 6, "left", "address"],
          ["engineer", "worker", "Grid engineer", 5, 5, "left", "cross"],
          ["public-crew", "worker", "Public-service crew", 4, 5, "right", "work"],
          ["brb-crew", "worker", "BRB systems crew", 6, 5, "left", "work"],
        ],
        props: [
          ["public-grid", "server", 4, 4, "active"],
          ["brb-generator", "generator", 9, 5, "abandoned"],
        ],
      },
      {
        title: "Civic lights return before BRB",
        description:
          "The public server glows under working lights while the prototype generator stays dim.",
        tone: "public",
        focus: [4, 4],
        actors: [
          ["engineer", "worker", "Grid engineer", 5, 5, "up", "work"],
          ["public-crew", "worker", "Public-service crew", 3, 5, "right", "work"],
          ["director", "director", "Director", 6, 6, "left", "observe"],
          ["brb-crew", "worker", "BRB systems crew", 9, 5, "left", "idle"],
        ],
        props: [
          ["public-grid", "server", 4, 4, "active"],
          ["public-lights", "work-lights", 4, 3, "active"],
          ["brb-generator", "generator", 9, 5, "abandoned"],
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
        focus: [7, 5],
        actors: [
          ["engineer", "worker", "Grid engineer", 7, 5, "up", "observe"],
          ["public-crew", "worker", "Public-service crew", 4, 5, "right", "idle"],
          ["brb-crew", "worker", "BRB systems crew", 9, 5, "left", "idle"],
          ["director", "director", "Director", 7, 6, "up", "enter"],
        ],
        props: [
          ["public-grid", "server", 4, 4, "damaged"],
          ["brb-generator", "generator", 9, 5, "normal"],
        ],
      },
      {
        title: "The emergency cable locks into BRB",
        description:
          "The systems crew energizes the prototype as the public-service team is ordered back.",
        tone: "crisis",
        focus: [9, 5],
        actors: [
          ["director", "director", "Director", 7, 6, "right", "address"],
          ["engineer", "worker", "Grid engineer", 8, 5, "right", "cross"],
          ["brb-crew", "worker", "BRB systems crew", 9, 5, "left", "work"],
          ["public-crew", "worker", "Public-service crew", 4, 5, "left", "withdraw"],
        ],
        props: [
          ["public-grid", "server", 4, 4, "damaged"],
          ["brb-generator", "generator", 9, 5, "active"],
        ],
      },
      {
        title: "The prototype glows over a dark region",
        description:
          "BRB work lights burn at full strength while public infrastructure disappears into blackout.",
        tone: "public",
        focus: [9, 4],
        actors: [
          ["brb-crew", "worker", "BRB systems crew", 9, 5, "up", "work"],
          ["director", "director", "Director", 7, 6, "right", "observe"],
          ["public", "public", "Darkened public district", 4, 6, "left", "withdraw"],
        ],
        props: [
          ["public-grid", "server", 4, 4, "abandoned"],
          ["brb-generator", "generator", 9, 5, "active"],
          ["brb-lights", "work-lights", 9, 3, "active"],
          ["panic-beacon", "warning-beacon", 6, 3, "active"],
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
        focus: [7, 5],
        actors: [
          ["public-crew", "worker", "Public-service crew", 5, 5, "right", "idle"],
          ["brb-crew", "worker", "BRB systems crew", 8, 5, "left", "idle"],
          ["dispatcher", "staff", "Grid dispatcher", 7, 6, "up", "observe"],
        ],
        props: [
          ["failed-server", "server", 5, 4, "damaged"],
          ["failed-generator", "generator", 9, 5, "damaged"],
        ],
      },
      {
        title: "The failure outruns the waiting teams",
        description:
          "Warning beacons spread across the site while every crew remains without authority.",
        tone: "crisis",
        focus: [7, 4],
        actors: [
          ["public-crew", "worker", "Public-service crew", 4, 5, "left", "withdraw"],
          ["brb-crew", "worker", "BRB systems crew", 9, 5, "right", "withdraw"],
          ["dispatcher", "staff", "Grid dispatcher", 7, 6, "up", "confront"],
        ],
        props: [
          ["failed-server", "server", 5, 4, "damaged"],
          ["failed-generator", "generator", 9, 5, "damaged"],
          ["grid-alarm-a", "warning-beacon", 6, 3, "active"],
          ["grid-alarm-b", "warning-beacon", 7, 3, "active"],
        ],
      },
      {
        title: "The entire site goes dark",
        description:
          "Abandoned systems and emergency signals become evidence of state incapacity.",
        tone: "public",
        focus: [7, 4],
        actors: [
          ["dispatcher", "staff", "Grid dispatcher", 7, 6, "down", "withdraw"],
          ["public", "public", "Stranded public", 4, 6, "right", "enter"],
        ],
        props: [
          ["failed-server", "server", 5, 4, "abandoned"],
          ["failed-generator", "generator", 9, 5, "abandoned"],
          ["grid-alarm-a", "warning-beacon", 6, 3, "active"],
          ["grid-alarm-b", "warning-beacon", 7, 3, "active"],
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
        focus: [7, 5],
        actors: [
          ["steward", "steward", "The Steward", 5, 5, "right", "address"],
          ["delegate-a", "official", "Coalition delegate", 8, 5, "left", "idle"],
          ["delegate-b", "official", "Coalition delegate", 8, 6, "left", "idle"],
          ["director", "director", "Director", 7, 6, "up", "enter"],
        ],
        props: [
          ["authority-file", "dossier", 7, 5, "normal"],
          ["ballot-box", "document-box", 7, 5, "normal"],
        ],
      },
      {
        title: "The center seat opens to the coalition",
        description:
          "The Director steps aside as every delegate places a ballot around the shared file.",
        tone: "constructive",
        focus: [7, 5],
        actors: [
          ["director", "director", "Director", 5, 6, "right", "withdraw"],
          ["steward", "steward", "The Steward", 6, 5, "right", "observe"],
          ["delegate-a", "official", "Coalition delegate", 7, 5, "left", "work"],
          ["delegate-b", "official", "Coalition delegate", 7, 6, "up", "work"],
        ],
        props: [
          ["shared-authority-file", "dossier", 7, 5, "active"],
          ["ballot-box", "document-box", 7, 5, "active"],
        ],
      },
      {
        title: "A shared charter replaces unilateral control",
        description:
          "The delegates remain at the table beneath a secured institutional agreement.",
        tone: "constructive",
        focus: [7, 4],
        actors: [
          ["director", "director", "Director", 5, 6, "right", "idle"],
          ["steward", "steward", "The Steward", 6, 5, "right", "idle"],
          ["delegate-a", "official", "Coalition delegate", 7, 5, "left", "idle"],
          ["delegate-b", "official", "Coalition delegate", 8, 6, "left", "idle"],
        ],
        props: [
          ["coalition-charter", "dossier", 7, 4, "secured"],
          ["sealed-ballots", "document-box", 7, 5, "secured"],
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
        focus: [7, 5],
        actors: [
          ["steward", "steward", "The Steward", 5, 5, "right", "observe"],
          ["fixer", "fixer", "The Fixer", 9, 5, "left", "idle"],
          ["holdout-a", "official", "Coalition holdout", 7, 5, "left", "idle"],
          ["holdout-b", "official", "Coalition holdout", 7, 6, "left", "idle"],
        ],
        props: [["closed-ballots", "document-box", 7, 5, "normal"]],
      },
      {
        title: "Access papers become leverage",
        description:
          "The Fixer and security close around the holdouts while their authorization files are stamped.",
        tone: "crisis",
        focus: [7, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 8, 5, "left", "confront"],
          ["security", "security", "Chamber security", 9, 5, "left", "confront"],
          ["holdout-a", "official", "Coalition holdout", 7, 5, "right", "withdraw"],
          ["holdout-b", "official", "Coalition holdout", 7, 6, "right", "withdraw"],
          ["steward", "steward", "The Steward", 4, 5, "right", "observe"],
        ],
        props: [
          ["pressure-file", "dossier", 7, 5, "active"],
          ["forced-ballots", "document-box", 7, 5, "active"],
        ],
      },
      {
        title: "The vote passes over empty chairs",
        description:
          "Stamped access papers remain as the holdouts leave and the institutional desk shows damage.",
        tone: "public",
        focus: [7, 4],
        actors: [
          ["fixer", "fixer", "The Fixer", 8, 5, "up", "idle"],
          ["security", "security", "Chamber security", 9, 5, "left", "observe"],
          ["holdout-a", "official", "Coalition holdout", 3, 6, "left", "exit"],
          ["steward", "steward", "The Steward", 4, 5, "left", "withdraw"],
        ],
        props: [
          ["forced-ballots", "document-box", 7, 5, "secured"],
          ["damaged-authority-file", "dossier", 7, 5, "damaged"],
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
        focus: [7, 5],
        actors: [
          ["steward", "steward", "The Steward", 5, 5, "right", "idle"],
          ["delegate-a", "official", "Coalition delegate", 8, 5, "left", "idle"],
          ["delegate-b", "official", "Coalition delegate", 8, 6, "left", "idle"],
        ],
        props: [
          ["unanswered-authority", "dossier", 7, 5, "abandoned"],
          ["waiting-ballots", "document-box", 7, 5, "normal"],
        ],
      },
      {
        title: "The Steward carries the vote away",
        description:
          "With no Director present, the delegates follow the ballot box out of the chamber.",
        tone: "public",
        focus: [8, 5],
        actors: [
          ["steward", "steward", "The Steward", 8, 5, "right", "cross"],
          ["delegate-a", "official", "Coalition delegate", 9, 5, "right", "exit"],
          ["delegate-b", "official", "Coalition delegate", 8, 6, "right", "exit"],
        ],
        props: [
          ["departing-ballots", "document-box", 8, 5, "secured"],
          ["unanswered-authority", "dossier", 7, 5, "abandoned"],
        ],
      },
      {
        title: "A separate coalition begins planning",
        description:
          "The chamber table is empty while an independent map lights beyond government control.",
        tone: "crisis",
        focus: [9, 3],
        actors: [
          ["steward", "steward", "The Steward", 9, 5, "up", "address"],
          ["delegate-a", "official", "Coalition delegate", 8, 6, "up", "observe"],
          ["delegate-b", "official", "Coalition delegate", 10, 6, "up", "observe"],
        ],
        props: [
          ["coalition-map", "monitor-bank", 9, 3, "active"],
          ["abandoned-authority", "dossier", 6, 5, "abandoned"],
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
        focus: [7, 5],
        actors: [
          ["host", "corporate", "Corporation host", 5, 5, "right", "address"],
          ["executive", "corporate", "Corporation executive", 8, 5, "left", "idle"],
          ["legislator-a", "official", "Legislator", 6, 6, "right", "idle"],
          ["legislator-b", "official", "Legislator", 8, 6, "left", "idle"],
        ],
        props: [
          ["guest-list", "dossier", 7, 5, "secured"],
          ["dinner-records", "document-box", 7, 5, "normal"],
        ],
      },
      {
        title: "The guest list appears over dinner",
        description:
          "The Analyst projects every attendee as a press crew enters the executive suite.",
        tone: "public",
        focus: [7, 3],
        actors: [
          ["analyst", "analyst", "The Analyst", 4, 5, "right", "work"],
          ["press", "staff", "Press camera", 9, 5, "left", "enter"],
          ["host", "corporate", "Corporation host", 6, 5, "left", "confront"],
          ["legislator-a", "official", "Legislator", 7, 6, "right", "withdraw"],
          ["legislator-b", "official", "Legislator", 8, 6, "right", "withdraw"],
        ],
        props: [
          ["exposed-guest-list", "monitor-bank", 7, 3, "active"],
          ["guest-list", "dossier", 7, 5, "active"],
        ],
      },
      {
        title: "The table empties around the evidence",
        description:
          "Guests scatter while the public guest list and abandoned place files remain.",
        tone: "constructive",
        focus: [7, 4],
        actors: [
          ["analyst", "analyst", "The Analyst", 5, 5, "up", "observe"],
          ["press", "staff", "Press camera", 9, 5, "left", "work"],
          ["host", "corporate", "Corporation host", 10, 6, "right", "exit"],
        ],
        props: [
          ["public-evidence", "dossier", 7, 5, "secured"],
          ["exposed-guest-list", "monitor-bank", 7, 3, "active"],
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
        focus: [7, 5],
        actors: [
          ["host", "corporate", "Corporation host", 5, 5, "right", "address"],
          ["executive", "corporate", "Corporation executive", 8, 5, "left", "idle"],
          ["legislator-a", "official", "Legislator", 6, 6, "right", "idle"],
          ["legislator-b", "official", "Legislator", 8, 6, "left", "idle"],
          ["fixer", "fixer", "The Fixer", 3, 5, "right", "enter"],
        ],
        props: [["corporate-favors", "document-box", 7, 5, "active"]],
      },
      {
        title: "The Fixer replaces every offer",
        description:
          "Government favor boxes and rapid calls move across the table ahead of the Corporation's.",
        tone: "covert",
        focus: [6, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 6, 5, "right", "work"],
          ["host", "corporate", "Corporation host", 8, 5, "left", "confront"],
          ["legislator-a", "official", "Legislator", 6, 6, "left", "cross"],
          ["legislator-b", "official", "Legislator", 7, 6, "left", "cross"],
        ],
        props: [
          ["counter-favors", "document-box", 6, 5, "active"],
          ["fixer-ledger", "dossier", 5, 5, "secured"],
        ],
      },
      {
        title: "The votes move and the Fixer keeps the price",
        description:
          "Legislators change sides while the Corporation host retreats and the private ledger stays with the Fixer.",
        tone: "covert",
        focus: [6, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 6, 5, "up", "idle"],
          ["host", "corporate", "Corporation host", 10, 5, "right", "withdraw"],
          ["legislator-a", "official", "Legislator", 5, 6, "left", "idle"],
          ["legislator-b", "official", "Legislator", 7, 6, "left", "idle"],
        ],
        props: [
          ["spent-favors", "document-box", 7, 5, "abandoned"],
          ["fixer-ledger", "dossier", 6, 5, "secured"],
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
        focus: [7, 5],
        actors: [
          ["host", "corporate", "Corporation host", 5, 5, "right", "address"],
          ["executive", "corporate", "Corporation executive", 8, 5, "left", "idle"],
          ["legislator-a", "official", "Legislator", 6, 6, "right", "idle"],
          ["legislator-b", "official", "Legislator", 8, 6, "left", "idle"],
        ],
        props: [["agreement-folders", "document-box", 7, 5, "normal"]],
      },
      {
        title: "Matching folders pass around the table",
        description:
          "The host distributes identical talking points while the Corporation feed records agreement.",
        tone: "corporate",
        focus: [7, 5],
        actors: [
          ["host", "corporate", "Corporation host", 6, 5, "right", "work"],
          ["executive", "corporate", "Corporation executive", 8, 5, "left", "observe"],
          ["legislator-a", "official", "Legislator", 6, 6, "up", "work"],
          ["legislator-b", "official", "Legislator", 8, 6, "up", "work"],
        ],
        props: [
          ["distributed-folders", "document-box", 7, 5, "active"],
          ["agreement-feed", "monitor-bank", 7, 3, "active"],
        ],
      },
      {
        title: "The talking points leave for committee",
        description:
          "Legislators exit with synchronized dossiers as the Corporation progress display advances.",
        tone: "crisis",
        focus: [9, 5],
        actors: [
          ["host", "corporate", "Corporation host", 6, 5, "right", "idle"],
          ["legislator-a", "official", "Legislator", 9, 5, "right", "exit"],
          ["legislator-b", "official", "Legislator", 9, 6, "right", "exit"],
        ],
        props: [
          ["committee-folders", "document-box", 8, 5, "secured"],
          ["corporate-progress", "monitor-bank", 7, 3, "active"],
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
        focus: [7, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 5, 5, "right", "address"],
          ["director", "director", "Director", 7, 6, "up", "observe"],
          ["committee", "official", "Committee clerk", 9, 4, "left", "withdraw"],
        ],
        props: [
          ["emergency-bill", "dossier", 7, 5, "active"],
          ["alarm", "warning-beacon", 9, 3, "active"],
        ],
      },
      {
        title: "The signature bypasses the chamber",
        description:
          "The Director stamps the bill while the committee clerk leaves and construction staff rush through.",
        tone: "crisis",
        focus: [7, 5],
        actors: [
          ["director", "director", "Director", 7, 5, "up", "work"],
          ["fixer", "fixer", "The Fixer", 5, 5, "right", "observe"],
          ["committee", "official", "Committee clerk", 10, 5, "right", "exit"],
          ["construction", "worker", "Emergency construction crew", 8, 6, "right", "cross"],
        ],
        props: [
          ["signed-bill", "dossier", 7, 5, "secured"],
          ["alarm", "warning-beacon", 9, 3, "active"],
        ],
      },
      {
        title: "Construction advances over a broken seal",
        description:
          "Emergency crews depart with the signed order as the public gallery empties and oversight fractures.",
        tone: "public",
        focus: [7, 4],
        actors: [
          ["fixer", "fixer", "The Fixer", 5, 5, "up", "idle"],
          ["director", "director", "Director", 7, 5, "up", "idle"],
          ["construction", "worker", "Emergency construction crew", 10, 6, "right", "exit"],
          ["public", "public", "Public gallery", 3, 6, "left", "withdraw"],
        ],
        props: [
          ["signed-bill", "dossier", 7, 5, "secured"],
          ["damaged-oversight", "hearing-desk", 7, 3, "damaged"],
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
        focus: [7, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 5, 5, "right", "address"],
          ["director", "director", "Director", 7, 6, "up", "observe"],
          ["clerk", "official", "Committee clerk", 9, 4, "left", "idle"],
        ],
        props: [
          ["emergency-bill", "dossier", 6, 5, "active"],
          ["normal-docket", "document-box", 8, 5, "normal"],
        ],
      },
      {
        title: "The bill returns unsigned",
        description:
          "The Director moves emergency authority into the normal docket despite the Fixer's objection.",
        tone: "institutional",
        focus: [8, 5],
        actors: [
          ["director", "director", "Director", 7, 5, "right", "work"],
          ["fixer", "fixer", "The Fixer", 5, 5, "left", "confront"],
          ["clerk", "official", "Committee clerk", 9, 5, "left", "work"],
        ],
        props: [
          ["vetoed-bill", "dossier", 8, 5, "secured"],
          ["normal-docket", "document-box", 8, 5, "active"],
        ],
      },
      {
        title: "The institution survives the delay",
        description:
          "The clerk keeps the bill in process while the Fixer recedes and the stress clock remains lit.",
        tone: "constructive",
        focus: [8, 4],
        actors: [
          ["director", "director", "Director", 7, 5, "up", "idle"],
          ["fixer", "fixer", "The Fixer", 4, 5, "left", "withdraw"],
          ["clerk", "official", "Committee clerk", 8, 5, "left", "work"],
        ],
        props: [
          ["vetoed-bill", "dossier", 8, 5, "secured"],
          ["normal-docket", "document-box", 8, 5, "active"],
          ["stress-beacon", "warning-beacon", 10, 3, "active"],
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
        focus: [7, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 5, 5, "right", "idle"],
          ["security", "security", "Chamber security", 9, 5, "left", "observe"],
        ],
        props: [
          ["unanswered-bill", "dossier", 7, 5, "abandoned"],
          ["warning", "warning-beacon", 9, 3, "active"],
        ],
      },
      {
        title: "Crews receive conflicting orders",
        description:
          "Security and emergency staff cross in opposite directions as alarms overtake the hearing.",
        tone: "crisis",
        focus: [7, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 5, 5, "right", "confront"],
          ["security", "security", "Chamber security", 7, 5, "left", "cross"],
          ["emergency-crew", "worker", "Emergency crew", 8, 6, "right", "cross"],
          ["clerk", "official", "Committee clerk", 4, 6, "left", "exit"],
        ],
        props: [
          ["unanswered-bill", "dossier", 7, 5, "abandoned"],
          ["warning", "warning-beacon", 9, 3, "active"],
        ],
      },
      {
        title: "Indecision becomes the emergency policy",
        description:
          "The chamber is left damaged, the bill unanswered, and every warning beacon active.",
        tone: "public",
        focus: [7, 4],
        actors: [
          ["fixer", "fixer", "The Fixer", 5, 5, "down", "withdraw"],
          ["security", "security", "Chamber security", 8, 5, "right", "confront"],
          ["emergency-crew", "worker", "Emergency crew", 10, 6, "right", "exit"],
        ],
        props: [
          ["unanswered-bill", "dossier", 7, 5, "abandoned"],
          ["damaged-chamber", "hearing-desk", 7, 3, "damaged"],
          ["warning-a", "warning-beacon", 5, 3, "active"],
          ["warning-b", "warning-beacon", 9, 3, "active"],
        ],
      },
    ],
  ),
} satisfies Readonly<Record<string, NarrativeSceneScript>>;
