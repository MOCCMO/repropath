# Three-Minute Demo Script

## Before the timer

Open the curated project and choose **Reset curated demo**. Confirm the reset so the reviewed schema-version-2 seed, `0.875` local result, verified-demo provenance, curated AG News gap, and empty learner notes are restored.

## 0:00–0:30 — Start with a bounded case

From Intake, open the curated fastText project. Explain that ReproPath uses a fixed reproduction protocol, sourced facts, and browser-only persistence; it requires no account, API key, or paid runtime.

## 0:30–0:55 — Establish the claim boundary

Open the Reproduction Map. Contrast the paper's benchmark with the project-authored mini-news teaching fixture. The target is a method-level smoke test, not a claim that the paper benchmark was reproduced.

## 0:55–1:25 — Inspect the reviewed foundation

Open checkpoints 1–4 from the seven-item rail. Point out their read-only evidence, source links, provenance labels, success criteria, and verified statuses. The learner can inspect curated facts but cannot edit them.

## 1:25–2:00 — Demonstrate evidence gating

Open checkpoint 5, **Run the minimal target**; the page should say **5 of 7**. Remove the evaluation command or local result. Show that checkpoint 5 becomes incomplete, checkpoint 6 becomes locked, and Continue is unavailable. Restore the seeded value and show checkpoint 5 return to verified with **Verified seed modified by learner** provenance.

## 2:00–2:25 — Show derived comparison and honest gaps

Continue to checkpoint 6. Show that paper/local datasets, paper/local metrics, results, comparison basis, explanation, and provenance are derived from recorded evidence. Continue to checkpoint 7 and show the curated AG News gap plus its impact: it blocks a paper-benchmark claim while leaving the bounded smoke-test claim intact. Optionally add a short learner note.

## 2:25–2:50 — Generate Passport v2

Open Passport. Show the executive status, seven-checkpoint table, environment and execution evidence, structured comparison, gap impacts, grouped missing evidence, and separate method-target and paper-benchmark claim boundaries.

Download both Markdown and JSON. Explain that both exports come from the same validated Passport version-2 object.

## 2:50–3:00 — Close and reset

Close with: “ReproPath records what was attempted, the evidence for each checkpoint, and exactly what remains unsupported.” Reset the curated demo after the rehearsal so the next run starts from the reviewed seed.
