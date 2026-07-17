import { describe, expect, it } from "vitest";
import { deriveReproductionStatus } from "../domain/reproductionStatus";
import { verifiedProjectFixture } from "./fixtures/projects";

describe("deterministic reproduction status", () => {
  it("derives minimal target reproduced from complete successful evidence", () => {
    expect(deriveReproductionStatus(verifiedProjectFixture().evidence)).toBe(
      "minimal_target_reproduced"
    );
  });

  it("derives in progress when otherwise complete evidence loses one field", () => {
    const project = verifiedProjectFixture();
    project.evidence.logExcerpt = "";
    expect(deriveReproductionStatus(project.evidence)).toBe("in_progress");
  });

  it("derives insufficient evidence from an untouched empty record", () => {
    const project = verifiedProjectFixture();
    project.evidence = {
      environment: "",
      trainingCommand: "",
      evaluationCommand: "",
      logExcerpt: "",
      localResult: null,
      notes: "",
      resultDatasetScopeConfirmed: false,
      runOutcome: "not_recorded",
      provenance: "learner_entered"
    };
    expect(deriveReproductionStatus(project.evidence)).toBe(
      "insufficient_evidence"
    );
  });

  it("derives not reproduced from an explicit failed run", () => {
    const project = verifiedProjectFixture();
    project.evidence.runOutcome = "failed";
    expect(deriveReproductionStatus(project.evidence)).toBe("not_reproduced");
  });
});
