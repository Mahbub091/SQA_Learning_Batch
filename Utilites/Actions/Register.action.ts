import { Page } from '@playwright/test';
import { LoginHelper } from '../Helper/Login.helper';
import { RegisterField, RegisterHelper } from '../Helper/Register.helper';
import { env } from '../config/env.config';
import { registrationMessages } from '../testData/messages.data';
import { generateUser } from '../testData/user.data';

type RequiredField = 'firstName' | 'lastName' | 'email' | 'password';

const requiredFieldErrors: Record<RequiredField, { field: RegisterField; message: RegExp }> = {
  firstName: { field: 'firstName', message: registrationMessages.firstNameRequired },
  lastName: { field: 'lastName', message: registrationMessages.lastNameRequired },
  email: { field: 'email', message: registrationMessages.emailRequired },
  password: { field: 'password', message: registrationMessages.passwordRequired },
};

export default class RegisterAction {
  private loginHelper: LoginHelper;
  private registerHelper: RegisterHelper;

  constructor(page: Page) {
    this.loginHelper = new LoginHelper(page);
    this.registerHelper = new RegisterHelper(page);
  }

  async UserShouldRegisterSuccessfullyAndBeLoggedIn(): Promise<void> {
    const user = generateUser();

    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertRegistrationCompleted();
    await this.registerHelper.ContinueAfterRegistration();
    await this.loginHelper.AssertUserIsLoggedIn(user.email);
  }

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

  async UserShouldSeeRequiredErrorForField(field: RequiredField): Promise<void> {
    const user = generateUser();
    const blank = { ...user, [field]: '' };

    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.OpenRegisterPage();
    await this.registerHelper.FillRegistrationForm(
      blank,
      field === 'password' ? '' : blank.password,
    );
    await this.registerHelper.SubmitRegistration();

    const expected = requiredFieldErrors[field];
    await this.registerHelper.AssertFieldError(expected.field, expected.message);
    await this.registerHelper.AssertStillOnRegisterPage();
  }

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

  async UserShouldSeeErrorForDuplicateEmail(): Promise<void> {
    const user = generateUser();

    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertRegistrationCompleted();
    await this.registerHelper.ContinueAfterRegistration();
    await this.loginHelper.Logout();

    const duplicate = generateUser({ email: user.email });
    await this.registerHelper.RegisterNewUser(duplicate);
    await this.registerHelper.AssertSummaryError(registrationMessages.duplicateEmail);
    await this.registerHelper.AssertStillOnRegisterPage();
  }

  async UserShouldSeeErrorForInvalidEmailFormat(): Promise<void> {
    const user = generateUser({ email: 'not-an-email' });

    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertFieldError('email', registrationMessages.wrongEmail);
    await this.registerHelper.AssertStillOnRegisterPage();
  }

  async UserShouldSeeErrorForTooShortPassword(): Promise<void> {
    const user = generateUser({ password: env.SHORT_PASSWORD });

    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertFieldError('password', registrationMessages.passwordTooShort);
    await this.registerHelper.AssertStillOnRegisterPage();
  }

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
