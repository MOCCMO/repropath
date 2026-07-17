import { describe, expect, it } from "vitest";
import sourceRegister from "../../docs/DEMO_SOURCE_REGISTER.md?raw";
import frozenProjectV1Json from "./fixtures/project-v1-frozen.json";
import {
  CURATED_BENCHMARK_GAP_ID,
  deriveComparisonEvidence,
  hydrateProjectV1ToV2
} from "../domain/projectHydration";
import { projectSchema } from "../domain/schemas";
import { demoFixture } from "./fixtures/projects";

describe("v1-to-v2 project hydration", () => {
  it("hydrates a real frozen-milestone v1 snapshot", () => {
    const v1Project = projectSchema.parse(frozenProjectV1Json);
    const hydrated = hydrateProjectV1ToV2(v1Project, demoFixture);

    expect(hydrated.schemaVersion).toBe(2);
    expect(hydrated.createdAt).toBe(v1Project.createdAt);
    expect(hydrated.updatedAt).toBe(v1Project.updatedAt);
  });

  it("preserves run-minimal-target evidence and provenance exactly", () => {
    const v1Project = projectSchema.parse(frozenProjectV1Json);
    const hydrated = hydrateProjectV1ToV2(v1Project, demoFixture);

    expect(hydrated.checkpoints["run-minimal-target"].evidence).toEqual(
      v1Project.evidence
    );
    expect(
      hydrated.checkpoints["run-minimal-target"].evidence.provenance
    ).toBe("verified_demo_run");
  });

  it("seeds checkpoints 1 through 4 as verified curated evidence", () => {
    const hydrated = hydrateProjectV1ToV2(
      frozenProjectV1Json,
      demoFixture
    );
    const ids = [
      "understand-task",
      "connect-repository",
      "confirm-data-and-metric",
      "prepare-environment"
    ] as const;

    ids.forEach((id) => {
      expect(hydrated.checkpoints[id].evidence.provenance).toBe(
        "verified_demo_run"
      );
      expect(hydrated.checkpoints[id].sources.length).toBeGreaterThan(0);
    });
  });

  it("carries source locators for every curated or derived checkpoint", () => {
    const hydrated = hydrateProjectV1ToV2(
      frozenProjectV1Json,
      demoFixture
    );

    Object.values(hydrated.checkpoints).forEach((checkpoint) => {
      expect(checkpoint.sources.length).toBeGreaterThan(0);
      checkpoint.sources.forEach((source) => {
        expect(source.claimId).not.toBe("");
        expect(source.url).not.toBe("");
        expect(source.locator).not.toBe("");
      });
    });
  });

  it("derives checkpoint 6 from paper, local result, scope, and metric evidence", () => {
    const hydrated = hydrateProjectV1ToV2(
      frozenProjectV1Json,
      demoFixture
    );
    const comparison = hydrated.checkpoints["compare-results"].evidence;

    expect(comparison.paperResult).toBe(demoFixture.map.paperResult.value);
    expect(comparison.localResult).toBe(
      frozenProjectV1Json.evidence.localResult
    );
    expect(comparison.paperDataset).toBe(
      demoFixture.map.paperDataset.value
    );
    expect(comparison.localDataset).toBe(
      demoFixture.map.minimalTarget.value.dataset
    );
    expect(comparison.paperMetric).toBe(
      demoFixture.map.paperMetric.value
    );
    expect(comparison.localMetric).toBe(
      demoFixture.observedRun.localMetric.value
    );
    expect(comparison.comparisonBasis).toBe("not_comparable");
  });

  it("seeds checkpoint 7 with one unresolved sourced AG gap", () => {
    const hydrated = hydrateProjectV1ToV2(
      frozenProjectV1Json,
      demoFixture
    );
    const gap = hydrated.checkpoints["record-gaps"].evidence.gaps[0];

    expect(gap).toMatchObject({
      id: CURATED_BENCHMARK_GAP_ID,
      status: "unresolved",
      provenance: "verified_demo_run",
      description: demoFixture.map.benchmarkGap.value,
      impactOnClaim: demoFixture.map.benchmarkGapImpact.value
    });
    expect(gap.sources.length).toBeGreaterThan(0);
  });

  it("is idempotent and never duplicates seeded gaps", () => {
    const once = hydrateProjectV1ToV2(frozenProjectV1Json, demoFixture);
    const twice = hydrateProjectV1ToV2(once, demoFixture);
    const threeTimes = hydrateProjectV1ToV2(twice, demoFixture);

    expect(twice).toEqual(once);
    expect(threeTimes).toEqual(once);
    expect(
      threeTimes.checkpoints["record-gaps"].evidence.gaps.filter(
        ({ id }) => id === CURATED_BENCHMARK_GAP_ID
      )
    ).toHaveLength(1);
  });

  it("does not use evaluation P@1 output as environment-readiness evidence", () => {
    const hydrated = hydrateProjectV1ToV2(
      frozenProjectV1Json,
      demoFixture
    );
    const environment = hydrated.checkpoints["prepare-environment"];

    expect(environment.evidence.diagnosticOutput).not.toContain("P@1");
    expect(environment.evidence.diagnosticOutput).not.toContain("R@1");
    expect(environment.evidence.diagnosticOutput).not.toContain("N\t8");
    expect(environment.sources.map(({ claimId }) => claimId)).not.toContain(
      "demo.run.output"
    );
    expect(environment.sources.map(({ claimId }) => claimId)).toEqual(
      expect.arrayContaining([
        "demo.setup.command",
        "demo.setup.diagnostic"
      ])
    );
  });

  it.each([
    "verified_demo_run",
    "verified_seed_modified_by_learner",
    "learner_entered"
  ] as const)("preserves %s provenance in derived comparison evidence", (provenance) => {
    const v1Project = projectSchema.parse(frozenProjectV1Json);
    const comparison = deriveComparisonEvidence(demoFixture, {
      ...v1Project.evidence,
      provenance
    });

    expect(comparison.provenance).toBe(provenance);
  });

  it("resolves every newly curated field to a registered source locator", () => {
    const newCuratedSources = [
      ...demoFixture.observedSetup.setupCommand.sources,
      ...demoFixture.observedSetup.diagnosticOutput.sources,
      ...demoFixture.observedRun.localMetric.sources,
      ...demoFixture.map.benchmarkGapImpact.sources.filter(
        ({ claimId }) => claimId === "demo.gap.claim-impact"
      )
    ];

    newCuratedSources.forEach((source) => {
      expect(sourceRegister).toContain(`| \`${source.claimId}\``);
      expect(sourceRegister).toContain(source.locator);
    });
  });
});
