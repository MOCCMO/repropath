# ReproPath

ReproPath is an Education-track web application for first-time NLP learners. It turns a paper-to-code reproduction attempt into a fixed, evidence-gated protocol and an exportable Reproduction Passport.

The current curated workflow guides a learner through seven ordered checkpoints:

1. Understand the task
2. Connect the repository
3. Confirm data and metric
4. Prepare the environment
5. Run the minimal target
6. Compare results
7. Record gaps

The demo uses *Bag of Tricks for Efficient Text Classification* and the official fastText repository. Checkpoints 1–4 contain read-only reviewed evidence, checkpoint 5 is a seeded editable run record, checkpoint 6 is derived from the recorded evidence, and checkpoint 7 preserves the paper-benchmark gap while allowing learner notes and additional gaps.

## What the workspace proves

- Every curated paper and repository claim carries a source URL or repository locator.
- Later checkpoints remain locked until their prerequisites are verified.
- Checkpoint and project statuses are derived; a learner cannot select a successful outcome directly.
- Removing required checkpoint 5 evidence immediately removes verification and updates checkpoint 6.
- Evidence labels distinguish an untouched verified demo run, learner-entered evidence, and a verified seed modified by a learner.
- Browser state survives refresh, including learner notes and valid additional gaps.
- A confirmed **Reset curated demo** action restores the reviewed version-2 seed without clearing unrelated browser storage.
- One Passport version-2 object drives both the on-screen preview and Markdown/JSON downloads.
- The Passport includes all seven checkpoint records, comparison data, structured gaps, missing evidence, and explicit method-versus-benchmark claim boundaries.

ReproPath does not execute arbitrary repositories in the browser. The bundled mini-news files are project-authored teaching fixtures, not AG News, so the observed `0.875` local result supports only the bounded method-level smoke test. It does not reproduce the paper's AG News benchmark.

## Run locally

Requirements: Node.js 22 or newer and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. No environment variables, API keys, backend, account, or paid runtime dependency are required.

## Verify

```bash
npm run typecheck
npm run lint
npm run test -- --run
npm run build
```

To inspect the production build locally:

```bash
npm run preview
```

## Curated case and sources

The demo is based on *Bag of Tricks for Efficient Text Classification* by Armand Joulin, Edouard Grave, Piotr Bojanowski, and Tomas Mikolov, and the official fastText repository revision pinned in the source register.

- [Curated claim register](docs/DEMO_SOURCE_REGISTER.md)
- [Protocol and status rules](docs/REPRODUCTION_PROTOCOL.md)
- [Implementation boundaries](docs/IMPLEMENTATION_PLAN.md)
- [Three-minute demo](docs/DEMO_SCRIPT.md)

No copyrighted paper file, paper benchmark dataset, generated mockup asset, secret, or credential is included.

## Persistence and reset

The application stores one curated project in browser `localStorage`. A narrow, idempotent adapter opens projects created by the frozen first milestone as valid schema-version-2 projects while preserving checkpoint 5 evidence and provenance. Invalid drafts remain visible in the form but do not overwrite the last valid stored project.

Use **Reset curated demo** before a rehearsal. After confirmation it replaces only the ReproPath project key with a fresh reviewed schema-version-2 project, restores the observed local result to `0.875`, removes learner notes and learner-created gaps, and leaves unrelated browser storage untouched.

## Passport version 2

Passport exports include generation and project timestamps, project/paper/repository metadata, the minimal target, deterministic project status, seven ordered checkpoint records, structured comparison data, structured gaps, learner notes, grouped missing evidence, source references, and the explicit claim boundary. Markdown and JSON are rendered from the same validated Passport object.

## Deployment

The application builds to `dist/` and includes a Vercel SPA rewrite so direct checkpoint-route refreshes resolve correctly. Import the repository into Vercel with `npm run build` as the build command and `dist` as the output directory. No environment variables or API keys are required.

## Current limitations

- One curated fastText project only; there is no custom paper intake.
- Curated evidence is reviewed and read-only, but ReproPath does not independently authenticate learner-pasted commands or logs.
- The browser does not run fastText or analyze papers and repositories automatically.
- No backend, model/API integration, authentication, multi-user storage, or general migration framework.
- Browser storage is device-local; advanced recovery and storage migration remain out of scope.
- Detailed mobile refinement and exhaustive browser coverage remain future work.

These boundaries are deliberate: the current release prioritizes a complete, auditable three-minute reproduction workflow.
