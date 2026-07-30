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
        focus: [7, 5],
        actors: [
          ["supervisor", "worker", "Site supervisor", 7, 5, "up", "observe"],
          ["crew-a", "worker", "Specialist crew", 6, 5, "right", "idle"],
          ["director", "director", "Director", 7, 6, "up", "enter"],
        ],
        props: [
          ["civic-work", "server", 4, 4, "normal"],
          ["brb-work", "generator", 9, 5, "normal"],
          ["closed-tools", "document-box", 7, 5, "secured"],
        ],
      },
      {
        title: "The funding box opens the gate",
        description:
          "A second contractor team enters as the Director commits the expensive parallel contract.",
        tone: "constructive",
        focus: [8, 5],
        actors: [
          ["director", "director", "Director", 6, 6, "right", "address"],
          ["crew-a", "worker", "Original specialist crew", 5, 5, "left", "cross"],
          ["crew-b", "worker", "Parallel contractor team", 9, 5, "left", "enter"],
          ["supervisor", "worker", "Site supervisor", 7, 5, "right", "work"],
        ],
        props: [
          ["parallel-contract", "document-box", 7, 5, "secured"],
          ["open-gate", "barrier", 9, 6, "normal"],
        ],
      },
      {
        title: "Both workstreams move at once",
        description:
          "Two crews operate separate systems while the parallel contract remains secured at the site.",
        tone: "constructive",
        focus: [7, 5],
        actors: [
          ["crew-a", "worker", "Original specialist crew", 4, 5, "up", "work"],
          ["crew-b", "worker", "Parallel contractor team", 9, 5, "up", "work"],
          ["supervisor", "worker", "Site supervisor", 7, 6, "up", "observe"],
          ["director", "director", "Director", 7, 6, "up", "idle"],
        ],
        props: [
          ["civic-work", "server", 4, 4, "active"],
          ["brb-work", "generator", 9, 5, "active"],
          ["parallel-contract", "document-box", 7, 5, "secured"],
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
        focus: [7, 5],
        actors: [
          ["crew", "worker", "Specialist crew", 7, 5, "up", "idle"],
          ["public-supervisor", "official", "Public-works supervisor", 4, 5, "right", "confront"],
          ["brb-supervisor", "staff", "BRB supervisor", 9, 5, "left", "confront"],
          ["director", "director", "Director", 7, 6, "up", "enter"],
        ],
        props: [
          ["public-repair", "server", 4, 4, "damaged"],
          ["brb-priority", "generator", 9, 5, "normal"],
        ],
      },
      {
        title: "The order points every specialist at BRB",
        description:
          "The Director sends the crew toward the generator while public work is placed behind a barrier.",
        tone: "crisis",
        focus: [9, 5],
        actors: [
          ["director", "director", "Director", 7, 6, "right", "address"],
          ["crew", "worker", "Specialist crew", 8, 5, "right", "cross"],
          ["public-supervisor", "official", "Public-works supervisor", 4, 5, "left", "withdraw"],
          ["brb-supervisor", "staff", "BRB supervisor", 9, 5, "left", "work"],
        ],
        props: [
          ["public-repair", "server", 4, 4, "abandoned"],
          ["brb-priority", "generator", 9, 5, "active"],
          ["public-cordon", "barrier", 4, 5, "active"],
        ],
      },
      {
        title: "The prototype advances beside abandoned service",
        description:
          "BRB work lights brighten as the cordoned public server and its supervisor recede.",
        tone: "public",
        focus: [9, 4],
        actors: [
          ["crew", "worker", "Specialist crew", 9, 5, "up", "work"],
          ["brb-supervisor", "staff", "BRB supervisor", 8, 5, "right", "observe"],
          ["public-supervisor", "official", "Public-works supervisor", 3, 6, "left", "exit"],
          ["director", "director", "Director", 7, 6, "right", "idle"],
        ],
        props: [
          ["public-repair", "server", 4, 4, "abandoned"],
          ["brb-priority", "generator", 9, 5, "active"],
          ["brb-work-lights", "work-lights", 9, 3, "active"],
          ["public-cordon", "barrier", 4, 5, "secured"],
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
        focus: [7, 5],
        actors: [
          ["public-supervisor", "official", "Public-works supervisor", 5, 5, "right", "confront"],
          ["brb-supervisor", "staff", "BRB supervisor", 8, 5, "left", "confront"],
          ["crew", "worker", "Specialist crew", 7, 6, "up", "idle"],
        ],
        props: [
          ["contested-plan", "dossier", 7, 5, "normal"],
          ["shared-tools", "document-box", 7, 5, "secured"],
        ],
      },
      {
        title: "The argument outlasts the work window",
        description:
          "The supervisors pull away from each other while the crew remains frozen between systems.",
        tone: "crisis",
        focus: [7, 5],
        actors: [
          ["public-supervisor", "official", "Public-works supervisor", 4, 5, "left", "withdraw"],
          ["brb-supervisor", "staff", "BRB supervisor", 9, 5, "right", "withdraw"],
          ["crew", "worker", "Specialist crew", 7, 6, "up", "observe"],
        ],
        props: [
          ["contested-plan", "dossier", 7, 5, "abandoned"],
          ["shared-tools", "document-box", 7, 5, "secured"],
          ["waiting-beacon", "warning-beacon", 7, 4, "active"],
        ],
      },
      {
        title: "The bottleneck damages both workstreams",
        description:
          "An empty toolbox sits between a failed civic server and a stripped BRB work area.",
        tone: "public",
        focus: [7, 5],
        actors: [
          ["crew", "worker", "Specialist crew", 7, 6, "down", "withdraw"],
        ],
        props: [
          ["stalled-public-work", "server", 4, 4, "damaged"],
          ["stalled-brb-work", "generator", 9, 5, "damaged"],
          ["empty-tools", "document-box", 7, 5, "abandoned"],
          ["waiting-beacon", "warning-beacon", 7, 4, "active"],
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
        focus: [6, 5],
        actors: [
          ["auditor", "official", "Federal auditor", 5, 5, "right", "address"],
          ["analyst", "analyst", "The Analyst", 8, 5, "left", "observe"],
          ["director", "director", "Director", 7, 6, "up", "idle"],
        ],
        props: [
          ["audit-ledger", "dossier", 6, 5, "active"],
          ["payment-box", "document-box", 7, 5, "normal"],
        ],
      },
      {
        title: "The payment path reaches a locked door",
        description:
          "The Analyst moves the ledger trail from contractor records to a hidden corporate intermediary.",
        tone: "covert",
        focus: [7, 3],
        actors: [
          ["analyst", "analyst", "The Analyst", 6, 5, "up", "work"],
          ["auditor", "official", "Federal auditor", 5, 5, "right", "observe"],
          ["director", "director", "Director", 8, 5, "left", "observe"],
        ],
        props: [
          ["ownership-feed", "monitor-bank", 7, 3, "active"],
          ["audit-ledger", "dossier", 6, 5, "active"],
          ["locked-payment", "document-box", 8, 5, "secured"],
        ],
      },
      {
        title: "A corporate ownership thread stays lit",
        description:
          "The evidence board preserves the route from the red ledger entry to the hidden owner.",
        tone: "constructive",
        focus: [7, 3],
        actors: [
          ["analyst", "analyst", "The Analyst", 6, 5, "up", "observe"],
          ["auditor", "official", "Federal auditor", 7, 5, "up", "idle"],
          ["director", "director", "Director", 7, 6, "up", "idle"],
        ],
        props: [
          ["ownership-feed", "monitor-bank", 7, 3, "secured"],
          ["audit-ledger", "dossier", 6, 5, "secured"],
          ["locked-payment", "document-box", 8, 5, "secured"],
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
        focus: [7, 5],
        actors: [
          ["auditor", "official", "Federal auditor", 5, 5, "right", "address"],
          ["fixer", "fixer", "The Fixer", 8, 5, "left", "observe"],
          ["director", "director", "Director", 7, 6, "up", "idle"],
        ],
        props: [
          ["discrepancy-file", "dossier", 6, 5, "active"],
          ["unexplained-payment", "document-box", 7, 5, "normal"],
        ],
      },
      {
        title: "The trail enters private custody",
        description:
          "The Fixer seals the discrepancy while a funding box replaces the open audit record.",
        tone: "covert",
        focus: [7, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 7, 5, "left", "work"],
          ["auditor", "official", "Federal auditor", 4, 5, "left", "withdraw"],
          ["director", "director", "Director", 6, 6, "right", "observe"],
        ],
        props: [
          ["sealed-discrepancy", "document-box", 8, 5, "secured"],
          ["quiet-funds", "document-box", 6, 5, "active"],
        ],
      },
      {
        title: "A clean desk hides the ownership trail",
        description:
          "The auditor is gone, the corporate lead is dark, and the Fixer controls the sealed box.",
        tone: "corporate",
        focus: [8, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 8, 5, "up", "idle"],
          ["director", "director", "Director", 6, 6, "up", "observe"],
        ],
        props: [
          ["sealed-discrepancy", "document-box", 8, 5, "secured"],
          ["dark-ownership-feed", "monitor-bank", 7, 3, "abandoned"],
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
        focus: [7, 3],
        actors: [
          ["clerk", "official", "Audit clerk", 6, 5, "up", "idle"],
        ],
        props: [
          ["mismatch-feed", "monitor-bank", 7, 3, "active"],
          ["unclaimed-ledger", "dossier", 7, 5, "abandoned"],
        ],
      },
      {
        title: "The clerk marks it as an accounting error",
        description:
          "The red entry is stamped ordinary and moved into the closed document stack.",
        tone: "covert",
        focus: [7, 5],
        actors: [
          ["clerk", "official", "Audit clerk", 7, 5, "up", "work"],
          ["corporate-aide", "corporate", "Unseen intermediary", 10, 5, "left", "observe"],
        ],
        props: [
          ["normalized-ledger", "dossier", 7, 5, "secured"],
          ["closed-audit-stack", "document-box", 7, 5, "secured"],
        ],
      },
      {
        title: "The ownership route disappears from the board",
        description:
          "The audit feed returns to normal while a Corporation signal advances beyond the empty room.",
        tone: "corporate",
        focus: [7, 3],
        actors: [
          ["clerk", "official", "Audit clerk", 4, 5, "left", "exit"],
          ["corporate-aide", "corporate", "Unseen intermediary", 9, 5, "right", "withdraw"],
        ],
        props: [
          ["normalized-feed", "monitor-bank", 7, 3, "secured"],
          ["closed-audit-stack", "document-box", 7, 5, "secured"],
          ["corporate-progress", "warning-beacon", 9, 3, "active"],
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
        focus: [8, 5],
        actors: [
          ["analyst", "analyst", "The Analyst", 5, 5, "right", "address"],
          ["corporate", "corporate", "Hidden corporate owner", 8, 5, "left", "confront"],
          ["workers", "worker", "Contractor crew", 7, 6, "up", "observe"],
          ["security", "security", "Federal officers", 3, 5, "right", "enter"],
        ],
        props: [
          ["ownership-file", "dossier", 7, 5, "active"],
          ["site-corporate-mark", "corporate-seal", 9, 4, "active"],
        ],
      },
      {
        title: "Federal officers take the contractor office",
        description:
          "The corporate seal comes down as officers secure the files and escort the owner out.",
        tone: "crisis",
        focus: [8, 5],
        actors: [
          ["security", "security", "Federal officers", 8, 5, "right", "confront"],
          ["corporate", "corporate", "Hidden corporate owner", 10, 5, "right", "exit"],
          ["analyst", "analyst", "The Analyst", 5, 5, "right", "observe"],
          ["workers", "worker", "Contractor crew", 6, 6, "up", "observe"],
        ],
        props: [
          ["seized-files", "document-box", 8, 5, "secured"],
          ["removed-corporate-mark", "corporate-seal", 9, 4, "damaged"],
          ["seizure-barrier", "barrier", 9, 6, "active"],
        ],
      },
      {
        title: "The worksite reopens under public control",
        description:
          "Crews restart both systems beneath secured evidence and a restored institutional order.",
        tone: "constructive",
        focus: [7, 5],
        actors: [
          ["workers", "worker", "Contractor crew", 7, 5, "up", "work"],
          ["analyst", "analyst", "The Analyst", 5, 5, "right", "observe"],
          ["security", "security", "Federal officers", 9, 6, "left", "observe"],
        ],
        props: [
          ["public-server", "server", 4, 4, "active"],
          ["public-generator", "generator", 9, 5, "active"],
          ["seized-files", "document-box", 7, 5, "secured"],
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
        focus: [7, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 5, 5, "right", "address"],
          ["corporate", "corporate", "Silent partner", 8, 5, "left", "idle"],
          ["director", "director", "Director", 7, 6, "up", "observe"],
        ],
        props: [
          ["controlled-deal", "dossier", 7, 5, "normal"],
          ["channel-box", "document-box", 7, 5, "secured"],
        ],
      },
      {
        title: "The handshake closes over the channel",
        description:
          "The Fixer exchanges protected access with the silent partner while the Director stays outside the circle.",
        tone: "corporate",
        focus: [7, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 6, 5, "right", "address"],
          ["corporate", "corporate", "Silent partner", 7, 5, "left", "address"],
          ["director", "director", "Director", 5, 6, "right", "observe"],
        ],
        props: [
          ["signed-channel", "dossier", 7, 5, "secured"],
          ["channel-box", "document-box", 7, 5, "active"],
        ],
      },
      {
        title: "The Fixer keeps the only key",
        description:
          "A secure monitor connects both sides while the private file remains under the Fixer's control.",
        tone: "corporate",
        focus: [7, 3],
        actors: [
          ["fixer", "fixer", "The Fixer", 6, 5, "up", "idle"],
          ["corporate", "corporate", "Silent partner", 8, 5, "up", "observe"],
          ["director", "director", "Director", 4, 6, "left", "withdraw"],
        ],
        props: [
          ["secret-channel-feed", "monitor-bank", 7, 3, "active"],
          ["signed-channel", "dossier", 6, 5, "secured"],
          ["corporate-risk", "warning-beacon", 9, 3, "active"],
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
        focus: [8, 5],
        actors: [
          ["corporate", "corporate", "Corporate site agent", 8, 5, "left", "idle"],
          ["workers", "worker", "Contractor crew", 7, 6, "up", "work"],
          ["security", "security", "Site security", 4, 6, "right", "observe"],
        ],
        props: [
          ["site-corporate-seal", "corporate-seal", 8, 4, "active"],
          ["unanswered-ownership", "dossier", 7, 5, "abandoned"],
        ],
      },
      {
        title: "Corporate technicians replace the local badges",
        description:
          "A new team crosses the site as private cameras and secured systems come online.",
        tone: "crisis",
        focus: [8, 5],
        actors: [
          ["corporate", "corporate", "Corporate site agent", 8, 5, "right", "address"],
          ["technicians", "corporate", "Corporate technicians", 9, 5, "left", "enter"],
          ["workers", "worker", "Contractor crew", 5, 6, "left", "withdraw"],
          ["security", "security", "Site security", 7, 6, "right", "cross"],
        ],
        props: [
          ["private-server", "server", 8, 4, "active"],
          ["site-corporate-seal", "corporate-seal", 8, 4, "active"],
        ],
      },
      {
        title: "Private systems occupy the worksite",
        description:
          "Corporation staff control the generator, server, and surveillance while the original crew is gone.",
        tone: "corporate",
        focus: [8, 5],
        actors: [
          ["corporate", "corporate", "Corporate site agent", 7, 5, "up", "idle"],
          ["technicians", "corporate", "Corporate technicians", 9, 5, "up", "work"],
          ["security", "security", "Corporate security", 5, 6, "right", "observe"],
        ],
        props: [
          ["private-server", "server", 5, 4, "active"],
          ["private-generator", "generator", 9, 5, "active"],
          ["site-corporate-seal", "corporate-seal", 7, 4, "secured"],
          ["occupation-beacon", "warning-beacon", 10, 3, "active"],
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
        focus: [7, 6],
        actors: [
          ["organizer", "public", "Protest organizer", 6, 6, "right", "idle"],
          ["supporter", "public", "Gate Seven protester", 8, 6, "left", "idle"],
          ["security", "security", "Gate security", 7, 5, "down", "observe"],
        ],
        props: [
          ["small-protest", "crowd-line", 7, 6, "active"],
          ["closed-gate", "barrier", 7, 5, "secured"],
        ],
      },
      {
        title: "The Director crosses without a security line",
        description:
          "The barrier opens and the Director walks out to meet the organizers face-to-face.",
        tone: "constructive",
        focus: [7, 6],
        actors: [
          ["director", "director", "Director", 6, 5, "down", "cross"],
          ["organizer", "public", "Protest organizer", 6, 6, "up", "address"],
          ["supporter", "public", "Gate Seven protester", 8, 6, "left", "observe"],
          ["security", "security", "Gate security", 4, 5, "right", "withdraw"],
        ],
        props: [
          ["open-gate", "barrier", 7, 5, "normal"],
          ["organizer-notes", "dossier", 6, 6, "active"],
        ],
      },
      {
        title: "A shared contact list remains at the open gate",
        description:
          "The Director and organizers stay together around a secured record of the meeting.",
        tone: "constructive",
        focus: [7, 6],
        actors: [
          ["director", "director", "Director", 6, 6, "right", "idle"],
          ["organizer", "public", "Protest organizer", 7, 6, "left", "idle"],
          ["supporter", "public", "Gate Seven protester", 8, 6, "left", "observe"],
          ["security", "security", "Gate security", 4, 5, "right", "observe"],
        ],
        props: [
          ["open-gate", "barrier", 7, 5, "normal"],
          ["shared-contact-list", "dossier", 7, 5, "secured"],
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
        focus: [7, 6],
        actors: [
          ["organizer", "public", "Protest organizer", 6, 6, "right", "confront"],
          ["supporter", "public", "Gate Seven protester", 7, 6, "left", "idle"],
          ["press", "staff", "Press camera", 9, 6, "left", "observe"],
          ["security", "security", "Gate security", 7, 5, "down", "idle"],
        ],
        props: [["protest-line", "crowd-line", 7, 6, "active"]],
      },
      {
        title: "Security lowers the barrier into the crowd",
        description:
          "The gate line advances as organizers withdraw and the press camera records every step.",
        tone: "crisis",
        focus: [7, 6],
        actors: [
          ["security", "security", "Gate security", 7, 5, "down", "confront"],
          ["organizer", "public", "Protest organizer", 4, 6, "left", "withdraw"],
          ["supporter", "public", "Gate Seven protester", 9, 6, "right", "exit"],
          ["press", "staff", "Press camera", 9, 6, "left", "work"],
        ],
        props: [
          ["lowered-barrier", "barrier", 7, 6, "active"],
          ["scattered-line", "crowd-line", 7, 7, "damaged"],
        ],
      },
      {
        title: "The cleared gate survives as footage",
        description:
          "Abandoned protest material remains while the recorded confrontation fills the public monitor.",
        tone: "public",
        focus: [7, 3],
        actors: [
          ["security", "security", "Gate security", 7, 5, "down", "observe"],
          ["press", "staff", "Press camera", 9, 6, "up", "work"],
        ],
        props: [
          ["cleared-gate", "barrier", 7, 6, "secured"],
          ["abandoned-protest", "crowd-line", 7, 7, "abandoned"],
          ["confrontation-feed", "monitor-bank", 7, 3, "active"],
          ["gate-panic", "warning-beacon", 10, 4, "active"],
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
        focus: [7, 6],
        actors: [
          ["organizer", "public", "Protest organizer", 6, 6, "right", "idle"],
          ["supporter", "public", "Gate Seven protester", 7, 6, "left", "idle"],
          ["security", "security", "Unstaffed gate post", 7, 5, "down", "observe"],
        ],
        props: [
          ["waiting-protest", "crowd-line", 7, 6, "normal"],
          ["silent-barrier", "barrier", 7, 5, "secured"],
        ],
      },
      {
        title: "The group builds its own assembly point",
        description:
          "A document box becomes an organizer table as more supporters enter the line.",
        tone: "public",
        focus: [7, 6],
        actors: [
          ["organizer", "public", "Protest organizer", 6, 6, "down", "address"],
          ["supporter", "public", "Gate Seven protester", 5, 6, "right", "cross"],
          ["new-supporter", "public", "New protest supporter", 8, 6, "left", "enter"],
        ],
        props: [
          ["organizer-table", "document-box", 6, 6, "active"],
          ["growing-line", "crowd-line", 7, 6, "active"],
        ],
      },
      {
        title: "A larger movement owns the perimeter",
        description:
          "The self-organized crowd spans Gate Seven beneath its own active information feed.",
        tone: "crisis",
        focus: [7, 6],
        actors: [
          ["organizer", "public", "Protest organizer", 6, 6, "down", "address"],
          ["supporter", "public", "Gate Seven protester", 5, 6, "right", "idle"],
          ["new-supporter", "public", "New protest supporter", 8, 6, "left", "idle"],
          ["security", "security", "Unstaffed gate post", 7, 5, "down", "withdraw"],
        ],
        props: [
          ["movement-line", "crowd-line", 7, 7, "active"],
          ["organizer-table", "document-box", 6, 6, "secured"],
          ["movement-feed", "monitor-bank", 7, 3, "active"],
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
        focus: [7, 6],
        actors: [
          ["organizer", "public", "National organizer", 6, 6, "right", "address"],
          ["marcher-a", "public", "March delegate", 4, 6, "right", "idle"],
          ["marcher-b", "public", "March delegate", 8, 6, "left", "idle"],
          ["security", "security", "Gate security", 7, 5, "down", "observe"],
        ],
        props: [
          ["national-crowd", "crowd-line", 7, 7, "active"],
          ["national-podium", "podium", 7, 5, "normal"],
          ["national-gate", "barrier", 7, 5, "secured"],
        ],
      },
      {
        title: "The gate opens for the address",
        description:
          "The Director takes the podium and invites movement delegates across the perimeter.",
        tone: "constructive",
        focus: [7, 5],
        actors: [
          ["director", "director", "Director", 7, 5, "down", "address"],
          ["organizer", "public", "National organizer", 6, 6, "up", "observe"],
          ["marcher-a", "public", "March delegate", 5, 6, "up", "cross"],
          ["marcher-b", "public", "March delegate", 8, 6, "up", "cross"],
          ["security", "security", "Gate security", 4, 5, "right", "withdraw"],
        ],
        props: [
          ["national-crowd", "crowd-line", 7, 7, "active"],
          ["national-podium", "podium", 7, 5, "active"],
          ["open-national-gate", "barrier", 7, 5, "normal"],
        ],
      },
      {
        title: "The march becomes a negotiated settlement",
        description:
          "Delegates gather around a secured coalition charter as the crowd lowers its line.",
        tone: "constructive",
        focus: [7, 6],
        actors: [
          ["director", "director", "Director", 6, 5, "right", "idle"],
          ["organizer", "public", "National organizer", 7, 5, "left", "idle"],
          ["marcher-a", "public", "March delegate", 5, 6, "right", "observe"],
          ["marcher-b", "public", "March delegate", 8, 6, "left", "observe"],
          ["steward", "steward", "The Steward", 7, 5, "down", "observe"],
        ],
        props: [
          ["coalition-charter", "dossier", 7, 5, "secured"],
          ["settled-crowd", "crowd-line", 7, 7, "normal"],
          ["open-national-gate", "barrier", 7, 5, "normal"],
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
        focus: [7, 6],
        actors: [
          ["organizer", "public", "National organizer", 6, 6, "right", "address"],
          ["marcher-a", "public", "March delegate", 4, 6, "right", "idle"],
          ["marcher-b", "public", "March delegate", 8, 6, "left", "idle"],
          ["security", "security", "Gate security", 7, 5, "down", "observe"],
        ],
        props: [
          ["march-line", "crowd-line", 7, 7, "active"],
          ["open-perimeter", "barrier", 7, 5, "normal"],
        ],
      },
      {
        title: "Barriers and spotlights seal the avenue",
        description:
          "Security advances beneath warning beacons as the facility closes against the crowd.",
        tone: "crisis",
        focus: [7, 5],
        actors: [
          ["security", "security", "Gate security", 7, 5, "down", "confront"],
          ["security-left", "security", "Security line", 5, 5, "down", "enter"],
          ["security-right", "security", "Security line", 8, 5, "down", "enter"],
          ["organizer", "public", "National organizer", 6, 6, "up", "confront"],
          ["marcher-a", "public", "March delegate", 4, 6, "right", "idle"],
          ["marcher-b", "public", "March delegate", 9, 6, "left", "idle"],
        ],
        props: [
          ["sealed-perimeter", "barrier", 7, 6, "secured"],
          ["security-beacon-left", "warning-beacon", 4, 4, "active"],
          ["security-beacon-right", "warning-beacon", 9, 4, "active"],
        ],
      },
      {
        title: "Suppression gives the movement a permanent image",
        description:
          "The security line holds while the crowd grows denser behind warning light and damaged institutions.",
        tone: "public",
        focus: [7, 6],
        actors: [
          ["security", "security", "Gate security", 7, 5, "down", "confront"],
          ["security-left", "security", "Security line", 5, 5, "down", "idle"],
          ["security-right", "security", "Security line", 8, 5, "down", "idle"],
          ["organizer", "public", "National organizer", 7, 6, "up", "address"],
          ["marcher-a", "public", "March delegate", 4, 7, "right", "idle"],
          ["marcher-b", "public", "March delegate", 9, 7, "left", "idle"],
        ],
        props: [
          ["suppressed-crowd", "crowd-line", 7, 7, "active"],
          ["sealed-perimeter", "barrier", 7, 6, "secured"],
          ["security-beacon-left", "warning-beacon", 4, 4, "active"],
          ["security-beacon-right", "warning-beacon", 9, 4, "active"],
          ["damaged-authority", "podium", 7, 5, "damaged"],
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
        focus: [7, 6],
        actors: [
          ["organizer", "public", "National organizer", 6, 6, "right", "address"],
          ["marcher-a", "public", "March delegate", 4, 6, "right", "idle"],
          ["marcher-b", "public", "March delegate", 9, 6, "left", "idle"],
        ],
        props: [
          ["march-line", "crowd-line", 7, 7, "active"],
          ["empty-podium", "podium", 7, 5, "abandoned"],
          ["silent-government-feed", "monitor-bank", 7, 3, "abandoned"],
        ],
      },
      {
        title: "The movement passes the silent gate",
        description:
          "With no address or ban, delegates cross the perimeter and carry the march beyond the facility.",
        tone: "crisis",
        focus: [7, 6],
        actors: [
          ["organizer", "public", "National organizer", 7, 6, "up", "cross"],
          ["marcher-a", "public", "March delegate", 5, 6, "up", "cross"],
          ["marcher-b", "public", "March delegate", 8, 6, "up", "cross"],
          ["new-marchers", "public", "National march", 7, 7, "up", "enter"],
        ],
        props: [
          ["advancing-march", "crowd-line", 7, 6, "active"],
          ["empty-podium", "podium", 7, 5, "abandoned"],
          ["irrelevant-gate", "barrier", 7, 5, "abandoned"],
        ],
      },
      {
        title: "The crowd replaces the government frame",
        description:
          "The march occupies the entire civic perimeter while institutions and official screens stay dark.",
        tone: "public",
        focus: [7, 6],
        actors: [
          ["organizer", "public", "National organizer", 7, 6, "down", "address"],
          ["marcher-a", "public", "March delegate", 4, 6, "right", "idle"],
          ["marcher-b", "public", "March delegate", 9, 6, "left", "idle"],
          ["new-marchers", "public", "National march", 7, 7, "up", "idle"],
        ],
        props: [
          ["countrywide-crowd", "crowd-line", 7, 7, "active"],
          ["empty-podium", "podium", 7, 5, "abandoned"],
          ["dark-institutions", "monitor-bank", 7, 3, "damaged"],
          ["national-panic", "warning-beacon", 10, 4, "active"],
        ],
      },
    ],
  ),
} satisfies Readonly<Record<string, NarrativeSceneScript>>;
