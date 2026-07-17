import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { GitBranch } from "lucide-react";
import { StepProgress, type WorkflowStep } from "../components/StepProgress";
import { useProject } from "../state/projectContext";

type AppShellProps = PropsWithChildren<{
  activeStep: WorkflowStep;
}>;

export function AppShell({ activeStep, children }: AppShellProps) {
  const { project } = useProject();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="ReproPath home">
          <span className="brand-mark" aria-hidden="true">
            <GitBranch size={22} strokeWidth={2.2} />
          </span>
          <span>ReproPath</span>
        </Link>
        <StepProgress activeStep={activeStep} projectReady={Boolean(project)} />
        <div className="topbar-spacer" aria-hidden="true" />
      </header>
      {children}
    </div>
  );
}
