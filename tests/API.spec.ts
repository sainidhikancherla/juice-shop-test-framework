import { test, expect } from '@playwright/test';

test('product search API returns products @smoke', async ({ request }) => {
  const response = await request.get('/rest/products/search?q=');
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(Array.isArray(body.data)).toBeTruthy();
  expect(body.data.length).toBeGreaterThan(0);
});