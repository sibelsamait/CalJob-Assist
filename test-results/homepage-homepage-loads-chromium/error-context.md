# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> homepage loads
- Location: tests/homepage.spec.ts:3:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 | 
  3 | test('homepage loads', async ({ page }) => {
> 4 |   await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
    |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  5 |   await expect(page).toHaveTitle(/CalJob Assist/);
  6 | });
  7 | 
```