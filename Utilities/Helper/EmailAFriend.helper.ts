import { expect, Page } from '@playwright/test';
import { EmailAFriendPage } from '../../PageObjectModel/EmailAFriend.page';
import ActionUtils from '../ActionUtils';
import { productDetailMessages } from '../testData/messages.data';

export class EmailAFriendHelper {
  private emailPage: EmailAFriendPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.emailPage = new EmailAFriendPage(page);
    this.runner = new ActionUtils(page);
  }

  async FillForm(friendEmail: string, yourEmail: string, message: string = ''): Promise<void> {
    const form = this.emailPage.EmailForm;
    await this.runner.TypeText(form.friendEmailInput, friendEmail);
    await this.runner.TypeText(form.yourEmailInput, yourEmail);
    if (message) {
      await this.runner.TypeText(form.personalMessageInput, message);
    }
  }

  async Submit(): Promise<void> {
    await this.runner.ClickElement(this.emailPage.EmailForm.sendButton);
  }

  async AssertSentSuccessfully(): Promise<void> {
    await this.runner.AssertElementContainsText(
      this.emailPage.Messages.result,
      productDetailMessages.emailSent,
    );
  }

  /** Empty required fields must not result in the "sent" confirmation. */
  async AssertEmptyFormRejected(): Promise<void> {
    const friendErrorVisible = await this.runner.IsElementVisible(
      this.emailPage.Messages.friendEmailError,
    );
    const yourErrorVisible = await this.runner.IsElementVisible(
      this.emailPage.Messages.yourEmailError,
    );
    const sentVisible = await this.IsSentConfirmationVisible();

    expect(
      friendErrorVisible || yourErrorVisible || !sentVisible,
      'submitting with empty required fields should show a field error or fail to send',
    ).toBe(true);
  }

  /** An invalid "your email" format must not result in the "sent" confirmation. */
  async AssertInvalidYourEmailRejected(): Promise<void> {
    const yourErrorVisible = await this.runner.IsElementVisible(
      this.emailPage.Messages.yourEmailError,
    );
    const sentVisible = await this.IsSentConfirmationVisible();

    expect(
      yourErrorVisible || !sentVisible,
      'submitting an invalid "your email" should show a field error or fail to send',
    ).toBe(true);
  }

  private async IsSentConfirmationVisible(): Promise<boolean> {
    const visible = await this.runner.IsElementVisible(this.emailPage.Messages.result);
    if (!visible) return false;
    const text = await this.runner.GetElementText(this.emailPage.Messages.result);
    return productDetailMessages.emailSent.test(text);
  }
}
