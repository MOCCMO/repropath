import { describe, expect, it } from "vitest";
import { checkpointDefinitions } from "../domain/checkpointDefinitions";

describe("checkpoint definitions", () => {
  it("defines the approved seven-checkpoint order", () => {
    expect(checkpointDefinitions.map(({ id }) => id)).toEqual([
      "understand-task",
      "connect-repository",
      "confirm-data-and-metric",
      "prepare-environment",
      "run-minimal-target",
      "compare-results",
      "record-gaps"
    ]);
    expect(checkpointDefinitions.map(({ order }) => order)).toEqual([
      1, 2, 3, 4, 5, 6, 7
    ]);
  });

  it("uses the approved curated and derived evidence modes", () => {
    expect(
      checkpointDefinitions.map(({ evidenceMode }) => evidenceMode)
    ).toEqual([
      "curated_verified",
      "curated_verified",
      "curated_verified",
      "curated_verified",
      "curated_editable",
      "derived",
      "curated_extensible"
    ]);
  });

  it("forms a linear prerequisite chain without forward references", () => {
    checkpointDefinitions.forEach((definition, index) => {
      expect(definition.prerequisites).toEqual(
        index === 0 ? [] : [checkpointDefinitions[index - 1].id]
      );
    });
  });
});
