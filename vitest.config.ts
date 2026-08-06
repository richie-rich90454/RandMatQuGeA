import {defineConfig} from "vitest/config";
export default defineConfig({
    test: {
        setupFiles: ["./src/vitest.setup.ts"],
        environment: "jsdom",
        testTimeout: 10000,
        pool: "forks",
        maxConcurrency: 16,
    }
});