import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import data from '../../test-data/search.json';

test.describe('Search', () => {
  for (const { term, expectedProduct } of data.matchingSearches) {
    test(`UI-02: search "${term}" shows matching products @regression`, async ({ page }) => {
      const home = new HomePage(page);
      await home.open();
      await home.search(term);

      const cards = home.productCards();
      await expect(cards.first()).toBeVisible();

      const count = await cards.count();
      for (let i = 0; i < count; i++) {
        await expect(cards.nth(i)).toContainText(new RegExp(term, 'i'));
      }
      await expect(
        cards.filter({ has: page.getByText(expectedProduct, { exact: true }) }),
      ).toHaveCount(1);
    });
  }

  for (const { term } of data.noMatchSearches) {
  test(`UI-02b: search "${term}" shows no results message @regression`, async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    await home.search(term);

    await expect(home.searchResultsHeading(term)).toBeVisible();
    await expect(home.noResultsMessage()).toBeVisible();
    await expect(home.productCards()).toHaveCount(0);
  });
}
});