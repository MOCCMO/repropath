import {
  deriveComparisonEvidence,
  hydrateProjectV1ToV2
} from "../domain/projectHydration";
import type {
  FullProtocolProject,
  ReproductionGap
} from "../domain/fullProtocolSchemas";
import type { CuratedDemo, Project, RunEvidence } from "../domain/schemas";

export type ProjectState = {
  project: FullProtocolProject | null;
};

export type ProjectAction =
  | { type: "open_curated"; demo: CuratedDemo; now: string }
  | {
      type: "update_evidence";
      patch: Partial<RunEvidence>;
      demo: CuratedDemo;
      now: string;
    }
  | { type: "update_learner_notes"; notes: string; now: string }
  | { type: "add_learner_gap"; gap: ReproductionGap; now: string }
  | { type: "remove_learner_gap"; gapId: string; now: string };

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

export function createFullProtocolProjectFromDemo(
  demo: CuratedDemo,
  now = new Date().toISOString()
): FullProtocolProject {
  return hydrateProjectV1ToV2(createProjectFromDemo(demo, now), demo);
}

const modifiedSeedProvenance = (
  current: RunEvidence["provenance"]
): RunEvidence["provenance"] =>
  current === "learner_entered"
    ? "learner_entered"
    : "verified_seed_modified_by_learner";

export function projectReducer(
  state: ProjectState,
  action: ProjectAction
): ProjectState {
  switch (action.type) {
    case "open_curated":
      return state.project
        ? state
        : {
            project: createFullProtocolProjectFromDemo(
              action.demo,
              action.now
            )
          };
    case "update_evidence": {
      if (!state.project) return state;
      const runCheckpoint = state.project.checkpoints["run-minimal-target"];
      const provenance = modifiedSeedProvenance(
        runCheckpoint.evidence.provenance
      );
      const evidence = {
        ...runCheckpoint.evidence,
        ...action.patch,
        provenance
      };
      return {
        project: {
          ...state.project,
          updatedAt: action.now,
          checkpoints: {
            ...state.project.checkpoints,
            "run-minimal-target": {
              ...runCheckpoint,
              evidence
            },
            "compare-results": {
              ...state.project.checkpoints["compare-results"],
              evidence: deriveComparisonEvidence(action.demo, evidence)
            }
          }
        }
      };
    }
    case "update_learner_notes": {
      if (!state.project) return state;
      const checkpoint = state.project.checkpoints["record-gaps"];
      return {
        project: {
          ...state.project,
          updatedAt: action.now,
          checkpoints: {
            ...state.project.checkpoints,
            "record-gaps": {
              ...checkpoint,
              evidence: {
                ...checkpoint.evidence,
                learnerNotes: action.notes,
                provenance: "verified_seed_modified_by_learner"
              }
            }
          }
        }
      };
    }
    case "add_learner_gap": {
      if (!state.project) return state;
      const checkpoint = state.project.checkpoints["record-gaps"];
      return {
        project: {
          ...state.project,
          updatedAt: action.now,
          checkpoints: {
            ...state.project.checkpoints,
            "record-gaps": {
              ...checkpoint,
              evidence: {
                ...checkpoint.evidence,
                gaps: [...checkpoint.evidence.gaps, action.gap],
                provenance: "verified_seed_modified_by_learner"
              }
            }
          }
        }
      };
    }
    case "remove_learner_gap": {
      if (!state.project) return state;
      const checkpoint = state.project.checkpoints["record-gaps"];
      const gaps = checkpoint.evidence.gaps.filter(
        (gap) =>
          gap.id !== action.gapId || gap.provenance !== "learner_entered"
      );
      if (gaps.length === checkpoint.evidence.gaps.length) return state;
      return {
        project: {
          ...state.project,
          updatedAt: action.now,
          checkpoints: {
            ...state.project.checkpoints,
            "record-gaps": {
              ...checkpoint,
              evidence: {
                ...checkpoint.evidence,
                gaps,
                provenance: "verified_seed_modified_by_learner"
              }
            }
          }
        }
      };
    }
  }
}
