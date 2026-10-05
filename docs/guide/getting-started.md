# Getting Started

## Prerequisites

- **Node.js** ≥ 20.19 (Vite 8 requirement; 22.12+ recommended)
- **npm**
- **Rust toolchain** (for Tauri desktop build; web-only mode skips this)

## Quick Start

```bash
# Clone
git clone https://github.com/richie-rich90454/RandMatQuGeA.git
cd RandMatQuGeA

# Install dependencies
npm install

# Dev server (web mode)
npm run dev

# Type-check
npm run typecheck

# Run unit tests (Vitest)
npm run test:run

# Run end-to-end tests (Playwright, uses your installed Chrome)
npm run test:e2e
```

Open `http://localhost:1331` in your browser — the app is fully functional as a web app without Tauri.

## Tauri Desktop Build

```bash
# Install Tauri CLI
npm run tauri

# Development window
npm run tauri dev

# Production build
npm run tauri build
```

The Rust backend provides SQLite persistence, adaptive learning, and PDF export. Without it, the app degrades gracefully: settings persist through the Storage module (IndexedDB, memory-only in private sessions), and question generation still works.

## Project Structure

```
RandMatQuGeA/
├── src/
│   ├── index.html          # SPA entry point
│   ├── script.ts           # App bootstrap
│   ├── style.css           # Complete theme (glassmorphism)
│   ├── vitest.setup.ts     # Vitest global mocks
│   ├── main/               # Core modules
│   │   ├── core/           # StateStore, DomRegistry, QuestionRenderer
│   │   ├── services/       # Storage, Scheduler, ReviewStore, TopicRegistry, EventBinder, MathWorkerClient, DailyChallenge, DailyMode, Help, Backend
│   │   ├── ui/             # Skeleton, OfflineIndicator, VirtualTopicGrid
│   │   ├── Settings.ts     # 50+ settings with persistence
│   │   ├── Generation.ts   # Question orchestration + adaptive
│   │   ├── Answer.ts       # Answer checking pipeline
│   │   ├── Session.ts      # Mental math session manager
│   │   ├── Mcq.ts          # MCQ distractor generation
│   │   ├── PrintWorksheet.ts
│   │   └── ...
│   ├── modules/            # Question generators by subject
│   │   ├── Arithmetic/
│   │   ├── Algebra/
│   │   ├── Calculus/
│   │   ├── ...
│   ├── __tests__/          # 10,000+ Vitest unit tests
│   └── types/              # TypeScript type definitions
├── e2e/                    # Playwright end-to-end tests (390 tests)
├── src-tauri/              # Rust backend (SQLite, PDF, adaptive)
├── public/                 # Static assets (fonts, MathJax, KaTeX, service worker)
├── playwright.config.ts    # E2E config (bundled Chromium + WebKit, dev server on :1331)
└── vite.config.ts          # Vite build config
```

## Next Steps

- Learn the [architecture](./architecture)
- Explore [usage patterns](./usage)
- Browse the [API reference](../api/)
