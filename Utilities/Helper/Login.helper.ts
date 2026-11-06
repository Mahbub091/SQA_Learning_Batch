import { expect, Page } from '@playwright/test';
import { LoginPage } from '../../PageObjectModel/Login.page';
import ActionUtils from '../ActionUtils';
import { env, urlFor } from '../config/env.config';
import { loginMessages } from '../testData/messages.data';

export class LoginHelper {
  private loginPage: LoginPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.loginPage = new LoginPage(page);
    this.runner = new ActionUtils(page);
  }

  async NavigateToTheLandingPage(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor());
    await expect(this.loginPage.headerLogo).toBeVisible();
  }

  async OpenLoginPage(): Promise<void> {
    await this.runner.ClickElement(this.loginPage.LoginFeature.loginButton);
    await this.runner.AssertElementVisible(this.loginPage.LoginFeature.emailInput);
    await this.runner.AssertElementVisible(this.loginPage.LoginFeature.passwordInput);
    await this.runner.AssertElementVisible(this.loginPage.LoginFeature.loginSubmitButton);
  }

  /** Kept for the original spec: opens the login page and submits the credentials from .env. */
  async NavigateToTheLoginPage(): Promise<void> {
    await this.OpenLoginPage();
    await this.EnterCredentials(env.USER_EMAIL, env.USER_PASSWORD);
    await this.SubmitLogin();
  }

  async EnterCredentials(
    email: string,
    password: string,
    rememberMe: boolean = false,
  ): Promise<void> {
    await this.runner.TypeText(this.loginPage.LoginFeature.emailInput, email);
    await this.runner.TypeText(this.loginPage.LoginFeature.passwordInput, password);
    if (rememberMe) {
      await this.runner.CheckElement(this.loginPage.LoginFeature.rememberMeCheckbox);
    }
  }

  async SubmitLogin(): Promise<void> {
    await this.runner.ClickElement(this.loginPage.LoginFeature.loginSubmitButton);
  }

  async LoginWithCredentials(
    email: string,
    password: string,
    rememberMe: boolean = false,
  ): Promise<void> {
    await this.OpenLoginPage();
    await this.EnterCredentials(email, password, rememberMe);
    await this.SubmitLogin();
  }

  async Logout(): Promise<void> {
    await this.runner.ClickElement(this.loginPage.headerLinks.logoutButton);
    await this.AssertUserIsLoggedOut();
  }

  async AssertUserIsLoggedIn(email: string): Promise<void> {
    await this.runner.verifyElementText(this.loginPage.headerLinks.accountLink, email);
    await this.runner.AssertElementVisible(this.loginPage.headerLinks.logoutButton);
  }

  async AssertUserIsLoggedOut(): Promise<void> {
    await this.runner.AssertElementVisible(this.loginPage.LoginFeature.loginButton);
    await this.runner.AssertElementNotVisible(this.loginPage.headerLinks.logoutButton);
  }

  async AssertInvalidCredentialsError(): Promise<void> {
    const summary = this.loginPage.errorMessages.wrongEmailOrPasswordError;
    await this.runner.AssertElementVisible(summary);
    await this.runner.AssertElementContainsText(summary, loginMessages.unsuccessful);
    await this.runner.AssertElementContainsText(summary, loginMessages.noAccount);
  }

  async AssertIncorrectPasswordError(): Promise<void> {
    const summary = this.loginPage.errorMessages.wrongEmailOrPasswordError;
    await this.runner.AssertElementVisible(summary);
    await this.runner.AssertElementContainsText(summary, loginMessages.unsuccessful);
    await this.runner.AssertElementContainsText(summary, loginMessages.incorrectCredentials);
  }

  /** Empty submit is blocked client-side (field error) or rejected server-side (summary error). */
  async AssertEmptyLoginRejected(): Promise<void> {
    const anyError = this.loginPage.errorMessages.emailFieldError
      .or(this.loginPage.errorMessages.wrongEmailOrPasswordError)
      .filter({ hasText: /\S/ })
      .first();
    await expect(anyError).toBeVisible();
    await expect(anyError).toContainText(
      new RegExp(`${loginMessages.emailRequired.source}|${loginMessages.unsuccessful.source}`, 'i'),
    );
    await this.runner.AssertElementNotVisible(this.loginPage.headerLinks.logoutButton);
  }

  async AssertRememberMeCheckboxVisible(): Promise<void> {
    await this.runner.AssertElementVisible(this.loginPage.LoginFeature.rememberMeCheckbox);
  }

  /** "Remember me" => persistent auth cookie (has an expiry date); otherwise a session cookie. */
  async AssertAuthCookiePersistence(persistent: boolean): Promise<void> {
    await this.runner.AssertElementVisible(this.loginPage.headerLinks.logoutButton);
    const cookies = await this.runner.GetCookies();
    const authCookies = cookies.filter((cookie) => /authentication/i.test(cookie.name));
    expect(authCookies.length, 'authentication cookie should exist after login').toBeGreaterThan(0);

    const nowInSeconds = Date.now() / 1000;
    for (const cookie of authCookies) {
      if (persistent) {
        expect(cookie.expires, `${cookie.name} should be persistent`).toBeGreaterThan(nowInSeconds);
      } else {
        expect(cookie.expires, `${cookie.name} should be a session cookie`).toBeLessThanOrEqual(0);
      }
    }
  }

  async OpenForgotPasswordPage(): Promise<void> {
    await this.runner.ClickElement(this.loginPage.LoginFeature.forgotPasswordLink);
    await this.runner.AssertUrlMatches(/passwordrecovery/i);
  }
}
