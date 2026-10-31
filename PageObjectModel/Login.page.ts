import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly headerLogo: Locator;

  readonly LoginFeature: {
    readonly loginButton: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly rememberMeCheckbox: Locator;
    readonly forgotPasswordLink: Locator;
    readonly loginSubmitButton: Locator;
  };

  readonly headerLinks: {
    readonly logoutButton: Locator;
    readonly accountLink: Locator;
  };

  readonly errorMessages: {
    readonly wrongEmailOrPasswordError: Locator;
    readonly emailFieldError: Locator;
  };

  constructor(private page: Page) {
    this.headerLogo = this.page.locator(`css=img[alt='Tricentis Demo Web Shop']`);
    this.LoginFeature = {
      loginButton: this.page.locator(`css=.ico-login`),
      emailInput: this.page.locator(`css=input#Email`),
      passwordInput: this.page.locator(`css=input#Password`),
      rememberMeCheckbox: this.page.locator(`css=input#RememberMe`),
      forgotPasswordLink: this.page.locator(`css=.forgot-password a`),
      loginSubmitButton: this.page.locator(`css=input[value='Log in']`),
    };

    this.headerLinks = {
      logoutButton: this.page.locator(`css=.ico-logout`),
      accountLink: this.page.locator(`css=.header-links .account`),
    };

    this.errorMessages = {
      wrongEmailOrPasswordError: this.page.locator(`css=.validation-summary-errors`),
      emailFieldError: this.page.locator(`css=span[data-valmsg-for='Email']`),
    };
  }
}
