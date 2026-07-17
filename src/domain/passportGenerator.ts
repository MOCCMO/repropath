import { z } from "zod";
import {
  evidenceFieldLabels,
  getMissingEvidenceFields,
  isValidLocalResult
} from "./checkpointRules";
import {
  deriveReproductionStatus,
  reproductionStatusLabels
} from "./reproductionStatus";
import type {
  CuratedDemo,
  Project,
  SourceReference
} from "./schemas";
import {
  evidenceProvenanceSchema,
  reproductionStatusSchema,
  sourceReferenceSchema
} from "./schemas";

export const evidenceProvenanceLabels = {
  verified_demo_run: "Verified demo run",
  learner_entered: "Learner entered",
  verified_seed_modified_by_learner: "Verified seed modified by learner"
} satisfies Record<z.infer<typeof evidenceProvenanceSchema>, string>;

export const passportSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.iso.datetime(),
  sourceProjectUpdatedAt: z.iso.datetime(),
  projectId: z.string().min(1),
  paper: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    version: z.string()
  }),
  repository: z.object({
    url: z.url(),
    commit: z.string().regex(/^[0-9a-f]{40}$/),
    license: z.string()
  }),
  target: z.object({
    kind: z.literal("method_smoke_test"),
    title: z.string(),
    dataset: z.string(),
    expectedOutput: z.string(),
    successCriteria: z.array(z.string())
  }),
  environment: z.string(),
  commands: z.object({
    training: z.string(),
    evaluation: z.string()
  }),
  evidence: z.object({
    logExcerpt: z.string(),
    localResult: z.number().finite().min(0).max(1).nullable(),
    runOutcome: z.enum(["not_recorded", "succeeded", "failed"]),
    provenance: evidenceProvenanceSchema,
    notes: z.string()
  }),
  comparison: z.object({
    paperDataset: z.string(),
    paperMetric: z.string(),
    paperResult: z.number().finite().min(0).max(1),
    localDataset: z.string(),
    localResult: z.number().finite().min(0).max(1).nullable(),
    basis: z.literal("not_comparable"),
    explanation: z.string()
  }),
  gaps: z.array(z.string()),
  missingFields: z.array(z.string()),
  status: reproductionStatusSchema,
  statusLabel: z.string(),
  sources: z.array(sourceReferenceSchema)
});

export type Passport = z.infer<typeof passportSchema>;

function collectSources(demo: CuratedDemo): SourceReference[] {
  const sourceLists: SourceReference[][] = [
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
    demo.observedRun.environment.sources,
    demo.observedRun.trainingCommand.sources,
    demo.observedRun.evaluationCommand.sources,
    demo.observedRun.logExcerpt.sources,
    demo.observedRun.localResult.sources
  ];

  const unique = new Map<string, SourceReference>();
  sourceLists.flat().forEach((source) => {
    unique.set(`${source.claimId}:${source.url}:${source.locator}`, source);
  });
  return [...unique.values()];
}

export function generatePassport(
  demo: CuratedDemo,
  project: Project,
  generatedAt = new Date().toISOString()
): Passport {
  const status = deriveReproductionStatus(project.evidence);
  const localResult = isValidLocalResult(project.evidence.localResult)
    ? project.evidence.localResult
    : null;
  return passportSchema.parse({
    schemaVersion: 1,
    generatedAt,
    sourceProjectUpdatedAt: project.updatedAt,
    projectId: project.id,
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
    target: demo.map.minimalTarget.value,
    environment: project.evidence.environment,
    commands: {
      training: project.evidence.trainingCommand,
      evaluation: project.evidence.evaluationCommand
    },
    evidence: {
      logExcerpt: project.evidence.logExcerpt,
      localResult,
      runOutcome: project.evidence.runOutcome,
      provenance: project.evidence.provenance,
      notes: project.evidence.notes
    },
    comparison: {
      paperDataset: demo.map.paperDataset.value,
      paperMetric: demo.map.paperMetric.value,
      paperResult: demo.map.paperResult.value,
      localDataset: demo.map.minimalTarget.value.dataset,
      localResult,
      basis: "not_comparable",
      explanation: demo.map.benchmarkGap.value
    },
    gaps: [demo.map.benchmarkGap.value],
    missingFields: getMissingEvidenceFields(project.evidence).map(
      (field) => evidenceFieldLabels[field]
    ),
    status,
    statusLabel: reproductionStatusLabels[status],
    sources: collectSources(demo)
  });
}

const displayPercent = (value: number | null) =>
  value === null ? "Not recorded" : `${(value * 100).toFixed(1)}%`;

const textOrMissing = (value: string) => value.trim() || "Not recorded";

const metricLabel = (value: string) => value.replace(/\s*\(%\)\s*$/, "");

const sourceLabel = (source: SourceReference) =>
  source.url.startsWith("repository-file:")
    ? `ReproPath repository file \`${source.url.slice("repository-file:".length)}\``
    : source.url;

export function passportToMarkdown(passport: Passport): string {
  const missing = passport.missingFields.length
    ? passport.missingFields.map((field) => `- ${field}`).join("\n")
    : "- None";
  const sources = passport.sources
    .map(
      (source) =>
        `- ${source.claimId}: ${sourceLabel(source)} — ${source.locator}`
    )
    .join("\n");

  return `# Reproduction Passport

Generated: ${passport.generatedAt}

## Reproduction status

**${passport.statusLabel}**

Paper benchmark comparison: **Not comparable**

## Paper and repository

- Paper: ${passport.paper.title}
- Authors: ${passport.paper.authors.join(", ")}
- Version: ${passport.paper.version}
- Venue: ${passport.paper.venue}
- Repository: ${passport.repository.url}
- Commit: ${passport.repository.commit}
- License: ${passport.repository.license}

## Minimal target

- Type: ${passport.target.kind}
- Target: ${passport.target.title}
- Dataset: ${passport.target.dataset}
- Expected output: ${passport.target.expectedOutput}

## Environment

${textOrMissing(passport.environment)}

## Commands

### Training

\`\`\`text
${textOrMissing(passport.commands.training)}
\`\`\`

### Evaluation

\`\`\`text
${textOrMissing(passport.commands.evaluation)}
\`\`\`

## Evidence

Run outcome: ${passport.evidence.runOutcome}

Evidence provenance: ${evidenceProvenanceLabels[passport.evidence.provenance]} (${passport.evidence.provenance})

\`\`\`text
${textOrMissing(passport.evidence.logExcerpt)}
\`\`\`

## Results and scope

- Paper result (${passport.comparison.paperDataset}): ${displayPercent(passport.comparison.paperResult)} (${metricLabel(passport.comparison.paperMetric)})
- Local result (${passport.comparison.localDataset}): ${displayPercent(passport.comparison.localResult)} P@1
- Comparison basis: not_comparable
- Reason: ${passport.comparison.explanation}

## Unresolved gaps

${passport.gaps.map((gap) => `- ${gap}`).join("\n")}

## Missing evidence

${missing}

## Notes

${textOrMissing(passport.evidence.notes)}

## Sources

${sources}
`;
}

export function passportToJson(passport: Passport): string {
  return `${JSON.stringify(passportSchema.parse(passport), null, 2)}\n`;
}
