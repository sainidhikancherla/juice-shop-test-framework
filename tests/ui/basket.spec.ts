import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { BasketPage } from '../../pages/BasketPage';
import { registerUser, loginViaApi, getBasket } from '../../utils/api';
import { products } from '../../utils/testData';

const PRODUCT = products.default.name;

test.describe('Basket UI', () => {
  test('UI-04: added product shows in the basket count and API basket @smoke', async ({ page, request }) => {
    const user = await registerUser(request);
    const { token, basketId } = await loginViaApi(request, user.email, user.password);

    const home = new HomePage(page);
    const login = new LoginPage(page);
    const basketPage = new BasketPage(page);
    await home.open();
    await login.open();
    await login.login(user.email, user.password);

    await home.addToBasket(PRODUCT);
    await expect(basketPage.cartButton()).toContainText('1');

    const basket = await getBasket(request, token, basketId);
    expect(basket.Products).toHaveLength(1);
    expect(basket.Products[0].name).toBe(PRODUCT);
  });

  test('UI-05: removed product disappears from the basket @regression', async ({ page, request }) => {
    const user = await registerUser(request);
    const { token, basketId } = await loginViaApi(request, user.email, user.password);

    const home = new HomePage(page);
    const login = new LoginPage(page);
    const basketPage = new BasketPage(page);
    await home.open();
    await login.open();
    await login.login(user.email, user.password);

    await home.addToBasket(PRODUCT);
    await basketPage.openBasket();
    await expect(basketPage.row(PRODUCT)).toBeVisible();

    await basketPage.remove(PRODUCT);
    await expect(basketPage.row(PRODUCT)).toHaveCount(0);

    const basket = await getBasket(request, token, basketId);
    expect(basket.Products).toHaveLength(0);
  });

  test('UI-06: increasing quantity updates the row, basket API, and total @smoke', async ({ page, request }) => {
    const user = await registerUser(request);
    const { token, basketId } = await loginViaApi(request, user.email, user.password);

    const home = new HomePage(page);
    const login = new LoginPage(page);
    const basketPage = new BasketPage(page);
    await home.open();
    await login.open();
    await login.login(user.email, user.password);

    await home.addToBasket(PRODUCT);
    await basketPage.openBasket();
    await expect(basketPage.row(PRODUCT)).toBeVisible();

    const unitPriceText = await basketPage.unitPrice(PRODUCT).innerText();
    const unitPrice = Number(unitPriceText.replace(/[^0-9.]/g, ''));

    await basketPage.increaseQuantity(PRODUCT);
    await expect(basketPage.quantity(PRODUCT)).toHaveText('2');

    const basket = await getBasket(request, token, basketId);
    expect(basket.Products).toHaveLength(1);
    expect(basket.Products[0].name).toBe(PRODUCT);
    expect(basket.Products[0].BasketItem.quantity).toBe(2);

    const expectedTotal = unitPrice * 2;
    await expect(basketPage.totalPrice()).toContainText(expectedTotal.toFixed(2));
  });
});