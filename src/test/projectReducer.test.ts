import { describe, expect, it } from "vitest";
import { projectReducer } from "../state/projectReducer";
import {
  learnerEnteredProjectFixture,
  verifiedProjectFixture
} from "./fixtures/projects";

describe("evidence provenance", () => {
  it("starts the curated seed as a verified demo run", () => {
    expect(verifiedProjectFixture().evidence.provenance).toBe(
      "verified_demo_run"
    );
  });

  it("marks a seeded record when a learner edits any evidence", () => {
    const project = verifiedProjectFixture();
    const next = projectReducer(
      { project },
      {
        type: "update_evidence",
        patch: { notes: "Learner note" },
        now: "2026-07-17T08:01:00.000Z"
      }
    );

    expect(next.project?.evidence.provenance).toBe(
      "verified_seed_modified_by_learner"
    );
  });

  it("preserves learner-entered provenance on later edits", () => {
    const project = learnerEnteredProjectFixture();
    const next = projectReducer(
      { project },
      {
        type: "update_evidence",
        patch: { notes: "Updated learner note" },
        now: "2026-07-17T08:01:00.000Z"
      }
    );

    expect(next.project?.evidence.provenance).toBe("learner_entered");
  });
});
