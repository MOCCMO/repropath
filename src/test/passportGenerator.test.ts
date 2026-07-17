import { beforeEach, describe, expect, it } from "vitest";
import { checkpointDefinitions } from "../domain/checkpointDefinitions";
import {
  generatePassport,
  passportToJson,
  passportToMarkdown,
  passportV2Schema
} from "../domain/passportGenerator";
import { loadProject, STORAGE_KEY } from "../state/storage";
import frozenProjectV1Json from "./fixtures/project-v1-frozen.json";
import {
  demoFixture,
  fixedTimestamp,
  verifiedFullProtocolProjectFixture
} from "./fixtures/projects";

describe("Reproduction Passport v2", () => {
  beforeEach(() => localStorage.clear());

  it("generates a schema-valid versioned Passport", () => {
    const project = verifiedFullProtocolProjectFixture();
    const passport = generatePassport(demoFixture, project, fixedTimestamp);

    expect(passportV2Schema.parse(passport)).toEqual(passport);
    expect(passport.schemaVersion).toBe(2);
    expect(passport.generatedAt).toBe(fixedTimestamp);
    expect(passport.sourceProjectUpdatedAt).toBe(project.updatedAt);
    expect(passport.project).toEqual({
      id: project.id,
      schemaVersion: 2
    });
    expect(passport.overallStatus).toBe("minimal_target_reproduced");
    expect(passport.claimBoundary).toMatchObject({
      minimalMethodTarget: "reproduced",
      paperBenchmark: "not_attempted"
    });
  });

  it("includes all seven checkpoints in protocol order", () => {
    const passport = generatePassport(
      demoFixture,
      verifiedFullProtocolProjectFixture(),
      fixedTimestamp
    );

    expect(passport.checkpoints.map(({ checkpointId }) => checkpointId)).toEqual(
      checkpointDefinitions.map(({ id }) => id)
    );
    expect(passport.checkpoints.map(({ order }) => order)).toEqual([
      1, 2, 3, 4, 5, 6, 7
    ]);
  });

  it("records status, provenance, structured evidence, sources, and missing requirements per checkpoint", () => {
    const project = verifiedFullProtocolProjectFixture();
    project.checkpoints["run-minimal-target"].evidence.trainingCommand = "";
    const passport = generatePassport(demoFixture, project, fixedTimestamp);
    const run = passport.checkpoints.find(
      (checkpoint) => checkpoint.checkpointId === "run-minimal-target"
    )!;

    expect(run.derivedStatus).toBe("in_progress");
    expect(run.evidenceMode).toBe("curated_editable");
    expect(run.evidenceProvenance).toBe("verified_demo_run");
    expect(run.sourceReferences.length).toBeGreaterThan(0);
    expect(run.missingRequirements).toContain("Training command");
    expect(run.evidence).toMatchObject({ trainingCommand: "" });
  });

  it("preserves structured gap impact, status, provenance, and sources", () => {
    const project = verifiedFullProtocolProjectFixture();
    project.checkpoints["record-gaps"].evidence.gaps.push({
      id: "learner-gap",
      description: "Tokenizer parity remains unchecked.",
      impactOnClaim: "Limits preprocessing-equivalence claims.",
      status: "unresolved",
      provenance: "learner_entered",
      sources: []
    });
    const passport = generatePassport(demoFixture, project, fixedTimestamp);
    const learnerGap = passport.gaps.find(({ id }) => id === "learner-gap");

    expect(learnerGap).toEqual({
      id: "learner-gap",
      description: "Tokenizer parity remains unchecked.",
      impactOnClaim: "Limits preprocessing-equivalence claims.",
      status: "unresolved",
      provenance: "learner_entered",
      sources: []
    });
  });

  it("derives Markdown and JSON from the same Passport object", () => {
    const passport = generatePassport(
      demoFixture,
      verifiedFullProtocolProjectFixture(),
      fixedTimestamp
    );
    const json = JSON.parse(passportToJson(passport));
    const markdown = passportToMarkdown(passport);

    expect(json).toEqual(passport);
    expect(markdown).toContain(passport.overallStatusLabel);
    expect(markdown).toContain(passport.comparison.explanation);
    expect(markdown).toContain(passport.gaps[0].impactOnClaim);
    expect(markdown).toContain("| 7 | Record gaps | Verified |");
    expect(markdown).toContain(
      "ReproPath repository file `public/demo/README.md`"
    );
    expect(markdown).not.toContain("92.5% Test accuracy (%)");
  });

  it("uses the stored checkpoint 6 local metric in both exports", () => {
    const project = verifiedFullProtocolProjectFixture();
    project.checkpoints["compare-results"].evidence.localMetric = "Macro F1";
    const passport = generatePassport(demoFixture, project, fixedTimestamp);
    const markdown = passportToMarkdown(passport);
    const json = JSON.parse(passportToJson(passport));

    expect(passport.comparison.localMetric).toBe("Macro F1");
    expect(json.comparison.localMetric).toBe("Macro F1");
    expect(markdown).toContain(
      `| Local | ${passport.comparison.localDataset} | Macro F1 | 0.875 |`
    );
    expect(markdown).toContain("Local result: 0.875 (Macro F1)");
  });

  it("groups incomplete and blocked requirements by checkpoint", () => {
    const project = verifiedFullProtocolProjectFixture();
    project.checkpoints["run-minimal-target"].evidence.localResult = null;
    project.checkpoints["compare-results"].evidence.localResult = null;
    const passport = generatePassport(demoFixture, project, fixedTimestamp);

    expect(passport.missingEvidenceByCheckpoint).toEqual([
      expect.objectContaining({
        checkpointId: "run-minimal-target",
        status: "in_progress",
        requirements: expect.arrayContaining(["Local result"])
      }),
      expect.objectContaining({
        checkpointId: "compare-results",
        status: "blocked",
        requirements: expect.arrayContaining([
          "Prerequisite checkpoint 5: Run the minimal target must be verified",
          "Local result"
        ])
      }),
      expect.objectContaining({
        checkpointId: "record-gaps",
        status: "blocked",
        requirements: expect.arrayContaining([
          "Prerequisite checkpoint 6: Compare results must be verified"
        ])
      })
    ]);
    expect(passport.claimBoundary.minimalMethodTarget).toBe("not_reproduced");
  });

  it("hydrates existing v1 storage before generating Passport v2", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(frozenProjectV1Json));
    const project = loadProject();

    expect(project?.schemaVersion).toBe(2);
    const passport = generatePassport(demoFixture, project!, fixedTimestamp);
    expect(passportV2Schema.safeParse(passport).success).toBe(true);
    expect(passport.schemaVersion).toBe(2);
    expect(
      passport.checkpoints.find(
        ({ checkpointId }) => checkpointId === "run-minimal-target"
      )?.evidenceProvenance
    ).toBe(frozenProjectV1Json.evidence.provenance);
  });
});
