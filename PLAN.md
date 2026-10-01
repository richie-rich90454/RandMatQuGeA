# RandMatQuGeA v3 — Implementation Plan and Handoff

Branch: `version-three`. Target version: `3.0.0` (no v1/v2 work).

This file is the handoff record for the v3 overhaul. It documents **every phase, including the
completed ones**, so the next agent can tell finished work from outstanding work without re-deriving
it. Section 4 is the audit trail for what is already done — do not redo it. Section 5 is the live
work register.

Read `CODE_STYLE.md` before editing code. It is the single authority for formatting and style; where
this file and `CODE_STYLE.md` disagree, `CODE_STYLE.md` wins. Read `AGENTS.md` for repository-level
rules.

---

## 1. The two rules that are never traded away

Breaking either of these silently produces **wrong answers** rather than a build error. They are the
reason this project exists, and they are enforced by CI.

1. **A generator's printed question and its claimed answer must be the same problem.**
   A learner must be able to reproduce the key from the numbers printed on screen. The dominant cause
   of violation is *rounding something other than the printed value*: computing a slope from
   unrounded coordinates, then printing the coordinates rounded. Round once, where the value is drawn,
   and use that one rounded value in the prompt, the key, and every distractor.
2. **A Multiple Choice question must have exactly four options, exactly one of which is correct.**

Corollary that has bitten this repo repeatedly: a distractor that is *also* correct is as much a
defect as a wrong key. Check distractors against the key, including for equivalence under
normalisation (fractions, unit vectors, sign). Where a domain makes two answers genuinely identical
(e.g. a nonzero multiple of an eigenvector), that branch is rejected rather than offered.

Supporting generator rules, all of which have caused real defects here:

- **Bound every rejection/redraw loop** with an attempt counter *and* a deterministic fallback. An
  unbounded loop hangs the oracle suite instead of failing it, which is far more expensive to
  diagnose than a failing assertion.
- **LaTeX delimiters are `\( ... \)` and `\[ ... \]`.** Never bare `$` or `$$` — those are not
  delimiters in KaTeX or MathJax, so the prompt falls back to showing raw markup. Never put a
  currency symbol, a degree sign, or a unit inside a math group.
- **Angles in degrees print `^{\circ}` inside math**, never a Unicode `°`.
- **Round once.** Prefer exact answers; where a length is irrational, choose a radicand that is a
  perfect square so the answer is exact, or state the rounding in the question and round the key
  identically.
- **Use the injected `rng`**, never `Math.random`. Answers must be reproducible from the seed.
- Every generator returns the full `QuestionDto`:
  `{latex, correct, alternate, display, choices, expectedFormat}`.

## 2. Working rules

- **One changed file per commit.** Conventional commit messages, American English, with a body
  explaining *why*, not *what*. Recent history contains bundled commits; do not add more.
- **Update documentation in the same change** as the behaviour it describes.
- **Do not run the full Vitest or Playwright suites while implementation remains.** `npx tsc --noEmit`
  (~5 s) and `cd src-tauri && cargo test` are cheap and are the right checks mid-work. Full suites
  are for the end.
- **Vanilla DOM only.** No React, Vue, Svelte, or any other framework.
- **Ponytail discipline.** Reuse what exists, prefer the standard library and native platform
  features, delete over add, and no speculative abstraction with one implementation. Mark a
  deliberate shortcut with a `ponytail:` comment naming its ceiling.
- **Preserve** `src/random_math.docx` and `survey.md`.
- Non-trivial logic leaves **one runnable check** behind — a branch, a loop, or a parser gets an
  `assert`-based check or one small test, not a suite.

## 3. Where the app's promises live

Three things are stated once and must not be re-decided at a call site:

| Promise | Sole owner |
|---|---|
| Where data goes, and whether a write is durable | `src/main/services/Storage.ts` |
| When a skill comes back | `src/main/services/Scheduler.ts` |
| What a question may show | `src/main/Mcq.ts` |
| How an answer is graded | `src/main/Answer.ts` (via `src/main/Settings.ts` `isAnswerCorrect`) |

If a new persisted value, a new scheduling decision, or a new option set is needed, it goes through
that module. Bypassing any of them makes the corresponding product promise false.

Layering: `main` (orchestration and services) → `modules/<subject>` (pure generators) → `main/Mcq.ts`
→ DOM. Generators are pure and take an `rng`; they must not touch the DOM, storage, or the clock.

## 4. Completed phases

### 4.1 Foundation and build repair
- `tsc --noEmit` and the Vite production build are clean.
- Housekeeping: repo-wide scans, dead code and debug-leftover removal, the `CODE_STYLE.md` sweep.

### 4.2 Answer grading (completed this session)
The desktop and web builds had **two different answer checkers**, and they disagreed.

- `checkAnswerFast` (`src/main/Settings.ts`) called the Rust command `check_math`
  (`src-tauri/src/lib.rs`) first and only fell back to JavaScript when Rust said "wrong". The Rust
  path could not parse a fraction, a LaTeX fraction, or any expression.
- Root cause of the observed failure was sharper than "Rust is too weak": `isAnswerCorrect` handed
  the key to mathjs **as the generator printed it**, so a key of `\frac{3}{4}` was unreadable. That
  hit mental mode (`src/main/Session.ts`) on *both* builds, because single mode escapes it by
  running `convertLatex` first inside `compareExpressions`. The divergence was mental-vs-single.
  It rejected precisely the answer the hint ladders invite — `0.52` for a key of `\frac{\pi}{6}`.
- **Resolution: one checker.** `checkAnswerFast` is now `isAnswerCorrect`. `check_math` remains a
  registered command but nothing grades through it. It was also improved to reduce an answer to an
  exact fraction (`3/4`, `\frac{3}{4}`, `-frac{3}{4}`) before its float tolerance, and to compare
  the alternate answer the same way as the key.
- `latexToPlain` was added to `src/main/AnswerFormat.ts` as the single place that decides an answer's
  spelling. `isAnswerCorrect` runs the key, the alternate, and the learner's input through it.
- Commits: `bd4b57d`, `86bfd8c`, `8b20013`, `64d8740`, `56d5e53`. `cargo test` 215 passed.

### 4.3 Privacy and storage
- `src/main/services/Storage.ts` owns desktop SQLite, browser IndexedDB, and true ZDR, behind one
  interface. Nothing else writes `localStorage` or decides whether a write is durable.
- A real write probe establishes whether a browser allows durable persistence, so "private mode"
  genuinely means no durable write rather than a claim in the UI.
- Legacy migration moves `localStorage` data across and then **removes** it, so a privacy promise
  holds on the next load.
- Settings expose the choice, with a legacy fallback so an upgrade does not silently lose
  preferences. The startup bug where preferences were lost unless the data setting was opened was a
  real regression and was fixed in the product, not papered over in the test.

### 4.4 Adaptive scheduling
- `src/main/services/Scheduler.ts`: FSRS stability plus a bounded overconfidence correction, tracked
  per topic **and** per sub-skill, with the reason surfaced to the learner.
- `src/main/services/ReviewStore.ts`: review records, per-topic and per-skill aggregates, and erase
  support.
- Desktop commands read multi-column selects into **typed rows** (`AttemptRow`, `SkillRow`) rather
  than `serde_json::Value`, which SQLx cannot construct for a multi-column select. Typed rows also
  mean column names are checked at compile time. Commits in `04f267d` and earlier.

### 4.5 Daily challenge
- `src/main/services/DailyChallenge.ts`: a date-seeded set, derived on the local calendar so "today"
  matches the learner's day, layered over the review queue, with a streak derived from the set
  itself rather than stored separately.
- `src/main/services/DailyMode.ts`: the mode, progress, resume, and completion.

### 4.6 Help, hints, and confidence
- `src/main/services/Help.ts` and `src/modules/shared/Hints.ts`: a rung-at-a-time hint ladder
  available on every topic, with "concession" (show the answer) as a separate, clearly-labelled
  choice. Confidence is captured where it is informative.
- Generic solution scaffolding is honest about being generic. It is weaker than topic-specific
  worked solutions — see O12.

### 4.7 Mobile and PWA
- Coarse-pointer layer with 44px minimum touch targets, safe-area insets, `100dvh`, and
  `visualViewport` keyboard handling (`src/main/services/Viewport.ts`).
- PWA manifest and an updated service worker.
- Initial payload was cut from 39.9 kB to 34.07 kB by splitting the new services into dynamic
  imports; the remainder is real correctness work.

### 4.8 Curriculum
- 125 → **129 registered topics**: `divisibility`, `gcd_lcm`, `modular`, `data_analysis`, each with
  sub-skill rows in `src/modules/shared/SubSkills.ts`.
- Eight further generators are written, committed, and verified but **not yet registered**. See O1.
- Many individual generator correctness defects were found and fixed: proportion formula and a
  self-contradictory scale question, finance currency symbols inside math, blank derivative and
  definite-area prompts, rounded vector prompt/key mismatch, number-set classification, triangle
  classification ambiguity, radical rationalisation and division duplicates, radical sum/difference
  degree signs, trigonometric polar/complex degree signs, arithmetic bare-dollar delimiters,
  unbounded loops, and degenerate random sources. An unbounded loop in `GenerateModular` was
  committed *after* the rule against it was documented, and is now the example the rule cites.

### 4.9 Performance
- `src/main/Topics.ts`: static `Map`/`Set` indexes, no document scan on the interaction path.
- Remaining `querySelectorAll` sites are listed in O7.

### 4.10 Desktop, packaging, updater, CI
- Tauri review and attempt tables with real schedule commands and full-record erase.
- Updater: progress accumulation, visible failures, `requireSignedVersion`.
- Windows fixed-WebView2 Tauri flavour plus a CI job that builds it.
- CI: separate Vitest `unit` and `oracle` projects; Chromium **and** WebKit installed for Playwright.

### 4.11 Documentation
`README.md`, `CODE_STYLE.md`, `AGENTS.md`, `docs/guide/architecture.md`, `docs/guide/usage.md`,
`docs/guide/getting-started.md`, `docs/contributing.md`, `docs/api/index.md`, and
`CONTRIBUTING.md` are all updated for the work that landed.

## 5. Open work register

Ordered by consequence. Each row states the acceptance test that closes it.

### O1 — Register the eight new topics (blocks the curriculum phase)
The generators are committed and individually verified, but **none are registered**: not in
`src/main/Constants.ts`, not in the subject `RegisterTopics.ts`, not re-exported from the subject
`index.ts`, and with no `SubSkills.ts` rows. The oracle resolves a generator through
`import(".../<Subject>/index")`, so registering a topic without the re-export fails with
"Generator function not found".

| File to create | Export | Sub-skill branches |
|---|---|---|
| `DiscreteMathematics/GenerateCountingPrinciples.ts` | `generateCountingPrinciples` | `multiplication_rule`, `addition_rule`, `permutation_restriction`, `combination_restriction`, `arrangement_repeats`, `shared_property` |
| `DiscreteMathematics/GenerateProbabilityRules.ts` | `generateProbabilityRules` | `conditional_table`, `total_probability`, `bayes`, `independence_statement`, `expected_value` |
| `Geometry/GenerateSimilarity.ts` | `generateSimilarSimilarity` | `proportional_sides`, `scale_factor`, `area_ratio`, `perimeter_ratio`, `scale_from_area`, `converse_proportionality` |
| `Geometry/GenerateTransformations.ts` | `generateGeometricTransformations` | `translate_point`, `rotate_point`, `reflect_point`, `dilate_point`, `compose_transformations` |
| `Geometry/GenerateCircleGeometry.ts` | `generateCircleGeometry` | `inscribed_central`, `arc_sector`, `tangent_right_angle`, `chord_length`, `chords_inside`, `secants_external` |
| `LinearAlgebra/GenerateEigenvalues.ts` | `generateEigenvalues` | `eigenvalues_2x2`, `eigenvalues_3x3`, `eigenvector`, `characteristic_polynomial`, `diagonalise`, `defective` |
| `LinearAlgebra/GenerateOrthogonality.ts` | `generateOrthogonality` | `dot_product`, `norm`, `projection`, `gram_schmidt`, `orthogonal_complement` |
| `LinearAlgebra/GenerateVectors3D.ts` | `generateVectors3D` | `cross_product`, `triple_product`, `angle_3d`, `point_line_distance`, `point_plane_distance` |

Steps, in order:
1. Add `export * from "./Generate….js"` to the `index.ts` of each of the three subjects.
2. Add a `register(...)` call in that subject's `RegisterTopics.ts`.
3. Add the topic id, name, icon, and category to `src/main/Constants.ts`, **and** the id to the
   correct `scopeTopics` list. Current register-call counts: Algebra 54, Trigonometry 30,
   DiscreteMathematics 15, Geometry 11, Calculus 11, LinearAlgebra 10, Arithmetic 5.
4. Add one `SubSkills.ts` row per branch above, using the exact branch strings.
5. **Id collision:** `transformations` is **already an existing topic** (`Constants.ts:36`, name
   "Transformations"). The new rigid-transformations generator must take a distinct id, e.g.
   `rigid_transformations`. Verify every new id is unused before adding it.
6. Update the topic count wherever it is stated (README, `docs/guide/architecture.md`). It is 129
   now; it becomes 137.

**Acceptance:** the oracle samples all 137 topics, every sub-skill string above appears in
`SubSkills.ts`, `src/main/Constants.ts` and the `scopeTopics` lists agree, and the running app shows
the new topics with a working index link.

Defects already found and fixed inside these generators while verifying them — keep them fixed when
registering: `proportional_sides` scaled the wrong side; `chord_length` used `2r·sinθ` instead of
`2r·sin(θ/2)`; the characteristic polynomial dropped leading coefficients; `point_line_distance`
drew its scale factor per component, destroying both the length and the perpendicularity; the math
delimiters in the eigenvalue template literals were being eaten.

### O2 — Mental mode grades more narrowly than single mode
`src/main/Session.ts:248` calls `isAnswerCorrect`, which has no symbolic simplification, no `=`
splitting, and no term reordering. So in mental mode `x=5` for a `linear_eq` key,
`(x+1)^2` for `x^2+2x+1`, and `2y+x` for `x+2y` are all rejected where single mode accepts them.
This is the only remaining grading gap.

The fix is to share `compareExpressions` out of `src/main/Answer.ts`, so both modes grade identically.
**This is blocked on test-file ownership**: `Answer.test.ts` and `Session.test.ts` both
`vi.mock("../../main/Settings")` with a factory that returns `undefined` for a relocated function, so
the move requires editing those two test files in the same change.

**Acceptance:** the three examples above are accepted in mental mode, and the two mock factories are
updated rather than worked around.

### O3 — `latexToPlain` does not handle two printed forms
`src/main/AnswerFormat.ts` handles `\frac`, `\sqrt`, grouping braces, and `\left`/`\right`. It does
**not** handle `45^{\circ}` (becomes `45^circ`, unparseable) or `\cdot` (becomes `cdot`). Single mode
has the identical limitation, so grading is at least consistent, but both reject a degree-marked or
`\cdot`-bearing key that the learner answered numerically. The degree case is live: angles in this
curriculum are printed with `^{\circ}`.

**Acceptance:** a degree-marked key accepts the numeric answer, in both modes.

### O4 — MCQ tests still permit option sets that are not four
`src/__tests__/main/Mcq.test.ts:60` expects `length === 3` and line 76 expects `length === 5`. Both
were loosened to accommodate the builder instead of the builder being fixed to the contract. The
oracle also checks the **presented** set produced by `buildChoiceSet`, not the raw generator
`choices`, so a generator may still emit fewer than four, duplicates, or an also-correct distractor
and pass.

**Acceptance:** `Mcq.test.ts` asserts exactly four with exactly one correct in every case, and the
oracle's MCQ gate checks the raw generator output as well as the presented set.

### O5 — Bundle budget was raised instead of met
`scripts/bundle-check.js` defaults were raised from 35/55 kB to 40/58 kB. That was an acknowledged
deviation from a stated target, and the current payload — JS 34.07 kB, CSS 8.30 kB, total 52.41 kB
— **fits the original 35/55**. Restore the defaults and let the budget bite again.

**Acceptance:** defaults are 35/55 and `node scripts/bundle-check.js` still passes.

### O6 — No enforced coverage threshold
`package.json` has `test:coverage` and `@vitest/coverage-v8` is installed, but `vite.config.ts`
defines **no thresholds**, so coverage is reported and never enforced. The plan called for an
enforceable floor, and the "every UI action covered" part is unstarted.

**Acceptance:** thresholds are configured and `npm run test:coverage` fails when coverage falls below
them. Set the floor at the project's real current number rather than an aspirational one.

### O7 — Remaining `querySelectorAll` on interaction paths
`src/main/core/DomRegistry.ts` (3, legitimate — it is the registry). Still to be migrated to
`DomRegistry` in `src/main/`: `DataManagement.ts` (1), `Events.ts` (1), `Generation.ts` (1),
`Session.ts` (1), `Ui.ts` (1), `WeakTopics.ts` (1).

**Acceptance:** no `querySelectorAll` outside `DomRegistry` in `src/main/`, or a comment justifying
each remaining one.

### O8 — 3D efficiency on mobile
`three` `^0.186.1` is a dependency, but no mobile-oriented work has been done on it: no frame budget,
no geometry reuse across frames, no reduced-DPR or paused-loop behaviour when the graph is offscreen,
and no reduced-motion path.

**Acceptance:** the 3D graph respects a device-pixel-ratio cap, stops rendering when offscreen, and
honours `prefers-reduced-motion`.

### O9 — End-to-end coverage of the new features
`e2e/daily-help-privacy.spec.ts` has **never been run**. The last mobile Safari run was 80 passed /
6 failed and was aborted before the failures were diagnosed; the original baseline was 86 passed.

**Acceptance:** the whole Playwright suite green on Chromium and WebKit, with the six mobile failures
either fixed or explicitly recorded as known.

### O10 — Stale architecture doc row
`docs/guide/architecture.md:176` still lists `check_math` as doing "Numeric and symbolic comparison".
The command is registered and callable, so the row is not wrong, but it is no longer load-bearing and
should say so, since 4.2 made the JavaScript checker authoritative.

### O11 — Data export and import ignore the new tables
`src/main/DataManagement.ts` export/import does not carry the attempts or skill-schedule tables, and
full-record erase (`clear_performance`) is wired while a genuine export is not.

**Acceptance:** a full export/import round-trip preserves review history, attempts, and the schedule.

### O12 — No worked solutions for the eight new topics
The eight generators omit the worked `solution`/`hints` payload, so the help ladder falls back to
generic scaffolding for them. This is the weakest part of the help feature.

**Acceptance:** each new topic produces a topic-specific first hint and a worked final step, and the
hint ladder in `Help.ts` prefers them over the generic scaffold.

## 6. Validation

Cheap, run while working:
```
npx tsc --noEmit
cd src-tauri; cargo test
```

Expensive, run at the end only:
```
npm run test:unit        # vitest --project unit
npm run test:oracle      # vitest --project oracle
npx playwright test      # Chromium + WebKit
npm run build
node scripts/bundle-check.js
```

Last full green baseline, before the eight new generators were written:
`tsc` clean · unit 118 files, 7175 passed, 6 skipped · oracle 4 files, 18 passed ·
cargo 215 passed · build 2.2 s · bundle JS 34.07 kB, CSS 8.30 kB, total 52.41 kB.

Any change to a generator is incomplete until the oracle passes. Any change to a service is
incomplete until `tsc` and its own unit tests pass.

## 7. Definition of done

- Every row in section 5 is closed, or the next agent has deliberately decided otherwise in writing
  here, with the reason.
- All 137 topics are registered, reachable from the index, and pass the oracle.
- The four rules in section 1 hold for every generator, enforced by CI rather than by review.
- One answer checker, one storage module, one scheduler, one MCQ builder — each stated once and
  reached from everywhere, with no bypass.
- `tsc`, unit, oracle, Playwright, build, bundle, and `cargo test` all green.
- The documented topic count matches `src/main/Constants.ts`.
- This file is updated in the same commit as anything it describes.

## 8. File index

Authoritative for the promises, per section 3:
- `src/main/services/Storage.ts` — where data goes, whether a write is durable
- `src/main/services/Scheduler.ts` — when a skill comes back
- `src/main/Mcq.ts` — what a question may show
- `src/main/Answer.ts`, `src/main/Settings.ts`, `src/main/AnswerFormat.ts` — how an answer is graded

Curriculum wiring:
- `src/main/Constants.ts` — topic ids, names, icons, categories, `scopeTopics`
- `src/modules/<Subject>/RegisterTopics.ts` — generator to topic binding
- `src/modules/<Subject>/index.ts` — re-exports the oracle resolves through
- `src/modules/shared/SubSkills.ts` — the scheduling taxonomy, one row per sub-skill
- `src/modules/shared/Numeric.ts` — `roundTo`, `fmt`, `fmtTrim`, `pickDivisible`
- `src/modules/shared/Random.ts` — `shuffle`, `randInt`, `pick`

Tests and gates:
- `src/__tests__/oracle/` — the invariants in section 1
- `src/__tests__/main/Mcq.test.ts` — the option-set contract (see O4)
- `.github/workflows/ci.yml` — unit, oracle, E2E, and the Windows fixed-runtime build
- `scripts/bundle-check.js` — payload budget
