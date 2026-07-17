import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { FormField } from "../../components/FormField";
import { fieldDescriptionIds } from "../../components/formFieldIds";
import {
  deriveCheckpointStatus,
  evidenceFieldLabels,
  getMissingEvidenceFields,
  isValidLocalResult
} from "../../domain/checkpointRules";
import type { RunEvidence } from "../../domain/schemas";

type CheckpointEvidenceFormProps = {
  evidence: RunEvidence;
  onChange: (patch: Partial<RunEvidence>) => void;
};

export function CheckpointEvidenceForm({ evidence, onChange }: CheckpointEvidenceFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const missing = getMissingEvidenceFields(evidence);
  const missingSet = new Set(missing);

  const errorFor = (field: keyof typeof evidenceFieldLabels) => {
    if (
      field === "localResult" &&
      evidence.localResult !== null &&
      !isValidLocalResult(evidence.localResult)
    ) {
      return "Local P@1 must be a finite number from 0 to 1.";
    }
    return submitted && missingSet.has(field)
      ? `${evidenceFieldLabels[field]} is required to verify this checkpoint.`
      : undefined;
  };

  const runOutcomeError = errorFor("runOutcome");
  const localResultError = errorFor("localResult");
  const environmentError = errorFor("environment");
  const trainingCommandError = errorFor("trainingCommand");
  const evaluationCommandError = errorFor("evaluationCommand");
  const logExcerptError = errorFor("logExcerpt");
  const scopeError = errorFor("resultDatasetScopeConfirmed");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };
  const status = deriveCheckpointStatus(evidence);

  return (
    <form className="evidence-form" onSubmit={submit} noValidate>
      <div className="form-grid two-column">
        <FormField
          label="Run outcome"
          htmlFor="run-outcome"
          hint="Record what happened; the app derives the final status."
          error={runOutcomeError}
        >
          <select
            id="run-outcome"
            value={evidence.runOutcome}
            aria-describedby={fieldDescriptionIds("run-outcome", runOutcomeError)}
            aria-invalid={Boolean(runOutcomeError)}
            onChange={(event) =>
              onChange({ runOutcome: event.target.value as RunEvidence["runOutcome"] })
            }
          >
            <option value="not_recorded">Not recorded</option>
            <option value="succeeded">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </FormField>

        <FormField
          label="Local P@1"
          htmlFor="local-result"
          hint="Enter a proportion from 0 to 1, not a percentage."
          error={localResultError}
        >
          <input
            id="local-result"
            type="number"
            min="0"
            max="1"
            step="0.001"
            value={evidence.localResult ?? ""}
            aria-describedby={fieldDescriptionIds("local-result", localResultError)}
            aria-invalid={Boolean(localResultError)}
            onChange={(event) => {
              const value = event.currentTarget.value;
              const valueAsNumber = event.currentTarget.valueAsNumber;
              onChange({
                localResult:
                  value === "" || !Number.isFinite(valueAsNumber)
                    ? null
                    : valueAsNumber
              });
            }}
          />
        </FormField>
      </div>

      <FormField
        label="Environment summary"
        htmlFor="environment"
        hint="OS, architecture, compiler/runtime, and pinned fastText revision."
        error={environmentError}
      >
        <textarea
          id="environment"
          rows={3}
          value={evidence.environment}
          aria-describedby={fieldDescriptionIds("environment", environmentError)}
          aria-invalid={Boolean(environmentError)}
          onChange={(event) => onChange({ environment: event.target.value })}
        />
      </FormField>

      <FormField
        label="Training command"
        htmlFor="training-command"
        hint="Keep the full command, parameters, and data path together."
        error={trainingCommandError}
      >
        <textarea
          className="code-input"
          id="training-command"
          rows={4}
          value={evidence.trainingCommand}
          aria-describedby={fieldDescriptionIds("training-command", trainingCommandError)}
          aria-invalid={Boolean(trainingCommandError)}
          onChange={(event) => onChange({ trainingCommand: event.target.value })}
        />
      </FormField>

      <FormField
        label="Evaluation command"
        htmlFor="evaluation-command"
        hint="Record the exact command that produced the evaluation output."
        error={evaluationCommandError}
      >
        <textarea
          className="code-input"
          id="evaluation-command"
          rows={3}
          value={evidence.evaluationCommand}
          aria-describedby={fieldDescriptionIds("evaluation-command", evaluationCommandError)}
          aria-invalid={Boolean(evaluationCommandError)}
          onChange={(event) => onChange({ evaluationCommand: event.target.value })}
        />
      </FormField>

      <FormField
        label="Evaluation log excerpt"
        htmlFor="log-excerpt"
        hint="Include the lines that show N, P@1, and R@1."
        error={logExcerptError}
      >
        <textarea
          className="code-input"
          id="log-excerpt"
          rows={5}
          value={evidence.logExcerpt}
          aria-describedby={fieldDescriptionIds("log-excerpt", logExcerptError)}
          aria-invalid={Boolean(logExcerptError)}
          onChange={(event) => onChange({ logExcerpt: event.target.value })}
        />
      </FormField>

      <label className={`scope-confirm ${scopeError ? "has-error" : ""}`}>
        <input
          type="checkbox"
          checked={evidence.resultDatasetScopeConfirmed}
          aria-describedby={fieldDescriptionIds("scope-confirmation", scopeError)}
          aria-invalid={Boolean(scopeError)}
          onChange={(event) =>
            onChange({ resultDatasetScopeConfirmed: event.target.checked })
          }
        />
        <span id="scope-confirmation-hint">
          I confirm that this local result belongs to project-authored mini-news,
          not the paper’s AG dataset.
        </span>
      </label>
      {scopeError && (
        <p className="field-error" id="scope-confirmation-error" role="alert">
          {scopeError}
        </p>
      )}

      <FormField
        label="Notes"
        htmlFor="notes"
        hint="Add context that will help another learner interpret the run."
        optional
      >
        <textarea
          id="notes"
          rows={3}
          value={evidence.notes}
          aria-describedby={fieldDescriptionIds("notes")}
          onChange={(event) => onChange({ notes: event.target.value })}
        />
      </FormField>

      <div className="form-actions">
        <span className="save-note">
          {submitted && status === "verified"
            ? "Evidence gate satisfied. Continue is available below."
            : "Valid changes are saved in this browser."}
        </span>
        <button className="button button-primary" type="submit">
          Validate evidence <CheckCircle2 size={18} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
