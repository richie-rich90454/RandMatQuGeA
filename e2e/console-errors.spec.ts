import {test, expect} from "@playwright/test";
import {gotoApp, selectTopic, generateQuestion, getCorrectAnswer, submitAnswer, switchMode} from "./helpers";
import {topics} from "../src/main/Constants";

test("no runtime errors while exercising the whole app", async ({page})=>{
	test.setTimeout(900000);
	const errors: string[] = [];
	const warnings: string[] = [];
	page.on("console", (msg)=>{
		if (msg.type() === "error") errors.push(`[console.error] ${msg.text()}`);
		else if (msg.type() === "warning") warnings.push(`[console.warning] ${msg.text()}`);
	});
	page.on("pageerror", (err)=>errors.push(`[pageerror] ${err.message}`));
	page.on("requestfailed", (req)=>errors.push(`[requestfailed] ${req.url()} ${req.failure()?.errorText}`));

	await gotoApp(page, {appSettings: {scope: "all"}});

	await test.step("every topic generates and answers (medium)", async ()=>{
		for (const t of topics){
			await test.step(`topic ${t.id}`, async ()=>{
				await selectTopic(page, t.id);
				await generateQuestion(page);
				const ans = await getCorrectAnswer(page);
				await submitAnswer(page, ans, false);
			});
		}
	});

	await test.step("settings modal round-trips", async ()=>{
		await page.locator("#settings-button").click();
		await page.selectOption("#settings-theme", "dark");
		await page.locator("#settings-tab-advanced").click();
		await page.locator("#settings-perf-master").check();
		await page.locator("#settings-perf-master").uncheck();
		await page.locator("#settings-reset").click();
		await page.locator("#settings-save").click();
	});

	await test.step("mental session", async ()=>{
		await switchMode(page, "mental");
		await selectTopic(page, "add");
		await page.locator("#start-session").click();
		await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
		const ans = await getCorrectAnswer(page);
		await page.locator("#answer-box").fill(ans);
		await page.locator("#answer-box").press("Shift+Enter");
		await page.locator("#pause-session").click();
		await page.locator("#pause-session").click();
		await page.locator("#start-session").click();
	});

	await test.step("mcq toggle", async ()=>{
		await switchMode(page, "single");
		await page.locator("#mcq-toggle").check();
		await selectTopic(page, "add");
		await generateQuestion(page);
		await page.locator("#mcq-choices-container .choice-button").first().click();
		await page.locator("#mcq-toggle").uncheck();
	});

	await test.step("print modal", async ()=>{
		await page.locator("#print-worksheet-btn").click();
		await page.selectOption("#print-question-count", "5");
		await page.locator("#print-generate").click();
		await page.locator("#print-preview .ws-document").waitFor({state: "visible", timeout: 20000});
		await page.locator("#print-close").click();
	});

	await test.step("shortcuts and help", async ()=>{
		await page.locator("#help-button").click();
		await page.locator("#shortcuts-button").click();
		await page.locator("#shortcuts-gotit").click();
	});

	console.log("SWEEP ERRORS:\n" + (errors.length ? errors.join("\n") : "(none)"));
	console.log("SWEEP WARNINGS:\n" + (warnings.length ? warnings.join("\n") : "(none)"));
	expect(errors, errors.join("\n")).toEqual([]);
});