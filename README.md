# RandMatQuGeA (Random Math Question Generator App) 🧮 available at [math.richardsblogs.com](https://math.richardsblogs.com)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue?style=for-the-badge&logo=apache&logoColor=white)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/richie-rich90454/random-math-question-generator-app?style=for-the-badge&logo=github&logoColor=white)](https://github.com/richie-rich90454/random-math-question-generator-app/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/richie-rich90454/random-math-question-generator-app?style=for-the-badge&logo=github&logoColor=white)](https://github.com/richie-rich90454/random-math-question-generator-app/network/members)
[![GitHub issues](https://img.shields.io/github/issues/richie-rich90454/random-math-question-generator-app?style=for-the-badge&logo=github&logoColor=white)](https://github.com/richie-rich90454/random-math-question-generator-app/issues)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/richie-rich90454/random-math-question-generator-app?style=for-the-badge&logo=github&logoColor=white)](https://github.com/richie-rich90454/random-math-question-generator-app/releases)
[![Live Demo](https://img.shields.io/badge/demo-live-green?style=for-the-badge&logo=vercel&logoColor=white)](https://math.richardsblogs.com/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.19.0-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-7.0.2-%23007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tauri](https://img.shields.io/badge/tauri-2.12.1-%2324C8DB?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/rust-2021%20edition-%23DEA584?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Vite](https://img.shields.io/badge/vite-8.3.1-%23646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/vitest-5.0.2-%236E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/playwright-1.56-%232EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![MathJax](https://img.shields.io/badge/MathJax-4.1.2-007ACC?style=for-the-badge&logo=mathjax&logoColor=white)](https://www.mathjax.org/)
[![KaTeX](https://img.shields.io/badge/KaTeX-0.18.9-007ACC?style=for-the-badge&logo=katex&logoColor=white)](https://katex.org/)
[![Math.js](https://img.shields.io/badge/math.js-15.2.0-007ACC?style=for-the-badge&logo=math.js&logoColor=white)](https://mathjs.org/)
[![Three.js](https://img.shields.io/badge/three.js-0.186-%23000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![SQLite](https://img.shields.io/badge/sqlite-embedded-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Offline First](https://img.shields.io/badge/offline-first-success?style=for-the-badge&logo=offline&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_service_workers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge&logo=github&logoColor=white)](CONTRIBUTING.md)
[![Cross-Platform](https://img.shields.io/badge/cross--platform-windows%20%7C%20macos%20%7C%20linux-success?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)

A free mathematics practice app that covers **204 topics** from arithmetic to linear algebra, checks every answer instantly, and runs as a web app, an installable PWA, and a native desktop app. It generates its own questions rather than asking a language model for them, so a wrong answer is never the app's fault and the same question never changes between runs.

## ✨ Key Features

- **📚 204 Math Topics** across 7 subject areas, from place value to divergence and curl
- **⚡ Instant Feedback**: real-time answer checking with a hint ladder and a worked solution
- **🧠 Mental Math Mode**: timed sessions with score tracking, pause/skip, unlimited practice, and per-session statistics
- **✅ Multiple-Choice Mode**: every question presents four options with exactly one correct — never padded with filler to reach a count
- **🗨️ Topic Finder**: search by topic name *or* category, filter by category chip, and see how many topics are showing
- **🏅 Daily Challenge**: ten questions, the same for everyone on the same day, with a progress track and a streak
- **🖨️ Printable Worksheets**: worksheet PDFs with answer keys (appended / separate page / answer-key-only), seeded for reproducibility
- **🖥️ Native Desktop App**: Tauri 2 with system tray, global shortcuts, Mica window effects, and a Rust SQLite backend
- **🎯 Adaptive Learning** (desktop only): spaced repetition per topic *and per procedure*, adjusted for how confident you actually were, with the reason shown beside each question
- **🔒 Privacy**: nothing leaves the device, ever. The web build starts in a private session and keeps nothing until you choose otherwise
- **📱 Mobile-first**: the topic grid is filterable and searchable rather than a wall of 204 pills
- **🔢 Math Notation**: MathJax and KaTeX rendering, with a symbol toolbar for typing
- **📴 Offline Ready**: the service worker precaches every asset; the web app works fully offline

### ❓ Why not just use AI-generated questions?

- No distractions, and no hallucinated answers — the key is computed, never guessed
- Unlimited *structured* practice, not a random stream of plausible-looking text
- Instant correctness verification from a real evaluator
- Works offline, as a desktop app, with no account
- Fully open-source and auditable

## 📦 Install (no Node.js or Rust needed)

Download the latest installer from **GitHub Releases**:

- Windows: `.exe`
- macOS: `.dmg`
- Linux: `.AppImage` / `.deb`

➡️ [https://github.com/richie-rich90454/random-math-question-generator-app/releases](https://github.com/richie-rich90454/random-math-question-generator-app/releases)

## 📚 The Curriculum (204 topics)

Every topic below is generated, graded, and oracle-checked. Counts are the number of registered topics in that subject.

| Category | Topics | What it covers |
|---|---|---|
| **Arithmetic** (12) | 12 | Place value, negative numbers, long division, powers of ten, rounding and estimation, prime factorisation, least common multiples, money and change, plus the four operations |
| **Algebra** (61) | 61 | Fractions, percentages, ratios, unit conversion, expressions, radicals, exponents, scientific notation, complex numbers, logarithms, exponentials, finance, graphs, polynomials, factoring, absolute-value equations and inequalities, quadratic word problems, systems of inequalities, piecewise functions, polynomial theorems, and much more |
| **Calculus** (19) | 19 | Limits, continuity, derivatives (polynomial, trig, exponential, logarithmic, product, quotient, chain, implicit, higher order, motion), integrals (definite, area, substitution, initial value), related rates, optimization, L'Hôpital, Taylor series, the fundamental theorem, the mean value theorem, improper integrals, partial derivatives, divergence and curl, parametric curves |
| **Linear Algebra** (22) | 22 | Matrix operations, row echelon form, systems, partial fractions, linear programming, 3D vectors, lines and planes in 3D, eigenvalues and eigenvectors, orthogonality, cross products, determinants, Cramer's rule, rank, null space, LU decomposition, matrices as transformations, bases and coordinates, linear independence, least squares, symmetric matrices |
| **Trigonometry** (37) | 37 | The six ratios and their inverses, trig equations, trig graphs, degrees/radians, arc length, angular and linear speed, right-triangle definitions, special triangles, elevation and depression, reference angles, ASTC signs, sum/difference, double-angle, half-angle, polar conversion, parametric motion, complex polar form and De Moivre, exact values, identities, general solutions, the law of sines, the law of cosines, the ambiguous case |
| **Discrete Mathematics** (29) | 29 | Permutations, combinations, probability, statistics, divisibility, GCD/LCM, modular arithmetic, data analysis, counting principles, probability rules, propositional logic, logic equivalences, set operations, inclusion–exclusion, the pigeonhole principle, graph basics, Euler and Hamilton paths, graph coloring, spanning trees, recurrence relations, Boolean algebra, relations, advanced counting |
| **Geometry** (24) | 24 | Area and perimeter of circles and polygons, surface area, volume, the Pythagorean theorem, similarity, rigid motions, circle geometry, triangle congruence, the triangle inequality, triangle area, quadrilateral area, polygon angles, regular polygons, midsegments, angle bisectors, composite figures, volumes of solids |

## 🚀 Quick Start

### Web (development)

```bash
git clone https://github.com/richie-rich90454/random-math-question-generator-app.git
cd random-math-question-generator-app
npm install
npm run dev
```

Then open [http://localhost:1331](http://localhost:1331).

### Desktop (development)

```bash
npm install
npm run tauri dev      # starts the dev server and the native window
```

### Tests and checks

```bash
npm run typecheck      # tsc --noEmit
npm run test:unit      # Vitest unit suite (132 files, 10,007 cases)
npm run test:oracle    # the invariant gate over all 204 topics
npm run test:coverage  # unit suite with the enforced coverage floor
npm run test:e2e       # Playwright, Chromium + WebKit, desktop and mobile projects
npm run bundle:check   # initial-load budget
npm run check          # typecheck + full Vitest run (unit + oracle) + bundle check
cd src-tauri && cargo test   # Rust backend
```

## 🎯 How to Use

1. **Pick a topic** — search by name or category, or use the category chips to narrow 204 topics to one subject
2. **Generate** — click Generate (or `Ctrl+G`)
3. **Answer** — type in the box, or use the symbol toolbar; `Shift+Enter` checks
4. **Learn** — take the hint ladder one rung at a time, and the worked solution only if you want it

### Modes

- **Single Practice** — one topic at a time, with optional shuffle across the scope
- **Mental Math** — timed sessions, question limit or unlimited, with pause, skip, and per-session accuracy and average time
- **Daily Challenge** — ten questions, identical for everyone on a given date; refreshing mid-set resumes rather than restarts
- **Multiple-Choice** — four options, one correct, with the key placed at a random position

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+G` | Generate a new question |
| `Shift+Enter` / `Ctrl+Enter` | Check the answer |
| `Ctrl+1` / `Ctrl+2` | Switch to Single / Mental mode |
| `Ctrl+,` | Open Settings |
| `Ctrl+Shift+T` | Toggle theme |
| `Escape` | Close modals |

### Desktop-Only Features

Several features depend on the Rust backend and are **hidden rather than disabled** in the web build, so the interface never offers something it cannot do:

- **Adaptive learning** — difficulty adjustment and weak-topic recommendations
- **The confidence question** — its only reader is the scheduler's overconfidence correction
- **Performance data** — per-topic statistics, stored in SQLite
- **Leaderboard**, **in-app updates**, and the **learning-record dialog**

If you do not see the adaptive toggle in Settings, adaptive learning cannot run where you are, and that is now decided by two things rather than one. It needs the desktop runtime, because the scheduler's inputs are performance records written over Tauri IPC, and it needs a store that will still have the record tomorrow, because a private session discards it when the window closes. Both conditions are re-checked whenever the mode changes, so turning a private session on removes the adaptive surfaces at that moment rather than at the next restart.

Every one of those surfaces is listed in one table, `src/main/core/GatedSurfaces.ts`, and applied in one place. Deciding each surface where it is built is how four of them were missed while three were hidden — the confidence control, the streak badge, the record dialog and the updates section all survived that way. The confidence control was the worst of them: it is asked after every graded answer, and its one reader is the scheduler, which cannot run in a browser, so it was being collected, stored, and read by nothing.

Everything else — all 204 topics, every mode, hints, solutions, worksheets, and the daily challenge — works identically in both builds.

### Reaching every topic

The topic grid opens on the arithmetic scope, and the scope is a real constraint: it decides which of the 204 topics are on screen. Two controls cross it rather than stopping at it, because a filter that can be pointed at nothing is a dead end:

- **A category chip** that the current scope excludes widens the scope to the narrowest one holding that category. `Calculus 0` against the arithmetic scope means *not in this scope*, not *unavailable*, and choosing it says so by changing the scope rather than by showing an empty grid.
- **The search box** does the same. Typing the name of a topic is about as unambiguous a request as this interface gets, so a term the scope cannot answer widens the scope instead of returning nothing.

In both cases the scope control is left showing what changed, so the narrowing that was given up is visible and can be taken back.

## 🔒 Privacy and Where Your Data Goes

All persistence goes through one module, `src/main/services/Storage.ts`. Nothing else writes to `localStorage` or IndexedDB, and nothing else decides whether a write is durable.

| Mode | What is kept | Where |
|---|---|---|
| **Private session** (web default) | Nothing at all after you close the tab | Memory only |
| **Keep on this device** (web) | Settings, review schedule, streak, records | IndexedDB, this browser only |
| **Desktop** | The same, plus performance data | SQLite in the app's data directory |

The mode control always names the store that is really in force. On the desktop build that is the third option, and the control is disabled: the desktop app has one store and writes it to disk, so a private session is not something it can offer, and saying otherwise while keeping everything would be a false promise rather than a setting.

Choosing *Private session* reads and then deletes anything an earlier build left in `localStorage`, so the promise holds even after an upgrade. A versioned learning record can be exported and re-imported from the Data dialog on either build; import is atomic and merges or replaces by choice.

## 🛠️ Technology Stack

- **Frontend**: TypeScript 7.0.2 (strict), vanilla DOM, no framework
- **Build tool**: Vite 8.3.1
- **Math rendering**: MathJax 4.1.2 and KaTeX 0.18.9
- **Math engine**: Math.js 15.2.0, with `fraction.js` for exact rational comparison
- **3D / graphs**: Three.js 0.186, canvas rendering for trigonometric and polar graphs
- **Desktop**: Tauri 2.12.1 (Rust 2021) with tray, dialog, process and updater plugins
- **Database**: SQLite via `sqlx` on the desktop build; IndexedDB in the browser
- **Testing**: Vitest 5.0.2 + jsdom, Playwright 1.56, `cargo test`

## 📁 Project Structure

```
random-math-question-generator-app/
├── src/
│   ├── index.html            # the single page
│   ├── script.ts             # boot sequence
│   ├── style.css             # responsive styling
│   ├── utils/envUtils.ts     # the one place that decides which runtime this is
│   ├── main/
│   │   ├── core/             # StateStore, QuestionState, DomRegistry, DomVisibility
│   │   ├── services/         # Storage, ReviewStore, Scheduler, DailyMode, Help, Backend (the Tauri seam)
│   │   ├── Settings.ts       # settings and the persistence decision
│   │   ├── Topics.ts         # topic grid, search, category filter, scopes, on-demand table loader
│   │   ├── Answer.ts         # the single grading pipeline
│   │   ├── AnswerFormat.ts   # one answer normalizer, shared by all three callers
│   │   ├── Mcq.ts            # the option-set contract
│   │   └── Generation.ts     # question orchestration
│   ├── modules/              # 204 topic generators across 7 subjects
│   │   └── <Subject>/        # index.ts barrel + RegisterTopics.ts
│   └── __tests__/            # unit and oracle suites
├── e2e/                      # Playwright specs, 3 browser projects
├── src-tauri/                # Rust backend
│   ├── src/                  # lib.rs, adaptive.rs, pdf.rs, record.rs, main.rs
│   ├── Cargo.toml            # crate versions pinned with `=`
│   └── tauri.conf.json
├── scripts/                  # bundle budget, wrapper checksum pin check
├── Cargo.toml / Cargo.lock   # the single Rust workspace lock
├── vite.config.ts            # build config and the coverage floor
└── playwright.config.ts
```

## 🧪 How Correctness Is Enforced

Two rules are never traded away, and both are checked by CI rather than by review:

1. **A question's printed prompt and its graded answer must be the same problem.**
2. **A multiple-choice question must have four options with exactly one correct.**

The oracle in `src/__tests__/oracle/` samples every registered topic at every difficulty and asserts the option-set contract, LaTeX validity, well-formedness, and that no distractor is also the key. `scripts/bundle-check.js` and `vite.config.ts` enforce the initial-load budget and the coverage floor, and `scripts/gradle-wrapper-pin-check.js` verifies the Gradle distribution against a pinned SHA-256.

Where a generator's natural question has fewer than four honest answers, **the question is redesigned rather than padded** — "which of these four equations has no solution?" instead of "how many solutions?", for example.

## 📊 Current State

| Gate | Result |
|---|---|
| Type check | clean |
| Unit tests | 132 files, 10,007 passed, 6 skipped |
| Invariant oracle | 26 tests across all 204 topics |
| End-to-end | 390 tests in 17 files; desktop project verified in full, mobile projects for interaction specs |
| Coverage | statements 86.7%, branches 73.2%, functions 74.3%, lines 88.8% (floor 74/58/58/76 enforced) |
| Rust tests | 227 passed (`cargo test -p random_math_question_generator`) |
| Bundle | JS 34.6 kB, CSS 8.7 kB, total 53.7 kB gzipped (budget 36/10/55.5) |

## ⚠️ A Note on Tauri Versions

The JavaScript packages and the Rust crates must be on the **same major and minor**, or `npm run tauri dev` refuses to start:

```
Error: Found version mismatched Tauri packages...
```

Both sides are pinned to a matching set (`tauri` 2.12.1 with `@tauri-apps/api` 2.12.1, and each plugin likewise), and the Rust requirements use `=` so cargo cannot resolve to a different minor on its own. If you upgrade one side, upgrade the other in the same commit and update the root `Cargo.lock` with `cargo fetch`. There is one workspace lock, at the repository root.

## 🤝 Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, and [CODE_STYLE.md](CODE_STYLE.md) for the formatting and architecture rules the codebase enforces.

## 🔒 Security

Please see [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=richie-rich90454/random-math-question-generator-app&type=Date)](https://star-history.com/#richie-rich90454/random-math-question-generator-app&Date)

## 📄 License

Apache License 2.0. See [LICENSE](LICENSE).

## 🔗 Links

- **Live Demo**: [https://math.richardsblogs.com/](https://math.richardsblogs.com/)
- **GitHub Repository**: [https://github.com/richie-rich90454/random-math-question-generator-app](https://github.com/richie-rich90454/random-math-question-generator-app)
- **Main Website**: [https://www.richardsblogs.com](https://www.richardsblogs.com)
- **Tauri Framework**: [https://tauri.app/](https://tauri.app/)
- **Vite Build Tool**: [https://vitejs.dev/](https://vitejs.dev/)
- **TypeScript**: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)

---

⭐ **If you find this project helpful, please consider giving it a star!** ⭐
