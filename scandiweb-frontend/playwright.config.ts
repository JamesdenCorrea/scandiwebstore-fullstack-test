// playwright.config.ts
import { defineConfig } from '@playwright/test';

const isLocal = process.env.USE_REMOTE !== 'true';

export default defineConfig({
  testDir: './src/tests',
  use: {
    baseURL: isLocal
      ? 'http://localhost:5173'
      : 'https://appealing-nature-production.up.railway.app',
  },
  webServer: isLocal
    ? {
        command: 'npm run dev',
        port: 5173,
        timeout: 120 * 1000,
        reuseExistingServer: true,
      }
    : undefined,
  fullyParallel: true,
  reporter: [['list'], ['html']],
});
