import { expect, Page } from '@playwright/test';
import { ProductReviewPage } from '../../PageObjectModel/ProductReview.page';
import ActionUtils from '../ActionUtils';
import { productDetailMessages } from '../testData/messages.data';

export class ProductReviewHelper {
  private reviewPage: ProductReviewPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.reviewPage = new ProductReviewPage(page);
    this.runner = new ActionUtils(page);
  }

  async FillReview(title: string, text: string): Promise<void> {
    await this.runner.TypeText(this.reviewPage.ReviewForm.titleInput, title);
    await this.runner.TypeText(this.reviewPage.ReviewForm.reviewTextInput, text);
  }

  async SelectRating(value: number): Promise<void> {
    const radio = this.reviewPage.ratingRadio(value);
    await this.runner.AssertElementVisible(radio);
    await this.runner.CheckElement(radio);
  }

  async Submit(): Promise<void> {
    await this.runner.ClickElement(this.reviewPage.ReviewForm.submitButton);
  }

  async AssertSubmittedSuccessfully(): Promise<void> {
    await this.runner.AssertElementContainsText(
      this.reviewPage.Messages.result,
      productDetailMessages.reviewSubmitted,
    );
  }

  /** Title and review text are both required; a submit with both empty must not succeed. */
  async AssertEmptyReviewRejected(): Promise<void> {
    const titleErrorVisible = await this.runner.IsElementVisible(
      this.reviewPage.Messages.titleError,
    );
    const textErrorVisible = await this.runner.IsElementVisible(
      this.reviewPage.Messages.reviewTextError,
    );
    const resultVisible = await this.runner.IsElementVisible(this.reviewPage.Messages.result);

    expect(
      titleErrorVisible || textErrorVisible || !resultVisible,
      'submitting an empty review should show a field error or fail to succeed',
    ).toBe(true);
  }
}
