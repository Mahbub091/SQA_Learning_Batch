import { Page, Locator } from '@playwright/test';

/**
 * Page object for the "Password recovery" (forgot password) page.
 * A page object only describes WHERE things are (locators); it never clicks or asserts.
 */
export class PasswordRecoveryPage {
  readonly PasswordRecoveryFeature: {
    readonly pageHeading: Locator;
    readonly emailInput: Locator;
    readonly recoverButton: Locator;
  };

  /** Texts the page shows after the form is submitted. */
  readonly messages: {
    /** Validation text under the e-mail field. */
    readonly emailFieldError: Locator;
    /** The result box, e.g. "Email with instructions has been sent to you." */
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
