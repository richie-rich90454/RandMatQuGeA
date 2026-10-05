---
editLink: true
---

# Contributing

## Development Setup

```bash
npm install
npm run dev        # Web dev server on :1331
npm run typecheck  # TypeScript check
npm run test:run   # Unit tests (Vitest)
npm run test:e2e   # End-to-end tests (Playwright, bundled Chromium + WebKit)
```

## Project Conventions

### Code Style

The full house style lives in [CODE_STYLE.md](https://github.com/richie-rich90454/RandMatQuGeA/blob/main/CODE_STYLE.md) at the repository root and is the single authority. The short version:

- TypeScript with strict mode enabled
- Semicolons at the end of statements
- 4-space indentation, no trailing whitespace
- `let` for all bindings
- No blank lines between statements
- Brace on same line (`if (x) {`), `else if` / `else` on their own lines
- No space after function name before `(`
- No spaces around operators (`a+b`, `let x=1;`)
- Named exports only, no framework

### Adding a New Topic Generator

1. Create a generator file in the appropriate `src/modules/<Subject>/` directory
2. Export a function matching: `(difficulty?: string, rng?: RngFn) => QuestionDto`
3. Add `registerTopic(id, scope, fnName)` call in the subject's `RegisterTopics.ts`
4. Export the function from the subject's `index.ts`
5. Add the topic definition to `src/main/Constants.ts` (`topics` array + `scopeTopics` map)
6. Declare its sub-skills in the sub-skill table, so it can be scheduled independently
7. Write tests in `src/__tests__/modules/<Subject>/`

A generator is not finished until the correctness suite covers it. The gate rejects a
topic whose printed question and graded answer disagree, whose Multiple Choice options
are not exactly four with exactly one correct, whose LaTeX does not render, or whose
easy/medium/hard output is indistinguishable.

The oracle asserts that every registered topic has a sub-skill row **and** that every
row is keyed by a registered topic, so a missing row and an unreachable row are both
build failures. It also proves, for the generators where it can be recomputed, that the
answer follows from the numbers the prompt actually prints.

Two rules that are easier to follow than to rediscover:

- **Round once, at the draw.** Round the value where it is generated, and use that
  rounded value for the prompt, the key, the distractors and the solution. Rounding
  only the print leaves the learner with a question whose answer is not derivable from
  what they were shown.
- **Bound every rejection loop.** If you redraw until a condition holds, count the
  attempts and give a deterministic fallback. A seeded source can return the same value
  forever, and an unbounded loop takes the worker out with an out-of-memory kill rather
  than a test failure.

### Generator Contract

Every generator must return a valid `QuestionDto`:

```typescript
{
    latex: string,            // Question HTML with \[...\] or \(...\) delimiters
    correct: string,          // Canonical correct answer, exact unless the prompt says to round
    alternate?: string,       // Second accepted form, when one exists
    display?: string,         // KaTeX-rendered display form
    choices?: string[],       // Exactly 4 options, choices[0] === correct, no distractor also correct
    expectedFormat?: string,  // Input format hint, matching the actual answer shape
    subskill?: string,        // Sub-skill within the topic, used for per-skill scheduling
    misconception?: string,   // The wrong turn this question is designed to catch
    hints?: HintLadder,       // Overrides the derived ladder when you can do better 
    solution?: string[],      // Worked steps; the derived scaffold is used when absent 
    hint?: string,            // Single hint text, when one rung is enough
    skippable?: boolean,      // Whether the learner may skip
    visualization?: { shape: string; params?: Record<string, unknown> } 
}
```

Bare dollar signs are not a math delimiter in either renderer. Use `\(...\)` for inline
and `\[...\]` for display, and put nothing but mathematics inside them — a currency
symbol, a degree sign or a unit in a math group is a hard parse error that falls back
to showing raw markup.

The help fields are optional because a ladder is derived from what the question already
declares. A generator that can supply a better one should, and a supplied ladder is
always used in preference to the derived one.

Two invariants are enforced in CI and are never traded away:

1. **The printed question and the claimed answer must be the same problem.** Round once,
   then use the rounded value in both the prompt and the key. Never interpolate a
   computed value into the question text.
2. **A Multiple Choice question must have four options, exactly one of which is
   correct.** A generator that cannot produce four provably-distinct, provably-wrong
   alternatives is a build failure, not a runtime degradation.

### Testing

- **Unit tests**: Vitest with jsdom environment. Tests mirror the `src/` structure under `src/__tests__/` — run with `npm run test:unit` (10,000+ cases) or `npm run test:coverage`. 
- **E2E tests**: Playwright in `e2e/` — `npm run test:e2e`. Uses bundled Chromium + WebKit (desktop, Pixel 7, iPhone 14 projects) and auto-starts the Vite dev server on port 1331. A full matrix spec exercises every topic × difficulty.
- **Rust tests**: `cargo test` in `src-tauri/` (227 cases).

## Pull Request Process

1. Fork the repo and create a feature branch
2. Ensure `npm run check` passes (typecheck + full Vitest run + bundle check) and `npm run test:e2e` is green for UI changes
3. Open a PR against `main` with a clear description
4. Keep changes focused — one feature per PR
5. Include tests for new functionality

## Architecture Notes

- The app is a **Tauri v2** app but works as a standalone web app — keep the web fallback path working
- The app runs in three environments: Tauri desktop, a browser with persistence, and a browser in private mode. A feature either works in all three or is hidden where it cannot; one that is visible but silently does nothing is a bug
- Rust backend is optional — all platform calls route through the `Backend` service, never called directly from a UI module
- All DOM access goes through `DomRegistry` — no direct `document.getElementById()` outside it
- State mutations flow through `AppState` getters/setters — avoid direct property access
- Question generators are pure functions — no DOM side effects, no `Math.random`, all randomness from the injected `rng` (return `QuestionDto` only)
- Answer checking lives in `Answer.ts` and is shared by both practice modes
- Sheet layout, the offline shell and the installability surface are documented in [Usage](guide/usage.md)

## License

Apache 2.0 — see [LICENSE](https://github.com/richie-rich90454/RandMatQuGeA/blob/main/LICENSE).
