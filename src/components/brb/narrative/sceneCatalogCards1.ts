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
        focus: [50, 39],
        actors: [
          ["director", "director", "Director", 50, 68, "up", "observe"],
          ["clerk", "official", "Committee clerk", 38, 42, "right", "enter"],
          ["public", "public", "Public delegates", 72, 72, "left", "observe"],
        ],
        props: [["appropriation-file", "dossier", 50, 39, "normal"]],
      },
      {
        title: "Programs leave the page",
        description:
          "The Director stamps through public lines while a sealed funding box crosses toward BRB.",
        tone: "crisis",
        focus: [53, 53],
        actors: [
          ["director", "director", "Director", 50, 58, "up", "work"],
          ["clerk", "official", "Committee clerk", 60, 46, "left", "work"],
          ["courier", "staff", "Funding courier", 70, 58, "right", "cross"],
        ],
        props: [
          ["cut-ledger", "dossier", 48, 45, "damaged"],
          ["funding-box", "document-box", 68, 54, "secured"],
        ],
      },
      {
        title: "The project is funded in an empty room",
        description:
          "The BRB case remains secured as public delegates withdraw from the chamber.",
        tone: "public",
        focus: [70, 57],
        actors: [
          ["director", "director", "Director", 52, 58, "down", "idle"],
          ["public", "public", "Public delegates", 84, 75, "right", "withdraw"],
        ],
        props: [
          ["funding-box", "document-box", 68, 54, "secured"],
          ["cut-ledger", "dossier", 47, 44, "damaged"],
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
        focus: [50, 48],
        actors: [
          ["director", "director", "Director", 50, 68, "up", "observe"],
          ["engineer-a", "worker", "Lead engineer", 35, 58, "right", "idle"],
          ["engineer-b", "worker", "Systems engineer", 65, 58, "left", "idle"],
        ],
        props: [["schedule", "dossier", 50, 49, "normal"]],
      },
      {
        title: "No signature comes",
        description:
          "The work teams leave the table as the schedule advances without a funding decision.",
        tone: "crisis",
        focus: [50, 52],
        actors: [
          ["director", "director", "Director", 50, 62, "up", "idle"],
          ["engineer-a", "worker", "Lead engineer", 23, 67, "left", "exit"],
          ["engineer-b", "worker", "Systems engineer", 77, 67, "right", "exit"],
        ],
        props: [
          ["schedule", "dossier", 50, 49, "abandoned"],
          ["delay-beacon", "warning-beacon", 72, 35, "active"],
        ],
      },
      {
        title: "Paper replaces progress",
        description:
          "An abandoned schedule and a growing document stack mark the delayed month.",
        tone: "crisis",
        focus: [50, 50],
        actors: [
          ["director", "director", "Director", 50, 66, "up", "observe"],
          ["staff", "staff", "Schedule staff", 33, 55, "right", "work"],
        ],
        props: [
          ["schedule", "dossier", 50, 49, "abandoned"],
          ["delay-stack", "document-box", 38, 51, "active"],
          ["delay-beacon", "warning-beacon", 72, 35, "active"],
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
        focus: [50, 44],
        actors: [
          ["clerk", "official", "Committee clerk", 38, 43, "right", "observe"],
          ["corporate-aide", "corporate", "Corporation aide", 68, 47, "left", "enter"],
        ],
        props: [["unanswered-file", "dossier", 50, 43, "abandoned"]],
      },
      {
        title: "A private hand removes the funds",
        description:
          "The Corporation aide carries the budget case away while the hearing cameras continue.",
        tone: "corporate",
        focus: [68, 56],
        actors: [
          ["clerk", "official", "Committee clerk", 35, 47, "right", "withdraw"],
          ["corporate-aide", "corporate", "Corporation aide", 70, 58, "right", "cross"],
          ["camera-staff", "staff", "Broadcast crew", 80, 66, "left", "observe"],
        ],
        props: [
          ["unanswered-file", "dossier", 49, 43, "abandoned"],
          ["lost-funds", "document-box", 68, 53, "secured"],
        ],
      },
      {
        title: "Neglect becomes the public record",
        description:
          "The funding box is gone and a hostile account fills the chamber's broadcast feed.",
        tone: "public",
        focus: [50, 26],
        actors: [
          ["camera-staff", "staff", "Broadcast crew", 75, 66, "up", "work"],
          ["corporate-aide", "corporate", "Corporation aide", 82, 58, "left", "idle"],
        ],
        props: [
          ["public-feed", "monitor-bank", 50, 24, "active"],
          ["unanswered-file", "dossier", 49, 43, "abandoned"],
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
        focus: [52, 50],
        actors: [
          ["steward", "steward", "The Steward", 38, 57, "right", "address"],
          ["witness", "public", "Whistleblower", 62, 57, "left", "idle"],
          ["security", "security", "Protective officer", 76, 60, "left", "observe"],
        ],
        props: [["red-folder", "dossier", 51, 50, "active"]],
      },
      {
        title: "Protection closes around the evidence",
        description:
          "Security seals the briefing room while the red folder enters protected custody.",
        tone: "constructive",
        focus: [63, 48],
        actors: [
          ["steward", "steward", "The Steward", 42, 58, "right", "observe"],
          ["witness", "public", "Whistleblower", 58, 57, "right", "cross"],
          ["security", "security", "Protective officer", 73, 57, "left", "work"],
        ],
        props: [
          ["red-folder", "dossier", 61, 48, "secured"],
          ["evidence-custody", "document-box", 68, 50, "secured"],
        ],
      },
      {
        title: "Institutions keep the witness in the room",
        description:
          "The protected witness remains beside the Steward as the evidence monitor turns green.",
        tone: "constructive",
        focus: [50, 42],
        actors: [
          ["steward", "steward", "The Steward", 42, 58, "right", "idle"],
          ["witness", "public", "Protected whistleblower", 58, 58, "left", "idle"],
          ["security", "security", "Protective officer", 74, 61, "left", "observe"],
        ],
        props: [
          ["red-folder", "dossier", 51, 49, "secured"],
          ["protected-feed", "monitor-bank", 50, 22, "secured"],
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
        focus: [57, 54],
        actors: [
          ["fixer", "fixer", "The Fixer", 38, 60, "right", "enter"],
          ["witness", "public", "Whistleblower", 65, 58, "left", "idle"],
          ["steward", "steward", "The Steward", 76, 63, "left", "observe"],
        ],
        props: [["red-folder", "dossier", 54, 50, "normal"]],
      },
      {
        title: "The folder changes hands",
        description:
          "The Fixer closes the evidence inside a private document box and directs the witness away.",
        tone: "covert",
        focus: [47, 53],
        actors: [
          ["fixer", "fixer", "The Fixer", 46, 58, "right", "work"],
          ["witness", "public", "Whistleblower", 72, 61, "right", "exit"],
          ["steward", "steward", "The Steward", 82, 66, "left", "withdraw"],
        ],
        props: [
          ["red-folder", "dossier", 48, 49, "secured"],
          ["private-box", "document-box", 43, 52, "secured"],
        ],
      },
      {
        title: "Containment leaves an empty chair",
        description:
          "The Fixer remains alone with the secured box as the institutional feed fractures.",
        tone: "corporate",
        focus: [45, 50],
        actors: [
          ["fixer", "fixer", "The Fixer", 46, 59, "up", "idle"],
          ["steward", "steward", "The Steward", 82, 68, "right", "withdraw"],
        ],
        props: [
          ["private-box", "document-box", 44, 51, "secured"],
          ["damaged-feed", "monitor-bank", 50, 22, "damaged"],
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
        focus: [50, 53],
        actors: [
          ["witness", "public", "Whistleblower", 50, 60, "up", "idle"],
          ["security", "security", "Unassigned security post", 77, 63, "left", "observe"],
        ],
        props: [["red-folder", "dossier", 50, 49, "abandoned"]],
      },
      {
        title: "The witness walks toward the cameras",
        description:
          "No official arrives, so the whistleblower carries the accusation out of the secure room.",
        tone: "crisis",
        focus: [70, 60],
        actors: [
          ["witness", "public", "Whistleblower", 69, 61, "right", "exit"],
          ["press", "staff", "Press camera", 84, 63, "left", "observe"],
        ],
        props: [
          ["red-folder", "dossier", 67, 54, "active"],
          ["open-evidence-box", "document-box", 50, 51, "abandoned"],
        ],
      },
      {
        title: "The leak becomes the only explanation",
        description:
          "Procurement footage takes over the monitor bank as panic washes through the room.",
        tone: "public",
        focus: [50, 25],
        actors: [
          ["press", "staff", "Press camera", 73, 64, "up", "work"],
          ["witness", "public", "Whistleblower", 63, 58, "up", "address"],
        ],
        props: [
          ["leak-feed", "monitor-bank", 50, 22, "active"],
          ["panic-beacon", "warning-beacon", 82, 36, "active"],
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
        focus: [48, 62],
        actors: [
          ["organizer", "worker", "Contractor organizer", 42, 67, "right", "confront"],
          ["workers", "worker", "Walkout crew", 60, 68, "left", "idle"],
          ["director", "director", "Director", 25, 63, "right", "enter"],
        ],
        props: [
          ["picket-line", "crowd-line", 53, 70, "active"],
          ["idle-generator", "generator", 72, 54, "abandoned"],
        ],
      },
      {
        title: "The settlement crosses the barrier",
        description:
          "A government funding box reaches the organizer and the locked site opens.",
        tone: "constructive",
        focus: [48, 57],
        actors: [
          ["director", "director", "Director", 38, 61, "right", "address"],
          ["organizer", "worker", "Contractor organizer", 57, 61, "left", "address"],
          ["workers", "worker", "Walkout crew", 70, 68, "left", "observe"],
        ],
        props: [
          ["settlement-box", "document-box", 48, 56, "secured"],
          ["raised-barrier", "barrier", 50, 72, "normal"],
        ],
      },
      {
        title: "Safer work restarts the project",
        description:
          "Both crews return to their stations as the toolbox opens and the generator lights.",
        tone: "constructive",
        focus: [64, 53],
        actors: [
          ["organizer", "worker", "Contractor organizer", 44, 60, "right", "work"],
          ["workers", "worker", "Returning crew", 64, 61, "left", "work"],
          ["director", "director", "Director", 27, 65, "right", "observe"],
        ],
        props: [
          ["working-generator", "generator", 72, 54, "active"],
          ["full-toolbox", "document-box", 56, 55, "active"],
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
        focus: [50, 66],
        actors: [
          ["organizer", "worker", "Contractor organizer", 42, 66, "right", "confront"],
          ["workers", "worker", "Walkout crew", 58, 68, "left", "confront"],
          ["security", "security", "Site security", 27, 61, "right", "observe"],
        ],
        props: [["walkout-line", "crowd-line", 51, 72, "active"]],
      },
      {
        title: "Security opens a path for replacements",
        description:
          "The original crew withdraws as a new team crosses through the controlled gate.",
        tone: "crisis",
        focus: [55, 63],
        actors: [
          ["organizer", "worker", "Contractor organizer", 25, 69, "left", "withdraw"],
          ["workers", "worker", "Walkout crew", 34, 72, "left", "exit"],
          ["security", "security", "Site security", 51, 63, "right", "confront"],
          ["replacement", "worker", "Replacement crew", 72, 65, "left", "enter"],
        ],
        props: [["controlled-barrier", "barrier", 55, 73, "active"]],
      },
      {
        title: "The site runs with missing knowledge",
        description:
          "Replacement workers face sputtering systems while abandoned helmets mark the cleared line.",
        tone: "crisis",
        focus: [67, 55],
        actors: [
          ["replacement", "worker", "Replacement crew", 63, 61, "right", "work"],
          ["security", "security", "Site security", 43, 66, "right", "observe"],
        ],
        props: [
          ["unstable-generator", "generator", 72, 54, "damaged"],
          ["empty-toolbox", "document-box", 34, 60, "abandoned"],
          ["stress-beacon", "warning-beacon", 82, 35, "active"],
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
        focus: [50, 69],
        actors: [
          ["organizer", "worker", "Contractor organizer", 44, 67, "right", "idle"],
          ["workers", "worker", "Walkout crew", 59, 68, "left", "idle"],
        ],
        props: [
          ["closed-gate", "barrier", 50, 61, "secured"],
          ["idle-generator", "generator", 74, 51, "abandoned"],
        ],
      },
      {
        title: "The picket expands beyond the contractors",
        description:
          "More workers cross into the line as no government negotiator appears.",
        tone: "crisis",
        focus: [50, 70],
        actors: [
          ["organizer", "worker", "Contractor organizer", 48, 64, "down", "address"],
          ["workers", "worker", "Walkout crew", 35, 71, "right", "cross"],
          ["supporters", "public", "Labor supporters", 68, 72, "left", "enter"],
        ],
        props: [["growing-picket", "crowd-line", 51, 74, "active"]],
      },
      {
        title: "A movement occupies the gate",
        description:
          "The crowd line now spans the site while empty tools and alarms signal lost capacity.",
        tone: "public",
        focus: [50, 70],
        actors: [
          ["organizer", "worker", "Contractor organizer", 50, 62, "down", "address"],
          ["workers", "worker", "Organized labor line", 35, 70, "right", "idle"],
          ["supporters", "public", "Labor supporters", 67, 71, "left", "idle"],
        ],
        props: [
          ["movement-line", "crowd-line", 50, 75, "active"],
          ["empty-toolbox", "document-box", 31, 53, "abandoned"],
          ["site-alarm", "warning-beacon", 82, 36, "active"],
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
        focus: [50, 56],
        actors: [
          ["director", "director", "Director", 50, 66, "up", "enter"],
          ["camera", "staff", "Broadcast crew", 78, 65, "left", "observe"],
          ["gallery", "public", "Public gallery", 28, 72, "right", "observe"],
          ["corporate", "corporate", "Corporation counsel", 68, 46, "left", "idle"],
        ],
        props: [["open-testimony", "dossier", 50, 55, "active"]],
      },
      {
        title: "The Director opens the record",
        description:
          "Public answers move from the dossier to the live feed under the chamber lights.",
        tone: "institutional",
        focus: [50, 60],
        actors: [
          ["director", "director", "Director", 50, 64, "up", "address"],
          ["camera", "staff", "Broadcast crew", 75, 64, "left", "work"],
          ["gallery", "public", "Public gallery", 31, 70, "right", "observe"],
          ["corporate", "corporate", "Corporation counsel", 68, 46, "left", "confront"],
        ],
        props: [
          ["open-testimony", "dossier", 50, 53, "active"],
          ["live-feed", "monitor-bank", 50, 20, "active"],
        ],
      },
      {
        title: "Transparency narrows every future denial",
        description:
          "The gallery remains engaged while Corporation counsel stands exposed beside the public record.",
        tone: "constructive",
        focus: [50, 45],
        actors: [
          ["director", "director", "Director", 50, 63, "up", "idle"],
          ["gallery", "public", "Public gallery", 31, 70, "right", "observe"],
          ["corporate", "corporate", "Corporation counsel", 70, 48, "right", "withdraw"],
        ],
        props: [
          ["public-record", "dossier", 50, 53, "secured"],
          ["live-feed", "monitor-bank", 50, 20, "active"],
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
        focus: [50, 55],
        actors: [
          ["director", "director", "Director", 50, 65, "up", "observe"],
          ["camera", "staff", "Broadcast crew", 77, 66, "left", "idle"],
          ["gallery", "public", "Public gallery", 29, 71, "right", "idle"],
          ["security", "security", "Chamber security", 67, 55, "left", "observe"],
        ],
        props: [["hearing-file-closed", "dossier", 50, 52, "normal"]],
      },
      {
        title: "The doors close on the public",
        description:
          "Security clears the gallery while the Director carries the file to a classified table.",
        tone: "covert",
        focus: [62, 51],
        actors: [
          ["director", "director", "Director", 61, 57, "right", "cross"],
          ["camera", "staff", "Broadcast crew", 82, 68, "right", "exit"],
          ["gallery", "public", "Public gallery", 18, 72, "left", "exit"],
          ["security", "security", "Chamber security", 48, 62, "left", "confront"],
        ],
        props: [
          ["classified-file", "dossier", 61, 51, "secured"],
          ["closed-session-table", "briefing-table", 67, 53, "secured"],
        ],
      },
      {
        title: "A classified hearing replaces the public one",
        description:
          "The broadcast is dark, the gallery is empty, and only a sealed account remains.",
        tone: "covert",
        focus: [66, 51],
        actors: [
          ["director", "director", "Director", 65, 58, "up", "idle"],
          ["security", "security", "Chamber security", 45, 61, "right", "observe"],
        ],
        props: [
          ["classified-file", "dossier", 65, 50, "secured"],
          ["dark-feed", "monitor-bank", 50, 20, "abandoned"],
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
        focus: [50, 58],
        actors: [
          ["corporate", "corporate", "Corporation spokesperson", 68, 59, "left", "enter"],
          ["camera", "staff", "Broadcast crew", 79, 67, "left", "observe"],
          ["gallery", "public", "Public gallery", 28, 71, "right", "observe"],
        ],
        props: [["empty-government-file", "dossier", 46, 53, "abandoned"]],
      },
      {
        title: "A corporate dossier fills the silence",
        description:
          "The spokesperson takes the podium and supplies a private account to the national feed.",
        tone: "corporate",
        focus: [58, 60],
        actors: [
          ["corporate", "corporate", "Corporation spokesperson", 57, 64, "up", "address"],
          ["camera", "staff", "Broadcast crew", 76, 64, "left", "work"],
          ["gallery", "public", "Public gallery", 30, 70, "right", "observe"],
        ],
        props: [
          ["corporate-account", "dossier", 57, 53, "active"],
          ["corporate-feed", "monitor-bank", 50, 20, "active"],
        ],
      },
      {
        title: "Their account becomes the public account",
        description:
          "The gallery turns toward the Corporation seal as the government file remains abandoned.",
        tone: "public",
        focus: [60, 43],
        actors: [
          ["corporate", "corporate", "Corporation spokesperson", 57, 62, "up", "idle"],
          ["gallery", "public", "Public gallery", 36, 69, "right", "observe"],
        ],
        props: [
          ["corporate-account", "dossier", 57, 52, "secured"],
          ["corporate-seal-hearing", "corporate-seal", 64, 24, "active"],
          ["empty-government-file", "dossier", 42, 52, "abandoned"],
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
        focus: [50, 51],
        actors: [
          ["analyst", "analyst", "The Analyst", 36, 58, "right", "observe"],
          ["defector", "corporate", "Corporation defector", 65, 58, "left", "idle"],
          ["director", "director", "Director", 50, 68, "up", "enter"],
          ["security", "security", "Protective officer", 78, 61, "left", "observe"],
        ],
        props: [
          ["immunity-file", "dossier", 45, 50, "normal"],
          ["corporate-plans", "document-box", 58, 51, "secured"],
        ],
      },
      {
        title: "The signature opens the Corporation plans",
        description:
          "The Director grants the pass as the defector releases the protected intelligence.",
        tone: "covert",
        focus: [52, 53],
        actors: [
          ["director", "director", "Director", 47, 59, "right", "work"],
          ["defector", "corporate", "Corporation defector", 60, 58, "left", "address"],
          ["analyst", "analyst", "The Analyst", 34, 57, "right", "observe"],
          ["security", "security", "Protective officer", 75, 61, "left", "work"],
        ],
        props: [
          ["signed-immunity", "dossier", 48, 50, "secured"],
          ["open-plans", "document-box", 58, 51, "active"],
        ],
      },
      {
        title: "Intelligence fills the room at a public cost",
        description:
          "The plans illuminate every monitor while the protected defector remains under surveillance.",
        tone: "corporate",
        focus: [50, 25],
        actors: [
          ["analyst", "analyst", "The Analyst", 38, 59, "up", "work"],
          ["defector", "corporate", "Protected defector", 62, 58, "up", "idle"],
          ["security", "security", "Protective officer", 76, 61, "left", "observe"],
        ],
        props: [
          ["plans-feed", "monitor-bank", 50, 22, "active"],
          ["signed-immunity", "dossier", 50, 50, "secured"],
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
        focus: [47, 50],
        actors: [
          ["analyst", "analyst", "The Analyst", 38, 58, "right", "work"],
          ["defector", "corporate", "Corporation defector", 65, 58, "left", "idle"],
          ["security", "security", "Sting team", 79, 61, "left", "observe"],
        ],
        props: [["bait-file", "dossier", 49, 50, "active"]],
      },
      {
        title: "The courier enters the trap",
        description:
          "The defector carries the marked file toward a Corporation courier as the sting team closes.",
        tone: "crisis",
        focus: [66, 60],
        actors: [
          ["defector", "corporate", "Corporation defector", 57, 60, "right", "cross"],
          ["courier", "corporate", "Corporation courier", 76, 60, "left", "enter"],
          ["security", "security", "Sting team", 67, 68, "up", "confront"],
          ["analyst", "analyst", "The Analyst", 34, 58, "right", "observe"],
        ],
        props: [["marked-file", "dossier", 62, 54, "active"]],
      },
      {
        title: "The Corporation searches its own channels",
        description:
          "The courier is contained while the Corporation network fractures across the monitors.",
        tone: "crisis",
        focus: [50, 25],
        actors: [
          ["security", "security", "Sting team", 66, 59, "left", "confront"],
          ["courier", "corporate", "Corporation courier", 75, 59, "left", "withdraw"],
          ["analyst", "analyst", "The Analyst", 38, 59, "up", "work"],
        ],
        props: [
          ["broken-network", "monitor-bank", 50, 22, "damaged"],
          ["search-beacon", "warning-beacon", 81, 35, "active"],
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
        focus: [63, 56],
        actors: [
          ["defector", "corporate", "Corporation defector", 64, 59, "right", "idle"],
          ["security", "security", "Unassigned security post", 78, 62, "left", "observe"],
        ],
        props: [["closed-plans", "document-box", 57, 51, "secured"]],
      },
      {
        title: "The offer expires unanswered",
        description:
          "The defector takes the plans through the secure exit without making the exchange.",
        tone: "covert",
        focus: [76, 59],
        actors: [
          ["defector", "corporate", "Corporation defector", 77, 60, "right", "exit"],
          ["security", "security", "Unassigned security post", 55, 62, "right", "observe"],
        ],
        props: [
          ["departing-plans", "document-box", 72, 54, "secured"],
          ["empty-table", "dossier", 50, 50, "abandoned"],
        ],
      },
      {
        title: "The Corporation receives its executive back",
        description:
          "The government monitor goes dark as a corporate progress signal confirms the return.",
        tone: "corporate",
        focus: [50, 24],
        actors: [
          ["security", "security", "Unassigned security post", 55, 62, "right", "withdraw"],
        ],
        props: [
          ["corporate-progress-feed", "monitor-bank", 50, 22, "active"],
          ["empty-table", "dossier", 50, 50, "abandoned"],
        ],
      },
    ],
  ),
} satisfies Readonly<Record<string, NarrativeSceneScript>>;
