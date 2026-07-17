import { z } from "zod";
import checkpointDefinitionsJson from "../data/checkpoint-definitions.json";

export const checkpointIdSchema = z.enum([
  "understand-task",
  "connect-repository",
  "confirm-data-and-metric",
  "prepare-environment",
  "run-minimal-target",
  "compare-results",
  "record-gaps"
]);

export const evidenceModeSchema = z.enum([
  "curated_verified",
  "curated_editable",
  "derived",
  "curated_extensible"
]);

export const checkpointDefinitionSchema = z.object({
  id: checkpointIdSchema,
  order: z.number().int().min(1).max(7),
  title: z.string().min(1),
  purpose: z.string().min(1),
  prerequisites: z.array(checkpointIdSchema),
  evidenceMode: evidenceModeSchema
});

const checkpointDefinitionsSchema = z
  .array(checkpointDefinitionSchema)
  .length(7)
  .superRefine((definitions, context) => {
    const ids = new Set(definitions.map(({ id }) => id));
    const orders = new Set(definitions.map(({ order }) => order));

    if (ids.size !== definitions.length) {
      context.addIssue({
        code: "custom",
        message: "Checkpoint IDs must be unique."
      });
    }
    if (orders.size !== definitions.length) {
      context.addIssue({
        code: "custom",
        message: "Checkpoint orders must be unique."
      });
    }
    definitions.forEach((definition) => {
      definition.prerequisites.forEach((prerequisite) => {
        const prerequisiteDefinition = definitions.find(
          ({ id }) => id === prerequisite
        );
        if (
          !prerequisiteDefinition ||
          prerequisiteDefinition.order >= definition.order
        ) {
          context.addIssue({
            code: "custom",
            path: [definition.order - 1, "prerequisites"],
            message: `Prerequisite ${prerequisite} must appear earlier in the protocol.`
          });
        }
      });
    });
  });

export const checkpointDefinitions = checkpointDefinitionsSchema
  .parse(checkpointDefinitionsJson)
  .sort((left, right) => left.order - right.order);

export type CheckpointId = z.infer<typeof checkpointIdSchema>;
export type CheckpointDefinition = z.infer<typeof checkpointDefinitionSchema>;
