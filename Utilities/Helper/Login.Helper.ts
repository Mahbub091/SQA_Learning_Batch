import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../../PageObjectModel/Login.page';
import ActionUtils from '../ActionUtils';
import dotenv from 'dotenv';
dotenv.config();

const minWaitTime = 10000;
const maxWaitTime = 30000;
const waitInterval = 1000;
const defaultWaitTime = 20;
const email = process.env.USER_EMAIL || 'testqa@mail.com';
const password = process.env.USER_PASSWORD || 'Test@123';
export class LoginHelper {
  landingPageUrl = process.env.LANDING_PAGE_URL;
  private loginPage: LoginPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.loginPage = new LoginPage(page);
    this.runner = new ActionUtils(page);
  }
  async NavigateToTheLandingPage() {
    await this.runner.NavigateToUrl(this.landingPageUrl || 'https://demowebshop.tricentis.com/');
    await expect(this.loginPage.headerLogo).toBeVisible();
  }

  async NavigateToTheLoginPage(): Promise<void> {
    await this.runner.ClickElement(this.loginPage.LoginFeature.loginButton);
    await this.runner.AssertElementVisible(this.loginPage.LoginFeature.emailInput);
    await this.runner.AssertElementVisible(this.loginPage.LoginFeature.passwordInput);
    await this.runner.AssertElementVisible(this.loginPage.LoginFeature.loginSubmitButton);
    await this.runner.waitForDesiredState(defaultWaitTime, {
      waitForLoadState: 'networkidle',
    });

    await this.runner.TypeText(this.loginPage.LoginFeature.emailInput, email);
    await this.runner.TypeText(this.loginPage.LoginFeature.passwordInput, password);
    await this.runner.ClickElement(this.loginPage.LoginFeature.loginSubmitButton);
  }

  async AssertInvalidCredentialsError(): Promise<void> {
    await this.runner.AssertElementVisible(this.loginPage.errorMessages.wrongEmailOrPasswordError);
    await this.runner.verifyElementText(
      this.loginPage.errorMessages.wrongEmailOrPasswordError,
      'Login was unsuccessful. Please correct the errors and try again. /n No customer account found',
    );
  }
}
