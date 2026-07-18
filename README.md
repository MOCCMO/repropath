# ReproPath

ReproPath is an Education-track web application for first-time NLP learners. It turns a paper-to-code reproduction attempt into a fixed, evidence-gated protocol and an exportable Reproduction Passport.

- **Public production application:** [repropath.vercel.app](https://repropath.vercel.app) — the complete seven-checkpoint workspace is live in production.
- **Final main commit:** [`f71eb25c453fe7620d5301ebec00a4375696e400`](https://github.com/MOCCMO/repropath/commit/f71eb25c453fe7620d5301ebec00a4375696e400)
- **Merged PR:** [#1 — complete ReproPath seven-checkpoint protocol workspace](https://github.com/MOCCMO/repropath/pull/1)

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

The final release verification passes **11 test files and 78 tests**. GitHub Actions repeats the same commands with Node.js 22 and npm caching on every pull request and every push to `main`; superseded runs are cancelled. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) and the [successful final main run](https://github.com/MOCCMO/repropath/actions/runs/29590269107).

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
- [Build Week release evidence](docs/BUILD_WEEK_EVIDENCE.md)

No copyrighted paper file, paper benchmark dataset, generated mockup asset, secret, or credential is included.

## Persistence and reset

The application stores one curated project in browser `localStorage`. A narrow, idempotent adapter opens projects created by the frozen first milestone as valid schema-version-2 projects while preserving checkpoint 5 evidence and provenance. Invalid drafts remain visible in the form but do not overwrite the last valid stored project.

Use **Reset curated demo** before a rehearsal. After confirmation it replaces only the ReproPath project key with a fresh reviewed schema-version-2 project, restores the observed local result to `0.875`, removes learner notes and learner-created gaps, and leaves unrelated browser storage untouched.

## Passport version 2

Passport exports include generation and project timestamps, project/paper/repository metadata, the minimal target, deterministic project status, seven ordered checkpoint records, structured comparison data, structured gaps, learner notes, grouped missing evidence, source references, and the explicit claim boundary. Markdown and JSON are rendered from the same validated Passport object.

When the local metric is `P@1`, ReproPath stores and displays it as a proportion: `0.875` means 87.5%, not 0.875%. The paper result retains its own stored metric and unit, and the Passport does not calculate a misleading delta across non-comparable datasets or metrics.

## Deployment

The application builds to `dist/` and includes a Vercel SPA rewrite so direct checkpoint-route refreshes resolve correctly. Import the repository into Vercel with `npm run build` as the build command and `dist` as the output directory. No environment variables or API keys are required.

The complete seven-checkpoint workspace from final main commit `f71eb25c453fe7620d5301ebec00a4375696e400` is deployed at [repropath.vercel.app](https://repropath.vercel.app). PR #1 is merged. The repository CI workflow does not contain Vercel credentials or deployment steps.

## How Codex and GPT-5.6 were used

GPT-5.6 Thinking supported product scoping, research-boundary review, milestone critique, evidence-contract review, and submission planning.

Codex implemented, tested, reviewed, documented, and deployed the React application through the primary build task. Human review controlled every stage boundary and kept sourced facts, observed run evidence, and unsupported claims distinct.

GPT-5.6 Thinking was part of the development and review workflow. The production application does not call GPT-5.6 at runtime and has no model or API integration.

The final Codex `/feedback` Session ID was generated and stored privately. It is intentionally not included in this public repository.

## Current limitations

- One curated fastText project only; there is no custom paper intake.
- Curated evidence is reviewed and read-only, but ReproPath does not independently authenticate learner-pasted commands or logs.
- The browser does not run fastText or analyze papers and repositories automatically.
- No backend, model/API integration, authentication, multi-user storage, or general migration framework.
- Browser storage is device-local; advanced recovery and storage migration remain out of scope.
- Responsive QA covers the primary 1440, 1024, 768, and 390 px layouts, but exhaustive cross-browser and device coverage remains out of scope.

These boundaries are deliberate: the current release prioritizes a complete, auditable three-minute reproduction workflow.
