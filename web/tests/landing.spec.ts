import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test("has title", async ({ page }) => {
	await page.goto(`${BASE_URL}/`);

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/MatchPoint/);
});

test("publish field login redirection", async ({ page }) => {
	await page.goto(`${BASE_URL}/`);

	// Click the get started link.
	const button = await page.getByText("Publicá tu cancha");
	await expect(button).toBeVisible();
	await button.click();

	// Wait for the login page to load.
	await page.getByText("Welcome to MatchPoint").waitFor({ state: "visible" });
	await expect(new URL(await page.url()).pathname).toBe("/login");
});
