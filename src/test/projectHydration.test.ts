import { describe, expect, it } from "vitest";
import frozenProjectV1Json from "./fixtures/project-v1-frozen.json";
import {
  CURATED_BENCHMARK_GAP_ID,
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
    expect(comparison.localMetric).toBe("P@1");
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
      description: demoFixture.map.benchmarkGap.value
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

  it("preserves modified run provenance and marks the mixed comparison honestly", () => {
    const modifiedV1 = {
      ...frozenProjectV1Json,
      evidence: {
        ...frozenProjectV1Json.evidence,
        localResult: 0.75,
        provenance: "verified_seed_modified_by_learner" as const
      }
    };
    const hydrated = hydrateProjectV1ToV2(modifiedV1, demoFixture);

    expect(
      hydrated.checkpoints["run-minimal-target"].evidence.provenance
    ).toBe("verified_seed_modified_by_learner");
    expect(hydrated.checkpoints["run-minimal-target"].evidence.localResult).toBe(
      0.75
    );
    expect(hydrated.checkpoints["compare-results"].evidence.provenance).toBe(
      "verified_seed_modified_by_learner"
    );
  });
});
