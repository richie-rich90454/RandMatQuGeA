# Pull Request: RandMatQuGeA v3

**Branch:** `version-three` → `main`
**Scale:** 1,464 commits · 637 files changed · +86,082 / −43,257 lines
**Version:** 3.0.0

---

## Table of Contents

1. [Summary](#summary)
2. [What This Branch Is](#what-this-branch-is)
3. [The Two Rules That Are Never Traded Away](#the-two-rules-that-are-never-traded-away)
4. [The Curriculum: 137 → 204 Topics](#the-curriculum-137--204-topics)
5. [Choosing a Topic When There Are 204 of Them](#choosing-a-topic-when-there-are-204-of-them)
6. [Adaptive Learning, and Where It Is Not Offered](#adaptive-learning-and-where-it-is-not-offered)
7. [Privacy: One Module Owns Where Data Goes](#privacy-one-module-owns-where-data-goes)
8. [Answer Grading: One Checker, and the Forms It Had to Learn](#answer-grading-one-checker-and-the-forms-it-had-to-learn)
9. [The Confidence Question, and the Ordering Bug Behind It](#the-confidence-question-and-the-ordering-bug-behind-it)
10. [Boot Order](#boot-order)
11. [The Backend Seam](#the-backend-seam)
12. [Tauri Versions: The Mismatch That Stopped `tauri dev`](#tauri-versions-the-mismatch-that-stopped-tauri-dev)
13. [Payload: The Curriculum Tables Leave the Entry Chunk](#payload-the-curriculum-tables-leave-the-entry-chunk)
14. [The Service Worker Was Serving HTML for Missing Scripts](#the-service-worker-was-serving-html-for-missing-scripts)
15. [Touch, Layout, and Accessibility](#touch-layout-and-accessibility)
16. [Bugs Found by Running the Suite in a Real Browser](#bugs-found-by-running-the-suite-in-a-real-browser)
17. [Bugs Found by Auditing Instead of Reading](#bugs-found-by-auditing-instead-of-reading)
18. [American English, and Where Identifiers Are Not Prose](#american-english-and-where-identifiers-are-not-prose)
19. [Testing Strategy](#testing-strategy)
20. [Evidence](#evidence)
21. [Merge Danger](#merge-danger)
22. [Deliberate Decisions Recorded Rather Than Hidden](#deliberate-decisions-recorded-rather-than-hidden)
23. [Files Worth Reading First](#files-worth-reading-first)

---

## Summary

This branch turns a working math practice app into a finished one: a curriculum
that grew from 137 topics to **204**, a single place that decides what is
hidden in which runtime, a single seam where desktop calls live, a single
storage module that keeps its privacy promise, and a test suite that runs the
whole application in a real browser on three engines and finds its own bugs.

```text
RandMatQuGeA/
├── src/
│   ├── index.html                    static shell; every manipulated element has an id
│   ├── script.ts                     boot sequence only
│   ├── main/                         behavior, grouped by concern
│   │   ├── core/                     AppState, QuestionState, DomRegistry, renderer,
│   │   │                             DomVisibility, GatedSurfaces
│   │   ├── services/                 Storage, Scheduler, ReviewStore, Backend (the
│   │   │                             Tauri seam), Help, DailyMode, DailyChallenge,
│   │   │                             TopicRegistry, Viewport
│   │   ├── Topics.ts                 the grid, search, chips, scopes, table loader
│   │   ├── TopicData.ts              the 204 topic definitions (on-demand chunk)
│   │   ├── Constants.ts              the two constants that load synchronously
│   │   ├── Answer.ts                 grading, and the review queue
│   │   ├── AnswerFormat.ts           one answer normalizer, shared by three callers
│   │   ├── Mcq.ts                    the option-set contract
│   │   └── Generation.ts             question orchestration
│   ├── modules/                      157 generator files across 7 subjects
│   └── __tests__/                    10,007 unit cases, 30 oracle cases
├── e2e/                              17 specs, 393 tests, 3 browser projects
├── src-tauri/                        Rust: SQLite, scheduling, PDF, export/import
└── scripts/bundle-check.js           payload budgets and build integrity
```

The two headings that matter most for a reviewer:

- **Nothing is offered that cannot work.** Where adaptive learning, the learning
  record, or the updater cannot run, the surface is removed, not disabled. One
  module (`GatedSurfaces.ts`) owns the list, and one predicate decides.
- **Every claim in the documentation is a number a gate produced.** The README
  carries measured counts, and every open item from the branch register was
  closed against its acceptance test before merge — none remain.

---

## What This Branch Is

`main` holds an app that generates random mathematics questions and grades them.
It works, and parts of it are subtle. This branch is the completion pass:

- **Curriculum**: 137 → 204 topics, every one registered, reached from the index,
  given sub-skills, hint ladders and worked solutions, and sampled by the oracle
  at every difficulty.
- **Completion of the four "one owner" promises**: one answer checker, one
  storage module, one scheduler, one option-set builder — each stated once and
  reached from everywhere, with no bypass.
- **A fifth owner added**: `Backend.ts`, the seam every Tauri call passes
  through, because the style guide required it and the module did not exist.
- **Runtime correctness**: surfaces that cannot work are hidden; private session
  means nothing is kept; the desktop build no longer claims otherwise.
- **Scale correctness**: 204 topics needed a filter, a search, and a way out of
  a scope that excludes what the learner is looking for.
- **Verification**: the end-to-end suite now runs the whole application —
  all 204 topics at all three difficulties, every mode, every dialog — on
  desktop Chromium, mobile Chrome and mobile Safari, and asserts zero console
  errors, page errors and failed requests along the way.

---

## The Two Rules That Are Never Traded Away

Everything else in this document is secondary to these, because breaking either
silently produces **wrong answers** rather than a build error:

1. **A generator's printed question and its claimed answer must be the same
   problem.** The dominant cause of violation is rounding something other than
   the printed value: computing a magnitude from unrounded coordinates and then
   printing the coordinates rounded. The rule is *round once, where the value is
   drawn*, and use that one rounded value in the prompt, the key, every
   distractor, and every step of the worked solution.
2. **A multiple-choice question must have exactly four options, exactly one of
   which is correct.** Corollary that has bitten this repository repeatedly: a
   distractor that is *also* correct is as much a defect as a wrong key.

Both are enforced by the oracle rather than by review, and this branch extended
the gate to the **raw generator output** as well as the presented option set, so
a generator that produces a bad set and a presenter that fixes it up are two
different findings, not one silent pass.

Additional generator rules the branch had to repair in the wild, each with a
regression test:

| Rule | What went wrong | Why it matters |
|---|---|---|
| LaTeX delimiters are `\( … \)` and `\[ … \]` | A prompt printed `$` and `$$` | Neither renderer treats those as delimiters, so the learner saw raw markup |
| No Unicode symbols inside math groups | `√x` printed as a bare radical; non-breaking hyphens in `\text{}` | KaTeX strict mode rejects them, and the prompt fell back to raw markup |
| Round once, at the draw | A vector magnitude computed from unrounded components | The learner read `(2.5, 1.7)` and was graded on `(2.53, 1.74)` |
| Bound every rejection loop | An unbounded redraw loop | It hangs the oracle instead of failing it, which is far more expensive to diagnose |
| The prompt must not contain the answer | A generator interpolated a computed value into the question text | The question answers itself |
| Every question must be answerable | A triangle violating the triangle inequality; a singular system asking for a unique solution | There is no correct answer to grade |
| Randomness is injected | A helper drawing from the global source | A seeded worksheet or daily set stops being reproducible |

---

## The Curriculum: 137 → 204 Topics

Sixty-seven new topics, chosen from an inventory of what the 137 did not have,
rather than as more instances of procedures already present. The ordering
matters and is deliberate: determinants before Cramer's rule, degrees before
Euler, the triangle inequality before triangle area, exact values before
identities.

| Subject | Added | Examples |
|---|---|---|
| Arithmetic | 8 | prime factorization, LCM and periods, money and change |
| Algebra | 8 | absolute-value equations, systems of inequalities, polynomial theorems |
| Calculus | 9 | optimization, L'Hôpital, Taylor series, the mean value theorem |
| Discrete Mathematics | 13 | graph basics, Euler paths, graph coloring, spanning trees, Boolean algebra |
| Geometry | 11 | triangle congruence and inequality, circle geometry, composite figures |
| Linear Algebra | 10 | eigenvalues, orthogonality, cross products, rank, null space |
| Trigonometry | 8 | law of sines and cosines, the ambiguous case, complex polar form |

**What the option-set contract cost at this size.** Every one of the 67 new
generators reaches four honest options on every branch, and the branches whose
natural question was yes/no were **redesigned rather than padded**:

- `absolute_value_equation/no_solution` became *"which of these four equations
  has no solution"*.
- `graph_euler/euler_path` became *"which pair of vertices are the odd-degree
  ones"*.
- `relations/*` each became a count the learner can read off the printed pair
  list.

Padding an option set with a placeholder teaches a learner to pick the option
that looks like an answer instead of reading the question, and `CODE_STYLE.md`
is explicit: there is no fallback filler anywhere in the codebase.

**The one ambiguity the generators refused to assert.** The law-of-sines brief
stated the ambiguous-case rule as "two solutions when `h < b < a`", which is
inverted: for SSA with `A` acute, `b < a` gives one triangle. The correct rule
(`h < a < b`) is implemented, and rather than assert it the generator computes
both candidate angles, keeps those leaving a positive third angle, and verifies
each against the cosine rule before offering it.

**Registration is asserted, not written down.** The oracle checks the sub-skill
table against the registered topics in both directions, and this branch added
`topicTable.test.ts`, which checks the topic table against the registry in both
directions and checks that every scope names a real topic. See
[Evidence](#evidence) for the bug that gate was written in response to.

---

## Choosing a Topic When There Are 204 of Them

The grid was a flat wrapped list of pills. At 137 that is browsable. At 204 it is
not, and on a phone it was worse: the mobile rule turns the container into a
horizontal strip, so 204 topics became 204 unlabeled targets in a scroller with
nothing to anchor them. No unit test can see this, because the grid was doing
exactly what it was written to do.

```text
before
  [add][subtrt][mult][divid][place_value][negative_numbers][long_division]…
  204 pills, no headings, no filter

after
  [All 204] [Arithmetic 12] [Algebra 61] [Calculus 19] [Linear Algebra 22] …
  ── Arithmetic ──────────────────────────────────────────────
  [ + Addition ] [ − Subtraction ] [ × Multiplication ] …
  ── Algebra ─────────────────────────────────────────────────
  [ a/b Fractions ] [ % Percentages ] …
```

- **Grouped under a heading per category**, with a chip row that filters to one
  category, each chip carrying how many topics the current scope holds.
  `Algebra 0` is printed rather than a bare `Algebra`, because a category that
  exists and is empty is a different message from one that is not there.
- **The category is part of the searchable text.** No topic is named after a
  category, so typing "trig" or "geometry" previously answered "nothing matches"
  to a query naming something the grid is full of. Sub-skill names are
  deliberately **not** indexed: they are internal identifiers no learner has
  read, and a match on text they cannot have seen is a result that cannot be
  explained.
- **A selected topic the filter has hidden is deselected**, so pressing Generate
  can never answer from a topic whose pill is not on screen.
- **The chips and the search box reach their target.** The default scope is the
  twelve arithmetic topics, and against it every other chip read `Calculus 0` in
  the dimmed style, which reads as *unavailable* rather than *not in this
  scope*. Typing `sin` returned an empty grid, which is worse, because naming a
  topic is about as unambiguous a request as this interface gets. Both now widen
  the scope to the narrowest one that holds the target and leave the scope
  control showing what changed, so the narrowing that was given up is visible
  and can be taken back. `scopeLadder` in `Constants.ts` declares the order they
  widen in.

Cost: 0.55 kB of the JavaScript budget and 0.27 kB of the CSS budget.

---

## Adaptive Learning, and Where It Is Not Offered

Adaptive learning is a spaced-repetition scheduler with a bounded
overconfidence correction, tracked per topic **and** per procedure within a
topic (`src/main/services/Scheduler.ts`). It is the most interesting feature in
the app and it cannot run everywhere, which is where the bugs were.

**It needs two conditions, and the app checked one.** The scheduler's inputs are
performance records written over Tauri IPC, so a browser never holds them. And a
private session discards the record when the window closes, so even the desktop
app under a private session has nothing to schedule from. Gating on the runtime
alone offered a switch that changed nothing.

**Hiding must remove, not disable.** The style guide's rule is that a feature
either works in every environment or is hidden where it cannot. A disabled switch
and a button that notifies on press both leave the learner reading about a
feature they cannot use.

**The rule was applied at each call site, so surfaces were missed.** Three were
hidden and four were not:

| Surface | Why it must go | Found by |
|---|---|---|
| Adaptive switch row | Changes nothing where it cannot run | Original work |
| Recommendation button | Could only report itself unavailable | Original work |
| Weak-topics modal | The list behind the button | Original work |
| **Confidence control** | Asked after every graded answer; its only reader is the scheduler | User report |
| **Streak badge** | Counts a record; in a browser it can only ever read zero | User report |
| **Learning-record dialog** | Export, import, erase and refresh all describe a record that does not exist | User report |
| **Updates section** | Presented in a browser, answered a press with "needs the desktop app" | User report |

`src/main/core/GatedSurfaces.ts` now owns the list and applies it, with three
gates that are three genuinely different questions:

```text
adaptive   needs the desktop runtime AND a store that will still have the record tomorrow
record     needs a store at all
tauri      needs the desktop runtime
```

A surface added later is hidden by adding one line to a table, which is the
property a call-site decision does not have.

Two consequences worth noting for review:

- **The confidence question is not asked in a browser.** It was collecting,
  storing, and reading nothing. The `Help.ask` call now carries the same
  predicate that guards the review write, so the question and its consumer
  cannot drift apart.
- **The streak badge is gated on `adaptive`, not on "something is kept".** The
  weaker condition would show a badge in every browser that says "remember me"
  while the number it displays is permanently zero, which reads as a fact about
  the learner rather than as a missing feature.

---

## Privacy: One Module Owns Where Data Goes

`src/main/services/Storage.ts` owns desktop SQLite, browser IndexedDB, and true
zero-retention mode, behind one interface. Nothing else decides whether a write
is durable. This branch closed the places that did not go through it.

**The session snapshot was written straight to `localStorage`.** Five call sites,
unguarded, without a `try`/`catch`, on a debounce, on every answer and on every
skip — in every mode, including a private session. It was then read back at boot,
restoring a session the learner had asked not to have kept. All five now go
through `Storage`, which drops the write when the mode is `zdr` and keeps it for
the other two, so a snapshot still survives a reload wherever a record is kept.

**The migration list named a key the app no longer wrote.** `LEGACY_KEYS` listed
`sessionState` while the live key was `mentalSessionSnapshot`, so
`migrateFromLocalStorage` could never move or remove the one thing a private
session was supposed to leave behind. The live key is now imported from
`Constants.ts`, because a second literal is a second thing to forget.

**The settings document was read through a path that answers nothing.** One
document decides the persistence mode, and it was being read while the mode was
still its default private session. So a browser told to keep its record stored the
document faithfully, and it survived a reload intact while the interface came
back showing defaults. The worst shape this failure takes: the data is there, it
is correct, and the learner is told their settings did not save.
`Storage.readPersisted` reads the one document that decides the mode, writes
nothing, and declines to open a database in the desktop build at all.

**One `invoke` had no browser path.** Deleting a single record reached into the
backend with no `isTauri()` check. It was the only unguarded call in the
repository, it was reachable from a button that does appear in a browser, and the
rejection replaced the record list with the error text. It now branches the way
clearing all data and resetting already did.

**The desktop build displayed a mode it was not in.** The mode control was filled
from the stored *choice* rather than the mode in force, and disabled at the same
time, so the desktop app said "nothing is stored" while writing to disk. That
false claim is what made the adaptive surfaces look like a contradiction rather
than a consequence. `effectivePersistence()` is now the single answer, the
control reads it, the adaptive gate reads it, and the select has a third option
that names the desktop store truthfully.

| Mode | What is kept | Where |
|---|---|---|
| **Private session** (web default) | Nothing at all after you close the tab | Memory only |
| **Keep on this device** (web) | Settings, review schedule, streak, records | IndexedDB, this browser only |
| **Desktop** | The same, plus performance data | SQLite in the app's data directory |

---

## Answer Grading: One Checker, and the Forms It Had to Learn

The desktop and web builds had **two different answer checkers**, and they
disagreed. `checkAnswerFast` called the Rust command `check_math` first and fell
back to JavaScript only when Rust said "wrong". The Rust path could not parse a
fraction, a LaTeX fraction, or any expression.

The root cause was sharper than "Rust is too weak": `isAnswerCorrect` handed the
key to mathjs **as the generator printed it**, so a key of `\frac{3}{4}` was
unreadable. That hit mental mode on **both** builds, because single mode escapes
it by running `convertLatex` first. The divergence was mental-versus-single, and
it rejected precisely the answer the hint ladders invite: `0.52` for a key of
`\frac{\pi}{6}`.

**Resolution: one checker.** `isAnswerCorrect` in `Settings.ts`, reached through
`gradeAnswer` in `Answer.ts`, owns the whole decision for both modes. The
pipeline, in order:

```text
gradeAnswer(userInput, correct, alternate)
  1. equation splitting      both sides compared separately; a symbol-free right
                             side compared numerically (5^2 ↔ 25)
  2. expression comparison   the whole answer against the key, then the alternate
  3. numeric comparison      exact fraction, rounded value, degree-marked comparison
```

`latexToPlain` in `AnswerFormat.ts` is the one place that decides an answer's
spelling, and this branch taught it four printed forms it could not read:

| Printed form | Before | After |
|---|---|---|
| `45^{\circ}` | Rejected | Read as degrees in both directions |
| `\cdot` | Rejected | Read as multiplication |
| `√5` (Unicode radical) | Rejected by mathjs | Rewritten to `sqrt(…)`, accepted either way |
| `\frac{1}{\sin(30^{\circ})}` | Stopped at the first nested brace | A bounded balanced-brace parser converts nested fractions and indexed roots |

Word answers were a separate blind spot: `number_sets` could classify `0` and
offer the whole-number list, which is **also correct**. String comparison cannot
see that, and any pure-string rule that flags it also flags the honest
distractors. `AnswerFormat.ts` now owns a closed-vocabulary canonical form shared
by the product and the oracle, plus a semantic tier in the oracle that parses the
classification prompt and compares truth sets — which is where the string rule
genuinely cannot reach, because the product never sees the prompt.

---

## The Confidence Question, and the Ordering Bug Behind It

The scheduler adjusts for the gap between how sure a learner was and how they
actually did. That needs the confidence captured, and capturing it after every
answer would make it a habit rather than a judgment, so it is asked only when the
answer was informative and the question was on screen long enough to have been
thought about.

Two defects, and neither was visible from the outside:

**The function destroyed the value it had just been given.** `recordConfidence`
set `questionState.confidence` and then called `hideConfidence()`, which sets it
back to `undefined`, in the same synchronous call. Asking the question and
erasing the answer is why **no record ever carried a confidence** — not in a
browser, and not on the desktop where the row was shown and the learner could
watch it being collected.

**The record was written before the question was asked.** The review record for
an answer was written during grading, and the confidence row is revealed after
the verdict, so confidence for answer *N* could never reach the record written
for answer *N*. The fix is deferral:

```text
on answer graded
  write the aggregate (difficulty, correctness, error type) immediately
  queue the review, carrying no confidence yet

on whichever happens first
  the learner answers the confidence prompt  → write the review with it
  the next question, or dismissal            → write it without one
  five seconds elapse                        → write it without one

exactly once, under every path, including rapid answers
```

`flushPendingReview` nulls the slot synchronously before its first `await`, so
exactly-once holds even when answers arrive faster than writes complete. Five
unit cases pin the hold, the flush, the timeout, the exactly-once, and the
no-queue-where-adaptive-cannot-run.

---

## Boot Order

Start-up reads a settings document and a review record before the app is
interactive, and two bugs lived in the order those reads happened.

**The persistence choice was applied before the settings were read.**
`initApp` called `loadSettings()` **without awaiting it**, then applied the
persistence choice — which is itself one of the stored settings. The mode was
therefore decided from the default, a private session, before the stored document
had arrived. Choosing "keep on this device" wrote nothing that survived a
restart: the choice was stored correctly, the document survived intact, and the
learner was told their settings had been kept. Nine end-to-end cases failed for
this reason and nothing else.

```diff
 async function initApp(): Promise<void>{
-    settings.loadSettings();
+    await settings.loadSettings();
     await settings.applyPersistence(settings.settings.persistence);
```

**The curriculum tables were awaited before the first render.** Once they moved
to their own chunk (see [Payload](#payload-the-curriculum-tables-leave-the-entry-chunk)),
boot had to wait for them, because the grid, the scope restore and the mode
switches all read them, and a render that ran first would show an empty grid with
no way back to a full one.

Start-up now finishes by publishing one honest signal:

```text
document.documentElement[data-app-ready="true"]
```

It is set **last**, after every boot step, and it is set even if some of those
steps failed: a partly working app is still an app, and a flag that never arrives
is worse than one that arrives. The end-to-end suite waits on it rather than on
the leaderboard rendering, which is a proxy that goes true part way through boot.

---

## The Backend Seam

`CODE_STYLE.md` required desktop calls to live behind
`src/main/services/Backend.ts`, guarded by capability checks. **The module did not
exist**, and seven files invoked Tauri plugins directly.

Every desktop call now passes through the seam, which checks `isTauri()` and
either invokes or returns the typed fallback the caller already handles:

```text
Backend.ts
├── records      savePerformance, saveAttempt, saveSkillSchedule, loadSkillSchedule
├── schedule     getNextQuestionRecommendation, getWeakTopics, getPerformanceStats
├── data         exportLearningRecord, importLearningRecord, deletePerformanceRecord,
│                clearPerformance, resetAllData
├── scores       saveScore, loadScores, deleteScore
├── worksheets   generateWorksheetSeed, exportWorksheetPdf
├── dialogs      openFileDialog, saveFileDialog
└── platform     checkForUpdate, relaunchApp, getAppWindow
```

Outside Tauri each function returns the fallback its caller expects — an empty
list for a query, a no-op for a void write, the typed error where the caller
already catches. The migration is mechanical: same commands, same argument order,
same error handling. `DomRegistry` no longer imports the Tauri window type even as
a type, so the rule holds to the letter.

---

## Tauri Versions: The Mismatch That Stopped `tauri dev`

`npm run tauri dev` refused to start:

```text
Error: Found version mismatched Tauri packages
```

Four crates and four npm packages sat on different minors. The first attempt
pinned the JavaScript packages **down** to the locked Rust versions, and that was
wrong in a way the compiler made obvious: pinning `tauri` to 2.10.1 while its
runtime sub-crates resolved independently does not compile at all.

**The fix direction is upward.** Both sides now sit on a matching set, and the
Rust requirements use `=` so cargo cannot resolve to a different minor on its
own:

| Package | Rust | JavaScript |
|---|---|---|
| `tauri` | 2.12.1 | `@tauri-apps/api` 2.12.1 |
| updater | 2.13.1 | 2.13.1 |
| dialog | 2.8.0 | 2.8.0 |
| process | 2.4.0 | 2.4.0 |

Two things found along the way:

- **There were two `Cargo.lock` files.** The root one is the workspace lock;
  `src-tauri/Cargo.lock` was a stale leftover naming a different `tauri`. Two
  locks for one workspace is two answers to "which crates is this built from",
  and it is how the drift went unnoticed. Removed.
- **`tauri info` is the check, not the build.** It reports every pair and flags a
  mismatch before anything compiles. `README.md` documents the rule and quotes
  the error, because the next person to bump one side deserves to know.

---

## Payload: The Curriculum Tables Leave the Entry Chunk

`Constants.ts` held 24.5 kB of tables — the 204 topic definitions and the scope
lists — in the entry chunk. That is data, not code, and it was a sixth of the
initial payload.

```text
before
  index.js  38.10 kB gz   ← includes every topic name, icon, category and scope list
  …generators load per subject through a dynamic import, costing nothing up front

after
  index.js        34.17 kB gz   ← the shell, plus scopeLadder and SESSION_STORAGE_KEY
  TopicData.js     5.0 kB gz    ← awaited by boot before the first render
  …generators unchanged
```

Six production modules read the tables, and every one of them now reads through
`Topics.ts` accessors (`topicName`, `scopeIds`, `allTopics`, `scopeTopicIds`).
No shipped source imports the tables statically — a static import anywhere would
put them back in the entry chunk the split took them out of, so the module header
says so and the file index repeats it.

**The budget moved three times, and every move is recorded in the file it
affects** rather than in a commit message:

| Move | Reason |
|---|---|
| 35/55 → 38/57 | Curriculum grew 137 → 204; the tables grew with it |
| 38/57 → 38.5/57.5 | Organic growth, **after** a real 5.31 kB regression was found and fixed |
| 38.5/57.5 → **36/55.5** | The split happened; a budget keeps the headroom it needs and no more |

**The 5.31 kB regression is worth a paragraph.** Importing the settings module
into the hint module — to ask there whether adaptive could run — grew the entry
chunk from 38.11 to 43.41 kB, because a leaf that draws a row of buttons was made
to depend on most of the application. It was attributed by **reverting each
changed file and rebuilding, one at a time**, which is the only way to tell a five
kilobyte regression from ordinary growth. The fix passes the decision in: the
caller already owns the predicate. Six development traces that printed the
adaptive decision to a shipped console went at the same time, one of which
claimed a performance save in a browser where no save happens.

`scripts/bundle-check.js` now also checks that **the build is referentially
whole**: every asset named by `index.html`, and every chunk named by an import
inside an emitted chunk, has to exist on disk. Writing that check took three
attempts, two of which were checks that reported success while verifying nothing
— the minifier emits template literals, and markup references arrive with the
`./` already stripped. It was proven able to fail by hiding a chunk from `dist`
and watching it name that file.

---

## The Service Worker Was Serving HTML for Missing Scripts

The reported failure was a module script arriving as `text/html` and a subject's
generators failing to load at the moment a question was requested.

The build on disk was self-consistent, so this was not a stale build.
`public/sw.js` answered a failed **script** request with `index.html` — correct
for a navigation, wrong for a script — and cached the response **before checking
its content type**, so an HTML body was stored against a `.js` URL. That survives
the rebuild that would otherwise have fixed it, and every later load fails the
same way.

```diff
 fetch(request)
-  .catch() → return caches.match("index.html")
+  .catch() → 404 when the request is not a navigation
+  cache only when the content type matches the extension
```

The type is checked before anything is stored, and a failed asset request answers
404, which names the file. A missing chunk is now a build failure
(`bundle-check.js`) rather than a runtime surprise.

---

## Touch, Layout, and Accessibility

An audit of the stylesheet, the markup and the viewport code found 35 items. The
functional hunt alongside it found nothing. The fixes:

**Taps the app swallowed.** Three mobile failures with no console error and
nothing rendered:

- The deferred keyboard reveal could fire between press and release of the next
  tap on a coarse pointer, turning the tap into a scroll with no click. An
  arriving tap now cancels the pending scroll, and a scroll never fires
  mid-press.
- A WebKit touch tap reports a **null related target** on blur, which dropped the
  focus class and hid the math toolbar under the finger. Coarse pointers now keep
  the toolbar shown and keep focus until something outside the card takes it.
- The clipboard test granted a permission **WebKit rejects**, so it failed before
  touching the app. It now skips on WebKit.

**A tap that landed on nothing.** The intermittent matrix failure was not a
broken grader: the verdict appeared four milliseconds after the handler ran, and
a second click always worked. Typesetting and the debounced answer preview reflow
the card between the click's hit test and its dispatch. Three fixes: the renderer
publishes a typeset-complete counter, the harness waits for geometry to settle
after generating *and* after typing, and the checker releases its reentrancy
guard once the verdict is on screen — holding it across the daily-set bookkeeping
would drop a learner's click with no verdict and no message.

**Controls that never hid.** A bare `hidden` attribute loses to an author
`display` rule, so five controls rendered while the DOM reported them hidden. One
global `[hidden]` rule covers both mechanisms.

**The keyboard reveal scrolled the wrong box.** Phones scroll the inner content,
not the window, so the answer stayed behind the keyboard. The nearest scrollable
ancestor takes the delta now.

**Keyboard focus escaped every dialog.** Tab walked out of each of the six modals
into the app behind it. One observer covers all six from every open path: focus
moves in on show, returns on hide, and Tab cycles inside — proven by a browser
case, not by review.

**Narrow viewports.** Setting rows, print fields, action buttons, worksheet
headers and long option, name and field text wrap or shrink at 320 px; desktop
shortcut hints hide where the shortcuts do not exist.

**Touch targets.** Category chips, mode and settings tabs, checkbox label rows,
selects and the clear button join the **44 px** floor on coarse pointers, with the
visual size unchanged where the layout requires it.

**Toasts, modals and veils.** Notifications and badges respect safe areas and sit
**below** dialogs; the loading veil sits above them. A toast that pops over an
open dialog reads as part of the dialog.

**Print.** Dark-theme mathematics printed near-white on white paper. Paper now
gets black math, unclipped equations, `break-inside: avoid` per question, and
page margins.

**Contrast.** The verdict text — the one word the learner most needs to read —
measured near 2:1. Each theme now has an AA-passing cut of its success and error
colors, and the dark blocks declare the tertiary they use.

**Reduced motion** was already honored globally and remains so; dead declarations
that named no keyframes were removed.

---

## Bugs Found by Running the Suite in a Real Browser

Every one of these is invisible to a unit test, which is the argument for running
the suite in a real browser at all.

| Bug | Symptom | Root cause |
|---|---|---|
| The daily challenge threw before the first question | The mode looked open and was unusable | `current` is −1 before anything is answered, and `enter` indexed `slots[-1]` |
| The hint button was offered with nothing behind it | A button that could not work | `prepare` disables it, and `prepare` only runs once a question exists |
| Hiding did nothing | Five controls stayed on screen | A class selector outranks the user-agent rule for `[hidden]` |
| A trigonometric graph question showed no graph | Every `trig_graph` question lost its figure and paid for a WebGL context | The router listed six canvas shapes and implemented seven; the seventh fell through and deleted what it had built |
| A key printed with the Unicode radical could not be graded | A correct answer marked wrong | `√5` reached mathjs as a bare radical character |
| MCQ choice comparison concluded the key was missing | A test timed out on a question it could see | KaTeX renders a negative with a Unicode minus, and annotation nodes repeat the text |
| The theme and font defect | A setting worked and was gone after a reload | Boot order, described above |
| **A topic id renamed by accident** | A pill that looked normal answered "Unknown topic" | A spelling sweep changed the id in the table while `registerTopic` kept its own spelling |

Six end-to-end cases had also gone stale — two waited for a browser dialog for
messages that are toasts, one waited for a message that no longer exists, one
selected a Calculus topic under an algebra scope, one asserted an empty
`localStorage` when the interface legitimately keeps two preferences there, and
the harness seeded flat keys the app only reads for migration. All six are
corrected, and each correction is in the commit message.

**Two cases could not fail, and that is its own bug class.** `mcq.spec.ts` had
two cases around grading and neither asserted what its name said: one put every
assertion *inside* its click loop, and the other clicked a blind position and
counted successes, which passed only when the key happened to be drawn first — a
quarter of the time. Both now locate the choice from the answer and check both
directions on fresh questions.

---

## Bugs Found by Auditing Instead of Reading

Three defects came out of auditing every write and every surface rather than
reading the one module that owns each promise.

- **`LEGACY_KEYS` named an earlier key**, so the migration could never remove the
  one thing a private session was supposed to leave behind.
- **The session snapshot bypassed storage entirely**, in every mode, including a
  private session it then restored at boot.
- **The bare `hidden` attribute** versus author `display`, above.

And one bug was found by asking what a *draw* is rather than what a line does:
`generateBasicFunctions` **discarded its difficulty parameter**, so easy and hard
drew from the same pool and asked the same types. Easy now names familiar shapes,
medium mixes naming with properties over a wider pool, and hard leans on
properties across all twelve families, all drawn from the injected seed. Two rng
fixtures moved with the narrower medium pool, and a new case asserts easy asks
names only while hard reaches every family across seeds.

Three apparent hang hunts (`func_concepts`, `parametric_motion`,
`complex_mult_div`) each ended with **no hang**: four hundred seeds through
generate, render and grade in Node completed in under five seconds, and every
accused topic passes solo in the browser in six seconds. They were environmental
kills landing mid-topic, confirmed by reaping stray browsers and re-running the
same shards unchanged.

---

## American English, and Where Identifiers Are Not Prose

535 occurrences across 87 files, and twenty more that a follow-up audit turned up,
verified by running everything: 10,007 unit tests, 30 oracle tests across all 204
topics, and 227 Rust tests. Three things were not mechanical.

- **`aria-labelledby` is a W3C attribute and not an English word.** A plain
  spelling sweep turns it into `aria-labeledby`, which leaves every dialog in the
  app unlabeled to a screen reader with **no test failing**. It is masked out for
  the length of the sweep.
- **`graph_colouring` is a topic id.** Renaming the file, the exported generator
  and the id without each other orphans the topic from a learner's records, so all
  three moved together, along with the four sub-skill ids.
- **The style guide was British.** `CODE_STYLE.md` described the house style in
  the spelling it was correcting.

A later sweep for the remaining stragglers hit the same trap one layer down and
is the reason `topicTable.test.ts` exists. That sweep changed **prose only**: the
display names became `Prime Factorization` and `LU Factorization` while the
`snake_case` ids that records are keyed by stayed exactly as they were, and the
one id it did change was reverted the moment a browser matrix run caught it.

---

## Testing Strategy

Four layers, all of which gate merges.

```text
┌─ unit ─────────────── 132 files · 10,007 cases · mirrors src/ exactly
├─ oracle ─────────────   5 files ·     30 cases · the invariants, over 204 topics
├─ end-to-end ─────────  17 specs ·    393 tests · 3 browser projects
└─ Rust ───────────────           ·    227 cases · SQL, scheduling, PDF, export
```

**The unit suite** mirrors the source tree: `src/main/Answer.ts` is tested by
`src/__tests__/main/Answer.test.ts`. Every DOM test declares
`/** @vitest-environment jsdom */`. Mocking rule: mock the platform seam, never
`localStorage` or `document` directly.

**The oracle** is a separate Vitest project on purpose: it is slow, and a red
correctness gate must not take the unit suite down with it. It samples every
registered topic across difficulties and seeds and asserts: every topic produces
a well-formed question, every prompt renders as valid LaTeX in strict mode, every
multiple-choice question presents four usable options with exactly one correct,
and no distractor is also correct. It also asserts things about the tables:

- every registered topic has a sub-skill row, and no row names an unregistered
  topic;
- the topic table and the registry agree **in both directions**, every scope names
  a real topic, and no id appears twice.

**The end-to-end suite** drives the real app against the Vite dev server on
`:1331` in three projects: desktop, mobile Chrome (Pixel 7) and mobile Safari
(iPhone 14, WebKit). Continuous integration installs both engines. It covers the
full topic matrix, every mode, multiple choice, the daily challenge, hints and
solutions, the data choice, settings, printing, onboarding, the desktop-only
fallbacks, and a console sweep asserting zero console errors, page errors and
failed requests.

**The Rust tests** cover the SQL logic, scheduling, and the pure functions rather
than the Tauri plumbing: 227 cases, including round-trip and refusal tests for the
export/import document.

### Conventions this branch added

- **A test that pins behavior the product has deliberately rejected is wrong and
  gets rewritten, not the behavior.** Three such cases were rewritten here, and
  each commit message says so.
- **A gate that cannot fail is not a gate.** The referential-integrity check and
  the table-versus-registry check were both proven to fail on a real defect
  before being trusted.
- **Nothing is reported as passing that was not run to completion.** Two earlier
  runs had been reported green from logs that were never printed to a summary;
  the correction is recorded in the commit that re-ran them to completion.

---

## Evidence

```text
$ npx tsc --noEmit
(clean)

$ npm run test:unit
 Test Files  132 passed (132)
      Tests  10,007 passed | 6 skipped

$ npm run test:oracle
 Test Files  5 passed (5)
      Tests  30 passed (30)

$ npm run test:coverage
 All files   | 86.53 % Stmts | 72.92 % Branch | 74.31 % Funcs | 88.63 % Lines
 (floor 74 / 58 / 58 / 76, enforced)

$ cargo test -p random_math_question_generator
 test result: ok. 227 passed; 0 failed

$ npm run build:web && node scripts/bundle-check.js
  HTML (index.html):       10.37 kB gzipped
  JS  (index-D4ShQRJX.js): 34.82 kB gzipped
  CSS (index-fUxE1AoX.css): 8.71 kB gzipped
  [PASS] Initial JS budget: 34.82 kB / 36 kB
  [PASS] Initial CSS budget: 8.71 kB / 10 kB
  [PASS] Total initial-load budget: 53.90 kB / 55.5 kB
  [PASS] Build is referentially whole (58 references, 31 files)
  PASS: All bundle budgets satisfied.

$ npx tauri info
  - tauri 🦀: 2.12.1        - @tauri-apps/api  ⱼₛ: 2.12.1
  - tauri-plugin-updater 🦀: 2.13.1  - @tauri-apps/plugin-updater  ⱼₛ: 2.13.1
  - tauri-plugin-dialog 🦀: 2.8.0    - @tauri-apps/plugin-dialog  ⱼₛ: 2.8.0
  - tauri-plugin-process 🦀: 2.4.0   - @tauri-apps/plugin-process  ⱼₛ: 2.4.0
  (no mismatch)
```

### Before and after, on the bugs that mattered most

```text
Persisting a setting, browser, "Keep on this device"
  before:  save → reload → defaults        (data present and correct on disk)
  after:   save → reload → the choice      (9 e2e cases verified this)

Grading a correct MCQ choice
  before:  the matching choice graded wrong (result-success never appeared)
  after:   located from the key, accepted; a different choice rejected

A private session
  before:  wrote a session snapshot to localStorage on every answer
  after:   writes nothing durable, and the migration removes what an
           earlier build left behind

A missing chunk
  before:  a module-script MIME error at the moment a question was requested,
           cached under the script's own URL so it survived a rebuild
  after:   a 404 that names the file, and a build that refuses to ship it
```

### The gate written in response to a real bug

```text
$ npx vitest run --project oracle src/__tests__/oracle/topicTable.test.ts
 Tests  4 passed

  with the id mismatch reintroduced:
 FAIL  registers every topic the table offers
 AssertionError: expected [ 'prime_factorization' ] to deeply equal []
 FAIL  lists every registered topic in the table
 FAIL  names only real topics in every scope
```

---

## Merge Danger

**Door:** two-way.

Every change is revertible by commit, the suite is green at the merge point, and
nothing is destructive. Three qualifications a reviewer should weigh:

- **The curriculum is the product.** Reverting the 67 new topics would remove
  reachable content, but no data is destroyed by doing so: a learner's records
  are keyed by topic id and the ids are stable.
- **The bundle budget moved downward, not upward.** 36/55.5 is tighter than the
  38.5/57.5 it replaces, so the payload regression this branch found cannot
  return unnoticed.
- **One-way decisions are recorded in the files they affect**, not in commit
  messages: the budget's three moves in `scripts/bundle-check.js`, the desktop
  minor-version rule in `README.md`, and the table split's static-import hazard in
  `Constants.ts` and `TopicData.ts`.

**Blast Radius:** broad.

- **Every runtime is touched.** Desktop, browser-with-a-record, and
  browser-private all changed behavior deliberately: adaptive surfaces are
  removed where they cannot run, and the mode control now names the store in
  force. A reviewer who expects the old surfaces in a browser should read
  [Adaptive Learning](#adaptive-learning-and-where-it-is-not-offered) first.
- **Boot is asynchronous in one more place.** The app awaits a settings document
  and a curriculum chunk before it is interactive. Both are awaited, both are
  caught, and `data-app-ready` is published even when a step fails, but a slow
  disk now delays first paint slightly more than before.
- **Mobile behavior changed in the learner's favor.** Taps are no longer
  swallowed, toolbars no longer vanish under a finger, and every control meets
  the 44 px floor on touch. WebKit specifically gained the toolbar and focus
  fixes.
- **Two dependency bumps ride along.** The Tauri CLI moved to 2.12.1 to match the
  app exactly, and `katex`, `vite` and the Node types took their latest
  compatible versions. All are build- or test-time only: the runtime loads its
  own vendored KaTeX.
- **Documentation is claimed to be accurate, so it was audited as such.** An
  independent pass checked every count, table, contract and command signature
  against the source and found seven mismatches, all fixed. If a reviewer finds a
  number here that a gate does not produce, that is a bug in this PR.

---

## Deliberate Decisions Recorded Rather Than Hidden

Each of these is a decision, not an omission, and each is written down where the
next person will find it.

| Decision | Where | Why |
|---|---|---|
| `looksMathematical` cannot judge prose distractors | oracle semantic tier, `AnswerFormat.ts` comment | A word-level rule is shared by product and oracle; the one case strings cannot catch is caught by a semantic oracle tier |
| UI actions are covered end to end, not by unit test | `vite.config.ts` coverage floor, `e2e/` | Mocking the DOM harder would test the mocks; the Playwright suite drives the real app |
| `body { overflow-x: hidden }` stays | `src/style.css` | It is the backstop now that each overflow has its own fix |
| Three theme blocks are not merged | `src/style.css` | Merging them risks every color at once |
| One id keeps its British spelling: `prime_factorisation` | `src/main/TopicData.ts`, sub-skill rows | Ids are what a learner's records are keyed by and are not prose; the display name is American |
| Two `Cargo.lock` files became one | commit, `README.md` | Two locks for one workspace is two answers to which crates ship |
| The oracle stresses 120 seeds on trigonometry only | `src/__tests__/oracle/` | Eight seeds once hid a defect in 26 of them; the rest of the curriculum is sampled by the main gate |

---

## Files Worth Reading First

In this order, if the goal is to understand the branch rather than verify it:

1. **`src/main/core/GatedSurfaces.ts`** — the one place that decides what a
   runtime may see, and the three gates it distinguishes.
2. **`src/main/services/Backend.ts`** — the seam every desktop call passes
   through, and the fallbacks that make a browser safe.
3. **`src/main/Settings.ts`** — `effectivePersistence()`, the answer to "what is
   in force" as opposed to "what was requested".
4. **`src/main/Answer.ts`** — the grading pipeline, and the review queue that
   waits for the confidence question.
5. **`src/main/Topics.ts`** — the on-demand table loader, the scope widening, and
   the search that reaches its target.
6. **`src/main/core/DomVisibility.ts`** and **`src/main/core/QuestionRenderer.ts`**
   — the two small modules that exist because of bugs: hiding that does not work
   when it only sets an attribute, and a typeset-complete signal that exists
   because a click landed on a moving button.
7. **`scripts/bundle-check.js`** — the budgets and their history, and the
   build-integrity check that was proven able to fail.

---

*Written in American English, in the present tense. Every number in this document
was produced by running the command named beside it.*
