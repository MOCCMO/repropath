import { createContext, useContext } from "react";
import type { FullProtocolProject, ReproductionGap } from "../domain/fullProtocolSchemas";
import type { CuratedDemo, RunEvidence } from "../domain/schemas";

export type ProjectContextValue = {
  demo: CuratedDemo;
  project: FullProtocolProject | null;
  persistenceError: string | null;
  statusNotice: string | null;
  openCuratedProject: () => void;
  resetCuratedProject: () => void;
  updateEvidence: (patch: Partial<RunEvidence>) => void;
  updateLearnerNotes: (notes: string) => void;
  addLearnerGap: (gap: ReproductionGap) => void;
  removeLearnerGap: (gapId: string) => void;
};

export const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within ProjectProvider");
  }
  return context;
}
