import { test, Page } from "@playwright/test";

const authFile = "./web/tests-e2e/.auth/user.json";

const BASE_URL = "http://localhost:5173";
// const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || "";
// const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || "";

function uuidv4() {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
		(+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
	);
}

const randomUUID = uuidv4();

const TEST_FIELD_DETAILS = {
	FIELD_NAME: `SDF Cancha ${randomUUID}`, // nombre aleatorio en cada test
	FIELD_STREET: "San Martin",
	FIELD_NUMBER: "200",
	FIELD_NEIGHBORHOOD: "Microcentro",
	FIELD_CITY: "Buenos Aires",
	FIELD_SPORT: "Tenis de mesa",
	FIELD_PRICE: Math.floor(Math.random() * 10000 + 10000),
	FIELD_DESCRIPTION: "Description",
};

const TEST_TOURNAMENT_DETAILS = {
	TOURNAMENT_NAME: `Torneo ${randomUUID}`,
	TOURNAMENT_SPORT: "Tenis de mesa",
	TOURNAMENT_DESCRIPTION: "Descripción",
	TOURNAMENT_PRICE: Math.floor(Math.random() * 10000 + 10000),
	TOURNAMENT_START_DATE: "2025-08-10",
	TOURNAMENT_INSCRIPTION_DEADLINE: "2025-07-29",
	TOURNAMENT_PLAYERS_NUMBER: 2,
};

test.describe("Publishing things", () => {
	test.use({ storageState: authFile });
	test.describe.configure({ mode: "serial" });
	let publishedFieldURL: string | undefined = undefined;

	test("Publish field", async ({ page }) => {
		await page.goto(`${BASE_URL}/canchas`);
		await page.getByText("Agregar nueva cancha").waitFor({ state: "visible" });
		await page.getByRole("link", { name: "Agregar nueva cancha" }).click();
		await page.waitForLoadState("load");
		await page.waitForRequest(/.*maps\.googleapis\.com\/.*main.*/);
		await page.waitForRequest(/.*maps\.googleapis\.com\/.*map.*/);
		await page.waitForRequest(/.*maps\.googleapis\.com\/.*/);
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
		await page.waitForTimeout(300);
		await page.waitForLoadState("networkidle");
		await page.getByPlaceholder("Escribir el deporte si no").click();
		await page.getByRole("option", { name: TEST_FIELD_DETAILS.FIELD_SPORT }).click();
		await page.locator('input[name="price"]').click();
		await page.locator('input[name="price"]').fill(TEST_FIELD_DETAILS.FIELD_PRICE.toString());
		await page.getByRole("textbox", { name: "Descripción" }).click();
		await page.getByRole("textbox", { name: "Descripción" }).fill(TEST_FIELD_DETAILS.FIELD_DESCRIPTION);
		await page.getByRole("button", { name: "Publicar" }).click();
		await page.waitForURL("/canchas");
	});

	test("Verify field", async ({ page }) => {
		await page.goto("/canchas");
		await page.getByText(TEST_FIELD_DETAILS.FIELD_NAME).waitFor({ state: "visible" });
		await page.getByText(TEST_FIELD_DETAILS.FIELD_NAME).click();
		await page.waitForLoadState("networkidle");
		await page.getByText(TEST_FIELD_DETAILS.FIELD_PRICE.toString()).waitFor({ state: "visible" });
		publishedFieldURL = page.url();
	});

	test("Publish tournament", async ({ page }) => {
		await page.goto(publishedFieldURL!);
		await page.getByRole("button", { name: "Ver torneos" }).click();
		await page.getByRole("button", { name: "Agregar Torneo" }).click();
		await page.getByRole("textbox", { name: "Nombre" }).click();
		await page.getByRole("textbox", { name: "Nombre" }).fill(TEST_TOURNAMENT_DETAILS.TOURNAMENT_NAME);
		await page.getByLabel("", { exact: true }).click();
		await page.getByRole("option", { name: TEST_TOURNAMENT_DETAILS.TOURNAMENT_SPORT }).click();
		await page.getByRole("textbox", { name: "Descripción" }).click();
		await page.getByRole("textbox", { name: "Descripción" }).fill(TEST_TOURNAMENT_DETAILS.TOURNAMENT_DESCRIPTION);
		await page.getByRole("textbox", { name: "Precio" }).click();
		await page.getByRole("textbox", { name: "Precio" }).fill(TEST_TOURNAMENT_DETAILS.TOURNAMENT_PRICE.toString());
		await page
			.getByRole("textbox", { name: "Fecha de inicio" })
			.fill(TEST_TOURNAMENT_DETAILS.TOURNAMENT_START_DATE);
		await page
			.getByRole("textbox", { name: "Fecha de limite de inscripción" })
			.fill(TEST_TOURNAMENT_DETAILS.TOURNAMENT_INSCRIPTION_DEADLINE);
		await page.locator("#cantPlayers").click();
		await page.locator("#cantPlayers").fill(TEST_TOURNAMENT_DETAILS.TOURNAMENT_PLAYERS_NUMBER.toString());
		await page.getByRole("button", { name: "Publicar" }).click();
		await page.getByRole("button", { name: "Close" }).click();
		await page.waitForTimeout(500);
		await page.waitForLoadState("networkidle");
	});

	test("Verify tournament", async ({ page }) => {
		await page.goto(publishedFieldURL!);
		await page.getByRole("button", { name: "Ver torneos" }).click();
		await page
			.getByRole("heading", { name: TEST_TOURNAMENT_DETAILS.TOURNAMENT_NAME })
			.first()
			.waitFor({ state: "visible" });
	});

	test("Remove tournament", async ({ page }) => {
		await page.goto(publishedFieldURL!);
		await page.getByRole("button", { name: "Ver torneos" }).click();
		await page.getByRole("button", { name: "Borrar" }).click();
		await page.getByRole("button", { name: "Close" }).click();
	});

	test("Remove field", async ({ page }) => {
		await page.goto(publishedFieldURL!);
		await page.getByRole("button", { name: "Eliminar cancha" }).click();
		await page.getByRole("button", { name: "Continuar" }).click();
		await page.waitForURL("/canchas");
		await page.goto(`${BASE_URL}/canchas`);
	});
});
