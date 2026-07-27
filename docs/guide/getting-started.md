# Getting Started

## Prerequisites

- **Node.js** ≥ 18
- **npm** or **pnpm** or **yarn**
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

# Run tests
npm run test:run
```

Open `http://localhost:5173` in your browser — the app is fully functional as a web app without Tauri.

## Tauri Desktop Build

```bash
# Install Tauri CLI
npm run tauri

# Development window
npm run tauri dev

# Production build
npm run tauri build
```

The Rust backend provides SQLite persistence, adaptive learning, and PDF export. Without it, the app degrades gracefully: scores and settings save to localStorage, and question generation still works.

## Project Structure

```
RandMatQuGeA/
├── src/
│   ├── index.html          # SPA entry point
│   ├── script.ts           # App bootstrap
│   ├── style.css           # Complete theme (glassmorphism, 2124 lines)
│   ├── main/               # Core modules
│   │   ├── core/           # StateStore, DomRegistry, QuestionRenderer
│   │   ├── services/       # TopicRegistry, EventBinder, MathWorkerClient
│   │   ├── ui/             # Skeleton, OfflineIndicator, VirtualTopicGrid
│   │   ├── Settings.ts     # 50+ settings with persistence
│   │   ├── Generation.ts   # Question orchestration + adaptive
│   │   ├── Answer.ts       # Answer checking pipeline (583 lines)
│   │   ├── Session.ts      # Mental math session manager
│   │   ├── Ui.ts           # UI helpers (notifications, score, timers)
│   │   └── ...
│   ├── modules/            # Question generators by subject
│   │   ├── Arithmetic/
│   │   ├── Algebra/
│   │   ├── Calculus/
│   │   ├── ...
│   └── types/              # TypeScript type definitions
├── src-tauri/              # Rust backend (SQLite, PDF, adaptive)
└── public/                 # Static assets (fonts, MathJax, KaTeX)
```

## Next Steps

- Learn the [architecture](./architecture)
- Explore [usage patterns](./usage)
- Browse the [API reference](../api/)
