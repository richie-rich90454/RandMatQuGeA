import {test, expect} from "@playwright/test";
import {gotoApp, dismissOnboarding} from "./helpers";

test("onboarding overlay appears on first visit and Got it dismisses it", async ({page})=>{
	await gotoApp(page, {}, true);
	await expect(page.locator("#onboarding-overlay")).toBeVisible();
	await page.locator("#onboarding-gotit").click();
	await expect(page.locator("#onboarding-overlay")).not.toBeVisible();
	await page.reload();
	await expect(page.locator("#onboarding-overlay")).not.toBeVisible();
});

test("onboarding closes via the X button too", async ({page})=>{
	await gotoApp(page, {}, true);
	await expect(page.locator("#onboarding-overlay")).toBeVisible();
	await page.locator("#onboarding-close").click();
	await expect(page.locator("#onboarding-overlay")).not.toBeVisible();
});

test("mode buttons switch between single and mental", async ({page})=>{
	await gotoApp(page);
	await page.locator("#mode-mental").click();
	await expect(page.locator("#mode-mental")).toHaveAttribute("aria-pressed", "true");
	await expect(page.locator("#mental-controls")).toBeVisible();
	await expect(page.locator("#single-controls")).toBeHidden();
	await page.locator("#mode-single").click();
	await expect(page.locator("#mode-single")).toHaveAttribute("aria-pressed", "true");
	await expect(page.locator("#single-controls")).toBeVisible();
	await expect(page.locator("#mental-controls")).toBeHidden();
});

test("keyboard shortcuts switch modes, open settings and toggle theme", async ({page})=>{
	await gotoApp(page);
	await page.keyboard.press("Control+2");
	await expect(page.locator("#mode-mental")).toHaveAttribute("aria-pressed", "true");
	await page.keyboard.press("Control+1");
	await expect(page.locator("#mode-single")).toHaveAttribute("aria-pressed", "true");
	await page.keyboard.press("Control+,");
	await expect(page.locator("#settings-modal")).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(page.locator("#settings-modal")).not.toBeVisible();
	const before = await page.evaluate(()=>document.documentElement.className);
	let changed = false;
	for (let i = 0; i < 4; i++){
		await page.keyboard.press("Control+Shift+T");
		await page.waitForTimeout(200);
		if ((await page.evaluate(()=>document.documentElement.className)) !== before){
			changed = true;
			break;
		}
	}
	expect(changed).toBe(true);
});

test("theme toggle button cycles through light/dark/system", async ({page})=>{
	await gotoApp(page);
	let sawDark = false;
	let sawLight = false;
	for (let i = 0; i < 4; i++){
		const cls = await page.evaluate(()=>document.documentElement.className);
		if (cls.includes("dark")) sawDark = true;
		if (cls.includes("light")) sawLight = true;
		await page.locator("#theme-toggle").click();
		await page.waitForTimeout(200);
	}
	expect(sawDark).toBe(true);
	expect(sawLight).toBe(true);
});

test("help button shows an info notification", async ({page})=>{
	await gotoApp(page);
	await page.locator("#help-button").click();
	await expect(page.locator(".notification-info")).toBeVisible();
});

test("shortcuts modal opens and closes", async ({page})=>{
	await gotoApp(page);
	await page.locator("#shortcuts-button").click();
	await expect(page.locator("#shortcuts-modal")).toBeVisible();
	await expect(page.locator("#shortcuts-modal .shortcuts-table")).toBeVisible();
	await page.locator("#shortcuts-gotit").click();
	await expect(page.locator("#shortcuts-modal")).not.toBeVisible();
});

test("footer shows version and copyright", async ({page})=>{
	await gotoApp(page);
	await expect(page.locator(".footer-content")).toContainText("RandMatQuGeA v3.0.0");
	await expect(page.locator(".footer-content")).toContainText("© 2026");
});
