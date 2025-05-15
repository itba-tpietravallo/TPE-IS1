import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

try {
	// File exists then load it
	if (fs.existsSync(path.resolve(__dirname, "./web/.env"))) {
		console.log(dotenv.config({ path: path.resolve(__dirname, "./web/.env") }));
	}
} catch (e) {}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	webServer: {
		command: "cd web && npm run dev",
		port: 5173,
		reuseExistingServer: !process.env.CI,
		env: {
			TEST_USER_EMAIL: process.env.TEST_USER_EMAIL!,
			TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD!,
		},
		timeout: 30000, // 30 seconds
	},
	use: {
		baseURL: "http://localhost:5173",
		trace: "on-first-retry",
		actionTimeout: 10000, // 10 seconds
	},
	testDir: "./web/tests",
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: "html",
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	/* Configure projects for major browsers */
	projects: [
		{ name: "setup", testMatch: /.*\.setup\.ts/ },
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				storageState: path.resolve(__dirname, "./web/tests/.auth/user.json"),
			},
			dependencies: ["setup"],
		},

		// {
		//   name: 'firefox',
		//   use: { ...devices['Desktop Firefox'] },
		// },

		// {
		//   name: 'webkit',
		//   use: { ...devices['Desktop Safari'] },
		// },

		/* Test against mobile viewports. */
		// {
		//   name: 'Mobile Chrome',
		//   use: { ...devices['Pixel 5'] },
		// },
		// {
		//   name: 'Mobile Safari',
		//   use: { ...devices['iPhone 12'] },
		// },

		/* Test against branded browsers. */
		// {
		//   name: 'Microsoft Edge',
		//   use: { ...devices['Desktop Edge'], channel: 'msedge' },
		// },
		// {
		//   name: 'Google Chrome',
		//   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
		// },
	],
});
