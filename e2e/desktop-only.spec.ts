import {test, expect} from "@playwright/test";
import {gotoApp, selectTopic, switchMode} from "./helpers";

async function expectDialog(page: import("@playwright/test").Page, action: () => Promise<void>, fragment: string): Promise<void>{
	let message = "";
	page.once("dialog", async (dialog)=>{
		message = dialog.message();
		await dialog.dismiss().catch(()=>{});
	});
	await action();
	await page.waitForTimeout(200);
	expect(message).toContain(fragment);
}

test("data modal shows a desktop-only alert in the browser", async ({page})=>{
	await gotoApp(page);
	await expectDialog(page, ()=>page.locator("#manage-data-btn").click(), "Performance data is only available in the desktop app.");
	await expect(page.locator("#data-modal")).not.toBeVisible();
});

test("recommend button notifies that weak topics are desktop-only", async ({page})=>{
	await gotoApp(page);
	await page.locator("#recommend-btn").click();
	await expect(page.locator(".notification-info")).toContainText(
		"Weak topic analysis is only available in the desktop app."
	);
});

test("check updates alerts that updates are desktop-only", async ({page})=>{
	await gotoApp(page);
	await page.locator("#settings-button").click();
	await expectDialog(page, ()=>page.locator("#check-updates").click(), "Updates are only available in the desktop app.");
	await page.locator("#settings-close").click();
});

test("leaderboard shows the desktop-only message in web mode", async ({page})=>{
	await gotoApp(page);
	await expect(page.locator("#leaderboard-content")).toContainText(
		"Leaderboard is only available in the desktop app."
	);
	await expect(page.locator("#leaderboard-card")).toBeHidden();
});

test("finishing a mental session in web mode does not save a score", async ({page})=>{
	await gotoApp(page, {appSettings: {maxQuestions: 1, autoCheckDelay: 100}});
	await switchMode(page, "mental");
	await selectTopic(page, "add");
	await page.locator("#start-session").click();
	await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
	const answer = await page.evaluate(()=>{
		const w = window as unknown as { correctAnswer?: { correct?: string } };
		return w.correctAnswer?.correct ?? "";
	});
	await page.locator("#answer-box").fill(answer);
	await page.locator("#answer-box").press("Shift+Enter");
	await expect(page.locator("#score-display")).toContainText("1 / 1");
	await expect(page.locator("#leaderboard-card")).toBeHidden();
});
