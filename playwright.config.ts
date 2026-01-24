import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.e2e' });

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  timeout: 60000, // Globales Timeout auf 60s erhöhen
  /* Wir setzen die Werte fest, statt process.env zu nutzen */
  forbidOnly: false,
  retries: 0,
  workers: undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://test.mbdevelop.de',
    actionTimeout: 15000, // Timeout für einzelne Aktionen (Klicks/Füllen)
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'Desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'Mobile',
      use: { ...devices['iPhone 13'], isMobile: true },
    },
  ],
});