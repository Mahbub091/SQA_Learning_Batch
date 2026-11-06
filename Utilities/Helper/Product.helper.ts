import { expect, Page } from '@playwright/test';
import { ProductPage } from '../../PageObjectModel/Product.page';
import { HeaderPage } from '../../PageObjectModel/Header.page';
import ActionUtils from '../ActionUtils';
import { urlFor } from '../config/env.config';
import { parsePrice } from '../textUtils';
import { productDetailMessages } from '../testData/messages.data';

export class ProductHelper {
  private productPage: ProductPage;
  private headerPage: HeaderPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.productPage = new ProductPage(page);
    this.headerPage = new HeaderPage(page);
    this.runner = new ActionUtils(page);
  }

  async GoToProduct(path: string): Promise<void> {
    await this.runner.NavigateToUrl(urlFor(path));
    await this.runner.AssertElementVisible(this.productPage.Overview.name);
  }

  // ---------- name / price / description / image ----------

  async GetName(): Promise<string> {
    return this.runner.GetElementText(this.productPage.Overview.name);
  }

  async GetPrice(): Promise<number> {
    const text = await this.runner.GetElementText(this.productPage.Overview.priceContainer);
    return parsePrice(text);
  }

  async AssertNameEquals(expectedName: string): Promise<void> {
    await this.runner.AssertElementContainsText(
      this.productPage.Overview.name,
      new RegExp(`^\\s*${escapeRegExp(expectedName)}\\s*$`, 'i'),
    );
  }

  /** Checks the price is a positive number, and matches `expectedPrice` when one is given (> 0). */
  async AssertPrice(expectedPrice: number): Promise<void> {
    const price = await this.GetPrice();
    expect(Number.isNaN(price), `price text did not contain a number`).toBe(false);
    expect(price).toBeGreaterThan(0);
    if (expectedPrice > 0) {
      expect(price).toBeCloseTo(expectedPrice, 2);
    }
  }

  async AssertDescriptionVisible(): Promise<void> {
    const short = await this.runner.GetElementText(this.productPage.Overview.shortDescription);
    const full = await this.runner.GetElementText(this.productPage.Overview.fullDescription);
    expect(short.trim().length, 'short description should not be empty').toBeGreaterThan(0);
    expect(full.trim().length, 'full description should not be empty').toBeGreaterThan(0);
  }

  async AssertImageVisible(): Promise<void> {
    await this.runner.AssertElementVisible(this.productPage.Overview.mainImage);
    const src = await this.runner.GetAttribute(this.productPage.Overview.mainImage, 'src');
    expect(src, 'product image should have a src attribute').toBeTruthy();
    expect((src ?? '').trim().length).toBeGreaterThan(0);
  }

  // ---------- required attribute options (processor / RAM / HDD) ----------

  async AssertAttributeGroupShowsRequiredMarker(label: string): Promise<void> {
    const group = this.productPage.attributeGroupByLabel(label);
    await this.runner.AssertElementVisible(group);
    await this.runner.AssertElementContainsText(group, /\*/);
  }

  // ---------- price updates when an option changes ----------

  /** Picks the option at `index` in a dropdown attribute group (works for <select> attributes). */
  async SelectDropdownOptionByIndex(label: string, index: number): Promise<void> {
    const group = this.productPage.attributeGroupByLabel(label);
    const select = group.locator('select');
    const options = await this.runner.GetSelectOptionLabels(select);
    const target = options[index];
    expect(target, `attribute "${label}" should have an option at index ${index}`).toBeTruthy();
    await this.runner.TriggerAndWaitForNetworkIdle(() =>
      this.runner.SelectOptionByLabel(select, target),
    );
  }

  /** Picks the radio button at `index` in a radio-list attribute group. */
  async SelectRadioOptionByIndex(label: string, index: number): Promise<void> {
    const group = this.productPage.attributeGroupByLabel(label);
    const radios = group.locator(`input[type='radio']`);
    await this.runner.TriggerAndWaitForNetworkIdle(() =>
      this.runner.CheckElement(radios.nth(index)),
    );
  }

  // ---------- gift card recipient fields ----------

  async FillGiftCardRecipientFields(data: {
    recipientName: string;
    recipientEmail: string;
    senderName: string;
    senderEmail: string;
    message?: string;
  }): Promise<void> {
    const form = this.productPage.GiftCard;
    await this.runner.TypeText(form.recipientName, data.recipientName);
    await this.runner.TypeText(form.recipientEmail, data.recipientEmail);
    await this.runner.TypeText(form.senderName, data.senderName);
    await this.runner.TypeText(form.senderEmail, data.senderEmail);
    if (data.message) {
      await this.runner.TypeText(form.message, data.message);
    }
  }

  async AssertGiftCardFieldsRequired(): Promise<void> {
    await this.ClickAddToCart();
    // Either the page shows a validation message, or it simply never reaches the "added" state.
    const hasError = await this.AnyGiftCardFieldHasValidationError();
    const added = await this.WasAddedToCart();
    expect(
      hasError || !added,
      'submitting the gift card with empty recipient fields should be rejected',
    ).toBe(true);
  }

  private async AnyGiftCardFieldHasValidationError(): Promise<boolean> {
    const errorCount = await this.runner.CountElements(
      this.productPage.GiftCard.container.locator('.field-validation-error, .message-error'),
    );
    return errorCount > 0;
  }

  // ---------- quantity boundaries ----------

  async SetQuantity(rawValue: string): Promise<void> {
    await this.runner.TypeText(this.productPage.AddToCartFeature.quantityInput, rawValue);
  }

  async GetQuantityValue(): Promise<string> {
    return this.runner.GetInputValue(this.productPage.AddToCartFeature.quantityInput);
  }

  /**
   * Submits add-to-cart with whatever quantity is currently in the field and checks the page
   * reacts sensibly: either the item is added (the browser/server accepted or clamped the value)
   * or a validation message is shown. Neither happening at all would mean the click did nothing.
   */
  async AssertAddToCartHandledGracefully(): Promise<void> {
    await this.runner.ClickElement(this.productPage.AddToCartFeature.addToCartButton);
    await expect(async () => {
      const added = await this.WasAddedToCart();
      const barVisible = await this.runner.IsElementVisible(this.productPage.Notification.bar);
      expect(added || barVisible, 'add-to-cart should either succeed or show a message').toBe(true);
    }).toPass({ timeout: 10_000 });
  }

  // ---------- add to cart / wishlist / compare ----------

  async ClickAddToCart(): Promise<void> {
    await this.runner.ClickElement(this.productPage.AddToCartFeature.addToCartButton);
  }

  async ClickAddToWishlist(): Promise<void> {
    await this.runner.ClickElement(this.productPage.AddToCartFeature.addToWishlistButton);
  }

  async ClickAddToCompare(): Promise<void> {
    await this.runner.ClickElement(this.productPage.AddToCartFeature.addToCompareButton);
  }

  async AssertAddedToCart(): Promise<void> {
    await this.runner.AssertElementContainsText(
      this.productPage.Notification.bar,
      productDetailMessages.addedToCart,
    );
  }

  async AssertAddedToWishlist(): Promise<void> {
    await this.runner.AssertElementContainsText(
      this.productPage.Notification.bar,
      productDetailMessages.addedToWishlist,
    );
  }

  async AssertAddedToCompare(): Promise<void> {
    await this.runner.AssertElementContainsText(
      this.productPage.Notification.bar,
      productDetailMessages.addedToCompare,
    );
  }

  private async WasAddedToCart(): Promise<boolean> {
    const visible = await this.runner.IsElementVisible(this.productPage.Notification.bar);
    if (!visible) return false;
    const text = await this.runner.GetElementText(this.productPage.Notification.bar);
    return productDetailMessages.addedToCart.test(text);
  }

  // ---------- email a friend ----------

  async OpenEmailAFriendForm(): Promise<void> {
    await this.runner.ClickElement(this.productPage.AddToCartFeature.emailAFriendLink);
    await this.runner.AssertUrlMatches(/productemailafriend/i);
  }

  // ---------- reviews ----------

  async OpenReviewsPage(): Promise<void> {
    await this.runner.ClickElement(this.productPage.Reviews.readReviewsLink);
    await this.runner.AssertUrlMatches(/productreviews/i);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
