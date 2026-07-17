import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import type { CheckpointId } from "../../domain/checkpointDefinitions";
import type { FullProtocolProject } from "../../domain/fullProtocolSchemas";
import { EvidenceProvenance } from "./EvidenceProvenance";
import { SourceList } from "./SourceList";

type ReadOnlyCheckpointEvidenceProps = {
  checkpointId: Exclude<
    CheckpointId,
    "run-minimal-target" | "record-gaps"
  >;
  project: FullProtocolProject;
};

type EvidenceDisplay = {
  fields: Array<{ label: string; value: ReactNode }>;
  criteria: string[];
  provenance: FullProtocolProject["checkpoints"][CheckpointId]["evidence"]["provenance"];
  sources: FullProtocolProject["checkpoints"][CheckpointId]["sources"];
};

const percent = (value: number | null) =>
  value === null ? "Not recorded" : `${(value * 100).toFixed(1)}%`;

function evidenceDisplay(
  checkpointId: ReadOnlyCheckpointEvidenceProps["checkpointId"],
  project: FullProtocolProject
): EvidenceDisplay {
  switch (checkpointId) {
    case "understand-task": {
      const checkpoint = project.checkpoints[checkpointId];
      return {
        fields: [
          { label: "Paper task", value: checkpoint.evidence.paperTask },
          {
            label: "Minimal reproduction target",
            value: checkpoint.evidence.reproductionTarget
          },
          { label: "Expected output", value: checkpoint.evidence.expectedOutput },
          { label: "Scope boundary", value: checkpoint.evidence.scopeBoundary }
        ],
        criteria: [
          "Paper task is explicit.",
          "Minimal target and expected output are bounded.",
          "Paper-benchmark boundary remains visible."
        ],
        provenance: checkpoint.evidence.provenance,
        sources: checkpoint.sources
      };
    }
    case "connect-repository": {
      const checkpoint = project.checkpoints[checkpointId];
      return {
        fields: [
          {
            label: "Official repository",
            value: (
              <a href={checkpoint.evidence.repositoryUrl} target="_blank" rel="noreferrer">
                {checkpoint.evidence.repositoryUrl}
              </a>
            )
          },
          {
            label: "Pinned commit",
            value: <code>{checkpoint.evidence.repositoryCommit}</code>
          },
          {
            label: "Relevant components",
            value: (
              <ul className="component-list">
                {checkpoint.evidence.components.map((component) => (
                  <li key={component.path}>
                    <code>{component.path}</code>
                    <span>{component.role}</span>
                  </li>
                ))}
              </ul>
            )
          }
        ],
        criteria: [
          "Official repository URL is recorded.",
          "A 40-character commit is pinned.",
          "Every relevant component has a path and role."
        ],
        provenance: checkpoint.evidence.provenance,
        sources: checkpoint.sources
      };
    }
    case "confirm-data-and-metric": {
      const checkpoint = project.checkpoints[checkpointId];
      return {
        fields: [
          { label: "Paper dataset", value: checkpoint.evidence.paperDataset },
          { label: "Local dataset", value: checkpoint.evidence.localDataset },
          { label: "Paper metric", value: checkpoint.evidence.paperMetric },
          { label: "Local metric", value: checkpoint.evidence.localMetric },
          {
            label: "Dataset scope",
            value: checkpoint.evidence.datasetScopeConfirmed
              ? "Confirmed"
              : "Not confirmed"
          },
          {
            label: "Comparison basis",
            value: checkpoint.evidence.comparisonBasis ?? "Not recorded"
          },
          {
            label: "Scope explanation",
            value: checkpoint.evidence.scopeExplanation
          }
        ],
        criteria: [
          "Paper and local datasets are named separately.",
          "Paper and local metrics are both recorded.",
          "Dataset scope and comparison basis are explicit."
        ],
        provenance: checkpoint.evidence.provenance,
        sources: checkpoint.sources
      };
    }
    case "prepare-environment": {
      const checkpoint = project.checkpoints[checkpointId];
      return {
        fields: [
          {
            label: "Environment summary",
            value: checkpoint.evidence.environmentSummary
          },
          {
            label: "Repository commit",
            value: <code>{checkpoint.evidence.repositoryCommit}</code>
          },
          {
            label: "Setup command",
            value: <pre>{checkpoint.evidence.setupCommand}</pre>
          },
          {
            label: "Diagnostic output",
            value: <pre>{checkpoint.evidence.diagnosticOutput}</pre>
          },
          { label: "Readiness", value: checkpoint.evidence.readiness }
        ],
        criteria: [
          "Environment and pinned commit are recorded.",
          "The observed checkout/build command is present.",
          "Build diagnostics—not evaluation P@1 output—establish readiness."
        ],
        provenance: checkpoint.evidence.provenance,
        sources: checkpoint.sources
      };
    }
    case "compare-results": {
      const checkpoint = project.checkpoints[checkpointId];
      return {
        fields: [
          { label: "Paper result", value: percent(checkpoint.evidence.paperResult) },
          { label: "Local result", value: percent(checkpoint.evidence.localResult) },
          { label: "Paper dataset", value: checkpoint.evidence.paperDataset },
          { label: "Local dataset", value: checkpoint.evidence.localDataset },
          { label: "Paper metric", value: checkpoint.evidence.paperMetric },
          { label: "Local metric", value: checkpoint.evidence.localMetric },
          {
            label: "Comparison basis",
            value: checkpoint.evidence.comparisonBasis ?? "Not recorded"
          },
          { label: "Explanation", value: checkpoint.evidence.explanation }
        ],
        criteria: [
          "Paper and local results are derived from their source checkpoints.",
          "Dataset and metric scopes remain distinct.",
          "The comparison basis and explanation are explicit."
        ],
        provenance: checkpoint.evidence.provenance,
        sources: checkpoint.sources
      };
    }
  }
}

export function ReadOnlyCheckpointEvidence({
  checkpointId,
  project
}: ReadOnlyCheckpointEvidenceProps) {
  const display = evidenceDisplay(checkpointId, project);
  return (
    <div className="read-only-evidence">
      <EvidenceProvenance provenance={display.provenance} />
      <dl className="checkpoint-evidence-list">
        {display.fields.map((field) => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
      <section className="verification-criteria" aria-labelledby="criteria-heading">
        <h3 id="criteria-heading">Verification criteria</h3>
        <ul>
          {display.criteria.map((criterion) => (
            <li key={criterion}>
              <CheckCircle2 size={16} aria-hidden="true" /> {criterion}
            </li>
          ))}
        </ul>
      </section>
      <section className="checkpoint-sources" aria-labelledby="sources-heading">
        <h3 id="sources-heading">Sources and locators</h3>
        <SourceList sources={display.sources} />
      </section>
    </div>
  );
}
