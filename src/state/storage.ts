import fastTextDemoJson from "../data/fasttext-demo.json";
import { fullProtocolProjectSchema, type FullProtocolProject } from "../domain/fullProtocolSchemas";
import { hydrateProjectV1ToV2 } from "../domain/projectHydration";
import { curatedDemoSchema } from "../domain/schemas";

export const STORAGE_KEY = "repropath:v1:projects";
const demo = curatedDemoSchema.parse(fastTextDemoJson);

export function loadProject(
  storage: Storage = localStorage
): FullProtocolProject | null {
  const stored = storage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return hydrateProjectV1ToV2(JSON.parse(stored), demo);
  } catch {
    return null;
  }
}

export function saveProject(
  project: FullProtocolProject,
  storage: Storage = localStorage
): boolean {
  const parsed = fullProtocolProjectSchema.safeParse(project);
  if (!parsed.success) return false;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(parsed.data));
    return true;
  } catch {
    return false;
  }
}
