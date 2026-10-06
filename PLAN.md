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
- **Update documentation in the same change** as the behavior it describes.
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

Three things are stated once and must not be re-decided at a call site, plus the
seam desktop calls go through:

| Promise | Sole owner |
|---|---|
| Where data goes, and whether a write is durable | `src/main/services/Storage.ts` |
| When a skill comes back | `src/main/services/Scheduler.ts` |
| What a question may show | `src/main/Mcq.ts` |
| How an answer is graded | `src/main/Answer.ts` via `Settings.ts` `isAnswerCorrect` |
| How application code reaches Tauri | `src/main/services/Backend.ts` |

If a new persisted value, a new scheduling decision, a new option set, or a new
desktop call is needed, it goes through
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
- Desktop commands read multi-column selects into **typed rows** (`AttemptRow`, `SkillRow`) rather than
  `serde_json::Value`, which SQLx cannot construct for a multi-column select. Typed rows also
  mean column names are checked at compile time. Commits in `04f267d` and earlier.

### 4.5 Daily challenge
- `src/main/services/DailyChallenge.ts`: a date-seeded set, derived on the local calendar so "today"
  matches the learner's day, layered over the review queue, with a streak derived from the set
  itself rather than stored separately.
- `src/main/services/DailyMode.ts`: the mode, progress, resume, and completion.

### 4.6 Help, hints, and confidence
- `src/main/services/Help.ts` and `src/modules/shared/Hints.ts`: a rung-at-a-time hint ladder
  available on every topic, with "concession" (show the answer) as a separate, clearly-labeled
  choice. Confidence is captured where it is informative.
- Generic solution scaffolding is honest about being generic. The eight newest topics now supply
  their own branch-specific ladders and worked solutions — see O12.

### 4.7 Mobile and PWA
- Coarse-pointer layer with 44px minimum touch targets, safe-area insets, `100dvh`, and
  `visualViewport` keyboard handling (`src/main/services/Viewport.ts`).
- PWA manifest and an updated service worker.
- Initial payload was cut from 39.9 kB to 34.07 kB by splitting the new services into dynamic
  imports; the remainder is real correctness work.

### 4.8 Curriculum
- 125 → **137 registered topics**, then to **204**: `divisibility`, `gcd_lcm`, `modular`, `data_analysis`, each with
  sub-skill rows in `src/modules/shared/SubSkills.ts`.
- Eight further generators are written, registered, reachable from the index, and oracle-verified:
  `counting_principles`, `probability_rules`, `similarity`, `rigid_transformations`,
  `circle_geometry`, `eigenvalues`, `orthogonality`, `vectors_3d`.
- Many individual generator correctness defects were found and fixed: proportion formula and a
  self-contradictory scale question, finance currency symbols inside math, blank derivative and
  definite-area prompts, rounded vector prompt/key mismatch, number-set classification,
  triangle classification ambiguity, radical rationalisation and division duplicates, radical
  sum/difference degree signs, trigonometric polar/complex degree signs, arithmetic bare-dollar
  delimiters, unbounded loops, and degenerate random sources. An unbounded loop in `GenerateModular`
  was committed *after* the rule against it was documented, and is now the example the rule cites.
- **The option-set sweep.** The oracle's raw gate (O4) was extended to the generator's own `choices`
  array, which exposed real defects in **32 of the 137 topics** — 135 fewer-than-four sets, 56
  unusable options, 25 duplicates by value, and 6 option sets that did not contain their own key.
  All are fixed. Highlights: `integration_advanced` lower-cased every option, so a key of
  `y=C e^(1.50x^2)` was offered as `y=c e^(1.50x^2)`; `deri`'s exponential branch offered the
  function itself as the distractor for `d/dx e^x`; `perm` with `r = 1` shipped a two-option
  question; `sci_notation` graded a two-decimal rounding of a product its prompt gives exactly.
  Where a branch's answer domain genuinely holds fewer than four values, the **question was
  redesigned** rather than padded: `divisibility`'s recognition branch became "which of these four
  numbers is divisible by n", `poly_end`'s IVT branch became a question about the signs of `f(a)`
  and `f(b)`, and `real_ops`'s ordering branch became a choice between four relations.
- The oracle now samples **all 204 topics** with an empty failure list, and the trigonometry
  topics are additionally swept at 120 seeds per difficulty in
  `src/__tests__/modules/Trigonometry/TrigOptionSets.test.ts`, because the gate's own eight seeds once
  hid a defect for twenty-six of them.
- **The second expansion, 137 → 204.** Sixty-seven topics of genuine gap rather than repetition,
  chosen from an inventory of what the 137 did not have: Arithmetic 8, Algebra 8, Calculus 9,
  Discrete Mathematics 13, Geometry 11, Linear Algebra 10, Trigonometry 8. Every one is a distinct
  procedure, not another instance of a procedure already present — determinants before Cramer's rule,
  degree before Euler, triangle inequality before triangle area, exact values before identities.
  `topics`, the `registerTopic` calls and the `SubSkills.ts` rows are 204 = 204 = 204 in both
  directions.
- **What the option-set contract cost at this size.** Every one of the 67 new generators reaches
  four honest options on every branch, and the branches whose natural question was yes/no were
  redesigned rather than padded: `absolute_value_equation/no_solution` became "which of these four
  equations has no solution", `graph_euler/euler_path` became "which pair of vertices are the
  odd-degree ones", `relations/*` each became a count the learner can read off the printed pair
  list. The unit suite grew from 7,556 to **9,944** with the sweep tests that prove each branch is
  reachable and each option set holds.
- **One ambiguity the generators refused.** The law-of-sines brief stated the ambiguous-case rule
  as "two solutions when `h < b < a`", which is inverted: for SSA with `A` acute, `b < a` gives one
  triangle. The correct rule (`h < a < b`) is implemented, and rather than assert it the generator
  computes both candidate angles, keeps those leaving a positive third angle, and verifies each
  against the cosine rule before offering it.

### 4.8b Topic selection at 204 topics
The grid was a flat wrapped list of pills, which is browsable at 137 and is not browsable at 204.
On a phone it was worse than unwieldy: the mobile rule turns the container into a horizontal strip,
so 204 topics became 204 unlabeled targets in a scroller with nothing to anchor them. No unit test
can see this, because the grid was doing exactly what it was written to do.

- The grid is **grouped under a heading per category**, and a chip row filters it to one category,
  each chip carrying how many topics the current scope has in it. `Algebra 0` is printed rather than
  a bare "Algebra", because a category that exists and is empty is a different message from one
  that is not there.
- The category is now part of the searchable text. No topic is named after a category, so typing
  "trig" or "geometry" previously answered "nothing matches" to a query naming something the grid
  is full of. The sub-skill names are deliberately **not** indexed: they are internal identifiers no
  learner has read, and a match on text the learner cannot have seen is a result that cannot be
  explained.
- A selected topic the filter has hidden is deselected, so pressing Generate can never answer from a
  topic whose pill is not on screen. An unrecognized category counts as showing everything, because
  a filter that narrowed the grid to nothing on a value it did not recognize would leave an empty
  grid and no way out of it.
- `dom.displays.topicPills` cast every child of the grid to a button, which was true while the grid
  held nothing else. It now filters by class over the grid's own children — no `querySelectorAll`,
  so no interaction path gained a document search.
- Cost: 0.55 kB of the JavaScript budget and 0.27 kB of the CSS budget. The page description also
  still said "125 topics", which had been true when written.

### 4.9 Performance
- `src/main/Topics.ts`: static `Map`/`Set` indexes, no document scan on the interaction path.
- `querySelectorAll` no longer appears anywhere in `src/main/` except inside
  `src/main/core/DomRegistry.ts`, which is the registry itself.
- The 3D graph stopped being a per-frame cost center: see O8.

### 4.10 Desktop, packaging, updater, CI
- Tauri review and attempt tables with real schedule commands and full-record erase.
- Updater: progress accumulation, visible failures, `requireSignedVersion`.
- Windows fixed-WebView2 Tauri flavor plus a CI job that builds it.
- CI: separate Vitest `unit` and `oracle` projects; Chromium **and** WebKit installed for Playwright.
- **Android toolchain upgraded**: Gradle wrapper `8.14.3` → `9.8.0` (wrapper jar, `gradlew`,
  `gradlew.bat` and properties regenerated from the distribution, not hand-edited), Android Gradle
  Plugin `8.11.0` → `9.3.1`, Kotlin `1.9.25` → `2.2.10` — the versions the installed Tauri CLI
  2.12 writes into its own Android template. This required three Gradle 9 changes beyond the version
  numbers: `BuildTask` now injects `ExecOperations` because **Gradle 9 removed `Project.exec`**,
  `RustPlugin` registers its tasks instead of mutating a created task, and `app/build.gradle.kts`
  moved `kotlinOptions` to `kotlin { compilerOptions }`.

### 4.11 Documentation
`README.md`, `CODE_STYLE.md`, `AGENTS.md`, `docs/guide/architecture.md`, `docs/guide/usage.md`,
`docs/guide/getting-started.md`, `docs/contributing.md`, `docs/api/index.md`, and
`CONTRIBUTING.md` are all updated for the work that landed.

### 4.12 Two defects the browser run exposed
Neither is visible to a unit test, which is the argument for running the suite in a real
browser at all.

- **A trigonometric graph question showed no graph at all.** `GeometryVisualization.ts`
  implements seven canvas shapes but its router listed six, so a request for `graph` built a
  WebGL renderer, fell through the 3D switch, warned `Unknown 3D shape`, and deleted the
  visualisation it had just created. The trigonometry generator asks for that shape, so
  every `trig_graph` question lost its figure and paid for a WebGL context to do it.
- **A key printed with the Unicode radical sign could not be graded.** `45^{\circ}` and
  `\cdot` were fixed in O3; `√5` is the same class of printed form and reached mathjs as a
  bare radical character, which it cannot parse. `latexToPlain` now rewrites it to
  `sqrt(…)` in both directions, so a learner may type either spelling.


### 4.13 What the browser suite found once it was actually run

The suite had been reported as green from a run that was killed before it printed a
summary, and the per-test ticks were unreadable in a mangled log. Reading the log
honestly, several cases had been failing for a long time. Four real defects and six
stale cases came out of it.

- **The web build wrote settings and never read them back.** One document decides
  the persistence mode — the settings hold the learner's choice — and it was being
  read through a path that answers nothing while the mode is still its default
  private session. So a browser told to keep its record stored the document
  faithfully, and the document survived a reload intact while the interface came
  back showing defaults. The worst shape this failure takes: the data is there, it
  is correct, and the learner is told their settings did not save.
  `Storage.readPersisted` reads the one document that decides the mode, writes
  nothing, and declines to open a database in the desktop build at all.
- **The daily challenge threw before the first question.** `current` is -1 before
  anything is answered, and `enter` called `next` to show the first question, which
  indexed `slots[-1]`. The summary still rendered, so the mode looked open while
  being unusable.
- **The hint button was offered with nothing behind it.** `prepare` is the only
  thing that disables it and it only runs once a question exists.
- **Hiding via the `hidden` property did nothing.** Every element the app hides also
  carries a class that sets `display`, and a class selector outranks the
  user-agent rule for `[hidden]`. The adaptive toggle, the recommend button, the
  erase row, the hint panel and the daily summary were all being "hidden" while
  staying on screen. One helper now sets the attribute and the class.
- **Six cases asserted things the app stopped doing.** Two waited for a browser
  dialog for messages that are toasts; one waited for a message that no longer
  exists anywhere, describing behavior removed when the browser gained a real
  record path; one selected a Calculus topic under an algebra scope; one asserted
  an empty `localStorage` when the interface legitimately keeps two preferences
  there; and the harness seeded flat keys the app only reads for migration.
- **The theme and font defect is closed, and it was a boot-order bug rather than a
  missing write.** `initApp` called `loadSettings()` without awaiting it and then
  applied the persistence choice, so the mode was decided from the default — a
  private session — before the stored document had been read. Choosing "keep on this
  device" therefore wrote nothing that survived a restart: the choice was stored
  correctly, the document survived intact, and the learner was told their settings
  had been kept. The nine failing cases in `e2e/settings.spec.ts` were all this and
  nothing else. The theme case was also rewritten to assert that a setting survives a
  restart rather than that it reached the app's own store, which is what the original
  was testing.

### 4.14 How the suite runs here

A Playwright process is killed after roughly four to six minutes in this
environment, regardless of foreground or background, and stray browsers left by
killed runs accumulate until they are reaped: 15 Chromium and 7 Edge processes
were found holding no window between runs. Two earlier full runs were killed at
ninety and two hundred and eight tests with neither printing a summary, which is
how a suite with failing cases came to be reported as green.

Three practices make verification real under those conditions. Runs are one spec
file at a time with `--workers=1`, stray browsers are reaped before each run,
and anything longer than three minutes is split: the all-topics files run
per-difficulty or per-quarter, and `console-errors.spec.ts` went from one test
sweeping all 204 topics plus every dialog to 22 tests — one per category chunk
plus one per journey — because a suite that cannot finish cannot fail.

Verified by running to completion, on all three projects unless noted. Desktop:
`settings.spec.ts` 11/11; `desktop-only.spec.ts` 10/10;
`daily-help-privacy.spec.ts` 18/18 across four group runs; `mcq.spec.ts` 8/8;
`print-worksheet.spec.ts` 9/9; `single-mode.spec.ts` 12/12; `mental-mode.spec.ts`
9/9; `onboarding-app-shell.spec.ts` 8/8; `smoke.spec.ts` 2/2; the all-topics
matrix, every topic at easy, medium and hard; and all 22 `console-errors` tests,
which assert zero console errors, page errors and failed requests.

Mobile Chrome and mobile Safari: the interaction specs in full (single mode 12/12
with one clipboard case skipped on WebKit, mcq 8/8, mental mode 9/9, settings
12/12, printing 9/9, onboarding 8/8, desktop-only 10/10, the daily, help and data
groups 18/18, smoke 2/2) and the all-topics matrix, every topic at every
difficulty. The console sweep is 22/22 on both.

Nothing in the suite is left unrun.

### 4.15 Two dead ends in the topic filters, and a desktop mode that lied

Three defects were reported together as "I cannot choose topics beyond basic
arithmetic, and adaptive is still showing under ZDR". None of them was where it
looked.

- **The category chips and the search box could be pointed at nothing.** The default
  scope is the twelve arithmetic topics, and against it every other chip read
  `Calculus 0` in the dimmed style. That reads as *unavailable*, not as *not in this
  scope*, so a learner who had just been told there were 204 topics was told by a
  dimmed zero that there was nothing to see. Typing a topic's name did the same and
  returned an empty grid, which is worse, because naming a topic is about as
  unambiguous a request as this interface gets. Both now widen the scope to the
  narrowest one that holds the target and leave the scope control showing what
  changed. `scopeLadder` in `Constants.ts` declares the order they widen in.
- **Adaptive learning was gated on one condition where it needs two.** The rule was
  asked twice of `adaptiveAvailable` and answered once: the runtime, but not whether
  anything is kept. The desktop app under a private session has the runtime and no
  record, so the scheduler was deciding from data that was about to be discarded. It
  now requires both, and `applyPersistenceVisibility` re-decides it when the mode
  changes rather than only at start-up.
- **The desktop build displayed a mode it was not in.** The mode control was filled
  from the stored *choice* rather than from the mode in force, and it was disabled at
  the same time, so the desktop app said "nothing is stored" while writing to disk.
  That false claim is what made the adaptive surfaces look like a contradiction rather
  than a consequence. `effectivePersistence()` is now the single answer, the control
  reads it, the adaptive gate reads it, and the select has a third option that names
  the desktop store truthfully.

### 4.16 American English throughout

535 occurrences across 87 files. The change is mechanical and was verified by
running everything: 10,007 unit tests, 30 oracle tests across all 204 topics, and 227
Rust tests. Three things were not mechanical.

- **`aria-labelledby` is a W3C attribute and not an English word.** A plain spelling
  sweep turns it into `aria-labeledby`, which leaves every dialog in the app
  unlabeled to a screen reader with no test failing. It is masked out for the length
  of the sweep.
- **`graph_colouring` is a topic id.** Renaming the file, the exported generator and
  the id without each other orphans the topic from the learner's records, so all three
  moved together, along with the four sub-skill ids.
- **The style guide was British.** `CODE_STYLE.md` described the house style in the
  spelling it was correcting.

### 4.17 Two end-to-end cases that could not fail

`mcq.spec.ts` had two cases around grading, and neither asserted what its name said.

- *Clicking the correct MCQ choice shows Correct!* looped over the four choices and
  put every assertion inside the loop, so it passed whether or not any choice was ever
  accepted. It now locates the choice from the answer and requires the success.
- *Exactly one MCQ choice is accepted as correct* clicked position N on each of four
  fresh questions and counted successes. The key is placed at a random index, so the
  case passed only when it happened to be drawn first — a quarter of the time — and
  the original version, which clicked through one question, failed the other three
  quarters because answering takes the choices away. It now checks both directions on
  fresh questions: the choice equal to the key is accepted, and a choice that is not
  is rejected.

Locating the choice also needs the rendered text, not the stored answer. A choice
rendered through KaTeX carries a thousands separator the stored answer does not, and
comparing them raw concludes the key is missing when it is on screen.

One more stale case: `print-worksheet.spec.ts` counted five options in the arithmetic
scope. The scope grew to twelve topics and the number stayed five. It is now counted
from `scopeTopics`, so it cannot rot again.

### 4.18 The four surfaces that were still showing

The report was that adaptive was still visible under a private session, and that the
"How confident are you?" control was still there. Both were true, and neither was where
the previous fix looked.

The rule had been applied at each call site, so a surface survived whenever nobody
remembered its site. Three were hidden — the adaptive row, the recommend button and the
weak-topics modal — and four were not:

- **The confidence control.** Asked after every graded answer. Its only reader is the
  scheduler's overconfidence correction, so in a browser it was collected, stored, and
  read by nothing.
- **The streak badge.** `completedDays()` returns an in-memory cache in a browser, so
  the count could only ever be zero or one and reset on every reload.
- **The learning-record dialog.** Export, import, erase and refresh all describe a
  record. An import under a private session reported success for a write that was
  discarded on reload.
- **The updates section.** Present in the browser, answering a press with a toast saying
  it needs the desktop app.

`src/main/core/GatedSurfaces.ts` now owns the list and applies it, with three gates that
are three different questions: adaptive, record, and tauri. Two tests encode old
behavior and were rewritten: one asserted the data dialog opened under a private
session, and one clicked Check for updates and waited for the toast.

### 4.19 The persistence promise, and the bugs around it

Three defects, found by auditing every write rather than by reading the one module that
owns them.

- **`Session.ts` wrote the session snapshot straight to `localStorage`**, unguarded and
  with no `try/catch`, on a debounce, on every answer and on every skip — in every mode
  including a private session. It then read it back at boot and restored a session the
  learner had asked not to have kept. All five sites now go through `Storage`.
- **`LEGACY_KEYS` named an earlier key.** It listed `sessionState` while the app wrote
  `mentalSessionSnapshot`, so the migration could never remove the one thing a private
  session was supposed to leave behind. The live key is now imported rather than written
  out, because a second literal is a second thing to forget.
- **One `invoke` had no browser path at all.** Deleting a single record reached into the
  backend with no `isTauri()` check; it was the only such call in the repository, it was
  reachable from a button that does appear in a browser, and the rejection replaced the
  record list with the error text.

### 4.20 Two bugs in the confidence control, on every platform

Found while adding the gate, and neither is about the gate.

- **`recordConfidence` destroyed the value it had just been given.** It called
  `hideConfidence()`, which sets the confidence back to `undefined`, in the same
  synchronous call that set it. Asking the question and erasing the answer is why no
  record ever carried a confidence — not in a browser, and not on the desktop where the
  row was shown and the learner could watch it being collected.
- **The ordering is closed by deferral.** The review record for an answer used to be
  written before the row was revealed, so the confidence for answer *N* could not reach
  the record written for answer *N*. The record is now queued at answer time and
  written at whichever comes first: the confidence answer (which carries it), the next
  question or dismissal (flushed before the value is cleared), or a five-second
  backstop. The slot is nulled synchronously before the first await, so rapid answers
  still write exactly once. Five cases in `Help.test.ts` pin the hold, the flush, the
  timeout, the exactly-once, and the no-queue where adaptive cannot run.

### 4.21 A five kilobyte regression that a size budget caught

Importing the settings module into the hint module, to ask there whether adaptive could
run, grew the entry chunk from 38.11 kB to 43.41 kB. A leaf that draws a row of buttons
was made to depend on most of the application.

It was attributed by reverting each changed file and rebuilding, one at a time, rather
than by reading — which is the only way to tell a five kilobyte regression from ordinary
growth. The fix passes the decision in, because the caller already owns the predicate.
Six development traces that printed the adaptive decision to a shipped console went at
the same time, one of which claimed a performance save in a browser where none happens.

The budget then moved from 38/57 to 38.5/57.5. That is not the regression being
absorbed — the residual is organic growth from features that were added and had to work.
The fix that would make the budget irrelevant was written down in `scripts/bundle-check.js`:
`Constants.ts` was 24.5 kB raw in the entry chunk with six modules reading it, so moving
it behind a dynamic import was estimated at roughly 4 to 6 kB gzipped. That split has
since happened — see 4.23 — and measured within a tenth of the estimate, so this
paragraph stays as the record of the decision, not as open work.

### 4.22 A missing chunk, and the build gate that now catches it

The reported failure was a module script arriving as `text/html` and a subject's
generators failing to load at the moment a question was requested.

The build on disk was self-consistent, so this was not a stale build. `public/sw.js`
answered a failed *script* request with `index.html` — correct for a navigation, wrong
for a script — and cached the response **before checking its content type**, so an HTML
body was stored against a `.js` URL. That survives the rebuild that would otherwise have
fixed it. The type is now checked before anything is stored and a failed asset request
answers 404.

`scripts/bundle-check.js` walks `index.html` and every static and dynamic import inside
every emitted chunk. Writing that check took three attempts, two of which were checks
that reported success while verifying nothing: the minifier emits template literals, and
markup references arrive with the `./` already stripped. It was proven able to fail by
hiding a chunk from `dist` and watching it name that file.

### 4.23 The curriculum tables leave the entry chunk

`Constants.ts` held 24.5 kB of tables in the entry chunk as data, not code. They
now live in `TopicData.ts` behind the one dynamic import boot awaits before the
first render, and the entry fell from 38.10 kB to 34.17 kB gzipped. Six
production modules read the tables; every one of them now reads through
`Topics.ts` accessors instead, and no shipped source imports the tables
statically — a static import anywhere would put them back in the entry chunk the
split took them out of, so the module header says so. The budget moved a third
time on the back of it, from 38.5/57.5 down to 36/55.5, with the reason recorded
in `scripts/bundle-check.js` where the first two moves are recorded.

### 4.24 The backend seam exists now

`CODE_STYLE.md` required Tauri calls behind `src/main/services/Backend.ts`, and
that module did not exist: seven files invoked plugins directly. Every desktop
call now passes through the one capability-checked seam, which returns the typed
fallback the caller already handles outside Tauri. The migration is mechanical —
same commands, same argument order, same error handling — and `tsc` plus the
suites that mock the plugins confirm nothing changed shape.

### 4.25 Taps the app swallowed on touch screens

Three mobile failures with no console error and nothing rendered: a tap that
lands while the keyboard reveal is still pending moves the page between press
and release and becomes a scroll with no click; a WebKit touch blur reports a
null related target and drops the toolbar under the finger; and the clipboard
spec granted a permission WebKit rejects. The scroll is now cancelled by an
arriving tap and never fires mid-press, coarse pointers keep the toolbar shown
and keep focus until something outside the card takes it, and the clipboard case
skips on WebKit.

### 4.26 Two more cases that could not fail, and one that timed out

`mcq.spec.ts` compared rendered choice text against the stored key, but a
KaTeX-rendered negative carries a Unicode minus the key does not, and
annotation nodes can repeat the text: the comparison concluded the key was
missing when it was on screen. Both are normalized now. The hint cases clicked
faster than the dynamic import behind the button resolves, so a bare count read
whatever had arrived rather than what the click produces, and rapid clicks
raced a reveal that disabled the button mid-click. Retrying assertions pace the
clicks.

### 4.27 The hangs that were not

Three separate bisections chased generation hangs — `func_concepts`,
`parametric_motion`, `complex_mult_div` — each dying mid-sequence and passing
solo. Four hundred seeds through generate, KaTeX render and grade in Node
completed in under five seconds with no stall, and every accused topic passes
solo in the browser in six seconds. The verdict is environmental kills landing
mid-topic, confirmed by the cleanup in 4.14: after reaping strays, the same
shards pass unchanged. The discipline stands, though — a kill with no log is
indistinguishable from a hang without per-topic logging, which is why the
scratch runner logs every topic boundary.

### 4.28 Basic functions finally varies by difficulty

`generateBasicFunctions` discarded its difficulty parameter, so easy and hard
drew from the same pool and asked the same types. Easy now names familiar
shapes, medium mixes naming with properties over a wider pool, and hard leans
on properties across all twelve families, all drawn from the injected seed.
Two rng fixtures moved with the narrower medium pool, and a new case asserts
easy asks names only while hard reaches every family across seeds.

### 4.29 The layout audit and its fixes

A full static audit of the stylesheet, markup and viewport code found 35 items;
the functional hunt alongside it found nothing — unit, oracle and tsc all green
with baseline-matching numbers, and every risky area re-verified. The fixes:

- **Hidden controls that never hid.** Bare `hidden` attributes lose to author
  `display` rules, so five controls rendered while reported hidden. One global
  `[hidden]` rule covers both mechanisms now.
- **Keyboard reveal scrolled the wrong box.** Phones scroll the inner content,
  not the window, so the answer stayed behind the keyboard. The nearest
  scrollable ancestor takes the delta now.
- **Dead keyboard path.** The viewport module wrote classes and variables no CSS
  read; the modal cap and keyboard-open variant consume them now.
- **Footer clipped on phones.** Fixed 28px height with two-line stacked content;
  it sizes to content with a minimum now, carrying its own safe-area padding.
- **Narrow overflow.** Setting rows, print fields, action buttons, worksheet
  headers and long option/name/field text wrap or shrink at 320px; desktop
  shortcut hints hide where the shortcuts do not exist.
- **Touch targets.** Chips, mode and settings tabs, checkbox label rows, selects
  and the clear button join the 44px floor on coarse pointers.
- **Focus trap.** Tab walked out of every modal; one observer covers all six
  dialogs from every open path, moving focus in and back, with Tab cycling
  inside. Proven by a browser case, not by review.
- **Toasts and badges** respect safe areas and sit below dialogs; the loading
  veil sits above them.
- **Print.** Dark-theme math prints black, equations show whole instead of
  clipped, questions keep to one page, pages carry margins.
- **Contrast.** Verdict text uses AA-passing cuts per theme; dark blocks declare
  the tertiary they use.
- **Dead code.** Sixty lines of context-menu rules styled no element in the app,
  a duplicated panel rule merged, two animation declarations with no keyframes
  removed, and the close button owns its layout.

Left as is, deliberately: `body{overflow-x:hidden}` stays as the backstop now
that each overflow has its own fix; the triplicated theme blocks work and
merging them risks every color at once; the modal show/hide pair is load-bearing
and covered by tests.

### 4.30 The topic table and the registry can disagree

A spelling sweep renamed the `prime_factorisation` topic id in the table while the
`registerTopic` call kept its own spelling. Both halves are needed: the grid offers
the id and the registry has to know what to generate for it. The result was a pill
that looked normal and answered "Unknown topic" when pressed, and nothing compared
the two lists, in either direction, or checked that a scope names real topics.

Four assertions now close all three gaps in `topicTable.test.ts`, and they were
proven to fail on the exact mismatch before the fix landed. Ids are what a
learner's records are keyed by; the display name keeps the American spelling.

### 4.31 A click that lands on nothing

The matrix failed intermittently at one topic, on one machine, and read like a
broken grader. It was not: the verdict rendered four milliseconds after the click
handler ran, and a second click always worked. The click simply never reached the
handler.

A generated question is typeset asynchronously, and a typed answer updates a
debounced preview. Both reflow the card after Playwright has hit-tested the point
and before it dispatches, so the click lands where the button used to be. What
proved it: a long-task observer showing no blocking work, the element found at the
click point, and a verdict timestamped four milliseconds after the handler that the
second click reached.

Three fixes. The renderer publishes a counter when a typesetting pass finishes, so
a caller can wait for the reflow instead of guessing a delay. The harness waits for
the card's geometry to hold still after generating and after typing. And the answer
checker releases its reentrancy guard once the verdict is on screen, because
holding it across the daily-set and auto-continue bookkeeping would drop the next
click with no verdict and no message.

Also fixed: the all-topics specs gave a whole category ten minutes, which was
measured on desktop Chromium. WebKit needs ten to eleven for Algebra, so the cap
failed the last few topics for being slow rather than wrong.

### 4.32 The matrix, on all three projects

Every one of the 204 topics, at easy, medium and hard, generates and accepts its
own correct answer in a real browser: desktop Chromium, mobile Chrome and mobile
Safari. Run in slices here, as section 4.14 describes, because the committed specs
are one test per category per difficulty and the large categories need several
workers to fit an execution window.

Alongside it on the same three projects: single mode, mental mode, multiple choice,
the daily challenge, hints and solutions, the data choice, settings, printing,
onboarding, the desktop-only fallbacks, and the 22-test console sweep that asserts
zero console errors, page errors and failed requests.

## 5. Open work register

Ordered by consequence. Each row states the acceptance test that closes it.

### O1 — Register the eight new topics (CLOSED)
At the time, all eight were registered in `src/main/Constants.ts`, in their subject's `RegisterTopics.ts`, re-exported
from the subject `index.ts`, and given sub-skill rows with the exact branch strings. The count was 137
in `topics`, 137 `registerTopic` calls, 137 sub-skill rows, and `scopeTopics.all` agreed with
`topics`. (This row is the 8-topic phase record, kept for the audit trail; the curriculum is 204
since 4.8, where the three counts are 204 = 204 = 204.) `rigid_transformations` is a distinct id from the pre-existing Algebra topic
`transformations`, because one moves a point in the plane and preserves every distance while the other
moves a graph and does not.

### O2 — Mental mode grades more narrowly than single mode (CLOSED)
`gradeAnswer` in `src/main/Answer.ts` now owns the whole decision for **both** modes: `=`-splitting,
then the shared `compareExpressions` against the key and the alternate, then `isAnswerCorrect`.
`x=5`, `(x+1)^2` and `2y+x` are accepted in mental mode. The two `vi.mock("../../main/Settings")`
factories were updated rather than worked around — `Session.test.ts` now uses `vi.importActual` for
the real `isAnswerCorrect`, because a stub returning `true` is what let a broken grader pass.

### O3 — `latexToPlain` does not handle two printed forms (CLOSED)
`45^{\circ}` and `\cdot` are handled, in both modes, and the browser run added the Unicode radical
sign `√` to the same treatment (see 4.12). The remaining gap named here — `\frac` with a nested
brace level, as in `\frac{1}{\sin(30^{\circ})}` — is closed by a bounded balanced-brace parser
that also handles indexed roots, with regression tests for nested fractions, roots around
fractions, and fractions inside trig functions.

### O4 — MCQ tests still permit option sets that are not four (CLOSED)
`src/__tests__/main/Mcq.test.ts` asserts the contract rather than a bare length: exactly the
configured count, exactly one option correct, no two options the same value, nothing unusable. The
user-facing "Number of choices" setting (2–6, default 4) is kept, so the four-option invariant is
asserted explicitly on the default path and generalized to the configured count elsewhere. The oracle
gate now checks the **raw generator output** as well as the presented set, for
`tooFew`/`duplicate`/`nonFinite`/`alsoCorrect`/`correctAbsent`, and not for `correctNotFirst` because a
generator may shuffle its key out of first place. The findings and their fixes are in 4.8.

**Known limit, recorded rather than hidden:** word answers are judged by a
closed-vocabulary canonical form, shared by the product and the oracle, so a restated
set name counts as the same option in both. The one case a string rule cannot catch —
a distractor that names the *truth* while the key does not, as in the historical
`number_sets` whole-number list — is caught by a semantic tier in the oracle that
parses the prompt and compares truth sets. The product side cannot do this because it
never sees the prompt, which the comment says. The oracle is at 30 tests.

### O5 — Bundle budget was raised instead of met (CLOSED)
The 40/58 defaults were a dodge for a build that should have been fixed, and they are gone. The
current payload satisfies **JS 34.17 kB, CSS 8.58 kB, total 53.12 kB** against **36/10/55.5**.

The budget moved three times and every move is recorded in `scripts/bundle-check.js`:
35/55 to 38/57 for the 137→204 curriculum growth, 38/57 to 38.5/57.5 for organic growth
after a real 5.31 kB regression was found and fixed first, and 38.5/57.5 down to
36/55.5 when the curriculum tables left the entry chunk (see 4.23). The fix this row
once deferred — the tables behind a dynamic import — is done: every production reader
goes through `Topics.ts`, boot awaits the loader, and the entry carries only the scope
order and the storage key.

What was deliberately **not** done to stay under any number: shortening topic names, dropping
sub-skill branches, or truncating the curriculum. The budget protects the first load; the
curriculum is the product.


### O6 — No enforced coverage threshold (CLOSED)
`vite.config.ts` now sets a floor at the project's real coverage on 2026-10-02, rounded down:
statements 74, branches 58, functions 58, lines 76 (actual 74.48 / 58.70 / 58.76 / 76.87). The gate
demonstrably bites: `Ui.test.ts` alone measures 40.72% statements and fails it.

UI actions are covered end to end rather than by unit test, which is the deliberate
direction this file takes: mocking the DOM harder would test the mocks, while the
Playwright suite drives the real app. The mapping is exact — every control has a spec
that clicks it: topic grid, search, chips and scopes (`single-mode`, `onboarding-app-shell`,
`all-topics-*`), generation and grading in both modes (`single-mode`, `mental-mode`,
`mcq`, the all-topics matrix), hints, solutions and confidence (`daily-help-privacy`,
`desktop-only`), settings and persistence (`settings`, `desktop-only`,
`daily-help-privacy`), the daily challenge (`daily-help-privacy`), worksheets
(`print-worksheet`), the data dialog (`desktop-only`), updates and leaderboard
(`desktop-only`), and a console sweep asserting zero runtime errors across all of it
(`console-errors`). Closing this by unit test alone stays rejected.

### O7 — Remaining `querySelectorAll` on interaction paths (CLOSED)
No `querySelectorAll` remains in `src/main/` outside `src/main/core/DomRegistry.ts`. `Events.ts`,
`Generation.ts`, `Ui.ts`, `WeakTopics.ts` and `DataManagement.ts` were migrated; `Session.ts`'s topic
scan became one pass over the registry's pills.

### O8 — 3D efficiency on mobile (CLOSED)
`src/modules/Geometry/GeometryVisualization.ts` caps the device pixel ratio at 2 and re-applies it when
the ratio changes, stops the loop when the container leaves the viewport or the tab is hidden, honors
`prefers-reduced-motion` as a live query that disables the loop entirely, and draws on demand at a
32 ms frame budget — so an untouched 3D question costs one render pass instead of sixty per second.
Geometry and materials are built once per scene and disposed on teardown, including `Line` and
`GridHelper`, which the old `instanceof Mesh` disposal missed.

### O9 — End-to-end coverage of the new features (CLOSED)
`e2e/daily-help-privacy.spec.ts` runs green: 18/18 across its four groups. The all-topics
matrix runs green: every topic at easy, medium and hard generates and accepts its own
correct answer in a real browser (see 4.14 for how it is run here). `console-errors.spec.ts`
runs green: 22 tests asserting zero console errors, page errors and failed requests across
every category and journey. The §6 table below records the outcome, so the pointer
resolves.

### O10 — Stale architecture doc row (CLOSED)
`docs/guide/architecture.md` now records `check_math` as registered and callable but not load-bearing,
since 4.2 made the JavaScript checker authoritative.

### O11 — Data export and import ignore the new tables (CLOSED)
`src-tauri/src/record.rs` defines a versioned export document and applies an import atomically inside
one SQL transaction; `export_learning_record` and `import_learning_record` are the two new commands.
Merge and replace are explicit, and merge is the default because a merge cannot lose a record and a
replace can. The browser path goes through `src/main/services/ReviewStore.ts`, which owns the storage
key, so an import cannot land somewhere the scheduler never reads. `cargo test` is 227 passing,
12 of them new round-trip and refusal tests.

The two destructive controls in the data modal called desktop-only commands, so in a browser they did
nothing at all. They now erase through the storage module where there is no database, which is what
the button's own confirmation promises.

### O12 — No worked solutions for the eight new topics (CLOSED)
Each of the eight generators returns `hints` (a first rung naming that branch's procedure, a second
naming the numbers to use) and `solution` (steps ending in the arithmetic that produced the printed
key), plus the `subskill` the scheduler records. `Help.ts` needed no change: `buildHintLadder` and
`buildSolution` already prefer a generator's own payload, and a test now proves that preference through
the service rather than through the helpers.

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
npm run test:coverage    # vitest run --coverage, enforcing the O6 floor
npx playwright test      # Chromium + WebKit
npm run build
node scripts/bundle-check.js
```

Last full green baseline after this session's work:

| Gate | Result |
|---|---|
| `tsc --noEmit` | clean |
| unit | 132 files, 10,007 passed, 6 skipped |
| oracle | 5 files, 30 passed, including the raw-option gate and table-versus-registry agreement over all 204 topics |
| coverage | floor enforced (74/58/58/76); measured 86.53/72.92/74.31/88.63 |
| `cargo test` | 227 passed |
| `npm run build:web` | built green |
| bundle | JS 34.82 kB, CSS 8.71 kB, total 53.90 kB against 36/10/55.5, referentially whole |
| commits | one file per commit |
| Playwright | 393 tests in 17 files, all three projects, everything run to completion |

Any change to a generator is incomplete until the oracle passes. Any change to a service is
incomplete until `tsc` and its own unit tests pass.

## 7. Definition of done

- Every row in section 5 is closed. The two deliberate decisions are the oracle-only
  semantic tier in O4 and the e2e rather than unit coverage of UI actions in O6; both state what is covered where and why.
- All 204 topics are registered, reachable from the index, and pass the oracle.
- The four rules in section 1 hold for every generator, enforced by CI rather than by review.
- One answer checker, one storage module, one scheduler, one MCQ builder, one backend
  seam — each stated once and reached from everywhere, with no bypass.
- `tsc`, unit, oracle, Playwright, build, bundle, and `cargo test` all green.
- The documented topic count matches `src/main/TopicData.ts`.
- This file is updated in the same commit as anything it describes.

## 8. File index

Authoritative for the promises, per section 3:
- `src/main/services/Storage.ts` — where data goes, whether a write is durable
- `src/main/services/Scheduler.ts` — when a skill comes back
- `src/main/Mcq.ts` — what a question may show
- `src/main/Answer.ts`, `src/main/Settings.ts`, `src/main/AnswerFormat.ts` — how an answer is graded
- `src/main/services/Backend.ts` — the only way application code reaches Tauri

Curriculum wiring:
- `src/main/TopicData.ts` — topic ids, names, icons, categories, `scopeTopics`; loaded on demand
- `src/main/Constants.ts` — the synchronous keys: `scopeLadder`, `SESSION_STORAGE_KEY`
- `src/main/Topics.ts` — the table loader and accessors every reader uses
- `src/modules/<Subject>/RegisterTopics.ts` — generator to topic binding
- `src/modules/<Subject>/index.ts` — re-exports the oracle resolves through
- `src/modules/shared/SubSkills.ts` — the scheduling taxonomy, one row per sub-skill
- `src/modules/shared/Options.ts` — the one option-set assembler every generator routes through
- `src/modules/shared/Numeric.ts` — `roundTo`, `fmt`, `fmtTrim`, `pickDivisible`
- `src/modules/shared/Random.ts` — `shuffle`, `randInt`, `pick`

Tests and gates:
- `src/__tests__/oracle/` — the invariants in section 1
- `src/__tests__/main/Mcq.test.ts` — the option-set contract (see O4)
- `.github/workflows/ci.yml` — unit, oracle, E2E, and the Windows fixed-runtime build
- `scripts/bundle-check.js` — payload budget
- `vite.config.ts` — the Vitest projects and the coverage floor
