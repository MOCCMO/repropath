import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, GitBranch, RotateCcw } from "lucide-react";
import { StepProgress, type WorkflowStep } from "../components/StepProgress";
import { useProject } from "../state/projectContext";

type AppShellProps = PropsWithChildren<{
  activeStep: WorkflowStep;
}>;

export function AppShell({ activeStep, children }: AppShellProps) {
  const {
    project,
    persistenceError,
    resetCuratedProject,
    statusNotice
  } = useProject();

  const confirmReset = () => {
    const confirmed = window.confirm(
      "Reset the curated demo? This replaces ReproPath project evidence with the reviewed seed and removes learner notes and learner-created gaps. Other browser storage is not affected."
    );
    if (confirmed) resetCuratedProject();
  };

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
        <div className="topbar-actions">
          {project && (
            <button
              className="reset-demo-button"
              type="button"
              onClick={confirmReset}
            >
              <RotateCcw size={16} aria-hidden="true" /> Reset curated demo
            </button>
          )}
        </div>
      </header>
      {persistenceError && (
        <div className="workspace-message workspace-error" role="alert">
          <AlertTriangle size={17} aria-hidden="true" /> {persistenceError}
        </div>
      )}
      {statusNotice && (
        <div className="workspace-message workspace-notice" role="status">
          {statusNotice}
        </div>
      )}
      {children}
    </div>
  );
}
