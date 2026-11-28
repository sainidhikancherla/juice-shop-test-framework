import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { readFileSync } from 'fs';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { BasketPage } from '../../pages/BasketPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { registerUser, loginViaApi, addToBasket, findProductId, getBasket } from '../../utils/api';
import { products } from '../../utils/testData';


const data = JSON.parse(readFileSync('test-data/checkout.json', 'utf-8'));
const PRODUCT = products.default.name;

async function openCheckoutAsNewUser(page: Page, request: APIRequestContext) {
  const user = await registerUser(request);
  const { token, basketId } = await loginViaApi(request, user.email, user.password);
  const productId = await findProductId(request, PRODUCT);
  await addToBasket(request, token, basketId, productId, 1);

  const home = new HomePage(page);
  const login = new LoginPage(page);
  const basket = new BasketPage(page);
  const checkout = new CheckoutPage(page);

  await home.open();
  await login.open();
  await login.login(user.email, user.password);
  await expect(page).toHaveURL(/search/);          // wait for the post-login redirect
  await basket.openBasket();
  await expect(basket.row(PRODUCT)).toBeVisible(); // wait until the basket really shows the item
  await checkout.startCheckout();
  return { user, token, basketId, checkout };
}
async function reachPaymentStep(page: Page, request: APIRequestContext) {
  const ctx = await openCheckoutAsNewUser(page, request);
  await ctx.checkout.addAddress(data.address);
  await ctx.checkout.selectAddress(data.address);
  await ctx.checkout.chooseDelivery(data.delivery);
  return ctx;
}


test.describe('Checkout', () => {
  test('CHK-01: user can complete an order with a new address and card @regression', async ({ page, request }) => {
    const { token, basketId, checkout } = await reachPaymentStep(page, request);

    await checkout.addCard(data.card);
    await checkout.selectCard(data.card);
    await checkout.placeOrder();

    await expect(page).toHaveURL(/order-completion/);

const basket = await getBasket(request, token, basketId);
expect(basket.Products, 'basket should be empty after the order').toHaveLength(0);
await expect(page.getByText(/Thank you for your purchase!/i)).toBeVisible();
  });
});

 test('CHK-02: address form cannot be submitted with an empty name @regression', async ({ page, request }) => {
  await openCheckoutAsNewUser(page, request);

  await page.getByRole('button', { name: 'Add New Address' }).click();
  await page.getByRole('textbox', { name: 'Country' }).fill(data.address.country);
  await page.getByRole('spinbutton', { name: 'Mobile Number' }).fill(data.address.mobile);
  await page.getByRole('textbox', { name: 'ZIP Code' }).fill(data.address.zip);
  await page.getByRole('textbox', { name: 'Address' }).fill(data.address.address);
  await page.getByRole('textbox', { name: 'City' }).fill(data.address.city);
  // Name is left empty on purpose
  await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
});

  test('CHK-03: cannot proceed to review without choosing a card @regression', async ({ page, request }) => {
    const { checkout } = await reachPaymentStep(page, request);
    await checkout.addCard(data.card); // card is added but not selected
    await expect(page.getByRole('button', { name: 'Proceed to review' })).toBeDisabled();
  });