import {defineConfig} from "@playwright/test";
export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 2 : 4,
	reporter: [["list"]],
	use: {
		baseURL: "http://localhost:1331",
		channel: "chrome",
		headless: true,
		viewport: { width: 1440, height: 900 },
		actionTimeout: 15000,
		timeout: 45000,
		trace: "retain-on-failure",
	},
	webServer: {
		command: "npm run dev",
		url: "http://localhost:1331",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
