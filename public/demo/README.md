# Mini-news teaching data

`mini-news.train.txt` and `mini-news.test.txt` are project-authored teaching fixtures created for ReproPath. They use fastText's supervised text format: each line starts with a `__label__` value followed by the document text.

The fixture contains two deliberately separable topics, `science` and `sports`, so a learner can verify the training/evaluation workflow quickly on a CPU.

## Important scope boundary

- This is not AG News.
- It is not copied or sampled from the paper's datasets.
- Its P@1 value cannot be compared with the paper's AG test accuracy.
- A successful run verifies only the minimal method-level target.
- The remaining AG News gap prevents a paper-benchmark reproduction claim while leaving the method-level smoke-test claim valid.

The text is released under the repository's MIT license.

## Observed checkout and build validation

The first milestone cloned the official fastText repository into an isolated `/private/tmp` directory, then ran this setup/build command from the checkout. The temporary path is omitted because it is not part of the command:

```text
git checkout 1142dc4c4ecbc19cc16eee5cdd28472e689267e6 && make
```

The command completed successfully with exit status 0. The checkout reported `HEAD is now at 1142dc4 Delete .circleci directory (#1366)`, and the final build step linked `src/main.cc` and the compiled objects to `fasttext`. Apple clang emitted warnings about implicitly deleted defaulted functions, but they were non-fatal.

This setup/build outcome is the environment-readiness diagnostic. The later `N`, `P@1`, and `R@1` evaluation output is run evidence and is not used to establish environment readiness.

## Observed validation run

On 2026-07-17, the fixture was run twice against official fastText commit `1142dc4c4ecbc19cc16eee5cdd28472e689267e6` on macOS 26.5.1 ARM64 using Apple clang 21.0.0. Both runs produced:

```text
N       8
P@1     0.875
R@1     0.875
```

Training parameters:

```text
-dim 10 -lr 0.25 -wordNgrams 2 -minCount 1 -bucket 10000 -epoch 25 -thread 1 -loss softmax
```

These observations support the seeded method-level evidence only. They do not establish an AG News result.
