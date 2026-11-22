import { test, expect } from '@playwright/test';
import { registerUser, loginViaApi, addToBasket, removeBasketItem, getBasket } from '../utils/api';

test.describe('Basket API', () => {
  test('logged-in user can add a product to the basket @smoke', async ({ request }) => {
    const user = await registerUser(request);
    const { token, basketId } = await loginViaApi(request, user.email, user.password);

    const { body } = await addToBasket(request, token, basketId, 6, 1);

    expect(body.status).toBe('success');
    expect(body.data.ProductId).toBe(6);
    expect(body.data.quantity).toBe(1);
  });

  test('adding to the basket without logging in is rejected @regression', async ({ request }) => {
    const response = await request.post('/api/BasketItems/', {
      data: { ProductId: 6, BasketId: '6', quantity: 1 },
    });
    expect(response.status()).toBe(401);
  });
});


test('user can add and then remove a basket item @regression', async ({ request }) => {
  const user = await registerUser(request);
  const { token, basketId } = await loginViaApi(request, user.email, user.password);

  const { itemId } = await addToBasket(request, token, basketId, 6, 1);
  const response = await removeBasketItem(request, token, itemId);

  const body = await response.json();
  expect(body.status).toBe('success');
});

test('added product appears in the basket with the right quantity @smoke', async ({ request }) => {
  const user = await registerUser(request);
  const { token, basketId } = await loginViaApi(request, user.email, user.password);

  const { itemId } = await addToBasket(request, token, basketId, 6, 2);
  const basket = await getBasket(request, token, basketId);

  expect(basket.Products).toHaveLength(1);
  expect(basket.Products[0].id).toBe(6);
  expect(basket.Products[0].BasketItem.id).toBe(itemId);
  expect(basket.Products[0].BasketItem.quantity).toBe(2);
});

test('basket is empty after removing the only item @regression', async ({ request }) => {
  const user = await registerUser(request);
  const { token, basketId } = await loginViaApi(request, user.email, user.password);

  const { itemId } = await addToBasket(request, token, basketId, 6, 1);
  await removeBasketItem(request, token, itemId);

  const basket = await getBasket(request, token, basketId);
  expect(basket.Products).toHaveLength(0);
});

test('a new user starts with an empty basket @regression', async ({ request }) => {
  const user = await registerUser(request);
  const { token, basketId } = await loginViaApi(request, user.email, user.password);

  const basket = await getBasket(request, token, basketId);
  expect(basket.Products).toHaveLength(0);
});