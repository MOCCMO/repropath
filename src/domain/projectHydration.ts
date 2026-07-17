import type { CuratedDemo, EvidenceProvenance, RunEvidence, SourceReference } from "./schemas";
import { projectSchema } from "./schemas";
import {
  fullProtocolProjectSchema,
  type CompareResultsEvidence,
  type FullProtocolProject
} from "./fullProtocolSchemas";

export const FULL_PROTOCOL_SCHEMA_VERSION = 2 as const;
export const CURATED_BENCHMARK_GAP_ID = "ag-news-benchmark-gap";

function uniqueSources(...sourceLists: SourceReference[][]): SourceReference[] {
  const sources = new Map<string, SourceReference>();
  sourceLists.flat().forEach((source) => {
    sources.set(
      `${source.claimId}:${source.url}:${source.locator}`,
      source
    );
  });
  return [...sources.values()];
}

function derivedComparisonProvenance(
  runProvenance: EvidenceProvenance
): EvidenceProvenance {
  return runProvenance === "verified_demo_run"
    ? "verified_demo_run"
    : "verified_seed_modified_by_learner";
}

export function deriveComparisonEvidence(
  demo: CuratedDemo,
  runEvidence: RunEvidence
): CompareResultsEvidence {
  return {
    paperDataset: demo.map.paperDataset.value,
    localDataset: demo.map.minimalTarget.value.dataset,
    paperMetric: demo.map.paperMetric.value,
    localMetric: "P@1",
    paperResult: demo.map.paperResult.value,
    localResult: runEvidence.localResult,
    comparisonBasis: "not_comparable",
    explanation: demo.map.benchmarkGap.value,
    provenance: derivedComparisonProvenance(runEvidence.provenance)
  };
}

function migrateV1Project(
  input: unknown,
  demo: CuratedDemo
): FullProtocolProject {
  const project = projectSchema.parse(input);
  const benchmarkGapSources = uniqueSources(
    demo.map.benchmarkGap.sources
  );
  const runSources = uniqueSources(
    demo.observedRun.environment.sources,
    demo.observedRun.trainingCommand.sources,
    demo.observedRun.evaluationCommand.sources,
    demo.observedRun.logExcerpt.sources,
    demo.observedRun.localResult.sources
  );

  return fullProtocolProjectSchema.parse({
    schemaVersion: FULL_PROTOCOL_SCHEMA_VERSION,
    id: project.id,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    checkpoints: {
      "understand-task": {
        evidence: {
          paperTask: demo.map.paperTask.value,
          reproductionTarget: demo.map.minimalTarget.value.title,
          expectedOutput: demo.map.minimalTarget.value.expectedOutput,
          scopeBoundary: demo.map.benchmarkGap.value,
          provenance: "verified_demo_run"
        },
        sources: uniqueSources(
          demo.map.paperTask.sources,
          demo.map.minimalTarget.sources,
          demo.map.benchmarkGap.sources
        )
      },
      "connect-repository": {
        evidence: {
          repositoryUrl: demo.repository.url.value,
          repositoryCommit: demo.repository.commit.value,
          components: demo.map.repositoryComponents.value,
          provenance: "verified_demo_run"
        },
        sources: uniqueSources(
          demo.repository.url.sources,
          demo.repository.commit.sources,
          demo.map.repositoryComponents.sources
        )
      },
      "confirm-data-and-metric": {
        evidence: {
          paperDataset: demo.map.paperDataset.value,
          localDataset: demo.map.minimalTarget.value.dataset,
          paperMetric: demo.map.paperMetric.value,
          datasetScopeConfirmed: true,
          comparisonBasis: "not_comparable",
          scopeExplanation: demo.map.benchmarkGap.value,
          provenance: "verified_demo_run"
        },
        sources: uniqueSources(
          demo.map.paperDataset.sources,
          demo.map.paperMetric.sources,
          demo.map.minimalTarget.sources,
          demo.map.benchmarkGap.sources
        )
      },
      "prepare-environment": {
        evidence: {
          environmentSummary: demo.observedRun.environment.value,
          repositoryCommit: demo.repository.commit.value,
          readinessEvidence: demo.observedRun.logExcerpt.value,
          readiness: "ready",
          provenance: "verified_demo_run"
        },
        sources: uniqueSources(
          demo.observedRun.environment.sources,
          demo.repository.commit.sources,
          demo.observedRun.logExcerpt.sources
        )
      },
      "run-minimal-target": {
        evidence: project.evidence,
        sources: runSources
      },
      "compare-results": {
        evidence: deriveComparisonEvidence(demo, project.evidence),
        sources: uniqueSources(
          demo.map.paperDataset.sources,
          demo.map.paperMetric.sources,
          demo.map.paperResult.sources,
          demo.map.minimalTarget.sources,
          demo.map.benchmarkGap.sources,
          demo.observedRun.localResult.sources
        )
      },
      "record-gaps": {
        evidence: {
          gaps: [
            {
              id: CURATED_BENCHMARK_GAP_ID,
              description: demo.map.benchmarkGap.value,
              status: "unresolved",
              provenance: "verified_demo_run",
              sources: benchmarkGapSources
            }
          ],
          learnerNotes: "",
          provenance: "verified_demo_run"
        },
        sources: benchmarkGapSources
      }
    }
  });
}

export function hydrateProjectV1ToV2(
  input: unknown,
  demo: CuratedDemo
): FullProtocolProject {
  const alreadyHydrated = fullProtocolProjectSchema.safeParse(input);
  if (alreadyHydrated.success) return alreadyHydrated.data;
  return migrateV1Project(input, demo);
}
