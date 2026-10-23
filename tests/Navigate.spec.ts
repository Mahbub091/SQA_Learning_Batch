import { test } from '../Utilities/fixtures/base.fixture';
import dotenv from 'dotenv';
dotenv.config();

test.describe('Login Page Navigation', () => {
  test(
    'should navigate to the login page',
    {
      tag: ['@e2e', '@navigation'],
    },
    async ({ userLoginActions }) => {
      await userLoginActions.UserShouldSeeProperErrorDuringLoginWithInvalidCredentials();
    },
  );
});
