import { Page } from '@playwright/test';
import { ProductHelper } from '../Helper/Product.helper';
import { ProductReviewHelper } from '../Helper/ProductReview.helper';
import { LoginHelper } from '../Helper/Login.helper';
import { RegisterHelper } from '../Helper/Register.helper';
import { customComputer } from '../testData/product.data';
import { FakeDataProvider } from '../testData/FakeDataProvider';

export default class ProductReviewAction {
  private productHelper: ProductHelper;
  private reviewHelper: ProductReviewHelper;
  private loginHelper: LoginHelper;
  private registerHelper: RegisterHelper;

  constructor(page: Page) {
    this.productHelper = new ProductHelper(page);
    this.reviewHelper = new ProductReviewHelper(page);
    this.loginHelper = new LoginHelper(page);
    this.registerHelper = new RegisterHelper(page);
  }

  private async OpenReviewsPage(): Promise<void> {
    await this.productHelper.GoToProduct(customComputer.path);
    await this.productHelper.OpenReviewsPage();
  }

  async GuestShouldSeeRequiredFieldErrorsOnEmptyReview(): Promise<void> {
    await this.OpenReviewsPage();
    await this.reviewHelper.Submit();
    await this.reviewHelper.AssertEmptyReviewRejected();
  }

  async GuestShouldBeAbleToSubmitAReview(): Promise<void> {
    await this.OpenReviewsPage();
    await this.reviewHelper.FillReview(
      FakeDataProvider.reviewTitle(),
      FakeDataProvider.reviewText(),
    );
    await this.reviewHelper.Submit();
    await this.reviewHelper.AssertSubmittedSuccessfully();
  }

  async LoggedInUserShouldBeAbleToSubmitAReview(): Promise<void> {
    const user = FakeDataProvider.user();
    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertRegistrationCompleted();
    await this.registerHelper.ContinueAfterRegistration();
    await this.loginHelper.AssertUserIsLoggedIn(user.email);

    await this.OpenReviewsPage();
    await this.reviewHelper.FillReview(
      FakeDataProvider.reviewTitle(),
      FakeDataProvider.reviewText(),
    );
    await this.reviewHelper.Submit();
    await this.reviewHelper.AssertSubmittedSuccessfully();
  }

  async UserShouldBeAbleToSubmitAReviewWithRating(rating: number): Promise<void> {
    await this.OpenReviewsPage();
    await this.reviewHelper.FillReview(
      FakeDataProvider.reviewTitle(),
      FakeDataProvider.reviewText(),
    );
    await this.reviewHelper.SelectRating(rating);
    await this.reviewHelper.Submit();
    await this.reviewHelper.AssertSubmittedSuccessfully();
  }
}
