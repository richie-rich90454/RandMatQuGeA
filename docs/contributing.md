---
editLink: true
---

# Contributing

## Development Setup

```bash
npm install
npm run dev       # Web dev server
npm run typecheck # TypeScript check
npm run test:run  # Run all tests
```

## Project Conventions

### Code Style

- TypeScript with strict mode enabled
- No semicolons, single quotes
- 4-space indentation, no trailing whitespace
- `let` over `const` throughout
- No blank lines between statements
- Brace on same line (`if (x) {`)
- No space after function name before `(`
- Arrow functions with explicit `return` when multi-line

### Adding a New Topic Generator

1. Create a generator file in the appropriate `src/modules/<Subject>/` directory
2. Export a function matching: `(difficulty: string, rng?: RngFn) => QuestionDto`
3. Add `registerTopic(id, scope, fnName)` call in the subject's `RegisterTopics.ts`
4. Export the function from the subject's `index.ts`
5. Add the topic definition to `src/main/Constants.ts` (`topics` array + `scopeTopics` map)
6. Write tests in `src/__tests__/modules/<Subject>/`

### Generator Contract

Every generator must return a valid `QuestionDto`:

```typescript
{
    latex: string,       // Question HTML with $$...$$ delimiters
    correct: string,     // Canonical correct answer
    choices?: string[],  // MCQ distractors (4-6 recommended)
    expectedFormat?: string, // Input format hint
}
```

### Testing

- Vitest with jsdom environment
- Tests mirror the `src/` structure under `src/__tests__/`
- Run: `npm run test:run`
- Coverage: `npm run test:coverage`

## Pull Request Process

1. Fork the repo and create a feature branch
2. Ensure `npm run check` passes (typecheck + tests)
3. Open a PR against `main` with a clear description
4. Keep changes focused — one feature per PR
5. Include tests for new functionality

## Architecture Notes

- The app is a **Tauri v2** app but works as a standalone web app — keep the web fallback path working
- Rust backend is optional — guard Tauri-specific calls with `isTauri()` from `src/utils/envUtils.ts`
- All DOM access goes through `DomRegistry` — no direct `document.getElementById()` outside it
- State mutations flow through `AppState` getters/setters — avoid direct property access
- Question generators are pure functions — no DOM side effects (return `QuestionDto` only)
- Answer checking lives in `Answer.ts` (TypeScript) for web mode and `lib.rs` (Rust) for Tauri mode

## License

Apache 2.0 — see [LICENSE](https://github.com/richie-rich90454/RandMatQuGeA/blob/main/LICENSE).
