import { FileCheck2 } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AppShell } from "../../app/AppShell";
import { paths } from "../../app/paths";
import { StatusSummary } from "../../components/StatusSummary";
import {
  checkpointDefinitions,
  checkpointIdSchema
} from "../../domain/checkpointDefinitions";
import {
  deriveFullProtocolSummary,
  getFirstIncompletePrerequisite
} from "../../domain/fullProtocolRules";
import { useProject } from "../../state/projectContext";
import { CheckpointEvidenceForm } from "./CheckpointEvidenceForm";
import { CheckpointNavigation } from "./CheckpointNavigation";
import { CheckpointRail } from "./CheckpointRail";
import { checkpointStatusLabels } from "./checkpointStatusLabels";
import {
  LockedCheckpoint,
  UnknownCheckpoint
} from "./CheckpointRouteState";

export function CheckpointWorkspacePage() {
  const { projectId, checkpointId: routeCheckpointId } = useParams();
  const { project, updateEvidence } = useProject();
  if (!project) return <Navigate to="/" replace />;

  const protocolSummary = deriveFullProtocolSummary(project);
  const missingCheckpointCount = Object.values(
    protocolSummary.checkpointStatuses
  ).filter((status) => status !== "verified").length;
  const parsedCheckpointId = checkpointIdSchema.safeParse(routeCheckpointId);
  const routeIsValid = projectId === project.id && parsedCheckpointId.success;
  const checkpointId = parsedCheckpointId.success
    ? parsedCheckpointId.data
    : undefined;

  if (!routeIsValid || !checkpointId) {
    return (
      <AppShell activeStep="checkpoint">
        <main className="checkpoint-page">
          <CheckpointRail statuses={protocolSummary.checkpointStatuses} />
          <div className="checkpoint-main">
            <UnknownCheckpoint />
          </div>
          <aside className="checkpoint-summary">
            <StatusSummary
              status={protocolSummary.reproductionStatus}
              missingCount={missingCheckpointCount}
              compact
            />
          </aside>
        </main>
      </AppShell>
    );
  }

  const definition = checkpointDefinitions.find(({ id }) => id === checkpointId)!;
  const checkpointStatus = protocolSummary.checkpointStatuses[checkpointId];
  const incompletePrerequisite = getFirstIncompletePrerequisite(
    checkpointId,
    protocolSummary.checkpointStatuses
  );

  if (incompletePrerequisite) {
    return (
      <AppShell activeStep="checkpoint">
        <main className="checkpoint-page">
          <CheckpointRail
            activeCheckpointId={checkpointId}
            statuses={protocolSummary.checkpointStatuses}
          />
          <div className="checkpoint-main">
            <LockedCheckpoint
              checkpointId={checkpointId}
              prerequisiteId={incompletePrerequisite}
            />
          </div>
          <aside className="checkpoint-summary">
            <StatusSummary
              status={protocolSummary.reproductionStatus}
              missingCount={missingCheckpointCount}
              compact
            />
          </aside>
        </main>
      </AppShell>
    );
  }

  const isRunCheckpoint = checkpointId === "run-minimal-target";
  const runEvidence = project.checkpoints["run-minimal-target"].evidence;

  return (
    <AppShell activeStep="checkpoint">
      <main className="checkpoint-page">
        <CheckpointRail
          activeCheckpointId={checkpointId}
          statuses={protocolSummary.checkpointStatuses}
        />

        <section className="checkpoint-main">
          <div className="page-heading checkpoint-heading">
            <div>
              <span className="page-context">
                Checkpoint {definition.order} of {checkpointDefinitions.length}
              </span>
              <h1>{definition.title}</h1>
              <p>{definition.purpose}</p>
            </div>
            <Link className="button button-quiet" to={paths.passport}>
              <FileCheck2 size={17} aria-hidden="true" /> Preview Passport
            </Link>
          </div>

          <div className="checkpoint-contract">
            <div>
              <span>Interaction</span>
              <p>
                {definition.evidenceMode === "curated_editable"
                  ? "Seeded evidence · editable"
                  : definition.evidenceMode === "derived"
                    ? "Derived evidence · read-only"
                    : definition.evidenceMode === "curated_extensible"
                      ? "Curated evidence with learner additions"
                      : "Curated evidence · read-only"}
              </p>
            </div>
            <div>
              <span>Current status</span>
              <p>{checkpointStatusLabels[checkpointStatus]}</p>
            </div>
          </div>

          <section className="evidence-section" aria-labelledby="evidence-heading">
            <div className="section-title-row evidence-title-row">
              <div>
                <h2 id="evidence-heading">
                  {isRunCheckpoint ? "Run evidence" : "Checkpoint evidence"}
                </h2>
                <p>
                  {isRunCheckpoint
                    ? "Seeded values were observed twice and remain editable."
                    : "Inspect the evidence, provenance, sources, and verification criteria."}
                </p>
              </div>
              <span className={`checkpoint-status status-${checkpointStatus}`}>
                Status: {checkpointStatusLabels[checkpointStatus]}
              </span>
            </div>
            {isRunCheckpoint ? (
              <CheckpointEvidenceForm
                evidence={runEvidence}
                onChange={updateEvidence}
              />
            ) : (
              <div className="read-only-placeholder">
                <strong>Read-only evidence record</strong>
                <p>
                  This route is connected to the full protocol state. Its
                  structured evidence view is added in the next implementation
                  commit.
                </p>
              </div>
            )}
          </section>

          <CheckpointNavigation
            checkpointId={checkpointId}
            status={checkpointStatus}
          />
        </section>

        <aside className="checkpoint-summary">
          <StatusSummary
            status={protocolSummary.reproductionStatus}
            missingCount={missingCheckpointCount}
            compact
          />
          <section className="requirements-list">
            <h2>Checkpoint position</h2>
            <p>
              {definition.order} of {checkpointDefinitions.length} · {checkpointStatusLabels[checkpointStatus]}
            </p>
          </section>
          <section className="open-gap-card">
            <span>Passport access</span>
            <p>
              The Passport remains available even when one or more checkpoints
              are incomplete or locked.
            </p>
          </section>
        </aside>
      </main>
    </AppShell>
  );
}
