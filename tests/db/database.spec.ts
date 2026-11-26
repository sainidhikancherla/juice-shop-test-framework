import { test, expect } from '@playwright/test';
import {
  registerUser,
  loginViaApi,
  addToBasket,
  removeBasketItem,
  findProductId,
} from '../../utils/api';
import { query } from '../../utils/db';
import { products } from '../../utils/testData';

const PRODUCT = products.default.name;

type BasketItemRow = { id: number; ProductId: number; quantity: number };

function basketItemsForUser(userId: number) {
  return query<BasketItemRow>(
    `SELECT bi.id, bi.ProductId, bi.quantity
       FROM BasketItems bi
       JOIN Baskets b ON b.id = bi.BasketId
      WHERE b.UserId = ?`,
    [userId],
  );
}

test.describe('Database checks', () => {
  test('DB-01: registered user is stored in the Users table @smoke', async ({ request }) => {
    const user = await registerUser(request);

    await expect
      .poll(() => query<{ id: number }>('SELECT id FROM Users WHERE email = ?', [user.email]).length)
      .toBe(1);

    const rows = query<{ id: number }>('SELECT id FROM Users WHERE email = ?', [user.email]);
    expect(rows[0].id).toBe(user.id);
  });

  test('DB-02: item added through the API is stored in BasketItems @smoke', async ({ request }) => {
    const user = await registerUser(request);
    const { token, basketId } = await loginViaApi(request, user.email, user.password);
    const productId = await findProductId(request, PRODUCT);
    const { itemId } = await addToBasket(request, token, basketId, productId, 2);

    await expect.poll(() => basketItemsForUser(user.id).length).toBe(1);

    const [row] = basketItemsForUser(user.id);
    expect(row.id).toBe(itemId);
    expect(row.ProductId).toBe(productId);
    expect(row.quantity).toBe(2);
  });

  test('DB-03: item removed through the API is deleted from BasketItems @regression', async ({ request }) => {
    const user = await registerUser(request);
    const { token, basketId } = await loginViaApi(request, user.email, user.password);
    const productId = await findProductId(request, PRODUCT);
    const { itemId } = await addToBasket(request, token, basketId, productId, 1);
    await expect.poll(() => basketItemsForUser(user.id).length).toBe(1);

    await removeBasketItem(request, token, itemId);

    await expect.poll(() => basketItemsForUser(user.id).length).toBe(0);
  });

  test('DB-04: login gives the user one empty basket @regression', async ({ request }) => {
    const user = await registerUser(request);
    const { basketId } = await loginViaApi(request, user.email, user.password);

    const baskets = query<{ id: number }>('SELECT id FROM Baskets WHERE UserId = ?', [user.id]);
    expect(baskets).toHaveLength(1);
    expect(baskets[0].id).toBe(basketId);
    expect(basketItemsForUser(user.id)).toHaveLength(0);
  });
});