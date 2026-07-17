import type { CheckpointStatus, RunEvidence } from "./schemas";

export type EvidenceField =
  | "environment"
  | "trainingCommand"
  | "evaluationCommand"
  | "logExcerpt"
  | "localResult"
  | "resultDatasetScopeConfirmed"
  | "runOutcome";

export const evidenceFieldLabels: Record<EvidenceField, string> = {
  environment: "Environment summary",
  trainingCommand: "Training command",
  evaluationCommand: "Evaluation command",
  logExcerpt: "Evaluation log excerpt",
  localResult: "Local P@1 result",
  resultDatasetScopeConfirmed: "Mini-news scope confirmation",
  runOutcome: "Run outcome"
};

const hasText = (value: string) => value.trim().length > 0;

export function isValidLocalResult(value: number | null): value is number {
  return (
    value !== null &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}

export function getMissingEvidenceFields(
  evidence: RunEvidence
): EvidenceField[] {
  const missing: EvidenceField[] = [];

  if (!hasText(evidence.environment)) missing.push("environment");
  if (!hasText(evidence.trainingCommand)) missing.push("trainingCommand");
  if (!hasText(evidence.evaluationCommand)) missing.push("evaluationCommand");
  if (!hasText(evidence.logExcerpt)) missing.push("logExcerpt");
  if (!isValidLocalResult(evidence.localResult)) {
    missing.push("localResult");
  }
  if (!evidence.resultDatasetScopeConfirmed) {
    missing.push("resultDatasetScopeConfirmed");
  }
  if (evidence.runOutcome === "not_recorded") missing.push("runOutcome");

  return missing;
}

export function hasAnyRunEvidence(evidence: RunEvidence): boolean {
  return (
    hasText(evidence.environment) ||
    hasText(evidence.trainingCommand) ||
    hasText(evidence.evaluationCommand) ||
    hasText(evidence.logExcerpt) ||
    evidence.localResult !== null ||
    hasText(evidence.notes) ||
    evidence.resultDatasetScopeConfirmed ||
    evidence.runOutcome !== "not_recorded"
  );
}

export function deriveCheckpointStatus(
  evidence: RunEvidence
): CheckpointStatus {
  if (evidence.runOutcome === "failed") return "failed";
  if (
    evidence.runOutcome === "succeeded" &&
    getMissingEvidenceFields(evidence).length === 0
  ) {
    return "verified";
  }
  return hasAnyRunEvidence(evidence) ? "in_progress" : "not_started";
}
