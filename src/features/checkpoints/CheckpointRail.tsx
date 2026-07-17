import {
  CheckCircle2,
  Circle,
  Clock3,
  LockKeyhole
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { checkpointPath } from "../../app/paths";
import {
  checkpointDefinitions,
  type CheckpointId
} from "../../domain/checkpointDefinitions";
import type { CheckpointStatus } from "../../domain/schemas";
import { checkpointStatusLabels } from "./checkpointStatusLabels";

type CheckpointRailProps = {
  activeCheckpointId?: CheckpointId;
  statuses: Record<CheckpointId, CheckpointStatus>;
};

const statusIcons = {
  not_started: Circle,
  in_progress: Clock3,
  verified: CheckCircle2,
  blocked: LockKeyhole
} satisfies Record<CheckpointStatus, typeof Circle>;

export function CheckpointRail({
  activeCheckpointId,
  statuses
}: CheckpointRailProps) {
  const activeCheckpointRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (
      typeof window.matchMedia !== "function" ||
      !window.matchMedia("(max-width: 900px)").matches
    ) {
      return;
    }
    activeCheckpointRef.current?.scrollIntoView?.({
      behavior: "auto",
      block: "nearest",
      inline: "center"
    });
  }, [activeCheckpointId]);

  return (
    <aside className="checkpoint-rail">
      <p className="rail-label">Reproduction protocol</p>
      <nav aria-label="Reproduction checkpoints">
        <ol className="checkpoint-list">
          {checkpointDefinitions.map((definition) => {
            const status = statuses[definition.id];
            const Icon = statusIcons[status];
            const active = definition.id === activeCheckpointId;
            return (
              <li key={definition.id}>
                <Link
                  ref={active ? activeCheckpointRef : undefined}
                  className={`rail-checkpoint is-${status} ${active ? "is-active" : ""}`}
                  to={checkpointPath(definition.id)}
                  aria-current={active ? "step" : undefined}
                >
                  <span className="rail-number" aria-hidden="true">
                    {definition.order}
                  </span>
                  <span className="rail-checkpoint-copy">
                    <strong>{definition.title}</strong>
                    <span className="rail-status-label">
                      Status: {checkpointStatusLabels[status]}
                    </span>
                  </span>
                  <Icon size={17} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
