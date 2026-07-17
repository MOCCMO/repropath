import { BookOpen, FlaskConical } from "lucide-react";
import type { SourceReference } from "../domain/schemas";

type EvidenceStatusProps = {
  provenance: "paper" | "repository" | "verified_demo_run";
  sources: SourceReference[];
};

const labels = {
  paper: "Paper source",
  repository: "Repository source",
  verified_demo_run: "Observed run"
};

export function EvidenceStatus({ provenance, sources }: EvidenceStatusProps) {
  const source = sources[0];
  const Icon = provenance === "verified_demo_run" ? FlaskConical : BookOpen;

  return (
    <a
      className="evidence-status"
      href={source.url}
      target="_blank"
      rel="noreferrer"
      title={source.locator}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{labels[provenance]}</span>
    </a>
  );
}
