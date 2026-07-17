import {
  hasAnyRunEvidence,
  isValidLocalResult,
  deriveCheckpointStatus as deriveRunCheckpointStatus
} from "./checkpointRules";
import {
  checkpointDefinitions,
  type CheckpointId
} from "./checkpointDefinitions";
import type {
  CheckpointStatus,
  ReproductionStatus
} from "./schemas";
import type {
  FullProtocolProject,
  FullProtocolSummary
} from "./fullProtocolSchemas";

const hasText = (value: string) => value.trim().length > 0;

function deriveUnderstandTaskStatus(
  project: FullProtocolProject
): CheckpointStatus {
  const evidence = project.checkpoints["understand-task"].evidence;
  const values = [
    evidence.paperTask,
    evidence.reproductionTarget,
    evidence.expectedOutput,
    evidence.scopeBoundary
  ];
  if (values.every(hasText)) return "verified";
  return values.some(hasText) ? "in_progress" : "not_started";
}

function deriveConnectRepositoryStatus(
  project: FullProtocolProject
): CheckpointStatus {
  const evidence = project.checkpoints["connect-repository"].evidence;
  const hasComponents =
    evidence.components.length > 0 &&
    evidence.components.every(
      (component) => hasText(component.path) && hasText(component.role)
    );
  if (
    hasText(evidence.repositoryUrl) &&
    hasText(evidence.repositoryCommit) &&
    hasComponents
  ) {
    return "verified";
  }
  return hasText(evidence.repositoryUrl) ||
    hasText(evidence.repositoryCommit) ||
    evidence.components.length > 0
    ? "in_progress"
    : "not_started";
}

function deriveDataAndMetricStatus(
  project: FullProtocolProject
): CheckpointStatus {
  const evidence = project.checkpoints["confirm-data-and-metric"].evidence;
  const hasAny =
    hasText(evidence.paperDataset) ||
    hasText(evidence.localDataset) ||
    hasText(evidence.paperMetric) ||
    evidence.datasetScopeConfirmed ||
    evidence.comparisonBasis !== null ||
    hasText(evidence.scopeExplanation);
  if (
    hasText(evidence.paperDataset) &&
    hasText(evidence.localDataset) &&
    hasText(evidence.paperMetric) &&
    evidence.datasetScopeConfirmed &&
    evidence.comparisonBasis !== null &&
    hasText(evidence.scopeExplanation)
  ) {
    return "verified";
  }
  return hasAny ? "in_progress" : "not_started";
}

function derivePrepareEnvironmentStatus(
  project: FullProtocolProject
): CheckpointStatus {
  const evidence = project.checkpoints["prepare-environment"].evidence;
  if (evidence.readiness === "blocked") return "blocked";
  if (
    evidence.readiness === "ready" &&
    hasText(evidence.environmentSummary) &&
    hasText(evidence.repositoryCommit) &&
    hasText(evidence.readinessEvidence)
  ) {
    return "verified";
  }
  const hasAny =
    hasText(evidence.environmentSummary) ||
    hasText(evidence.repositoryCommit) ||
    hasText(evidence.readinessEvidence) ||
    evidence.readiness !== "not_recorded";
  return hasAny ? "in_progress" : "not_started";
}

function deriveCompareResultsStatus(
  project: FullProtocolProject
): CheckpointStatus {
  const evidence = project.checkpoints["compare-results"].evidence;
  const hasAny =
    hasText(evidence.paperDataset) ||
    hasText(evidence.localDataset) ||
    hasText(evidence.paperMetric) ||
    hasText(evidence.localMetric) ||
    evidence.paperResult !== null ||
    evidence.localResult !== null ||
    evidence.comparisonBasis !== null ||
    hasText(evidence.explanation);
  if (
    hasText(evidence.paperDataset) &&
    hasText(evidence.localDataset) &&
    hasText(evidence.paperMetric) &&
    hasText(evidence.localMetric) &&
    isValidLocalResult(evidence.paperResult) &&
    isValidLocalResult(evidence.localResult) &&
    evidence.comparisonBasis !== null &&
    hasText(evidence.explanation)
  ) {
    return "verified";
  }
  return hasAny ? "in_progress" : "not_started";
}

function deriveRecordGapsStatus(
  project: FullProtocolProject
): CheckpointStatus {
  const evidence = project.checkpoints["record-gaps"].evidence;
  if (
    evidence.gaps.length > 0 &&
    evidence.gaps.every((gap) => hasText(gap.description))
  ) {
    return "verified";
  }
  return evidence.gaps.length > 0 || hasText(evidence.learnerNotes)
    ? "in_progress"
    : "not_started";
}

export function deriveIntrinsicCheckpointStatus(
  checkpointId: CheckpointId,
  project: FullProtocolProject
): CheckpointStatus {
  switch (checkpointId) {
    case "understand-task":
      return deriveUnderstandTaskStatus(project);
    case "connect-repository":
      return deriveConnectRepositoryStatus(project);
    case "confirm-data-and-metric":
      return deriveDataAndMetricStatus(project);
    case "prepare-environment":
      return derivePrepareEnvironmentStatus(project);
    case "run-minimal-target":
      return deriveRunCheckpointStatus(
        project.checkpoints["run-minimal-target"].evidence
      );
    case "compare-results":
      return deriveCompareResultsStatus(project);
    case "record-gaps":
      return deriveRecordGapsStatus(project);
  }
}

export function deriveCheckpointStatuses(
  project: FullProtocolProject
): Record<CheckpointId, CheckpointStatus> {
  const statuses = {} as Record<CheckpointId, CheckpointStatus>;

  checkpointDefinitions.forEach((definition) => {
    const prerequisiteIncomplete = definition.prerequisites.some(
      (prerequisite) => statuses[prerequisite] !== "verified"
    );
    statuses[definition.id] = prerequisiteIncomplete
      ? "blocked"
      : deriveIntrinsicCheckpointStatus(definition.id, project);
  });

  return statuses;
}

export function getFirstIncompleteCheckpointId(
  statuses: Record<CheckpointId, CheckpointStatus>
): CheckpointId | null {
  return (
    checkpointDefinitions.find(
      (definition) => statuses[definition.id] !== "verified"
    )?.id ?? null
  );
}

export function getFirstIncompletePrerequisite(
  checkpointId: CheckpointId,
  statuses: Record<CheckpointId, CheckpointStatus>
): CheckpointId | null {
  const target = checkpointDefinitions.find(
    ({ id }) => id === checkpointId
  );
  return (
    checkpointDefinitions.find(
      (definition) =>
        target !== undefined &&
        definition.order < target.order &&
        statuses[definition.id] !== "verified"
    )?.id ?? null
  );
}

function hasAnyProtocolEvidence(project: FullProtocolProject): boolean {
  const task = project.checkpoints["understand-task"].evidence;
  const repository = project.checkpoints["connect-repository"].evidence;
  const data = project.checkpoints["confirm-data-and-metric"].evidence;
  const environment = project.checkpoints["prepare-environment"].evidence;
  const run = project.checkpoints["run-minimal-target"].evidence;
  const comparison = project.checkpoints["compare-results"].evidence;
  const gaps = project.checkpoints["record-gaps"].evidence;

  return (
    [
      task.paperTask,
      task.reproductionTarget,
      task.expectedOutput,
      task.scopeBoundary,
      repository.repositoryUrl,
      repository.repositoryCommit,
      data.paperDataset,
      data.localDataset,
      data.paperMetric,
      data.scopeExplanation,
      environment.environmentSummary,
      environment.repositoryCommit,
      environment.readinessEvidence,
      comparison.paperDataset,
      comparison.localDataset,
      comparison.paperMetric,
      comparison.localMetric,
      comparison.explanation
    ].some(hasText) ||
    repository.components.length > 0 ||
    environment.readiness !== "not_recorded" ||
    hasAnyRunEvidence(run) ||
    comparison.paperResult !== null ||
    comparison.localResult !== null ||
    gaps.gaps.length > 0 ||
    hasText(gaps.learnerNotes)
  );
}

export function deriveProjectReproductionStatus(
  project: FullProtocolProject,
  statuses = deriveCheckpointStatuses(project)
): ReproductionStatus {
  if (
    project.checkpoints["run-minimal-target"].evidence.runOutcome === "failed"
  ) {
    return "not_reproduced";
  }
  if (
    checkpointDefinitions.every(
      (definition) => statuses[definition.id] === "verified"
    )
  ) {
    return "minimal_target_reproduced";
  }
  return hasAnyProtocolEvidence(project)
    ? "in_progress"
    : "insufficient_evidence";
}

export function deriveFullProtocolSummary(
  project: FullProtocolProject
): FullProtocolSummary {
  const checkpointStatuses = deriveCheckpointStatuses(project);
  return {
    checkpointStatuses,
    reproductionStatus: deriveProjectReproductionStatus(
      project,
      checkpointStatuses
    ),
    firstIncompleteCheckpointId: getFirstIncompleteCheckpointId(
      checkpointStatuses
    )
  };
}
