/**
 * Playwright configuration: where the tests are, how long they may take, and which browser runs them.
 */
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load the values from the `.env` file (quiet = no log line about it).
dotenv.config({ quiet: true });

export default defineConfig({
  testDir: './tests',
  // Tests run one after another (not in parallel) because they share one demo website.
  fullyParallel: false,
  // On CI, fail the build if someone forgot a `test.only` in the code.
  forbidOnly: !!process.env.CI,
  // On CI, retry a failed test once; on a developer machine, never retry.
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',
  // A single test may run for at most 60 seconds ...
  timeout: 60_000,
  // ... and every `expect(...)` waits up to 10 seconds for its condition.
  expect: { timeout: 10_000 },
  use: {
    // The website address comes from `.env`, so tests can use short paths such as '/books'.
    baseURL: process.env.LANDING_PAGE_URL,
    // Record a trace and a screenshot only when they help to debug a failure.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
