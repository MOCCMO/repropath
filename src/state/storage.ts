import fastTextDemoJson from "../data/fasttext-demo.json";
import { fullProtocolProjectSchema, type FullProtocolProject } from "../domain/fullProtocolSchemas";
import { hydrateProjectV1ToV2 } from "../domain/projectHydration";
import { curatedDemoSchema } from "../domain/schemas";

export const STORAGE_KEY = "repropath:v1:projects";
const demo = curatedDemoSchema.parse(fastTextDemoJson);

export type StorageResult<T> =
  | { ok: true; value: T }
  | {
      ok: false;
      value: null;
      reason: "invalid_project" | "storage_unavailable";
    };

export function loadProjectResult(
  storage: Storage = localStorage
): StorageResult<FullProtocolProject | null> {
  let stored: string | null;
  try {
    stored = storage.getItem(STORAGE_KEY);
  } catch {
    return { ok: false, value: null, reason: "storage_unavailable" };
  }
  if (!stored) return { ok: true, value: null };
  try {
    return {
      ok: true,
      value: hydrateProjectV1ToV2(JSON.parse(stored), demo)
    };
  } catch {
    return { ok: false, value: null, reason: "invalid_project" };
  }
}

export function loadProject(
  storage: Storage = localStorage
): FullProtocolProject | null {
  return loadProjectResult(storage).value;
}

export function saveProjectResult(
  project: FullProtocolProject,
  storage: Storage = localStorage
): StorageResult<FullProtocolProject> {
  const parsed = fullProtocolProjectSchema.safeParse(project);
  if (!parsed.success) {
    return { ok: false, value: null, reason: "invalid_project" };
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(parsed.data));
    return { ok: true, value: parsed.data };
  } catch {
    return { ok: false, value: null, reason: "storage_unavailable" };
  }
}

export function saveProject(
  project: FullProtocolProject,
  storage: Storage = localStorage
): boolean {
  return saveProjectResult(project, storage).ok;
}
