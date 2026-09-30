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
        setupFiles:["./vitest.setup.ts"],
        environment:"jsdom",
        testTimeout:10000,
        // Vitest 5 flipped clearMocks to true, which wipes mock history before
        // every test. script.test.ts asserts on module-import side effects, so
        // those assertions need the history intact. Individual suites that want
        // isolation already call vi.clearAllMocks() in their own beforeEach.
        clearMocks:false,
        pool:"forks",
        maxConcurrency:16
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