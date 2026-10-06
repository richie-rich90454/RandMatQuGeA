/// <reference types="vitest" />
import {defineConfig} from "vite";
import {readFileSync} from "fs";
import {join} from "path";
import {visualizer} from "rollup-plugin-visualizer";
let packageJson=JSON.parse(readFileSync(join(import.meta.dirname,"package.json"),"utf-8"));
let version=packageJson.version;
export default defineConfig({
    clearScreen: false,
    base: "./",
    test:{
        // The generator oracle is a separate project because it is slow, it
        // samples every topic across many seeds, and it was previously folded
        // into the default run, which meant a red correctness gate took the
        // whole unit suite down with it.
        projects:[
            {
                extends: true,
                test:{
                    name: "unit",
                    include: ["**/*.test.ts", "**/*.test.tsx"],
                    exclude: ["**/node_modules/**", "**/dist/**", "**/__tests__/oracle/**"],
                    setupFiles: ["./vitest.setup.ts"],
                    environment: "jsdom",
                    // The answer-grading tests load the real mathjs rather than a
                    // stub, because a stub is what let a broken grader pass. That
                    // library is large enough that its first import alone can
                    // outrun a ten second budget, and v8 coverage instrumentation
                    // multiplies the cost, so the bound has to accommodate a real
                    // dependency being loaded rather than only a slow assertion.
                    testTimeout: 30000,
                    // Vitest 5 flipped clearMocks to true, which wipes mock
                    // history before every test. script.test.ts asserts on
                    // module-import side effects, so those assertions need the
                    // history intact. Individual suites that want isolation
                    // already call vi.clearAllMocks() in their own beforeEach.
                    clearMocks: false,
                    pool: "forks",
                    maxConcurrency: 16
                }
            },
            {
                extends: true,
                test:{
                    name: "oracle",
                    include: ["__tests__/oracle/**/*.test.ts"],
                    setupFiles: ["./vitest.setup.ts"],
                    environment: "jsdom",
                    testTimeout: 600000,
                    hookTimeout: 600000,
                    pool: "forks",
                    maxConcurrency: 1
                }
            }
        ],
        // A reported coverage number that nothing enforces is a number in a log.
        // The floor is the project's real coverage on 2026-10-02, rounded down:
        // statements 74.48, branches 58.70, functions 58.76, lines 76.87. A round
        // number below them would let a genuine regression through, and a number
        // above them would fail a build nobody broke. Branches and functions are
        // the two that matter most here, because a generator's branch is exactly
        // what a wrong answer slips through.
        coverage: {
            provider: "v8",
            thresholds: {
                statements: 74,
                branches: 58,
                functions: 58,
                lines: 76
            }
        }
    },
    worker: {
        format: "es",
    },
    root: "src",
    publicDir: "../public",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        assetsDir: "",
        minify: "oxc",
        target: "es2020",
        cssMinify: true,
        cssCodeSplit: true,
        modulePreload: {polyfill: false},
        chunkSizeWarningLimit: 2000
    },
    plugins: [
        {
            name: "inject-version",
            transformIndexHtml(html){
                return html.replace(/__APP_VERSION__/g, version);
            }
        },
        visualizer({open: false, gzipSize: true, brotliSize: true})
    ],
    server: {
        host: false,
        port: 1331,
        strictPort: true,
        open: false,
        watch: {
            ignored: ["**/src-tauri/**"]
        }
    },
    preview: {
        host: false,
        port: 1331,
        strictPort: true,
        open: false
    }
});