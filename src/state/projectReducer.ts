import type { CuratedDemo, Project, RunEvidence } from "../domain/schemas";

export type ProjectState = {
  project: Project | null;
};

type ProjectAction =
  | { type: "open_curated"; demo: CuratedDemo; now: string }
  | {
      type: "update_evidence";
      patch: Partial<RunEvidence>;
      now: string;
    };

export function createProjectFromDemo(
  demo: CuratedDemo,
  now = new Date().toISOString()
): Project {
  return {
    schemaVersion: 1,
    id: "fasttext-bag-of-tricks",
    createdAt: now,
    updatedAt: now,
    evidence: {
      environment: demo.observedRun.environment.value,
      trainingCommand: demo.observedRun.trainingCommand.value,
      evaluationCommand: demo.observedRun.evaluationCommand.value,
      logExcerpt: demo.observedRun.logExcerpt.value,
      localResult: demo.observedRun.localResult.value,
      notes:
        "Seed evidence was observed twice on the project-authored mini-news fixture.",
      resultDatasetScopeConfirmed: true,
      runOutcome: "succeeded",
      provenance: "verified_demo_run"
    }
  };
}

export function projectReducer(
  state: ProjectState,
  action: ProjectAction
): ProjectState {
  switch (action.type) {
    case "open_curated":
      return state.project
        ? state
        : { project: createProjectFromDemo(action.demo, action.now) };
    case "update_evidence": {
      if (!state.project) return state;
      const provenance =
        state.project.evidence.provenance === "learner_entered"
          ? "learner_entered"
          : "verified_seed_modified_by_learner";
      return {
        project: {
          ...state.project,
          updatedAt: action.now,
          evidence: {
            ...state.project.evidence,
            ...action.patch,
            provenance
          }
        }
      };
    }
  }
}
