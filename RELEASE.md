## Release v3.0.0

We are pleased to present version 3.0.0, the first major release built from the merged `main` branch after the version-three work. It expands the curriculum to 204 topics, replaces the worksheet export with a native Rust PDF pipeline, adds Mental Math, Daily Challenge and Multiple-Choice modes, and introduces a privacy-first storage model with portable learning records. It also fixes the Linux AppImage `.DirIcon` failure that affected v2.2.3, repairs the Windows fixed-runtime CI build, and updates the release toolchain and GitHub Actions. Existing desktop data is preserved and requires no manual migration.

### New Features

- **204-Topic Curriculum**  
  The curriculum has grown from 125+ topics to 204 topics across seven subject areas: Arithmetic, Algebra, Calculus, Linear Algebra, Trigonometry, Discrete Mathematics and Geometry. Every registered topic is generated, graded and checked by the invariant oracle at every difficulty.

- **Worksheet Studio**  
  Printable worksheets now support a live preview, custom title, student/date/period header fields, page numbers, a metadata toggle, and four answer-key modes: none, appended, separate page, and answer-key-only. Each worksheet is generated from a seed, so the same seed reproduces the same questions, and the seed can be copied for later use. The desktop build renders the PDF through a native Rust pipeline (`ratex-render` and `printpdf`), while the web build retains the browser print path.

- **Mental Math Mode**  
  Timed sessions with score tracking, pause and skip controls, a question limit or unlimited practice, and per-session accuracy and average-time statistics.

- **Daily Challenge**  
  Ten questions that are the same for everyone on a given day, with a progress track, a streak, and resume-in-place behavior if the set is refreshed midway.

- **Multiple-Choice Mode**  
  Every question presents four options with exactly one correct answer. The key is placed at a random position, and questions with fewer than four honest answers are redesigned rather than padded with filler.

- **Adaptive Learning and Review Schedule** (desktop)  
  Spaced repetition per topic and per procedure, adjusted for confidence, with the scheduling reason shown beside each question. The desktop build also exposes weak-topic recommendations, per-topic performance data, a leaderboard, and a learning-record dialog.

- **Privacy-First Storage and Portable Records**  
  The web build starts in a private session and keeps nothing after the tab closes unless the user chooses "Keep on this device." The desktop build stores the same data in SQLite. A versioned learning record can be exported and re-imported on either build, with atomic merge-or-replace behavior.

- **Offline and Performance Improvements**  
  The service worker precaches every asset, the web app works fully offline, and an offline indicator makes the state visible. The topic grid is virtualized, loading states use skeletons, and math evaluation runs in a Web Worker with a main-thread fallback.

### Improvements

- **Release Engineering and AppImage Fix**  
  The Linux AppImage now contains a relative `.DirIcon` symlink, a 512x512 PNG icon, a valid desktop entry with `Categories=Education;`, and an executable `AppRun`. A new `scripts/check-appimage.js` gate validates the AppImage AppDir before upload, so a broken `.DirIcon` cannot be published again. The release workflow now builds Linux with Rust 1.90.0, which satisfies the MSRV of the current Tauri stack.

- **Windows CI and Installer Fixes**  
  The fixed-runtime Windows build no longer requests updater signing in CI, where no signing key is supplied, and the installer upload path now points at the workspace-root `target/release/bundle/nsis` directory. The fixed-runtime configuration produces `RandMatQuGeA_3.0.0_x64-setup.exe` without a `.sig` file and without requiring signing keys.

- **Correctness and Test Coverage**  
  The full Vitest run covers 137 files and 10,037 passing tests (6 skipped), with 132 unit files and 10,007 unit tests plus 30 oracle tests. The Rust backend passes 227 tests. The Playwright suite contains 393 tests in 17 files across the desktop, mobile Chrome and mobile Safari projects. Coverage is 86.53% statements, 72.9% branches, 74.26% functions and 88.64% lines.

- **Performance Budgets**  
  The initial-load bundle remains within budget at 34.95 kB gzipped JavaScript, 8.71 kB gzipped CSS and 54.00 kB total against the 36/10/55.5 kB limits. The build also verifies that all asset references resolve.

- **Accessibility and Interaction Fixes**  
  Modal focus handling, touch targets, keyboard shortcuts, category-chip scope widening, and search behavior were tightened. The answer pipeline now shares one normalizer across the three callers, and the hint ladder and worked solutions remain available in every mode.

- **Reliability Fixes**  
  This release fixes the adaptive-difficulty reset, theme persistence, timer races, asynchronous error handling, multiple-choice distractor loops, and several stale-state paths. Dead state and unused exports were removed, and the topic table is loaded on demand rather than on every page load.

### Breaking Changes

This release has no intentional user-facing breaking changes. Existing desktop databases are opened with `CREATE TABLE IF NOT EXISTS`, and the learning-record format is versioned and importable. The major version reflects the completed v3 architecture rather than a change to the app's data contract.

Contributors integrating with internal modules should note that topic generators now return the `QuestionDto` contract and accept an injected seeded RNG, and that desktop worksheet export uses the native PDF command with a browser print fallback.

### Dependency Updates

- Updated npm dependencies to the current compatible versions: `@tauri-apps/api` 2.12.4, `@tauri-apps/cli` 2.12.4, `@tauri-apps/plugin-updater` 2.14.0, `@tauri-apps/plugin-dialog` 2.8.3, `@tauri-apps/plugin-process` 2.4.0, TypeScript 7.0.2, Vite 8.3.5, Vitest 5.0.5, Playwright 1.64.1, MathJax 4.1.3, KaTeX 0.19.1, Math.js 15.2.0 and Three.js 0.186.1.
- Updated Rust dependencies to the matching set: `tauri` 2.12.5, `tauri-plugin-updater` 2.14.0, `tauri-plugin-dialog` 2.8.3, `tauri-plugin-process` 2.4.0, `tauri-build` 2.7.4 and `tauri-utils` 2.10.2. The release workflow uses Rust 1.90.0.
- Added the native worksheet PDF stack (`ratex-parser`, `ratex-layout`, `ratex-types`, `ratex-render`, `printpdf` and `image`) and the `tauri-plugin-dialog` desktop dependency.
- Updated GitHub Actions to the current releases: `actions/checkout` v7.0.1, `actions/setup-node` v7.1.0, `actions/upload-artifact` v7.0.2, `actions/download-artifact` v8.0.2, `Swatinem/rust-cache` v2.9.3 and `softprops/action-gh-release` v3.0.3.

### Full Changelog

For a comprehensive enumeration of all changes, please consult the [comparison between v2.2.3 and v3.0.0](https://github.com/richie-rich90454/RandMatQuGeA/compare/v2.2.3...v3.0.0).

We welcome user feedback and encourage the reporting of any issues or suggestions through the project's GitHub repository. Your input remains invaluable to the continued improvement of RandMatQuGeA.

---

Thank you for using RandMatQuGeA. This major release completes the version-three architecture, keeps the curriculum and practice tools deterministic and offline-capable, and closes the release-engineering gaps that blocked the previous AppImage listing.

If you are using a Windows AMD64 (x64) machine, download the release with "x64-setup.exe" in its name.  
If you are using an Intel Mac, download the release with "x64.dmg" in its name.  
If you are using an Apple Silicon Mac (M-series chip), download the release with "aarch64.dmg" in its name.  
If you are using Linux (x86_64), download the release with ".AppImage" or ".deb" in its name.
