import { z } from "zod";
import {
  checkpointDefinitions,
  checkpointIdSchema,
  evidenceModeSchema,
  type CheckpointId
} from "./checkpointDefinitions";
import { isValidLocalResult } from "./checkpointRules";
import {
  compareResultsEvidenceSchema,
  confirmDataAndMetricEvidenceSchema,
  connectRepositoryEvidenceSchema,
  prepareEnvironmentEvidenceSchema,
  recordGapsEvidenceSchema,
  reproductionGapSchema,
  understandTaskEvidenceSchema,
  type FullProtocolProject
} from "./fullProtocolSchemas";
import {
  deriveCheckpointStatuses,
  deriveProjectReproductionStatus,
  getCheckpointMissingRequirements
} from "./fullProtocolRules";
import {
  checkpointStatusSchema,
  evidenceProvenanceSchema,
  reproductionStatusSchema,
  runEvidenceSchema,
  sourceReferenceSchema,
  type CuratedDemo,
  type EvidenceProvenance,
  type SourceReference
} from "./schemas";
import { reproductionStatusLabels } from "./reproductionStatus";

export const evidenceProvenanceLabels = {
  verified_demo_run: "Verified demo run",
  learner_entered: "Learner entered",
  verified_seed_modified_by_learner: "Verified seed modified by learner"
} satisfies Record<EvidenceProvenance, string>;

export const checkpointStatusLabels = {
  not_started: "Not started",
  in_progress: "In progress",
  verified: "Verified",
  blocked: "Blocked"
} as const;

const checkpointRecordBase = {
  order: z.number().int().min(1).max(7),
  title: z.string().min(1),
  derivedStatus: checkpointStatusSchema,
  evidenceMode: evidenceModeSchema,
  evidenceProvenance: evidenceProvenanceSchema,
  sourceReferences: z.array(sourceReferenceSchema),
  missingRequirements: z.array(z.string().min(1))
};

export const passportCheckpointRecordSchema = z.discriminatedUnion(
  "checkpointId",
  [
    z.object({
      checkpointId: z.literal("understand-task"),
      ...checkpointRecordBase,
      evidence: understandTaskEvidenceSchema
    }),
    z.object({
      checkpointId: z.literal("connect-repository"),
      ...checkpointRecordBase,
      evidence: connectRepositoryEvidenceSchema
    }),
    z.object({
      checkpointId: z.literal("confirm-data-and-metric"),
      ...checkpointRecordBase,
      evidence: confirmDataAndMetricEvidenceSchema
    }),
    z.object({
      checkpointId: z.literal("prepare-environment"),
      ...checkpointRecordBase,
      evidence: prepareEnvironmentEvidenceSchema
    }),
    z.object({
      checkpointId: z.literal("run-minimal-target"),
      ...checkpointRecordBase,
      evidence: runEvidenceSchema
    }),
    z.object({
      checkpointId: z.literal("compare-results"),
      ...checkpointRecordBase,
      evidence: compareResultsEvidenceSchema
    }),
    z.object({
      checkpointId: z.literal("record-gaps"),
      ...checkpointRecordBase,
      evidence: recordGapsEvidenceSchema
    })
  ]
);

export const passportMissingEvidenceGroupSchema = z.object({
  checkpointId: checkpointIdSchema,
  order: z.number().int().min(1).max(7),
  title: z.string().min(1),
  status: checkpointStatusSchema,
  requirements: z.array(z.string().min(1)).min(1)
});

export const passportV2Schema = z.object({
  schemaVersion: z.literal(2),
  generatedAt: z.iso.datetime(),
  sourceProjectUpdatedAt: z.iso.datetime(),
  project: z.object({
    id: z.string().min(1),
    schemaVersion: z.literal(2)
  }),
  paper: z.object({
    title: z.string().min(1),
    authors: z.array(z.string().min(1)).min(1),
    venue: z.string().min(1),
    version: z.string().min(1)
  }),
  repository: z.object({
    url: z.url(),
    commit: z.string().regex(/^[0-9a-f]{40}$/),
    license: z.string().min(1)
  }),
  minimalTarget: z.object({
    kind: z.literal("method_smoke_test"),
    title: z.string().min(1),
    dataset: z.string().min(1),
    expectedOutput: z.string().min(1),
    successCriteria: z.array(z.string().min(1)).min(1)
  }),
  overallStatus: reproductionStatusSchema,
  overallStatusLabel: z.string().min(1),
  checkpoints: z.array(passportCheckpointRecordSchema).length(7),
  comparison: z.object({
    paperDataset: z.string(),
    localDataset: z.string(),
    paperMetric: z.string(),
    localMetric: z.string(),
    paperResult: z.number().finite().min(0).max(1).nullable(),
    localResult: z.number().finite().min(0).max(1).nullable(),
    comparisonBasis: z.enum(["comparable", "not_comparable"]).nullable(),
    explanation: z.string()
  }),
  gaps: z.array(reproductionGapSchema),
  learnerNotes: z.string(),
  missingEvidenceByCheckpoint: z.array(passportMissingEvidenceGroupSchema),
  claimBoundary: z.object({
    minimalMethodTarget: z.enum(["reproduced", "not_reproduced"]),
    paperBenchmark: z.enum(["reproduced", "not_attempted", "unsupported"]),
    explanation: z.string().min(1)
  }),
  sourceReferences: z.array(sourceReferenceSchema)
});

export type PassportCheckpointRecord = z.infer<
  typeof passportCheckpointRecordSchema
>;
export type PassportV2 = z.infer<typeof passportV2Schema>;

function uniqueSources(sourceLists: SourceReference[][]): SourceReference[] {
  const sources = new Map<string, SourceReference>();
  sourceLists.flat().forEach((source) => {
    sources.set(`${source.claimId}:${source.url}:${source.locator}`, source);
  });
  return [...sources.values()];
}

function collectDemoSources(demo: CuratedDemo): SourceReference[] {
  return uniqueSources([
    demo.paper.title.sources,
    demo.paper.authors.sources,
    demo.paper.venue.sources,
    demo.paper.version.sources,
    demo.repository.url.sources,
    demo.repository.commit.sources,
    demo.repository.license.sources,
    demo.map.paperTask.sources,
    demo.map.paperDataset.sources,
    demo.map.paperMetric.sources,
    demo.map.paperResult.sources,
    demo.map.repositoryComponents.sources,
    demo.map.minimalTarget.sources,
    demo.map.benchmarkGap.sources,
    demo.map.benchmarkGapImpact.sources,
    demo.observedSetup.setupCommand.sources,
    demo.observedSetup.diagnosticOutput.sources,
    demo.observedRun.environment.sources,
    demo.observedRun.trainingCommand.sources,
    demo.observedRun.evaluationCommand.sources,
    demo.observedRun.logExcerpt.sources,
    demo.observedRun.localMetric.sources,
    demo.observedRun.localResult.sources
  ]);
}

function normalizedEvidence(
  checkpointId: CheckpointId,
  project: FullProtocolProject
) {
  const evidence = project.checkpoints[checkpointId].evidence;
  if (checkpointId === "run-minimal-target") {
    return {
      ...project.checkpoints[checkpointId].evidence,
      localResult: isValidLocalResult(
        project.checkpoints[checkpointId].evidence.localResult
      )
        ? project.checkpoints[checkpointId].evidence.localResult
        : null
    };
  }
  if (checkpointId === "compare-results") {
    return {
      ...project.checkpoints[checkpointId].evidence,
      paperResult: isValidLocalResult(
        project.checkpoints[checkpointId].evidence.paperResult
      )
        ? project.checkpoints[checkpointId].evidence.paperResult
        : null,
      localResult: isValidLocalResult(
        project.checkpoints[checkpointId].evidence.localResult
      )
        ? project.checkpoints[checkpointId].evidence.localResult
        : null
    };
  }
  return evidence;
}

export function generatePassport(
  demo: CuratedDemo,
  project: FullProtocolProject,
  generatedAt = new Date().toISOString()
): PassportV2 {
  const statuses = deriveCheckpointStatuses(project);
  const overallStatus = deriveProjectReproductionStatus(project, statuses);
  const checkpoints = checkpointDefinitions.map((definition) => {
    const checkpoint = project.checkpoints[definition.id];
    return {
      checkpointId: definition.id,
      order: definition.order,
      title: definition.title,
      derivedStatus: statuses[definition.id],
      evidenceMode: definition.evidenceMode,
      evidenceProvenance: checkpoint.evidence.provenance,
      evidence: normalizedEvidence(definition.id, project),
      sourceReferences: checkpoint.sources,
      missingRequirements: getCheckpointMissingRequirements(
        definition.id,
        project,
        statuses
      )
    };
  });
  const comparisonEvidence = project.checkpoints["compare-results"].evidence;
  const runStatus = statuses["run-minimal-target"];
  const paperBenchmark =
    comparisonEvidence.comparisonBasis === "not_comparable"
      ? "not_attempted"
      : "unsupported";
  const gaps = project.checkpoints["record-gaps"].evidence.gaps;
  const missingEvidenceByCheckpoint = checkpoints
    .filter(
      (checkpoint) =>
        checkpoint.derivedStatus !== "verified" ||
        checkpoint.missingRequirements.length > 0
    )
    .map((checkpoint) => ({
      checkpointId: checkpoint.checkpointId,
      order: checkpoint.order,
      title: checkpoint.title,
      status: checkpoint.derivedStatus,
      requirements:
        checkpoint.missingRequirements.length > 0
          ? checkpoint.missingRequirements
          : ["Checkpoint must be verified"]
    }));
  const projectSources = Object.values(project.checkpoints).flatMap(
    (checkpoint) => checkpoint.sources
  );
  const gapSources = gaps.flatMap((gap) => gap.sources);

  return passportV2Schema.parse({
    schemaVersion: 2,
    generatedAt,
    sourceProjectUpdatedAt: project.updatedAt,
    project: {
      id: project.id,
      schemaVersion: project.schemaVersion
    },
    paper: {
      title: demo.paper.title.value,
      authors: demo.paper.authors.value,
      venue: demo.paper.venue.value,
      version: demo.paper.version.value
    },
    repository: {
      url: demo.repository.url.value,
      commit: demo.repository.commit.value,
      license: demo.repository.license.value
    },
    minimalTarget: demo.map.minimalTarget.value,
    overallStatus,
    overallStatusLabel: reproductionStatusLabels[overallStatus],
    checkpoints,
    comparison: {
      paperDataset: comparisonEvidence.paperDataset,
      localDataset: comparisonEvidence.localDataset,
      paperMetric: comparisonEvidence.paperMetric,
      localMetric: comparisonEvidence.localMetric,
      paperResult: isValidLocalResult(comparisonEvidence.paperResult)
        ? comparisonEvidence.paperResult
        : null,
      localResult: isValidLocalResult(comparisonEvidence.localResult)
        ? comparisonEvidence.localResult
        : null,
      comparisonBasis: comparisonEvidence.comparisonBasis,
      explanation: comparisonEvidence.explanation
    },
    gaps,
    learnerNotes: project.checkpoints["record-gaps"].evidence.learnerNotes,
    missingEvidenceByCheckpoint,
    claimBoundary: {
      minimalMethodTarget:
        runStatus === "verified" ? "reproduced" : "not_reproduced",
      paperBenchmark,
      explanation:
        paperBenchmark === "not_attempted"
          ? demo.map.benchmarkGapImpact.value
          : "The available evidence does not support a paper-benchmark reproduction claim."
    },
    sourceReferences: uniqueSources([
      collectDemoSources(demo),
      projectSources,
      gapSources
    ])
  });
}

const textOrMissing = (value: string) => value.trim() || "Not recorded";

const readableToken = (value: string) => value.replaceAll("_", " ");

const markdownCell = (value: string) =>
  value.replaceAll("|", "\\|").replaceAll("\n", " ");

export function formatMetricResult(
  value: number | null,
  metric: string
): string {
  if (value === null) return "Not recorded";
  if (metric.includes("%")) return `${(value * 100).toFixed(1)}%`;
  return Number(value.toFixed(6)).toString();
}

export function sourceLabel(source: SourceReference): string {
  return source.url.startsWith("repository-file:")
    ? `ReproPath repository file \`${source.url.slice("repository-file:".length)}\``
    : source.url;
}

function sourcesToMarkdown(sources: SourceReference[]): string {
  if (sources.length === 0) return "- None recorded";
  return sources
    .map(
      (source) =>
        `- ${source.claimId}: ${sourceLabel(source)} — ${source.locator}`
    )
    .join("\n");
}

export function passportToMarkdown(passport: PassportV2): string {
  const parsed = passportV2Schema.parse(passport);
  const environment = parsed.checkpoints.find(
    (checkpoint) => checkpoint.checkpointId === "prepare-environment"
  )!;
  const run = parsed.checkpoints.find(
    (checkpoint) => checkpoint.checkpointId === "run-minimal-target"
  )!;
  const checkpointRows = parsed.checkpoints
    .map(
      (checkpoint) =>
        `| ${checkpoint.order} | ${markdownCell(checkpoint.title)} | ${checkpointStatusLabels[checkpoint.derivedStatus]} | ${readableToken(checkpoint.evidenceMode)} | ${evidenceProvenanceLabels[checkpoint.evidenceProvenance]} | ${checkpoint.missingRequirements.length ? markdownCell(checkpoint.missingRequirements.join("; ")) : "None"} |`
    )
    .join("\n");
  const gaps = parsed.gaps.length
    ? parsed.gaps
        .map(
          (gap) => `### ${gap.description}\n\n- Impact on claim: ${gap.impactOnClaim}\n- Status: ${gap.status}\n- Provenance: ${evidenceProvenanceLabels[gap.provenance]}\n- Sources:\n${sourcesToMarkdown(gap.sources)}`
        )
        .join("\n\n")
    : "No gaps recorded.";
  const missing = parsed.missingEvidenceByCheckpoint.length
    ? parsed.missingEvidenceByCheckpoint
        .map(
          (group) =>
            `### Checkpoint ${group.order}: ${group.title} (${checkpointStatusLabels[group.status]})\n\n${group.requirements.map((requirement) => `- ${requirement}`).join("\n")}`
        )
        .join("\n\n")
    : "All checkpoint requirements are present.";

  return `# Reproduction Passport v2

Generated: ${parsed.generatedAt}
Source project updated: ${parsed.sourceProjectUpdatedAt}

## Executive status summary

- Overall reproduction status: **${parsed.overallStatusLabel}** (${parsed.overallStatus})
- Minimal method target: **${readableToken(parsed.claimBoundary.minimalMethodTarget)}**
- Paper benchmark: **${readableToken(parsed.claimBoundary.paperBenchmark)}**
- Claim boundary: ${parsed.claimBoundary.explanation}

## Paper and repository

- Project: ${parsed.project.id} (project schema v${parsed.project.schemaVersion})
- Paper: ${parsed.paper.title}
- Authors: ${parsed.paper.authors.join(", ")}
- Version: ${parsed.paper.version}
- Venue: ${parsed.paper.venue}
- Repository: ${parsed.repository.url}
- Commit: ${parsed.repository.commit}
- License: ${parsed.repository.license}

## Minimal reproduction target

- Type: ${parsed.minimalTarget.kind}
- Target: ${parsed.minimalTarget.title}
- Dataset: ${parsed.minimalTarget.dataset}
- Expected output: ${parsed.minimalTarget.expectedOutput}
- Success criteria:
${parsed.minimalTarget.successCriteria.map((criterion) => `  - ${criterion}`).join("\n")}

## Seven-checkpoint record

| # | Checkpoint | Status | Evidence mode | Provenance | Missing requirements |
|---:|---|---|---|---|---|
${checkpointRows}

## Environment setup

- Environment: ${textOrMissing(environment.evidence.environmentSummary)}
- Repository commit: ${textOrMissing(environment.evidence.repositoryCommit)}
- Readiness: ${environment.evidence.readiness}

### Setup command

\`\`\`text
${textOrMissing(environment.evidence.setupCommand)}
\`\`\`

### Diagnostic output

\`\`\`text
${textOrMissing(environment.evidence.diagnosticOutput)}
\`\`\`

## Minimal-target execution

- Run outcome: ${run.evidence.runOutcome}
- Evidence provenance: ${evidenceProvenanceLabels[run.evidence.provenance]}
- Local result: ${formatMetricResult(run.evidence.localResult, parsed.comparison.localMetric)} (${parsed.comparison.localMetric || "metric not recorded"})
- Dataset scope confirmed: ${run.evidence.resultDatasetScopeConfirmed ? "Yes" : "No"}

### Training command

\`\`\`text
${textOrMissing(run.evidence.trainingCommand)}
\`\`\`

### Evaluation command

\`\`\`text
${textOrMissing(run.evidence.evaluationCommand)}
\`\`\`

### Evaluation log

\`\`\`text
${textOrMissing(run.evidence.logExcerpt)}
\`\`\`

## Structured comparison basis

| Result | Dataset | Metric | Value |
|---|---|---|---:|
| Paper | ${markdownCell(parsed.comparison.paperDataset)} | ${markdownCell(parsed.comparison.paperMetric)} | ${formatMetricResult(parsed.comparison.paperResult, parsed.comparison.paperMetric)} |
| Local | ${markdownCell(parsed.comparison.localDataset)} | ${markdownCell(parsed.comparison.localMetric)} | ${formatMetricResult(parsed.comparison.localResult, parsed.comparison.localMetric)} |

- Comparison basis: ${parsed.comparison.comparisonBasis ?? "Not recorded"}
- Explanation: ${textOrMissing(parsed.comparison.explanation)}

## Reproduction gaps

${gaps}

## Learner notes

${textOrMissing(parsed.learnerNotes)}

## Missing evidence by checkpoint

${missing}

## Source references

${sourcesToMarkdown(parsed.sourceReferences)}
`;
}

export function passportToJson(passport: PassportV2): string {
  return `${JSON.stringify(passportV2Schema.parse(passport), null, 2)}\n`;
}

export const passportSchema = passportV2Schema;
export type Passport = PassportV2;
