import { Page, Locator } from '@playwright/test';

/**
 * The "write a review" page nopCommerce opens from a product's review link.
 * Field ids follow the ProductReviewModel's property names (Title, ReviewText, Rating).
 */
export class ProductReviewPage {
  readonly ReviewForm: {
    readonly titleInput: Locator;
    readonly reviewTextInput: Locator;
    readonly ratingRadios: Locator;
    readonly submitButton: Locator;
  };

  readonly Messages: {
    readonly result: Locator;
    readonly titleError: Locator;
    readonly reviewTextError: Locator;
  };

  constructor(private page: Page) {
    this.ReviewForm = {
      titleInput: this.page.locator(`css=#Title`),
      reviewTextInput: this.page.locator(`css=#ReviewText`),
      ratingRadios: this.page.locator(`css=input[name='Rating']`),
      submitButton: this.page.locator(
        `css=input[value='Add Review'], button:has-text('Add Review')`,
      ),
    };

    this.Messages = {
      result: this.page.locator(`css=.result`),
      titleError: this.page.locator(`css=span[data-valmsg-for='Title']`),
      reviewTextError: this.page.locator(`css=span[data-valmsg-for='ReviewText']`),
    };
  }

  ratingRadio(value: number): Locator {
    return this.page.locator(`css=input[name='Rating'][value='${value}']`);
  }
}
