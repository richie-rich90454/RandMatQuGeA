import {test} from "@playwright/test";
import {gotoApp, topicsForCategory, verifyTopicMatrix, DIFFICULTIES} from "./helpers";

const topicIds = topicsForCategory("Calculus");

for (const diff of DIFFICULTIES){
	test(`Calculus topics generate and accept the correct answer (${diff})`, async ({page})=>{
		test.setTimeout(600000);
		await gotoApp(page, {appSettings: {scope: "all", difficulty: diff}});
		await verifyTopicMatrix(page, topicIds, diff);
	});
}
