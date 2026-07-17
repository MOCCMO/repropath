import type { CheckpointId } from "../../domain/checkpointDefinitions";
import type {
  FullProtocolProject,
  ReproductionGap
} from "../../domain/fullProtocolSchemas";
import type { RunEvidence } from "../../domain/schemas";
import { CheckpointEvidenceForm } from "./CheckpointEvidenceForm";
import { ReadOnlyCheckpointEvidence } from "./ReadOnlyCheckpointEvidence";
import { RecordGapsEvidence } from "./RecordGapsEvidence";

type CheckpointEvidenceViewProps = {
  checkpointId: CheckpointId;
  project: FullProtocolProject;
  onRunEvidenceChange: (patch: Partial<RunEvidence>) => void;
  onNotesChange: (notes: string) => void;
  onAddGap: (gap: ReproductionGap) => void;
  onRemoveGap: (gapId: string) => void;
};

export function CheckpointEvidenceView({
  checkpointId,
  project,
  onRunEvidenceChange,
  onNotesChange,
  onAddGap,
  onRemoveGap
}: CheckpointEvidenceViewProps) {
  if (checkpointId === "run-minimal-target") {
    return (
      <CheckpointEvidenceForm
        evidence={project.checkpoints[checkpointId].evidence}
        onChange={onRunEvidenceChange}
      />
    );
  }
  if (checkpointId === "record-gaps") {
    return (
      <RecordGapsEvidence
        project={project}
        onNotesChange={onNotesChange}
        onAddGap={onAddGap}
        onRemoveGap={onRemoveGap}
      />
    );
  }
  return (
    <ReadOnlyCheckpointEvidence
      checkpointId={checkpointId}
      project={project}
    />
  );
}
