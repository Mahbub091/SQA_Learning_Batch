import { LoginHelper } from '../Helper/Login.helper';
import { Page } from '@playwright/test';

export default class LoginAction {
  private loginHelper: LoginHelper;

  constructor(page: Page) {
    this.loginHelper = new LoginHelper(page);
  }

  async UserShouldSeeProperErrorDuringLoginWithInvalidCredentials(): Promise<void> {
    await this.loginHelper.NavigateToTheLandingPage();
    await this.loginHelper.NavigateToTheLoginPage();
    await this.loginHelper.AssertInvalidCredentialsError();
  }
}
