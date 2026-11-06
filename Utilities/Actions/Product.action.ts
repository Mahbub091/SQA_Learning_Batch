import { Page } from '@playwright/test';
import { ProductHelper } from '../Helper/Product.helper';
import { customComputer, giftCardProduct, quantityBoundaries } from '../testData/product.data';
import { FakeDataProvider } from '../testData/FakeDataProvider';

export type QuantityBoundaryKey = keyof typeof quantityBoundaries;

export default class ProductAction {
  private productHelper: ProductHelper;

  constructor(page: Page) {
    this.productHelper = new ProductHelper(page);
  }

  // ---------- name / price / description / image ----------

  async UserShouldSeeCorrectProductDetails(): Promise<void> {
    await this.productHelper.GoToProduct(customComputer.path);
    await this.productHelper.AssertNameEquals(customComputer.name);
    await this.productHelper.AssertPrice(customComputer.expectedPrice);
    await this.productHelper.AssertDescriptionVisible();
    await this.productHelper.AssertImageVisible();
  }

  // ---------- required options ----------

  async UserShouldSeeRequiredIndicatorsOnCustomComputerOptions(): Promise<void> {
    await this.productHelper.GoToProduct(customComputer.path);
    const { processorLabel, ramLabel, hddLabel } = customComputer.attributeGroups;
    await this.productHelper.AssertAttributeGroupShowsRequiredMarker(processorLabel);
    await this.productHelper.AssertAttributeGroupShowsRequiredMarker(ramLabel);
    await this.productHelper.AssertAttributeGroupShowsRequiredMarker(hddLabel);
  }

  async UserShouldSeeValidationForMissingGiftCardRecipientFields(): Promise<void> {
    await this.productHelper.GoToProduct(giftCardProduct.path);
    await this.productHelper.AssertGiftCardFieldsRequired();
  }

  // ---------- price updates when options change ----------

  async PriceShouldUpdateWhenRamOptionChanges(): Promise<void> {
    await this.productHelper.GoToProduct(customComputer.path);
    const before = await this.productHelper.GetPrice();

    await this.productHelper.SelectDropdownOptionByIndex(
      customComputer.attributeGroups.ramLabel,
      1,
    );

    const after = await this.productHelper.GetPrice();
    if (after === before) {
      throw new Error(
        `Price did not change after picking a different RAM option (stayed at ${before}). ` +
          `Check that "${customComputer.attributeGroups.ramLabel}" is the right attribute label ` +
          'and that index 1 is a priced option.',
      );
    }
  }

  async PriceShouldUpdateWhenHddOptionChanges(): Promise<void> {
    await this.productHelper.GoToProduct(customComputer.path);
    const before = await this.productHelper.GetPrice();

    await this.productHelper.SelectRadioOptionByIndex(customComputer.attributeGroups.hddLabel, 1);

    const after = await this.productHelper.GetPrice();
    if (after === before) {
      throw new Error(
        `Price did not change after picking a different HDD option (stayed at ${before}). ` +
          `Check that "${customComputer.attributeGroups.hddLabel}" is the right attribute label ` +
          'and that index 1 is a priced option.',
      );
    }
  }

  // ---------- quantity boundaries ----------

  async UserShouldSeeQuantityBoundaryHandledGracefully(key: QuantityBoundaryKey): Promise<void> {
    await this.productHelper.GoToProduct(customComputer.path);
    await this.productHelper.SetQuantity(quantityBoundaries[key]);
    await this.productHelper.AssertAddToCartHandledGracefully();
  }

  // ---------- add to cart / wishlist / compare ----------

  async UserShouldBeAbleToAddProductToCart(): Promise<void> {
    await this.productHelper.GoToProduct(customComputer.path);
    await this.productHelper.ClickAddToCart();
    await this.productHelper.AssertAddedToCart();
  }

  async UserShouldBeAbleToAddProductToWishlist(): Promise<void> {
    await this.productHelper.GoToProduct(customComputer.path);
    await this.productHelper.ClickAddToWishlist();
    await this.productHelper.AssertAddedToWishlist();
  }

  async UserShouldBeAbleToAddProductToCompareList(): Promise<void> {
    await this.productHelper.GoToProduct(customComputer.path);
    await this.productHelper.ClickAddToCompare();
    await this.productHelper.AssertAddedToCompare();
  }

  async UserShouldBeAbleToOpenEmailAFriendForm(): Promise<void> {
    await this.productHelper.GoToProduct(customComputer.path);
    await this.productHelper.OpenEmailAFriendForm();
  }
}

/** Fields for a valid gift-card purchase, used by tests that need a filled-in form. */
export function validGiftCardRecipient() {
  const sender = FakeDataProvider.user();
  const recipient = FakeDataProvider.user();
  return {
    recipientName: `${recipient.firstName} ${recipient.lastName}`,
    recipientEmail: recipient.email,
    senderName: `${sender.firstName} ${sender.lastName}`,
    senderEmail: sender.email,
    message: FakeDataProvider.personalMessage(),
  };
}
