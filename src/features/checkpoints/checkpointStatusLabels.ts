import type { CheckpointStatus } from "../../domain/schemas";

export const checkpointStatusLabels = {
  not_started: "Not started",
  in_progress: "In progress",
  verified: "Verified",
  blocked: "Blocked"
} satisfies Record<CheckpointStatus, string>;
