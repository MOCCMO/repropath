import { AlertCircle, CheckCircle2, FileCheck2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { AppShell } from "../../app/AppShell";
import { paths } from "../../app/paths";
import { StatusSummary } from "../../components/StatusSummary";
import {
  deriveCheckpointStatus,
  evidenceFieldLabels,
  getMissingEvidenceFields
} from "../../domain/checkpointRules";
import { deriveReproductionStatus } from "../../domain/reproductionStatus";
import { useProject } from "../../state/projectContext";
import { CheckpointEvidenceForm } from "./CheckpointEvidenceForm";

export function CheckpointWorkspacePage() {
  const { demo, project, updateEvidence } = useProject();
  if (!project) return <Navigate to="/" replace />;

  const runEvidence = project.checkpoints["run-minimal-target"].evidence;
  const checkpointStatus = deriveCheckpointStatus(runEvidence);
  const reproductionStatus = deriveReproductionStatus(runEvidence);
  const missing = getMissingEvidenceFields(runEvidence);

  return (
    <AppShell activeStep="checkpoint">
      <main className="checkpoint-page">
        <aside className="checkpoint-rail">
          <p className="rail-label">First-slice protocol</p>
          <div className={`rail-checkpoint is-${checkpointStatus}`}>
            <span className="rail-number">1</span>
            <div>
              <strong>Run minimal target</strong>
              <span>{checkpointStatus.replace("_", " ")}</span>
            </div>
            {checkpointStatus === "verified" && <CheckCircle2 size={18} />}
          </div>
          <div className="rail-stop">
            <AlertCircle size={17} />
            <p>The remaining six checkpoints are held for review.</p>
          </div>
        </aside>

        <section className="checkpoint-main">
          <div className="page-heading checkpoint-heading">
            <div>
              <span className="page-context">Checkpoint 1 of 1</span>
              <h1>Record the minimal fastText run</h1>
              <p>
                Verify the method-level target by keeping the environment,
                commands, output, result, and scope confirmation together.
              </p>
            </div>
            <Link className="button button-quiet" to={paths.passport}>
              <FileCheck2 size={17} /> Preview Passport
            </Link>
          </div>

          <div className="checkpoint-contract">
            <div>
              <span>Purpose</span>
              <p>Verify that the pinned fastText workflow runs end-to-end on mini-news.</p>
            </div>
            <div>
              <span>Expected output</span>
              <p>{demo.map.minimalTarget.value.expectedOutput}</p>
            </div>
          </div>

          <section className="evidence-section" aria-labelledby="evidence-heading">
            <div className="section-title-row evidence-title-row">
              <div>
                <h2 id="evidence-heading">Run evidence</h2>
                <p>Seeded values were observed twice and remain editable.</p>
              </div>
              <span className={`checkpoint-status status-${checkpointStatus}`}>
                {checkpointStatus.replace("_", " ")}
              </span>
            </div>
            <CheckpointEvidenceForm evidence={runEvidence} onChange={updateEvidence} />
          </section>
        </section>

        <aside className="checkpoint-summary">
          <StatusSummary status={reproductionStatus} missingCount={missing.length} compact />
          <section className="requirements-list">
            <h2>Evidence gate</h2>
            <ul>
              {(Object.keys(evidenceFieldLabels) as Array<keyof typeof evidenceFieldLabels>).map(
                (field) => {
                  const complete = !missing.includes(field);
                  return (
                    <li key={field} className={complete ? "is-complete" : ""}>
                      <span>{complete ? "✓" : "—"}</span>
                      {evidenceFieldLabels[field]}
                    </li>
                  );
                }
              )}
            </ul>
          </section>
          <section className="open-gap-card">
            <span>Open scope gap</span>
            <p>{demo.map.benchmarkGap.value}</p>
          </section>
        </aside>
      </main>
    </AppShell>
  );
}
