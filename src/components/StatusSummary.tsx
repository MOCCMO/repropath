import { AlertTriangle, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { reproductionStatusLabels } from "../domain/reproductionStatus";
import type { ReproductionStatus } from "../domain/schemas";

type StatusSummaryProps = {
  status: ReproductionStatus;
  missingCount: number;
  compact?: boolean;
};

const statusIcons = {
  insufficient_evidence: AlertTriangle,
  in_progress: Clock3,
  minimal_target_reproduced: ShieldCheck,
  not_reproduced: AlertTriangle
};

export function StatusSummary({ status, missingCount, compact }: StatusSummaryProps) {
  const Icon = statusIcons[status];
  const detail =
    status === "minimal_target_reproduced"
      ? "All required method-level evidence is present."
      : status === "not_reproduced"
        ? "The recorded run outcome is failed."
        : `${missingCount} required evidence field${missingCount === 1 ? "" : "s"} ${missingCount === 1 ? "remains" : "remain"}.`;

  return (
    <section className={`status-summary status-${status} ${compact ? "is-compact" : ""}`} aria-live="polite">
      <div className="status-heading">
        <Icon size={22} aria-hidden="true" />
        <div>
          <span className="status-kicker">Reproduction status</span>
          <strong>{reproductionStatusLabels[status]}</strong>
        </div>
      </div>
      <p>{detail}</p>
      <div className="scope-lock">
        <CheckCircle2 size={16} aria-hidden="true" />
        <span>Paper benchmark remains not comparable</span>
      </div>
    </section>
  );
}
