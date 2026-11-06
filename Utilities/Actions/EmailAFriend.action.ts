import { Page } from '@playwright/test';
import { ProductHelper } from '../Helper/Product.helper';
import { EmailAFriendHelper } from '../Helper/EmailAFriend.helper';
import { customComputer } from '../testData/product.data';
import { FakeDataProvider } from '../testData/FakeDataProvider';
import { invalidEmail } from '../testData/user.data';

export default class EmailAFriendAction {
  private productHelper: ProductHelper;
  private emailHelper: EmailAFriendHelper;

  constructor(page: Page) {
    this.productHelper = new ProductHelper(page);
    this.emailHelper = new EmailAFriendHelper(page);
  }

  private async OpenForm(): Promise<void> {
    await this.productHelper.GoToProduct(customComputer.path);
    await this.productHelper.OpenEmailAFriendForm();
  }

  async UserShouldSeeValidationForEmptyFields(): Promise<void> {
    await this.OpenForm();
    await this.emailHelper.Submit();
    await this.emailHelper.AssertEmptyFormRejected();
  }

  async UserShouldSeeValidationForInvalidYourEmail(): Promise<void> {
    const friend = FakeDataProvider.user();
    await this.OpenForm();
    await this.emailHelper.FillForm(friend.email, invalidEmail);
    await this.emailHelper.Submit();
    await this.emailHelper.AssertInvalidYourEmailRejected();
  }

  async UserShouldBeAbleToSendEmailToFriend(): Promise<void> {
    const friend = FakeDataProvider.user();
    const sender = FakeDataProvider.user();

    await this.OpenForm();
    await this.emailHelper.FillForm(friend.email, sender.email, FakeDataProvider.personalMessage());
    await this.emailHelper.Submit();
    await this.emailHelper.AssertSentSuccessfully();
  }
}
