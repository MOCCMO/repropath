import {
  deriveCheckpointStatus,
  hasAnyRunEvidence
} from "./checkpointRules";
import type { ReproductionStatus, RunEvidence } from "./schemas";

export function deriveReproductionStatus(
  evidence: RunEvidence
): ReproductionStatus {
  if (evidence.runOutcome === "failed") return "not_reproduced";
  if (deriveCheckpointStatus(evidence) === "verified") {
    return "minimal_target_reproduced";
  }
  return hasAnyRunEvidence(evidence) ? "in_progress" : "insufficient_evidence";
}

export const reproductionStatusLabels: Record<ReproductionStatus, string> = {
  insufficient_evidence: "Insufficient evidence",
  in_progress: "In progress",
  minimal_target_reproduced: "Minimal target reproduced",
  not_reproduced: "Not reproduced"
};
