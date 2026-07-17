import { FlaskConical, PencilLine, UserRound } from "lucide-react";
import type { EvidenceProvenance } from "../../domain/schemas";

type EvidenceProvenanceProps = {
  provenance: EvidenceProvenance;
};

const labels = {
  verified_demo_run: "Curated verified demo evidence",
  learner_entered: "Learner-entered evidence",
  verified_seed_modified_by_learner: "Curated seed modified by learner"
} satisfies Record<EvidenceProvenance, string>;

const icons = {
  verified_demo_run: FlaskConical,
  learner_entered: UserRound,
  verified_seed_modified_by_learner: PencilLine
} satisfies Record<EvidenceProvenance, typeof FlaskConical>;

export function EvidenceProvenance({ provenance }: EvidenceProvenanceProps) {
  const Icon = icons[provenance];
  return (
    <span className={`evidence-provenance provenance-${provenance}`}>
      <Icon size={15} aria-hidden="true" />
      {labels[provenance]}
    </span>
  );
}
