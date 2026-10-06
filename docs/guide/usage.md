# Usage

## Modes

### Single Practice

Focused study on one topic at a time. Select a topic from the grid, set a scope, and generate questions one by one. Enable shuffle to randomize topics across the current scope.

### Mental Math

Timed session mode. Answer as many questions as possible before the timer runs out. Configurable timer (10–120s), question-count limit (1–20) or unlimited mode, difficulty, and scope filtering. Sessions track score, accuracy, and average response time, and include pause, resume, and skip controls. Interrupted sessions are auto-saved and can be resumed within 1 hour.

### Multiple-Choice (MCQ)

Toggle MCQ mode in the toolbar (or Settings). Each question gets a set of generated choices (2–6, default 4). Clicking a choice checks the answer immediately; the correct answer is exactly one of the choices.

An option set is only ever shown with four options and exactly one correct. If a
generator offers a short set, or one with a duplicate or a second correct answer,
the builder repairs it — dropping the collision and filling from the answer's own
structure — rather than showing a question with two right answers. When no honest
alternative exists it returns fewer than four rather than padding with a
placeholder, because a filler option teaches you to find the one that looks like
an answer instead of reading the question.

### Hints and solutions

Every question has help. **Hint** reveals the next rung, one at a time:

1. what shape of answer is wanted, from the question's own declared format
2. what the answer looks like — a number, a fraction, an equation, a phrase
3. the misconception this question is designed to catch, where one applies
4. what to do next, without doing it

Once the rungs are spent the button becomes **Show the answer**, which gives the
answer and tells you to work backwards from it to find the step you missed. That
is deliberate: the last rung decides *which* step was missed rather than handing
over a number with no way to learn from it.

**Show solution** is separate from the hints, so you can work through a question
fully and then see the whole derivation rather than only the last nudge.

### Your data

Two choices, under Settings → General → **Data on this device**:

- **Private session (nothing is stored)** — nothing is written anywhere. Closing
  the tab erases every trace: your progress, your streak and your preferences.
- **Remember me (stored in this browser)** — your progress and streak survive a
  reload, stored only in this browser and never sent anywhere.

If the browser cannot actually store anything, the app falls back to a private
session rather than pretending to keep a record it cannot. The **Erase my
learning record** control is only shown when something is actually being kept,
and it removes the schedule, every recorded answer and your streak together.

On the desktop build the choice is the computer itself: the record lives in the
app's database on disk, so there is no private session to choose.

If you were using an earlier build that stored preferences in `localStorage`,
choosing either option moves them: into the browser store, or out of it entirely.
A private session never leaves anything behind.

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
- **Spaced repetition**: each topic and each procedure within it is scheduled by
  memory strength, so something you keep getting right comes back later and
  something you keep forgetting comes back soon
- **Overconfidence adjustment**: every answer is recorded with the confidence you
  reported. If you are consistently more certain than your results warrant, the
  interval shortens; if you consistently doubt answers you get right, it lengthens.
  The correction is bounded, so a run of luck cannot freeze a topic

The confidence question appears only on answers where it is informative and where
you took long enough to have thought about it, because asked every time it becomes
a habit rather than a judgement.

Each scheduled item carries the reason it is being asked, shown next to the
question: *"Correct 60% of the time, but often more certain than the result
warrants, so this comes back sooner"*.

Erase the record at any time with Settings → General → **Erase my learning
record**, or reset everything with Settings → Advanced → Reset All Data.

## Moving Your Record

Use the toolbar's **Manage performance data** dialog to take your record off a
device or put one back:

- **Export Data** writes a single JSON file holding the review history, every
  recorded answer, and the schedule.
- **Import Data** reads such a file. Choose **Merge** to add it to what is here,
  which is what you want when the file came from a session that practised a few
  more topics, or **Replace** to make the file the whole record.

A file this build cannot read is refused, and an import either lands completely
or not at all, so a partly-applied file cannot leave your history in a state you
did not ask for. Both work in the browser as well as the desktop app.

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

- **Unit tests** (Vitest + jsdom): `npm run test:unit` — 10,000+ cases, including per-topic generator integrity and regression tests
- **End-to-end tests** (Playwright, bundled Chromium + WebKit): `npm run test:e2e` — 393 tests covering all topics × difficulties, both modes, MCQ, settings, print worksheets, and desktop fallbacks
- **Rust tests**: `cargo test` in `src-tauri/` — 227 tests for scores, performance, adaptive logic, and PDF export
