import {test, expect} from "@playwright/test";
import {gotoApp} from "./helpers";

test("app boots to a usable shell", async ({page})=>{
	await gotoApp(page);
	await expect(page.locator("#app-content").or(page.locator(".app-container"))).toBeAttached();
	await expect(page.locator("#genQ")).toBeVisible();
	await expect(page.locator("#mode-single")).toHaveAttribute("aria-pressed", "true");
	await expect(page.locator("#current-topic")).toBeVisible();
	await expect(page.locator("#answer-box")).toBeDisabled();
});

test("default scope shows only simple topics and auto-selects one", async ({page})=>{
	await gotoApp(page);
	await expect(page.locator('[data-topic-id="add"]')).toBeVisible();
	await expect(page.locator('[data-topic-id="deri"]')).toBeHidden();
	await expect(page.locator("#genQ")).toBeEnabled();
	await expect(page.locator("#current-topic")).toHaveText("Addition");
});
