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

export const CARD_SCENE_SCRIPTS_1 = {
  "card:budget_shortfall:cut": cardScene(
    "card:budget_shortfall:cut",
    "oversight-chamber",
    "The Public Ledger Is Cut",
    [
      {
        title: "The appropriation arrives incomplete",
        description:
          "A committee clerk sets the missing appropriation beside the public-program ledger.",
        tone: "institutional",
        focus: [7, 4],
        actors: [
          ["director", "director", "Director", 7, 6, "up", "observe"],
          ["clerk", "official", "Committee clerk", 5, 4, "right", "enter"],
          ["public", "public", "Public delegates", 9, 6, "left", "observe"],
        ],
        props: [["appropriation-file", "dossier", 7, 4, "normal"]],
      },
      {
        title: "Programs leave the page",
        description:
          "The Director stamps through public lines while a sealed funding box crosses toward BRB.",
        tone: "crisis",
        focus: [7, 5],
        actors: [
          ["director", "director", "Director", 7, 5, "up", "work"],
          ["clerk", "official", "Committee clerk", 8, 4, "left", "work"],
          ["courier", "staff", "Funding courier", 9, 5, "right", "cross"],
        ],
        props: [
          ["cut-ledger", "dossier", 6, 4, "damaged"],
          ["funding-box", "document-box", 8, 5, "secured"],
        ],
      },
      {
        title: "The project is funded in an empty room",
        description:
          "The BRB case remains secured as public delegates withdraw from the chamber.",
        tone: "public",
        focus: [9, 5],
        actors: [
          ["director", "director", "Director", 7, 5, "down", "idle"],
          ["public", "public", "Public delegates", 10, 6, "right", "withdraw"],
        ],
        props: [
          ["funding-box", "document-box", 8, 5, "secured"],
          ["cut-ledger", "dossier", 6, 4, "damaged"],
        ],
      },
    ],
  ),
  "card:budget_shortfall:delay": cardScene(
    "card:budget_shortfall:delay",
    "continuity-floor",
    "The Schedule Slips",
    [
      {
        title: "Engineering waits on a vanished promise",
        description:
          "Staff gather at the operations table while the appropriation line blinks unanswered.",
        tone: "institutional",
        focus: [7, 4],
        actors: [
          ["director", "director", "Director", 7, 6, "up", "observe"],
          ["engineer-a", "worker", "Lead engineer", 5, 5, "right", "idle"],
          ["engineer-b", "worker", "Systems engineer", 8, 5, "left", "idle"],
        ],
        props: [["schedule", "dossier", 7, 4, "normal"]],
      },
      {
        title: "No signature comes",
        description:
          "The work teams leave the table as the schedule advances without a funding decision.",
        tone: "crisis",
        focus: [7, 5],
        actors: [
          ["director", "director", "Director", 7, 5, "up", "idle"],
          ["engineer-a", "worker", "Lead engineer", 4, 6, "left", "exit"],
          ["engineer-b", "worker", "Systems engineer", 9, 6, "right", "exit"],
        ],
        props: [
          ["schedule", "dossier", 7, 4, "abandoned"],
          ["delay-beacon", "warning-beacon", 9, 3, "active"],
        ],
      },
      {
        title: "Paper replaces progress",
        description:
          "An abandoned schedule and a growing document stack mark the delayed month.",
        tone: "crisis",
        focus: [7, 5],
        actors: [
          ["director", "director", "Director", 7, 6, "up", "observe"],
          ["staff", "staff", "Schedule staff", 5, 5, "right", "work"],
        ],
        props: [
          ["schedule", "dossier", 7, 4, "abandoned"],
          ["delay-stack", "document-box", 5, 5, "active"],
          ["delay-beacon", "warning-beacon", 9, 3, "active"],
        ],
      },
    ],
  ),
  "card:budget_shortfall:ignored": cardScene(
    "card:budget_shortfall:ignored",
    "oversight-chamber",
    "The Corporation Writes the Budget",
    [
      {
        title: "The government chair stays empty",
        description:
          "The missing appropriation waits before an unoccupied witness position.",
        tone: "institutional",
        focus: [7, 4],
        actors: [
          ["clerk", "official", "Committee clerk", 5, 4, "right", "observe"],
          ["corporate-aide", "corporate", "Corporation aide", 8, 4, "left", "enter"],
        ],
        props: [["unanswered-file", "dossier", 7, 4, "abandoned"]],
      },
      {
        title: "A private hand removes the funds",
        description:
          "The Corporation aide carries the budget case away while the hearing cameras continue.",
        tone: "corporate",
        focus: [8, 5],
        actors: [
          ["clerk", "official", "Committee clerk", 5, 4, "right", "withdraw"],
          ["corporate-aide", "corporate", "Corporation aide", 9, 5, "right", "cross"],
          ["camera-staff", "staff", "Broadcast crew", 10, 6, "left", "observe"],
        ],
        props: [
          ["unanswered-file", "dossier", 6, 4, "abandoned"],
          ["lost-funds", "document-box", 8, 5, "secured"],
        ],
      },
      {
        title: "Neglect becomes the public record",
        description:
          "The funding box is gone and a hostile account fills the chamber's broadcast feed.",
        tone: "public",
        focus: [7, 3],
        actors: [
          ["camera-staff", "staff", "Broadcast crew", 9, 6, "up", "work"],
          ["corporate-aide", "corporate", "Corporation aide", 10, 5, "left", "idle"],
        ],
        props: [
          ["public-feed", "monitor-bank", 7, 3, "active"],
          ["unanswered-file", "dossier", 6, 4, "abandoned"],
        ],
      },
    ],
  ),
  "card:whistleblower:protect": cardScene(
    "card:whistleblower:protect",
    "secure-briefing",
    "The Witness Is Protected",
    [
      {
        title: "The red folder enters the secure room",
        description:
          "The Steward presents the witness and the procurement evidence under camera watch.",
        tone: "covert",
        focus: [7, 5],
        actors: [
          ["steward", "steward", "The Steward", 5, 5, "right", "address"],
          ["witness", "public", "Whistleblower", 8, 5, "left", "idle"],
          ["security", "security", "Protective officer", 9, 5, "left", "observe"],
        ],
        props: [["red-folder", "dossier", 7, 5, "active"]],
      },
      {
        title: "Protection closes around the evidence",
        description:
          "Security seals the briefing room while the red folder enters protected custody.",
        tone: "constructive",
        focus: [8, 4],
        actors: [
          ["steward", "steward", "The Steward", 6, 5, "right", "observe"],
          ["witness", "public", "Whistleblower", 7, 5, "right", "cross"],
          ["security", "security", "Protective officer", 9, 5, "left", "work"],
        ],
        props: [
          ["red-folder", "dossier", 8, 4, "secured"],
          ["evidence-custody", "document-box", 8, 5, "secured"],
        ],
      },
      {
        title: "Institutions keep the witness in the room",
        description:
          "The protected witness remains beside the Steward as the evidence monitor turns green.",
        tone: "constructive",
        focus: [7, 4],
        actors: [
          ["steward", "steward", "The Steward", 6, 5, "right", "idle"],
          ["witness", "public", "Protected whistleblower", 7, 5, "left", "idle"],
          ["security", "security", "Protective officer", 9, 5, "left", "observe"],
        ],
        props: [
          ["red-folder", "dossier", 7, 4, "secured"],
          ["protected-feed", "monitor-bank", 7, 3, "secured"],
        ],
      },
    ],
  ),
  "card:whistleblower:contain": cardScene(
    "card:whistleblower:contain",
    "secure-briefing",
    "The Fixer Owns the Secret",
    [
      {
        title: "The witness waits outside the light",
        description:
          "The Fixer approaches the whistleblower while the Steward's red folder sits unopened.",
        tone: "covert",
        focus: [7, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 5, 5, "right", "enter"],
          ["witness", "public", "Whistleblower", 8, 5, "left", "idle"],
          ["steward", "steward", "The Steward", 9, 5, "left", "observe"],
        ],
        props: [["red-folder", "dossier", 7, 5, "normal"]],
      },
      {
        title: "The folder changes hands",
        description:
          "The Fixer closes the evidence inside a private document box and directs the witness away.",
        tone: "covert",
        focus: [6, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 6, 5, "right", "work"],
          ["witness", "public", "Whistleblower", 9, 5, "right", "exit"],
          ["steward", "steward", "The Steward", 10, 6, "left", "withdraw"],
        ],
        props: [
          ["red-folder", "dossier", 6, 4, "secured"],
          ["private-box", "document-box", 6, 5, "secured"],
        ],
      },
      {
        title: "Containment leaves an empty chair",
        description:
          "The Fixer remains alone with the secured box as the institutional feed fractures.",
        tone: "corporate",
        focus: [6, 5],
        actors: [
          ["fixer", "fixer", "The Fixer", 6, 5, "up", "idle"],
          ["steward", "steward", "The Steward", 10, 6, "right", "withdraw"],
        ],
        props: [
          ["private-box", "document-box", 6, 5, "secured"],
          ["damaged-feed", "monitor-bank", 7, 3, "damaged"],
        ],
      },
    ],
  ),
  "card:whistleblower:ignored": cardScene(
    "card:whistleblower:ignored",
    "secure-briefing",
    "Silence Is Read as Guilt",
    [
      {
        title: "The folder waits under one lamp",
        description:
          "The witness sits alone with the red folder while every government position stays empty.",
        tone: "covert",
        focus: [7, 5],
        actors: [
          ["witness", "public", "Whistleblower", 7, 5, "up", "idle"],
          ["security", "security", "Unassigned security post", 9, 5, "left", "observe"],
        ],
        props: [["red-folder", "dossier", 7, 4, "abandoned"]],
      },
      {
        title: "The witness walks toward the cameras",
        description:
          "No official arrives, so the whistleblower carries the accusation out of the secure room.",
        tone: "crisis",
        focus: [9, 5],
        actors: [
          ["witness", "public", "Whistleblower", 9, 5, "right", "exit"],
          ["press", "staff", "Press camera", 10, 5, "left", "observe"],
        ],
        props: [
          ["red-folder", "dossier", 8, 5, "active"],
          ["open-evidence-box", "document-box", 7, 5, "abandoned"],
        ],
      },
      {
        title: "The leak becomes the only explanation",
        description:
          "Procurement footage takes over the monitor bank as panic washes through the room.",
        tone: "public",
        focus: [7, 3],
        actors: [
          ["press", "staff", "Press camera", 9, 5, "up", "work"],
          ["witness", "public", "Whistleblower", 8, 5, "up", "address"],
        ],
        props: [
          ["leak-feed", "monitor-bank", 7, 3, "active"],
          ["panic-beacon", "warning-beacon", 10, 4, "active"],
        ],
      },
    ],
  ),
  "card:contractor_strike:pay": cardScene(
    "card:contractor_strike:pay",
    "infrastructure-site",
    "The Crews Return",
    [
      {
        title: "The machines stand behind the picket",
        description:
          "Contractors hold the line around abandoned tools and a dark site generator.",
        tone: "public",
        focus: [6, 5],
        actors: [
          ["organizer", "worker", "Contractor organizer", 6, 6, "right", "confront"],
          ["workers", "worker", "Walkout crew", 8, 6, "left", "idle"],
          ["director", "director", "Director", 4, 5, "right", "enter"],
        ],
        props: [
          ["picket-line", "crowd-line", 7, 6, "active"],
          ["idle-generator", "generator", 9, 5, "abandoned"],
        ],
      },
      {
        title: "The settlement crosses the barrier",
        description:
          "A government funding box reaches the organizer and the locked site opens.",
        tone: "constructive",
        focus: [6, 5],
        actors: [
          ["director", "director", "Director", 5, 5, "right", "address"],
          ["organizer", "worker", "Contractor organizer", 7, 5, "left", "address"],
          ["workers", "worker", "Walkout crew", 9, 6, "left", "observe"],
        ],
        props: [
          ["settlement-box", "document-box", 6, 5, "secured"],
          ["raised-barrier", "barrier", 7, 6, "normal"],
        ],
      },
      {
        title: "Safer work restarts the project",
        description:
          "Both crews return to their stations as the toolbox opens and the generator lights.",
        tone: "constructive",
        focus: [8, 5],
        actors: [
          ["organizer", "worker", "Contractor organizer", 6, 5, "right", "work"],
          ["workers", "worker", "Returning crew", 8, 5, "left", "work"],
          ["director", "director", "Director", 4, 6, "right", "observe"],
        ],
        props: [
          ["working-generator", "generator", 9, 5, "active"],
          ["full-toolbox", "document-box", 7, 5, "active"],
        ],
      },
    ],
  ),
  "card:contractor_strike:replace": cardScene(
    "card:contractor_strike:replace",
    "infrastructure-site",
    "Replacement Crews Cross the Line",
    [
      {
        title: "The walkout freezes the prototype",
        description:
          "Organizers stand between the gate and the powered-down construction equipment.",
        tone: "public",
        focus: [7, 6],
        actors: [
          ["organizer", "worker", "Contractor organizer", 6, 6, "right", "confront"],
          ["workers", "worker", "Walkout crew", 7, 6, "left", "confront"],
          ["security", "security", "Site security", 4, 5, "right", "observe"],
        ],
        props: [["walkout-line", "crowd-line", 7, 6, "active"]],
      },
      {
        title: "Security opens a path for replacements",
        description:
          "The original crew withdraws as a new team crosses through the controlled gate.",
        tone: "crisis",
        focus: [7, 5],
        actors: [
          ["organizer", "worker", "Contractor organizer", 4, 6, "left", "withdraw"],
          ["workers", "worker", "Walkout crew", 5, 6, "left", "exit"],
          ["security", "security", "Site security", 7, 5, "right", "confront"],
          ["replacement", "worker", "Replacement crew", 9, 6, "left", "enter"],
        ],
        props: [["controlled-barrier", "barrier", 7, 6, "active"]],
      },
      {
        title: "The site runs with missing knowledge",
        description:
          "Replacement workers face sputtering systems while abandoned helmets mark the cleared line.",
        tone: "crisis",
        focus: [8, 5],
        actors: [
          ["replacement", "worker", "Replacement crew", 8, 5, "right", "work"],
          ["security", "security", "Site security", 6, 6, "right", "observe"],
        ],
        props: [
          ["unstable-generator", "generator", 9, 5, "damaged"],
          ["empty-toolbox", "document-box", 5, 5, "abandoned"],
          ["stress-beacon", "warning-beacon", 10, 3, "active"],
        ],
      },
    ],
  ),
  "card:contractor_strike:ignored": cardScene(
    "card:contractor_strike:ignored",
    "infrastructure-site",
    "The Walkout Organizes Itself",
    [
      {
        title: "Workers wait outside the locked site",
        description:
          "The crew holds a quiet line while the unattended machinery remains dark.",
        tone: "public",
        focus: [7, 6],
        actors: [
          ["organizer", "worker", "Contractor organizer", 6, 6, "right", "idle"],
          ["workers", "worker", "Walkout crew", 7, 6, "left", "idle"],
        ],
        props: [
          ["closed-gate", "barrier", 7, 5, "secured"],
          ["idle-generator", "generator", 9, 5, "abandoned"],
        ],
      },
      {
        title: "The picket expands beyond the contractors",
        description:
          "More workers cross into the line as no government negotiator appears.",
        tone: "crisis",
        focus: [7, 6],
        actors: [
          ["organizer", "worker", "Contractor organizer", 6, 5, "down", "address"],
          ["workers", "worker", "Walkout crew", 5, 6, "right", "cross"],
          ["supporters", "public", "Labor supporters", 8, 6, "left", "enter"],
        ],
        props: [["growing-picket", "crowd-line", 7, 6, "active"]],
      },
      {
        title: "A movement occupies the gate",
        description:
          "The crowd line now spans the site while empty tools and alarms signal lost capacity.",
        tone: "public",
        focus: [7, 6],
        actors: [
          ["organizer", "worker", "Contractor organizer", 7, 5, "down", "address"],
          ["workers", "worker", "Organized labor line", 5, 6, "right", "idle"],
          ["supporters", "public", "Labor supporters", 8, 6, "left", "idle"],
        ],
        props: [
          ["movement-line", "crowd-line", 7, 6, "active"],
          ["empty-toolbox", "document-box", 4, 5, "abandoned"],
          ["site-alarm", "warning-beacon", 10, 4, "active"],
        ],
      },
    ],
  ),
  "card:public_hearing:transparent": cardScene(
    "card:public_hearing:transparent",
    "oversight-chamber",
    "Testimony Goes Public",
    [
      {
        title: "The country watches the witness chair",
        description:
          "Broadcast staff frame a full gallery and the open government dossier.",
        tone: "public",
        focus: [7, 5],
        actors: [
          ["director", "director", "Director", 7, 6, "up", "enter"],
          ["camera", "staff", "Broadcast crew", 10, 6, "left", "observe"],
          ["gallery", "public", "Public gallery", 4, 6, "right", "observe"],
          ["corporate", "corporate", "Corporation counsel", 8, 4, "left", "idle"],
        ],
        props: [["open-testimony", "dossier", 7, 5, "active"]],
      },
      {
        title: "The Director opens the record",
        description:
          "Public answers move from the dossier to the live feed under the chamber lights.",
        tone: "institutional",
        focus: [7, 5],
        actors: [
          ["director", "director", "Director", 7, 5, "up", "address"],
          ["camera", "staff", "Broadcast crew", 9, 5, "left", "work"],
          ["gallery", "public", "Public gallery", 4, 6, "right", "observe"],
          ["corporate", "corporate", "Corporation counsel", 8, 4, "left", "confront"],
        ],
        props: [
          ["open-testimony", "dossier", 7, 5, "active"],
          ["live-feed", "monitor-bank", 7, 2, "active"],
        ],
      },
      {
        title: "Transparency narrows every future denial",
        description:
          "The gallery remains engaged while Corporation counsel stands exposed beside the public record.",
        tone: "constructive",
        focus: [7, 4],
        actors: [
          ["director", "director", "Director", 7, 5, "up", "idle"],
          ["gallery", "public", "Public gallery", 4, 6, "right", "observe"],
          ["corporate", "corporate", "Corporation counsel", 9, 4, "right", "withdraw"],
        ],
        props: [
          ["public-record", "dossier", 7, 5, "secured"],
          ["live-feed", "monitor-bank", 7, 2, "active"],
        ],
      },
    ],
  ),
  "card:public_hearing:closed": cardScene(
    "card:public_hearing:closed",
    "oversight-chamber",
    "Oversight Moves Behind Closed Doors",
    [
      {
        title: "Cameras prepare for an open hearing",
        description:
          "The witness file, public gallery, and live crew all wait for testimony.",
        tone: "public",
        focus: [7, 5],
        actors: [
          ["director", "director", "Director", 7, 6, "up", "observe"],
          ["camera", "staff", "Broadcast crew", 9, 6, "left", "idle"],
          ["gallery", "public", "Public gallery", 4, 6, "right", "idle"],
          ["security", "security", "Chamber security", 8, 5, "left", "observe"],
        ],
        props: [["hearing-file-closed", "dossier", 7, 5, "normal"]],
      },
      {
        title: "The doors close on the public",
        description:
          "Security clears the gallery while the Director carries the file to a classified table.",
        tone: "covert",
        focus: [8, 5],
        actors: [
          ["director", "director", "Director", 8, 5, "right", "cross"],
          ["camera", "staff", "Broadcast crew", 10, 6, "right", "exit"],
          ["gallery", "public", "Public gallery", 3, 6, "left", "exit"],
          ["security", "security", "Chamber security", 6, 5, "left", "confront"],
        ],
        props: [
          ["classified-file", "dossier", 8, 5, "secured"],
          ["closed-session-table", "briefing-table", 8, 5, "secured"],
        ],
      },
      {
        title: "A classified hearing replaces the public one",
        description:
          "The broadcast is dark, the gallery is empty, and only a sealed account remains.",
        tone: "covert",
        focus: [8, 5],
        actors: [
          ["director", "director", "Director", 8, 5, "up", "idle"],
          ["security", "security", "Chamber security", 6, 5, "right", "observe"],
        ],
        props: [
          ["classified-file", "dossier", 8, 5, "secured"],
          ["dark-feed", "monitor-bank", 7, 2, "abandoned"],
        ],
      },
    ],
  ),
  "card:public_hearing:ignored": cardScene(
    "card:public_hearing:ignored",
    "oversight-chamber",
    "The Corporation Supplies the Testimony",
    [
      {
        title: "The government side does not appear",
        description:
          "A vacant witness position faces cameras and a waiting Corporation spokesperson.",
        tone: "institutional",
        focus: [7, 5],
        actors: [
          ["corporate", "corporate", "Corporation spokesperson", 8, 5, "left", "enter"],
          ["camera", "staff", "Broadcast crew", 10, 6, "left", "observe"],
          ["gallery", "public", "Public gallery", 4, 6, "right", "observe"],
        ],
        props: [["empty-government-file", "dossier", 6, 5, "abandoned"]],
      },
      {
        title: "A corporate dossier fills the silence",
        description:
          "The spokesperson takes the podium and supplies a private account to the national feed.",
        tone: "corporate",
        focus: [7, 5],
        actors: [
          ["corporate", "corporate", "Corporation spokesperson", 7, 5, "up", "address"],
          ["camera", "staff", "Broadcast crew", 9, 5, "left", "work"],
          ["gallery", "public", "Public gallery", 4, 6, "right", "observe"],
        ],
        props: [
          ["corporate-account", "dossier", 7, 5, "active"],
          ["corporate-feed", "monitor-bank", 7, 2, "active"],
        ],
      },
      {
        title: "Their account becomes the public account",
        description:
          "The gallery turns toward the Corporation seal as the government file remains abandoned.",
        tone: "public",
        focus: [8, 4],
        actors: [
          ["corporate", "corporate", "Corporation spokesperson", 7, 5, "up", "idle"],
          ["gallery", "public", "Public gallery", 5, 6, "right", "observe"],
        ],
        props: [
          ["corporate-account", "dossier", 7, 5, "secured"],
          ["corporate-seal-hearing", "corporate-seal", 8, 3, "active"],
          ["empty-government-file", "dossier", 6, 5, "abandoned"],
        ],
      },
    ],
  ),
  "card:insider_offer:deal": cardScene(
    "card:insider_offer:deal",
    "secure-briefing",
    "Immunity Buys the Plans",
    [
      {
        title: "The defector waits across from the Analyst",
        description:
          "Corporation plans and unsigned immunity papers share the secure table.",
        tone: "covert",
        focus: [7, 5],
        actors: [
          ["analyst", "analyst", "The Analyst", 5, 5, "right", "observe"],
          ["defector", "corporate", "Corporation defector", 8, 5, "left", "idle"],
          ["director", "director", "Director", 7, 6, "up", "enter"],
          ["security", "security", "Protective officer", 10, 5, "left", "observe"],
        ],
        props: [
          ["immunity-file", "dossier", 6, 5, "normal"],
          ["corporate-plans", "document-box", 7, 5, "secured"],
        ],
      },
      {
        title: "The signature opens the Corporation plans",
        description:
          "The Director grants the pass as the defector releases the protected intelligence.",
        tone: "covert",
        focus: [7, 5],
        actors: [
          ["director", "director", "Director", 6, 5, "right", "work"],
          ["defector", "corporate", "Corporation defector", 8, 5, "left", "address"],
          ["analyst", "analyst", "The Analyst", 5, 5, "right", "observe"],
          ["security", "security", "Protective officer", 9, 5, "left", "work"],
        ],
        props: [
          ["signed-immunity", "dossier", 6, 5, "secured"],
          ["open-plans", "document-box", 7, 5, "active"],
        ],
      },
      {
        title: "Intelligence fills the room at a public cost",
        description:
          "The plans illuminate every monitor while the protected defector remains under surveillance.",
        tone: "corporate",
        focus: [7, 3],
        actors: [
          ["analyst", "analyst", "The Analyst", 5, 5, "up", "work"],
          ["defector", "corporate", "Protected defector", 8, 5, "up", "idle"],
          ["security", "security", "Protective officer", 9, 5, "left", "observe"],
        ],
        props: [
          ["plans-feed", "monitor-bank", 7, 3, "active"],
          ["signed-immunity", "dossier", 7, 5, "secured"],
        ],
      },
    ],
  ),
  "card:insider_offer:sting": cardScene(
    "card:insider_offer:sting",
    "secure-briefing",
    "The Offer Becomes a Sting",
    [
      {
        title: "The Analyst wires the bait",
        description:
          "A false handoff file is positioned beneath the secure-room surveillance feed.",
        tone: "covert",
        focus: [6, 5],
        actors: [
          ["analyst", "analyst", "The Analyst", 5, 5, "right", "work"],
          ["defector", "corporate", "Corporation defector", 8, 5, "left", "idle"],
          ["security", "security", "Sting team", 10, 5, "left", "observe"],
        ],
        props: [["bait-file", "dossier", 6, 5, "active"]],
      },
      {
        title: "The courier enters the trap",
        description:
          "The defector carries the marked file toward a Corporation courier as the sting team closes.",
        tone: "crisis",
        focus: [8, 5],
        actors: [
          ["defector", "corporate", "Corporation defector", 7, 5, "right", "cross"],
          ["courier", "corporate", "Corporation courier", 9, 5, "left", "enter"],
          ["security", "security", "Sting team", 8, 6, "up", "confront"],
          ["analyst", "analyst", "The Analyst", 5, 5, "right", "observe"],
        ],
        props: [["marked-file", "dossier", 8, 5, "active"]],
      },
      {
        title: "The Corporation searches its own channels",
        description:
          "The courier is contained while the Corporation network fractures across the monitors.",
        tone: "crisis",
        focus: [7, 3],
        actors: [
          ["security", "security", "Sting team", 8, 5, "left", "confront"],
          ["courier", "corporate", "Corporation courier", 9, 5, "left", "withdraw"],
          ["analyst", "analyst", "The Analyst", 5, 5, "up", "work"],
        ],
        props: [
          ["broken-network", "monitor-bank", 7, 3, "damaged"],
          ["search-beacon", "warning-beacon", 10, 3, "active"],
        ],
      },
    ],
  ),
  "card:insider_offer:ignored": cardScene(
    "card:insider_offer:ignored",
    "secure-briefing",
    "The Defector Returns",
    [
      {
        title: "The defector waits beside the exit",
        description:
          "Corporation plans remain closed while every government chair stays empty.",
        tone: "covert",
        focus: [8, 5],
        actors: [
          ["defector", "corporate", "Corporation defector", 8, 5, "right", "idle"],
          ["security", "security", "Unassigned security post", 10, 5, "left", "observe"],
        ],
        props: [["closed-plans", "document-box", 7, 5, "secured"]],
      },
      {
        title: "The offer expires unanswered",
        description:
          "The defector takes the plans through the secure exit without making the exchange.",
        tone: "covert",
        focus: [9, 5],
        actors: [
          ["defector", "corporate", "Corporation defector", 9, 5, "right", "exit"],
          ["security", "security", "Unassigned security post", 7, 5, "right", "observe"],
        ],
        props: [
          ["departing-plans", "document-box", 9, 5, "secured"],
          ["empty-table", "dossier", 7, 5, "abandoned"],
        ],
      },
      {
        title: "The Corporation receives its executive back",
        description:
          "The government monitor goes dark as a corporate progress signal confirms the return.",
        tone: "corporate",
        focus: [7, 3],
        actors: [
          ["security", "security", "Unassigned security post", 7, 5, "right", "withdraw"],
        ],
        props: [
          ["corporate-progress-feed", "monitor-bank", 7, 3, "active"],
          ["empty-table", "dossier", 7, 5, "abandoned"],
        ],
      },
    ],
  ),
} satisfies Readonly<Record<string, NarrativeSceneScript>>;
