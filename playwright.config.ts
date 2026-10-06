import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.A11Y_BASE_URL || 'http://localhost:3000'

export default defineConfig( {
  testDir       : './tests',
  timeout       : 10 * 60 * 1000,
  fullyParallel : false,
  workers       : 1,
  reporter      : [['list'], ['html', { open : 'never', outputFolder : 'playwright-report' }]],
  use           : {
    baseURL,
    trace : 'retain-on-failure',
  },
  projects : [
    { name : 'chromium', use : { ...devices['Desktop Chrome'] } },
  ],
  // Reuse a running dev/prod server, otherwise boot one
  webServer : process.env.A11Y_BASE_URL
    ? undefined
    : {
      command             : 'pnpm dev',
      url                 : baseURL,
      reuseExistingServer : true,
      timeout             : 180 * 1000,
    },
} )
