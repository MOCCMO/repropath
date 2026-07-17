import { BrowserRouter } from "react-router-dom";
import { ProjectProvider } from "../state/ProjectProvider";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <AppErrorBoundary>
      <ProjectProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ProjectProvider>
    </AppErrorBoundary>
  );
}
