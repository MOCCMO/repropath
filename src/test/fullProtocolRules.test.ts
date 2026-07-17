import { describe, expect, it } from "vitest";
import frozenProjectV1Json from "./fixtures/project-v1-frozen.json";
import {
  deriveCheckpointStatuses,
  deriveFullProtocolSummary,
  deriveIntrinsicCheckpointStatus,
  deriveProjectReproductionStatus,
  getFirstIncompletePrerequisite
} from "../domain/fullProtocolRules";
import { hydrateProjectV1ToV2 } from "../domain/projectHydration";
import { demoFixture } from "./fixtures/projects";

const hydratedProject = () =>
  hydrateProjectV1ToV2(frozenProjectV1Json, demoFixture);

describe("full protocol status rules", () => {
  it("verifies the complete curated seven-checkpoint seed", () => {
    const project = hydratedProject();
    const summary = deriveFullProtocolSummary(project);

    expect(Object.values(summary.checkpointStatuses)).toEqual([
      "verified",
      "verified",
      "verified",
      "verified",
      "verified",
      "verified",
      "verified"
    ]);
    expect(summary.reproductionStatus).toBe("minimal_target_reproduced");
    expect(summary.firstIncompleteCheckpointId).toBeNull();
  });

  it("moves checkpoint 5 to in_progress and blocks checkpoints 6 and 7", () => {
    const project = hydratedProject();
    project.checkpoints["run-minimal-target"].evidence.trainingCommand = "";
    const summary = deriveFullProtocolSummary(project);

    expect(summary.checkpointStatuses["run-minimal-target"]).toBe(
      "in_progress"
    );
    expect(summary.checkpointStatuses["compare-results"]).toBe("blocked");
    expect(summary.checkpointStatuses["record-gaps"]).toBe("blocked");
    expect(summary.firstIncompleteCheckpointId).toBe("run-minimal-target");
    expect(summary.reproductionStatus).toBe("in_progress");
    expect(
      getFirstIncompletePrerequisite(
        "compare-results",
        summary.checkpointStatuses
      )
    ).toBe("run-minimal-target");
    expect(
      getFirstIncompletePrerequisite(
        "record-gaps",
        summary.checkpointStatuses
      )
    ).toBe("run-minimal-target");
  });

  it("maps an explicit failed run to blocked checkpoint and not_reproduced project", () => {
    const project = hydratedProject();
    project.checkpoints["run-minimal-target"].evidence.runOutcome = "failed";
    const statuses = deriveCheckpointStatuses(project);

    expect(statuses["run-minimal-target"]).toBe("blocked");
    expect(statuses["compare-results"]).toBe("blocked");
    expect(deriveProjectReproductionStatus(project, statuses)).toBe(
      "not_reproduced"
    );
  });

  it("propagates an environment blocker to all later checkpoints", () => {
    const project = hydratedProject();
    project.checkpoints["prepare-environment"].evidence.readiness = "blocked";
    const summary = deriveFullProtocolSummary(project);

    expect(summary.checkpointStatuses["prepare-environment"]).toBe("blocked");
    expect(summary.checkpointStatuses["run-minimal-target"]).toBe("blocked");
    expect(summary.checkpointStatuses["compare-results"]).toBe("blocked");
    expect(summary.checkpointStatuses["record-gaps"]).toBe("blocked");
    expect(summary.firstIncompleteCheckpointId).toBe("prepare-environment");
  });

  it("treats a recorded unresolved gap as verified evidence, not a failed run", () => {
    const project = hydratedProject();
    const gap = project.checkpoints["record-gaps"].evidence.gaps[0];

    expect(gap.status).toBe("unresolved");
    expect(deriveCheckpointStatuses(project)["record-gaps"]).toBe("verified");
    expect(deriveProjectReproductionStatus(project)).toBe(
      "minimal_target_reproduced"
    );
  });

  it("keeps checkpoint 3 incomplete without localMetric", () => {
    const project = hydratedProject();
    project.checkpoints["confirm-data-and-metric"].evidence.localMetric = "";

    expect(
      deriveIntrinsicCheckpointStatus("confirm-data-and-metric", project)
    ).toBe("in_progress");
  });

  it("verifies checkpoint 3 with both paperMetric and localMetric", () => {
    const project = hydratedProject();
    const evidence = project.checkpoints["confirm-data-and-metric"].evidence;
    evidence.paperMetric = "Test accuracy (%)";
    evidence.localMetric = "P@1";

    expect(
      deriveIntrinsicCheckpointStatus("confirm-data-and-metric", project)
    ).toBe("verified");
  });

  it("keeps checkpoint 4 incomplete without setupCommand", () => {
    const project = hydratedProject();
    project.checkpoints["prepare-environment"].evidence.setupCommand = "";

    expect(
      deriveIntrinsicCheckpointStatus("prepare-environment", project)
    ).toBe("in_progress");
  });

  it("keeps checkpoint 4 incomplete without diagnosticOutput", () => {
    const project = hydratedProject();
    project.checkpoints["prepare-environment"].evidence.diagnosticOutput = "";

    expect(
      deriveIntrinsicCheckpointStatus("prepare-environment", project)
    ).toBe("in_progress");
  });

  it("keeps checkpoint 7 incomplete without impactOnClaim", () => {
    const project = hydratedProject();
    project.checkpoints["record-gaps"].evidence.gaps[0].impactOnClaim = "";

    expect(
      deriveIntrinsicCheckpointStatus("record-gaps", project)
    ).toBe("in_progress");
  });

  it("derives not_started and insufficient_evidence for an empty protocol", () => {
    const project = hydratedProject();
    project.checkpoints["understand-task"].evidence = {
      ...project.checkpoints["understand-task"].evidence,
      paperTask: "",
      reproductionTarget: "",
      expectedOutput: "",
      scopeBoundary: ""
    };
    project.checkpoints["connect-repository"].evidence = {
      ...project.checkpoints["connect-repository"].evidence,
      repositoryUrl: "",
      repositoryCommit: "",
      components: []
    };
    project.checkpoints["confirm-data-and-metric"].evidence = {
      ...project.checkpoints["confirm-data-and-metric"].evidence,
      paperDataset: "",
      localDataset: "",
      paperMetric: "",
      localMetric: "",
      datasetScopeConfirmed: false,
      comparisonBasis: null,
      scopeExplanation: ""
    };
    project.checkpoints["prepare-environment"].evidence = {
      ...project.checkpoints["prepare-environment"].evidence,
      environmentSummary: "",
      repositoryCommit: "",
      setupCommand: "",
      diagnosticOutput: "",
      readiness: "not_recorded"
    };
    project.checkpoints["run-minimal-target"].evidence = {
      ...project.checkpoints["run-minimal-target"].evidence,
      environment: "",
      trainingCommand: "",
      evaluationCommand: "",
      logExcerpt: "",
      localResult: null,
      notes: "",
      resultDatasetScopeConfirmed: false,
      runOutcome: "not_recorded"
    };
    project.checkpoints["compare-results"].evidence = {
      ...project.checkpoints["compare-results"].evidence,
      paperDataset: "",
      localDataset: "",
      paperMetric: "",
      localMetric: "",
      paperResult: null,
      localResult: null,
      comparisonBasis: null,
      explanation: ""
    };
    project.checkpoints["record-gaps"].evidence = {
      ...project.checkpoints["record-gaps"].evidence,
      gaps: [],
      learnerNotes: ""
    };

    expect(
      deriveIntrinsicCheckpointStatus("understand-task", project)
    ).toBe("not_started");
    expect(deriveProjectReproductionStatus(project)).toBe(
      "insufficient_evidence"
    );
  });
});
