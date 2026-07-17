import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { checkpointPath, paths } from "../../app/paths";
import {
  checkpointDefinitions,
  type CheckpointId
} from "../../domain/checkpointDefinitions";
import type { CheckpointStatus } from "../../domain/schemas";

type CheckpointNavigationProps = {
  checkpointId: CheckpointId;
  status: CheckpointStatus;
};

export function CheckpointNavigation({
  checkpointId,
  status
}: CheckpointNavigationProps) {
  const index = checkpointDefinitions.findIndex(({ id }) => id === checkpointId);
  const previous = checkpointDefinitions[index - 1];
  const next = checkpointDefinitions[index + 1];
  const continuePath = next ? checkpointPath(next.id) : paths.passport;
  const continueLabel = next ? "Continue" : "Continue to Passport";
  const canContinue = status === "verified";

  return (
    <nav className="checkpoint-navigation" aria-label="Checkpoint navigation">
      <div>
        {previous ? (
          <Link className="button button-secondary" to={checkpointPath(previous.id)}>
            <ArrowLeft size={18} aria-hidden="true" /> Previous
          </Link>
        ) : (
          <Link className="button button-secondary" to={paths.map}>
            <ArrowLeft size={18} aria-hidden="true" /> Back to map
          </Link>
        )}
      </div>
      <div className="continue-control">
        {canContinue ? (
          <Link className="button button-primary" to={continuePath}>
            {continueLabel} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        ) : (
          <button
            className="button button-primary"
            type="button"
            disabled
            aria-describedby="continue-requirement"
          >
            {continueLabel} <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
        {!canContinue && (
          <span id="continue-requirement">
            Verify this checkpoint before continuing.
          </span>
        )}
      </div>
    </nav>
  );
}
