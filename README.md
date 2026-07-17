# ReproPath

ReproPath is an Education-track web application for first-time NLP learners. It turns a paper-to-code reproduction attempt into a bounded target, evidence-gated checkpoint, and exportable Reproduction Passport.

This repository currently contains only the approved first vertical slice:

`curated fastText intake -> reproduction map -> one run checkpoint -> Passport`

## What this slice proves

- Curated paper and repository claims carry source URLs and locators.
- A checkpoint cannot be verified without all required evidence.
- Reproduction status is derived rather than selected by the learner.
- Browser state survives refresh.
- The Passport downloads as Markdown and JSON.
- The bundled mini-news data is a project-authored teaching fixture, not AG News.

ReproPath does not execute arbitrary repositories in the browser and does not claim that a mini-news result reproduces the paper's AG News benchmark.

## Run locally

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite.

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

The demo is based on *Bag of Tricks for Efficient Text Classification* by Armand Joulin, Edouard Grave, Piotr Bojanowski, and Tomas Mikolov, and the official fastText repository pinned in the source register.

- [Curated claim register](docs/DEMO_SOURCE_REGISTER.md)
- [Protocol and status rules](docs/REPRODUCTION_PROTOCOL.md)
- [First-slice boundary](docs/IMPLEMENTATION_PLAN.md)
- [Three-minute demo](docs/DEMO_SCRIPT.md)

No copyrighted paper file or benchmark dataset is included.

## Deployment

The application builds to `dist/` and includes a Vercel SPA rewrite. Import the repository into Vercel with `npm run build` as the build command and `dist` as the output directory. No environment variables or API keys are required.

## Current limitations

- One curated project only.
- One checkpoint only.
- Evidence provenance distinguishes an untouched verified seed, learner-entered evidence, and a verified seed modified by a learner. Structural validation does not prove that pasted logs are authentic.
- No custom intake, reset control, storage migration, or full mobile optimization yet.

These exclusions remain deliberate for this approved first milestone.
