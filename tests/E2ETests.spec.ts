import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const email = faker.internet.email({ firstName, lastName, provider: 'example.com' });
const password = faker.internet.password({ length: 10 });

test.describe('Navigation', () => {
  test('Should navigate to the correct page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL('/');
    await expect(page).toHaveTitle('Demo Web Shop');
  });

  test('register, logout and login again', async ({ page }) => {
    await page.goto('/register');

    await page.locator('#gender-male').check();
    await page.locator('#FirstName').fill(firstName);
    await page.locator('#LastName').fill(lastName);
    await page.locator('#Email').fill(email);
    await page.locator('#Password').fill(password);
    await page.locator('#ConfirmPassword').fill(password);
    await page.locator('#register-button').click();

    await expect(page.getByText('Your registration completed')).toBeVisible();
    await page.locator('.register-continue-button').click();

    await page.getByText('Log out').click();
    await expect(page.getByText('Log in')).toBeVisible();

    await page.getByText('Log in').click();
    await page.locator('#Email').fill(email);
    await page.locator('#Password').fill(password);
    await page.locator('.login-button').click();

    await expect(page.locator('.header-links .account')).toHaveText(email);
    await expect(page.getByText('Log out')).toBeVisible();
  });
});