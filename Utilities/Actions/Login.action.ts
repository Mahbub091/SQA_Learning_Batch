import { Page } from '@playwright/test';
import { LoginHelper } from '@root/Utilities/Helper/Login.helper';
import { RegisterHelper } from '@root/Utilities/Helper/Register.helper';
import { env } from '@root/Utilities/config/env.config';
import { generateUser, UserData } from '@root/Utilities/testData/user.data';

/**
 * Action = a complete test scenario, written as a chain of helper steps.
 * Method names read like a sentence ("User should ..."), so a spec stays one readable line.
 * This class covers the Login / Logout scenarios.
 */
export default class LoginAction {
  private loginHelper: LoginHelper;
  private registerHelper: RegisterHelper;

  constructor(page: Page) {
    this.loginHelper = new LoginHelper(page);
    this.registerHelper = new RegisterHelper(page);
  }

  /** Precondition: creates a fresh account and leaves the browser logged out on the home page. */
  private async CreateRegisteredUserAndLogout(): Promise<UserData> {
    const user = generateUser();
    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertRegistrationCompleted();
    await this.registerHelper.ContinueAfterRegistration();
    await this.loginHelper.Logout();
    return user;
  }

  /** Logging in with the (non-existing) account from .env shows the "no account" error. */
  async UserShouldSeeProperErrorDuringLoginWithInvalidCredentials(): Promise<void> {
    await this.loginHelper.NavigateToTheLandingPage();
    await this.loginHelper.NavigateToTheLoginPage();
    await this.loginHelper.AssertInvalidCredentialsError();
  }

  /** A newly registered user can log in again and is shown as logged in. */
  async UserShouldLoginWithValidCredentials(): Promise<void> {
    const user = await this.CreateRegisteredUserAndLogout();

    await this.loginHelper.LoginWithCredentials(user.email, user.password);
    await this.loginHelper.AssertUserIsLoggedIn(user.email);
  }

  /** A real e-mail with a wrong password is rejected ("credentials provided are incorrect"). */
  async UserShouldSeeErrorWithWrongPassword(): Promise<void> {
    const user = await this.CreateRegisteredUserAndLogout();

    await this.loginHelper.LoginWithCredentials(user.email, env.WRONG_PASSWORD);
    await this.loginHelper.AssertIncorrectPasswordError();
    await this.loginHelper.AssertUserIsLoggedOut();
  }

  /** An e-mail that was never registered is rejected ("no customer account found"). */
  async UserShouldSeeErrorWithUnregisteredEmail(): Promise<void> {
    const unregistered = generateUser();

    await this.loginHelper.NavigateToTheLandingPage();
    await this.loginHelper.LoginWithCredentials(unregistered.email, env.USER_PASSWORD);
    await this.loginHelper.AssertInvalidCredentialsError();
    await this.loginHelper.AssertUserIsLoggedOut();
  }

  /** Submitting the login form with empty fields is rejected. */
  async UserShouldSeeErrorWithEmptyFields(): Promise<void> {
    await this.loginHelper.NavigateToTheLandingPage();
    await this.loginHelper.OpenLoginPage();
    await this.loginHelper.SubmitLogin();
    await this.loginHelper.AssertEmptyLoginRejected();
  }

  /** A logged-in user can log out. */
  async UserShouldBeAbleToLogout(): Promise<void> {
    const user = await this.CreateRegisteredUserAndLogout();

    await this.loginHelper.LoginWithCredentials(user.email, user.password);
    await this.loginHelper.AssertUserIsLoggedIn(user.email);
    await this.loginHelper.Logout();
  }

  /**
   * "Remember me" ticked   => the login cookie is persistent (has an expiry date).
   * "Remember me" unticked => the login cookie is a session cookie.
   */
  async UserSessionShouldFollowRememberMeChoice(rememberMe: boolean): Promise<void> {
    const user = await this.CreateRegisteredUserAndLogout();

    await this.loginHelper.OpenLoginPage();
    await this.loginHelper.AssertRememberMeCheckboxVisible();
    await this.loginHelper.EnterCredentials(user.email, user.password, rememberMe);
    await this.loginHelper.SubmitLogin();

    await this.loginHelper.AssertUserIsLoggedIn(user.email);
    await this.loginHelper.AssertAuthCookiePersistence(rememberMe);
  }
}
