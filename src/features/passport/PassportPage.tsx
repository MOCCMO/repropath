import { AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { AppShell } from "../../app/AppShell";
import { paths } from "../../app/paths";
import { StatusSummary } from "../../components/StatusSummary";
import {
  evidenceProvenanceLabels,
  generatePassport
} from "../../domain/passportGenerator";
import { useProject } from "../../state/projectContext";
import { PassportDownloadButtons } from "./PassportDownloadButtons";

const percent = (value: number | null) =>
  value === null ? "Not recorded" : `${(value * 100).toFixed(1)}%`;

export function PassportPage() {
  const { demo, project } = useProject();
  if (!project) return <Navigate to="/" replace />;
  const passport = generatePassport(demo, project);

  return (
    <AppShell activeStep="passport">
      <main className="page passport-page">
        <div className="page-heading passport-heading">
          <div>
            <h1>Reproduction Passport</h1>
            <p>
              A structured record of the target, evidence, result, and remaining
              boundary.
            </p>
          </div>
          <PassportDownloadButtons passport={passport} />
        </div>

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
                <div><dt>License</dt><dd>{passport.repository.license}</dd></div>
              </dl>
            </section>

            <section className="passport-section">
              <h2><span>02</span> Environment and commands</h2>
              <div className="environment-record">{passport.environment || "Not recorded"}</div>
              <div className="command-records">
                <div><h3>Training</h3><pre>{passport.commands.training || "Not recorded"}</pre></div>
                <div><h3>Evaluation</h3><pre>{passport.commands.evaluation || "Not recorded"}</pre></div>
              </div>
            </section>

            <section className="passport-section">
              <h2><span>03</span> Commands and evidence</h2>
              <div className="evidence-meta">
                <span>Outcome <strong>{passport.evidence.runOutcome.replace("_", " ")}</strong></span>
                <span>Provenance <strong>{evidenceProvenanceLabels[passport.evidence.provenance]}</strong></span>
              </div>
              <pre className="log-record">{passport.evidence.logExcerpt || "Not recorded"}</pre>
            </section>

            <section className="passport-section">
              <h2><span>04</span> Result and comparison basis</h2>
              <div className="result-table">
                <div className="result-header"><span>Result</span><span>Dataset</span><span>Value</span></div>
                <div><strong>Published</strong><span>AG paper benchmark</span><span>{percent(passport.comparison.paperResult)}</span></div>
                <div><strong>Local</strong><span>{passport.comparison.localDataset}</span><span>{percent(passport.comparison.localResult)} P@1</span></div>
              </div>
              <div className="not-comparable">
                <AlertTriangle size={18} />
                <p><strong>Not comparable.</strong> {passport.comparison.explanation}</p>
              </div>
            </section>
          </div>

          <aside className="passport-summary">
            <StatusSummary
              status={passport.status}
              missingCount={passport.missingFields.length}
            />
            <section>
              <h2>Minimal target</h2>
              <p className="summary-target">{passport.target.title}</p>
              <dl>
                <div><dt>Target type</dt><dd>Method smoke test</dd></div>
                <div><dt>Local dataset</dt><dd>{passport.target.dataset}</dd></div>
                <div><dt>Comparison</dt><dd>Not comparable</dd></div>
              </dl>
            </section>
            <section>
              <h2>Unresolved gaps</h2>
              {passport.gaps.map((gap) => <p className="gap-entry" key={gap}>{gap}</p>)}
            </section>
            <section>
              <h2>Missing evidence</h2>
              {passport.missingFields.length ? (
                <ul>{passport.missingFields.map((field) => <li key={field}>{field}</li>)}</ul>
              ) : <p className="all-present">All method-level evidence is present.</p>}
            </section>
            <section>
              <h2>Source coverage</h2>
              <p>{passport.sources.length} source locators travel with the JSON export.</p>
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
