import { createContext, useContext } from "react";
import type { CuratedDemo, Project, RunEvidence } from "../domain/schemas";

export type ProjectContextValue = {
  demo: CuratedDemo;
  project: Project | null;
  openCuratedProject: () => void;
  updateEvidence: (patch: Partial<RunEvidence>) => void;
};

export const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within ProjectProvider");
  }
  return context;
}
