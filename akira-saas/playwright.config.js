/**
 * Playwright Configuration for Accessibility Testing
 */

export default {
  testDir: './src/__tests__/e2e',
  testMatch: '**/*accessibility*.spec.js',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...browsers.chromium,
      },
    },
    {
      name: 'firefox',
      use: {
        ...browsers.firefox,
      },
    },
  ],
}

const browsers = {
  chromium: { channel: 'chrome' },
  firefox: { channel: 'firefox' },
}
