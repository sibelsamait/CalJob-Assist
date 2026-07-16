import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test('health endpoint ok', async ({ request }) => {
  const res = await request.get(`${BASE}/api/health`);
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.status).toBe('ok');
});

test('drive endpoint unauthorized without token', async ({ request }) => {
  const res = await request.post(`${BASE}/api/webhooks/drive`, { data: {} });
  expect(res.status()).toBe(401);
});
