import {test, expect} from "@playwright/test";
import {gotoApp, selectTopic, generateQuestion, getCorrectAnswer, switchMode} from "./helpers";

test("session start disables controls and shows a question", async ({page})=>{
	await gotoApp(page, {appSettings: {maxQuestions: 2}});
	await switchMode(page, "mental");
	await selectTopic(page, "add");
	await page.locator("#start-session").click();
	await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
	await expect(page.locator("#timer-display")).toContainText("00:30");
	await expect(page.locator("#difficulty-select")).toBeDisabled();
	await expect(page.locator("#mode-single")).toBeDisabled();
	await expect(page.locator("#start-session")).toHaveText("Stop Session");
	await expect(page.locator("#pause-session")).toBeVisible();
	await expect(page.locator("#skip-question")).toBeVisible();
});

test("correct answers update the score and advance to the next question", async ({page})=>{
	await gotoApp(page, {appSettings: {maxQuestions: 2, autoCheckDelay: 800}});
	await switchMode(page, "mental");
	await selectTopic(page, "add");
	await page.locator("#start-session").click();
	await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
	const answer1 = await getCorrectAnswer(page);
	await page.locator("#answer-box").fill(answer1);
	await page.locator("#answer-box").press("Shift+Enter");
	await expect(page.locator("#score-display")).toContainText("1 / 1");
	await expect(page.locator("#answer-results")).toContainText("Correct!");
	await expect
		.poll(()=>page.evaluate(()=>{
			const w = window as unknown as { hasQuestion?: boolean; correctAnswer?: { correct?: string } };
			return w.correctAnswer?.correct ?? "";
		}), {timeout: 15000})
		.not.toBe(answer1);
	await expect(page.locator("#answer-box")).toBeEnabled();
});

test("session finishes with a summary after the last question", async ({page})=>{
	await gotoApp(page, {appSettings: {maxQuestions: 2, autoCheckDelay: 100}});
	await switchMode(page, "mental");
	await selectTopic(page, "add");
	await page.locator("#start-session").click();
	await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
	let prev = "";
	for (let i = 0; i < 2; i++){
		await expect
			.poll(()=>page.evaluate(()=>{
				const w = window as unknown as { correctAnswer?: { correct?: string } };
				return w.correctAnswer?.correct ?? "";
			}), {timeout: 15000})
			.not.toBe(prev);
		prev = await getCorrectAnswer(page);
		await page.locator("#answer-box").fill(prev);
		await page.locator("#answer-box").press("Shift+Enter");
		await expect(page.locator("#score-display")).toContainText(`${i + 1} / ${i + 1}`);
	}
	await expect(page.locator("#start-session")).toHaveText("Start Session", {timeout: 10000});
	await expect(page.locator(".notification-info")).toContainText("Session finished! Score: 2/2");
	await expect(page.locator("#answer-box")).toBeDisabled();
});

test("skip counts the question and continues", async ({page})=>{
	await gotoApp(page, {appSettings: {maxQuestions: 1, autoCheckDelay: 100}});
	await switchMode(page, "mental");
	await selectTopic(page, "add");
	await page.locator("#start-session").click();
	await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
	await page.locator("#skip-question").click();
	await expect(page.locator("#score-display")).toContainText("0 / 1");
	await expect(page.locator("#start-session")).toHaveText("Start Session");
});

test("pause disables answering and resume re-enables it", async ({page})=>{
	await gotoApp(page, {appSettings: {maxQuestions: 5, autoCheckDelay: 100}});
	await switchMode(page, "mental");
	await selectTopic(page, "add");
	await page.locator("#start-session").click();
	await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
	await page.locator("#pause-session").click();
	await expect(page.locator("#pause-session")).toHaveAttribute("aria-label", "Resume");
	await expect(page.locator("#answer-box")).toBeDisabled();
	await page.locator("#pause-session").click();
	await expect(page.locator("#pause-session")).toHaveAttribute("aria-label", "Pause");
	await expect(page.locator("#answer-box")).toBeEnabled();
});

test("timer timeout auto-advances and ends the session", async ({page})=>{
	await gotoApp(page, {appSettings: {maxQuestions: 2, timer: 1, autoCheckDelay: 100}});
	await switchMode(page, "mental");
	await selectTopic(page, "add");
	await page.locator("#start-session").click();
	await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
	await expect(page.locator(".notification-warning")).toContainText("Time is up!", {timeout: 10000});
	await expect(page.locator("#score-display")).toContainText("0 / 2", {timeout: 15000});
	await expect(page.locator("#start-session")).toHaveText("Start Session", {timeout: 15000});
});

test("unlimited mode hides timer and progress and keeps the session going", async ({page})=>{
	await gotoApp(page, {appSettings: {unlimitedMode: true, autoCheckDelay: 100}});
	await switchMode(page, "mental");
	await selectTopic(page, "add");
	await page.locator("#start-session").click();
	await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
	await expect(page.locator("#timer-display")).toBeHidden();
	await expect(page.locator("#mental-progress-bar")).toBeHidden();
	await expect(page.locator("#statistics-panel")).toBeVisible();
	const answer = await getCorrectAnswer(page);
	await page.locator("#answer-box").fill(answer);
	await page.locator("#answer-box").press("Shift+Enter");
	await expect(page.locator("#score-display")).toContainText("1 / 1");
	await expect(page.locator("#start-session")).toHaveText("Stop Session");
	await expect(page.locator("#accuracy-stat")).toContainText("100.0%");
});

test("mental shuffle picks a random topic without a selection", async ({page})=>{
	await gotoApp(page, {appSettings: {mentalShuffle: true, autoCheckDelay: 100}});
	await switchMode(page, "mental");
	await page.locator("#start-session").click();
	await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
	await expect(page.locator("#current-topic")).not.toHaveText(/Select a topic/);
	await page.locator("#start-session").click();
	await expect(page.locator("#start-session")).toHaveText("Start Session");
});

test("mental session respects selected topic and stops cleanly", async ({page})=>{
	await gotoApp(page, {appSettings: {maxQuestions: 5, autoCheckDelay: 100}});
	await switchMode(page, "mental");
	await selectTopic(page, "mult");
	await page.locator("#start-session").click();
	await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
	await expect(page.locator("#current-topic")).toHaveText("Multiplication");
	await page.locator("#start-session").click();
	await expect(page.locator("#start-session")).toHaveText("Start Session");
	await expect(page.locator("#answer-box")).toBeDisabled();
});
