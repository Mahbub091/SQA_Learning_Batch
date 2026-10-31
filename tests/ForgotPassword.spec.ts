import { test } from '@root/Utilities/fixtures/base.fixture';

// Tags (e.g. @auth) let you run a group: `npx playwright test --grep @forgot-password`.
test.describe('Forgot password', { tag: ['@auth', '@forgot-password'] }, () => {
  test('requires an email address', async ({ passwordRecoveryActions }) => {
    await passwordRecoveryActions.UserShouldSeeValidationForEmptyEmail();
  });

  test('rejects an invalid email format', async ({ passwordRecoveryActions }) => {
    await passwordRecoveryActions.UserShouldSeeValidationForInvalidEmailFormat();
  });

  test('tells the user when the email is not registered', async ({ passwordRecoveryActions }) => {
    await passwordRecoveryActions.UserShouldSeeMessageForUnregisteredEmail();
  });

  // @e2e = a longer end-to-end flow (registers a user first).
  test(
    'confirms that instructions were sent for a registered email',
    { tag: ['@e2e'] },
    async ({ passwordRecoveryActions }) => {
      await passwordRecoveryActions.UserShouldSeeConfirmationForRegisteredEmail();
    },
  );
});
