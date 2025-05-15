import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = "./web/tests/.auth/user.json";

const BASE_URL = "http://localhost:5173";
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || "";
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || "";

setup("authenticate", async ({ page }) => {
	await page.goto(`${BASE_URL}/login`);

	await page.getByRole("textbox", { name: "Email address" }).click();
	await page.getByRole("textbox", { name: "Email address" }).fill(TEST_USER_EMAIL);
	await page.getByRole("textbox", { name: "Your Password" }).click();
	await page.getByRole("textbox", { name: "Your Password" }).fill(TEST_USER_PASSWORD);
	await page.getByRole("button", { name: "Sign in", exact: true }).click();

	await page.waitForEvent("load");

	await page.context().storageState({ path: authFile });
});
