import {Page, expect, test} from "@playwright/test";
import {topics} from "../src/main/Constants";

export const BASE_URL = "http://localhost:1331";
export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type SettingsSeed = Record<string, unknown>;

export async function gotoApp(page: Page, seed: SettingsSeed = {}, fresh = false): Promise<void>{
	await page.addInitScript(({seed, fresh}: { seed: SettingsSeed; fresh: boolean })=>{
		try{
			if (!sessionStorage.getItem("__e2e_initialized")){
				localStorage.clear();
				sessionStorage.setItem("__e2e_initialized", "1");
			}
			if (!sessionStorage.getItem("__e2e_seeded")){
				const merged: Record<string, string> = {onboardingShown: "1"};
				for (const [key, value] of Object.entries(seed)){
					merged[key] = typeof value === "string" ? value : JSON.stringify(value);
				}
				for (const [key, value] of Object.entries(merged)){
					localStorage.setItem(key, value);
				}
				if (fresh){
					localStorage.removeItem("onboardingShown");
				}
				sessionStorage.setItem("__e2e_seeded", "1");
			}
		}
		catch (e){
			console.warn("init script localStorage failed", e);
		}
	}, {seed, fresh});
	await page.goto("/");
	await waitForAppReady(page);
}

export async function waitForAppReady(page: Page): Promise<void>{
	await expect(page.locator("#leaderboard-content")).toContainText("Leaderboard", {timeout: 15000});
}

export async function seedSettings(page: Page, settings: Record<string, unknown>): Promise<void>{
	await page.evaluate((settings)=>{
		let existing: Record<string, unknown> = {};
		const raw = localStorage.getItem("appSettings");
		if (raw){
			try{
				existing = JSON.parse(raw);
			}
			catch (e){
				/* ignore */
			}
		}
		localStorage.setItem("appSettings", JSON.stringify({...existing, ...settings}));
	}, settings);
}

export async function dismissOnboarding(page: Page): Promise<void>{
	const gotit = page.locator("#onboarding-gotit");
	if (await gotit.isVisible().catch(() => false)){
		await gotit.click();
	}
}

export async function setScope(page: Page, scope: string): Promise<void>{
	await page.selectOption("#scope-select", scope);
	await expect(page.locator(`[data-topic-id="add"]`)).toBeVisible();
}

export async function selectTopic(page: Page, topicId: string): Promise<void>{
	const pill = page.locator(`[data-topic-id="${topicId}"]`);
	await expect(pill).toBeVisible();
	await pill.click();
	if (!(await page.locator("#genQ").isEnabled())){
		await pill.click();
	}
	await expect(page.locator("#genQ")).toBeEnabled();
	await expect(page.locator("#current-topic")).not.toHaveText("Select a topic");
}

export async function generateQuestion(page: Page): Promise<void>{
	await page.locator("#genQ").click();
	await page.waitForFunction(()=>{
		const w = window as unknown as { hasQuestion?: boolean; correctAnswer?: { correct?: string } };
		return w.hasQuestion === true && !!w.correctAnswer && !!w.correctAnswer.correct && w.correctAnswer.correct.length > 0;
	}, null, { timeout: 20000 });
	await expect(page.locator("#answer-box")).toBeEnabled();
}

export async function getCorrectAnswer(page: Page): Promise<string>{
	return page.evaluate(()=>{
		const w = window as unknown as { correctAnswer?: { correct?: string } };
		return w.correctAnswer?.correct ?? "";
	});
}

export async function getExpectedFormat(page: Page): Promise<string>{
	return (await page.locator("#expected-format").textContent() ?? "").replace(/^Expected format:\s*/, "");
}

export async function submitAnswer(page: Page, answer: string, viaKeyboard = true): Promise<void>{
	const box = page.locator("#answer-box");
	await expect(box).toBeEnabled();
	await box.fill(answer);
	if (viaKeyboard){
		await box.press("Shift+Enter");
	}
	else{
		await page.locator("#check-answer").click();
	}
}

export async function expectResult(page: Page, state: "correct" | "incorrect"): Promise<void>{
	const selector = state === "correct" ? ".result-success" : ".result-error";
	await expect(page.locator(`#answer-results ${selector}`)).toBeVisible({ timeout: 15000 });
}

export async function openSettings(page: Page): Promise<void>{
	await page.locator("#settings-button").click();
	await expect(page.locator("#settings-modal")).toBeVisible();
}

export async function saveSettings(page: Page): Promise<void>{
	await page.locator("#settings-save").click();
	await expect(page.locator("#settings-modal")).not.toBeVisible();
}

export async function switchMode(page: Page, mode: "single" | "mental"): Promise<void>{
	const btn = mode === "single" ? "#mode-single" : "#mode-mental";
	await page.locator(btn).click();
	await expect(page.locator(btn)).toHaveAttribute("aria-pressed", "true");
}

export function topicsForCategory(category: string): string[]{
	return topics.filter((t)=>t.category === category).map((t)=>t.id);
}

export async function verifyTopicMatrix(page: Page, topicIds: string[], difficulty: string): Promise<void>{
	for (const topicId of topicIds){
		await test.step(`topic ${topicId} (${difficulty})`, async ()=>{
			await selectTopic(page, topicId);
			await generateQuestion(page);
			const answer = await getCorrectAnswer(page);
			await submitAnswer(page, answer, false);
			await expectResult(page, "correct");
		});
	}
}
