import { test, expect } from '@playwright/test';

test('home page loads and shows products @smoke', async ({ page }) => {
  await page.goto('/');

  // Close the pop-ups if they appear (check the exact button text with codegen)
  const welcome = page.getByRole('button', { name: /close welcome banner/i });
  if (await welcome.isVisible()) await welcome.click();

  const cookie = page.getByText(/me want it/i);
  if (await cookie.isVisible()) await cookie.click();

  await expect(page.locator('mat-card').first()).toBeVisible();
});