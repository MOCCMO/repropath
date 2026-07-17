import { z } from "zod";

export const provenanceSchema = z.enum([
  "paper",
  "repository",
  "verified_demo_run"
]);

export const sourceVerificationSchema = z.enum([
  "source_checked",
  "run_observed"
]);

export const evidenceProvenanceSchema = z.enum([
  "verified_demo_run",
  "learner_entered",
  "verified_seed_modified_by_learner"
]);

export const sourceReferenceSchema = z.object({
  url: z.string().min(1),
  locator: z.string().min(1),
  claimId: z.string().min(1)
});

export const sourcedValueSchema = <T extends z.ZodType>(valueSchema: T) =>
  z.object({
    value: valueSchema,
    provenance: provenanceSchema,
    verification: sourceVerificationSchema,
    sources: z.array(sourceReferenceSchema).min(1)
  });

const repositoryComponentSchema = z.object({
  path: z.string().min(1),
  role: z.string().min(1)
});

const minimalTargetValueSchema = z.object({
  kind: z.literal("method_smoke_test"),
  title: z.string().min(1),
  dataset: z.string().min(1),
  expectedOutput: z.string().min(1),
  successCriteria: z.array(z.string().min(1)).min(1)
});

export const curatedDemoSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  mode: z.literal("curated"),
  paper: z.object({
    title: sourcedValueSchema(z.string().min(1)),
    authors: sourcedValueSchema(z.array(z.string().min(1)).min(1)),
    venue: sourcedValueSchema(z.string().min(1)),
    version: sourcedValueSchema(z.string().min(1))
  }),
  repository: z.object({
    url: sourcedValueSchema(z.url()),
    commit: sourcedValueSchema(z.string().regex(/^[0-9a-f]{40}$/)),
    license: sourcedValueSchema(z.string().min(1))
  }),
  map: z.object({
    paperTask: sourcedValueSchema(z.string().min(1)),
    paperDataset: sourcedValueSchema(z.string().min(1)),
    paperMetric: sourcedValueSchema(z.string().min(1)),
    paperResult: sourcedValueSchema(z.number().min(0).max(1)),
    repositoryComponents: sourcedValueSchema(
      z.array(repositoryComponentSchema).min(1)
    ),
    minimalTarget: sourcedValueSchema(minimalTargetValueSchema),
    benchmarkGap: sourcedValueSchema(z.string().min(1)),
    benchmarkGapImpact: sourcedValueSchema(z.string().min(1))
  }),
  observedSetup: z.object({
    setupCommand: sourcedValueSchema(z.string().min(1)),
    diagnosticOutput: sourcedValueSchema(z.string().min(1))
  }),
  observedRun: z.object({
    environment: sourcedValueSchema(z.string().min(1)),
    trainingCommand: sourcedValueSchema(z.string().min(1)),
    evaluationCommand: sourcedValueSchema(z.string().min(1)),
    logExcerpt: sourcedValueSchema(z.string().min(1)),
    localMetric: sourcedValueSchema(z.string().min(1)),
    localResult: sourcedValueSchema(z.number().min(0).max(1))
  })
});

export const runEvidenceSchema = z.object({
  environment: z.string().max(1000),
  trainingCommand: z.string().max(4000),
  evaluationCommand: z.string().max(4000),
  logExcerpt: z.string().max(10000),
  localResult: z.number().finite().min(0).max(1).nullable(),
  notes: z.string().max(2000),
  resultDatasetScopeConfirmed: z.boolean(),
  runOutcome: z.enum(["not_recorded", "succeeded", "failed"]),
  provenance: evidenceProvenanceSchema
});

export const projectSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.literal("fasttext-bag-of-tricks"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  evidence: runEvidenceSchema
});

export type CuratedDemo = z.infer<typeof curatedDemoSchema>;
export type RunEvidence = z.infer<typeof runEvidenceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type SourceReference = z.infer<typeof sourceReferenceSchema>;
export type EvidenceProvenance = z.infer<typeof evidenceProvenanceSchema>;

export const checkpointStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "verified",
  "blocked"
]);

export type CheckpointStatus = z.infer<typeof checkpointStatusSchema>;

export const reproductionStatusSchema = z.enum([
  "insufficient_evidence",
  "in_progress",
  "minimal_target_reproduced",
  "not_reproduced"
]);

export type ReproductionStatus = z.infer<typeof reproductionStatusSchema>;
