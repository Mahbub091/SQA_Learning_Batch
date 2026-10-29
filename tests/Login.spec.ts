import { test } from '../Utilities/fixtures/base.fixture';

test.describe('Login and logout', { tag: ['@auth', '@login'] }, () => {
  test(
    'logs in with valid credentials',
    { tag: ['@e2e', '@smoke'] },
    async ({ userLoginActions }) => {
      await userLoginActions.UserShouldLoginWithValidCredentials();
    },
  );

  test.describe('invalid login', () => {
    test(
      'shows an error for credentials that do not exist',
      { tag: ['@e2e', '@navigation'] },
      async ({ userLoginActions }) => {
        await userLoginActions.UserShouldSeeProperErrorDuringLoginWithInvalidCredentials();
      },
    );

    test('shows an error for a wrong password', async ({ userLoginActions }) => {
      await userLoginActions.UserShouldSeeErrorWithWrongPassword();
    });

    test('shows an error for an unregistered email', async ({ userLoginActions }) => {
      await userLoginActions.UserShouldSeeErrorWithUnregisteredEmail();
    });

    test('rejects empty fields', async ({ userLoginActions }) => {
      await userLoginActions.UserShouldSeeErrorWithEmptyFields();
    });
  });

  test('logs out', { tag: ['@e2e'] }, async ({ userLoginActions }) => {
    await userLoginActions.UserShouldBeAbleToLogout();
  });

  test.describe('remember me', () => {
    test('keeps a persistent session when checked', async ({ userLoginActions }) => {
      await userLoginActions.UserSessionShouldFollowRememberMeChoice(true);
    });

    test('uses a session-only login when unchecked', async ({ userLoginActions }) => {
      await userLoginActions.UserSessionShouldFollowRememberMeChoice(false);
    });
  });
});
