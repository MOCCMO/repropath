# ReproPath Build Week Release Evidence

This document is the final release evidence register for ReproPath's curated seven-checkpoint protocol.

## Repository state

- Repository: <https://github.com/MOCCMO/repropath>
- Final main and merge commit: `f71eb25c453fe7620d5301ebec00a4375696e400`
- Merged PR: <https://github.com/MOCCMO/repropath/pull/1>
- Public production application: <https://repropath.vercel.app> — complete seven-checkpoint workspace
- Successful final main CI: <https://github.com/MOCCMO/repropath/actions/runs/29590269107>

## Important milestone commits

- `8f3dd0f` — seven-checkpoint protocol domain
- `2bbf424` — tightened evidence contracts
- `67cafe3` — version-2 persistence and version-1 hydration integration
- `e43cb85` — checkpoint routing and navigation
- `84010c0` — checkpoint evidence views
- `c459df6` — full workspace tests
- `e276123` — structured Reproduction Passport v2
- `3fb6356` — curated demo reset and recovery
- `62a1153` — Passport and reset workflow tests
- `22948da` — reset persistence feedback correction
- `7fbd73e` — restrained responsive, accessibility, and metric-display refinement
- `71e8148` — GitHub Actions repository verification

The release history culminates in merge commit `f71eb25c453fe7620d5301ebec00a4375696e400` on `main`.

## Verification commands

```bash
npm ci
npm run typecheck
npm run lint
npm run test -- --run
npm run build
git diff --check
git status --short --branch
```

The final release verification passes **11 test files and 78 tests**. GitHub Actions runs the same verification sequence on pull requests and pushes to `main` using Node.js 22 and npm caching. Main CI run `29590269107` completed successfully.

## Production deployment evidence

The complete seven-checkpoint workspace is live at <https://repropath.vercel.app>. The production application includes prerequisite-aware checkpoint navigation, derived locked states, browser persistence, the confirmed curated-demo reset, and Passport v2 Markdown and JSON exports. No account, credentials, environment variables, API key, backend, or paid runtime dependency is required to test the public application.

## Seven-checkpoint demo evidence

1. Inspect the sourced paper task and bounded method target.
2. Inspect the pinned official repository and relevant components.
3. Confirm paper/local datasets and paper/local metrics separately.
4. Inspect the sourced checkout/build readiness evidence.
5. Remove and restore one required run item to demonstrate evidence gating.
6. Inspect the derived comparison and non-comparable basis.
7. Inspect the curated AG News gap, its claim impact, and optional learner additions.
8. Review and download the shared-object Markdown and JSON Passport v2.
9. Reset the curated demo for the next rehearsal.

For local `P@1`, `0.875` is a proportion equivalent to 87.5%; it is not 0.875%. The mini-news smoke-test result does not reproduce the paper's AG News benchmark.

## Passport v2 evidence

Passport schema version 2 records project and source timestamps, paper and repository metadata, the bounded target, deterministic project status, seven ordered checkpoint records, evidence modes and provenance, source references, missing requirements, structured comparison data, structured gaps with claim impact, learner notes, grouped missing evidence, and explicit method-target and paper-benchmark claim boundaries. Markdown and JSON derive from the same validated Passport object.

## How Codex and GPT-5.6 were used

GPT-5.6 Thinking supported product scoping, research-boundary review, milestone critique, evidence-contract review, and submission planning.

Codex implemented, tested, reviewed, documented, and deployed the React application through the primary build task. This included the application domain, persistence and hydration, checkpoint routing, Passport v2, reset and recovery, focused tests, CI configuration, browser QA, responsive refinement, and production deployment.

Human review approved each milestone before the next stage began. Codex did not supply paper-benchmark results, replace source verification, run arbitrary learner repositories in the browser, or broaden the project into automatic analysis or a paid API workflow.

GPT-5.6 Thinking and Codex were used in the development workflow. The production application does not call GPT-5.6 at runtime and has no model or API integration.

## Final `/feedback` Session ID

The final Codex `/feedback` Session ID was generated and stored privately. The ID itself is intentionally excluded from this public evidence file and repository.

## Still required for Devpost submission

- record the final under-three-minute demo video using the reviewed script;
- select final screenshots and prepare the concise project description and claim boundary for Devpost;
- confirm that the public repository, setup instructions, sample teaching data, license, and deployment link are accessible;
- submit the required Devpost materials before the user-provided deadline of July 21 at 5 PM Pacific Time.

Custom intake, automatic PDF/repository analysis, backend services, model/API integration, authentication, and a major visual redesign remain outside this release.
