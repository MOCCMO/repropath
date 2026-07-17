import type { CheckpointId } from "../domain/checkpointDefinitions";

export const projectPath = "/projects/fasttext-bag-of-tricks";

export const checkpointPath = (checkpointId: CheckpointId) =>
  `${projectPath}/checkpoints/${checkpointId}`;

export const paths = {
  intake: "/",
  map: `${projectPath}/map`,
  checkpoint: checkpointPath("run-minimal-target"),
  checkpointRoute: "/projects/:projectId/checkpoints/:checkpointId",
  passport: `${projectPath}/passport`
} as const;
