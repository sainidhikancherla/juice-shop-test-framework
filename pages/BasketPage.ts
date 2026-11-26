import { Page } from '@playwright/test';

export class BasketPage {
  constructor(private readonly page: Page) {}

  row(product: string) {
    return this.page.locator('mat-row, .mat-mdc-row').filter({ hasText: product });
  }

  async remove(product: string) {
    await this.row(product)
      .locator('.cdk-column-remove button')
      .click();
  }

  cartButton() {
    return this.page.getByRole('button', { name: 'Show the shopping cart' });
  }

  quantity(product: string) {
    return this.row(product).locator('.cdk-column-quantity .cell-initial-font');
  }

  async increaseQuantity(product: string) {
    const quantityUpdated = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/BasketItems/') &&
        response.request().method() === 'PUT',
    );

    await this.row(product)
      .locator('.cdk-column-quantity button')
      .nth(1)
      .click();
    await quantityUpdated;
  }

  unitPrice(product: string) {
    return this.row(product).locator('.cdk-column-price');
  }

  totalPrice() {
    return this.page.getByText(/Total Price:/);
  }

  async openBasket() {
    await this.cartButton().click();
  }
}