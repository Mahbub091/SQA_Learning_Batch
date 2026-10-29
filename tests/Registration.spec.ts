import { test } from '../Utilities/fixtures/base.fixture';

test.describe('Registration', { tag: ['@auth', '@registration'] }, () => {
  test(
    'registers with valid data, shows the success message and logs the user in',
    { tag: ['@e2e', '@smoke'] },
    async ({ userRegisterActions }) => {
      await userRegisterActions.UserShouldRegisterSuccessfullyAndBeLoggedIn();
    },
  );

  test(
    'registers, logs out and logs in again',
    { tag: ['@e2e'] },
    async ({ userRegisterActions }) => {
      await userRegisterActions.UserShouldBeAbleToRegisterLogoutAndLoginAgain();
    },
  );

  test.describe('required-field validation', () => {
    for (const field of ['firstName', 'lastName', 'email', 'password'] as const) {
      test(`shows an error when ${field} is empty`, async ({ userRegisterActions }) => {
        await userRegisterActions.UserShouldSeeRequiredErrorForField(field);
      });
    }

    test('shows every required error on an empty form', async ({ userRegisterActions }) => {
      await userRegisterActions.UserShouldSeeAllRequiredErrorsOnEmptyForm();
    });
  });

  test.describe('invalid data', () => {
    test('rejects an already registered email', async ({ userRegisterActions }) => {
      await userRegisterActions.UserShouldSeeErrorForDuplicateEmail();
    });

    test('rejects an invalid email format', async ({ userRegisterActions }) => {
      await userRegisterActions.UserShouldSeeErrorForInvalidEmailFormat();
    });

    test('rejects a password shorter than 6 characters', async ({ userRegisterActions }) => {
      await userRegisterActions.UserShouldSeeErrorForTooShortPassword();
    });

    test('rejects mismatching password and confirm password', async ({ userRegisterActions }) => {
      await userRegisterActions.UserShouldSeeErrorWhenPasswordsDoNotMatch();
    });
  });
});
