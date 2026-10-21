import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../../PageObjectModel/Login.page';
import ActionUtils from '../../Utilities/ActionUtils';
import dotenv from 'dotenv';
dotenv.config();

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
    await this.runner.TypeText(this.loginPage.headerLogo, 'laptop');
  }
}
