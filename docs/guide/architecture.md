# Architecture

## Overview

RandMatQuGeA is a **Tauri v2** application with a TypeScript frontend and a Rust backend. The frontend works as a standalone web app when the Tauri shell is unavailable.

```
┌──────────────────────────────────────────┐
│            Tauri v2 Shell                │
│  ┌────────────────────────────────────┐  │
│  │        Vite 8 (TypeScript)         │  │
│  │  ┌──────┐ ┌────────┐ ┌─────────┐  │  │
│  │  │State │ │Question│ │  Answer │  │  │
│  │  │Store │ │Generator│ │ Checker │  │  │
│  │  └──────┘ └────────┘ └─────────┘  │  │
│  │  ┌──────┐ ┌────────┐ ┌─────────┐  │  │
│  │  │Theme │ │ Session│ │  Topic  │  │  │
│  │  │Manager│ │Manager │ │ Registry│  │  │
│  │  └──────┘ └────────┘ └─────────┘  │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │    Rust Backend (tauri commands)   │  │
│  │  SQLite · PDF · Adaptive Learning  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

## Frontend Architecture

### Entry Point (`script.ts`)

`initApp()` orchestrates bootstrap: loads settings → syncs to state → wires events → inits theme → restores session → loads leaderboard → shows onboarding.

### Core State Machine

**`AppState`** (`StateStore.ts`) — centralized state with getters/setters for:
- Mode (`single` / `mental`)
- Session state (active, paused, score, timer)
- Topic selection, difficulty, scope, shuffle
- MCQ, adaptive learning, weak topic queue

**`QuestionState`** (`QuestionState.ts`) — tracks current question's correct answer and expected format, synced to `window` globals for MathJax access.

**`DomRegistry`** (`DomRegistry.ts`) — cached DOM element access via getter properties. All DOM lookups route through this to avoid repeated `querySelector` calls.

### Question Pipeline

1. **Trigger**: user clicks "Generate" or auto-continue fires
2. **`Generation.generateQuestion()`** — picks topic (shuffle/adaptive/explicit), calls `QuestionGenerator`
3. **`QuestionGenerator.generateQuestion()`** — looks up topic in `TopicRegistry`, dynamically imports the module, calls the generator function
4. **Generator function** — each returns `QuestionDto`:
    ```typescript
    interface QuestionDto {
        latex: string;           // Question HTML with MathJax
        correct: string;         // Canonical answer
        alternate?: string;      // Accepted alternate answer
        display?: string;        // KaTeX-rendered display
        choices?: string[];      // MCQ options
        expectedFormat?: string; // Format hint
        hint?: string;           // Optional hint text
    }
    ```
5. **`QuestionRenderer.applyQuestionDto()`** — renders DTO to DOM, triggers MathJax typesetting

### Answer Checking Pipeline (`Answer.ts`)

Multi-stage equivalence detection:

1. **Preprocessing** — LaTeX → math.js syntax (`\frac{}{}` → `(num)/(den)`, `\sqrt{}` → `sqrt()`)
2. **Sanitization** — lowercase, whitespace removal, Unicode normalization, implicit multiplication
3. **Constant removal** — strips +C for indefinite integrals
4. **Comparison stages** (short-circuits on match):
    - Direct string equality
    - Term-by-term comparison via math.js `symbolicSimplify`
    - Numeric evaluation with tolerance
    - Equation splitting (`x=5` → isolate RHS)

### Topic Registry Pattern

Each subject module has a `RegisterTopics.ts` that imports all generators and registers them:

```typescript
// RegisterTopics.ts
import { registerTopic } from "../../main/services/TopicRegistry";
registerTopic("add", "arithmetic", "generateAddition");
registerTopic("subtrt", "arithmetic", "generateSubtraction");
```

Generators are lazily loaded via dynamic `import()` in `QuestionGenerator.ts`, keyed by scope.

### Theme System

Three modes: `system` (follows OS), `light`, `dark`. CSS custom properties drive the glassmorphism aesthetic. The `.dark` / `.light` class on `<html>` switches all tokens. A `@media (prefers-color-scheme: dark)` block handles system-follow without JS.

## Data and Privacy

Where a learner's data goes is decided in exactly one place,
`src/main/services/Storage.ts`, so the promise can be stated once and audited
rather than being re-decided at each call site.

| Mode | Where data lives | Survives a reload |
|---|---|---|
| `desktop` | The local SQLite database in the Tauri build | Yes |
| `indexed` | IndexedDB in the browser build | Yes |
| `zdr` | A map that exists for the lifetime of the tab | No |

The in-memory map is the source of truth in all three modes, so the session
behaves identically and a value read back after being written is always correct.
Only the durable write is conditional.

Two consequences worth stating plainly:

- A private session writes **nothing** to `localStorage`, IndexedDB or a cookie.
  Records the previous build wrote to `localStorage` are moved into or out of the
  store when the choice is made, so choosing a private session does not leave
  behind data the earlier build had already put on disk.
- Settings are persisted through the same module. A promise about the learner's
  history that did not cover their own preferences would be false in detail.

## The Review Schedule

`src/main/services/Scheduler.ts` combines two models, because each covers the
other's blind spot.

**Spaced repetition** schedules by memory. A card recalled well gains stability
and comes back later; one forgotten loses it and comes back soon. It knows nothing
about the learner.

**Adaptive overconfidence adjustment** supplies what the memory model lacks. Every
answer is recorded with the confidence the learner reported, and the gap between
that confidence and the outcome shifts the retrievability the schedule aims for.
A consistently overconfident learner is pulled back sooner, a consistently
underconfident one gets the credit they are due, and the correction is bounded so
a run of luck cannot freeze a skill.

The result is one number per skill — a due date and a priority — plus a sentence
explaining it, because a schedule that looks arbitrary is one a learner will not
trust. `src/main/services/ReviewStore.ts` owns where those numbers are kept.

## The Daily Challenge

`src/main/services/DailyChallenge.ts` builds the same set for everyone on the same
day, derived only from the local date, so two people can compare and a streak has
something to be a streak about. The date comes from the local calendar rather than
UTC, because a set that turns over at four in the afternoon is not a daily set,
and the topic draw sorts by id rather than iterating a map so the result depends
on the set of topics and not on the order they were recorded in.

It is layered over the review queue rather than competing with it: the daily set
provides the spine and the scheduler fills the remaining slots, so a learner is
never drilled on something due tomorrow at the cost of the day's work, and a
learner with nothing due is never left with a set of nine.

`src/main/services/DailyMode.ts` runs it as a mode. Progress and streak are
derived from the set itself rather than kept as counters beside it, so a streak
cannot disagree with the answers that earned it.

## Help

`src/modules/shared/Hints.ts` derives a hint ladder from what a question already
knows about itself, so every topic has help rather than only those whose
author had time to write some. A generator that supplies its own ladder or
solution wins, because a specific ladder beats a general one.

A ladder is revealed one rung at a time: a list of hints shown at once is a list
a learner reads in order and then uses the last one. The concession that gives the
answer is a separate state the button reaches, not something that happens by
running out of rungs.

## Rust Backend

Built with Tauri v2, the backend provides:

| Command | Purpose |
|---|---|
| `check_math` | Numeric and symbolic comparison |
| `save_score` / `load_scores` / `delete_score` | Score CRUD |
| `save_performance` | Per-topic/difficulty performance tracking |
| `save_attempt` / `load_attempts` | Every answer, kept in full with its confidence and error type |
| `save_skill_schedule` / `load_skill_schedule` | Memory stability, difficulty and due date per topic and sub-skill |
| `clear_performance` | Erases the schedule, the answers and the aggregate together |
| `get_performance_stats` | Aggregate performance queries |
| `get_next_question_recommendation` | Adaptive difficulty + weak topic detection |
| `get_weak_topics` | Weak topic analysis (< 70% accuracy, ≥ 3 attempts) |
| `generate_worksheet_seed` | Reproducible random seeds |
| `export_worksheet_pdf` | PDF generation via printpdf + RaTeX |
| `reset_all_data` | Complete data wipe |

## Module Structure

### Number theory

`DiscreteMathematics/` holds four topics that were absent from the curriculum and
that a learner can check their own work on, which is what makes them the natural
place to learn divisibility:

| Topic | Covers |
|---|---|
| `divisibility` | Divisibility rules as recognition, counting multiples in a range, divisor counts from the prime factorisation, remainders |
| `gcd_lcm` | The Euclidean algorithm, the identity `gcd(a,b) · lcm(a,b) = ab`, recovering one value from the other |
| `modular` | Residues, solving a linear congruence, last digits of powers, congruence classes, divisibility as a congruence |
| `data_analysis` | z-scores, percentile ranks, least-squares slope and prediction, sample standard deviation, quartiles |

Two rules are enforced by construction in these files rather than by convention:

- Every drawn value is rounded **when it is drawn**, and everything downstream
  uses that rounded value. A slope computed from unrounded coordinates and then
  printed rounded is an answer the learner cannot reproduce.
- Divisor sums accumulate by repeated addition. The closed form divides, and a
  power of three over two is not an integer.

```
src/modules/
├── Arithmetic/        (add, subtract, multiply, divide)
├── Algebra/           (linear eq, quadratic, rational, systems, matrices, ...)
├── Calculus/          (limits, derivatives, integrals, series, ...)
├── DiscreteMath/      (logic, combinatorics, sequences, modular arithmetic)
├── Geometry/          (area, volume, distance, angles, Pythagoras, ...)
├── LinearAlgebra/     (matrix ops, determinants, inverses, ...)
└── Trigonometry/      (sin/cos/tan, identities, equations, unit circle)
```

All generators follow the same signature: `(difficulty: string, rng?: RngFn) => QuestionDto`.

There are **129 topics** across 7 subject modules (Arithmetic, Algebra, Calculus, Linear Algebra, Trigonometry, Discrete Math, Geometry). The count is asserted rather than written down: the oracle test compares the registered topic ids against the sub-skill table in both directions, so a topic that is registered without a row, or a row whose key is not a registered topic, is a build failure rather than a note.

## Testing

The project uses a three-layer test strategy:

1. **Unit tests (Vitest + jsdom)** — `src/__tests__/` mirrors the `src/` structure. 7,000+ cases cover generator integrity (every topic × difficulty × seeds), math regression values, answer-checking edge cases, settings persistence, and session logic. `src/vitest.setup.ts` mocks the Tauri API, three.js, and canvas. These run in the `unit` Vitest project.
2. **The generator oracle** — a separate Vitest project, because a red correctness gate should not take the unit suite down with it and because it is slow enough to deserve its own timeout. It samples every registered topic across difficulties and seeds and asserts four invariants: every topic produces a well-formed question, every prompt renders as valid LaTeX, every multiple-choice question presents four usable options with exactly one correct, and no distractor is also correct. `src/__tests__/oracle/vectorPrompts.test.ts` additionally proves a question is answerable from the numbers it prints.
2. **End-to-end tests (Playwright)** — `e2e/` drives the real app against the Vite dev server (`:1331`) in three projects: desktop, mobile Chrome and mobile Safari. The mobile Safari project runs on WebKit, so continuous integration installs both engines. The `all-topics-*.spec.ts` files run a full matrix (every topic × easy/medium/hard) and assert each generator accepts its own correct answer; other specs cover Single/Mental/Daily modes, MCQ, settings, print worksheets, keyboard shortcuts, and graceful desktop-only fallbacks. A console-error sweep asserts zero runtime errors across the whole app.
3. **Rust tests (`cargo test`)** — 200+ tests in `src-tauri/src` cover the score/perf/adaptive SQL logic, `check_math`, models, and PDF export.

`npm run check` runs the TypeScript type-check plus the Vitest suite; `npm run test:e2e` runs Playwright.
