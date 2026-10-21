import { test, expect } from '@playwright/test';
import { LoginPage } from '../../PageObjectModel/Login.page';
import ActionUtils from '../../Utilities/ActionUtils';
import dotenv from 'dotenv';
dotenv.config();
import { LoginHelper } from '../../Utilities/Helper/Login.Helper';

test.describe('Login Page Navigation', () => {
  test(
    'should navigate to the login page',
    {
      tag: ['@e2e', '@navigation'],
    },
    async ({ page }) => {
      const loginHelper = new LoginHelper(page);
      await loginHelper.NavigateToTheLandingPage();
    },
  );
});
