# Usage

## Modes

### Single Practice

Focused study on one topic at a time. Select a topic from the grid, set difficulty, and generate questions one by one. Enables shuffle mode to randomize topics across a scope.

### Mental Math

Timed session mode. Answer as many questions as possible before time runs out. Configurable timer (30s–5min), question count limit, and scope filtering. Leaderboard persists scores across sessions. Automatically saves session snapshots (1h TTL) so interrupted sessions can be resumed.

## Settings

### Basic

| Setting | Options | Default |
|---|---|---|
| Theme | `system` / `light` / `dark` | `system` |
| Default Mode | `single` / `mental` | `single` |
| Auto-continue | toggle | off |
| Shuffle | toggle (per-mode) | off |
| Scope | `simple` / `advanced` / `all` | `simple` |
| Difficulty | `easy` / `medium` / `hard` | `medium` |
| Timer (mental) | 10–300s | 30s |
| Max Questions | 1–100 | 5 |
| Font | `default` / `opendyslexic` | `default` |

### Advanced

| Setting | Purpose |
|---|---|
| Performance Master | Global toggle for all performance features |
| Wave Animation | Animated liquid background |
| Blur Effects | Glassmorphism backdrop blur |
| Preview | Question preview animation |
| Animations | UI transition effects |
| FPS Cap | Frame rate limit (0 = unlimited) |
| Notifications | Answer result toasts |
| Auto-check Delay | ms before auto-checking answer |
| Decimal Places | Rounding precision |
| MCQ Choices | Toggle + count (2–6) |
| Adaptive Learning | Auto-adjust difficulty based on performance |
| Sound / Vibration | Audio feedback and haptics |

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Enter` | Submit answer / Next question |
| `1`–`6` | Select MCQ choice (index) |
| `Space` | Toggle pause (mental mode) |
| `Escape` | Close modals / settings |

## Generating Questions

Click any topic card to select it, then press **Generate**. The question appears with MathJax-rendered LaTeX. Type your answer and press Enter — the answer checker evaluates equivalence and shows feedback.

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

1. Select a topic and difficulty
2. Click **Print Worksheet**
3. Configure: number of questions (5–50), answer key mode (appended / separate / only)
4. Save the PDF via the system dialog

The Rust backend uses `printpdf` with embedded Libertinus Math font and RaTeX for LaTeX → PNG rendering.

## MCQ Mode

Toggle MCQ mode in settings. The distractor generator produces plausible wrong answers:

- **Numeric**: offsets, inverses, rounding errors, common arithmetic mistakes
- **Pattern-based**: sign flips, swapped operands, misapplied operations
- **Fallback**: random string variations

Configure the number of choices (2–6) in Advanced settings.
