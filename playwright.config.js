import { defineConfig } from "@playwright/test";

// Runs against the production build (npm run build first), served on the app's own port.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:5281/", viewport: { width: 1280, height: 860 } },
  webServer: { command: "npx vite preview", url: "http://localhost:5281/", reuseExistingServer: !process.env.CI },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
