# Contributing to RandMatQuGeA

Thank you for your interest in contributing to RandMatQuGeA! This document outlines the guidelines and processes for contributing to the project. Whether you are reporting a bug, suggesting a feature, or submitting code changes, your help is greatly appreciated.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setting Up the Development Environment](#setting-up-the-development-environment)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
  - [Branching and Commits](#branching-and-commits)
  - [Running the Application](#running-the-application)
  - [Building for Production](#building-for-production)
- [Code Style and Conventions](#code-style-and-conventions)
  - [Rust](#rust)
  - [TypeScript/JavaScript](#typescriptjavascript)
  - [CSS](#css)
  - [Documentation](#documentation)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
  - [Pull Request Process](#pull-request-process)
- [Additional Resources](#additional-resources)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code. Please report unacceptable behavior to [rjiang880@gmail.com](mailto:rjiang880@gmail.com).

---

## Getting Started

### Prerequisites

- **Node.js**: Version 20.19 or higher (Vite 8 requirement; 22.12+ recommended)
- **Rust**: Latest stable version (install via [rustup](https://rustup.rs/))
- **Tauri CLI**: Provided via the project's `@tauri-apps/cli` devDependency; run Tauri commands with `npm run tauri ...` (no separate install needed).
- **Platform-specific dependencies**:  
  - **Windows**: Microsoft Visual Studio C++ build tools  
  - **macOS**: Xcode Command Line Tools  
  - **Linux**: See [Tauri documentation](https://tauri.app/v1/guides/getting-started/prerequisites) for required packages

### Setting Up the Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/richie-rich90454/RandMatQuGeA.git
   cd RandMatQuGeA
   ```

2. Install JavaScript dependencies:
   ```bash
   npm install
   ```

3. (Optional) Run the application in development mode:
   ```bash
   npm run tauri dev
   ```

---

## Project Structure

```
.
├── src/                    # Frontend source code (TypeScript, CSS, HTML)
│   ├── index.html          # Main web application interface
│   ├── script.ts           # App entry / wiring
│   ├── style.css           # Global styles (glassmorphism theme)
│   ├── vitest.setup.ts     # Vitest global mocks (Tauri API, three.js, canvas)
│   ├── main/               # Core application code
│   │   ├── core/           # StateStore, QuestionState, DomRegistry, QuestionRenderer
│   │   ├── services/       # Storage, Scheduler, ReviewStore, TopicRegistry, EventBinder, MathWorkerClient, DailyChallenge, DailyMode, Help, Backend
│   │   ├── ui/             # Skeleton, OfflineIndicator, VirtualTopicGrid
│   │   └── ...             # Settings, Generation, Answer, Session, Mcq, PrintWorksheet, ...
│   ├── modules/            # Question generation modules (7 subjects, 204 topics)
│   │   ├── Algebra/
│   │   ├── Arithmetic/
│   │   ├── Calculus/
│   │   ├── DiscreteMathematics/
│   │   ├── Geometry/
│   │   ├── LinearAlgebra/
│   │   └── Trigonometry/
│   ├── __tests__/          # 10,000+ Vitest unit tests (mirror src structure)
│   └── types/              # TypeScript type definitions (global.d.ts)
├── e2e/                    # Playwright end-to-end tests (390 tests across desktop, Pixel 7, and iPhone 14 projects)
├── src-tauri/              # Rust backend (Tauri v2)
│   ├── src/
│   │   ├── lib.rs          # Tauri commands (scores, performance, PDF, adaptive)
│   │   ├── adaptive.rs     # Difficulty + weak-topic recommendation logic
│   │   ├── pdf.rs          # Rust PDF worksheet engine (printpdf + RaTeX)
│   │   └── main.rs         # Entry point (calls lib)
│   ├── Cargo.toml          # Rust dependencies (sqlx, tauri, printpdf, ratex)
│   └── tauri.conf.json     # Tauri configuration (window, tray, updater)
├── public/                 # Public assets (fonts, MathJax, KaTeX, service worker)
├── playwright.config.ts    # E2E config (bundled Chromium + WebKit, dev server on :1331)
├── package.json            # Node dependencies and scripts
├── vite.config.ts          # Vite build configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project overview
```

---

## Development Workflow

### Branching and Commits

- **main** – The primary branch. All changes should be merged via pull requests.
- Use descriptive commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification:
  - `feat:` – new feature
  - `fix:` – bug fix
  - `docs:` – documentation updates
  - `style:` – formatting changes (no code change)
  - `refactor:` – code restructuring
  - `test:` – adding or updating tests
  - `chore:` – maintenance tasks (dependencies, configs)

Example:
```
feat(algebra): add support for polynomial long division
```

### Running the Application

Start the development server and Tauri application:
```bash
npm run tauri dev
```

This launches the frontend in a browser window with live‑reload.

### Building for Production

To create a production build for your current platform:
```bash
npm run tauri build
```

The generated bundles will be located in `src-tauri/target/release/bundle/`.

### Bundle Budget

The project enforces a bundle budget to keep the initial-load size small. After building, run:
```bash
npm run bundle:check
```

This checks the gzipped sizes of the initial entry chunks against the budgets:
- Initial JS entry chunk: ≤ 36 kB gzipped
- Initial CSS chunk: ≤ 10 kB gzipped
- Total initial load (HTML + JS + CSS): ≤ 55.5 kB gzipped

Override budgets via env vars (useful for testing): `BUNDLE_JS_BUDGET_KB=40 npm run bundle:check`

The check runs automatically in CI after the build step. If your PR adds a new dependency or significantly changes the initial bundle, verify locally with `npm run build && npm run bundle:check`.

---

## Code Style and Conventions

**Read [CODE_STYLE.md](CODE_STYLE.md) at the repository root before you write code.** It is the single authority on formatting, naming, the programming paradigm, the complexity budget, generator correctness, and documentation obligations. Where this file or `AGENTS.md` disagrees with it, `CODE_STYLE.md` wins.

In summary:

- **4-space indentation**, enforced by `.editorconfig` and `rustfmt.toml`. Never tabs.
- **Dense style**: no blank lines inside function bodies, no spaces around operators, no space between a keyword and its opening paren, `let` for all bindings, semicolons on every statement.
- **Named exports only**; no default exports; `import type` for type-only imports.
- **No framework.** This is a vanilla-DOM application with module-level singletons, and the 36 kB gzipped initial-JS budget in `scripts/bundle-check.js` depends on that. Do not add React, Vue or Svelte.
- **Two invariants CI enforces**: a generator's printed question and its claimed answer must be the same problem, and a multiple choice question must have four options of which exactly one is correct.
- **JSDoc on exported functions and non-obvious logic**, with `@param` and `@returns`.

### Rust

- Run `cargo fmt` before committing. `rustfmt.toml` sets 4-space indentation.
- `cargo clippy` warnings are errors.
- Document public functions with `///` comments.
- Commands return `Result<T, String>` with sentence-case messages. Never return `serde_json::Value`; define a struct so the TypeScript side is typed.
- Database changes go in `src-tauri/migrations/`. Never edit a shipped migration.

### Documentation

Behavior changes update the docs in the same commit. `CODE_STYLE.md` has the table
mapping each kind of change to the document it requires.

---

## Testing

The project uses a three-layer test strategy:

- **Unit tests** — Vitest + jsdom, colocated under `src/__tests__/` (10,000+ cases):
  ```bash
  npm test            # watch mode (local development)
  npm run test:run    # single non-watch run (CI / one-shot)
  npm run check       # typecheck + full Vitest run (unit + oracle) + bundle check
  ```
- **End-to-end tests** — Playwright in `e2e/` (390 tests across desktop, Pixel 7, and iPhone 14 projects). Uses bundled Chromium + WebKit (desktop, Pixel 7, iPhone 14 projects) and auto-starts the Vite dev server on port 1331:
  ```bash
  npm run test:e2e
  ```
- **Rust tests** — `cargo test` in `src-tauri/` (227 cases for scores, performance, adaptive logic, and PDF export).

Write tests for new features and bug fixes when applicable. Aim to cover edge cases, especially in answer‑checking logic.

---

## Submitting Changes

### Pull Request Process

1. **Create a branch** from `main` with a descriptive name:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**, ensuring they adhere to the coding conventions and pass all tests.

3. **Update documentation** (README, inline comments) if necessary.

4. **Commit your changes** using the Conventional Commits format.

5. **Push your branch** to your fork and open a pull request to the `main` branch.

6. **Request a review** from the maintainers. The PR will be reviewed for:
   - Code quality
   - Test coverage
   - Adherence to project style
   - No breaking changes without prior discussion

7. **Address any feedback** and ensure the CI pipeline passes (GitHub Actions will run tests and builds).

8. Once approved, a maintainer will merge your PR.

**Note:** For significant changes (e.g., new major features, breaking changes), please open an issue first to discuss the approach.

---

## Additional Resources

- [Tauri Documentation](https://tauri.app/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Vitest Documentation](https://vitest.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)

Thank you for contributing to RandMatQuGeA! Your efforts help make math practice more accessible and enjoyable for everyone.
