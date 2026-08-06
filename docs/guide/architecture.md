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

## Rust Backend

Built with Tauri v2, the backend provides:

| Command | Purpose |
|---|---|
| `check_math` | Numeric and symbolic comparison |
| `save_score` / `load_scores` / `delete_score` | Score CRUD |
| `save_performance` | Per-topic/difficulty performance tracking |
| `get_performance_stats` | Aggregate performance queries |
| `get_next_question_recommendation` | Adaptive difficulty + weak topic detection |
| `get_weak_topics` | Weak topic analysis (< 70% accuracy, ≥ 3 attempts) |
| `generate_worksheet_seed` | Reproducible random seeds |
| `export_worksheet_pdf` | PDF generation via printpdf + RaTeX |
| `reset_all_data` | Complete data wipe |

## Module Structure

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

There are **125 topics** across 7 subject modules (Arithmetic, Algebra, Calculus, Linear Algebra, Trigonometry, Discrete Math, Geometry).

## Testing

The project uses a three-layer test strategy:

1. **Unit tests (Vitest + jsdom)** — `src/__tests__/` mirrors the `src/` structure. 7,000+ cases cover generator integrity (every topic × difficulty × seeds), math regression values, answer-checking edge cases, settings persistence, and session logic. `src/vitest.setup.ts` mocks the Tauri API, three.js, and canvas.
2. **End-to-end tests (Playwright)** — `e2e/` drives the real app in headless system Chrome against the Vite dev server (`:1331`). The `all-topics-*.spec.ts` files run a full matrix (every topic × easy/medium/hard) and assert each generator accepts its own correct answer; other specs cover Single/Mental modes, MCQ, settings, print worksheets, keyboard shortcuts, and graceful desktop-only fallbacks. A console-error sweep asserts zero runtime errors across the whole app.
3. **Rust tests (`cargo test`)** — 200+ tests in `src-tauri/src` cover the score/perf/adaptive SQL logic, `check_math`, models, and PDF export.

`npm run check` runs the TypeScript type-check plus the Vitest suite; `npm run test:e2e` runs Playwright.
