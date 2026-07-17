import { describe, expect, it } from "vitest";
import {
  generatePassport,
  passportToJson,
  passportToMarkdown
} from "../domain/passportGenerator";
import {
  demoFixture,
  fixedTimestamp,
  modifiedSeedProjectFixture,
  verifiedProjectFixture
} from "./fixtures/projects";

describe("Reproduction Passport", () => {
  it("exports the same status, evidence, and non-comparable boundary", () => {
    const passport = generatePassport(
      demoFixture,
      verifiedProjectFixture(),
      fixedTimestamp
    );
    const markdown = passportToMarkdown(passport);
    const json = JSON.parse(passportToJson(passport));

    expect(passport.status).toBe("minimal_target_reproduced");
    expect(passport.comparison.basis).toBe("not_comparable");
    expect(passport.comparison.localResult).toBe(0.875);
    expect(passport.comparison.paperResult).toBe(0.925);
    expect(passport.sources.length).toBeGreaterThan(10);
    expect(markdown).toContain("Minimal target reproduced");
    expect(markdown).toContain("P@1");
    expect(markdown).toContain("not_comparable");
    expect(markdown).toContain(passport.comparison.explanation);
    expect(markdown).toContain(passport.evidence.logExcerpt);
    expect(json.status).toBe(passport.status);
    expect(json.evidence).toEqual(passport.evidence);
    expect(json.comparison.basis).toBe(passport.comparison.basis);
    expect(passport.evidence.provenance).toBe("verified_demo_run");
    expect(markdown).toContain(
      "Evidence provenance: Verified demo run (verified_demo_run)"
    );
    expect(markdown).toContain("92.5% (Test accuracy)");
    expect(markdown).not.toContain("92.5% Test accuracy (%)");
  });

  it("lists missing evidence instead of upgrading an incomplete record", () => {
    const project = verifiedProjectFixture();
    project.evidence.environment = "";
    const passport = generatePassport(demoFixture, project, fixedTimestamp);

    expect(passport.status).toBe("in_progress");
    expect(passport.missingFields).toContain("Environment summary");
  });

  it("normalizes an invalid draft result to missing Passport evidence", () => {
    const project = modifiedSeedProjectFixture();
    project.evidence.localResult = 2;

    expect(() =>
      generatePassport(demoFixture, project, fixedTimestamp)
    ).not.toThrow();
    const passport = generatePassport(demoFixture, project, fixedTimestamp);
    expect(passport.evidence.localResult).toBeNull();
    expect(passport.comparison.localResult).toBeNull();
    expect(passport.missingFields).toContain("Local P@1 result");
    expect(passport.status).toBe("in_progress");
  });

  it("exports modified-seed provenance after a learner edit", () => {
    const passport = generatePassport(
      demoFixture,
      modifiedSeedProjectFixture(),
      fixedTimestamp
    );
    const json = JSON.parse(passportToJson(passport));

    expect(passport.evidence.provenance).toBe(
      "verified_seed_modified_by_learner"
    );
    expect(json.evidence.provenance).toBe(
      "verified_seed_modified_by_learner"
    );
    expect(passportToMarkdown(passport)).toContain(
      "Verified seed modified by learner (verified_seed_modified_by_learner)"
    );
  });

  it("covers paper.version separately and labels repository-local sources", () => {
    const passport = generatePassport(
      demoFixture,
      verifiedProjectFixture(),
      fixedTimestamp
    );
    const claimIds = passport.sources.map((source) => source.claimId);
    const markdown = passportToMarkdown(passport);

    expect(claimIds).toContain("paper.version");
    expect(
      demoFixture.paper.version.sources.every(
        (source) => source.claimId === "paper.version"
      )
    ).toBe(true);
    expect(markdown).toContain(
      "ReproPath repository file `public/demo/README.md`"
    );
  });
});
