import { test } from '../Utilities/fixtures/base.fixture';

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

  test(
    'confirms that instructions were sent for a registered email',
    { tag: ['@e2e'] },
    async ({ passwordRecoveryActions }) => {
      await passwordRecoveryActions.UserShouldSeeConfirmationForRegisteredEmail();
    },
  );
});
