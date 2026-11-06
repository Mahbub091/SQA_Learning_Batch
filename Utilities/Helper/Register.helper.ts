import { expect, Locator, Page } from '@playwright/test';
import { RegisterPage } from '../../PageObjectModel/Register.page';
import ActionUtils from '../ActionUtils';
import { UserData } from '../testData/user.data';
import { registrationMessages } from '../testData/messages.data';

export type RegisterField = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword';

export class RegisterHelper {
  private registerPage: RegisterPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.registerPage = new RegisterPage(page);
    this.runner = new ActionUtils(page);
  }

  async OpenRegisterPage(): Promise<void> {
    await this.runner.ClickElement(this.registerPage.RegisterFeature.registerLink);
    await this.runner.AssertUrlMatches(/\/register/i);
    await this.runner.AssertElementVisible(this.registerPage.RegisterFeature.registerButton);
  }

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

  async SubmitRegistration(): Promise<void> {
    await this.runner.ClickElement(this.registerPage.RegisterFeature.registerButton);
  }

  async RegisterNewUser(user: UserData, confirmPassword: string = user.password): Promise<void> {
    await this.OpenRegisterPage();
    await this.FillRegistrationForm(user, confirmPassword);
    await this.SubmitRegistration();
  }

  async AssertRegistrationCompleted(): Promise<void> {
    await this.runner.AssertElementContainsText(
      this.registerPage.messages.registrationResult,
      registrationMessages.success,
    );
  }

  async ContinueAfterRegistration(): Promise<void> {
    await this.runner.ClickElement(this.registerPage.RegisterFeature.continueButton);
  }

  async AssertStillOnRegisterPage(): Promise<void> {
    await this.runner.AssertUrlMatches(/\/register/i);
    await this.runner.AssertElementNotVisible(this.registerPage.messages.registrationResult);
  }

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

  async AssertFieldError(field: RegisterField, message: RegExp): Promise<void> {
    const error = this.fieldErrorLocator(field);
    await expect(error).toBeVisible();
    await expect(error).toContainText(message);
  }

  async AssertSummaryError(message: RegExp): Promise<void> {
    const summary = this.registerPage.validationMessages.summaryErrors;
    await expect(summary).toBeVisible();
    await expect(summary).toContainText(message);
  }
}
