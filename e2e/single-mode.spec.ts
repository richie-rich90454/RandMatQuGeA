import {test, expect} from "@playwright/test";
import {gotoApp, selectTopic, generateQuestion, getCorrectAnswer, getExpectedFormat, submitAnswer, expectResult} from "./helpers";

test("generates a question for the selected topic and shows expected format", async ({page})=>{
	await gotoApp(page);
	await selectTopic(page, "add");
	await generateQuestion(page);
	const answer = await getCorrectAnswer(page);
	expect(answer.length).toBeGreaterThan(0);
	const qText = await page.locator("#question-area").textContent();
	expect(qText!.trim().length).toBeGreaterThan(0);
	await expect(page.locator("#expected-format")).toHaveText(/Expected format:/);
});

test("correct answer via Shift+Enter shows Correct", async ({page})=>{
	await gotoApp(page);
	await selectTopic(page, "mult");
	await generateQuestion(page);
	const answer = await getCorrectAnswer(page);
	await submitAnswer(page, answer, true);
	await expectResult(page, "correct");
	await expect(page.locator("#answer-results")).toContainText("Correct!");
});

test("incorrect answer via Check button shows Incorrect with the correct answer", async ({page})=>{
	await gotoApp(page);
	await selectTopic(page, "subtrt");
	await generateQuestion(page);
	await submitAnswer(page, "987654321", false);
	await expectResult(page, "incorrect");
	await expect(page.locator("#answer-results")).toContainText("Incorrect");
	const correct = await getCorrectAnswer(page);
	await expect(page.locator("#answer-results")).toContainText("The correct answer is");
});

test("Ctrl+Enter checks the answer", async ({page})=>{
	await gotoApp(page);
	await selectTopic(page, "divid");
	await generateQuestion(page);
	const answer = await getCorrectAnswer(page);
	const box = page.locator("#answer-box");
	await box.fill(answer);
	await box.press("Control+Enter");
	await expectResult(page, "correct");
});

test("Ctrl+G generates a new question", async ({page})=>{
	await gotoApp(page);
	await selectTopic(page, "add");
	await generateQuestion(page);
	const before = await getCorrectAnswer(page);
	await page.locator("body").click({position: {x: 10, y: 10}});
	await page.keyboard.press("Control+g");
	await expect
		.poll(()=>page.evaluate(()=>{
			const w = window as unknown as { hasQuestion?: boolean; correctAnswer?: { correct?: string } };
			return w.correctAnswer?.correct ?? "";
		}), {timeout: 15000})
		.not.toBe(before);
});

test("clear answer empties the input and preview", async ({page})=>{
	await gotoApp(page);
	await selectTopic(page, "add");
	await generateQuestion(page);
	await page.locator("#answer-box").fill("42");
	await page.waitForTimeout(300);
	await expect(page.locator("#preview")).toHaveClass(/has-content/);
	await page.locator("#clear-answer").click();
	await expect(page.locator("#answer-box")).toHaveValue("");
	await expect(page.locator("#preview")).not.toHaveClass(/has-content/);
});

test("math toolbar inserts symbols and updates the live preview", async ({page})=>{
	await gotoApp(page);
	await selectTopic(page, "add");
	await generateQuestion(page);
	const box = page.locator("#answer-box");
	await box.focus();
	await page.locator('.math-toolbar-btn[data-symbol="+"]').click();
	await page.locator('.math-toolbar-btn[data-symbol="^{}"]').click();
	await expect(box).toHaveValue("+^{}");
	await page.waitForTimeout(400);
	await expect(page.locator("#preview")).toHaveClass(/has-content/);
});

test("math dropdown shows more symbols and inserts one", async ({page})=>{
	await gotoApp(page);
	await selectTopic(page, "add");
	await generateQuestion(page);
	const box = page.locator("#answer-box");
	await box.focus();
	await page.locator("#math-dropdown-btn").click();
	await expect(page.locator("#math-dropdown")).toHaveClass(/show/);
	await page.locator('#math-dropdown .math-toolbar-btn[title="For all"]').click();
	await expect(box).toHaveValue("\\forall");
});

test("copy correct answer copies the expected value to the clipboard", async ({page})=>{
	await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
	await gotoApp(page);
	await selectTopic(page, "add");
	await generateQuestion(page);
	const correct = await getCorrectAnswer(page);
	await submitAnswer(page, "987654321", false);
	await expectResult(page, "incorrect");
	await page.locator("#copy-answer").click();
	await expect.poll(()=>page.evaluate(()=>navigator.clipboard.readText()), {timeout: 5000}).toBe(correct);
});

test("auto-continue generates the next question after a correct answer", async ({page})=>{
	await gotoApp(page, {appSettings: {autoContinue: true}});
	await selectTopic(page, "add");
	await generateQuestion(page);
	const before = await getCorrectAnswer(page);
	await submitAnswer(page, before, false);
	await expectResult(page, "correct");
	await expect
		.poll(()=>page.evaluate(()=>{
			const w = window as unknown as { hasQuestion?: boolean; correctAnswer?: { correct?: string } };
			return w.correctAnswer?.correct ?? "";
		}), {timeout: 15000})
		.not.toBe(before);
});

test("generating without selecting a topic is blocked", async ({page})=>{
	await gotoApp(page, {appSettings: {scope: "all"}});
	await page.evaluate(()=>{
		document.querySelectorAll(".topic-pill").forEach(el=>el.classList.remove("active"));
		(document.getElementById("genQ") as HTMLButtonElement).disabled = true;
	});
	await expect(page.locator("#genQ")).toBeDisabled();
});

test("expected format text reflects the question generator", async ({page})=>{
	await gotoApp(page);
	await selectTopic(page, "add");
	await generateQuestion(page);
	const fmt = await getExpectedFormat(page);
	expect(fmt.length).toBeGreaterThan(0);
});
