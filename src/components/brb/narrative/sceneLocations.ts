import type { RoomDefinitionKey } from "@/components/brb/pixel-room/roomDefinitions";
import type { NarrativeSceneId } from "./sceneTypes";

export type NarrativeLocation = {
  readonly id: NarrativeSceneId;
  readonly label: string;
  readonly shortLabel: string;
  readonly roomDefinition: RoomDefinitionKey;
};

export const NARRATIVE_LOCATIONS: Record<NarrativeSceneId, NarrativeLocation> = {
  "continuity-floor": {
    id: "continuity-floor",
    label: "Federal Continuity Directorate · Operations Floor",
    shortLabel: "Continuity Floor",
    roomDefinition: "continuity",
  },
  "oversight-chamber": {
    id: "oversight-chamber",
    label: "Federal Oversight Chamber",
    shortLabel: "Oversight Chamber",
    roomDefinition: "oversight",
  },
  "secure-briefing": {
    id: "secure-briefing",
    label: "Compartmented Briefing Room",
    shortLabel: "Secure Briefing",
    roomDefinition: "secureBriefing",
  },
  "infrastructure-site": {
    id: "infrastructure-site",
    label: "BRB Infrastructure Site",
    shortLabel: "Infrastructure Site",
    roomDefinition: "infrastructure",
  },
  "corporate-suite": {
    id: "corporate-suite",
    label: "Corporation Executive Suite",
    shortLabel: "Corporate Suite",
    roomDefinition: "corporate",
  },
  "civic-gate": {
    id: "civic-gate",
    label: "Gate Seven · Civic Perimeter",
    shortLabel: "Civic Gate",
    roomDefinition: "civicGate",
  },
};
