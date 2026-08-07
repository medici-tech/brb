import { describe, expect, it } from "vitest";
import {
  listPresentationFixtures,
  getPresentationFixture,
  type PresentationFixtureId,
} from "../../src/components/brb/control-room/presentationFixtures.js";
import { resolvePresentationModel } from "../../src/components/brb/control-room/presentationStateResolver.js";

describe("presentation fixtures", () => {
  it("exposes a stable catalog of named reachable looks", () => {
    const ids = listPresentationFixtures().map((fixture) => fixture.id);
    expect(ids).toEqual([
      "calm-early",
      "strained-mid",
      "crisis-situation",
      "corporate-embedded",
      "institutions-breached",
      "brb-infrastructure",
      "brb-construction",
      "brb-unstable",
      "brb-activation",
      "consult-analyst",
      "ending-civic",
      "worst-case-audit",
    ]);
  });

  it("throws on an unknown fixture id", () => {
    expect(() =>
      getPresentationFixture("not-a-fixture" as PresentationFixtureId),
    ).toThrow(/unknown presentation fixture/i);
  });

  it.each(listPresentationFixtures())(
    "$id resolves to its documented contract",
    (fixture) => {
      const model = resolvePresentationModel(fixture.inputs);
      expect(model.state).toBe(fixture.expected.state);
      expect(model.shot).toBe(fixture.expected.shot);
      expect(model.tempo).toBe(fixture.expected.tempo);
      expect(model.staffLayout.mode).toBe(fixture.expected.staffMode);
      expect(model.paperLoad).toBe(fixture.expected.paperLoad);
      expect(model.brbStage).toBe(fixture.expected.brbStage);
      expect(model.litStation).toBe(fixture.expected.litStation);
      expect(model.lighting).toBe(fixture.expected.lighting);
    },
  );
});
