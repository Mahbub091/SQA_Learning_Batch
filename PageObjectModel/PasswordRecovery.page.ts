import { Page, Locator } from '@playwright/test';

export class PasswordRecoveryPage {
  readonly PasswordRecoveryFeature: {
    readonly pageHeading: Locator;
    readonly emailInput: Locator;
    readonly recoverButton: Locator;
  };

  readonly messages: {
    readonly emailFieldError: Locator;
    readonly result: Locator;
    readonly summaryErrors: Locator;
  };

  constructor(private page: Page) {
    this.PasswordRecoveryFeature = {
      pageHeading: this.page.locator(`css=.page-title h1`),
      emailInput: this.page.locator(`css=input#Email`),
      recoverButton: this.page.locator(`css=input.password-recovery-button`),
    };

    this.messages = {
      emailFieldError: this.page.locator(`css=span[data-valmsg-for='Email']`),
      result: this.page.locator(`css=.result`),
      summaryErrors: this.page.locator(`css=.validation-summary-errors`),
    };
  }
}
