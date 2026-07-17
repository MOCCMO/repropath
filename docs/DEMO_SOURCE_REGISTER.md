# Curated Demo Source Register

Verified on 2026-07-17. A claim may appear in `src/data/fasttext-demo.json` only if its claim ID appears here.

| Claim ID | Curated value | Source URL | Source locator | Consumer |
|---|---|---|---|---|
| `paper.title` | Bag of Tricks for Efficient Text Classification | https://aclanthology.org/E17-2068/ | Title and citation metadata | `paper.title` |
| `paper.authors` | Armand Joulin; Edouard Grave; Piotr Bojanowski; Tomas Mikolov | https://aclanthology.org/E17-2068/ | Citation metadata | `paper.authors` |
| `paper.venue` | EACL 2017, Short Papers, pages 427–431 | https://aclanthology.org/E17-2068/ | Anthology metadata | `paper.venue` |
| `paper.version` | ACL Anthology E17-2068 | https://aclanthology.org/E17-2068/ | Anthology identifier | `paper.version` |
| `paper.task` | Text classification; the paper evaluates sentiment analysis and tag prediction | https://aclanthology.org/E17-2068.pdf | Sections 1 and 3 | `map.paperTask` |
| `paper.ag-dataset` | AG is one of the eight sentiment-analysis datasets | https://aclanthology.org/E17-2068.pdf | Section 3.1 and Table 1, pages 428–429 | `map.paperDataset` |
| `paper.metric` | Test accuracy (%) | https://aclanthology.org/E17-2068.pdf | Table 1 caption, page 429 | `map.paperMetric` |
| `paper.ag-result` | 92.5% for fastText with hidden dimension 10 and bigrams | https://aclanthology.org/E17-2068.pdf | Table 1, `fastText, h = 10, bigram`, AG column, page 429 | `map.paperResult` |
| `repo.url` | Official fastText repository | https://github.com/facebookresearch/fastText | Repository root | `repository.url` |
| `repo.commit` | `1142dc4c4ecbc19cc16eee5cdd28472e689267e6` | https://github.com/facebookresearch/fastText/commit/1142dc4c4ecbc19cc16eee5cdd28472e689267e6 | Archived `main` HEAD verified with `git ls-remote` on 2026-07-17 | `repository.commit` |
| `repo.license` | MIT | https://github.com/facebookresearch/fastText/blob/1142dc4c4ecbc19cc16eee5cdd28472e689267e6/LICENSE | License file | `repository.license` |
| `repo.results-script` | `classification-results.sh` prepares eight datasets and runs supervised training/testing for Table 1 | https://github.com/facebookresearch/fastText/blob/1142dc4c4ecbc19cc16eee5cdd28472e689267e6/classification-results.sh | Script header, dataset arrays, training and test commands | `map.repositoryComponents[0]` |
| `repo.cli` | `supervised` trains a classifier and `test` reports P@k and R@k | https://github.com/facebookresearch/fastText/blob/1142dc4c4ecbc19cc16eee5cdd28472e689267e6/README.md | Text classification section | `map.repositoryComponents[1]` |
| `demo.dataset-scope` | Bundled mini-news data is project-authored and is not AG News | ReproPath repository file `public/demo/README.md` | Important scope boundary | `target.datasetScope` |

## Observed-run register

The following fields must stay empty until the run is completed successfully.

| Claim ID | Required observation | Repository source | Status |
|---|---|---|---|
| `demo.run.environment` | macOS 26.5.1, arm64, Apple clang 21.0.0, fastText commit `1142dc4c4ecbc19cc16eee5cdd28472e689267e6` | `public/demo/README.md`, Observed validation run | Observed twice on 2026-07-17 |
| `demo.run.train-command` | `./fasttext supervised -input <repropath>/public/demo/mini-news.train.txt -output <scratch>/repropath-mini -dim 10 -lr 0.25 -wordNgrams 2 -minCount 1 -bucket 10000 -epoch 25 -thread 1 -loss softmax` | `public/demo/README.md`, Observed validation run | Successful; paths normalized for portability |
| `demo.run.test-command` | `./fasttext test <scratch>/repropath-mini.bin <repropath>/public/demo/mini-news.test.txt` | `public/demo/README.md`, Observed validation run | Successful; paths normalized for portability |
| `demo.run.output` | `N 8`, `P@1 0.875`, `R@1 0.875` | `public/demo/README.md`, Observed validation output | Observed identically in two runs |
| `demo.run.result` | P@1 = `0.875` on mini-news | `public/demo/README.md`, Observed P@1 | Observed identically in two runs |

The raw validation ran in an isolated `/private/tmp` checkout. The paths above are normalized; parameters and values are unchanged.

## Explicit exclusions

The generated visual mockups are not listed because they are not factual sources. No values displayed inside them may be copied into curated data.
