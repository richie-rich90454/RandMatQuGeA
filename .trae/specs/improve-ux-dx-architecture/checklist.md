# Checklist

## Phase 0: Fix All TypeScript Errors & Tag v2.2.1
- [x] All TS7023 implicit-any-return errors fixed in 14 precalculus test files (recursive `f`/`g` helpers have explicit return type annotations)
- [x] All TS7023 implicit-any-return errors fixed in `src/modules/Trigonometry/trigAnalytic.test.ts`
- [x] All TS7023 errors fixed in all 23 additional Algebra test files (advanced, basics, precalculus, index)
- [x] All TS7006/TS7053/TS2345 implicit-any param and indexing errors fixed in 5 DiscreteMath test files (`a`, `b`, `v`, `s` params typed; index signatures added)
- [x] TS2722 possibly-undefined invocation errors fixed in `src/modules/DiscreteMathematics/discretePermutationsCombinations.ts` (lines 118, 225)
- [x] TS2722 possibly-undefined invocation errors fixed in `src/modules/Trigonometry/trigReciprocal.ts` (lines 77, 131, 189)
- [x] TS6133 unused-declaration error fixed in `src/modules/Geometry/geometryArea.test.ts` (line 134, `alternate`)
- [x] TS6133 unused-declaration error fixed in `src/script.test.ts` (line 33, `uiMod`)
- [x] TS6133 unused-declaration errors fixed in `src/vitest.setup.ts` (lines 110-112, `callback`, `target`, `options`)
- [x] All src/main/ errors fixed (TS18047, TS2339, TS2345, TS2591, TS6133) across 10 files
- [x] Each file fix is its own commit (one commit per file change)
- [x] `npm run build:typescript` exits with code 0 and zero error messages
- [x] `npm test` - 2200 passed, 6 skipped, 0 new failures
- [x] Git tag `v2.2.1` created marking the clean baseline commit
- [x] All Phase 0 fixes follow AGENTS.md formatting rules

## Phase 1: Foundation - State & DOM Infrastructure
- [x] `AppState` class exists in `src/main/core/stateStore.ts` with all 25 state fields as typed properties
- [x] `appState` singleton is exported and accessible from other modules
- [x] `DomRegistry` class exists in `src/main/core/domRegistry.ts` with lazy-cached typed accessors covering all 80+ DOM elements
- [x] `dom` singleton is exported with feature-grouped accessors (buttons, inputs, displays, modals, settings, session)
- [x] `QuestionState` class exists in `src/main/core/questionState.ts` holding correctAnswer, expectedFormat, hasQuestion
- [x] `QuestionRenderer` service exists in `src/main/core/questionRenderer.ts` with render(), setExpectedFormat(), typeset(), clear(), setAnswer() methods
- [x] `ErrorHandler` class exists in `src/main/core/errorHandler.ts` with wrap(), wrapAsync(), showError() methods
- [x] All Phase 1 files follow AGENTS.md formatting (no blank lines, 4-space indent, same-line braces, no spaces around operators, semicolons)

## Phase 2: Infrastructure - Event & Topic Systems
- [x] `EventBinding` interface and `bindEvents()` function exist in `src/main/services/eventBinder.ts`
- [x] `bindEvents()` skips null elements with a debug warning instead of throwing
- [x] `registerTopic()`, `getTopic()`, `hasTopic()`, `getAllTopics()` exist in `src/main/services/topicRegistry.ts`
- [x] `questionGenerator.ts` no longer contains the hardcoded 125-entry `topicRegistry` constant
- [x] `generateQuestion()` looks up topics via the new registry and wraps calls in `errorHandler.wrapAsync()`
- [x] All 125+ generator topics are registered via `registerTopic()` calls across all 7 modules
- [x] No duplicate topic IDs exist in the registry
- [x] `questionGenerator.test.ts` passes with the new registry system

## Phase 3: Migration - Wire New Infrastructure
- [x] `events.ts` uses `appState` instead of `state.*` setters
- [x] `ui.ts`, `generation.ts`, `session.ts`, `answer.ts`, `topics.ts`, `settings.ts` all use `appState`
- [x] Old `state.ts` `let` exports and setter functions are removed
- [x] `events.ts`, `ui.ts`, `generation.ts`, `session.ts`, `answer.ts`, `topics.ts`, `settings.ts` all use `DomRegistry`
- [x] Old 80+ `export let` declarations are removed from `dom.ts`
- [x] All generators call `renderer.setAnswer()` instead of `window.correctAnswer=...`
- [x] All generators call `renderer.setExpectedFormat()` instead of `window.expectedFormat=...`
- [x] All generators call `renderer.setHasQuestion()` instead of `window.hasQuestion=...`
- [x] `ui.ts`, `generation.ts`, `answer.ts`, `session.ts` read from `questionState` instead of `window.*`
- [x] `window.correctAnswer`, `window.hasQuestion`, `window.expectedFormat` removed from `global.d.ts`
- [x] No generator file imports from `../../../script.js`
- [x] All generators use `renderer.render()` instead of direct `questionArea.innerHTML=...`
- [x] Generator tests mock `renderer` instead of `script.js`

## Phase 4: Declarative Events Migration
- [x] `events.ts` defines an `EventBinding[]` config array covering all click/change/input/keydown handlers
- [x] `setupEventListeners()` is a thin wrapper calling `bindEvents(config)` plus special-case setup
- [x] Keyboard shortcuts (document-level Ctrl+G, Ctrl+Enter, etc.) are handled
- [x] Modal outside-click and Escape-key handling preserved
- [x] Math toolbar querySelectorAll buttons are bound
- [x] Dynamic imports (printWorksheet, dataManagement, weakTopics) remain in setup function
- [x] `events.test.ts` passes with the declarative config

## Phase 5: UX Improvements
- [x] `showQuestionSkeleton()` exists in `src/main/ui/skeleton.ts` and renders animated gray blocks
- [x] Skeleton CSS shimmer animation added to `style.css`
- [x] `generation.ts` uses skeleton instead of the basic spinner
- [x] `OfflineIndicator` class exists in `src/main/ui/offlineIndicator.ts`
- [x] Offline badge appears in header when `navigator.onLine` is false
- [x] Offline badge CSS added to `style.css`
- [x] Indicator initialized in `script.ts` `initApp()`
- [x] Virtual topic grid implemented in `src/main/ui/virtualTopicGrid.ts`
- [x] Only visible topic pills (plus overscan buffer) exist in the DOM at any time
- [x] Topic selection, search filtering, and scope switching still work correctly

## Phase 6: Performance - Web Worker
- [x] Math Web Worker exists in `src/main/services/mathWorker.ts`
- [x] Worker exposes evaluate, simplify, parse operations via postMessage
- [x] Request/response message types are defined
- [x] Vite config bundles the worker correctly
- [x] Fallback path exists for non-worker environments (tests)
- [x] `answer.ts` `compareExpressions()` routes evaluation to the worker
- [x] 2-second timeout fallback to main-thread evaluation is implemented
- [x] `answer.test.ts` passes with the async worker path

## Phase 7: Code Organization
- [x] `src/main/core/` directory contains stateStore, domRegistry, questionState, questionRenderer, errorHandler
- [x] `src/main/services/` directory contains eventBinder, topicRegistry, mathWorker
- [x] `src/main/ui/` directory contains ui, topics, skeleton, offlineIndicator, virtualTopicGrid
- [x] `src/main/session/` directory contains session, answer, generation
- [x] `src/main/index.ts` barrel re-exports the public API
- [x] `script.ts` imports from the barrel
- [x] All internal imports use relative subdirectory paths
- [x] `npm run build:typescript` passes with zero errors

## Phase 8: Test Infrastructure & Final Verification
- [x] Shared test utilities exist in `src/test/utils.ts` (setupDomMock, createMockQuestionArea, createMockRenderer, registerMockTopics)
- [x] At least 3-5 test files refactored to use shared utilities
- [x] `state.test.ts` tests `AppState` class
- [x] `dom.test.ts` tests `DomRegistry`
- [x] `events.test.ts` tests declarative bindings
- [x] `questionGenerator.test.ts` tests the new registry
- [x] All generator tests mock `renderer` instead of `script.js`
- [x] Full test suite passes (or only pre-existing unrelated failures remain)
- [x] No blank lines in any new or modified file
- [x] 4-space indentation throughout all new and modified files
- [x] Same-line braces, no spaces around operators, semicolons present in all new/modified files
- [x] `let` used for all variable declarations
- [x] `npm run build:typescript` passes with zero errors
- [x] `npm run build` produces a working bundle
- [x] `npm test` passes (or only pre-existing unrelated failures remain)
- [x] App loads, generates questions, checks answers, and runs a mental session correctly
