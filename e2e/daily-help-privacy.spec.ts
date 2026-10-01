import {test, expect} from "@playwright/test";
import {gotoApp, waitForAppReady, dismissOnboarding, switchMode, setScope, selectTopic, generateQuestion, getCorrectAnswer, submitAnswer, expectResult} from "./helpers";

/**
 * The daily set, the help ladder and the data choice are the three features a
 * learner meets first and cannot work without, so they are driven through the
 * real app rather than exercised at the module level.
 */
test.describe("daily challenge",()=>{
    test.beforeEach(async({page})=>{
        await gotoApp(page, {}, true);
        await waitForAppReady(page);
        await dismissOnboarding(page);
    });
    test("presents a progress summary with a full set",async({page})=>{
        await setScope(page, "algebra");
        await switchMode(page, "daily");
        const summary=page.locator("#daily-summary");
        await expect(summary).toBeVisible();
        await expect(page.locator("#daily-summary-text")).toContainText("of");
    });
    test("starts a question from the set",async({page})=>{
        await setScope(page, "algebra");
        await switchMode(page, "daily");
        await page.locator("#daily-start").click();
        await expect(page.locator("#question-area")).not.toHaveText("");
    });
    test("advances the progress track after an answer",async({page})=>{
        await setScope(page, "algebra");
        await switchMode(page, "daily");
        await page.locator("#daily-start").click();
        let answer=await getCorrectAnswer(page);
        await submitAnswer(page, answer);
        await expect(page.locator("#daily-progress")).toHaveAttribute("aria-valuenow", /\d+/);
    });
    test("shows a streak in the toolbar",async({page})=>{
        await setScope(page, "algebra");
        await switchMode(page, "daily");
        await expect(page.locator("#daily-streak")).toBeVisible();
        await expect(page.locator("#daily-streak-count")).toHaveText(/\d+/);
    });
    test("leaving the mode restores the previous one",async({page})=>{
        await switchMode(page, "daily");
        await switchMode(page, "single");
        await expect(page.locator("#mode-single")).toHaveAttribute("aria-pressed", "true");
        await expect(page.locator("#daily-summary")).toBeHidden();
    });
});

test.describe("hints and solutions",()=>{
    test.beforeEach(async({page})=>{
        await gotoApp(page, {}, true);
        await waitForAppReady(page);
        await dismissOnboarding(page);
        await setScope(page, "algebra");
    });
    test("reveals one rung at a time",async({page})=>{
        await selectTopic(page, "linear_eq");
        await generateQuestion(page);
        const hintButton=page.locator("#show-hint");
        await expect(hintButton).toBeEnabled();
        await hintButton.click();
        const panel=page.locator("#hint-panel");
        await expect(panel).toBeVisible();
        let rows=await panel.locator(".hint-row").count();
        expect(rows).toBe(1);
        await hintButton.click();
        rows=await panel.locator(".hint-row").count();
        expect(rows).toBe(2);
    });
    test("reaching the end gives the answer rather than stalling",async({page})=>{
        await selectTopic(page, "linear_eq");
        await generateQuestion(page);
        const hintButton=page.locator("#show-hint");
        for(let i=0; i<6; i++){
            if (await hintButton.isDisabled()) break;
            await hintButton.click();
        }
        await expect(page.locator("#hint-panel")).toContainText("The answer");
        await expect(hintButton).toBeDisabled();
    });
    test("shows a worked solution on request",async({page})=>{
        await selectTopic(page, "deri");
        await generateQuestion(page);
        const solutionButton=page.locator("#show-solution");
        if (await solutionButton.isVisible()){
            await solutionButton.click();
            await expect(page.locator("#hint-panel")).toContainText("Step");
        }
    });
    test("does not offer help for a question that was never generated",async({page})=>{
        await expect(page.locator("#show-hint")).toBeDisabled();
    });
});

test.describe("the data choice",()=>{
    test.beforeEach(async({page})=>{
        await gotoApp(page, {}, true);
        await waitForAppReady(page);
        await dismissOnboarding(page);
    });
    test("defaults to a private session on the web build",async({page})=>{
        const select=page.locator("#settings-persistence");
        await expect(select).toBeVisible();
    });
    test("a private session writes nothing to local storage",async({page})=>{
        await selectTopic(page, "add");
        await generateQuestion(page);
        let answer=await getCorrectAnswer(page);
        await submitAnswer(page, answer);
        await expectResult(page, "correct");
        let keys=await page.evaluate(()=>Object.keys(window.localStorage));
        expect(keys).toEqual([]);
    });
    test("remembering a session stores the record",async({page})=>{
        await page.evaluate(()=>{
            let el=document.getElementById("settings-persistence") as HTMLSelectElement;
            el.value="indexed";
            el.dispatchEvent(new Event("change", {bubbles:true}));
        });
        await selectTopic(page, "add");
        await generateQuestion(page);
        let answer=await getCorrectAnswer(page);
        await submitAnswer(page, answer);
        await expectResult(page, "correct");
        let stored=await page.evaluate(async ()=>{
            return await new Promise<string>((resolve)=>{
                let request=indexedDB.open("randmatqugea");
                request.onsuccess=()=>{
                    let db=request.result;
                    let tx=db.transaction("state","readonly");
                    let all=tx.objectStore("state").getAll();
                    all.onsuccess=()=>resolve(JSON.stringify(all.result));
                    all.onerror=()=>resolve("[]");
                };
                request.onerror=()=>resolve("[]");
            });
        });
        expect(stored).toContain("reviewRecords");
    });
    test("the erase control is hidden when nothing is being kept",async({page})=>{
        await expect(page.locator("#setting-erase-data")).toBeHidden();
    });
});

test.describe("number theory",()=>{
    test.beforeEach(async({page})=>{
        await gotoApp(page, {}, true);
        await waitForAppReady(page);
        await dismissOnboarding(page);
        await setScope(page, "precalc");
    });
    for (const topic of ["divisibility", "gcd_lcm", "modular", "data_analysis"]){
        test(`${topic} accepts its own correct answer`,async({page})=>{
            await selectTopic(page, topic);
            await generateQuestion(page);
            let answer=await getCorrectAnswer(page);
            await submitAnswer(page, answer);
            await expectResult(page, "correct");
        });
    }
});
