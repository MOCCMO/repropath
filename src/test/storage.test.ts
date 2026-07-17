import { beforeEach, describe, expect, it } from "vitest";
import { loadProject, saveProject, STORAGE_KEY } from "../state/storage";
import { verifiedProjectFixture } from "./fixtures/projects";

describe("project browser persistence", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a valid project", () => {
    const project = verifiedProjectFixture();
    saveProject(project);
    expect(loadProject()).toEqual(project);
  });

  it("returns null for malformed stored data without overwriting it", () => {
    localStorage.setItem(STORAGE_KEY, "{not-json");
    expect(loadProject()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("{not-json");
  });

  it("declines an invalid draft without throwing or replacing valid storage", () => {
    const validProject = verifiedProjectFixture();
    expect(saveProject(validProject)).toBe(true);

    const invalidDraft = verifiedProjectFixture();
    invalidDraft.evidence.localResult = 2;

    expect(() => saveProject(invalidDraft)).not.toThrow();
    expect(saveProject(invalidDraft)).toBe(false);
    expect(loadProject()).toEqual(validProject);
  });
});
