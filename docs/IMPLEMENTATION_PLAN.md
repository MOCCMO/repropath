# ReproPath First Vertical Slice

## Approved full-protocol domain stage

The first vertical slice is frozen on `main`. Work on `feat/full-reproduction-protocol` proceeds through Draft PR review and Vercel Preview deployments only; the production alias remains unchanged.

The first reviewed stage after the frozen milestone is limited to:

- seven checkpoint schemas and ordered definitions;
- curated evidence seeding for checkpoints 1 through 4;
- the editable seeded run as checkpoint 5;
- derived comparison evidence for checkpoint 6;
- the seeded, extensible AG News gap for checkpoint 7;
- deterministic checkpoint and project status rules; and
- one narrow, idempotent version-1 to version-2 hydration adapter.

Checkpoint pages, route handling, locked-state UI, and navigation remain excluded until this domain layer is reviewed.

The domain evidence contract distinguishes setup validation from model evaluation: checkpoint 4 uses the observed pinned checkout/build command and its diagnostic outcome, while checkpoint 5 owns the training/evaluation commands and `P@1` output. Data confirmation records paper and local metrics separately, and every reproduction gap states its impact on the permissible claim.

## Objective

Deliver a reviewable, three-minute vertical workflow for the curated fastText case:

`Intake -> Reproduction map -> Run minimal target -> Reproduction Passport`

This slice records evidence supplied by the learner. It does not execute repositories or download benchmark datasets in the browser.

## Priority boundary

- **P0 in this slice:** curated workflow, sourced facts, one evidence-gated checkpoint, deterministic status, browser persistence, Markdown/JSON Passport export, production build, Vercel configuration, setup documentation, and demo readiness.
- **P1 after review:** custom-project intake, reset behavior, friendly route recovery, and broader component/e2e coverage.
- **P2:** storage migrations, corrupt-storage backup, exhaustive Playwright coverage, and detailed mobile optimization.

Implementation stops after the first-slice report. The other six checkpoints must not be added before review.

## Evidence boundary

- Every curated factual value must cite a source URL and locator.
- The generated visual concepts govern layout only. Their factual text, citations, commands, numbers, and results are prohibited sources.
- The bundled mini-news files are project-authored teaching data, not AG News.
- A mini-news score cannot be compared numerically with the paper's AG News score.
- A local result may be seeded only after its exact command and output have been observed against the pinned repository revision.

## Complete proposed tree

```text
repropath/
├── README.md
├── LICENSE
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
├── playwright.config.ts                 # P1/P2
├── vercel.json
├── index.html
├── docs/
│   ├── IMPLEMENTATION_PLAN.md
│   ├── DEMO_SOURCE_REGISTER.md
│   ├── REPRODUCTION_PROTOCOL.md
│   ├── FIRST_SLICE_REVIEW_CHECKLIST.md
│   └── DEMO_SCRIPT.md
├── public/demo/
│   ├── README.md
│   ├── mini-news.train.txt
│   └── mini-news.test.txt
├── src/
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── app/{App.tsx,AppShell.tsx,paths.ts,routes.tsx}
│   ├── components/{StepProgress.tsx,EvidenceStatus.tsx,FormField.tsx,formFieldIds.ts,StatusSummary.tsx}
│   ├── data/fasttext-demo.json
│   ├── domain/{schemas.ts,checkpointRules.ts,reproductionStatus.ts,passportGenerator.ts}
│   ├── features/intake/IntakePage.tsx
│   ├── features/reproduction-map/ReproductionMapPage.tsx
│   ├── features/checkpoints/{CheckpointWorkspacePage.tsx,CheckpointEvidenceForm.tsx}
│   ├── features/passport/{PassportPage.tsx,PassportDownloadButtons.tsx}
│   ├── state/{ProjectProvider.tsx,projectContext.ts,projectReducer.ts,storage.ts}
│   ├── styles/{tokens.css,global.css,utilities.css}
│   └── test/
│       ├── setup.ts
│       ├── fixtures/projects.ts
│       ├── checkpointRules.test.ts
│       ├── reproductionStatus.test.ts
│       ├── passportGenerator.test.ts
│       ├── projectReducer.test.ts
│       ├── storage.test.ts
│       └── curatedVerticalSlice.test.tsx
└── e2e/                              # Added after first-slice review
```

## Verification gate

The slice is reviewable only after `typecheck`, `lint`, unit/component tests, and production build pass and the final repository status is reported without creating a commit.
