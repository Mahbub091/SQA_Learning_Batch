import { Page } from '@playwright/test';
import { Locator } from '@playwright/test';

export class LoginPage {
  readonly headerLogo: Locator;

  readonly LoginFeature: {
    readonly loginButton: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginSubmitButton: Locator;
  };

  readonly errorMessages: {
    wrongEmailOrPasswordError: Locator;
  };

  constructor(private page: Page) {
    this.headerLogo = this.page.locator(`css=img[alt='Tricentis Demo Web Shop']`);
    this.LoginFeature = {
      loginButton: this.page.locator(`css=.ico-login`),
      emailInput: this.page.locator(`css=input#Email`),
      passwordInput: this.page.locator(`css=input#Password`),
      loginSubmitButton: this.page.locator(`css=input[value='Log in']`),
    };

    this.errorMessages = {
      wrongEmailOrPasswordError: this.page.locator(`css=.validation-summary-errors`),
    };
  }
}
