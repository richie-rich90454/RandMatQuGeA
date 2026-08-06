import {defineConfig} from "vitest/config";
export default defineConfig({
    test: {
        setupFiles: ["./src/vitest.setup.ts"],
        environment: "jsdom",
        testTimeout: 30000,
        pool: "forks",
        isolate: true,
        maxConcurrency: 4,
    }
});
