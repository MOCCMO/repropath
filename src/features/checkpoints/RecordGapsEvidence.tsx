import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { FormField } from "../../components/FormField";
import { fieldDescriptionIds } from "../../components/formFieldIds";
import type {
  FullProtocolProject,
  ReproductionGap
} from "../../domain/fullProtocolSchemas";
import { CURATED_BENCHMARK_GAP_ID } from "../../domain/projectHydration";
import { EvidenceProvenance } from "./EvidenceProvenance";
import { SourceList } from "./SourceList";

type RecordGapsEvidenceProps = {
  project: FullProtocolProject;
  onNotesChange: (notes: string) => void;
  onAddGap: (gap: ReproductionGap) => void;
  onRemoveGap: (gapId: string) => void;
};

type GapDraft = {
  description: string;
  impactOnClaim: string;
  status: "" | ReproductionGap["status"];
};

const emptyDraft: GapDraft = {
  description: "",
  impactOnClaim: "",
  status: ""
};

const makeGapId = () =>
  `learner-gap-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;

export function RecordGapsEvidence({
  project,
  onNotesChange,
  onAddGap,
  onRemoveGap
}: RecordGapsEvidenceProps) {
  const checkpoint = project.checkpoints["record-gaps"];
  const curatedGap = checkpoint.evidence.gaps.find(
    ({ id }) => id === CURATED_BENCHMARK_GAP_ID
  )!;
  const learnerGaps = checkpoint.evidence.gaps.filter(
    ({ provenance }) => provenance === "learner_entered"
  );
  const [draft, setDraft] = useState<GapDraft>(emptyDraft);
  const [submitted, setSubmitted] = useState(false);

  const descriptionError =
    submitted && !draft.description.trim()
      ? "Description is required."
      : undefined;
  const impactError =
    submitted && !draft.impactOnClaim.trim()
      ? "Impact on claim is required."
      : undefined;
  const statusError =
    submitted && !draft.status ? "Status is required." : undefined;

  const submitGap = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (
      !draft.description.trim() ||
      !draft.impactOnClaim.trim() ||
      !draft.status
    ) {
      return;
    }
    onAddGap({
      id: makeGapId(),
      description: draft.description.trim(),
      impactOnClaim: draft.impactOnClaim.trim(),
      status: draft.status,
      provenance: "learner_entered",
      sources: []
    });
    setDraft(emptyDraft);
    setSubmitted(false);
  };

  return (
    <div className="gap-workspace">
      <section className="curated-gap" aria-labelledby="curated-gap-heading">
        <div className="gap-heading-row">
          <div>
            <span className="page-context">Curated gap · read-only</span>
            <h3 id="curated-gap-heading">AG News benchmark remains unresolved</h3>
          </div>
          <EvidenceProvenance provenance={curatedGap.provenance} />
        </div>
        <dl className="checkpoint-evidence-list compact-list">
          <div>
            <dt>Description</dt>
            <dd>{curatedGap.description}</dd>
          </div>
          <div>
            <dt>Impact on claim</dt>
            <dd>{curatedGap.impactOnClaim}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{curatedGap.status}</dd>
          </div>
        </dl>
        <SourceList sources={curatedGap.sources} />
      </section>

      <section className="learner-notes-section" aria-labelledby="learner-notes-heading">
        <div className="gap-heading-row">
          <div>
            <h3 id="learner-notes-heading">Learner notes</h3>
            <p>Record additional context without changing the curated source facts.</p>
          </div>
          <EvidenceProvenance provenance={checkpoint.evidence.provenance} />
        </div>
        <label htmlFor="gap-learner-notes">Notes</label>
        <p className="field-hint" id="gap-learner-notes-hint">
          Optional notes persist with the full protocol project.
        </p>
        <textarea
          id="gap-learner-notes"
          rows={4}
          value={checkpoint.evidence.learnerNotes}
          aria-describedby="gap-learner-notes-hint"
          onChange={(event) => onNotesChange(event.target.value)}
        />
      </section>

      {learnerGaps.length > 0 && (
        <section className="learner-gaps" aria-labelledby="learner-gaps-heading">
          <h3 id="learner-gaps-heading">Additional learner-created gaps</h3>
          {learnerGaps.map((gap) => (
            <article key={gap.id} className="learner-gap-card">
              <div className="gap-heading-row">
                <EvidenceProvenance provenance={gap.provenance} />
                <button
                  className="button button-quiet compact-button"
                  type="button"
                  onClick={() => onRemoveGap(gap.id)}
                >
                  <Trash2 size={15} aria-hidden="true" /> Remove gap
                </button>
              </div>
              <dl className="checkpoint-evidence-list compact-list">
                <div><dt>Description</dt><dd>{gap.description}</dd></div>
                <div><dt>Impact on claim</dt><dd>{gap.impactOnClaim}</dd></div>
                <div><dt>Status</dt><dd>{gap.status}</dd></div>
              </dl>
              <SourceList sources={gap.sources} />
            </article>
          ))}
        </section>
      )}

      <section className="add-gap-section" aria-labelledby="add-gap-heading">
        <h3 id="add-gap-heading">Add a learner-created gap</h3>
        <p>
          All three fields are required. The saved gap is labeled learner-entered.
        </p>
        <form className="evidence-form" onSubmit={submitGap} noValidate>
          <FormField
            label="Description"
            htmlFor="new-gap-description"
            hint="State what remains unresolved."
            error={descriptionError}
          >
            <textarea
              id="new-gap-description"
              rows={3}
              value={draft.description}
              aria-describedby={fieldDescriptionIds(
                "new-gap-description",
                descriptionError
              )}
              aria-invalid={Boolean(descriptionError)}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  description: event.target.value
                }))
              }
            />
          </FormField>
          <FormField
            label="Impact on claim"
            htmlFor="new-gap-impact"
            hint="Explain which reproduction claim this gap limits."
            error={impactError}
          >
            <textarea
              id="new-gap-impact"
              rows={3}
              value={draft.impactOnClaim}
              aria-describedby={fieldDescriptionIds(
                "new-gap-impact",
                impactError
              )}
              aria-invalid={Boolean(impactError)}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  impactOnClaim: event.target.value
                }))
              }
            />
          </FormField>
          <FormField
            label="Status"
            htmlFor="new-gap-status"
            hint="Record whether this gap remains unresolved or has been resolved."
            error={statusError}
          >
            <select
              id="new-gap-status"
              value={draft.status}
              aria-describedby={fieldDescriptionIds(
                "new-gap-status",
                statusError
              )}
              aria-invalid={Boolean(statusError)}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  status: event.target.value as GapDraft["status"]
                }))
              }
            >
              <option value="">Select a status</option>
              <option value="unresolved">Unresolved</option>
              <option value="resolved">Resolved</option>
            </select>
          </FormField>
          <div className="form-actions add-gap-actions">
            <span className="save-note">Saved gaps persist in this browser.</span>
            <button className="button button-secondary" type="submit">
              <Plus size={17} aria-hidden="true" /> Add gap
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
