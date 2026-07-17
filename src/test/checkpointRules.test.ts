import { describe, expect, it } from "vitest";
import {
  deriveCheckpointStatus,
  getMissingEvidenceFields
} from "../domain/checkpointRules";
import { verifiedProjectFixture } from "./fixtures/projects";

describe("checkpoint evidence rules", () => {
  it("verifies the observed seed only when every required field is present", () => {
    const project = verifiedProjectFixture();
    expect(getMissingEvidenceFields(project.evidence)).toEqual([]);
    expect(deriveCheckpointStatus(project.evidence)).toBe("verified");
  });

  it("leaves verified status when a required field is removed", () => {
    const project = verifiedProjectFixture();
    project.evidence.trainingCommand = "   ";
    expect(getMissingEvidenceFields(project.evidence)).toContain("trainingCommand");
    expect(deriveCheckpointStatus(project.evidence)).toBe("in_progress");
  });

  it("records an explicit failed run as failed", () => {
    const project = verifiedProjectFixture();
    project.evidence.runOutcome = "failed";
    expect(deriveCheckpointStatus(project.evidence)).toBe("failed");
  });

  it("rejects a local result below zero", () => {
    const project = verifiedProjectFixture();
    project.evidence.localResult = -0.001;
    expect(getMissingEvidenceFields(project.evidence)).toContain("localResult");
    expect(deriveCheckpointStatus(project.evidence)).toBe("in_progress");
  });

  it("rejects a local result above one", () => {
    const project = verifiedProjectFixture();
    project.evidence.localResult = 1.001;
    expect(getMissingEvidenceFields(project.evidence)).toContain("localResult");
    expect(deriveCheckpointStatus(project.evidence)).toBe("in_progress");
  });

  it("accepts both inclusive local-result boundaries", () => {
    const project = verifiedProjectFixture();
    project.evidence.localResult = 0;
    expect(deriveCheckpointStatus(project.evidence)).toBe("verified");
    project.evidence.localResult = 1;
    expect(deriveCheckpointStatus(project.evidence)).toBe("verified");
  });

  it("rejects non-finite local results", () => {
    const project = verifiedProjectFixture();
    project.evidence.localResult = Number.POSITIVE_INFINITY;
    expect(deriveCheckpointStatus(project.evidence)).toBe("in_progress");
    project.evidence.localResult = Number.NaN;
    expect(deriveCheckpointStatus(project.evidence)).toBe("in_progress");
  });
});
