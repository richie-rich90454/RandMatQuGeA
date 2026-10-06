import {test, expect} from "@playwright/test";
import {gotoApp, waitForAppReady, selectTopic, switchMode} from "./helpers";

/**
 * Every surface that cannot work in a browser under a private session.
 *
 * The list is written out here rather than imported so that a surface added to
 * `GatedSurfaces` without a case here is a visible omission in review, and a case
 * here for a surface that no longer exists fails loudly instead of passing on a
 * selector that matches nothing.
 */
const HIDDEN_WITHOUT_A_RECORD=[
    "#setting-adaptive",
    "#settings-adaptive",
    "#recommend-btn",
    "#weak-topics-modal",
    "#confidence-row",
    "#daily-streak",
    "#manage-data-btn",
    "#setting-erase-data",
];

const RECORD_SURFACES=[
    "#manage-data-btn",
    "#export-data-btn",
    "#import-data-btn",
    "#import-mode",
    "#delete-all-btn",
    "#reset-all-btn",
];

test("every surface that needs adaptive learning is absent in the browser", async ({page})=>{
    // Three of these were hidden and four were not, which is what a rule decided at
    // each call site looks like from the outside: the confidence control, the streak
    // badge and the data dialog all survived, and the confidence control was the one
    // a learner is actually asked to answer.
    await gotoApp(page);
    await waitForAppReady(page);
    for (const selector of HIDDEN_WITHOUT_A_RECORD){
        await expect(page.locator(selector)).toBeHidden();
    }
    await page.locator("#settings-button").click();
    await expect(page.locator("#settings-auto-continue")).toBeVisible();
    await expect(page.locator("#settings-shuffle")).toBeVisible();
    await page.locator("#settings-close").click();
});

test("the confidence control never appears after answering in the browser", async ({page})=>{
    // The question is asked once the answer is graded, so a boot-time check is not
    // enough to catch it. Its only reader is the scheduler's overconfidence
    // correction, so in a browser it is collected, stored and read by nothing.
    await gotoApp(page);
    await waitForAppReady(page);
    await selectTopic(page, "add");
    await page.locator("#genQ").click();
    await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
    const answer = await page.evaluate(()=>{
        const w = window as unknown as { correctAnswer?: { correct?: string } };
        return w.correctAnswer?.correct ?? "";
    });
    await page.locator("#answer-box").fill(answer);
    await page.locator("#answer-box").press("Shift+Enter");
    await expect(page.locator(".results-display")).toContainText("Correct");
    await expect(page.locator("#confidence-row")).toBeHidden();
});

test("record surfaces appear once a record is actually kept", async ({page})=>{
    // The gate is not "hide everything in a browser". Choosing to keep a record in
    // this browser makes these controls meaningful, and a rule that hid them anyway
    // would be the same bug wearing the opposite sign.
    await gotoApp(page, {appSettings: {persistence: "indexed"}});
    await waitForAppReady(page);
    await page.locator("#manage-data-btn").click();
    await expect(page.locator("#data-modal")).toBeVisible();
    for (const selector of RECORD_SURFACES){
        await expect(page.locator(selector)).toBeVisible();
    }
    await page.locator("#data-close").click();
    await expect(page.locator("#data-modal")).toBeHidden();
});

test("the data modal is absent entirely when nothing is kept", async ({page})=>{
    // A private session has no record to export, import, erase or refresh, so the
    // controls are removed rather than left in place to answer that nothing happens.
    await gotoApp(page, {appSettings: {persistence: "zdr"}});
    await waitForAppReady(page);
    await expect(page.locator("#manage-data-btn")).toBeHidden();
    for (const selector of RECORD_SURFACES){
        await expect(page.locator(selector)).toBeHidden();
    }
});

test("turning a private session on removes the record controls immediately", async ({page})=>{
    // The mode is the thing that changes what is kept, so the surfaces have to follow
    // it at the moment it changes rather than at the next restart.
    await gotoApp(page, {appSettings: {persistence: "indexed"}});
    await waitForAppReady(page);
    await page.locator("#settings-button").click();
    await page.locator("#settings-persistence").selectOption("zdr");
    await expect(page.locator("#setting-erase-data")).toBeHidden();
    await page.locator("#settings-close").click();
    await expect(page.locator("#manage-data-btn")).toBeHidden();
});

test("the updates section is absent in the browser rather than explained", async ({page})=>{
    // It used to be present and answered a press with a toast. A control that can
    // only report that it is unavailable is a control that should not be there.
    await gotoApp(page);
    await page.locator("#settings-button").click();
    await expect(page.locator("#updates-section")).toBeHidden();
    await expect(page.locator("#check-updates")).toBeHidden();
    await page.locator("#settings-close").click();
});

test("the mode control names the store that is really in force", async ({page})=>{
    // The desktop build kept everything while this said nothing was stored, which is
    // what made the adaptive surfaces beside it look like a contradiction.
    await gotoApp(page);
    await page.locator("#settings-button").click();
    await expect(page.locator("#settings-persistence")).toHaveValue("zdr");
    await expect(page.locator("#settings-persistence-help")).toContainText("keeps nothing");
    await page.locator("#settings-persistence").selectOption("indexed");
    await expect(page.locator("#settings-persistence-help")).toContainText("stored in this browser only");
    await page.locator("#settings-close").click();
});

test("answering a question in the browser still records a session", async ({page})=>{
    // Adaptive being hidden must not mean the app has stopped working. This is the
    // whole feature working with the adaptive parts taken out.
    await gotoApp(page);
    await selectTopic(page, "add");
    await page.locator("#genQ").click();
    await expect(page.locator("#answer-box")).toBeEnabled({timeout: 15000});
    const answer = await page.evaluate(()=>{
        const w = window as unknown as { correctAnswer?: { correct?: string } };
        return w.correctAnswer?.correct ?? "";
    });
    await page.locator("#answer-box").fill(answer);
    await page.locator("#answer-box").press("Shift+Enter");
    await expect(page.locator(".results-display")).toContainText("Correct");
});

test("leaderboard stays out of the browser build", async ({page})=>{
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