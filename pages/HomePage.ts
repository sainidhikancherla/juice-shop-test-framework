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

  async search(term: string) {
    await this.page.goto(`/#/search?q=${encodeURIComponent(term)}`);
  }
}