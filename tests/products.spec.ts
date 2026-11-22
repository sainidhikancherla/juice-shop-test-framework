import { test, expect } from '@playwright/test';
import { getProduct } from '../utils/api';

test('product details API returns the correct product @regression', async ({ request }) => {
  const product = await getProduct(request, 6);
  expect(product.id).toBe(6);
  expect(product.name).toContain('Banana Juice');
  expect(product.price).toBe(1.99);
});