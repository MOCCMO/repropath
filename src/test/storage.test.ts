import { beforeEach, describe, expect, it } from "vitest";
import { loadProject, saveProject, STORAGE_KEY } from "../state/storage";
import frozenProjectV1Json from "./fixtures/project-v1-frozen.json";
import {
  verifiedFullProtocolProjectFixture
} from "./fixtures/projects";

describe("project browser persistence", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a valid project", () => {
    const project = verifiedFullProtocolProjectFixture();
    saveProject(project);
    expect(loadProject()).toEqual(project);
  });

  it("keeps a v2 project stable across repeated reloads", () => {
    const project = verifiedFullProtocolProjectFixture();
    expect(saveProject(project)).toBe(true);

    const firstReload = loadProject();
    const secondReload = loadProject();

    expect(firstReload).toEqual(project);
    expect(secondReload).toEqual(firstReload);
    expect(secondReload?.schemaVersion).toBe(2);
  });

  it("returns null for malformed stored data without overwriting it", () => {
    localStorage.setItem(STORAGE_KEY, "{not-json");
    expect(loadProject()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("{not-json");
  });

  it("declines an invalid draft without throwing or replacing valid storage", () => {
    const validProject = verifiedFullProtocolProjectFixture();
    expect(saveProject(validProject)).toBe(true);

    const invalidDraft = verifiedFullProtocolProjectFixture();
    invalidDraft.checkpoints["run-minimal-target"].evidence.localResult = 2;

    expect(() => saveProject(invalidDraft)).not.toThrow();
    expect(saveProject(invalidDraft)).toBe(false);
    expect(loadProject()).toEqual(validProject);
  });

  it("hydrates a frozen v1 project from the production storage key", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(frozenProjectV1Json));

    const project = loadProject();

    expect(project?.schemaVersion).toBe(2);
    expect(project?.checkpoints["run-minimal-target"].evidence).toEqual(
      frozenProjectV1Json.evidence
    );
  });
});
