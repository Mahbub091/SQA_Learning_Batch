import { expect, Locator, Page } from '@playwright/test';
import { RegisterPage } from '@root/PageObjectModel/Register.page';
import ActionUtils from '@root/Utilities/ActionUtils';
import { UserData } from '@root/Utilities/testData/user.data';
import { registrationMessages } from '@root/Utilities/testData/messages.data';

/** The form fields that can show their own validation message. */
export type RegisterField = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword';

/**
 * Helper = small, reusable steps and checks for ONE feature (here: registration).
 * Actions (the next layer up) chain these steps into a full test scenario.
 */
export class RegisterHelper {
  private registerPage: RegisterPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.registerPage = new RegisterPage(page);
    this.runner = new ActionUtils(page);
  }

  // ---------- steps ----------

  /** Clicks "Register" in the header and checks that the registration form is shown. */
  async OpenRegisterPage(): Promise<void> {
    await this.runner.ClickElement(this.registerPage.RegisterFeature.registerLink);
    await this.runner.AssertUrlMatches(/\/register/i);
    await this.runner.AssertElementVisible(this.registerPage.RegisterFeature.registerButton);
  }

  /** Fills every field. The confirm-password defaults to the password (they match). */
  async FillRegistrationForm(
    user: UserData,
    confirmPassword: string = user.password,
  ): Promise<void> {
    const form = this.registerPage.RegisterFeature;
    await this.runner.CheckElement(form.genderMale);
    await this.runner.TypeText(form.firstNameInput, user.firstName);
    await this.runner.TypeText(form.lastNameInput, user.lastName);
    await this.runner.TypeText(form.emailInput, user.email);
    await this.runner.TypeText(form.passwordInput, user.password);
    await this.runner.TypeText(form.confirmPasswordInput, confirmPassword);
  }

  /** Clicks the "Register" button of the form. */
  async SubmitRegistration(): Promise<void> {
    await this.runner.ClickElement(this.registerPage.RegisterFeature.registerButton);
  }

  /** Full registration in one call: open the page, fill the form, submit. */
  async RegisterNewUser(user: UserData, confirmPassword: string = user.password): Promise<void> {
    await this.OpenRegisterPage();
    await this.FillRegistrationForm(user, confirmPassword);
    await this.SubmitRegistration();
  }

  /** Clicks "Continue" on the "Your registration completed" page. */
  async ContinueAfterRegistration(): Promise<void> {
    await this.runner.ClickElement(this.registerPage.RegisterFeature.continueButton);
  }

  // ---------- assertions ----------

  /** The page says "Your registration completed". */
  async AssertRegistrationCompleted(): Promise<void> {
    await this.runner.AssertElementContainsText(
      this.registerPage.messages.registrationResult,
      registrationMessages.success,
    );
  }

  /** Still on the form (not redirected) and no success message is shown. */
  async AssertStillOnRegisterPage(): Promise<void> {
    await this.runner.AssertUrlMatches(/\/register/i);
    await this.runner.AssertElementNotVisible(this.registerPage.messages.registrationResult);
  }

  /** The error under one field is shown and contains the expected message. */
  async AssertFieldError(field: RegisterField, message: RegExp): Promise<void> {
    const error = this.fieldErrorLocator(field);
    await expect(error).toBeVisible();
    await expect(error).toContainText(message);
  }

  /** The red summary box at the top of the form contains the expected message. */
  async AssertSummaryError(message: RegExp): Promise<void> {
    const summary = this.registerPage.validationMessages.summaryErrors;
    await expect(summary).toBeVisible();
    await expect(summary).toContainText(message);
  }

  // ---------- private ----------

  /** Maps a field name to the locator of its error message. */
  private fieldErrorLocator(field: RegisterField): Locator {
    const errors = this.registerPage.validationMessages;
    switch (field) {
      case 'firstName':
        return errors.firstNameError;
      case 'lastName':
        return errors.lastNameError;
      case 'email':
        return errors.emailError;
      case 'password':
        return errors.passwordError;
      case 'confirmPassword':
        return errors.confirmPasswordError;
    }
  }
}
