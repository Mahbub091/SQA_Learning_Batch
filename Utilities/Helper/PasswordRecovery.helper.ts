import { expect, Page } from '@playwright/test';
import { PasswordRecoveryPage } from '@root/PageObjectModel/PasswordRecovery.page';
import ActionUtils from '@root/Utilities/ActionUtils';

/**
 * Helper = small, reusable steps and checks for ONE feature (here: password recovery).
 * Actions (the next layer up) chain these steps into a full test scenario.
 */
export class PasswordRecoveryHelper {
  private recoveryPage: PasswordRecoveryPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.recoveryPage = new PasswordRecoveryPage(page);
    this.runner = new ActionUtils(page);
  }

  /** The "Password recovery" page is open: right URL, right heading, e-mail field shown. */
  async AssertRecoveryPageLoaded(): Promise<void> {
    await this.runner.AssertUrlMatches(/passwordrecovery/i);
    await this.runner.AssertElementContainsText(
      this.recoveryPage.PasswordRecoveryFeature.pageHeading,
      /password recovery/i,
    );
    await this.runner.AssertElementVisible(this.recoveryPage.PasswordRecoveryFeature.emailInput);
  }

  /** Types the e-mail (can be empty or invalid on purpose) and clicks "Recover". */
  async SubmitEmail(email: string): Promise<void> {
    await this.runner.TypeText(this.recoveryPage.PasswordRecoveryFeature.emailInput, email);
    await this.runner.ClickElement(this.recoveryPage.PasswordRecoveryFeature.recoverButton);
  }

  /** The validation text under the e-mail field is shown and contains the message. */
  async AssertEmailFieldError(message: RegExp): Promise<void> {
    const error = this.recoveryPage.messages.emailFieldError;
    await expect(error).toBeVisible();
    await expect(error).toContainText(message);
  }

  /** The result box (shown after submitting a valid-looking e-mail) contains the message. */
  async AssertResultMessage(message: RegExp): Promise<void> {
    const result = this.recoveryPage.messages.result;
    await expect(result).toBeVisible();
    await expect(result).toContainText(message);
  }
}
