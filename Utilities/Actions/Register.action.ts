import { Page } from '@playwright/test';
import { LoginHelper } from '@root/Utilities/Helper/Login.helper';
import { RegisterField, RegisterHelper } from '@root/Utilities/Helper/Register.helper';
import { env } from '@root/Utilities/config/env.config';
import { registrationMessages } from '@root/Utilities/testData/messages.data';
import { generateUser } from '@root/Utilities/testData/user.data';

/** The fields that must not be left empty on the registration form. */
type RequiredField = 'firstName' | 'lastName' | 'email' | 'password';

/**
 * For every required field: which field shows the error, and which message it must contain.
 * (The message texts come from `Data/StaticData.json` through `messages.data.ts`.)
 */
const requiredFieldErrors: Record<RequiredField, { field: RegisterField; message: RegExp }> = {
  firstName: { field: 'firstName', message: registrationMessages.firstNameRequired },
  lastName: { field: 'lastName', message: registrationMessages.lastNameRequired },
  email: { field: 'email', message: registrationMessages.emailRequired },
  password: { field: 'password', message: registrationMessages.passwordRequired },
};

/**
 * Action = a complete test scenario, written as a chain of helper steps.
 * Method names read like a sentence ("User should ..."), so a spec stays one readable line.
 * This class covers the Registration scenarios.
 */
export default class RegisterAction {
  private loginHelper: LoginHelper;
  private registerHelper: RegisterHelper;

  constructor(page: Page) {
    this.loginHelper = new LoginHelper(page);
    this.registerHelper = new RegisterHelper(page);
  }

  // ---------- happy paths ----------

  /** Registering with valid data succeeds and logs the new user in automatically. */
  async UserShouldRegisterSuccessfullyAndBeLoggedIn(): Promise<void> {
    const user = generateUser();

    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertRegistrationCompleted();
    await this.registerHelper.ContinueAfterRegistration();
    await this.loginHelper.AssertUserIsLoggedIn(user.email);
  }

  /** After registering, the user can log out and log in again with the same account. */
  async UserShouldBeAbleToRegisterLogoutAndLoginAgain(): Promise<void> {
    const user = generateUser();

    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertRegistrationCompleted();
    await this.registerHelper.ContinueAfterRegistration();

    await this.loginHelper.Logout();
    await this.loginHelper.LoginWithCredentials(user.email, user.password);
    await this.loginHelper.AssertUserIsLoggedIn(user.email);
  }

  // ---------- validation errors ----------

  /** Leaving ONE required field empty shows that field's "... is required" error. */
  async UserShouldSeeRequiredErrorForField(field: RequiredField): Promise<void> {
    const user = generateUser();
    // Same valid user, but with the chosen field blanked out.
    const blank = { ...user, [field]: '' };

    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.OpenRegisterPage();
    // When the password is blank, the confirm-password is blank too (so only one thing is wrong).
    await this.registerHelper.FillRegistrationForm(
      blank,
      field === 'password' ? '' : blank.password,
    );
    await this.registerHelper.SubmitRegistration();

    const expected = requiredFieldErrors[field];
    await this.registerHelper.AssertFieldError(expected.field, expected.message);
    await this.registerHelper.AssertStillOnRegisterPage();
  }

  /** Submitting a completely empty form shows every required-field error at once. */
  async UserShouldSeeAllRequiredErrorsOnEmptyForm(): Promise<void> {
    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.OpenRegisterPage();
    await this.registerHelper.SubmitRegistration();

    await this.registerHelper.AssertFieldError('firstName', registrationMessages.firstNameRequired);
    await this.registerHelper.AssertFieldError('lastName', registrationMessages.lastNameRequired);
    await this.registerHelper.AssertFieldError('email', registrationMessages.emailRequired);
    await this.registerHelper.AssertFieldError('password', registrationMessages.passwordRequired);
    await this.registerHelper.AssertFieldError(
      'confirmPassword',
      registrationMessages.passwordRequired,
    );
    await this.registerHelper.AssertStillOnRegisterPage();
  }

  /** Registering the same e-mail twice is rejected with "The specified email already exists". */
  async UserShouldSeeErrorForDuplicateEmail(): Promise<void> {
    const user = generateUser();

    // First registration (works) ...
    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertRegistrationCompleted();
    await this.registerHelper.ContinueAfterRegistration();
    await this.loginHelper.Logout();

    // ... second registration with the same e-mail (rejected).
    const duplicate = generateUser({ email: user.email });
    await this.registerHelper.RegisterNewUser(duplicate);
    await this.registerHelper.AssertSummaryError(registrationMessages.duplicateEmail);
    await this.registerHelper.AssertStillOnRegisterPage();
  }

  /** An e-mail without the right format is rejected ("Wrong email"). */
  async UserShouldSeeErrorForInvalidEmailFormat(): Promise<void> {
    const user = generateUser({ email: 'not-an-email' });

    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertFieldError('email', registrationMessages.wrongEmail);
    await this.registerHelper.AssertStillOnRegisterPage();
  }

  /** A password shorter than 6 characters is rejected. */
  async UserShouldSeeErrorForTooShortPassword(): Promise<void> {
    const user = generateUser({ password: env.SHORT_PASSWORD });

    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertFieldError('password', registrationMessages.passwordTooShort);
    await this.registerHelper.AssertStillOnRegisterPage();
  }

  /** A confirm-password that differs from the password is rejected. */
  async UserShouldSeeErrorWhenPasswordsDoNotMatch(): Promise<void> {
    const user = generateUser();

    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user, env.MISMATCH_PASSWORD);
    await this.registerHelper.AssertFieldError(
      'confirmPassword',
      registrationMessages.passwordMismatch,
    );
    await this.registerHelper.AssertStillOnRegisterPage();
  }
}
