import { Page } from '@playwright/test';
import { LoginHelper } from '../Helper/Login.helper';
import { PasswordRecoveryHelper } from '../Helper/PasswordRecovery.helper';
import { RegisterHelper } from '../Helper/Register.helper';
import { passwordRecoveryMessages } from '../testData/messages.data';
import { generateUser } from '../testData/user.data';

export default class PasswordRecoveryAction {
  private loginHelper: LoginHelper;
  private registerHelper: RegisterHelper;
  private recoveryHelper: PasswordRecoveryHelper;

  constructor(page: Page) {
    this.loginHelper = new LoginHelper(page);
    this.registerHelper = new RegisterHelper(page);
    this.recoveryHelper = new PasswordRecoveryHelper(page);
  }

  private async OpenPasswordRecovery(): Promise<void> {
    await this.loginHelper.NavigateToTheLandingPage();
    await this.loginHelper.OpenLoginPage();
    await this.loginHelper.OpenForgotPasswordPage();
    await this.recoveryHelper.AssertRecoveryPageLoaded();
  }

  async UserShouldSeeValidationForEmptyEmail(): Promise<void> {
    await this.OpenPasswordRecovery();
    await this.recoveryHelper.SubmitEmail('');
    await this.recoveryHelper.AssertEmailFieldError(passwordRecoveryMessages.enterEmail);
  }

  async UserShouldSeeValidationForInvalidEmailFormat(): Promise<void> {
    await this.OpenPasswordRecovery();
    await this.recoveryHelper.SubmitEmail('not-an-email');
    await this.recoveryHelper.AssertEmailFieldError(passwordRecoveryMessages.wrongEmail);
  }

  async UserShouldSeeMessageForUnregisteredEmail(): Promise<void> {
    const unregistered = generateUser();

    await this.OpenPasswordRecovery();
    await this.recoveryHelper.SubmitEmail(unregistered.email);
    await this.recoveryHelper.AssertResultMessage(passwordRecoveryMessages.emailNotFound);
  }

  async UserShouldSeeConfirmationForRegisteredEmail(): Promise<void> {
    const user = generateUser();

    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertRegistrationCompleted();
    await this.registerHelper.ContinueAfterRegistration();
    await this.loginHelper.Logout();

    await this.loginHelper.OpenLoginPage();
    await this.loginHelper.OpenForgotPasswordPage();
    await this.recoveryHelper.AssertRecoveryPageLoaded();
    await this.recoveryHelper.SubmitEmail(user.email);
    await this.recoveryHelper.AssertResultMessage(passwordRecoveryMessages.emailSent);
  }
}
