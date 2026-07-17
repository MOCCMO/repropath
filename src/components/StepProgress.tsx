import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { paths } from "../app/paths";

export type WorkflowStep = "intake" | "map" | "checkpoint" | "passport";

type StepProgressProps = {
  activeStep: WorkflowStep;
  projectReady: boolean;
};

const steps: Array<{
  id: WorkflowStep;
  number: number;
  label: string;
  helper: string;
  path: string;
}> = [
  { id: "intake", number: 1, label: "Intake", helper: "Choose a case", path: paths.intake },
  {
    id: "map",
    number: 2,
    label: "Map",
    helper: "Bound the target",
    path: paths.map
  },
  {
    id: "checkpoint",
    number: 3,
    label: "Checkpoint",
    helper: "Record evidence",
    path: paths.checkpoint
  },
  {
    id: "passport",
    number: 4,
    label: "Passport",
    helper: "Review & export",
    path: paths.passport
  }
];

export function StepProgress({ activeStep, projectReady }: StepProgressProps) {
  const activeIndex = steps.findIndex((step) => step.id === activeStep);

  return (
    <nav className="step-progress" aria-label="Reproduction workflow">
      {steps.map((step, index) => {
        const complete = index < activeIndex;
        const active = index === activeIndex;
        const content = (
          <>
            <span
              className={`step-number ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
              aria-hidden="true"
            >
              {complete ? <Check size={16} /> : step.number}
            </span>
            <span className="step-copy">
              <span className="step-label">{step.label}</span>
              <span className="step-helper">{step.helper}</span>
            </span>
          </>
        );

        return (
          <div className="step-item" key={step.id} aria-current={active ? "step" : undefined}>
            {step.id === "intake" || projectReady ? (
              <Link to={step.path}>{content}</Link>
            ) : (
              <span className="step-disabled">{content}</span>
            )}
            {index < steps.length - 1 && <span className="step-line" aria-hidden="true" />}
          </div>
        );
      })}
    </nav>
  );
}
