import {test} from "@playwright/test";
import {gotoApp, topicsForCategory, verifyTopicMatrix, DIFFICULTIES} from "./helpers";

const topicIds = topicsForCategory("Arithmetic");

for (const diff of DIFFICULTIES){
	test(`Arithmetic topics generate and accept the correct answer (${diff})`, async ({page})=>{
		test.setTimeout(600000);
		await gotoApp(page, {appSettings: {scope: "all", difficulty: diff}});
		await verifyTopicMatrix(page, topicIds, diff);
	});
}
