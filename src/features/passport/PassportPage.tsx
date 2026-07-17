import { AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { AppShell } from "../../app/AppShell";
import { paths } from "../../app/paths";
import { StatusSummary } from "../../components/StatusSummary";
import {
  checkpointStatusLabels,
  evidenceProvenanceLabels,
  formatMetricResult,
  generatePassport
} from "../../domain/passportGenerator";
import { useProject } from "../../state/projectContext";
import { PassportDownloadButtons } from "./PassportDownloadButtons";

const readableToken = (value: string) => value.replaceAll("_", " ");

export function PassportPage() {
  const { demo, project } = useProject();
  if (!project) return <Navigate to="/" replace />;
  const passport = generatePassport(demo, project);
  const environmentCheckpoint = passport.checkpoints.find(
    (checkpoint) => checkpoint.checkpointId === "prepare-environment"
  );
  const runCheckpoint = passport.checkpoints.find(
    (checkpoint) => checkpoint.checkpointId === "run-minimal-target"
  );
  if (
    !environmentCheckpoint ||
    environmentCheckpoint.checkpointId !== "prepare-environment" ||
    !runCheckpoint ||
    runCheckpoint.checkpointId !== "run-minimal-target"
  ) {
    throw new Error("Passport v2 is missing required checkpoint records.");
  }

  return (
    <AppShell activeStep="passport">
      <main className="page passport-page">
        <div className="page-heading passport-heading">
          <div>
            <h1>Reproduction Passport</h1>
            <p>
              A versioned record of all seven checkpoints, evidence boundaries,
              comparison scope, and unresolved gaps.
            </p>
          </div>
          <PassportDownloadButtons passport={passport} />
        </div>

        <section className="passport-executive" aria-labelledby="passport-status-heading">
          <div>
            <h2 id="passport-status-heading">Executive status summary</h2>
            <p>
              <strong>{passport.overallStatusLabel}.</strong>{" "}
              {passport.claimBoundary.explanation}
            </p>
          </div>
          <dl>
            <div>
              <dt>Minimal method target</dt>
              <dd>{readableToken(passport.claimBoundary.minimalMethodTarget)}</dd>
            </div>
            <div>
              <dt>Paper benchmark</dt>
              <dd>{readableToken(passport.claimBoundary.paperBenchmark)}</dd>
            </div>
          </dl>
        </section>

        <div className="passport-layout">
          <div className="passport-record">
            <section className="passport-section">
              <h2><span>01</span> Paper and code versions</h2>
              <dl className="record-list">
                <div><dt>Paper</dt><dd>{passport.paper.title}</dd></div>
                <div><dt>Authors</dt><dd>{passport.paper.authors.join(", ")}</dd></div>
                <div><dt>Version</dt><dd>{passport.paper.version}</dd></div>
                <div><dt>Repository</dt><dd><a href={passport.repository.url} target="_blank" rel="noreferrer">{passport.repository.url} <ExternalLink size={13} /></a></dd></div>
                <div><dt>Commit</dt><dd><code>{passport.repository.commit}</code></dd></div>
                <div><dt>Project schema</dt><dd>v{passport.project.schemaVersion}</dd></div>
                <div><dt>Passport schema</dt><dd>v{passport.schemaVersion}</dd></div>
              </dl>
            </section>

            <section className="passport-section">
              <h2><span>02</span> Seven-checkpoint record</h2>
              <div className="passport-checkpoint-table" role="region" aria-label="Seven checkpoint export summary" tabIndex={0}>
                <table>
                  <thead>
                    <tr><th>#</th><th>Checkpoint</th><th>Status</th><th>Provenance</th><th>Missing</th></tr>
                  </thead>
                  <tbody>
                    {passport.checkpoints.map((checkpoint) => (
                      <tr key={checkpoint.checkpointId}>
                        <td>{checkpoint.order}</td>
                        <td>{checkpoint.title}<small>{readableToken(checkpoint.evidenceMode)}</small></td>
                        <td>{checkpointStatusLabels[checkpoint.derivedStatus]}</td>
                        <td>{evidenceProvenanceLabels[checkpoint.evidenceProvenance]}</td>
                        <td>{checkpoint.missingRequirements.length || "None"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="passport-section">
              <h2><span>03</span> Environment setup</h2>
              <dl className="record-list">
                <div><dt>Environment</dt><dd>{environmentCheckpoint.evidence.environmentSummary || "Not recorded"}</dd></div>
                <div><dt>Commit</dt><dd><code>{environmentCheckpoint.evidence.repositoryCommit || "Not recorded"}</code></dd></div>
                <div><dt>Readiness</dt><dd>{readableToken(environmentCheckpoint.evidence.readiness)}</dd></div>
              </dl>
              <div className="command-records passport-command-stack">
                <div><h3>Setup command</h3><pre>{environmentCheckpoint.evidence.setupCommand || "Not recorded"}</pre></div>
                <div><h3>Diagnostic output</h3><pre>{environmentCheckpoint.evidence.diagnosticOutput || "Not recorded"}</pre></div>
              </div>
            </section>

            <section className="passport-section">
              <h2><span>04</span> Minimal-target execution</h2>
              <div className="evidence-meta">
                <span>Outcome <strong>{readableToken(runCheckpoint.evidence.runOutcome)}</strong></span>
                <span>Provenance <strong>{evidenceProvenanceLabels[runCheckpoint.evidence.provenance]}</strong></span>
              </div>
              <div className="command-records">
                <div><h3>Training command</h3><pre>{runCheckpoint.evidence.trainingCommand || "Not recorded"}</pre></div>
                <div><h3>Evaluation command</h3><pre>{runCheckpoint.evidence.evaluationCommand || "Not recorded"}</pre></div>
              </div>
              <h3 className="passport-log-heading">Evaluation log</h3>
              <pre className="log-record">{runCheckpoint.evidence.logExcerpt || "Not recorded"}</pre>
            </section>

            <section className="passport-section">
              <h2><span>05</span> Structured comparison basis</h2>
              <div className="result-table">
                <div className="result-header"><span>Result</span><span>Dataset</span><span>Metric</span><span>Value</span></div>
                <div><strong>Paper</strong><span>{passport.comparison.paperDataset}</span><span>{passport.comparison.paperMetric}</span><span>{formatMetricResult(passport.comparison.paperResult, passport.comparison.paperMetric)}</span></div>
                <div><strong>Local</strong><span>{passport.comparison.localDataset}</span><span>{passport.comparison.localMetric}</span><span>{formatMetricResult(passport.comparison.localResult, passport.comparison.localMetric)}</span></div>
              </div>
              <div className="not-comparable">
                <AlertTriangle size={18} />
                <p><strong>{readableToken(passport.comparison.comparisonBasis ?? "not recorded")}.</strong> {passport.comparison.explanation || "No comparison explanation recorded."}</p>
              </div>
            </section>

            <section className="passport-section">
              <h2><span>06</span> Structured reproduction gaps</h2>
              <div className="passport-gaps">
                {passport.gaps.map((gap) => (
                  <article key={gap.id}>
                    <div><strong>{gap.description}</strong><span>{gap.status}</span></div>
                    <p><b>Impact on claim:</b> {gap.impactOnClaim}</p>
                    <small>{evidenceProvenanceLabels[gap.provenance]} · {gap.sources.length} source reference{gap.sources.length === 1 ? "" : "s"}</small>
                  </article>
                ))}
              </div>
              <h3>Learner notes</h3>
              <p>{passport.learnerNotes || "No learner notes recorded."}</p>
            </section>
          </div>

          <aside className="passport-summary">
            <StatusSummary
              status={passport.overallStatus}
              missingCount={passport.missingEvidenceByCheckpoint.length}
            />
            <section>
              <h2>Minimal target</h2>
              <p className="summary-target">{passport.minimalTarget.title}</p>
              <dl>
                <div><dt>Target type</dt><dd>Method smoke test</dd></div>
                <div><dt>Local dataset</dt><dd>{passport.minimalTarget.dataset}</dd></div>
                <div><dt>Comparison</dt><dd>{readableToken(passport.comparison.comparisonBasis ?? "not recorded")}</dd></div>
              </dl>
            </section>
            <section>
              <h2>Missing evidence</h2>
              {passport.missingEvidenceByCheckpoint.length ? (
                <div className="missing-groups">
                  {passport.missingEvidenceByCheckpoint.map((group) => (
                    <div key={group.checkpointId}>
                      <strong>Checkpoint {group.order}: {group.title}</strong>
                      <span>{checkpointStatusLabels[group.status]}</span>
                      <ul>{group.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
                    </div>
                  ))}
                </div>
              ) : <p className="all-present">All checkpoint requirements are present.</p>}
            </section>
            <section>
              <h2>Source coverage</h2>
              <p>{passport.sourceReferences.length} source locators travel with both exports.</p>
            </section>
          </aside>
        </div>

        <div className="page-actions passport-footer-actions">
          <Link className="button button-secondary" to={paths.checkpoint}>
            <ArrowLeft size={18} /> Return to checkpoint
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
