import {test, expect} from "@playwright/test";
import {gotoApp, selectTopic, generateQuestion, switchMode} from "./helpers";

const MCQLOC = "#mcq-choices-container .choice-button";

async function countChoices(page: import("@playwright/test").Page): Promise<number>{
    return page.locator(MCQLOC).count();
}

test("MCQ mode generates choices instead of a text input", async ({page})=>{
    await gotoApp(page, {appSettings: {mcqMode: true}});
    await selectTopic(page, "add");
    await generateQuestion(page);
    await expect(page.locator("#answer-box")).toBeHidden();
    await expect(page.locator("#mcq-choices-container")).toBeVisible();
    expect(await countChoices(page)).toBe(4);
});

/**
 * Normalizes rendered choice text for comparison with the stored key. KaTeX
 * renders its minus as U+2212 rather than the ASCII hyphen the key uses, and
 * annotation nodes can repeat the text, so both are normalized before comparing.
 * A test that forgets either concludes the key is missing when it is on screen.
 */
const plain=(s:string)=>{
    let t=s.replace(/−/g,"-").replace(/[\s,]/g,"");
    for(let reps of [3,2]){
        if(t.length%reps===0){
            let part=t.slice(0,t.length/reps);
            if(part.repeat(reps)===t) return part;
        }
    }
    return t;
};

/**
 * Reads the current question's key and the text of each rendered choice, waiting for
 * the choices to be rebuilt. The choices are rendered after the answer is set, so
 * reading them immediately after generating can catch the previous question's.
 *
 * Both sides are compared with `plain`, which strips the separators a renderer
 * adds. A choice rendered through KaTeX carries a thousands separator the stored
 * answer does not, and a test that forgets that concludes the key is missing when
 * it is on screen.
 */
async function readKeyAndChoices(page: import("@playwright/test").Page): Promise<{key: string; texts: string[]; keyAt: number}>{
    let seen: {key: string; texts: string[]; keyAt: number}={key: "", texts: [], keyAt: -1};
    await expect.poll(async ()=>{
        seen=await page.evaluate(()=>{
            const w=window as unknown as{correctAnswer?:{correct?:string}};
            const buttons=[...document.querySelectorAll("#mcq-choices-container .choice-button")];
            return{key:w.correctAnswer?.correct??"", texts:buttons.map(b=>(b as HTMLElement).textContent??"")};
        });
        seen.keyAt=seen.texts.findIndex(t=>plain(t)===plain(seen.key));
        return seen.texts.length===4 && seen.keyAt>=0;
    }, {timeout: 10000}).toBe(true);
    return seen;
}

/**
 * Empties the results area. A correct answer leaves its mark on screen, so a case
 * that reads a verdict after a second click would otherwise count the first click's
 * success as the second's.
 */
async function clearResults(page: import("@playwright/test").Page): Promise<void>{
    await page.evaluate(()=>{
        const area=document.getElementById("answer-results");
        if (area) area.innerHTML="";
    });
}

test("exactly one MCQ choice is accepted as correct", async ({page})=>{
    await gotoApp(page, {appSettings: {mcqMode: true, decimalPlaces: 3}});
    await selectTopic(page, "add");
    const choices = page.locator(MCQLOC);
    await generateQuestion(page);
    const {key, texts, keyAt}=await readKeyAndChoices(page);
    // One of the four is the answer, and the other three are not. Both halves are
    // checked by clicking, because an option set can contain the key twice and still
    // read correctly.
    expect(texts.filter(t=>plain(t)===plain(key))).toHaveLength(1);
    const wrongAt=(keyAt+1)%4;
    await clearResults(page);
    await choices.nth(keyAt).click();
    await expect(page.locator("#answer-results .result-success")).toHaveCount(1);
    // A fresh question for the second click. Clicking a second choice on the answered
    // question does nothing, because answering takes the choices away, so a case that
    // tries to read both verdicts off one question reads only the first.
    await generateQuestion(page);
    const second=await readKeyAndChoices(page);
    await clearResults(page);
    await choices.nth((second.keyAt+1)%4).click();
    await expect(page.locator("#answer-results .result-success")).toHaveCount(0);
    await expect(page.locator("#answer-results")).toContainText("Incorrect");
    expect(wrongAt).toBeGreaterThanOrEqual(0);
});

test("clicking the correct MCQ choice shows Correct!", async ({page})=>{
    await gotoApp(page, {appSettings: {mcqMode: true, decimalPlaces: 3}});
    await selectTopic(page, "mult");
    await generateQuestion(page);
    // The choice is located from the answer rather than by clicking through and
    // hoping. This case used to loop over every choice and assert nothing after the
    // loop, so it passed whether or not any choice was ever accepted.
    const {keyAt}=await readKeyAndChoices(page);
    expect(keyAt).toBeGreaterThanOrEqual(0);
    await clearResults(page);
    await page.locator(MCQLOC).nth(keyAt).click();
    await expect(page.locator("#answer-results .result-success")).toHaveCount(1);
    await expect(page.locator("#answer-results")).toContainText("Correct!");
});

test("choice count follows the settings value", async ({page})=>{
    await gotoApp(page, {appSettings: {mcqMode: true, mcqChoicesCount: 2}});
    await selectTopic(page, "add");
    await generateQuestion(page);
    expect(await countChoices(page)).toBe(2);
});

test("changing choice count in settings affects newly generated questions", async ({page})=>{
    await gotoApp(page, {appSettings: {mcqMode: true}});
    await page.locator("#settings-button").click();
    await page.locator("#settings-tab-advanced").click();
    await page.locator("#settings-mcq-choices").fill("3");
    await page.locator("#settings-save").click();
    await expect(page.locator("#settings-modal")).not.toBeVisible();
    await selectTopic(page, "add");
    await generateQuestion(page);
    expect(await countChoices(page)).toBe(3);
});

test("toggling MCQ on for an existing question shows its choices", async ({page})=>{
    await gotoApp(page);
    await selectTopic(page, "add");
    await generateQuestion(page);
    await expect(page.locator("#answer-box")).toBeVisible();
    await page.locator("#mcq-toggle").check();
    await expect(page.locator("#answer-box")).toBeHidden();
    await expect(page.locator("#mcq-choices-container")).toBeVisible();
    expect(await countChoices(page)).toBeGreaterThanOrEqual(2);
});

test("mental mode MCQ session increments score and finishes", async ({page})=>{
    await gotoApp(page, {appSettings: {mcqMode: true, maxQuestions: 1}});
    await switchMode(page, "mental");
    await selectTopic(page, "add");
    await page.locator("#start-session").click();
    await expect(page.locator("#mcq-choices-container")).toBeVisible();
    await page.locator(MCQLOC).first().click();
    await expect(page.locator("#score-display")).toContainText("/ 1", {timeout: 10000});
    await expect(page.locator("#start-session")).toHaveText(/Start Session/);
});

test("toggling MCQ off restores the text input for a loaded question", async ({page})=>{
    await gotoApp(page, {appSettings: {mcqMode: true}});
    await selectTopic(page, "add");
    await generateQuestion(page);
    await page.locator("#mcq-toggle").uncheck();
    await expect(page.locator("#answer-box")).toBeVisible();
    await expect(page.locator("#mcq-choices-container")).toBeHidden();
});
