import type {
  NarrativeSceneId,
  NarrativeSceneScript,
  SceneActor,
  SceneActorRole,
  SceneProp,
  SceneTone,
} from "./sceneTypes";

type ScriptDetails = {
  readonly key: string;
  readonly location: NarrativeSceneId;
  readonly title: string;
  readonly tone: SceneTone;
  readonly actor: SceneActorRole;
  readonly setup: string;
  readonly action: string;
  readonly consequence: string;
  readonly prop: SceneProp["kind"];
};

function cast(
  actor: SceneActorRole,
  motion: SceneActor["motion"],
  x: number,
  y: number,
  label: string,
  id: string,
): SceneActor {
  return {
    id,
    role: actor,
    label,
    position: { x, y },
    facing: x < 7 ? "right" : "left",
    motion,
  };
}

function actionScript(details: ScriptDetails): NarrativeSceneScript {
  const sourceKey = `action:${details.key}`;
  const prop: SceneProp = {
    id: `${details.key}-prop`,
    kind: details.prop,
    position: { x: 7, y: 5 },
  };
  return {
    id: sourceKey.replaceAll(":", "-"),
    sourceKey,
    sceneId: details.location,
    title: details.title,
    beats: [
      {
        id: "setup",
        eyebrow: "01 · ORDER RECEIVED",
        title: "The room assembles around the choice",
        description: details.setup,
        tone: details.tone,
        focus: { x: 6, y: 4 },
        actors: [
          cast("director", "enter", 5, 6, "Director", `${details.key}-director`),
          cast(details.actor, "observe", 8, 5, "Responsible desk", `${details.key}-lead`),
        ],
        props: [prop],
      },
      {
        id: "action",
        eyebrow: "02 · COMMITMENT EXECUTED",
        title: details.title,
        description: details.action,
        tone: details.tone,
        focus: { x: 7, y: 5 },
        actors: [
          cast("director", "address", 6, 5, "Director", `${details.key}-director`),
          cast(details.actor, "work", 8, 5, "Responsible desk", `${details.key}-lead`),
          cast("staff", "cross", 4, 6, "Operations staff", `${details.key}-staff`),
        ],
        props: [{ ...prop, state: "active" }],
      },
      {
        id: "consequence",
        eyebrow: "03 · RESULT ENTERED",
        title: "The physical record remains",
        description: details.consequence,
        tone: details.tone,
        focus: { x: 8, y: 5 },
        actors: [
          cast("director", "observe", 5, 5, "Director", `${details.key}-director`),
          cast(details.actor, "idle", 8, 5, "Responsible desk", `${details.key}-lead`),
        ],
        props: [{ ...prop, state: details.tone === "crisis" ? "damaged" : "secured" }],
      },
    ],
  };
}

const TRACK_DETAILS = {
  engineering: {
    actor: "worker",
    prop: "brb-chamber",
    object: "machine frame",
    cost: "Capacity and Money leave the active pool",
  },
  access: {
    actor: "fixer",
    prop: "dossier",
    object: "authorization channel",
    cost: "Influence and Intelligence become permanent access",
  },
  legitimacy: {
    actor: "steward",
    prop: "podium",
    object: "public mandate",
    cost: "Trust is sealed into the project",
  },
  stability: {
    actor: "analyst",
    prop: "server",
    object: "continuity system",
    cost: "operational reserves become structural stability",
  },
} as const;

const depositScripts = Object.entries(TRACK_DETAILS).flatMap(
  ([track, detail]) =>
    (["standard", "large"] as const).map((size) =>
      actionScript({
        key: `deposit:${track}:${size}`,
        location: track === "engineering" ? "infrastructure-site" : "continuity-floor",
        title: `${size === "large" ? "Large" : "Standard"} ${track} deposit`,
        tone: size === "large" ? "crisis" : "institutional",
        actor: detail.actor,
        prop: detail.prop,
        setup: `The ${detail.object} waits for a ${size} permanent allocation.`,
        action: `${detail.cost}; staff lock the allocation into the ${detail.object}.`,
        consequence:
          size === "large"
            ? `The ${detail.object} advances visibly, but the emptied supply cases make the sacrifice impossible to miss.`
            : `The ${detail.object} advances one stage and the sealed resource case stays behind as a permanent record.`,
      })
    ),
);

const COUNTER_DETAILS = {
  expanding: ["infrastructure-site", "A site-expansion map", "construction access"],
  infiltrating: ["secure-briefing", "A compromised access chart", "the hidden channel"],
  discrediting: ["oversight-chamber", "A hostile broadcast plan", "the public narrative"],
  buying_influence: ["corporate-suite", "A patronage ledger", "the payment network"],
} as const;

const counterScripts = Object.entries(COUNTER_DETAILS).flatMap(
  ([strategy, [location, setupObject, target]]) =>
    (["correct", "wrong"] as const).map((outcome) =>
      actionScript({
        key: `counter:${strategy}:${outcome}`,
        location,
        title:
          outcome === "correct"
            ? `${strategy.replaceAll("_", " ")} operation intercepted`
            : `${strategy.replaceAll("_", " ")} counter missed`,
        tone: outcome === "correct" ? "constructive" : "crisis",
        actor: "analyst",
        prop: outcome === "correct" ? "monitor-bank" : "warning-beacon",
        setup: `${setupObject} is spread across the response table before the Corporation moves.`,
        action:
          outcome === "correct"
            ? `The Analyst identifies ${target}; public teams close the route before it completes.`
            : `The response team commits against ${target}, but the real Corporation move surfaces elsewhere.`,
        consequence:
          outcome === "correct"
            ? "Corporation signals retreat from the room and the public channel reopens."
            : "The false target goes dark while a new private-system cable reaches the control room.",
      })
    ),
);

const advisorScripts = [
  ["analyst", "analyst", "monitor-bank", "The Analyst returns to a verified evidence board."],
  ["fixer", "fixer", "dossier", "The Fixer places the private ledger back under Directorate control."],
  ["steward", "steward", "hearing-desk", "The Steward reopens the institutional channel and takes the public seat."],
] as const;

const recoveryScripts = [
  ["money", "corporate-suite", "document-box", "New appropriations cases arrive under emergency seals."],
  ["influence", "oversight-chamber", "hearing-desk", "Coalition whips refill the vote board one name at a time."],
  ["intelligence", "secure-briefing", "monitor-bank", "Field reports repopulate the evidence wall."],
  ["capacity", "infrastructure-site", "generator", "Replacement crews restart the idle work zone."],
  ["trust", "civic-gate", "podium", "Public delegates reopen a guarded conversation."],
] as const;

const scripts = [
  ...depositScripts,
  ...counterScripts,
  ...advisorScripts.map(([advisor, actor, prop, consequence]) =>
    actionScript({
      key: `advisor:${advisor}`,
      location: "continuity-floor",
      title: `${advisor[0]?.toUpperCase()}${advisor.slice(1)} brought back into line`,
      tone: "covert",
      actor,
      prop,
      setup: `The ${advisor} station sits apart from the central operations table.`,
      action: `The Director meets the ${advisor} at the station and renegotiates the working line.`,
      consequence,
    })
  ),
  ...recoveryScripts.map(([resource, location, prop, consequence]) =>
    actionScript({
      key: `recover:${resource}`,
      location,
      title: `${resource[0]?.toUpperCase()}${resource.slice(1)} recovered`,
      tone: "constructive",
      actor: resource === "capacity" ? "worker" : resource === "trust" ? "public" : "staff",
      prop,
      setup: `The ${resource} channel is visibly depleted while the monthly clock continues.`,
      action: `Staff divert the month into rebuilding ${resource}; Corporation signals advance during the delay.`,
      consequence,
    })
  ),
  actionScript({
    key: "faction",
    location: "oversight-chamber",
    title: "The governing coalition is reinforced",
    tone: "institutional",
    actor: "official",
    prop: "hearing-desk",
    setup: "Coalition seats are scattered across an unfinished vote map.",
    action: "The Steward and Director reconnect the governing bloc around shared safeguards.",
    consequence: "The chamber fills again and the public institutional seal returns to the center.",
  }),
  actionScript({
    key: "institutions",
    location: "continuity-floor",
    title: "Institutional safeguards are reinforced",
    tone: "constructive",
    actor: "steward",
    prop: "document-box",
    setup: "Damaged procedures and emergency exceptions cover the operations table.",
    action: "The Steward restores review gates while crews repair the public-control hardware.",
    consequence: "Cracked channels close, emergency lights recede, and the public seal remains visible.",
  }),
  actionScript({
    key: "activate",
    location: "continuity-floor",
    title: "BRB activation is authorized",
    tone: "crisis",
    actor: "staff",
    prop: "brb-chamber",
    setup: "All four BRB channels converge on the sealed activation chamber.",
    action: "The Director gives the order; staff clear the floor as the chamber takes the national load.",
    consequence: "The room becomes the final record of who controlled the machine when it answered.",
  }),
] as const;

export const ACTION_SCENE_SCRIPTS: Readonly<Record<string, NarrativeSceneScript>> =
  Object.fromEntries(scripts.map((script) => [script.sourceKey, script]));

export const CONSULTATION_SCENE_SCRIPTS: Readonly<Record<string, NarrativeSceneScript>> =
  Object.fromEntries(
    advisorScripts.map(([advisor, actor, prop, consequence]) => {
      const script = actionScript({
        key: `consult:${advisor}`,
        location: "continuity-floor",
        title: `Consult the ${advisor}`,
        tone: "covert",
        actor,
        prop,
        setup: `The ${advisor} receives the active file at a private station.`,
        action: `The ${advisor} marks a forecast while leverage quietly changes hands.`,
        consequence,
      });
      return [`consult:${advisor}`, { ...script, sourceKey: `consult:${advisor}` }];
    }),
  );

const endingDetails = [
  {
    id: "civic_legacy",
    location: "oversight-chamber",
    title: "Public control survives activation",
    tone: "constructive",
    actor: "steward",
    prop: "podium",
    setup: "The final BRB record arrives before a full public chamber.",
    action: "The Directorate opens the controls and the decision history to public authority.",
    consequence: "The national machine remains powerful, but its public seal stays above every control.",
  },
  {
    id: "compromised_activation",
    location: "continuity-floor",
    title: "Activation divides authority",
    tone: "crisis",
    actor: "corporate",
    prop: "brb-chamber",
    setup: "Public and private channels both terminate at the ready chamber.",
    action: "The machine activates while Corporation hardware remains inside the control path.",
    consequence: "The chamber answers, but public and private seals share the final console.",
  },
  {
    id: "corporate_capture",
    location: "corporate-suite",
    title: "The Corporation takes the system",
    tone: "corporate",
    actor: "corporate",
    prop: "corporate-seal",
    setup: "The Directorate feed appears inside the Corporation executive suite.",
    action: "Private technicians replace the final public authorization channel.",
    consequence: "The BRB signal continues beneath a Corporation seal as public staff leave the room.",
  },
  {
    id: "state_collapse",
    location: "continuity-floor",
    title: "Continuity fails before the machine can hold",
    tone: "crisis",
    actor: "staff",
    prop: "warning-beacon",
    setup: "Emergency traffic overwhelms a damaged operations floor.",
    action: "Stations fail in sequence while staff withdraw from the central table.",
    consequence: "The room goes dark around an unfinished machine and an unanswered national signal.",
  },
] as const satisfies readonly (Omit<ScriptDetails, "key"> & { readonly id: string })[];

export const ENDING_SCENE_SCRIPTS: Readonly<Record<string, NarrativeSceneScript>> =
  Object.fromEntries(
    endingDetails.map((details) => {
      const script = actionScript({
        ...details,
        key: `ending:${details.id}`,
      });
      const sourceKey = `ending:${details.id}`;
      return [sourceKey, { ...script, id: sourceKey.replaceAll(":", "-"), sourceKey }];
    }),
  );
