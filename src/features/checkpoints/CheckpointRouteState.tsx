import { AlertTriangle, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { checkpointPath, paths } from "../../app/paths";
import {
  checkpointDefinitions,
  type CheckpointId
} from "../../domain/checkpointDefinitions";

type LockedCheckpointProps = {
  checkpointId: CheckpointId;
  prerequisiteId: CheckpointId;
};

export function LockedCheckpoint({
  checkpointId,
  prerequisiteId
}: LockedCheckpointProps) {
  const checkpoint = checkpointDefinitions.find(({ id }) => id === checkpointId)!;
  const prerequisite = checkpointDefinitions.find(
    ({ id }) => id === prerequisiteId
  )!;

  return (
    <section className="checkpoint-route-state" aria-labelledby="locked-heading">
      <LockKeyhole size={30} aria-hidden="true" />
      <span className="page-context">
        Checkpoint {checkpoint.order} of {checkpointDefinitions.length}
      </span>
      <h1 id="locked-heading">{checkpoint.title} is locked</h1>
      <p>
        Complete the earliest unfinished prerequisite before working on this
        checkpoint.
      </p>
      <div className="locked-prerequisite">
        <span>Required first</span>
        <strong>
          Checkpoint {prerequisite.order}: {prerequisite.title}
        </strong>
      </div>
      <Link className="button button-primary" to={checkpointPath(prerequisite.id)}>
        Go to first incomplete checkpoint
      </Link>
    </section>
  );
}

export function UnknownCheckpoint() {
  return (
    <section className="checkpoint-route-state" aria-labelledby="unknown-heading">
      <AlertTriangle size={30} aria-hidden="true" />
      <span className="page-context">Route recovery</span>
      <h1 id="unknown-heading">Checkpoint not found</h1>
      <p>
        This checkpoint ID is not part of the seven-step ReproPath protocol.
        Choose a valid checkpoint from the rail or return to the seeded run.
      </p>
      <div className="route-state-actions">
        <Link className="button button-primary" to={paths.checkpoint}>
          Return to checkpoint 5
        </Link>
        <Link className="button button-secondary" to={paths.passport}>
          Preview Passport
        </Link>
      </div>
    </section>
  );
}
