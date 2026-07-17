import { useEffect, useMemo, useReducer, type PropsWithChildren } from "react";
import fastTextDemoJson from "../data/fasttext-demo.json";
import { curatedDemoSchema } from "../domain/schemas";
import { ProjectContext, type ProjectContextValue } from "./projectContext";
import { projectReducer } from "./projectReducer";
import { loadProject, saveProject } from "./storage";

const demo = curatedDemoSchema.parse(fastTextDemoJson);

export function ProjectProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(projectReducer, undefined, () => ({
    project: loadProject()
  }));

  useEffect(() => {
    if (state.project) saveProject(state.project);
  }, [state.project]);

  const value = useMemo<ProjectContextValue>(
    () => ({
      demo,
      project: state.project,
      openCuratedProject: () =>
        dispatch({
          type: "open_curated",
          demo,
          now: new Date().toISOString()
        }),
      updateEvidence: (patch) =>
        dispatch({
          type: "update_evidence",
          patch,
          demo,
          now: new Date().toISOString()
        }),
      updateLearnerNotes: (notes) =>
        dispatch({
          type: "update_learner_notes",
          notes,
          now: new Date().toISOString()
        }),
      addLearnerGap: (gap) =>
        dispatch({
          type: "add_learner_gap",
          gap,
          now: new Date().toISOString()
        }),
      removeLearnerGap: (gapId) =>
        dispatch({
          type: "remove_learner_gap",
          gapId,
          now: new Date().toISOString()
        })
    }),
    [state.project]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
