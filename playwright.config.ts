import {defineConfig, devices} from "@playwright/test";
export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 2 : 4,
	reporter: [["list"]],
	projects: [
		{
			name: "desktop",
			channel: "chrome",
			headless: true,
			use: { viewport: { width: 1440, height: 900 } },
		},
		{
			name: "mobile-chrome",
			use: { ...devices["Pixel 7"] },
		},
		{
			name: "mobile-safari",
			use: { ...devices["iPhone 14"] },
		},
	],
	use: {
		baseURL: "http://localhost:1331",
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
