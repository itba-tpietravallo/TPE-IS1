import { test, expect } from "@playwright/test";

test.describe("MercadoPago", () => {
	// Skipping this test to reduce calls to MercadoPago
	test.skip("Link with MercadoPago", async ({ page }) => {
		await page.goto("http://localhost:5173/canchas");
		await page.getByRole("link", { name: "Perfil" }).click();
		await page.getByRole("link", { name: "Vincular a Mercado Pago" }).click();
		await page.waitForURL(/https:\/\/auth\.mercadopago\.com\/authorization/);
	});
});
