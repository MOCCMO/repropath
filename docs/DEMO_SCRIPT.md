# Build Week Demo Script — Under Three Minutes

## Before the timer

Open the curated project and choose **Reset curated demo**. Confirm the reset so the reviewed schema-version-2 seed, `0.875` local result, verified-demo provenance, curated AG News gap, and empty learner notes are restored.

Use the production application at <https://repropath.vercel.app>.

## 0:00–0:25 — Start with a bounded case

From Intake, open the curated fastText project. Explain that ReproPath uses a fixed reproduction protocol, sourced facts, and browser-only persistence; it requires no account, API key, or paid runtime.

## 0:25–0:45 — Establish the claim boundary

Open the Reproduction Map. Contrast the paper's benchmark with the project-authored mini-news teaching fixture. The target is a method-level smoke test, not a claim that the paper benchmark was reproduced.

## 0:45–1:05 — Inspect the reviewed foundation

Open checkpoints 1–4 from the seven-item rail. Point out their read-only evidence, source links, provenance labels, success criteria, and verified statuses. The learner can inspect curated facts but cannot edit them.

## 1:05–1:35 — Demonstrate evidence gating

Open checkpoint 5, **Run the minimal target**; the page should say **5 of 7**. Remove the evaluation command or local result. Show that checkpoint 5 becomes incomplete, checkpoint 6 becomes locked, and Continue is unavailable. Restore the seeded value and show checkpoint 5 return to verified with **Verified seed modified by learner** provenance.

Clarify that local `P@1` is a proportion: `0.875` means 87.5%, not 0.875%.

## 1:35–2:00 — Show derived comparison and honest gaps

Continue to checkpoint 6. Show that paper/local datasets, paper/local metrics, results, comparison basis, explanation, and provenance are derived from recorded evidence. Continue to checkpoint 7 and show the curated AG News gap plus its impact: it blocks a paper-benchmark claim while leaving the bounded smoke-test claim intact. Optionally add a short learner note.

## 2:00–2:35 — Generate Passport v2

Open Passport. Show the executive status, seven-checkpoint table, environment and execution evidence, structured comparison, gap impacts, grouped missing evidence, and separate method-target and paper-benchmark claim boundaries.

Download both Markdown and JSON. Explain that both exports come from the same validated Passport version-2 object.

Briefly state that GPT-5.6 Thinking supported scoping and review, while Codex implemented, tested, reviewed, documented, and deployed the React application. Neither is integrated into the production runtime.

## 2:35–2:50 — Close and reset

Close with: “ReproPath records what was attempted, the evidence for each checkpoint, and exactly what remains unsupported.” Reset the curated demo after the rehearsal so the next run starts from the reviewed seed.
