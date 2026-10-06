import {test} from "@playwright/test";
import {gotoApp, topicsForCategory, verifyTopicMatrix, DIFFICULTIES} from "./helpers";

const topicIds = topicsForCategory("Calculus");

for (const diff of DIFFICULTIES){
    test(`Calculus topics generate and accept the correct answer (${diff})`, async ({page})=>{
        // Sweeping a whole category on WebKit takes ten minutes and more; the old
        // ten-minute cap failed the last few topics of Algebra for being slow
        // rather than wrong, which reads as a broken generator.
        test.setTimeout(1800000);
        await gotoApp(page, {appSettings: {scope: "all", difficulty: diff}});
        await verifyTopicMatrix(page, topicIds, diff);
    });
}
