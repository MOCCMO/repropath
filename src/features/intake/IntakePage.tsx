import { ArrowRight, BookOpen, CodeXml, ExternalLink, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../app/AppShell";
import { paths } from "../../app/paths";
import { EvidenceStatus } from "../../components/EvidenceStatus";
import { useProject } from "../../state/projectContext";

export function IntakePage() {
  const { demo, openCuratedProject } = useProject();
  const navigate = useNavigate();

  const startDemo = () => {
    openCuratedProject();
    navigate(paths.map);
  };

  return (
    <AppShell activeStep="intake">
      <main className="page intake-page">
        <div className="page-heading intake-heading">
          <div>
            <h1>Start a reproduction</h1>
            <p>
              Follow one bounded path from paper and repository to structured,
              reviewable evidence.
            </p>
          </div>
        </div>

        <div className="intake-layout">
          <section aria-labelledby="curated-heading">
            <div className="section-number">1</div>
            <div className="section-title-row">
              <div>
                <h2 id="curated-heading">Use the curated fastText case</h2>
                <p>Recommended for the first three-minute walkthrough.</p>
              </div>
              <EvidenceStatus
                provenance={demo.paper.title.provenance}
                sources={demo.paper.title.sources}
              />
            </div>

            <div className="curated-case">
              <div className="case-select" aria-hidden="true">
                <span />
              </div>
              <div className="case-content">
                <h3>{demo.paper.title.value}</h3>
                <p className="case-authors">{demo.paper.authors.value.join(", ")}</p>
                <p className="case-venue">{demo.paper.venue.value}</p>

                <div className="case-links">
                  <a href={demo.paper.title.sources[0].url} target="_blank" rel="noreferrer">
                    <BookOpen size={18} />
                    View published paper record
                    <ExternalLink size={15} />
                  </a>
                  <a href={demo.repository.url.value} target="_blank" rel="noreferrer">
                    <CodeXml size={18} />
                    View official repository
                    <ExternalLink size={15} />
                  </a>
                </div>

                <div className="case-boundary">
                  <ShieldCheck size={19} aria-hidden="true" />
                  <p>
                    Includes sourced metadata and a project-authored teaching
                    fixture. No paper PDF or benchmark dataset is bundled.
                  </p>
                </div>
              </div>
            </div>

            <button className="button button-primary intake-cta" type="button" onClick={startDemo}>
              Use curated demo
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </section>

          <aside className="protocol-preview" aria-labelledby="protocol-heading">
            <span className="aside-index">First slice</span>
            <h2 id="protocol-heading">One target. One evidence gate.</h2>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <strong>Bound the claim</strong>
                  <p>Separate the paper benchmark from the mini-news target.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Record the run</strong>
                  <p>Keep environment, commands, output, and result together.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Export the boundary</strong>
                  <p>Generate a Passport that preserves unresolved gaps.</p>
                </div>
              </li>
            </ol>
            <p className="aside-note">
              Custom projects and the full checkpoint sequence are intentionally
              held for review.
            </p>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
