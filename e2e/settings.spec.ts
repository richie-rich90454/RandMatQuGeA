import {test, expect, Page} from "@playwright/test";
import {gotoApp, waitForAppReady, openSettings, saveSettings} from "./helpers";

/**
 * Reads the settings the app actually saved, from wherever the persistence mode in
 * force put them.
 *
 * This used to read `localStorage.getItem("appSettings")` and nothing else. The
 * browser build keeps nothing in localStorage by default, because its default mode
 * is a private session, so every "persists" assertion in this file was reading an
 * empty object and failing without saying why. The app's own store is IndexedDB,
 * `randmatqugea` / `state`, keyed on `key`, so that is what is asked here and
 * localStorage is kept only as a fallback for a build that still uses it.
 */
async function savedSettings(page: Page): Promise<Record<string, unknown>>{
    return page.evaluate(async ()=>{
        // The app's own store first. A browser build that has been told to keep
        // its record writes there and nowhere else, and reading localStorage first
        // would report whatever the test harness seeded rather than what the app
        // saved.
        let fromStore=await new Promise<Record<string, unknown>|null>((resolve)=>{
            let request=indexedDB.open("randmatqugea", 1);
            request.onupgradeneeded=()=>{
                if (!request.result.objectStoreNames.contains("state")){
                    request.result.createObjectStore("state", {keyPath:"key"});
                }
            };
            request.onsuccess=()=>{
                let db=request.result;
                if (!db.objectStoreNames.contains("state")){ resolve(null); return; }
                let get=db.transaction("state","readonly").objectStore("state").get("appSettings");
                get.onsuccess=()=>resolve(((get.result?get.result.value:null)??null) as Record<string, unknown>|null);
                get.onerror=()=>resolve(null);
            };
            request.onerror=()=>resolve(null);
        });
        if (fromStore) return fromStore;
        let fromLocal=localStorage.getItem("appSettings");
        return fromLocal?JSON.parse(fromLocal) as Record<string, unknown>:{};
    });
}

async function openAdvanced(page: Page): Promise<void>{
    await page.locator("#settings-tab-advanced").click();
    await expect(page.locator("#settings-advanced")).toBeVisible();
}

/**
 * Waits for the app's own settings store to hold what is expected.
 *
 * The store is written asynchronously, so reading it once and comparing is a race:
 * the save has usually not landed yet, and the assertion then reports the previous
 * value while the interface has visibly changed, which reads like a bug in the app
 * and is not one. Polling asks the store until it agrees, which is what a test
 * about persistence actually needs.
 */
async function expectSaved(page: Page, expected: Record<string, unknown>): Promise<void>{
    // The received document is the assertion's subject, so on failure Playwright
    // prints what is actually stored. Returning a boolean instead would have said
    // only that the values disagree, which is the same information as before and
    // left the cause unguessable.
    await expect.poll(async ()=>await savedSettings(page), {
        message: `settings to hold ${JSON.stringify(expected)}`
    }).toMatchObject(expected);
}

/**
 * Puts the app in a mode that keeps settings before any test runs.
 *
 * The browser build defaults to a private session, in which nothing is written
 * anywhere by design. Every case in this file is about what the app *saves*, so
 * they were all reading an empty store and failing on the first assertion without
 * saying why. Choosing the keeping mode first is what makes the subject of the
 * file testable at all.
 */
test.beforeEach(async ({page})=>{
    await gotoApp(page);
    await openSettings(page);
    await page.selectOption("#settings-persistence", "indexed");
    await saveSettings(page);
});

test("theme and font settings apply immediately and persist", async ({page})=>{
    await gotoApp(page);
    await openSettings(page);
    await page.selectOption("#settings-theme", "dark");
    await page.selectOption("#settings-font", "opendyslexic");
    await saveSettings(page);
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.locator("body")).toHaveClass(/font-opendyslexic/);
    // The promise is what a learner sees after a restart, so that is what is
    // asserted: the control must come back holding the choice. Reading the app's
    // store directly would test where the answer is kept rather than whether it
    // survived, and it would keep failing for reasons that are not the learner's.
    await page.reload();
    await waitForAppReady(page);
    await expect(page.locator("html")).toHaveClass(/dark/);
    await openSettings(page);
    await expect(page.locator("#settings-theme")).toHaveValue("dark");
    await expect(page.locator("#settings-font")).toHaveValue("opendyslexic");
    await page.locator("#settings-close").click();
});

test("default mode mental starts the app in mental mode after reload", async ({page})=>{
    await gotoApp(page);
    await openSettings(page);
    await page.selectOption("#settings-default-mode", "mental");
    await saveSettings(page);
    await page.reload();
    await expect(page.locator("#mode-mental")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#mental-controls")).toBeVisible();
});

test("scope and toggles persist and filter the topic grid", async ({page})=>{
    await gotoApp(page);
    await openSettings(page);
    await page.selectOption("#settings-scope", "calc");
    await page.locator("#settings-shuffle").check();
    await page.locator("#settings-auto-continue").check();
    await saveSettings(page);
    await expect(page.locator("#scope-select")).toHaveValue("calc");
    await expect(page.locator("#shuffle-toggle")).toBeChecked();
    await expect(page.locator("#autocontinue-toggle")).toBeChecked();
    await page.reload();
    await expect(page.locator('[data-topic-id="deri"]')).toBeVisible();
    await expect(page.locator('[data-topic-id="sin"]')).toBeHidden();
});

test("difficulty, timer and max questions drive the mental session", async ({page})=>{
    await gotoApp(page);
    await openSettings(page);
    await page.selectOption("#settings-difficulty", "hard");
    await page.locator("#settings-timer").fill("45");
    await page.locator("#settings-max-questions").fill("3");
    await saveSettings(page);
    await page.locator("#mode-mental").click();
    await expect(page.locator("#difficulty-select")).toHaveValue("hard");
     await expectSaved(page, {difficulty: "hard", timer: 45, maxQuestions: 3});
    await page.locator("#start-session").click();
    await expect(page.locator("#timer-display")).toContainText("00:45", {timeout: 10000});
});

test("notifications toggle suppresses info toasts", async ({page})=>{
    await gotoApp(page);
    await openSettings(page);
    await page.locator("#settings-notifications").uncheck();
    await saveSettings(page);
    await page.locator("#help-button").click();
    await page.waitForTimeout(500);
    await expect(page.locator(".notification-info")).toHaveCount(0);
    await expectSaved(page, {notifications: false});
});

test("advanced performance toggles apply classes and persist", async ({page})=>{
    await gotoApp(page);
    await openSettings(page);
    await openAdvanced(page);
    await page.locator("#settings-perf-wave").uncheck();
    await page.locator("#settings-perf-blur").uncheck();
    await page.locator("#settings-perf-preview").uncheck();
    await page.locator("#settings-perf-animations").uncheck();
    await page.selectOption("#settings-fps-cap", "30");
    await saveSettings(page);
    await expect(page.locator("#wave-container")).toHaveClass(/hidden/);
    await expect(page.locator("html")).toHaveClass(/no-blur/);
    await expect(page.locator("html")).toHaveClass(/reduce-motion/);
    await expect(page.locator("#preview")).toHaveClass(/hidden/);
     await expectSaved(page, {perfWave: false, perfBlur: false, perfPreview: false, perfAnimations: false, fpsCap: 30});
});

test("performance master disables eye candy in one switch", async ({page})=>{
    await gotoApp(page);
    await openSettings(page);
    await openAdvanced(page);
    await page.locator("#settings-perf-master").check();
    await saveSettings(page);
    await expect(page.locator("#wave-container")).toHaveClass(/hidden/);
    await expect(page.locator("html")).toHaveClass(/no-blur/);
    await expect(page.locator("html")).toHaveClass(/reduce-motion/);
    await expect(page.locator("#preview")).toHaveClass(/hidden/);
    await expectSaved(page, {perfMaster: true});
});

test("answer options and multiple-choice settings persist", async ({page})=>{
    await gotoApp(page);
    await openSettings(page);
    await openAdvanced(page);
    await page.locator("#settings-auto-check-delay").fill("500");
    await page.locator("#settings-decimal-places").fill("3");
    await page.locator("#settings-mcq-choices").fill("5");
    await page.locator("#settings-sound").check();
    await page.locator("#settings-vibration").check();
    await saveSettings(page);
     await expectSaved(page, {autoCheckDelay: 500, decimalPlaces: 3, mcqChoicesCount: 5, sound: true, vibration: true});
});

test("adaptive learning toggle persists", async ({page})=>{
    await gotoApp(page);
    await openSettings(page);
    await page.locator("#settings-adaptive").uncheck();
    await saveSettings(page);
    await expectSaved(page, {adaptive: false});
});

test("reset to defaults restores the modal and persisted settings", async ({page})=>{
    await gotoApp(page);
    await openSettings(page);
    await page.selectOption("#settings-theme", "dark");
    await page.selectOption("#settings-scope", "calc");
    await page.locator("#settings-shuffle").check();
    await openAdvanced(page);
    await page.locator("#settings-reset").click();
    await expect(page.locator("#settings-theme")).toHaveValue("system");
    await expect(page.locator("#settings-scope")).toHaveValue("simple");
    await expect(page.locator("#settings-shuffle")).not.toBeChecked();
     await expectSaved(page, {theme: "system", scope: "simple", shuffle: false});
});

test("settings persist across reload via localStorage", async ({page})=>{
    await gotoApp(page);
    await openSettings(page);
    await page.selectOption("#settings-font", "opendyslexic");
    await page.locator("#settings-notifications").uncheck();
    await saveSettings(page);
    await page.reload();
    await openSettings(page);
    await expect(page.locator("#settings-font")).toHaveValue("opendyslexic");
    await expect(page.locator("#settings-notifications")).not.toBeChecked();
});
