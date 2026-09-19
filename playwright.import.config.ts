import { defineConfig } from '@playwright/test';

const port = Number(process.env.IMPORT_TEST_PORT || 3197);
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/import-acceptance',
  testMatch: 'devstack-import-acceptance.spec.ts',
  timeout: 180_000,
  expect: { timeout: 20_000 },
  workers: 1,
  use: {
    actionTimeout: 30_000,
    baseURL: `http://localhost:${port}`,
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: process.platform === 'darwin'
      ? { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' }
      : undefined,
  },
  webServer: {
    command: 'node scripts/start-import-acceptance.mjs',
    url: `http://localhost:${port}/api/builder-layouts?key=home`,
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 10_000 },
    timeout: 180_000,
  },
});
