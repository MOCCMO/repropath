# Mini-news teaching data

`mini-news.train.txt` and `mini-news.test.txt` are project-authored teaching fixtures created for ReproPath. They use fastText's supervised text format: each line starts with a `__label__` value followed by the document text.

The fixture contains two deliberately separable topics, `science` and `sports`, so a learner can verify the training/evaluation workflow quickly on a CPU.

## Important scope boundary

- This is not AG News.
- It is not copied or sampled from the paper's datasets.
- Its P@1 value cannot be compared with the paper's AG test accuracy.
- A successful run verifies only the minimal method-level target.

The text is released under the repository's MIT license.

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
