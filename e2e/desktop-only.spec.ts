import {test, expect} from "@playwright/test";
import {gotoApp, selectTopic, switchMode} from "./helpers";

test("data modal opens in the browser and reads the browser record", async ({page})=>{
    // This used to assert a dialog saying performance data was desktop-only. The
    // browser gained a real record path, so the modal now opens and has something
    // to show, and the assertion was describing a behaviour that had been removed.
    await gotoApp(page);
    await page.locator("#manage-data-btn").click();
    await expect(page.locator("#data-modal")).toBeVisible();
    await page.locator("#data-close").click();
    await expect(page.locator("#data-modal")).toBeHidden();
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
    // the modal and obvious in use. The neighbours are named by their checkboxes,
    // because the rows themselves carry no ids to aim at.
    await gotoApp(page);
    await page.locator("#settings-button").click();
    await expect(page.locator("#settings-auto-continue")).toBeVisible();
    await expect(page.locator("#settings-shuffle")).toBeVisible();
    // The erase row is hidden here for a different reason, and it is the second
    // thing the class-based hiding fixes: a browser that keeps nothing has nothing
    // to erase, and the row was staying on screen with a button that could not work.
    await expect(page.locator("#setting-erase-data")).toBeHidden();
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

test("check updates tells the learner it needs the desktop app", async ({page})=>{
    // Also used to wait for a dialog. The message is a toast, not a dialog, and has
    // been for some time; the test was waiting for an event the app never raised.
    await gotoApp(page);
    await page.locator("#settings-button").click();
    await page.locator("#check-updates").click();
    await expect(page.locator(".notification-warning")).toContainText(
        "Updates are only available in the desktop app."
    );
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
