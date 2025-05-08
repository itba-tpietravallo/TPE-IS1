import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";
// const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || "";
// const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || "";

test("has title", async ({ page }) => {
	await page.goto(`${BASE_URL}/`, { timeout: 5000 });

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/MatchPoint/);
});

test("publish field login redirection", async ({ page }) => {
	await page.goto(`${BASE_URL}/`, { timeout: 5000 });

	// Click the get started link.
	const button = await page.getByText("Publicá tu cancha");
	await expect(button).toBeVisible();
	await button.click();

	// Wait for the login page to load.
	await page.getByText("Welcome to MatchPoint").waitFor({ state: "visible", timeout: 5000 });
	await expect(new URL(await page.url()).pathname).toBe("/login");
});
