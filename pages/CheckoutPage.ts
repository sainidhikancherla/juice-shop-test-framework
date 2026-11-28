import { Page, expect} from '@playwright/test';

export type Address = {
  name: string; country: string; mobile: string; zip: string;
  address: string; city: string; state: string;
};
export type Card = { name: string; number: string; expiryMonth: string; expiryYear: string };

export class CheckoutPage {
  constructor(private page: Page) {}

  async startCheckout() {
  const button = this.page.getByRole('button', { name: 'Checkout' });
  await expect(button).toBeEnabled();
  await button.click();
}

  async addAddress(a: Address) {
    await this.page.getByRole('button', { name: 'Add New Address' }).click();
    await this.page.getByRole('textbox', { name: 'Country' }).fill(a.country);
    await this.page.getByRole('textbox', { name: 'Name' }).fill(a.name);
    await this.page.getByRole('spinbutton', { name: 'Mobile Number' }).fill(a.mobile);
    await this.page.getByRole('textbox', { name: 'ZIP Code' }).fill(a.zip);
    await this.page.getByRole('textbox', { name: 'Address' }).fill(a.address);
    await this.page.getByRole('textbox', { name: 'City' }).fill(a.city);
    await this.page.getByRole('textbox', { name: 'State' }).fill(a.state);
    await this.page.getByRole('button', { name: 'Submit' }).click();
  }

  async selectAddress(a: Address) {
    await this.page.getByRole('row').filter({ hasText: a.address }).getByRole('radio').check();
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async chooseDelivery(option: string) {
    await this.page.getByRole('row').filter({ hasText: option }).getByRole('radio').check();
    await this.page.getByRole('button', { name: 'Proceed to delivery method' }).click();
  }

  async addCard(c: Card) {
    await this.page.getByText(/other payment options/i).click();
    await this.page.getByRole('button', { name: /add new card/i }).click();
    await this.page.getByRole('textbox', { name: 'Name' }).fill(c.name);
    await this.page.getByRole('spinbutton', { name: 'Card Number' }).fill(c.number);
    await this.page.getByLabel('Expiry Month').selectOption(c.expiryMonth);
    await this.page.getByLabel('Expiry Year').selectOption(c.expiryYear);
    await this.page.getByRole('button', { name: 'Submit' }).click();
  }

  async selectCard(c: Card) {
    await this.page.getByRole('row').filter({ hasText: c.name }).getByRole('radio').check();
    await this.page.getByRole('button', { name: 'Proceed to review' }).click();
  }

  async placeOrder() {
    await this.page.getByRole('button', { name: 'Complete your purchase' }).click();
  }

  

  
}