import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage.ts';
import { LoginPage } from '../../pages/LoginPage.ts';
import { registerUser } from '../../utils/api.ts';

test.describe('Login', () => {
  test('valid user can log in @smoke', async ({ page, request }) => {
    const user = await registerUser(request);
    await new HomePage(page).open();

    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(user.email, user.password);

    // Confirm what really changes after login (URL or a visible element)
    await expect(page).toHaveURL(/search/);
  });

  test('wrong password shows an error @regression', async ({ page, request }) => {
    const user = await registerUser(request);
    await new HomePage(page).open();

    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(user.email, 'WrongPassword1!');

    await expect(loginPage.errorMessage()).toBeVisible();
  });
});