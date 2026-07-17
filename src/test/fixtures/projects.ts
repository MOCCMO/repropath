import fastTextDemoJson from "../../data/fasttext-demo.json";
import { curatedDemoSchema } from "../../domain/schemas";
import {
  createProjectFromDemo,
  projectReducer
} from "../../state/projectReducer";

export const demoFixture = curatedDemoSchema.parse(fastTextDemoJson);
export const fixedTimestamp = "2026-07-17T08:00:00.000Z";

export function verifiedProjectFixture() {
  return createProjectFromDemo(demoFixture, fixedTimestamp);
}

export function modifiedSeedProjectFixture() {
  const project = verifiedProjectFixture();
  return projectReducer(
    { project },
    {
      type: "update_evidence",
      patch: { notes: "Learner added a note." },
      now: "2026-07-17T08:01:00.000Z"
    }
  ).project!;
}

export function learnerEnteredProjectFixture() {
  const project = verifiedProjectFixture();
  project.evidence.provenance = "learner_entered";
  return project;
}
