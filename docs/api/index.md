# API Reference

## Types

### `QuestionDto`

Returned by every generator function.

```typescript
interface QuestionDto {
    latex: string;           // HTML with MathJax-delimited LaTeX
    correct: string;         // Canonical correct answer
    alternate?: string;      // Accepted alternate form
    display?: string;        // KaTeX HTML for display
    choices?: string[];      // MCQ distractor options
    expectedFormat?: string; // Format hint (e.g. "fraction")
    hint?: string;           // Optional hint text
}
```

### `CorrectAnswer`

```typescript
interface CorrectAnswer {
    correct: string;
    alternate?: string;
    display?: string;
    choices?: string[];
}
```

### `Topic`

```typescript
interface Topic {
    id: string;
    name: string;
    icon: string;
    category: string;
}
```

### `RngFn`

```typescript
type RngFn = () => number;  // Returns [0, 1)
```

## Core

### `AppState`

Central state store (`src/main/core/StateStore.ts`). Singleton exported as `appState`.

```typescript
class AppState {
    // State properties
    selectedTopic: string | null;
    currentMode: "single" | "mental";
    sessionActive: boolean;
    sessionPaused: boolean;
    sessionScore: { correct: number; total: number };
    currentDifficulty: string;
    timeLeft: number;
    maxQuestions: number;
    scope: string;
    shuffle: boolean;
    unlimitedMode: boolean;
    mcqMode: boolean;
    mcqChoices: string[];
    isGenerating: boolean;
    answering: boolean;
    weakTopicQueue: string[];

    // Computed getters
    hasSelectedTopic: boolean;
    isMentalMode: boolean;
    isSingleMode: boolean;
    isSessionActive: boolean;
    sessionScoreRatio: number;
    scoreDisplayText: string;
    hasWeakTopics: boolean;

    // Methods
    incrementSessionScore(correct: boolean): void;
    incrementAnsweredCount(): void;
    addWeakTopic(topicId: string): void;
    dequeueWeakTopic(): string | undefined;
    getScorePercentage(): number;
    getModeDisplayText(): string;
    getTimeDisplayText(): string;
    reset(): void;
}

export let appState: AppState;
```

### `DomRegistry`

Cached DOM element access (`src/main/core/DomRegistry.ts`). Singleton exported as `dom`.

```typescript
class DomRegistry {
    getElement<T>(id: string): T | null;
    queryElement<T>(selector: string): T | null;
    queryElementAll<T>(selector: string): T[];
    invalidate(id: string): void;
    invalidateAll(): void;
    isElementVisible(id: string): boolean;
    createElement<K>(tag: K): HTMLElementTagNameMap[K];

    // Grouped accessors
    buttons: { ... };
    inputs: { ... };
    displays: { ... };
    settings: { ... };
    modals: { ... };
}
```

### `QuestionRenderer`

Renders questions to the DOM with MathJax typesetting (`src/main/core/QuestionRenderer.ts`). Singleton exported as `renderer`.

```typescript
class QuestionRenderer {
    render(html: string): void;
    renderWithCleanup(html: string): void;
    applyQuestionDto(dto: QuestionDto): void;
    clear(): void;
    typeset(): Promise<void>;
    refreshTypeset(): Promise<void>;
    hasContent(): boolean;
    getInnerHtml(): string;
    showErrorInQuestionArea(title: string, message: string): void;
}
```

### `ErrorHandler`

Wraps operations with error recovery (`src/main/core/ErrorHandler.ts`). Singleton exported as `errorHandler`.

```typescript
class ErrorHandler {
    wrap<T>(fn: () => T): T | undefined;
    wrapAsync<T>(fn: () => Promise<T>): Promise<T | undefined>;
    wrapWithRetry<T>(fn: () => T, retries: number): T | undefined;
    wrapAsyncWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T | undefined>;
    wrapWithFallback<T>(fn: () => T, fallback: T): T;
    handleError(err: unknown): void;
    showError(message: string, retryFn: (() => void) | null): void;
    showErrorWithTitle(title: string, message: string, retryFn: (() => void) | null): void;
    clearError(): void;
    retry(): void;
    getError(): string | null;
    getErrorCount(): number;
}
```

### `QuestionState`

Tracks current question's correct answer (`src/main/core/QuestionState.ts`). Singleton exported as `questionState`.

```typescript
class QuestionState {
    correctAnswer: CorrectAnswer;
    expectedFormat: string;
    hasQuestion: boolean;
}
```

## Services

### `TopicRegistry`

Topic registration and lookup (`src/main/services/TopicRegistry.ts`). Singleton exported as `topicRegistry`.

```typescript
class TopicRegistry {
    registerTopic(id: string, scope: string, fn: string): void;
    getTopic(id: string): TopicEntry | undefined;
    hasTopic(id: string): boolean;
    getAllTopics(): Map<string, TopicEntry>;
    getTopicIds(): string[];
    getTopicsByScope(scope: string): TopicEntry[];
    getScopes(): string[];
    getScopeCount(scope: string): number;
    count(): number;
    hasTopics(): boolean;
    searchTopics(query: string): TopicEntry[];
    getRandomTopic(): TopicEntry | undefined;
    shuffleTopics(): void;
    clear(): void;
    removeTopic(id: string): boolean;
    hasScope(scope: string): boolean;
}
```

#### `registerTopic(id, scope, fn)`

```typescript
function registerTopic(id: string, scope: string, fn: string): void;
```

Registers a topic so the question generator can find it. Called by each subject module's `RegisterTopics.ts`.

### `EventBinder`

```typescript
function bindEvents(target: EventTarget, map: Record<string, EventListener>): EventBinding;
function countBindings(): number;
function hasBinding(target: EventTarget): boolean;
```

### `MathWorkerClient`

```typescript
function evaluateInWorker(expr: string): Promise<number>;
function simplifyInWorker(expr: string): Promise<string>;
function parseInWorker(expr: string): Promise<any>;
function terminateWorker(): void;
```

## Question Generation

### `generateQuestion`

```typescript
async function generateQuestion(explicitTopicId?: string): Promise<void>;
```

Orchestrates question generation: applies adaptive recommendations, selects topic (shuffle/adaptive/explicit), delegates to `QuestionGenerator`, and renders the result via `QuestionRenderer`. Called from the UI and mental math session.

### `generateQuestionDto`

```typescript
async function generateQuestionDto(
    topicId: string,
    difficulty: string,
    rng?: RngFn
): Promise<QuestionDto>;
```

Pure generation without DOM side effects. Useful for testing or programmatic use.

### `debounceGenerate`

```typescript
function debounceGenerate(): void;
```

Debounced wrapper (150ms) for `generateQuestion()`.

## Answer Checking

### `checkAnswer` / `checkAnswerVisible`

Exported from `Answer.ts`. Multi-stage equivalence checking pipeline:

1. LaTeX preprocessing → math.js syntax
2. Sanitization (lowercase, whitespace, Unicode normalization)
3. Constant removal (+C for integrals)
4. String equality → symbolic comparison → numeric evaluation → equation splitting

## MCQ

### `generateDistractors`

```typescript
async function generateDistractors(
    correctAnswer: string,
    count: number,
    rng?: RngFn
): Promise<string[]>;
```

Generates `count` plausible wrong answers using three strategies: numeric perturbation, pattern variation, and text fallback.

## Session

### Mental Math Session (`Session.ts`)

```typescript
function startTimer(): void;
function saveSessionSnapshot(): void;
function restoreSessionSnapshot(): void;
function startMentalSession(): Promise<void>;
function pauseMentalSession(): void;
function resumeMentalSession(): void;
function endMentalSession(): void;
function generateNextMentalQuestion(): Promise<void>;
```

Session snapshots auto-save every 5s with 1-hour TTL for crash recovery.

## UI Helpers

### `Ui` module

```typescript
function showNotification(message: string, type: "info" | "success" | "warning" | "error"): void;
function updateScoreDisplay(): void;
function updateTimerDisplay(): void;
function updateProgressBar(): void;
function syncSettingsToState(): void;
function showOnboarding(): void;
function clearAllTimeouts(): void;
function disableTopicSelection(disabled: boolean): void;
function disableModeButtons(disabled: boolean): void;
function disableDifficulty(disabled: boolean): void;
function setSessionButton(active: boolean): void;
```

## UI Components

### `Skeleton`

```typescript
function showQuestionSkeleton(): void;
function hideQuestionSkeleton(): void;
function isSkeletonActive(): boolean;
function getLastSkeletonTime(): number;
```

### `OfflineIndicator`

```typescript
class OfflineIndicator {
    init(): void;
    destroy(): void;
    isOnline(): boolean;
}
```

### `VirtualTopicGrid`

```typescript
function initVirtualGrid(container: HTMLElement, topics: Topic[]): void;
function refreshVirtualGrid(): void;
function getVisibleRange(): { start: number; end: number };
function getTotalItems(): number;
```

## Settings

### `settings` object

```typescript
let settings = {
    theme: "system" | "light" | "dark",
    defaultMode: "single" | "mental",
    autoContinue: boolean,
    shuffle: boolean,
    mentalShuffle: boolean,
    scope: "simple" | "advanced" | "all",
    mentalScope: "simple" | "advanced" | "all",
    difficulty: "easy" | "medium" | "hard",
    timer: number,         // seconds
    maxQuestions: number,  // 1-100
    font: "default" | "opendyslexic",
    perfMaster: boolean,   // master toggle
    perfWave: boolean,
    perfBlur: boolean,
    perfPreview: boolean,
    perfAnimations: boolean,
    fpsCap: number,        // 0 = unlimited
    notifications: boolean,
    autoCheckDelay: number, // ms
    decimalPlaces: number,
    sound: boolean,
    vibration: boolean,
    unlimitedMode: boolean,
    mcqMode: boolean,
    mcqChoicesCount: number, // 2-6
    adaptive: boolean,
    showWeakTopicsPopup: boolean,
};
```

```typescript
function loadSettings(): void;
function saveSettings(): void;
```

## Tauri Commands (Rust)

Invoked via `@tauri-apps/api/core` `invoke()`:

| Command | Parameters | Returns |
|---|---|---|
| `check_math` | `{ userAnswer, correctAnswer, topicId }` | `{ correct, display }` |
| `save_score` | `{ difficulty, correct, total, topic, mode }` | `void` |
| `load_scores` | — | `Score[]` |
| `delete_score` | `{ id }` | `void` |
| `save_performance` | `{ topic_id, difficulty, correct, response_time_ms }` | `void` |
| `get_performance_stats` | `{ topic_id? }` | `PerformanceStats` |
| `delete_performance_record` | `{ topic_id }` | `void` |
| `delete_all_performance_records` | — | `void` |
| `get_next_question_recommendation` | `{ currentTopic, currentDifficulty }` | `{ difficulty, weak_topic? }` |
| `get_weak_topics` | — | `{ topic_id, accuracy, attempts }[]` |
| `generate_worksheet_seed` | — | `number` |
| `export_worksheet_pdf` | `{ questions, seed, includeAnswers }` | `string` (file path) |
| `reset_all_data` | — | `void` |

## Generator Modules

All topic generators follow this signature:

```typescript
type GeneratorFn = (difficulty: string, rng?: RngFn) => QuestionDto;
```

### Arithmetic

| ID | Function | Scope |
|---|---|---|
| `add` | `generateAddition` | arithmetic |
| `subtrt` | `generateSubtraction` | arithmetic |
| `mult` | `generateMultiplication` | arithmetic |
| `divid` | `generateDivision` | arithmetic |

### Algebra

Topics include: linear equations, quadratic equations, rational equations, systems of equations, factoring, logarithms, polynomials, sequences, matrices, complex numbers, and more across `algebra`, `advanced`, and `precalculus` scopes.

### Calculus

Topics: limits, differentiation (power/product/chain/quotient), integration (basic, substitution, by-parts), definite integrals, series expansions across `calculus` and `advanced` scopes.

### Geometry

Topics: area, volume, distance, angles, Pythagoras, trigonometry, coordinate geometry across `geometry` and `advanced` scopes.

### Linear Algebra

Topics: matrix operations, determinants, inverses, eigenvalues across `linearAlgebra` and `advanced` scopes.

### Discrete Mathematics

Topics: logic, combinatorics, sequences, modular arithmetic across `discrete` and `advanced` scopes.

### Trigonometry

Topics: sin/cos/tan, identities, equations, unit circle across `trigonometry` and `advanced` scopes.

## Constants

### `topics`

```typescript
let topics: Topic[];  // All 134+ topic definitions with id, name, icon, category
```

### `scopeTopics`

```typescript
let scopeTopics: Record<string, string[]>;  // Maps scope → topic ID array
```

### `SESSION_STORAGE_KEY`

```typescript
let SESSION_STORAGE_KEY: string = "mentalSessionSnapshot";
```
