import type { NarrativeSceneId, SceneProp } from "./sceneTypes";

export type NarrativeLocation = {
  readonly id: NarrativeSceneId;
  readonly label: string;
  readonly shortLabel: string;
  readonly palette: {
    readonly wall: string;
    readonly floor: string;
    readonly shadow: string;
    readonly signal: string;
  };
  readonly baseProps: readonly SceneProp[];
};

export const NARRATIVE_LOCATIONS: Record<NarrativeSceneId, NarrativeLocation> = {
  "continuity-floor": {
    id: "continuity-floor",
    label: "Federal Continuity Directorate · Operations Floor",
    shortLabel: "Continuity Floor",
    palette: {
      wall: "#263137",
      floor: "#172127",
      shadow: "#080d10",
      signal: "#e09a32",
    },
    baseProps: [
      { id: "operations-table", kind: "briefing-table", position: { x: 50, y: 54 } },
      { id: "monitor-wall", kind: "monitor-bank", position: { x: 50, y: 20 } },
      { id: "brb-chamber", kind: "brb-chamber", position: { x: 82, y: 52 } },
    ],
  },
  "oversight-chamber": {
    id: "oversight-chamber",
    label: "Federal Oversight Chamber",
    shortLabel: "Oversight Chamber",
    palette: {
      wall: "#443a32",
      floor: "#2b2521",
      shadow: "#110d0b",
      signal: "#d7b46a",
    },
    baseProps: [
      { id: "hearing-bench", kind: "hearing-desk", position: { x: 50, y: 30 } },
      { id: "public-podium", kind: "podium", position: { x: 50, y: 66 } },
      { id: "hearing-file", kind: "dossier", position: { x: 50, y: 34 } },
    ],
  },
  "secure-briefing": {
    id: "secure-briefing",
    label: "Compartmented Briefing Room",
    shortLabel: "Secure Briefing",
    palette: {
      wall: "#293238",
      floor: "#1a2429",
      shadow: "#080d10",
      signal: "#78a8a0",
    },
    baseProps: [
      { id: "secure-table", kind: "briefing-table", position: { x: 50, y: 54 } },
      { id: "evidence-box", kind: "document-box", position: { x: 62, y: 52 } },
      { id: "security-monitor", kind: "monitor-bank", position: { x: 50, y: 22 } },
    ],
  },
  "infrastructure-site": {
    id: "infrastructure-site",
    label: "BRB Infrastructure Site",
    shortLabel: "Infrastructure Site",
    palette: {
      wall: "#3b352c",
      floor: "#29261f",
      shadow: "#100f0c",
      signal: "#e2a83b",
    },
    baseProps: [
      { id: "site-generator", kind: "generator", position: { x: 72, y: 56 } },
      { id: "site-server", kind: "server", position: { x: 31, y: 48 } },
      { id: "site-lights", kind: "work-lights", position: { x: 52, y: 20 } },
    ],
  },
  "corporate-suite": {
    id: "corporate-suite",
    label: "Corporation Executive Suite",
    shortLabel: "Corporate Suite",
    palette: {
      wall: "#34333d",
      floor: "#202027",
      shadow: "#0c0c12",
      signal: "#c05b56",
    },
    baseProps: [
      { id: "corporate-table", kind: "briefing-table", position: { x: 50, y: 54 } },
      { id: "corporate-mark", kind: "corporate-seal", position: { x: 50, y: 20 } },
      { id: "private-file", kind: "dossier", position: { x: 57, y: 51 } },
    ],
  },
  "civic-gate": {
    id: "civic-gate",
    label: "Gate Seven · Civic Perimeter",
    shortLabel: "Civic Gate",
    palette: {
      wall: "#333b3f",
      floor: "#252b2e",
      shadow: "#0c1012",
      signal: "#dc714f",
    },
    baseProps: [
      { id: "gate-barrier-left", kind: "barrier", position: { x: 29, y: 58 } },
      { id: "gate-barrier-right", kind: "barrier", position: { x: 71, y: 58 } },
      { id: "civic-crowd", kind: "crowd-line", position: { x: 50, y: 76 } },
    ],
  },
};
