import { expect, Page } from '@playwright/test';
import { LoginPage } from '@root/PageObjectModel/Login.page';
import ActionUtils from '@root/Utilities/ActionUtils';
import { env, urlFor } from '@root/Utilities/config/env.config';
import { loginMessages } from '@root/Utilities/testData/messages.data';

/**
 * Helper = small, reusable steps and checks for ONE feature (here: login / logout).
 * Helpers use the page object to find elements and ActionUtils to act on them.
 * Actions (the next layer up) chain several helper steps into a full test scenario.
 */
export class LoginHelper {
  private loginPage: LoginPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.loginPage = new LoginPage(page);
    this.runner = new ActionUtils(page);
  }

  // ---------- steps ----------

  /** Opens the home page and waits until the shop logo is visible. */
  async NavigateToTheLandingPage(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor());
    await expect(this.loginPage.headerLogo).toBeVisible();
  }

  /** Clicks "Log in" in the header and checks that the login form is shown. */
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

  /** Types the e-mail and password; ticks "Remember me" only when `rememberMe` is true. */
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

  /** Clicks the "Log in" button of the form. */
  async SubmitLogin(): Promise<void> {
    await this.runner.ClickElement(this.loginPage.LoginFeature.loginSubmitButton);
  }

  /** Full login in one call: open the login page, enter the credentials, submit. */
  async LoginWithCredentials(
    email: string,
    password: string,
    rememberMe: boolean = false,
  ): Promise<void> {
    await this.OpenLoginPage();
    await this.EnterCredentials(email, password, rememberMe);
    await this.SubmitLogin();
  }

  /** Clicks "Log out" and checks that the user is really logged out. */
  async Logout(): Promise<void> {
    await this.runner.ClickElement(this.loginPage.headerLinks.logoutButton);
    await this.AssertUserIsLoggedOut();
  }

  /** Opens the "Forgot password?" page from the login page. */
  async OpenForgotPasswordPage(): Promise<void> {
    await this.runner.ClickElement(this.loginPage.LoginFeature.forgotPasswordLink);
    await this.runner.AssertUrlMatches(/passwordrecovery/i);
  }

  // ---------- assertions ----------

  /** The header shows the user's e-mail and a "Log out" link. */
  async AssertUserIsLoggedIn(email: string): Promise<void> {
    await this.runner.verifyElementText(this.loginPage.headerLinks.accountLink, email);
    await this.runner.AssertElementVisible(this.loginPage.headerLinks.logoutButton);
  }

  /** The header shows "Log in" and no "Log out" link. */
  async AssertUserIsLoggedOut(): Promise<void> {
    await this.runner.AssertElementVisible(this.loginPage.LoginFeature.loginButton);
    await this.runner.AssertElementNotVisible(this.loginPage.headerLinks.logoutButton);
  }

  /** Error for an e-mail that has no account: "Login was unsuccessful ... No customer account found". */
  async AssertInvalidCredentialsError(): Promise<void> {
    const summary = this.loginPage.errorMessages.wrongEmailOrPasswordError;
    await this.runner.AssertElementVisible(summary);
    await this.runner.AssertElementContainsText(summary, loginMessages.unsuccessful);
    await this.runner.AssertElementContainsText(summary, loginMessages.noAccount);
  }

  /** Error for a known e-mail with a wrong password: "... The credentials provided are incorrect". */
  async AssertIncorrectPasswordError(): Promise<void> {
    const summary = this.loginPage.errorMessages.wrongEmailOrPasswordError;
    await this.runner.AssertElementVisible(summary);
    await this.runner.AssertElementContainsText(summary, loginMessages.unsuccessful);
    await this.runner.AssertElementContainsText(summary, loginMessages.incorrectCredentials);
  }

  /** Empty submit is blocked client-side (field error) or rejected server-side (summary error). */
  async AssertEmptyLoginRejected(): Promise<void> {
    // `.or(...)` accepts whichever of the two error boxes appears; `.filter` ignores empty ones.
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

  /** The "Remember me" checkbox is shown on the login form. */
  async AssertRememberMeCheckboxVisible(): Promise<void> {
    await this.runner.AssertElementVisible(this.loginPage.LoginFeature.rememberMeCheckbox);
  }

  /** "Remember me" => persistent auth cookie (has an expiry date); otherwise a session cookie. */
  async AssertAuthCookiePersistence(persistent: boolean): Promise<void> {
    await this.runner.AssertElementVisible(this.loginPage.headerLinks.logoutButton);
    const cookies = await this.runner.GetCookies();
    // The site's login cookie has "authentication" in its name.
    const authCookies = cookies.filter((cookie) => /authentication/i.test(cookie.name));
    expect(authCookies.length, 'authentication cookie should exist after login').toBeGreaterThan(0);

    const nowInSeconds = Date.now() / 1000;
    for (const cookie of authCookies) {
      if (persistent) {
        // A persistent cookie expires in the future.
        expect(cookie.expires, `${cookie.name} should be persistent`).toBeGreaterThan(nowInSeconds);
      } else {
        // A session cookie has no expiry date (Playwright reports -1) and dies with the browser.
        expect(cookie.expires, `${cookie.name} should be a session cookie`).toBeLessThanOrEqual(0);
      }
    }
  }
}
