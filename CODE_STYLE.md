# Code Style

This file is the single authority on how code in this repository is written. Where
`AGENTS.md`, `CONTRIBUTING.md`, `docs/contributing.md` or `.editorconfig` disagree with
this document, this document wins. Those files are pointers, not parallel sources of
truth.

Two rules are never traded away, because breaking either silently produces wrong
answers rather than a build error:

1. **A generator's printed question and its claimed answer must be the same problem.**
2. **A Multiple Choice question must have four options, exactly one of which is correct.**

Both are enforced in CI. See [Generator correctness](#generator-correctness).

---

## Contents

- [Layout and whitespace](#layout-and-whitespace)
- [Naming](#naming)
- [Imports and modules](#imports-and-modules)
- [Types](#types)
- [Programming paradigm](#programming-paradigm)
- [Complexity budget](#complexity-budget)
- [Comments](#comments)
- [Errors and async](#errors-and-async)
- [CSS](#css)
- [Rust](#rust)
- [Tests](#tests)
- [Generator correctness](#generator-correctness)
- [Documentation](#documentation)

---

## Layout and whitespace

### Indentation

**Four spaces. Never tabs. Never a mix within a file.**

This is enforced by `.editorconfig` and `rustfmt.toml`. Note that the majority of
existing files are tab-indented and were formatted to 4 spaces; if you touch a file,
match what is actually in the file, and if in doubt, prefer 4 spaces because that is
what the tooling will produce.

### Blank lines

No blank lines inside a function body, between imports, or between consecutive
declarations. Dense is the house style:

```typescript
export function getRangeForDifficulty(difficulty?: string): Range{
    let d=difficulty||"medium";
    if(d==="easy") return{min:1,max:50};
    if(d==="hard") return{min:-1000,max:3000};
    return{min:-1000,max:1500};
}
```

### Operators and keywords

No spaces around operators, and no space between a keyword and its opening paren:

```typescript
let res=1;
if (n<0) return;
for (let i=0; i<len; i++) count+=items[i].value;
switch (type){
    case "basic":
        result=generate(difficulty);
        break;
}
```

This is dense and unconventional. It is also what 227 of 247 existing source files
already do, and it is what `AGENTS.md` mandates. Do not "fix" it.

### Braces and `else`

The opening brace is always on the same line as its statement. `else if` and `else`
each begin their own line:

```typescript
function classify(n: number): string{
    if (n>0) return "positive";
    else if (n<0) return "negative";
    else return "zero";
}
```

### Declarations

- Semicolons end every statement.
- `let` is used for all bindings. `const` is not the house style; use `let`.
- One declaration per line, each on its own line.
- `as` assertions take a space on each side: `value as HTMLButtonElement`.
- One space after a colon in a type annotation, one space after a comma.
- No space between a function name and its opening paren: `Math.floor(x)`.

### Strings

Double quotes. Single quotes only when the string itself contains a double quote.

---

## Naming

| Thing | Convention | Example |
|---|---|---|
| Files | PascalCase for components, modules and classes; camelCase for behavior modules | `StateStore.ts`, `Topics.ts` |
| Classes, interfaces, types | PascalCase | `QuestionDto`, `AppState` |
| Functions, methods, variables | camelCase | `generateAddition`, `renderTopicGrid` |
| Constants | camelCase (not SCREAMING_CASE) | `SESSION_STORAGE_KEY` is the one legacy exception; do not add more |
| Topic ids | `snake_case` | `linear_eq`, `unit_conv` |
| Topic names | PascalCase human string | `"Linear Equations"` |
| CSS classes | `kebab-case`, optionally BEM | `.topic-pill`, `.result-success` |
| CSS custom properties | `--kebab-case` | `--spacing-md` |
| DOM ids | `kebab-case` | `answer-box`, `check-answer` |
| Environment variables | `SCREAMING_SNAKE_CASE` | `BUNDLE_JS_BUDGET_KB` |
| Tauri commands (Rust) | `snake_case` | `save_performance` |
| Tauri command arguments over IPC | `camelCase` on the JS side | `invoke("save_performance", { topicId, responseTimeMs })` |

**Generator functions** are named `generate<Something>` and live beside the subject
they belong to. Every generator is registered in its subject's `RegisterTopics.ts`.

---

## Imports and modules

One import per line, no blank lines between them, no spaces inside the braces:

```typescript
import{dom}from"./core/DomRegistry";
import{appState}from"./core/StateStore";
import type{RngFn,QuestionDto}from"../types/global";
```

- Prefer named exports. There are no default exports in this codebase.
- Use `import type` for type-only imports.
- Import from the specific module, never from a barrel that re-exports it. The one
  barrel, `src/main/index.ts`, is legacy and unused; do not extend it.
- Relative paths, no path aliases at runtime.
- Import order: styles first in an entry point, then third-party, then local.

---

## Types

- `strict` is on. `noUnusedLocals`, `noUnusedParameters` and
  `noFallthroughCasesInSwitch` are on. Keep it that way.
- Prefer explicit types on exported functions' signatures.
- Narrow with union types, not `any`. `any` requires a comment saying why.
- Model unions as unions: `"single"|"mental"`, not `string`.
- `QuestionDto` is the contract between every generator and the renderer. Adding a
  field means updating `src/types/global.d.ts`, the `isQuestionDto` runtime guard in
  `QuestionGenerator.ts`, and every consumer.

---

## Programming paradigm

This is a **vanilla DOM application with module-level singletons**. There is no
framework, no virtual DOM and no build-time component system. That is deliberate:
the bundle budget in `scripts/bundle-check.js` caps the initial JS payload, and the
entire question-generation engine, every topic, the stylesheet and the HTML shell
contain zero framework references.

**Do not introduce React, Vue, Svelte or any other UI framework.**

The architecture is four layers. New code goes in the layer that matches its
responsibility, and does not reach past it.

```
index.html            static shell; every element the app manipulates has an id
  └── script.ts       entry point; boot sequence only
        └── main/     behavior, grouped by concern
              ├── core/       AppState, QuestionState, DomRegistry, renderer, Rng
              ├── services/   TopicRegistry, backend seam, storage
              ├── ui/         small self-contained widgets
              └── *.ts        Generation, Answer, Session, Settings, Topics, Events
        └── modules/  question generators, one directory per subject
        └── utils/    dependency-free helpers with no app state
```

### The rules that keep it working

1. **All DOM access goes through `DomRegistry`.** Never call
   `document.getElementById` or `document.querySelector` in application code. The
   registry caches lookups and is the single place that knows the DOM.
2. **All mutable app state goes through `AppState`.** Read and write its getters and
   setters, never its private fields.
3. **Question generators are pure.** A generator takes `(difficulty?, rng?)` and
   returns a `QuestionDto`. It must not touch the DOM, read `AppState`, call
   `Math.random`, or perform I/O. All randomness comes from the injected `rng`.
4. **Platform features are behind a seam.** Tauri calls live in
   `src/main/services/Backend.ts` and are guarded by capability checks, never called
   directly from a generator or a UI module.
5. **The app runs in three environments** — Tauri desktop, a plain browser with
   persistence, and a plain browser in private mode. Every feature either works in all
   three or is hidden in the ones where it cannot work. A feature that is visible but
   silently does nothing is a bug.

---

## Complexity budget

Complexity is a correctness concern here, not just a speed one: the topic grid is 204
entries, the generated question space is unbounded, and the history is append-only.

**Budgets**

| Operation | Budget |
|---|---|
| Lookup in a collection of known items | `Map` or `Set`, O(1) |
| Filtering the topic list | O(n) with a `Set` of allowed ids, never `Array.includes` inside a loop |
| Question generation | O(1) in the number of registered topics |
| Rendering a question | O(1) DOM writes; no full-document query |
| Style recalculation on interaction | avoid; batch class changes |

**Rules**

1. **`Array.prototype.includes` and `Array.prototype.find` inside a loop over another
   array is O(n·m).** Build a `Set` first. `topics.filter(t=>allowedIds.includes(t.id))`
   over 204 topics and a 204-entry scope list is ~41 000 string comparisons per
   keystroke; `new Set(allowedIds)` makes it 204.
2. **Never `querySelectorAll` on an interaction path.** Cache the element references
   in a `Map` at render time, as `Topics.ts` already does, and mutate the map's
   entries.
3. **Never rebuild an element's `innerHTML` to change one piece of text.** The
   existing pattern in `Ui.ts` assigns a whole inline SVG to `innerHTML` on every
   timer tick; build the icon once and set `textContent` on a child span.
4. **No `sort` inside a loop.** Sort once, outside.
5. **No nested iteration over the same collection.** Use a `Map` index.
6. **Prefer an early `return` over a deeply nested `if`.**

---

## Comments

Default to none. A comment earns its place only when the *why* is not evident from the
code. Do not narrate what the next line does.

```typescript
// Bad
// increment the counter
counter++;

// Good, because the invariant is not obvious
// Difficulty may only change once the learner has enough evidence, otherwise a
// single lucky answer moves it permanently.
if (attempts<3) return currentDifficulty;
```

Multi-line blocks use `/** ... */` with `@param` and `@returns`. Keep generator
docblocks accurate; they are the only description a topic has.

---

## Errors and async

- Every `await` is inside a `try/catch` that logs with a stable prefix, or the function
  is explicitly fire-and-forget and says so.
- Do not swallow errors. A `catch` that returns without logging is a bug.
- Never use `alert` or `confirm`. Use `ui.showNotification` and a modal.
- Prefer `Promise.all` for genuinely independent work; never `await` in a loop when
  the iterations are independent.
- Long-running work that must not block interaction belongs in a Web Worker.

---

## CSS

- 4-space indent.
- Custom properties for all colors, spacing, radii, shadows and transitions, defined
  once on `:root` and overridden by `.light` and `.dark`.
- Class names are `kebab-case`.
- No `!important` except in a genuine escape hatch, which must carry a comment.
- Interactive targets are at least **44×44 CSS px** (WCAG 2.2 SC 2.5.8 sets 24×24 as
  the AA floor; 44 is the Apple HIG and Material recommendation and is the standard
  here). Enlarge the hit area rather than the visual, where layout requires it.
- Every `@media` block is a `max-width` or `prefers-*` query. Mobile is the default;
  wider viewports are progressive enhancement.
- Respect `prefers-reduced-motion`, and `prefers-reduced-motion` must actually disable
  the animation, not merely shorten it.
- Mobile-specific layout is gated on `(hover: none)` or `(pointer: coarse)`, not on
  viewport width alone, so a touch laptop is handled correctly.

---

## Rust

- `cargo fmt` before committing. `rustfmt.toml` sets 4-space indentation.
- `snake_case` for functions and modules, `CamelCase` for types, `SCREAMING_SNAKE_CASE`
  for constants.
- `#[tauri::command]` functions return `Result<T, String>`; error messages are
  sentences that end without a period.
- Every `async` command takes `tauri::State<'_, DbState>` for database access.
- Structured types with `#[derive(Serialize, Deserialize)]`. Never return
  `serde_json::Value` from a command; define the struct so the TypeScript side is
  typed too.
- Database changes go in `src-tauri/migrations/`. Never edit a shipped migration.
- `cargo clippy` warnings are errors.

---

## Tests

Four layers, all of which gate merges.

**Unit tests** (`src/__tests__/`, Vitest, the `unit` project). Mirror the `src/`
structure exactly: `src/main/Answer.ts` is tested by `src/__tests__/main/Answer.test.ts`.
Every test file that needs a DOM declares `/** @vitest-environment jsdom */` at the
top.

**The generator oracle** (`src/__tests__/oracle/`, Vitest, the `oracle` project). A
separate project on purpose: it is slow, and a red correctness gate must not take the
unit suite down with it. It samples every registered topic across difficulties and
seeds and asserts four things: every topic produces a well-formed question, every
prompt renders as valid LaTeX, every multiple-choice question presents four usable
options with exactly one correct, and no distractor is also correct.

It also asserts things about the tables the app depends on. The sub-skill table is
checked in both directions — a registered topic with no row, and a row whose key is
not a registered topic, are both failures — because a topic count written down in a
document is already wrong the moment a topic is added.

**End-to-end tests** (`e2e/`, Playwright). Drive the real app. Shared flows live in
`e2e/helpers.ts`. Every spec runs on all three configured projects: desktop, Pixel 7
and iPhone 14. The iPhone descriptor runs on WebKit, so continuous integration
installs both browser engines; pinning a Chrome channel instead makes the desktop
project depend on a separately installed browser that CI does not provide.

**Rust tests** (inline `#[cfg(test)] mod tests` in `src-tauri/src/`). Cover the SQL
logic and the pure functions, not the Tauri plumbing.

### Conventions

- Name tests for the behavior, not the function: `"rejects an answer that omits the
  domain restriction"`, not `"calls checkAnswer"`.
- One behavior per test.
- `vi.clearAllMocks()` in `beforeEach` where a suite needs isolation.
- Mock the platform seam, never `localStorage` or `document` directly.
- A test that pins behavior the product has deliberately rejected is wrong and gets
  rewritten, not the behavior. Padding an option set with a placeholder is such a
  case: the test asserting the padding is what has to change, and the commit message
  must say so.
- No snapshot tests for values a human should read. Snapshots are for the rendered
  artifact only, and every numeric value must be canonicalised to a string first so
  that float formatting cannot make them flaky across engines.

---

## Generator correctness

A question generator is the product. A wrong answer is worse than a missing topic,
because the learner is told something false with total confidence. Two invariants are
enforced in CI and neither may be waived.

### 1. The question and the answer must agree

The most common defect in this codebase is printing a rounded value in the prompt
while computing the answer from the unrounded one. This produces a stated answer that
the learner cannot derive from the question they are looking at.

**Rule: round once, then use the rounded value everywhere.**

```typescript
// Wrong: the learner is shown 2.5 and 1.7, so 3.02 is the only defensible answer
let x=2.46;
let y=1.73;
let mag=Math.sqrt(x**2+y**2).toFixed(2);          // 3.01, from unrounded inputs
let latex=`\\langle ${x.toFixed(1)}, ${y.toFixed(1)} \\rangle`;   // prints 2.5, 1.7

// Right: one rounding decision, applied once
let rx=roundTo(x,1);
let ry=roundTo(y,1);
let mag=roundTo(Math.sqrt(rx**2+ry**2),2);
let latex=`\\langle ${rx}, ${ry} \\rangle`;
```

Additional rules:

- **No silent rounding.** If a question says "round to the nearest whole number", say
  so in the prompt. Otherwise the answer must be exact.
- **A question must be answerable.** Never divide by a quantity that can be zero, take
  the log of a non-positive number, generate a triangle that violates the triangle
  inequality, or ask for a unique solution to a singular system. Guard the generator,
  or resample until the domain holds.
- **Never print a value in the prompt that the answer does not use.** The parameters
  shown, the coefficients printed and the numbers graded must be the same numbers.
- **The prompt must not contain the answer.** Check for generator families that
  interpolate a computed value into the question text.
- **`latex` must render.** Validate with KaTeX in strict mode.

### 2. Multiple Choice must be valid

**Every MCQ has exactly four options, exactly one of which is correct.** All four must
be distinct and finite. This is validated in CI, and a generator that cannot satisfy
it is a build failure rather than a runtime degradation. There is no fallback filler.

Additional rules:

- A distractor must be **provably wrong**. `0.50` and `0.5` are the same option.
  `"1.00"` is not a valid distractor for a key of `"1"`. A 3-4-5 triangle is not
  "scalene" with "right" offered as wrong.
- No option may be `NaN`, `±Infinity`, `"-0.00"`, or a value rendered in exponential
  notation when the format hint says otherwise.
- Options are compared for equality **after canonicalisation**, not as raw strings.
- Options are rendered as plain text. A LaTeX answer must not be offered as an MCQ
  option, because options are not typeset.

### Difficulty must be real

A generator must produce measurably different output at `easy`, `medium` and `hard`.
The failure modes are a discarded `difficulty` parameter and a range so narrow that
`easy` collapses to one or two fixed questions. Both are detected by the difficulty
gate, which asserts monotonicity across adjacent levels and a minimum number of
distinct questions per level.

### Randomness is injected

Generators never call `Math.random`. They take an `rng` parameter. A given seed must
reproduce a given question exactly, which is what makes worksheets and the daily
challenge work.

A helper that a generator calls must take the `rng` it was given. A utility that
draws from the global source looks harmless and silently makes a seeded caller
non-reproducible.

### Round once, where the value is drawn

A value is rounded **when it is drawn**, and every later step — the prompt, the
key, the distractors, the worked solution — uses that rounded value. Rounding only
the print is the single most common correctness defect in a generator: the learner
sees `(2.5, 1.7)` and is graded on the magnitude of `(2.53, 1.74)`.

This is why the shared rounding helper exists, and why the generators route through
it rather than calling `toFixed` on a value that was never rounded.

### No unbounded rejection loops

A generator may reject a drawn value and try again. It must bound the number of
attempts and must have a deterministic fallback, because a random source that
keeps returning the same value — which a test will do, and a seeded caller can —
will otherwise spin until the process runs out of memory.

### Exact where the topic allows it

Number theory, combinatorics and algebra have exact answers. Compute them in integer
arithmetic and never introduce a float on the way to a printed value. The closed
form for a divisor sum divides, and a power of three over two is not an integer, so
that sum is accumulated by repeated addition.

---

## Documentation

Documentation is part of the change, not a follow-up. A change is incomplete if the
docs describe the old behavior.

**When you change behavior, update in the same commit:**

| Change | Update |
|---|---|
| A Tauri command's name, arguments or return shape | `docs/api/index.md` |
| A new topic or a changed topic count | `README.md`, `docs/index.md`, `docs/guide/usage.md` |
| New or renamed settings | `docs/guide/usage.md` |
| A changed architectural boundary | `docs/guide/architecture.md` |
| A new npm script or a changed workflow | `CONTRIBUTING.md` |
| Anything about how to write code | this file |
| An added generator or sub-skill | its `RegisterTopics.ts`, and the tests that assert coverage |

Prose is written in American English, in the present tense, and says what a reader can
do rather than what the code happens to do. Documented command signatures are written
in the form a caller actually passes them.
