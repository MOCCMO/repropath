import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { AppShell } from "../../app/AppShell";
import { paths } from "../../app/paths";
import { EvidenceStatus } from "../../components/EvidenceStatus";
import { useProject } from "../../state/projectContext";

export function ReproductionMapPage() {
  const { demo, project } = useProject();
  if (!project) return <Navigate to="/" replace />;

  const rows = [
    { label: "Paper task", item: demo.map.paperTask },
    { label: "Paper dataset", item: demo.map.paperDataset },
    { label: "Metric", item: demo.map.paperMetric },
    {
      label: "Published result",
      item: {
        ...demo.map.paperResult,
        value: `${(demo.map.paperResult.value * 100).toFixed(1)}%`
      }
    }
  ];

  return (
    <AppShell activeStep="map">
      <main className="page map-page">
        <div className="page-heading">
          <div>
            <h1>Define what counts as reproduced</h1>
            <p>
              Translate the paper into the smallest verifiable target, then keep
              the benchmark boundary visible.
            </p>
          </div>
        </div>

        <div className="map-layout">
          <section className="map-table-panel" aria-labelledby="paper-code-heading">
            <div className="panel-heading">
              <div>
                <span className="panel-index">01</span>
                <h2 id="paper-code-heading">Paper-to-code map</h2>
              </div>
              <span className="source-count">All claims sourced</span>
            </div>

            <div className="map-table" role="table" aria-label="Paper to code map">
              <div className="map-row map-header" role="row">
                <span role="columnheader">Element</span>
                <span role="columnheader">What is established</span>
                <span role="columnheader">Evidence</span>
              </div>
              {rows.map(({ label, item }) => (
                <div className="map-row" role="row" key={label}>
                  <strong role="cell">{label}</strong>
                  <span role="cell">{item.value}</span>
                  <span role="cell">
                    <EvidenceStatus provenance={item.provenance} sources={item.sources} />
                  </span>
                </div>
              ))}
              <div className="map-row repository-row" role="row">
                <strong role="cell">Repository components</strong>
                <div role="cell">
                  {demo.map.repositoryComponents.value.map((component) => (
                    <div className="repo-component" key={component.path}>
                      <code>{component.path}</code>
                      <span>{component.role}</span>
                    </div>
                  ))}
                </div>
                <span role="cell">
                  <EvidenceStatus
                    provenance={demo.map.repositoryComponents.provenance}
                    sources={demo.map.repositoryComponents.sources}
                  />
                </span>
              </div>
              <div className="map-row repository-row" role="row">
                <strong role="cell">Pinned code version</strong>
                <div role="cell" className="commit-value">
                  <a href={demo.repository.url.value} target="_blank" rel="noreferrer">
                    {demo.repository.url.value}
                  </a>
                  <code>{demo.repository.commit.value}</code>
                </div>
                <span role="cell">
                  <EvidenceStatus
                    provenance={demo.repository.commit.provenance}
                    sources={demo.repository.commit.sources}
                  />
                </span>
              </div>
            </div>
          </section>

          <aside className="target-panel" aria-labelledby="target-heading">
            <span className="panel-index">02</span>
            <h2 id="target-heading">Minimal target</h2>
            <div className="target-type">Method-level smoke test</div>
            <h3>{demo.map.minimalTarget.value.title}</h3>
            <dl>
              <div>
                <dt>Dataset</dt>
                <dd>{demo.map.minimalTarget.value.dataset}</dd>
              </div>
              <div>
                <dt>Expected output</dt>
                <dd>{demo.map.minimalTarget.value.expectedOutput}</dd>
              </div>
            </dl>
            <h3 className="criteria-heading">Success criteria</h3>
            <ol className="criteria-list">
              {demo.map.minimalTarget.value.successCriteria.map((criterion) => (
                <li key={criterion}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  <span>{criterion}</span>
                </li>
              ))}
            </ol>
            <div className="gap-callout">
              <AlertCircle size={20} aria-hidden="true" />
              <div>
                <strong>Benchmark gap · Not comparable</strong>
                <p>{demo.map.benchmarkGap.value}</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="page-actions">
          <Link className="button button-secondary" to="/">
            <ArrowLeft size={18} /> Back to intake
          </Link>
          <Link
            className="button button-primary"
            to={paths.checkpoint}
          >
            Confirm minimal target <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
