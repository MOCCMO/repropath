import {
  useEffect,
  useMemo,
  useReducer,
  useState,
  type PropsWithChildren
} from "react";
import fastTextDemoJson from "../data/fasttext-demo.json";
import { curatedDemoSchema } from "../domain/schemas";
import { ProjectContext, type ProjectContextValue } from "./projectContext";
import { projectReducer } from "./projectReducer";
import { loadProjectResult, saveProjectResult } from "./storage";

const demo = curatedDemoSchema.parse(fastTextDemoJson);

export function ProjectProvider({ children }: PropsWithChildren) {
  const [initialLoad] = useState(() => loadProjectResult());
  const [state, dispatch] = useReducer(projectReducer, {
    project: initialLoad.value
  });
  const [persistenceError, setPersistenceError] = useState<string | null>(
    initialLoad.ok
      ? null
      : initialLoad.reason === "storage_unavailable"
        ? "ReproPath could not access browser storage. Changes may not survive a refresh."
        : "ReproPath could not load the saved project. Reset the curated demo to recover."
  );
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!state.project) return;
    const result = saveProjectResult(state.project);
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      if (result.ok) {
        setPersistenceError(null);
        return;
      }
      setPersistenceError(
        result.reason === "storage_unavailable"
          ? "ReproPath could not save to browser storage. Keep this page open and try again."
          : "This draft contains invalid evidence and was not saved. Fix the highlighted fields before leaving this page."
      );
    });
    return () => {
      active = false;
    };
  }, [state.project]);

  const value = useMemo<ProjectContextValue>(
    () => ({
      demo,
      project: state.project,
      persistenceError,
      statusNotice,
      openCuratedProject: () => {
        setStatusNotice(null);
        dispatch({
          type: "open_curated",
          demo,
          now: new Date().toISOString()
        });
      },
      resetCuratedProject: () => {
        dispatch({
          type: "reset_curated",
          demo,
          now: new Date().toISOString()
        });
        setStatusNotice(
          "Curated demo reset to the reviewed seven-checkpoint seed."
        );
      },
      updateEvidence: (patch) => {
        setStatusNotice(null);
        dispatch({
          type: "update_evidence",
          patch,
          demo,
          now: new Date().toISOString()
        });
      },
      updateLearnerNotes: (notes) => {
        setStatusNotice(null);
        dispatch({
          type: "update_learner_notes",
          notes,
          now: new Date().toISOString()
        });
      },
      addLearnerGap: (gap) => {
        setStatusNotice(null);
        dispatch({
          type: "add_learner_gap",
          gap,
          now: new Date().toISOString()
        });
      },
      removeLearnerGap: (gapId) => {
        setStatusNotice(null);
        dispatch({
          type: "remove_learner_gap",
          gapId,
          now: new Date().toISOString()
        });
      }
    }),
    [persistenceError, state.project, statusNotice]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
