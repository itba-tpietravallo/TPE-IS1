import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || "";
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || "";

function uuidv4() {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
		(+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
	);
}

const TEST_FIELD_DETAILS = {
	FIELD_NAME: `SDF Cancha ${uuidv4()}`, // nombre aleatorio en cada test
	FIELD_STREET: "San Martin",
	FIELD_NUMBER: "200",
	FIELD_NEIGHBORHOOD: "Microcentro",
	FIELD_CITY: "Buenos Aires",
	FIELD_SPORT: "Tenis de mesa",
	FIELD_PRICE: Math.floor(Math.random() * 10000 + 10000),
	FIELD_DESCRIPTION: "Description",
};

test.describe("Fields", () => {
	test("Publish field", async ({ page }) => {
		// Publishing
		await page.goto(`${BASE_URL}/canchas`);
		await page.getByText("Agregar nueva cancha").waitFor({ state: "visible" });
		await page.getByRole("link", { name: "Agregar nueva cancha" }).click();
		await page.waitForLoadState("load");
		await page.waitForRequest(/.*maps\.googleapis\.com\/.*main.*/);
		await page.waitForRequest(/.*maps\.googleapis\.com\/.*map.*/);
		await page.getByRole("textbox", { name: "Nombre" }).click();
		await page.getByRole("textbox", { name: "Nombre" }).fill(TEST_FIELD_DETAILS.FIELD_NAME);
		await page.getByRole("textbox", { name: "Calle" }).click();
		await page.getByRole("textbox", { name: "Calle" }).fill(TEST_FIELD_DETAILS.FIELD_STREET);
		await page.getByRole("textbox", { name: "Número" }).click();
		await page.getByRole("textbox", { name: "Número" }).fill(TEST_FIELD_DETAILS.FIELD_NUMBER);
		await page.getByRole("textbox", { name: "Barrio" }).click();
		await page.getByRole("textbox", { name: "Barrio" }).fill(TEST_FIELD_DETAILS.FIELD_NEIGHBORHOOD);
		await page.getByRole("textbox", { name: "Ciudad" }).click();
		await page.getByRole("textbox", { name: "Ciudad" }).fill(TEST_FIELD_DETAILS.FIELD_CITY);
		await page.waitForRequest(/.*\/api\/v1\/geocode.*/);
		await page.waitForTimeout(150);
		await page.getByPlaceholder("Escribir el deporte si no").click();
		await page.getByRole("option", { name: TEST_FIELD_DETAILS.FIELD_SPORT }).click();
		await page.locator('input[name="price"]').click();
		await page.locator('input[name="price"]').fill(TEST_FIELD_DETAILS.FIELD_PRICE.toString());
		await page.getByRole("textbox", { name: "Descripción" }).click();
		await page.getByRole("textbox", { name: "Descripción" }).fill(TEST_FIELD_DETAILS.FIELD_DESCRIPTION);
		await page.getByRole("button", { name: "Publicar" }).click();

		await page.waitForURL("/canchas");

		// Verifying
		await page.getByText(TEST_FIELD_DETAILS.FIELD_NAME).waitFor({ state: "visible" });
		await page.getByText(TEST_FIELD_DETAILS.FIELD_NAME).click();
		await page.getByText(TEST_FIELD_DETAILS.FIELD_PRICE.toString()).waitFor({ state: "visible" });

		// Clean up
		await page.getByRole("button", { name: "Eliminar cancha" }).click();
		await page.getByRole("button", { name: "Continuar" }).click();
		await page.waitForURL("/canchas");
	});
});
