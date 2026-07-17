import { BrowserRouter } from "react-router-dom";
import { ProjectProvider } from "../state/ProjectProvider";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ProjectProvider>
  );
}
