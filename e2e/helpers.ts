import {Page, expect, test} from "@playwright/test";
import {topics} from "../src/main/TopicData";

export const BASE_URL = "http://localhost:1331";
export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type SettingsSeed = Record<string, unknown>;

export async function gotoApp(page: Page, seed: SettingsSeed = {}, fresh = false): Promise<void>{
    await page.addInitScript(({seed, fresh}: { seed: SettingsSeed; fresh: boolean })=>{
        try{
            if (!sessionStorage.getItem("__e2e_initialized")){
                localStorage.clear();
                sessionStorage.setItem("__e2e_initialized", "1");
            }
            if (!sessionStorage.getItem("__e2e_seeded")){
            // Seeded both ways on purpose. The blob under `appSettings` is what the
            // current build reads; the flat keys are what it reads for an older one.
            // Replacing one with the other broke a suite in a way that had nothing
            // to do with what those tests were checking, so both are written.
            if (Object.keys(seed).length > 0){
                localStorage.setItem("appSettings", JSON.stringify(seed));
                for (const [key, value] of Object.entries(seed)){
                    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
                }
            }
            localStorage.setItem("onboardingShown", "1");
                if (fresh){
                    localStorage.removeItem("onboardingShown");
                }
                sessionStorage.setItem("__e2e_seeded", "1");
            }
        }
        catch (e){
            console.warn("init script localStorage failed", e);
        }
    }, {seed, fresh});
    await page.goto("/");
    await waitForAppReady(page);
}

export async function waitForAppReady(page: Page): Promise<void>{
    await expect(page.locator("#leaderboard-content")).toContainText("Leaderboard", {timeout: 15000});
}

export async function seedSettings(page: Page, settings: Record<string, unknown>): Promise<void>{
    await page.evaluate((settings)=>{
        let existing: Record<string, unknown> = {};
        const raw = localStorage.getItem("appSettings");
        if (raw){
            try{
                existing = JSON.parse(raw);
            }
            catch (e){
                /* ignore */
            }
        }
        localStorage.setItem("appSettings", JSON.stringify({...existing, ...settings}));
    }, settings);
}

export async function dismissOnboarding(page: Page): Promise<void>{
    const gotit = page.locator("#onboarding-gotit");
    if (await gotit.isVisible().catch(() => false)){
        await gotit.click();
    }
}

export async function setScope(page: Page, scope: string): Promise<void>{
    await page.selectOption("#scope-select", scope);
    await expect(page.locator(`[data-topic-id="add"]`)).toBeVisible();
}

export async function selectTopic(page: Page, topicId: string): Promise<void>{
    const pill = page.locator(`[data-topic-id="${topicId}"]`);
    await expect(pill).toBeVisible();
    await pill.click();
    if (!(await page.locator("#genQ").isEnabled())){
        await pill.click();
    }
    await expect(page.locator("#genQ")).toBeEnabled();
    await expect(page.locator("#current-topic")).not.toHaveText("Select a topic");
}

/**
 * Waits until the controls a click depends on stop moving.
 *
 * A generated question is typeset asynchronously, and typesetting changes the
 * height of the question area, which moves the Generate and Check buttons under
 * the pointer. Playwright hit-tests the point, then dispatches, and a layout
 * change in between sends the click into empty space: the handler never runs, no
 * verdict appears, and the failure looks like a broken grader rather than a
 * moving target. Waiting for the buttons' geometry to hold still twice is what
 * makes the click land where it was aimed.
 *
 * @param page - The page to settle.
 */
export async function waitForLayoutSettled(page: Page): Promise<void>{
    await page.evaluate(async ()=>{
        const read=()=>{
            const parts=["genQ","check-answer","preview-output","answer-box"].map(id=>{
                const b=document.getElementById(id);
                if(!b) return "none";
                const r=b.getBoundingClientRect();
                return `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}`;
            });
            const card=document.querySelector(".answer-card");
            if(card){
                const r=card.getBoundingClientRect();
                parts.push(`${Math.round(r.width)},${Math.round(r.height)}`);
            }
            return parts.join("|");
        };
        let last=read();
        let stable=0;
        for(let i=0;i<80;i++){
            await new Promise((resolve)=>setTimeout(resolve,50));
            const now=read();
            stable=now===last?stable+1:0;
            last=now;
            if(stable>=4) return;
        }
    });
}

export async function generateQuestion(page: Page): Promise<void>{
    const before = await typesetToken(page);
    await page.locator("#genQ").click();
    await expect(page.locator("#answer-box")).toBeDisabled({timeout: 5000}).catch(()=>{});
    await expect(page.locator("#answer-box")).toBeEnabled({timeout: 20000});
    await expect
        .poll(()=>page.evaluate(()=>{
            const w = window as unknown as { correctAnswer?: { correct?: string } };
            return w.correctAnswer?.correct ?? "";
        }), {timeout: 20000})
        .not.toBe("");
    await expect
        .poll(()=>typesetToken(page), {timeout: 20000})
        .not.toBe(before);
    await waitForLayoutSettled(page);
}

/**
 * Reads the app's count of completed typesetting passes.
 *
 * @param page - The page to read.
 * @returns The token, or an empty string when the app has not published one.
 */
async function typesetToken(page: Page): Promise<string>{
    return page.evaluate(()=>document.documentElement.getAttribute("data-typeset-done") ?? "");
}

export async function getCorrectAnswer(page: Page): Promise<string>{
    return page.evaluate(()=>{
        const w = window as unknown as { correctAnswer?: { correct?: string } };
        return w.correctAnswer?.correct ?? "";
    });
}

export async function getExpectedFormat(page: Page): Promise<string>{
    return (await page.locator("#expected-format").textContent() ?? "").replace(/^Expected format:\s*/, "");
}

export async function submitAnswer(page: Page, answer: string, viaKeyboard = true): Promise<void>{
    const box = page.locator("#answer-box");
    await expect(box).toBeEnabled();
    await box.fill(answer);
    // Typing updates a preview, and that update is debounced: it can reflow the
    // card after the fill returns and move the Check button between the click's
    // hit test and its dispatch, which sends the click into empty space. The
    // layout is waited out here, where the change comes from, rather than only
    // after generation.
    await waitForLayoutSettled(page);
    if (viaKeyboard){
        await box.press("Shift+Enter");
    }
    else{
        await page.locator("#check-answer").click();
    }
}

export async function expectResult(page: Page, state: "correct" | "incorrect"): Promise<void>{
    const selector = state === "correct" ? ".result-success" : ".result-error";
    await expect(page.locator(`#answer-results ${selector}`)).toBeVisible({ timeout: 15000 });
}

export async function openSettings(page: Page): Promise<void>{
    await page.locator("#settings-button").click();
    await expect(page.locator("#settings-modal")).toBeVisible();
}

export async function saveSettings(page: Page): Promise<void>{
    await page.locator("#settings-save").click();
    await expect(page.locator("#settings-modal")).not.toBeVisible();
}

export async function switchMode(page: Page, mode: "single" | "mental" | "daily"): Promise<void>{
    const btn = mode === "single" ? "#mode-single" : mode === "mental" ? "#mode-mental" : "#mode-daily";
    await page.locator(btn).click();
    await expect(page.locator(btn)).toHaveAttribute("aria-pressed", "true");
}

export function topicsForCategory(category: string): string[]{
    return topics.filter((t)=>t.category === category).map((t)=>t.id);
}

export async function verifyTopicMatrix(page: Page, topicIds: string[], difficulty: string): Promise<void>{
    for (const topicId of topicIds){
        await test.step(`topic ${topicId} (${difficulty})`, async ()=>{
            await selectTopic(page, topicId);
            await generateQuestion(page);
            const answer = await getCorrectAnswer(page);
            await submitAnswer(page, answer, false);
            await expectResult(page, "correct");
        });
    }
}
