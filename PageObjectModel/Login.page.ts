import { Page, Locator } from '@playwright/test';

/**
 * Page object for the Login page and the login / logout links shown in the page header.
 * A page object only describes WHERE things are (locators); it never clicks or asserts.
 */
export class LoginPage {
  /** The shop logo; used to confirm that a page has finished loading. */
  readonly headerLogo: Locator;

  /** Everything needed to fill in and submit the login form. */
  readonly LoginFeature: {
    readonly loginButton: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly rememberMeCheckbox: Locator;
    readonly forgotPasswordLink: Locator;
    readonly loginSubmitButton: Locator;
  };

  /** Links in the page header that depend on whether a user is logged in. */
  readonly headerLinks: {
    readonly logoutButton: Locator;
    readonly accountLink: Locator;
  };

  /** Error texts shown after a failed login. */
  readonly errorMessages: {
    readonly wrongEmailOrPasswordError: Locator;
    readonly emailFieldError: Locator;
  };

  constructor(private page: Page) {
    this.headerLogo = this.page.locator(`css=img[alt='Tricentis Demo Web Shop']`);
    this.LoginFeature = {
      // The "Log in" link in the header (opens the login page).
      loginButton: this.page.locator(`css=.ico-login`),
      emailInput: this.page.locator(`css=input#Email`),
      passwordInput: this.page.locator(`css=input#Password`),
      rememberMeCheckbox: this.page.locator(`css=input#RememberMe`),
      forgotPasswordLink: this.page.locator(`css=.forgot-password a`),
      // The "Log in" button inside the form (submits it).
      loginSubmitButton: this.page.locator(`css=input[value='Log in']`),
    };

    this.headerLinks = {
      logoutButton: this.page.locator(`css=.ico-logout`),
      // Shows the logged-in user's e-mail address.
      accountLink: this.page.locator(`css=.header-links .account`),
    };

    this.errorMessages = {
      // The red box above the form: "Login was unsuccessful. ..."
      wrongEmailOrPasswordError: this.page.locator(`css=.validation-summary-errors`),
      // The small message under the e-mail field.
      emailFieldError: this.page.locator(`css=span[data-valmsg-for='Email']`),
    };
  }
}
