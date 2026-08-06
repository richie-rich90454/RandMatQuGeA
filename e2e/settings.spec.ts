import {test, expect, Page} from "@playwright/test";
import {gotoApp, openSettings, saveSettings} from "./helpers";

async function savedSettings(page: Page): Promise<Record<string, unknown>>{
	return page.evaluate(()=>JSON.parse(localStorage.getItem("appSettings") ?? "{}"));
}

async function openAdvanced(page: Page): Promise<void>{
	await page.locator("#settings-tab-advanced").click();
	await expect(page.locator("#settings-advanced")).toBeVisible();
}

test("theme and font settings apply immediately and persist", async ({page})=>{
	await gotoApp(page);
	await openSettings(page);
	await page.selectOption("#settings-theme", "dark");
	await page.selectOption("#settings-font", "opendyslexic");
	await saveSettings(page);
	await expect(page.locator("html")).toHaveClass(/dark/);
	await expect(page.locator("body")).toHaveClass(/font-opendyslexic/);
	const saved = await savedSettings(page);
	expect(saved.theme).toBe("dark");
	expect(saved.font).toBe("opendyslexic");
	await page.reload();
	await expect(page.locator("html")).toHaveClass(/dark/);
	await expect(page.locator("body")).toHaveClass(/font-opendyslexic/);
});

test("default mode mental starts the app in mental mode after reload", async ({page})=>{
	await gotoApp(page);
	await openSettings(page);
	await page.selectOption("#settings-default-mode", "mental");
	await saveSettings(page);
	await page.reload();
	await expect(page.locator("#mode-mental")).toHaveAttribute("aria-pressed", "true");
	await expect(page.locator("#mental-controls")).toBeVisible();
});

test("scope and toggles persist and filter the topic grid", async ({page})=>{
	await gotoApp(page);
	await openSettings(page);
	await page.selectOption("#settings-scope", "calc");
	await page.locator("#settings-shuffle").check();
	await page.locator("#settings-auto-continue").check();
	await saveSettings(page);
	await expect(page.locator("#scope-select")).toHaveValue("calc");
	await expect(page.locator("#shuffle-toggle")).toBeChecked();
	await expect(page.locator("#autocontinue-toggle")).toBeChecked();
	await page.reload();
	await expect(page.locator('[data-topic-id="deri"]')).toBeVisible();
	await expect(page.locator('[data-topic-id="sin"]')).toBeHidden();
});

test("difficulty, timer and max questions drive the mental session", async ({page})=>{
	await gotoApp(page);
	await openSettings(page);
	await page.selectOption("#settings-difficulty", "hard");
	await page.locator("#settings-timer").fill("45");
	await page.locator("#settings-max-questions").fill("3");
	await saveSettings(page);
	await page.locator("#mode-mental").click();
	await expect(page.locator("#difficulty-select")).toHaveValue("hard");
	const saved = await savedSettings(page);
	expect(saved.difficulty).toBe("hard");
	expect(saved.timer).toBe(45);
	expect(saved.maxQuestions).toBe(3);
	await page.locator("#start-session").click();
	await expect(page.locator("#timer-display")).toContainText("00:45", {timeout: 10000});
});

test("notifications toggle suppresses info toasts", async ({page})=>{
	await gotoApp(page);
	await openSettings(page);
	await page.locator("#settings-notifications").uncheck();
	await saveSettings(page);
	await page.locator("#help-button").click();
	await page.waitForTimeout(500);
	await expect(page.locator(".notification-info")).toHaveCount(0);
	expect((await savedSettings(page)).notifications).toBe(false);
});

test("advanced performance toggles apply classes and persist", async ({page})=>{
	await gotoApp(page);
	await openSettings(page);
	await openAdvanced(page);
	await page.locator("#settings-perf-wave").uncheck();
	await page.locator("#settings-perf-blur").uncheck();
	await page.locator("#settings-perf-preview").uncheck();
	await page.locator("#settings-perf-animations").uncheck();
	await page.selectOption("#settings-fps-cap", "30");
	await saveSettings(page);
	await expect(page.locator("#wave-container")).toHaveClass(/hidden/);
	await expect(page.locator("html")).toHaveClass(/no-blur/);
	await expect(page.locator("html")).toHaveClass(/reduce-motion/);
	await expect(page.locator("#preview")).toHaveClass(/hidden/);
	const saved = await savedSettings(page);
	expect(saved.perfWave).toBe(false);
	expect(saved.perfBlur).toBe(false);
	expect(saved.perfPreview).toBe(false);
	expect(saved.perfAnimations).toBe(false);
	expect(saved.fpsCap).toBe(30);
});

test("performance master disables eye candy in one switch", async ({page})=>{
	await gotoApp(page);
	await openSettings(page);
	await openAdvanced(page);
	await page.locator("#settings-perf-master").check();
	await saveSettings(page);
	await expect(page.locator("#wave-container")).toHaveClass(/hidden/);
	await expect(page.locator("html")).toHaveClass(/no-blur/);
	await expect(page.locator("html")).toHaveClass(/reduce-motion/);
	await expect(page.locator("#preview")).toHaveClass(/hidden/);
	expect((await savedSettings(page)).perfMaster).toBe(true);
});

test("answer options and multiple-choice settings persist", async ({page})=>{
	await gotoApp(page);
	await openSettings(page);
	await openAdvanced(page);
	await page.locator("#settings-auto-check-delay").fill("500");
	await page.locator("#settings-decimal-places").fill("3");
	await page.locator("#settings-mcq-choices").fill("5");
	await page.locator("#settings-sound").check();
	await page.locator("#settings-vibration").check();
	await saveSettings(page);
	const saved = await savedSettings(page);
	expect(saved.autoCheckDelay).toBe(500);
	expect(saved.decimalPlaces).toBe(3);
	expect(saved.mcqChoicesCount).toBe(5);
	expect(saved.sound).toBe(true);
	expect(saved.vibration).toBe(true);
});

test("adaptive learning toggle persists", async ({page})=>{
	await gotoApp(page);
	await openSettings(page);
	await page.locator("#settings-adaptive").uncheck();
	await saveSettings(page);
	expect((await savedSettings(page)).adaptive).toBe(false);
});

test("reset to defaults restores the modal and persisted settings", async ({page})=>{
	await gotoApp(page);
	await openSettings(page);
	await page.selectOption("#settings-theme", "dark");
	await page.selectOption("#settings-scope", "calc");
	await page.locator("#settings-shuffle").check();
	await openAdvanced(page);
	await page.locator("#settings-reset").click();
	await expect(page.locator("#settings-theme")).toHaveValue("system");
	await expect(page.locator("#settings-scope")).toHaveValue("simple");
	await expect(page.locator("#settings-shuffle")).not.toBeChecked();
	const saved = await savedSettings(page);
	expect(saved.theme).toBe("system");
	expect(saved.scope).toBe("simple");
	expect(saved.shuffle).toBe(false);
});

test("settings persist across reload via localStorage", async ({page})=>{
	await gotoApp(page);
	await openSettings(page);
	await page.selectOption("#settings-font", "opendyslexic");
	await page.locator("#settings-notifications").uncheck();
	await saveSettings(page);
	await page.reload();
	await openSettings(page);
	await expect(page.locator("#settings-font")).toHaveValue("opendyslexic");
	await expect(page.locator("#settings-notifications")).not.toBeChecked();
});
