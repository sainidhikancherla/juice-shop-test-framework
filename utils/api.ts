
import { APIRequestContext, expect } from '@playwright/test';

export async function registerUser(request: APIRequestContext) {
  const email = `qa.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;
  const password = 'Test@12345';

  const response = await request.post('/api/Users/', {
    data: {
      email,
      password,
      passwordRepeat: password,
      securityAnswer: 'test',
      securityQuestion: {
        id: 10,
        question: 'Company you first work for as an adult?',
      },
    },
  });

  expect(response.status(), 'user registration should return 201').toBe(201);
  const body = await response.json();

  return { id: body.data.id, email, password };
}

export async function loginViaApi(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<{ token: string; basketId: number }> {
  const response = await request.post('/rest/user/login', {
    data: { email, password },
  });
  expect(response.status(), 'user login should return 200').toBe(200);

  const body = await response.json();
  return {
    token: body.authentication.token,
    basketId: body.authentication.bid,
  };
}

export async function addToBasket(
  request: APIRequestContext,
  token: string,
  basketId: number,
  productId: number,
  quantity = 1,
) {
  const response = await request.post('/api/BasketItems/', {
    headers: { Authorization: `Bearer ${token}` },
    data: { ProductId: productId, BasketId: String(basketId), quantity },
  });
  expect(response.status(), 'adding to basket should return 200').toBe(200);

  const body = await response.json();
  return { itemId: body.data.id as number, body };
}
export async function getProduct(request: APIRequestContext, productId: number) {
  const response = await request.get(`/api/Products/${productId}`);
  expect(response.status(), 'product lookup should return 200').toBe(200);
  const body = await response.json();
  return body.data as { id: number; name: string; price: number };
}

export async function removeBasketItem(
  request: APIRequestContext,
  token: string,
  itemId: number,
) {
  const response = await request.delete(`/api/BasketItems/${itemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.status(), 'removing a basket item should return 200').toBe(200);
  return response;
}

export async function getBasket(
  request: APIRequestContext,
  token: string,
  basketId: number,
) {
  const response = await request.get(`/rest/basket/${basketId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.status(), 'basket lookup should return 200').toBe(200);
  const body = await response.json();
  return body.data as {
    id: number;
    Products: Array<{
      id: number;
      name: string;
      price: number;
      BasketItem: { id: number; ProductId: number; BasketId: number; quantity: number };
    }>;
  };
}