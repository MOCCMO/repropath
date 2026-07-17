import fastTextDemoJson from "../../data/fasttext-demo.json";
import { curatedDemoSchema } from "../../domain/schemas";
import {
  createFullProtocolProjectFromDemo,
  createProjectFromDemo
} from "../../state/projectReducer";

export const demoFixture = curatedDemoSchema.parse(fastTextDemoJson);
export const fixedTimestamp = "2026-07-17T08:00:00.000Z";

export function verifiedProjectFixture() {
  return createProjectFromDemo(demoFixture, fixedTimestamp);
}

export function verifiedFullProtocolProjectFixture() {
  return createFullProtocolProjectFromDemo(demoFixture, fixedTimestamp);
}

export function modifiedSeedProjectFixture() {
  const project = verifiedProjectFixture();
  project.updatedAt = "2026-07-17T08:01:00.000Z";
  project.evidence.notes = "Learner added a note.";
  project.evidence.provenance = "verified_seed_modified_by_learner";
  return project;
}

export function learnerEnteredProjectFixture() {
  const project = verifiedFullProtocolProjectFixture();
  project.checkpoints["run-minimal-target"].evidence.provenance =
    "learner_entered";
  return project;
}
