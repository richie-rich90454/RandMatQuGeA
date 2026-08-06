import {test, expect} from "@playwright/test";
import {gotoApp, selectTopic, generateQuestion, switchMode} from "./helpers";

const MCQLOC = "#mcq-choices-container .choice-button";

async function countChoices(page: import("@playwright/test").Page): Promise<number>{
	return page.locator(MCQLOC).count();
}

test("MCQ mode generates choices instead of a text input", async ({page})=>{
	await gotoApp(page, {appSettings: {mcqMode: true}});
	await selectTopic(page, "add");
	await generateQuestion(page);
	await expect(page.locator("#answer-box")).toBeHidden();
	await expect(page.locator("#mcq-choices-container")).toBeVisible();
	expect(await countChoices(page)).toBe(4);
});

test("exactly one MCQ choice is accepted as correct", async ({page})=>{
	await gotoApp(page, {appSettings: {mcqMode: true, decimalPlaces: 3}});
	await selectTopic(page, "add");
	await generateQuestion(page);
	const choices = page.locator(MCQLOC);
	const count = await countChoices(page);
	let correctCount = 0;
	for (let i = 0; i < count; i++){
		await choices.nth(i).click();
		await page.waitForTimeout(350);
		const isCorrect = (await page.locator("#answer-results .result-success").count()) > 0;
		if (isCorrect) correctCount++;
	}
	expect(correctCount).toBe(1);
});

test("clicking the correct MCQ choice shows Correct!", async ({page})=>{
	await gotoApp(page, {appSettings: {mcqMode: true, decimalPlaces: 3}});
	await selectTopic(page, "mult");
	await generateQuestion(page);
	const correct = await page.evaluate(()=>{
		const w = window as unknown as { correctAnswer?: { correct?: string } };
		return w.correctAnswer?.correct ?? "";
	});
	const choices = page.locator(MCQLOC);
	const count = await countChoices(page);
	for (let i = 0; i < count; i++){
		await choices.nth(i).click();
		await page.waitForTimeout(350);
		if ((await page.locator("#answer-results .result-success").count()) > 0){
			await expect(page.locator("#answer-results")).toContainText("Correct!");
			break;
		}
	}
});

test("choice count follows the settings value", async ({page})=>{
	await gotoApp(page, {appSettings: {mcqMode: true, mcqChoicesCount: 2}});
	await selectTopic(page, "add");
	await generateQuestion(page);
	expect(await countChoices(page)).toBe(2);
});

test("changing choice count in settings affects newly generated questions", async ({page})=>{
	await gotoApp(page, {appSettings: {mcqMode: true}});
	await page.locator("#settings-button").click();
	await page.locator("#settings-tab-advanced").click();
	await page.locator("#settings-mcq-choices").fill("3");
	await page.locator("#settings-save").click();
	await expect(page.locator("#settings-modal")).not.toBeVisible();
	await selectTopic(page, "add");
	await generateQuestion(page);
	expect(await countChoices(page)).toBe(3);
});

test("toggling MCQ on for an existing question shows its choices", async ({page})=>{
	await gotoApp(page);
	await selectTopic(page, "add");
	await generateQuestion(page);
	await expect(page.locator("#answer-box")).toBeVisible();
	await page.locator("#mcq-toggle").check();
	await expect(page.locator("#answer-box")).toBeHidden();
	await expect(page.locator("#mcq-choices-container")).toBeVisible();
	expect(await countChoices(page)).toBeGreaterThanOrEqual(2);
});

test("mental mode MCQ session increments score and finishes", async ({page})=>{
	await gotoApp(page, {appSettings: {mcqMode: true, maxQuestions: 1}});
	await switchMode(page, "mental");
	await selectTopic(page, "add");
	await page.locator("#start-session").click();
	await expect(page.locator("#mcq-choices-container")).toBeVisible();
	await page.locator(MCQLOC).first().click();
	await expect(page.locator("#score-display")).toContainText("/ 1", {timeout: 10000});
	await expect(page.locator("#start-session")).toHaveText(/Start Session/);
});

test("toggling MCQ off restores the text input for a loaded question", async ({page})=>{
	await gotoApp(page, {appSettings: {mcqMode: true}});
	await selectTopic(page, "add");
	await generateQuestion(page);
	await page.locator("#mcq-toggle").uncheck();
	await expect(page.locator("#answer-box")).toBeVisible();
	await expect(page.locator("#mcq-choices-container")).toBeHidden();
});
