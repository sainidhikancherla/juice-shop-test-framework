import { test, expect } from '@playwright/test';
import { loginViaApi, registerUser } from '../../utils/api';

test('registering a new user succeeds @smoke', async ({ request }) => {
  const user = await registerUser(request);
  expect(user.id).toBeGreaterThan(0);
});

test('whoami returns the logged-in user @regression', async ({ request }) => {
  const user = await registerUser(request);
  const { token } = await loginViaApi(request, user.email, user.password);

  const response = await request.get('/rest/user/whoami', {
    params: { fields: 'email' },
    headers: { Cookie: `token=${token}` },
  });
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.user.email).toBe(user.email);
});