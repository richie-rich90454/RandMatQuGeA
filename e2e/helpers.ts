import {Page, expect} from "@playwright/test";

export const BASE_URL = "http://localhost:1331";
export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type SettingsSeed = Record<string, unknown>;

export async function gotoApp(page: Page, seed: SettingsSeed = {}, fresh = false): Promise<void>{
	await page.addInitScript(({seed, fresh}: { seed: SettingsSeed; fresh: boolean })=>{
		try{
			localStorage.clear();
			const merged = {onboardingShown: "1"};
			for (const [key, value] of Object.entries(seed)){
				merged[key] = value;
			}
			for (const [key, value] of Object.entries(merged)){
				if (typeof value === "string"){
					localStorage.setItem(key, value);
				}
				else{
					localStorage.setItem(key, JSON.stringify(value));
				}
			}
			if (fresh){
				localStorage.removeItem("onboardingShown");
			}
		}
		catch (e){
			console.warn("init script localStorage failed", e);
		}
	}, {seed, fresh});
	await page.goto("/");
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
