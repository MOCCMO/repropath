import { Component, type ErrorInfo, type PropsWithChildren } from "react";
import { AlertTriangle } from "lucide-react";

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<
  PropsWithChildren,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ReproPath workspace error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="workspace-error-page" role="alert">
          <AlertTriangle size={28} aria-hidden="true" />
          <h1>ReproPath could not load this workspace.</h1>
          <p>
            Your saved browser data has not been cleared. Reload the page to
            retry, or return later if the problem continues.
          </p>
          <button
            className="button button-primary"
            type="button"
            onClick={() => window.location.reload()}
          >
            Reload ReproPath
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
