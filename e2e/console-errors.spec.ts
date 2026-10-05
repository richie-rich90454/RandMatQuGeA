import {test, expect, Page} from "@playwright/test";
import {gotoApp, selectTopic, generateQuestion, getCorrectAnswer, submitAnswer, switchMode, topicsForCategory} from "./helpers";

/**
 * The whole app exercised for runtime errors, split so each test fits in an
 * execution window. One test swept all 204 topics plus every dialog, which ran
 * past every limit and so never reported anything: a suite that cannot finish
 * is a suite that cannot fail. Each test below collects its own console errors,
 * page errors and failed requests and asserts its own list is empty, so a
 * failure names the area it came from.
 */
type ConsoleCapture={errors: string[]; stop: ()=>void};
function captureConsole(page: Page): ConsoleCapture{
    const errors: string[]=[];
    const onConsole=(msg: {type: ()=>string; text: ()=>string})=>{
        if(msg.type()==="error") errors.push(`[console.error] ${msg.text()}`);
    };
    const onPageError=(err: Error)=>errors.push(`[pageerror] ${err.message}`);
    const onRequestFailed=(req: {url: ()=>string; failure: ()=>{errorText?: string}|undefined})=>{
        errors.push(`[requestfailed] ${req.url()} ${req.failure()?.errorText}`);
    };
    page.on("console", onConsole);
    page.on("pageerror", onPageError);
    page.on("requestfailed", onRequestFailed);
    return{errors, stop:()=>{
        page.off("console", onConsole);
        page.off("pageerror", onPageError);
        page.off("requestfailed", onRequestFailed);
    }};
}
async function expectNoErrors(page: Page, capture: ConsoleCapture): Promise<void>{
    capture.stop();
    expect(capture.errors, capture.errors.join("\n")).toEqual([]);
}
const CATEGORIES=["Arithmetic","Algebra","Calculus","Discrete Math","Geometry","Linear Algebra","Trigonometry"];
/**
 * Splits a category into tests of at most this many topics. A whole category in
 * one test outlasts the execution window for the large ones, and a suite that
 * cannot finish cannot fail, so the split is what makes the coverage real.
 */
const MAX_TOPICS_PER_TEST=15;
function chunksOf(ids: string[]): string[][]{
    const chunks: string[][]=[];
    for(let i=0; i<ids.length; i+=MAX_TOPICS_PER_TEST) chunks.push(ids.slice(i, i+MAX_TOPICS_PER_TEST));
    return chunks;
}
for(const category of CATEGORIES){
    const chunks=chunksOf(topicsForCategory(category));
    chunks.forEach((topicIds, index)=>{
        const suffix=chunks.length>1?` (${index+1}/${chunks.length})`:"";
        test(`no runtime errors across ${category} topics${suffix}`, async ({page})=>{
            test.setTimeout(300000);
            const capture=captureConsole(page);
            await gotoApp(page, {appSettings: {scope: "all"}});
            for(const topicId of topicIds){
                await test.step(`topic ${topicId}`, async ()=>{
                    await selectTopic(page, topicId);
                    await generateQuestion(page);
                    const ans=await getCorrectAnswer(page);
                    await submitAnswer(page, ans, false);
                });
            }
            await expectNoErrors(page, capture);
        });
    });
}
test("no runtime errors in the settings round-trip", async ({page})=>{
    const capture=captureConsole(page);
    await gotoApp(page, {appSettings: {scope: "all"}});
    await page.locator("#settings-button").click();
    await page.selectOption("#settings-theme", "dark");
    await page.locator("#settings-tab-advanced").click();
    await page.locator("#settings-perf-master").check();
    await page.locator("#settings-perf-master").uncheck();
    await page.locator("#settings-reset").click();
    await page.locator("#settings-save").click();
    await expectNoErrors(page, capture);
});
test("no runtime errors in a mental session", async ({page})=>{
    const capture=captureConsole(page);
    await gotoApp(page, {appSettings: {scope: "all"}});
    await switchMode(page, "mental");
    await selectTopic(page, "add");
    await page.locator("#start-session").click();
    await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
    const ans=await getCorrectAnswer(page);
    await page.locator("#answer-box").fill(ans);
    await page.locator("#answer-box").press("Shift+Enter");
    await page.locator("#pause-session").click();
    await page.locator("#pause-session").click();
    await page.locator("#start-session").click();
    await expectNoErrors(page, capture);
});
test("no runtime errors toggling multiple choice", async ({page})=>{
    const capture=captureConsole(page);
    await gotoApp(page, {appSettings: {scope: "all"}});
    await switchMode(page, "single");
    await page.locator("#mcq-toggle").check();
    await selectTopic(page, "add");
    await generateQuestion(page);
    await page.locator("#mcq-choices-container .choice-button").first().click();
    await page.locator("#mcq-toggle").uncheck();
    await expectNoErrors(page, capture);
});
test("no runtime errors printing a worksheet", async ({page})=>{
    const capture=captureConsole(page);
    await gotoApp(page, {appSettings: {scope: "all"}});
    await page.locator("#print-worksheet-btn").click();
    await page.selectOption("#print-question-count", "5");
    await page.locator("#print-generate").click();
    await page.locator("#print-preview .ws-document").waitFor({state: "visible", timeout: 20000});
    await page.locator("#print-close").click();
    await expectNoErrors(page, capture);
});
test("no runtime errors in help and shortcuts", async ({page})=>{
    const capture=captureConsole(page);
    await gotoApp(page, {appSettings: {scope: "all"}});
    await page.locator("#help-button").click();
    await page.locator("#shortcuts-button").click();
    await page.locator("#shortcuts-gotit").click();
    await expectNoErrors(page, capture);
});
