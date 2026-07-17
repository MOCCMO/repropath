# Reproduction Protocol

## First-slice target

Run the official fastText supervised-classification workflow on a small project-authored dataset and record enough evidence to verify that the method-level target completed.

This is not a reproduction of the AG News benchmark. The Passport must retain that gap even when the method-level target succeeds.

## Required checkpoint evidence

The single `run-minimal-target` checkpoint requires:

1. environment summary;
2. training command;
3. evaluation command;
4. log excerpt containing a completed evaluation;
5. numeric local result; and
6. explicit confirmation that the result belongs to mini-news, not AG News.

Notes are optional. Required text fields are trimmed before validation. The result must be a finite number in `[0, 1]` because fastText reports P@1 as a proportion.

## Status derivation

- `in_progress`: no failure is recorded and some required evidence exists.
- `insufficient_evidence`: no evidence, or required evidence remains missing when a Passport is requested.
- `minimal_target_reproduced`: all evidence is valid and the observed run completed.
- `not_reproduced`: the learner explicitly records a failed run.

Users do not type or select the final reproduction status. It is derived from evidence.

## Comparison rule

`comparisonBasis` is always `not_comparable` in the first slice because the paper result is for AG while the local result is for project-authored mini-news data. No delta, tolerance, or pass/fail comparison is computed.

## Provenance vocabulary

Curated factual values use:

- `paper`: fact checked against the published paper.
- `repository`: fact checked against the pinned official repository.
- `verified_demo_run`: command or result directly observed during project validation.

Checkpoint evidence uses an independent three-state provenance model:

- `verified_demo_run`: the untouched evidence seeded from the observed demo run.
- `learner_entered`: evidence authored by a learner rather than seeded from the demo.
- `verified_seed_modified_by_learner`: seeded evidence after any learner edit.

Curated verification is `source_checked`; observed commands/results are `run_observed`.
