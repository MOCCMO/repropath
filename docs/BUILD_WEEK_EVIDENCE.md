# ReproPath Build Week Release Evidence

This document is the pre-merge evidence register for ReproPath's curated seven-checkpoint protocol. It records what has been verified without implying that Draft PR #1 has been merged or that the full protocol has replaced the public production baseline.

## Repository state

- Repository: <https://github.com/MOCCMO/repropath>
- Frozen baseline commit: `9553013d4b5042131a9be08a8c110da42f74ed62`
- Feature branch: `feat/full-reproduction-protocol`
- Draft PR: <https://github.com/MOCCMO/repropath/pull/1>
- Public production baseline: <https://repropath.vercel.app> — Vercel target `production`, status `Ready`, frozen first vertical slice
- Full-protocol Preview: <https://repropath-full-protocol-preview.vercel.app> — feature Preview only, not the production alias

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

The documentation commit containing this evidence file is listed in the final task report after it is created.

## Verification commands

```bash
npm ci
npm run typecheck
npm run lint
npm run test -- --run
npm run build
git diff --check main...HEAD
git status --short --branch
```

The final pre-merge local test run passes **11 test files and 78 tests**. GitHub Actions runs the same verification sequence on pull requests and pushes to `main` using Node.js 22 and npm caching.

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

## Codex contribution summary

Codex supported the project across four reviewed phases:

- product and implementation planning, scope control, and acceptance gates;
- application, domain, persistence, routing, Passport, and recovery implementation;
- focused unit/component testing, production builds, CI configuration, browser QA, and Vercel Preview preparation;
- iterative review corrections for factual provenance, evidence completeness, invalid-draft safety, hydration idempotence, reset persistence feedback, accessibility, and responsive legibility.

Human review approved each milestone before the next stage began. Codex did not supply paper-benchmark results, replace source verification, run arbitrary learner repositories in the browser, or broaden the project into automatic analysis or a paid API workflow.

## Final `/feedback` Session ID

**Not recorded yet.** After the final review, run `/feedback` in this same Codex task and record the returned Session ID here. Do not substitute a thread ID, commit SHA, PR number, or invented placeholder.

## Still required for Devpost submission

- complete the final review and decide whether Draft PR #1 is ready to mark Ready for review;
- run `/feedback` in this Codex task and record the real Session ID above;
- merge and promote the full protocol only after explicit approval;
- update the final public deployment evidence after promotion;
- record the final three-minute demo video using the reviewed script;
- select final screenshots and prepare the concise project description and claim boundary for Devpost;
- confirm that the public repository, setup instructions, sample teaching data, license, and deployment link are accessible;
- submit the required Devpost materials before the user-provided deadline of July 21 at 5 PM Pacific Time.

Custom intake, automatic PDF/repository analysis, backend services, model/API integration, authentication, and a major visual redesign remain outside this release.
