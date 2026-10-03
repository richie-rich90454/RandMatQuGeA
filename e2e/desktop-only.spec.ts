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

test("adaptive learning is absent in the browser rather than explained", async ({page})=>{
    // The recommendation button used to be present and reported itself unavailable
    // on press. It is now removed: a learner reading about a feature they cannot use
    // is worse than not being offered it.
    await gotoApp(page);
    await expect(page.locator("#recommend-btn")).toBeHidden();
    await page.locator("#settings-button").click();
    await expect(page.locator("#setting-adaptive")).toBeHidden();
    await expect(page.locator("#settings-adaptive")).toBeHidden();
    // The weak-topic list is the surface behind the button, and it is hidden too.
    await expect(page.locator("#weak-topics-modal")).toBeHidden();
    await page.locator("#settings-close").click();
});

test("the settings around the removed adaptive row still work", async ({page})=>{
    // Removing one row must not take its neighbours with it: a hiding rule that
    // took out the wrong element would be invisible in a screenshot of the top of
    // the modal and obvious in use.
    await gotoApp(page);
    await page.locator("#settings-button").click();
    await expect(page.locator("#setting-auto-continue")).toBeVisible();
    await expect(page.locator("#settings-auto-continue")).toBeVisible();
    await expect(page.locator("#setting-erase-data")).toBeVisible();
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
