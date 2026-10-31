import { Page, Locator } from '@playwright/test';

/**
 * Page object for the Register page (create a new account).
 * A page object only describes WHERE things are (locators); it never clicks or asserts.
 */
export class RegisterPage {
  /** The form fields and buttons. */
  readonly RegisterFeature: {
    readonly registerLink: Locator;
    readonly genderMale: Locator;
    readonly genderFemale: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly registerButton: Locator;
    readonly continueButton: Locator;
  };

  /** Red validation texts: one under each field, plus one summary box for server-side errors. */
  readonly validationMessages: {
    readonly firstNameError: Locator;
    readonly lastNameError: Locator;
    readonly emailError: Locator;
    readonly passwordError: Locator;
    readonly confirmPasswordError: Locator;
    readonly summaryErrors: Locator;
  };

  /** Texts shown after a successful registration. */
  readonly messages: {
    readonly registrationResult: Locator;
  };

  constructor(private page: Page) {
    this.RegisterFeature = {
      // The "Register" link in the page header.
      registerLink: this.page.locator(`css=.ico-register`),
      genderMale: this.page.locator(`css=#gender-male`),
      genderFemale: this.page.locator(`css=#gender-female`),
      firstNameInput: this.page.locator(`css=#FirstName`),
      lastNameInput: this.page.locator(`css=#LastName`),
      emailInput: this.page.locator(`css=#Email`),
      passwordInput: this.page.locator(`css=#Password`),
      confirmPasswordInput: this.page.locator(`css=#ConfirmPassword`),
      registerButton: this.page.locator(`css=#register-button`),
      // The "Continue" button on the "Your registration completed" page.
      continueButton: this.page.locator(`css=.register-continue-button`),
    };

    this.validationMessages = {
      firstNameError: this.page.locator(`css=span[data-valmsg-for='FirstName']`),
      lastNameError: this.page.locator(`css=span[data-valmsg-for='LastName']`),
      emailError: this.page.locator(`css=span[data-valmsg-for='Email']`),
      passwordError: this.page.locator(`css=span[data-valmsg-for='Password']`),
      confirmPasswordError: this.page.locator(`css=span[data-valmsg-for='ConfirmPassword']`),
      summaryErrors: this.page.locator(`css=.validation-summary-errors`),
    };

    this.messages = {
      registrationResult: this.page.locator(`css=.result`),
    };
  }
}
