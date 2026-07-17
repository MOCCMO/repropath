import { projectSchema, type Project } from "../domain/schemas";

export const STORAGE_KEY = "repropath:v1:projects";

export function loadProject(storage: Storage = localStorage): Project | null {
  const stored = storage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return projectSchema.parse(JSON.parse(stored));
  } catch {
    return null;
  }
}

export function saveProject(
  project: Project,
  storage: Storage = localStorage
): boolean {
  const parsed = projectSchema.safeParse(project);
  if (!parsed.success) return false;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(parsed.data));
    return true;
  } catch {
    return false;
  }
}
