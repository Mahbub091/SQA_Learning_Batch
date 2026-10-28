import { Page } from '@playwright/test';
import { LoginHelper } from '@root/Helper/Login.helper';
import { RegisterHelper } from '@root/Helper/Register.helper';
import { env } from '@root/config/env.config';
import { generateUser, UserData } from '@root/testData/user.data';

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

  async UserShouldSeeProperErrorDuringLoginWithInvalidCredentials(): Promise<void> {
    await this.loginHelper.NavigateToTheLandingPage();
    await this.loginHelper.NavigateToTheLoginPage();
    await this.loginHelper.AssertInvalidCredentialsError();
  }

  async UserShouldLoginWithValidCredentials(): Promise<void> {
    const user = await this.CreateRegisteredUserAndLogout();

    await this.loginHelper.LoginWithCredentials(user.email, user.password);
    await this.loginHelper.AssertUserIsLoggedIn(user.email);
  }

  async UserShouldSeeErrorWithWrongPassword(): Promise<void> {
    const user = await this.CreateRegisteredUserAndLogout();

    await this.loginHelper.LoginWithCredentials(user.email, env.WRONG_PASSWORD);
    await this.loginHelper.AssertIncorrectPasswordError();
    await this.loginHelper.AssertUserIsLoggedOut();
  }

  async UserShouldSeeErrorWithUnregisteredEmail(): Promise<void> {
    const unregistered = generateUser();

    await this.loginHelper.NavigateToTheLandingPage();
    await this.loginHelper.LoginWithCredentials(unregistered.email, env.USER_PASSWORD);
    await this.loginHelper.AssertInvalidCredentialsError();
    await this.loginHelper.AssertUserIsLoggedOut();
  }

  async UserShouldSeeErrorWithEmptyFields(): Promise<void> {
    await this.loginHelper.NavigateToTheLandingPage();
    await this.loginHelper.OpenLoginPage();
    await this.loginHelper.SubmitLogin();
    await this.loginHelper.AssertEmptyLoginRejected();
  }

  async UserShouldBeAbleToLogout(): Promise<void> {
    const user = await this.CreateRegisteredUserAndLogout();

    await this.loginHelper.LoginWithCredentials(user.email, user.password);
    await this.loginHelper.AssertUserIsLoggedIn(user.email);
    await this.loginHelper.Logout();
  }

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
