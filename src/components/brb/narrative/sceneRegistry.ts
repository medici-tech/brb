import {
  ACTION_SCENE_SCRIPTS,
  CONSULTATION_SCENE_SCRIPTS,
  ENDING_SCENE_SCRIPTS,
} from "./sceneCatalogActions";
import { CARD_SCENE_SCRIPTS_1 } from "./sceneCatalogCards1";
import { CARD_SCENE_SCRIPTS_2 } from "./sceneCatalogCards2";
import { CARD_SCENE_SCRIPTS_3 } from "./sceneCatalogCards3";
import type { NarrativeSceneScript } from "./sceneTypes";

export const CARD_SCENE_SCRIPTS: Readonly<Record<string, NarrativeSceneScript>> = {
  ...CARD_SCENE_SCRIPTS_1,
  ...CARD_SCENE_SCRIPTS_2,
  ...CARD_SCENE_SCRIPTS_3,
};

export const NARRATIVE_SCENE_REGISTRY: Readonly<
  Record<string, NarrativeSceneScript>
> = {
  ...CARD_SCENE_SCRIPTS,
  ...ACTION_SCENE_SCRIPTS,
  ...CONSULTATION_SCENE_SCRIPTS,
  ...ENDING_SCENE_SCRIPTS,
};

export function getNarrativeSceneScript(
  sourceKey: string,
): NarrativeSceneScript | null {
  return NARRATIVE_SCENE_REGISTRY[sourceKey] ?? null;
}
