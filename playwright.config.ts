import { defineConfig } from "@playwright/test";

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.HEADER_TEST_BASE_URL ??
  "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  workers: 1,
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1440, height: 1000 },
    launchOptions: process.platform === "darwin"
      ? {
          executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          args: ["--host-resolver-rules=MAP *.webpages.am 127.0.0.1"],
        }
      : undefined,
  },
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
