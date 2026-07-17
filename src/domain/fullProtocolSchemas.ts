import { z } from "zod";
import { checkpointIdSchema } from "./checkpointDefinitions";
import {
  evidenceProvenanceSchema,
  reproductionStatusSchema,
  runEvidenceSchema,
  sourceReferenceSchema
} from "./schemas";

const draftTextSchema = (maximum: number) => z.string().max(maximum);
const draftUrlSchema = z.union([z.literal(""), z.url()]);
const draftCommitSchema = z.union([
  z.literal(""),
  z.string().regex(/^[0-9a-f]{40}$/)
]);

const repositoryComponentSchema = z.object({
  path: draftTextSchema(500),
  role: draftTextSchema(2000)
});

export const understandTaskEvidenceSchema = z.object({
  paperTask: draftTextSchema(4000),
  reproductionTarget: draftTextSchema(2000),
  expectedOutput: draftTextSchema(2000),
  scopeBoundary: draftTextSchema(4000),
  provenance: evidenceProvenanceSchema
});

export const connectRepositoryEvidenceSchema = z.object({
  repositoryUrl: draftUrlSchema,
  repositoryCommit: draftCommitSchema,
  components: z.array(repositoryComponentSchema),
  provenance: evidenceProvenanceSchema
});

export const comparisonBasisSchema = z.enum([
  "comparable",
  "not_comparable"
]);

export const confirmDataAndMetricEvidenceSchema = z.object({
  paperDataset: draftTextSchema(2000),
  localDataset: draftTextSchema(2000),
  paperMetric: draftTextSchema(1000),
  localMetric: draftTextSchema(1000),
  datasetScopeConfirmed: z.boolean(),
  comparisonBasis: comparisonBasisSchema.nullable(),
  scopeExplanation: draftTextSchema(4000),
  provenance: evidenceProvenanceSchema
});

export const environmentReadinessSchema = z.enum([
  "not_recorded",
  "ready",
  "blocked"
]);

export const prepareEnvironmentEvidenceSchema = z.object({
  environmentSummary: draftTextSchema(2000),
  repositoryCommit: draftCommitSchema,
  setupCommand: draftTextSchema(4000),
  diagnosticOutput: draftTextSchema(10000),
  readiness: environmentReadinessSchema,
  provenance: evidenceProvenanceSchema
});

export const compareResultsEvidenceSchema = z.object({
  paperDataset: draftTextSchema(2000),
  localDataset: draftTextSchema(2000),
  paperMetric: draftTextSchema(1000),
  localMetric: draftTextSchema(1000),
  paperResult: z.number().finite().min(0).max(1).nullable(),
  localResult: z.number().finite().min(0).max(1).nullable(),
  comparisonBasis: comparisonBasisSchema.nullable(),
  explanation: draftTextSchema(4000),
  provenance: evidenceProvenanceSchema
});

export const gapStatusSchema = z.enum(["unresolved", "resolved"]);

export const reproductionGapSchema = z.object({
  id: z.string().min(1).max(200),
  description: draftTextSchema(4000),
  impactOnClaim: draftTextSchema(4000),
  status: gapStatusSchema,
  provenance: evidenceProvenanceSchema,
  sources: z.array(sourceReferenceSchema)
});

export const recordGapsEvidenceSchema = z.object({
  gaps: z.array(reproductionGapSchema),
  learnerNotes: draftTextSchema(4000),
  provenance: evidenceProvenanceSchema
});

const checkpointRecordSchema = <T extends z.ZodType>(evidenceSchema: T) =>
  z.object({
    evidence: evidenceSchema,
    sources: z.array(sourceReferenceSchema)
  });

export const fullProtocolProjectSchema = z.object({
  schemaVersion: z.literal(2),
  id: z.literal("fasttext-bag-of-tricks"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  checkpoints: z.object({
    "understand-task": checkpointRecordSchema(
      understandTaskEvidenceSchema
    ),
    "connect-repository": checkpointRecordSchema(
      connectRepositoryEvidenceSchema
    ),
    "confirm-data-and-metric": checkpointRecordSchema(
      confirmDataAndMetricEvidenceSchema
    ),
    "prepare-environment": checkpointRecordSchema(
      prepareEnvironmentEvidenceSchema
    ),
    "run-minimal-target": checkpointRecordSchema(runEvidenceSchema),
    "compare-results": checkpointRecordSchema(compareResultsEvidenceSchema),
    "record-gaps": checkpointRecordSchema(recordGapsEvidenceSchema)
  })
});

export const checkpointStatusMapSchema = z.record(
  checkpointIdSchema,
  z.enum(["not_started", "in_progress", "verified", "blocked"])
);

export const fullProtocolSummarySchema = z.object({
  checkpointStatuses: checkpointStatusMapSchema,
  reproductionStatus: reproductionStatusSchema,
  firstIncompleteCheckpointId: checkpointIdSchema.nullable()
});

export type UnderstandTaskEvidence = z.infer<
  typeof understandTaskEvidenceSchema
>;
export type ConnectRepositoryEvidence = z.infer<
  typeof connectRepositoryEvidenceSchema
>;
export type ConfirmDataAndMetricEvidence = z.infer<
  typeof confirmDataAndMetricEvidenceSchema
>;
export type PrepareEnvironmentEvidence = z.infer<
  typeof prepareEnvironmentEvidenceSchema
>;
export type CompareResultsEvidence = z.infer<
  typeof compareResultsEvidenceSchema
>;
export type RecordGapsEvidence = z.infer<typeof recordGapsEvidenceSchema>;
export type ReproductionGap = z.infer<typeof reproductionGapSchema>;
export type FullProtocolProject = z.infer<typeof fullProtocolProjectSchema>;
export type FullProtocolSummary = z.infer<typeof fullProtocolSummarySchema>;
