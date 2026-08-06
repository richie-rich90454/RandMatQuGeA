import {test, expect} from "@playwright/test";
import {gotoApp} from "./helpers";

const PREVIEW = "#print-preview .ws-document";

async function openPrintModal(page: import("@playwright/test").Page): Promise<void>{
	await page.locator("#print-worksheet-btn").click();
	await expect(page.locator("#print-modal")).toBeVisible();
}

async function generateWorksheet(page: import("@playwright/test").Page): Promise<void>{
	await page.locator("#print-generate").click();
	await expect(page.locator(PREVIEW)).toBeVisible({timeout: 20000});
}

test("print modal opens with default options", async ({page})=>{
	await gotoApp(page);
	await openPrintModal(page);
	await expect(page.locator("#print-title-input")).toHaveValue("Math Worksheet");
	await expect(page.locator("#print-question-count")).toHaveValue("10");
	await expect(page.locator("#print-scope")).toHaveValue("simple");
	await expect(page.locator("#print-difficulty")).toHaveValue("medium");
	await expect(page.locator("#print-answer-key-mode")).toHaveValue("append");
	await expect(page.locator("#print-show-metadata")).toBeChecked();
	await expect(page.locator("#print-page-numbers")).not.toBeChecked();
});

test("generates a worksheet preview with the chosen options", async ({page})=>{
	await gotoApp(page);
	await openPrintModal(page);
	await page.locator("#print-title-input").fill("E2E Worksheet");
	await page.locator("#print-name-input").fill("Alice");
	await page.locator("#print-date-input").fill("2026-08-06");
	await page.locator("#print-period-input").fill("Period 2");
	await page.selectOption("#print-question-count", "5");
	await page.selectOption("#print-scope", "algebra");
	await page.selectOption("#print-difficulty", "easy");
	await page.selectOption("#print-answer-key-mode", "none");
	await page.locator("#print-page-numbers").check();
	await page.selectOption("#print-topic", "linear_eq");
	await generateWorksheet(page);
	await expect(page.locator(`${PREVIEW} .ws-title`)).toHaveText("E2E Worksheet");
	await expect(page.locator(`${PREVIEW} .ws-header-row`)).toContainText("Alice");
	await expect(page.locator(`${PREVIEW} .ws-header-row`)).toContainText("2026-08-06");
	await expect(page.locator(`${PREVIEW} .ws-header-row`)).toContainText("Period 2");
	await expect(page.locator(`${PREVIEW} .ws-question`)).toHaveCount(5);
	await expect(page.locator(`${PREVIEW} .ws-answer-key`)).toHaveCount(0);
	await expect(page.locator("#print-seed-input")).not.toHaveValue("");
	await expect(page.locator("#print-copy-seed")).toBeVisible();
});

test("answer key append adds an answer key after a page break", async ({page})=>{
	await gotoApp(page);
	await openPrintModal(page);
	await page.selectOption("#print-question-count", "5");
	await page.selectOption("#print-scope", "algebra");
	await page.selectOption("#print-answer-key-mode", "append");
	await generateWorksheet(page);
	await expect(page.locator(`${PREVIEW} .ws-question`)).toHaveCount(5);
	await expect(page.locator(`${PREVIEW} .ws-answer-key`)).toBeVisible();
	await expect(page.locator(`${PREVIEW} .ws-answer`)).toHaveCount(5);
	await expect(page.locator(`${PREVIEW} .ws-page-break`)).toHaveCount(1);
});

test("answer key only mode hides the questions", async ({page})=>{
	await gotoApp(page);
	await openPrintModal(page);
	await page.selectOption("#print-question-count", "5");
	await page.selectOption("#print-answer-key-mode", "only");
	await generateWorksheet(page);
	await expect(page.locator(`${PREVIEW} .ws-question`)).toHaveCount(0);
	await expect(page.locator(`${PREVIEW} .ws-answer`)).toHaveCount(5);
});

test("metadata toggle controls the topic/difficulty line", async ({page})=>{
	await gotoApp(page);
	await openPrintModal(page);
	await page.selectOption("#print-question-count", "5");
	await page.locator("#print-show-metadata").uncheck();
	await generateWorksheet(page);
	await expect(page.locator(`${PREVIEW} .ws-meta`)).toHaveCount(0);
	await page.locator("#print-show-metadata").check();
	await generateWorksheet(page);
	await expect(page.locator(`${PREVIEW} .ws-meta`)).toBeVisible();
});

test("scope selection filters the topic dropdown", async ({page})=>{
	await gotoApp(page);
	await openPrintModal(page);
	await page.selectOption("#print-scope", "simple");
	await expect(page.locator("#print-topic option")).toHaveCount(5);
	await page.selectOption("#print-scope", "calc");
	await expect(page.locator('#print-topic option[value="deri"]')).toHaveCount(1);
	await expect(page.locator('#print-topic option[value="add"]')).toHaveCount(1);
});

test("mixed difficulty and seeded generation work", async ({page})=>{
	await gotoApp(page);
	await openPrintModal(page);
	await page.selectOption("#print-question-count", "10");
	await page.selectOption("#print-scope", "simple");
	await page.selectOption("#print-difficulty", "mixed");
	await page.locator("#print-seed-input").fill("12345");
	await generateWorksheet(page);
	await expect(page.locator(`${PREVIEW} .ws-question`)).toHaveCount(10);
	await expect(page.locator("#print-seed-input")).toHaveValue("12345");
	await expect(page.locator(`${PREVIEW} .ws-meta`)).toContainText("Difficulty: mixed");
});

test("export PDF falls back to browser printing in web mode", async ({page})=>{
	await gotoApp(page);
	await openPrintModal(page);
	await page.selectOption("#print-question-count", "5");
	await generateWorksheet(page);
	await page.locator("#print-export-pdf").click();
	await expect(page.locator("#print-export-pdf")).toHaveText("Export PDF", {timeout: 10000});
});

test("closing the print modal restores the app", async ({page})=>{
	await gotoApp(page);
	await openPrintModal(page);
	await page.locator("#print-close").click();
	await expect(page.locator("#print-modal")).not.toBeVisible();
});
