# Reproduction Protocol

## Reproduction target

Run the official fastText supervised-classification workflow on a small project-authored dataset and record enough evidence to verify that the method-level target completed.

This is not a reproduction of the AG News benchmark. The Passport must retain that gap even when the method-level target succeeds.

## Seven-checkpoint protocol

The approved protocol order is:

1. `understand-task` — sourced paper task, minimal target, expected output, and scope boundary;
2. `connect-repository` — official repository, pinned commit, and relevant components;
3. `confirm-data-and-metric` — paper dataset and metric, local dataset, scope confirmation, and comparison basis;
4. `prepare-environment` — environment, pinned commit, readiness evidence, and readiness outcome;
5. `run-minimal-target` — environment, commands, evaluation log, local result, run outcome, and dataset-scope confirmation;
6. `compare-results` — paper and local results, datasets, metrics, comparison basis, and explanation;
7. `record-gaps` — the existing AG News boundary plus learner notes and additional gaps.

Checkpoints 1 through 4 are seeded as verified curated evidence. Checkpoint 5 preserves the verified editable run from the first milestone. Checkpoint 6 is derived from sourced paper facts and checkpoint 5 wherever possible. Checkpoint 7 starts with the sourced AG News gap and remains extensible.

The current domain-review stage does not yet replace the one-checkpoint page or add navigation. Those changes follow only after this domain contract is reviewed.

### Run checkpoint requirements

`run-minimal-target` requires:

1. environment summary;
2. training command;
3. evaluation command;
4. log excerpt containing a completed evaluation;
5. numeric local result; and
6. explicit confirmation that the result belongs to mini-news, not AG News.

Notes are optional. Required text fields are trimmed before validation. The result must be a finite number in `[0, 1]` because fastText reports P@1 as a proportion.

## Checkpoint status derivation

- `not_started`: no substantive evidence has been recorded for an available checkpoint.
- `in_progress`: some evidence exists, but the checkpoint evidence gate is incomplete.
- `verified`: every required field is valid and any checkpoint-specific success condition is satisfied.
- `blocked`: a prerequisite is not verified, environment readiness is blocked, or the recorded run failed.

Checkpoint status is never stored as learner-authored evidence. It is derived from the checkpoint record and the ordered prerequisite graph.

## Project status derivation

- `insufficient_evidence`: no substantive protocol evidence is present.
- `in_progress`: some protocol evidence is present but at least one checkpoint is not verified.
- `not_reproduced`: the learner explicitly records a failed minimal-target run.
- `minimal_target_reproduced`: all seven checkpoint gates are verified and the minimal-target run succeeded.

Users do not type or select the final reproduction status. It is derived from evidence.

An unresolved benchmark gap does not turn a successful method-level run into a failed run. Checkpoint 7 is verified when the gap is honestly recorded; the Passport continues to state that the paper benchmark was not reproduced.

## Prerequisites and locked states

Each checkpoint after the first depends on the immediately preceding checkpoint. A checkpoint with an incomplete prerequisite derives `blocked`. The navigation layer will use the same status map to identify the first incomplete checkpoint and the prerequisite link; it must not infer a separate lock state.

## Comparison rule

`comparisonBasis` is always `not_comparable` for the curated case because the paper result is for AG while the local result is for project-authored mini-news data. No delta, tolerance, or pass/fail comparison is computed.

## Persistence boundary

The full protocol uses schema version 2. A narrow adapter accepts the frozen version-1 project shape and:

- preserves the `run-minimal-target` evidence object and its provenance values;
- seeds checkpoints 1 through 4 from the existing sourced demo data;
- derives checkpoint 6 from the paper, metric, dataset-scope, and run evidence;
- creates one deterministic `ag-news-benchmark-gap` record for checkpoint 7; and
- returns an already-valid version-2 project unchanged on repeated hydration.

This adapter is not a general migration framework and does not implement corrupt-storage recovery.

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
