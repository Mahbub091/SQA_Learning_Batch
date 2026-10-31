import { Page } from '@playwright/test';
import { LoginHelper } from '@root/Utilities/Helper/Login.helper';
import { PasswordRecoveryHelper } from '@root/Utilities/Helper/PasswordRecovery.helper';
import { RegisterHelper } from '@root/Utilities/Helper/Register.helper';
import { passwordRecoveryMessages } from '@root/Utilities/testData/messages.data';
import { generateUser } from '@root/Utilities/testData/user.data';

/**
 * Action = a complete test scenario, written as a chain of helper steps.
 * Method names read like a sentence ("User should ..."), so a spec stays one readable line.
 * This class covers the "Forgot password" scenarios.
 */
export default class PasswordRecoveryAction {
  private loginHelper: LoginHelper;
  private registerHelper: RegisterHelper;
  private recoveryHelper: PasswordRecoveryHelper;

  constructor(page: Page) {
    this.loginHelper = new LoginHelper(page);
    this.registerHelper = new RegisterHelper(page);
    this.recoveryHelper = new PasswordRecoveryHelper(page);
  }

  /** Precondition: home page -> Log in -> "Forgot password?" and the recovery page is loaded. */
  private async OpenPasswordRecovery(): Promise<void> {
    await this.loginHelper.NavigateToTheLandingPage();
    await this.loginHelper.OpenLoginPage();
    await this.loginHelper.OpenForgotPasswordPage();
    await this.recoveryHelper.AssertRecoveryPageLoaded();
  }

  /** Submitting an empty e-mail shows "Enter your email". */
  async UserShouldSeeValidationForEmptyEmail(): Promise<void> {
    await this.OpenPasswordRecovery();
    await this.recoveryHelper.SubmitEmail('');
    await this.recoveryHelper.AssertEmailFieldError(passwordRecoveryMessages.enterEmail);
  }

  /** Submitting text that is not an e-mail shows "Wrong email". */
  async UserShouldSeeValidationForInvalidEmailFormat(): Promise<void> {
    await this.OpenPasswordRecovery();
    await this.recoveryHelper.SubmitEmail('not-an-email');
    await this.recoveryHelper.AssertEmailFieldError(passwordRecoveryMessages.wrongEmail);
  }

  /** Submitting a well-formed e-mail that has no account shows "Email not found". */
  async UserShouldSeeMessageForUnregisteredEmail(): Promise<void> {
    const unregistered = generateUser();

    await this.OpenPasswordRecovery();
    await this.recoveryHelper.SubmitEmail(unregistered.email);
    await this.recoveryHelper.AssertResultMessage(passwordRecoveryMessages.emailNotFound);
  }

  /** For a registered e-mail the site confirms that recovery instructions were sent. */
  async UserShouldSeeConfirmationForRegisteredEmail(): Promise<void> {
    const user = generateUser();

    // Precondition: create an account, then log out.
    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertRegistrationCompleted();
    await this.registerHelper.ContinueAfterRegistration();
    await this.loginHelper.Logout();

    // Ask for a password recovery with that account's e-mail.
    await this.loginHelper.OpenLoginPage();
    await this.loginHelper.OpenForgotPasswordPage();
    await this.recoveryHelper.AssertRecoveryPageLoaded();
    await this.recoveryHelper.SubmitEmail(user.email);
    await this.recoveryHelper.AssertResultMessage(passwordRecoveryMessages.emailSent);
  }
}
