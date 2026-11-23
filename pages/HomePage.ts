import { Page } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto('/');
    await this.dismissPopups();
  }

  async dismissPopups() {
    // Each click waits up to 3 seconds; if the pop-up isn't there, we move on
    await this.page.getByRole('button', { name: /close welcome banner/i })
      .click({ timeout: 3000 }).catch(() => {});
    await this.page.getByText(/me want it/i)
      .click({ timeout: 3000 }).catch(() => {});
  }

  async searchViaUrl(term: string) {
    await this.page.goto(`/#/search?q=${encodeURIComponent(term)}`);
  }


// inside the HomePage class
async search(term: string) {
  await this.page.getByRole('button', { name: 'Open search' }).click();
  const box = this.page.getByRole('textbox');
  await box.fill(term);
  await box.press('Enter');
}

productNames() {
  return this.page.locator('.item-name');
}

productCards() {
  return this.page.locator('mat-card').filter({
    has: this.page.getByRole('button', { name: /add to basket/i }),
  });
}
searchResultsHeading(term: string) {
  return this.page.getByText(`Search Results - ${term}`);
}

noResultsMessage() {
  return this.page.getByText('No results found');
}
}