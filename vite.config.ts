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
                    testTimeout: 10000,
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
        ]
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