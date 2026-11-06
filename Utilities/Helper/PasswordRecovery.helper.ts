import { expect, Page } from '@playwright/test';
import { PasswordRecoveryPage } from '../../PageObjectModel/PasswordRecovery.page';
import ActionUtils from '../ActionUtils';

export class PasswordRecoveryHelper {
  private recoveryPage: PasswordRecoveryPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.recoveryPage = new PasswordRecoveryPage(page);
    this.runner = new ActionUtils(page);
  }

  async AssertRecoveryPageLoaded(): Promise<void> {
    await this.runner.AssertUrlMatches(/passwordrecovery/i);
    await this.runner.AssertElementContainsText(
      this.recoveryPage.PasswordRecoveryFeature.pageHeading,
      /password recovery/i,
    );
    await this.runner.AssertElementVisible(this.recoveryPage.PasswordRecoveryFeature.emailInput);
  }

  async SubmitEmail(email: string): Promise<void> {
    await this.runner.TypeText(this.recoveryPage.PasswordRecoveryFeature.emailInput, email);
    await this.runner.ClickElement(this.recoveryPage.PasswordRecoveryFeature.recoverButton);
  }

  async AssertEmailFieldError(message: RegExp): Promise<void> {
    const error = this.recoveryPage.messages.emailFieldError;
    await expect(error).toBeVisible();
    await expect(error).toContainText(message);
  }

  async AssertResultMessage(message: RegExp): Promise<void> {
    const result = this.recoveryPage.messages.result;
    await expect(result).toBeVisible();
    await expect(result).toContainText(message);
  }
}
