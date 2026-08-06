# Usage

## Modes

### Single Practice

Focused study on one topic at a time. Select a topic from the grid, set a scope, and generate questions one by one. Enable shuffle to randomize topics across the current scope.

### Mental Math

Timed session mode. Answer as many questions as possible before the timer runs out. Configurable timer (10–120s), question-count limit (1–20) or unlimited mode, difficulty, and scope filtering. Sessions track score, accuracy, and average response time, and include pause, resume, and skip controls. Interrupted sessions are auto-saved and can be resumed within 1 hour.

### Multiple-Choice (MCQ)

Toggle MCQ mode in the toolbar (or Settings). Each question gets a set of generated choices (2–6, default 4). Clicking a choice checks the answer immediately; the correct answer is exactly one of the choices.

## Settings

### Basic

| Setting | Options | Default |
|---|---|---|
| Theme | `system` / `light` / `dark` | `system` |
| Default Mode | `single` / `mental` | `single` |
| Auto-continue (Single) | toggle | off |
| Shuffle | toggle (per-mode) | off |
| Scope | `simple` / `algebra` / `precalc` / `calc` / `all` | `simple` |
| Difficulty | `easy` / `medium` / `hard` | `medium` |
| Timer (mental) | 10–120s | 30s |
| Max Questions | 1–20 | 5 |
| Font | `default` / `opendyslexic` | `default` |

### Advanced

| Setting | Purpose |
|---|---|
| Performance Master | Global toggle for all performance features |
| Wave Animation | Animated liquid background |
| Blur Effects | Glassmorphism backdrop blur |
| Live Preview | KaTeX preview of the typed answer |
| Animations | UI transition effects |
| FPS Cap | Frame rate limit (30/60/90/120/0 = screen) |
| Notifications | Info toast notifications |
| Auto-check Delay | ms before the next auto-generated question (100–5000) |
| Decimal Places | Numeric answer tolerance (0–10) |
| MCQ Choices | Number of choices (2–6) |
| Adaptive Learning | Auto-adjust difficulty based on performance |
| Sound / Vibration | Audio feedback and haptics |

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl+G` | Generate a new question |
| `Shift+Enter` / `Ctrl+Enter` | Check the answer |
| `Ctrl+1` / `Ctrl+2` | Switch to Single / Mental mode |
| `Ctrl+,` | Open Settings |
| `Ctrl+Shift+T` | Toggle theme |
| `Escape` | Close modals |
| `/`, `^`, `_` (in answer box) | Insert `\frac{}{}`, `^{}`, `_{}` |

## Generating Questions

Click any topic pill to select it, then press **Generate** (or `Ctrl+G`). The question appears with MathJax-rendered LaTeX. Type your answer and press `Shift+Enter` — the answer checker evaluates equivalence and shows feedback. Use the math toolbar (or its `⋯` dropdown) to insert symbols.

### Answer Format

Answers use math.js syntax for evaluation:

- Fractions: `3/4`
- Exponents: `2^3` or `2**3`
- Square roots: `sqrt(16)`
- Functions: `sin(pi/2)`, `log(100)`, `ln(e)`
- Implicit multiplication: `2x` → `2*x`

## Adaptive Learning

The Rust backend tracks per-topic and per-difficulty accuracy. When enabled:

- **Difficulty auto-adjusts**: accuracy < 40% → Easy, 40–80% → Medium, > 80% → Hard
- **Weak topic detection**: topics with < 70% accuracy after ≥ 3 attempts are flagged
- **Recommendations**: a popup suggests reviewing weak topics after sessions

Reset adaptive data via Settings → Advanced → Reset All Data.

## PDF Worksheets

Generate printable worksheets with answer keys:

1. Click **Print Worksheet**
2. Configure: title, student name/date/period, number of questions (5/10/20/30), scope, specific topic, difficulty (incl. mixed), answer key mode (none / appended / separate page / only), page numbers, and metadata
3. Optionally enter a seed for reproducible questions (the generated seed is shown and copyable)
4. **Generate Worksheet** to preview, then **Export PDF**

The Rust backend renders each LaTeX expression to a PNG via RaTeX and embeds it with `printpdf` for crisp PDFs. In web mode, export falls back to the browser's print dialog.

## MCQ Mode

Toggle MCQ mode in the toolbar or Settings. The distractor generator produces plausible wrong answers:

- **Numeric**: offsets, inverses, rounding errors, common arithmetic mistakes
- **Pattern-based**: sign flips, swapped operands, misapplied operations
- **Fallback**: random string variations

Configure the number of choices (2–6) in Advanced settings.

## Testing

The project has a three-layer test suite:

- **Unit tests** (Vitest + jsdom): `npm run test:run` — 7,000+ cases, including per-topic generator integrity and regression tests
- **End-to-end tests** (Playwright, system Chrome): `npm run test:e2e` — 85+ tests covering all topics × difficulties, both modes, MCQ, settings, print worksheets, and desktop fallbacks
- **Rust tests**: `cargo test` in `src-tauri/` — 200+ tests for scores, performance, adaptive logic, and PDF export
