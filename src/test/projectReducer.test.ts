import { describe, expect, it } from "vitest";
import { projectReducer } from "../state/projectReducer";
import {
  demoFixture,
  learnerEnteredProjectFixture,
  verifiedFullProtocolProjectFixture
} from "./fixtures/projects";

describe("evidence provenance", () => {
  it("starts the curated seed as a verified demo run", () => {
    expect(
      verifiedFullProtocolProjectFixture().checkpoints["run-minimal-target"]
        .evidence.provenance
    ).toBe(
      "verified_demo_run"
    );
  });

  it("marks a seeded record when a learner edits any evidence", () => {
    const project = verifiedFullProtocolProjectFixture();
    const next = projectReducer(
      { project },
      {
        type: "update_evidence",
        patch: { notes: "Learner note" },
        demo: demoFixture,
        now: "2026-07-17T08:01:00.000Z"
      }
    );

    expect(
      next.project?.checkpoints["run-minimal-target"].evidence.provenance
    ).toBe(
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
        demo: demoFixture,
        now: "2026-07-17T08:01:00.000Z"
      }
    );

    expect(
      next.project?.checkpoints["run-minimal-target"].evidence.provenance
    ).toBe("learner_entered");
  });
});
