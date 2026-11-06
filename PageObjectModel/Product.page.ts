import { Page, Locator } from '@playwright/test';

/**
 * The product detail page (nopCommerce "ProductDetails" view).
 *
 * The selectors below follow nopCommerce's standard theme classes and the MVC model-bound field
 * ids it generates for gift cards (RecipientName, RecipientEmail, SenderName, SenderEmail,
 * Message). They have not been checked against this specific Demo Web Shop instance's live DOM,
 * so verify them (and adjust) the first time this file is run.
 */
export class ProductPage {
  readonly Overview: {
    readonly name: Locator;
    readonly priceContainer: Locator;
    readonly shortDescription: Locator;
    readonly fullDescription: Locator;
    readonly mainImage: Locator;
  };

  readonly Attributes: {
    readonly container: Locator;
    readonly groups: Locator;
  };

  readonly GiftCard: {
    readonly container: Locator;
    readonly recipientName: Locator;
    readonly recipientEmail: Locator;
    readonly senderName: Locator;
    readonly senderEmail: Locator;
    readonly message: Locator;
  };

  readonly AddToCartFeature: {
    readonly quantityInput: Locator;
    readonly addToCartButton: Locator;
    readonly addToWishlistButton: Locator;
    readonly addToCompareButton: Locator;
    readonly emailAFriendLink: Locator;
  };

  readonly Notification: {
    readonly bar: Locator;
  };

  readonly Reviews: {
    readonly readReviewsLink: Locator;
  };

  constructor(private page: Page) {
    this.Overview = {
      name: this.page.locator(`css=.product-name h1`),
      priceContainer: this.page.locator(`css=.product-price`),
      shortDescription: this.page.locator(`css=.short-description`),
      fullDescription: this.page.locator(`css=.full-description`),
      mainImage: this.page.locator(`css=.product-essential-picture img, .picture img`).first(),
    };

    this.Attributes = {
      container: this.page.locator(`css=.attributes`),
      groups: this.page.locator(`css=.attributes .form-group`),
    };

    this.GiftCard = {
      container: this.page.locator(`css=.gift-card`),
      recipientName: this.page.locator(`css=#RecipientName`),
      recipientEmail: this.page.locator(`css=#RecipientEmail`),
      senderName: this.page.locator(`css=#SenderName`),
      senderEmail: this.page.locator(`css=#SenderEmail`),
      message: this.page.locator(`css=#Message`),
    };

    this.AddToCartFeature = {
      quantityInput: this.page.locator(`css=input[id*='EnteredQuantity']`).first(),
      addToCartButton: this.page.locator(`css=.add-to-cart-button`).first(),
      addToWishlistButton: this.page.locator(`css=.add-to-wishlist-button`).first(),
      addToCompareButton: this.page.locator(`css=.add-to-compare-list-button`).first(),
      emailAFriendLink: this.page.locator(`css=a.email-a-friend`),
    };

    this.Notification = {
      bar: this.page.locator(`css=#bar-notification`),
    };

    this.Reviews = {
      readReviewsLink: this.page.locator(`css=.product-review-overview a`).first(),
    };
  }

  /** The `.form-group` row for one attribute, found by its label text (e.g. "Processor"). */
  attributeGroupByLabel(label: string): Locator {
    return this.Attributes.groups.filter({ hasText: exactLabelRegex(label) });
  }
}

/** Matches "Processor:" or "Processor: *" but not "Processor type", so labels don't cross-match. */
function exactLabelRegex(label: string): RegExp {
  return new RegExp(`^\\s*${label}\\s*:`, 'i');
}
