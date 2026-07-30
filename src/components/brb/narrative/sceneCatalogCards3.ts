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

export const CARD_SCENE_SCRIPTS_3 = {
  "card:capacity_bottleneck:hire": cardScene(
    "card:capacity_bottleneck:hire",
    "infrastructure-site",
    "A Parallel Team Arrives",
    [
      {
        title: "One crew is split between two systems",
        description:
          "The same specialists stand between the civic server and the BRB generator.",
        tone: "crisis",
        focus: [50, 57],
        actors: [
          ["supervisor", "worker", "Site supervisor", 50, 64, "up", "observe"],
          ["crew-a", "worker", "Specialist crew", 41, 62, "right", "idle"],
          ["director", "director", "Director", 50, 73, "up", "enter"],
        ],
        props: [
          ["civic-work", "server", 29, 49, "normal"],
          ["brb-work", "generator", 72, 53, "normal"],
          ["closed-tools", "document-box", 50, 55, "secured"],
        ],
      },
      {
        title: "The funding box opens the gate",
        description:
          "A second contractor team enters as the Director commits the expensive parallel contract.",
        tone: "constructive",
        focus: [67, 63],
        actors: [
          ["director", "director", "Director", 43, 68, "right", "address"],
          ["crew-a", "worker", "Original specialist crew", 33, 61, "left", "cross"],
          ["crew-b", "worker", "Parallel contractor team", 73, 64, "left", "enter"],
          ["supervisor", "worker", "Site supervisor", 53, 62, "right", "work"],
        ],
        props: [
          ["parallel-contract", "document-box", 55, 54, "secured"],
          ["open-gate", "barrier", 69, 73, "normal"],
        ],
      },
      {
        title: "Both workstreams move at once",
        description:
          "Two crews operate separate systems while the parallel contract remains secured at the site.",
        tone: "constructive",
        focus: [50, 51],
        actors: [
          ["crew-a", "worker", "Original specialist crew", 30, 61, "up", "work"],
          ["crew-b", "worker", "Parallel contractor team", 71, 62, "up", "work"],
          ["supervisor", "worker", "Site supervisor", 50, 66, "up", "observe"],
          ["director", "director", "Director", 50, 73, "up", "idle"],
        ],
        props: [
          ["civic-work", "server", 29, 49, "active"],
          ["brb-work", "generator", 72, 53, "active"],
          ["parallel-contract", "document-box", 50, 55, "secured"],
        ],
      },
    ],
  ),
  "card:capacity_bottleneck:prioritize": cardScene(
    "card:capacity_bottleneck:prioritize",
    "infrastructure-site",
    "The BRB Takes the Only Team",
    [
      {
        title: "Public repair and BRB share one crew",
        description:
          "The specialists wait between a damaged civic server and the project generator.",
        tone: "crisis",
        focus: [50, 57],
        actors: [
          ["crew", "worker", "Specialist crew", 50, 63, "up", "idle"],
          ["public-supervisor", "official", "Public-works supervisor", 29, 64, "right", "confront"],
          ["brb-supervisor", "staff", "BRB supervisor", 71, 63, "left", "confront"],
          ["director", "director", "Director", 50, 73, "up", "enter"],
        ],
        props: [
          ["public-repair", "server", 29, 49, "damaged"],
          ["brb-priority", "generator", 72, 53, "normal"],
        ],
      },
      {
        title: "The order points every specialist at BRB",
        description:
          "The Director sends the crew toward the generator while public work is placed behind a barrier.",
        tone: "crisis",
        focus: [69, 57],
        actors: [
          ["director", "director", "Director", 52, 68, "right", "address"],
          ["crew", "worker", "Specialist crew", 65, 62, "right", "cross"],
          ["public-supervisor", "official", "Public-works supervisor", 28, 64, "left", "withdraw"],
          ["brb-supervisor", "staff", "BRB supervisor", 72, 62, "left", "work"],
        ],
        props: [
          ["public-repair", "server", 29, 49, "abandoned"],
          ["brb-priority", "generator", 72, 53, "active"],
          ["public-cordon", "barrier", 29, 61, "active"],
        ],
      },
      {
        title: "The prototype advances beside abandoned service",
        description:
          "BRB work lights brighten as the cordoned public server and its supervisor recede.",
        tone: "public",
        focus: [72, 45],
        actors: [
          ["crew", "worker", "Specialist crew", 70, 61, "up", "work"],
          ["brb-supervisor", "staff", "BRB supervisor", 62, 64, "right", "observe"],
          ["public-supervisor", "official", "Public-works supervisor", 19, 69, "left", "exit"],
          ["director", "director", "Director", 50, 70, "right", "idle"],
        ],
        props: [
          ["public-repair", "server", 29, 49, "abandoned"],
          ["brb-priority", "generator", 72, 53, "active"],
          ["brb-work-lights", "work-lights", 72, 23, "active"],
          ["public-cordon", "barrier", 29, 61, "secured"],
        ],
      },
    ],
  ),
  "card:capacity_bottleneck:ignored": cardScene(
    "card:capacity_bottleneck:ignored",
    "infrastructure-site",
    "Both Teams Wait",
    [
      {
        title: "Two supervisors claim the same plan",
        description:
          "Public and BRB leads face each other across a single specialist crew and toolbox.",
        tone: "crisis",
        focus: [50, 59],
        actors: [
          ["public-supervisor", "official", "Public-works supervisor", 35, 62, "right", "confront"],
          ["brb-supervisor", "staff", "BRB supervisor", 65, 62, "left", "confront"],
          ["crew", "worker", "Specialist crew", 50, 69, "up", "idle"],
        ],
        props: [
          ["contested-plan", "dossier", 50, 54, "normal"],
          ["shared-tools", "document-box", 50, 60, "secured"],
        ],
      },
      {
        title: "The argument outlasts the work window",
        description:
          "The supervisors pull away from each other while the crew remains frozen between systems.",
        tone: "crisis",
        focus: [50, 62],
        actors: [
          ["public-supervisor", "official", "Public-works supervisor", 29, 63, "left", "withdraw"],
          ["brb-supervisor", "staff", "BRB supervisor", 71, 63, "right", "withdraw"],
          ["crew", "worker", "Specialist crew", 50, 69, "up", "observe"],
        ],
        props: [
          ["contested-plan", "dossier", 50, 54, "abandoned"],
          ["shared-tools", "document-box", 50, 60, "secured"],
          ["waiting-beacon", "warning-beacon", 50, 36, "active"],
        ],
      },
      {
        title: "The bottleneck damages both workstreams",
        description:
          "An empty toolbox sits between a failed civic server and a stripped BRB work area.",
        tone: "public",
        focus: [50, 54],
        actors: [
          ["crew", "worker", "Specialist crew", 50, 70, "down", "withdraw"],
        ],
        props: [
          ["stalled-public-work", "server", 29, 49, "damaged"],
          ["stalled-brb-work", "generator", 72, 53, "damaged"],
          ["empty-tools", "document-box", 50, 58, "abandoned"],
          ["waiting-beacon", "warning-beacon", 50, 36, "active"],
        ],
      },
    ],
  ),
  "card:audit_discrepancy:follow": cardScene(
    "card:audit_discrepancy:follow",
    "secure-briefing",
    "The Ownership Trail Opens",
    [
      {
        title: "One payment refuses to balance",
        description:
          "The auditor isolates a red entry in the contractor ledger and brings it to the Analyst.",
        tone: "institutional",
        focus: [48, 51],
        actors: [
          ["auditor", "official", "Federal auditor", 38, 58, "right", "address"],
          ["analyst", "analyst", "The Analyst", 62, 58, "left", "observe"],
          ["director", "director", "Director", 50, 69, "up", "idle"],
        ],
        props: [
          ["audit-ledger", "dossier", 48, 50, "active"],
          ["payment-box", "document-box", 58, 52, "normal"],
        ],
      },
      {
        title: "The payment path reaches a locked door",
        description:
          "The Analyst moves the ledger trail from contractor records to a hidden corporate intermediary.",
        tone: "covert",
        focus: [55, 29],
        actors: [
          ["analyst", "analyst", "The Analyst", 48, 58, "up", "work"],
          ["auditor", "official", "Federal auditor", 34, 59, "right", "observe"],
          ["director", "director", "Director", 65, 63, "left", "observe"],
        ],
        props: [
          ["ownership-feed", "monitor-bank", 54, 23, "active"],
          ["audit-ledger", "dossier", 47, 50, "active"],
          ["locked-payment", "document-box", 65, 51, "secured"],
        ],
      },
      {
        title: "A corporate ownership thread stays lit",
        description:
          "The evidence board preserves the route from the red ledger entry to the hidden owner.",
        tone: "constructive",
        focus: [54, 24],
        actors: [
          ["analyst", "analyst", "The Analyst", 42, 59, "up", "observe"],
          ["auditor", "official", "Federal auditor", 59, 59, "up", "idle"],
          ["director", "director", "Director", 50, 69, "up", "idle"],
        ],
        props: [
          ["ownership-feed", "monitor-bank", 54, 23, "secured"],
          ["audit-ledger", "dossier", 48, 50, "secured"],
          ["locked-payment", "document-box", 64, 51, "secured"],
        ],
      },
    ],
  ),
  "card:audit_discrepancy:close": cardScene(
    "card:audit_discrepancy:close",
    "secure-briefing",
    "The Audit Is Sealed",
    [
      {
        title: "The discrepancy reaches the Fixer",
        description:
          "The auditor places the unexplained payment between the Fixer and the government ledger.",
        tone: "covert",
        focus: [50, 51],
        actors: [
          ["auditor", "official", "Federal auditor", 36, 59, "right", "address"],
          ["fixer", "fixer", "The Fixer", 64, 58, "left", "observe"],
          ["director", "director", "Director", 50, 69, "up", "idle"],
        ],
        props: [
          ["discrepancy-file", "dossier", 48, 50, "active"],
          ["unexplained-payment", "document-box", 58, 52, "normal"],
        ],
      },
      {
        title: "The trail enters private custody",
        description:
          "The Fixer seals the discrepancy while a funding box replaces the open audit record.",
        tone: "covert",
        focus: [59, 53],
        actors: [
          ["fixer", "fixer", "The Fixer", 58, 58, "left", "work"],
          ["auditor", "official", "Federal auditor", 27, 63, "left", "withdraw"],
          ["director", "director", "Director", 48, 68, "right", "observe"],
        ],
        props: [
          ["sealed-discrepancy", "document-box", 61, 51, "secured"],
          ["quiet-funds", "document-box", 49, 53, "active"],
        ],
      },
      {
        title: "A clean desk hides the ownership trail",
        description:
          "The auditor is gone, the corporate lead is dark, and the Fixer controls the sealed box.",
        tone: "corporate",
        focus: [61, 51],
        actors: [
          ["fixer", "fixer", "The Fixer", 61, 59, "up", "idle"],
          ["director", "director", "Director", 42, 68, "up", "observe"],
        ],
        props: [
          ["sealed-discrepancy", "document-box", 61, 51, "secured"],
          ["dark-ownership-feed", "monitor-bank", 50, 22, "abandoned"],
        ],
      },
    ],
  ),
  "card:audit_discrepancy:ignored": cardScene(
    "card:audit_discrepancy:ignored",
    "secure-briefing",
    "The Discrepancy Is Normalized",
    [
      {
        title: "The mismatch blinks on the audit feed",
        description:
          "A clerk waits beside the unexplained entry while no investigator claims the file.",
        tone: "institutional",
        focus: [50, 25],
        actors: [
          ["clerk", "official", "Audit clerk", 47, 59, "up", "idle"],
        ],
        props: [
          ["mismatch-feed", "monitor-bank", 50, 22, "active"],
          ["unclaimed-ledger", "dossier", 50, 50, "abandoned"],
        ],
      },
      {
        title: "The clerk marks it as an accounting error",
        description:
          "The red entry is stamped ordinary and moved into the closed document stack.",
        tone: "covert",
        focus: [53, 52],
        actors: [
          ["clerk", "official", "Audit clerk", 51, 59, "up", "work"],
          ["corporate-aide", "corporate", "Unseen intermediary", 78, 61, "left", "observe"],
        ],
        props: [
          ["normalized-ledger", "dossier", 50, 50, "secured"],
          ["closed-audit-stack", "document-box", 59, 52, "secured"],
        ],
      },
      {
        title: "The ownership route disappears from the board",
        description:
          "The audit feed returns to normal while a Corporation signal advances beyond the empty room.",
        tone: "corporate",
        focus: [50, 24],
        actors: [
          ["clerk", "official", "Audit clerk", 28, 64, "left", "exit"],
          ["corporate-aide", "corporate", "Unseen intermediary", 77, 61, "right", "withdraw"],
        ],
        props: [
          ["normalized-feed", "monitor-bank", 50, 22, "secured"],
          ["closed-audit-stack", "document-box", 59, 52, "secured"],
          ["corporate-progress", "warning-beacon", 77, 35, "active"],
        ],
      },
    ],
  ),
  "card:silent_partner:seize": cardScene(
    "card:silent_partner:seize",
    "infrastructure-site",
    "The Contractor Is Seized",
    [
      {
        title: "The corporate owner appears inside the site",
        description:
          "The Analyst's ownership file places a Corporation executive inside the critical contractor office.",
        tone: "corporate",
        focus: [64, 52],
        actors: [
          ["analyst", "analyst", "The Analyst", 34, 61, "right", "address"],
          ["corporate", "corporate", "Hidden corporate owner", 68, 58, "left", "confront"],
          ["workers", "worker", "Contractor crew", 52, 68, "up", "observe"],
          ["security", "security", "Federal officers", 22, 64, "right", "enter"],
        ],
        props: [
          ["ownership-file", "dossier", 50, 54, "active"],
          ["site-corporate-mark", "corporate-seal", 69, 45, "active"],
        ],
      },
      {
        title: "Federal officers take the contractor office",
        description:
          "The corporate seal comes down as officers secure the files and escort the owner out.",
        tone: "crisis",
        focus: [67, 55],
        actors: [
          ["security", "security", "Federal officers", 61, 60, "right", "confront"],
          ["corporate", "corporate", "Hidden corporate owner", 78, 61, "right", "exit"],
          ["analyst", "analyst", "The Analyst", 38, 62, "right", "observe"],
          ["workers", "worker", "Contractor crew", 49, 68, "up", "observe"],
        ],
        props: [
          ["seized-files", "document-box", 62, 52, "secured"],
          ["removed-corporate-mark", "corporate-seal", 70, 45, "damaged"],
          ["seizure-barrier", "barrier", 72, 68, "active"],
        ],
      },
      {
        title: "The worksite reopens under public control",
        description:
          "Crews restart both systems beneath secured evidence and a restored institutional order.",
        tone: "constructive",
        focus: [50, 53],
        actors: [
          ["workers", "worker", "Contractor crew", 51, 63, "up", "work"],
          ["analyst", "analyst", "The Analyst", 36, 63, "right", "observe"],
          ["security", "security", "Federal officers", 70, 65, "left", "observe"],
        ],
        props: [
          ["public-server", "server", 30, 49, "active"],
          ["public-generator", "generator", 72, 53, "active"],
          ["seized-files", "document-box", 56, 52, "secured"],
        ],
      },
    ],
  ),
  "card:silent_partner:deal": cardScene(
    "card:silent_partner:deal",
    "corporate-suite",
    "A Controlled Channel Opens",
    [
      {
        title: "The hidden owner meets behind the partition",
        description:
          "The Fixer and the Corporation executive face a private-channel dossier.",
        tone: "covert",
        focus: [53, 53],
        actors: [
          ["fixer", "fixer", "The Fixer", 39, 59, "right", "address"],
          ["corporate", "corporate", "Silent partner", 66, 58, "left", "idle"],
          ["director", "director", "Director", 50, 70, "up", "observe"],
        ],
        props: [
          ["controlled-deal", "dossier", 50, 51, "normal"],
          ["channel-box", "document-box", 59, 53, "secured"],
        ],
      },
      {
        title: "The handshake closes over the channel",
        description:
          "The Fixer exchanges protected access with the silent partner while the Director stays outside the circle.",
        tone: "corporate",
        focus: [53, 56],
        actors: [
          ["fixer", "fixer", "The Fixer", 48, 59, "right", "address"],
          ["corporate", "corporate", "Silent partner", 59, 58, "left", "address"],
          ["director", "director", "Director", 36, 69, "right", "observe"],
        ],
        props: [
          ["signed-channel", "dossier", 53, 51, "secured"],
          ["channel-box", "document-box", 59, 53, "active"],
        ],
      },
      {
        title: "The Fixer keeps the only key",
        description:
          "A secure monitor connects both sides while the private file remains under the Fixer's control.",
        tone: "corporate",
        focus: [50, 24],
        actors: [
          ["fixer", "fixer", "The Fixer", 48, 59, "up", "idle"],
          ["corporate", "corporate", "Silent partner", 65, 59, "up", "observe"],
          ["director", "director", "Director", 27, 69, "left", "withdraw"],
        ],
        props: [
          ["secret-channel-feed", "monitor-bank", 50, 22, "active"],
          ["signed-channel", "dossier", 48, 51, "secured"],
          ["corporate-risk", "warning-beacon", 75, 35, "active"],
        ],
      },
    ],
  ),
  "card:silent_partner:ignored": cardScene(
    "card:silent_partner:ignored",
    "infrastructure-site",
    "The Silent Partner Takes Control",
    [
      {
        title: "The corporate agent waits in the contractor office",
        description:
          "Workers continue under an unchallenged Corporation seal while the ownership file sits unanswered.",
        tone: "corporate",
        focus: [66, 52],
        actors: [
          ["corporate", "corporate", "Corporate site agent", 68, 58, "left", "idle"],
          ["workers", "worker", "Contractor crew", 50, 66, "up", "work"],
          ["security", "security", "Site security", 27, 65, "right", "observe"],
        ],
        props: [
          ["site-corporate-seal", "corporate-seal", 68, 44, "active"],
          ["unanswered-ownership", "dossier", 52, 53, "abandoned"],
        ],
      },
      {
        title: "Corporate technicians replace the local badges",
        description:
          "A new team crosses the site as private cameras and secured systems come online.",
        tone: "crisis",
        focus: [60, 59],
        actors: [
          ["corporate", "corporate", "Corporate site agent", 60, 58, "right", "address"],
          ["technicians", "corporate", "Corporate technicians", 73, 64, "left", "enter"],
          ["workers", "worker", "Contractor crew", 34, 67, "left", "withdraw"],
          ["security", "security", "Site security", 50, 66, "right", "cross"],
        ],
        props: [
          ["private-server", "server", 67, 49, "active"],
          ["site-corporate-seal", "corporate-seal", 68, 44, "active"],
        ],
      },
      {
        title: "Private systems occupy the worksite",
        description:
          "Corporation staff control the generator, server, and surveillance while the original crew is gone.",
        tone: "corporate",
        focus: [61, 50],
        actors: [
          ["corporate", "corporate", "Corporate site agent", 54, 60, "up", "idle"],
          ["technicians", "corporate", "Corporate technicians", 70, 62, "up", "work"],
          ["security", "security", "Corporate security", 40, 66, "right", "observe"],
        ],
        props: [
          ["private-server", "server", 32, 49, "active"],
          ["private-generator", "generator", 72, 53, "active"],
          ["site-corporate-seal", "corporate-seal", 57, 43, "secured"],
          ["occupation-beacon", "warning-beacon", 82, 35, "active"],
        ],
      },
    ],
  ),
  "card:protest_spark:meet": cardScene(
    "card:protest_spark:meet",
    "civic-gate",
    "The Director Meets the Organizers",
    [
      {
        title: "A small protest waits beyond Gate Seven",
        description:
          "Organizers hold a single crowd line before the closed facility barrier.",
        tone: "public",
        focus: [50, 70],
        actors: [
          ["organizer", "public", "Protest organizer", 44, 72, "right", "idle"],
          ["supporter", "public", "Gate Seven protester", 60, 73, "left", "idle"],
          ["security", "security", "Gate security", 50, 59, "down", "observe"],
        ],
        props: [
          ["small-protest", "crowd-line", 52, 77, "active"],
          ["closed-gate", "barrier", 50, 59, "secured"],
        ],
      },
      {
        title: "The Director crosses without a security line",
        description:
          "The barrier opens and the Director walks out to meet the organizers face-to-face.",
        tone: "constructive",
        focus: [50, 67],
        actors: [
          ["director", "director", "Director", 49, 64, "down", "cross"],
          ["organizer", "public", "Protest organizer", 44, 71, "up", "address"],
          ["supporter", "public", "Gate Seven protester", 61, 73, "left", "observe"],
          ["security", "security", "Gate security", 31, 59, "right", "withdraw"],
        ],
        props: [
          ["open-gate", "barrier", 50, 58, "normal"],
          ["organizer-notes", "dossier", 48, 67, "active"],
        ],
      },
      {
        title: "A shared contact list remains at the open gate",
        description:
          "The Director and organizers stay together around a secured record of the meeting.",
        tone: "constructive",
        focus: [50, 67],
        actors: [
          ["director", "director", "Director", 45, 66, "right", "idle"],
          ["organizer", "public", "Protest organizer", 55, 66, "left", "idle"],
          ["supporter", "public", "Gate Seven protester", 64, 72, "left", "observe"],
          ["security", "security", "Gate security", 30, 59, "right", "observe"],
        ],
        props: [
          ["open-gate", "barrier", 50, 58, "normal"],
          ["shared-contact-list", "dossier", 50, 63, "secured"],
        ],
      },
    ],
  ),
  "card:protest_spark:clear": cardScene(
    "card:protest_spark:clear",
    "civic-gate",
    "Gate Seven Is Cleared",
    [
      {
        title: "The protest faces the facility cameras",
        description:
          "A small organizer line and press operator wait before the controlled barrier.",
        tone: "public",
        focus: [51, 70],
        actors: [
          ["organizer", "public", "Protest organizer", 42, 72, "right", "confront"],
          ["supporter", "public", "Gate Seven protester", 58, 73, "left", "idle"],
          ["press", "staff", "Press camera", 73, 71, "left", "observe"],
          ["security", "security", "Gate security", 50, 58, "down", "idle"],
        ],
        props: [["protest-line", "crowd-line", 50, 77, "active"]],
      },
      {
        title: "Security lowers the barrier into the crowd",
        description:
          "The gate line advances as organizers withdraw and the press camera records every step.",
        tone: "crisis",
        focus: [50, 65],
        actors: [
          ["security", "security", "Gate security", 50, 63, "down", "confront"],
          ["organizer", "public", "Protest organizer", 30, 73, "left", "withdraw"],
          ["supporter", "public", "Gate Seven protester", 70, 75, "right", "exit"],
          ["press", "staff", "Press camera", 73, 68, "left", "work"],
        ],
        props: [
          ["lowered-barrier", "barrier", 50, 66, "active"],
          ["scattered-line", "crowd-line", 50, 79, "damaged"],
        ],
      },
      {
        title: "The cleared gate survives as footage",
        description:
          "Abandoned protest material remains while the recorded confrontation fills the public monitor.",
        tone: "public",
        focus: [58, 31],
        actors: [
          ["security", "security", "Gate security", 50, 63, "down", "observe"],
          ["press", "staff", "Press camera", 72, 68, "up", "work"],
        ],
        props: [
          ["cleared-gate", "barrier", 50, 66, "secured"],
          ["abandoned-protest", "crowd-line", 50, 79, "abandoned"],
          ["confrontation-feed", "monitor-bank", 58, 27, "active"],
          ["gate-panic", "warning-beacon", 78, 40, "active"],
        ],
      },
    ],
  ),
  "card:protest_spark:ignored": cardScene(
    "card:protest_spark:ignored",
    "civic-gate",
    "The Protest Organizes Without Government",
    [
      {
        title: "Organizers wait at a silent barrier",
        description:
          "The small group holds position while no official appears inside Gate Seven.",
        tone: "public",
        focus: [50, 71],
        actors: [
          ["organizer", "public", "Protest organizer", 44, 72, "right", "idle"],
          ["supporter", "public", "Gate Seven protester", 59, 73, "left", "idle"],
          ["security", "security", "Unstaffed gate post", 50, 58, "down", "observe"],
        ],
        props: [
          ["waiting-protest", "crowd-line", 51, 77, "normal"],
          ["silent-barrier", "barrier", 50, 59, "secured"],
        ],
      },
      {
        title: "The group builds its own assembly point",
        description:
          "A document box becomes an organizer table as more supporters enter the line.",
        tone: "public",
        focus: [51, 70],
        actors: [
          ["organizer", "public", "Protest organizer", 48, 69, "down", "address"],
          ["supporter", "public", "Gate Seven protester", 35, 74, "right", "cross"],
          ["new-supporter", "public", "New protest supporter", 68, 75, "left", "enter"],
        ],
        props: [
          ["organizer-table", "document-box", 49, 67, "active"],
          ["growing-line", "crowd-line", 51, 78, "active"],
        ],
      },
      {
        title: "A larger movement owns the perimeter",
        description:
          "The self-organized crowd spans Gate Seven beneath its own active information feed.",
        tone: "crisis",
        focus: [51, 71],
        actors: [
          ["organizer", "public", "Protest organizer", 49, 66, "down", "address"],
          ["supporter", "public", "Gate Seven protester", 33, 74, "right", "idle"],
          ["new-supporter", "public", "New protest supporter", 68, 74, "left", "idle"],
          ["security", "security", "Unstaffed gate post", 50, 56, "down", "withdraw"],
        ],
        props: [
          ["movement-line", "crowd-line", 51, 79, "active"],
          ["organizer-table", "document-box", 49, 67, "secured"],
          ["movement-feed", "monitor-bank", 50, 28, "active"],
        ],
      },
    ],
  ),
  "card:national_march:address": cardScene(
    "card:national_march:address",
    "civic-gate",
    "The Country Is Addressed",
    [
      {
        title: "The national march reaches the government lectern",
        description:
          "A dense public line fills the avenue while the podium and gate wait ahead.",
        tone: "public",
        focus: [50, 71],
        actors: [
          ["organizer", "public", "National organizer", 43, 69, "right", "address"],
          ["marcher-a", "public", "March delegate", 31, 76, "right", "idle"],
          ["marcher-b", "public", "March delegate", 68, 76, "left", "idle"],
          ["security", "security", "Gate security", 50, 57, "down", "observe"],
        ],
        props: [
          ["national-crowd", "crowd-line", 50, 80, "active"],
          ["national-podium", "podium", 50, 63, "normal"],
          ["national-gate", "barrier", 50, 56, "secured"],
        ],
      },
      {
        title: "The gate opens for the address",
        description:
          "The Director takes the podium and invites movement delegates across the perimeter.",
        tone: "constructive",
        focus: [50, 63],
        actors: [
          ["director", "director", "Director", 50, 62, "down", "address"],
          ["organizer", "public", "National organizer", 42, 69, "up", "observe"],
          ["marcher-a", "public", "March delegate", 34, 75, "up", "cross"],
          ["marcher-b", "public", "March delegate", 66, 75, "up", "cross"],
          ["security", "security", "Gate security", 27, 58, "right", "withdraw"],
        ],
        props: [
          ["national-crowd", "crowd-line", 50, 80, "active"],
          ["national-podium", "podium", 50, 63, "active"],
          ["open-national-gate", "barrier", 50, 55, "normal"],
        ],
      },
      {
        title: "The march becomes a negotiated settlement",
        description:
          "Delegates gather around a secured coalition charter as the crowd lowers its line.",
        tone: "constructive",
        focus: [50, 66],
        actors: [
          ["director", "director", "Director", 45, 63, "right", "idle"],
          ["organizer", "public", "National organizer", 56, 64, "left", "idle"],
          ["marcher-a", "public", "March delegate", 36, 71, "right", "observe"],
          ["marcher-b", "public", "March delegate", 65, 72, "left", "observe"],
          ["steward", "steward", "The Steward", 50, 55, "down", "observe"],
        ],
        props: [
          ["coalition-charter", "dossier", 50, 62, "secured"],
          ["settled-crowd", "crowd-line", 50, 80, "normal"],
          ["open-national-gate", "barrier", 50, 55, "normal"],
        ],
      },
    ],
  ),
  "card:national_march:ban": cardScene(
    "card:national_march:ban",
    "civic-gate",
    "The March Is Banned",
    [
      {
        title: "The march approaches an open perimeter",
        description:
          "National organizers and delegates fill the avenue beneath restrained gate lights.",
        tone: "public",
        focus: [50, 73],
        actors: [
          ["organizer", "public", "National organizer", 43, 70, "right", "address"],
          ["marcher-a", "public", "March delegate", 29, 77, "right", "idle"],
          ["marcher-b", "public", "March delegate", 68, 77, "left", "idle"],
          ["security", "security", "Gate security", 50, 57, "down", "observe"],
        ],
        props: [
          ["march-line", "crowd-line", 50, 81, "active"],
          ["open-perimeter", "barrier", 50, 56, "normal"],
        ],
      },
      {
        title: "Barriers and spotlights seal the avenue",
        description:
          "Security advances beneath warning beacons as the facility closes against the crowd.",
        tone: "crisis",
        focus: [50, 64],
        actors: [
          ["security", "security", "Gate security", 50, 63, "down", "confront"],
          ["security-left", "security", "Security line", 35, 64, "down", "enter"],
          ["security-right", "security", "Security line", 65, 64, "down", "enter"],
          ["organizer", "public", "National organizer", 46, 72, "up", "confront"],
          ["marcher-a", "public", "March delegate", 27, 78, "right", "idle"],
          ["marcher-b", "public", "March delegate", 72, 78, "left", "idle"],
        ],
        props: [
          ["sealed-perimeter", "barrier", 50, 66, "secured"],
          ["security-beacon-left", "warning-beacon", 31, 42, "active"],
          ["security-beacon-right", "warning-beacon", 69, 42, "active"],
        ],
      },
      {
        title: "Suppression gives the movement a permanent image",
        description:
          "The security line holds while the crowd grows denser behind warning light and damaged institutions.",
        tone: "public",
        focus: [50, 74],
        actors: [
          ["security", "security", "Gate security", 50, 63, "down", "confront"],
          ["security-left", "security", "Security line", 35, 64, "down", "idle"],
          ["security-right", "security", "Security line", 65, 64, "down", "idle"],
          ["organizer", "public", "National organizer", 50, 72, "up", "address"],
          ["marcher-a", "public", "March delegate", 26, 79, "right", "idle"],
          ["marcher-b", "public", "March delegate", 74, 79, "left", "idle"],
        ],
        props: [
          ["suppressed-crowd", "crowd-line", 50, 82, "active"],
          ["sealed-perimeter", "barrier", 50, 66, "secured"],
          ["security-beacon-left", "warning-beacon", 31, 42, "active"],
          ["security-beacon-right", "warning-beacon", 69, 42, "active"],
          ["damaged-authority", "podium", 50, 54, "damaged"],
        ],
      },
    ],
  ),
  "card:national_march:ignored": cardScene(
    "card:national_march:ignored",
    "civic-gate",
    "Silence Becomes the National Account",
    [
      {
        title: "The march faces an empty government podium",
        description:
          "Organizers fill the avenue while the lectern and official monitor remain unattended.",
        tone: "public",
        focus: [50, 69],
        actors: [
          ["organizer", "public", "National organizer", 44, 71, "right", "address"],
          ["marcher-a", "public", "March delegate", 29, 78, "right", "idle"],
          ["marcher-b", "public", "March delegate", 69, 78, "left", "idle"],
        ],
        props: [
          ["march-line", "crowd-line", 50, 82, "active"],
          ["empty-podium", "podium", 50, 62, "abandoned"],
          ["silent-government-feed", "monitor-bank", 50, 28, "abandoned"],
        ],
      },
      {
        title: "The movement passes the silent gate",
        description:
          "With no address or ban, delegates cross the perimeter and carry the march beyond the facility.",
        tone: "crisis",
        focus: [51, 65],
        actors: [
          ["organizer", "public", "National organizer", 50, 66, "up", "cross"],
          ["marcher-a", "public", "March delegate", 38, 72, "up", "cross"],
          ["marcher-b", "public", "March delegate", 63, 73, "up", "cross"],
          ["new-marchers", "public", "National march", 50, 81, "up", "enter"],
        ],
        props: [
          ["advancing-march", "crowd-line", 50, 78, "active"],
          ["empty-podium", "podium", 50, 60, "abandoned"],
          ["irrelevant-gate", "barrier", 50, 57, "abandoned"],
        ],
      },
      {
        title: "The crowd replaces the government frame",
        description:
          "The march occupies the entire civic perimeter while institutions and official screens stay dark.",
        tone: "public",
        focus: [50, 70],
        actors: [
          ["organizer", "public", "National organizer", 50, 65, "down", "address"],
          ["marcher-a", "public", "March delegate", 29, 73, "right", "idle"],
          ["marcher-b", "public", "March delegate", 70, 73, "left", "idle"],
          ["new-marchers", "public", "National march", 50, 80, "up", "idle"],
        ],
        props: [
          ["countrywide-crowd", "crowd-line", 50, 84, "active"],
          ["empty-podium", "podium", 50, 59, "abandoned"],
          ["dark-institutions", "monitor-bank", 50, 27, "damaged"],
          ["national-panic", "warning-beacon", 78, 42, "active"],
        ],
      },
    ],
  ),
} satisfies Readonly<Record<string, NarrativeSceneScript>>;
