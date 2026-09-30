# RandMatQuGeA - Agent Guidelines

The formatting and code style rules for this repository are defined in **CODE_STYLE.md** at the repository root. That file is the single authority: where this file or any other document disagrees with it, CODE_STYLE.md wins.

Read CODE_STYLE.md before writing code. It covers:

1. **Layout and whitespace** — 4-space indentation, no blank lines inside bodies, braces on the same line, `else if`/`else` on their own lines, no spaces around operators or between a keyword and its opening paren, semicolons on every statement, `let` for all bindings.
2. **Naming** — file, class, function, constant, topic id, CSS class, DOM id and Tauri command conventions.
3. **Imports and modules** — one import per line, no spaces inside braces, `import type` for type-only imports, named exports only.
4. **Types** — strict mode, unions over `any`, and the `QuestionDto` contract.
5. **Programming paradigm** — vanilla DOM with module-level singletons, no framework, the four-layer architecture, and the invariants: DOM access through `DomRegistry`, mutable state through `AppState`, pure generators, platform features behind the backend seam, and features that either work in every environment or are hidden where they cannot.
6. **Complexity budget** — `Map`/`Set` over `Array.includes`/`find` in loops, no `querySelectorAll` on interaction paths, no `innerHTML` rebuilds to change one string, no `sort` inside a loop.
7. **Generator correctness** — the two invariants CI enforces, plus the rounding, domain, determinism and difficulty rules.
8. **CSS, Rust, tests and documentation obligations.**

### The two rules that are never traded away

Breaking either of these silently produces wrong answers rather than a build error:

- **A generator's printed question and its claimed answer must be the same problem.**
- **A Multiple Choice question must have four options, exactly one of which is correct.**

### Existing formatting, for quick reference

The rules below are the dense house style. They apply to every file, and they match what the tooling produces.

**No blank lines** are used inside function bodies, between imports, or between consecutive declarations. The result is a dense, continuous block of code.

**Indentation** is four spaces per level. Opening braces sit on the same line as their statement keyword, and closing braces align with the opening statement.

**`if` / `else if` / `else`** each occupy their own line, with the opening brace on the same line as the keyword.

**Spacing around operators** is omitted: no spaces around assignment, arithmetic, or comparison operators. One space is used after commas in argument and array lists, and after colons in type annotations. There is no space between a function name and its opening parenthesis, and no space between a keyword and its opening parenthesis.

**Semicolons** terminate every statement.

**`let`** is used for all variable declarations, one per line.

**Switch statements** place `case` labels one level in and the case body one level further, with `break` where a fall-through is not intended.

**String concatenation** preserves the original spacing convention around `+`.

**Comments** are preserved as written. A multi-line block comment is kept as-is.

**Imports** are listed at the top of the file, one per line, with no blank lines between them.

**No trailing whitespace** on any line.
