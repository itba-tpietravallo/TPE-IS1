import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || "";
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || "";

test.only("email login", async ({ page }) => {
	await page.goto(`${BASE_URL}/login`);

	// Expect a title "to contain" a substring.
	const emailField = await page.getByPlaceholder("Your email address");
	const passwordField = await page.getByPlaceholder("Your password");
	await expect(emailField).toBeVisible();
	await expect(passwordField).toBeVisible();

	// test-only user login
	await emailField.fill(TEST_USER_EMAIL);
	await passwordField.fill(TEST_USER_PASSWORD);

	await page.getByRole("button", { name: "Sign in", exact: true }).click();

	await page.getByText("Perfil").waitFor({ state: "visible" });

	await page.waitForTimeout(1000);
});
