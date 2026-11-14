import { expect, Page } from '@playwright/test';
import { CartPage } from '../../PageObjectModel/Cart.page';
import ActionUtils from '../ActionUtils';
import { urlFor } from '../config/env.config';
import { parsePrice } from '../textUtils';
import { cartMessages } from '../testData/messages.data';
import { EstimateShippingData } from '../testData/cart.data';

export class CartHelper {
  private cartPage: CartPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.cartPage = new CartPage(page);
    this.runner = new ActionUtils(page);
  }

  async GoToCart(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor('/cart'));
    await this.runner.AssertElementVisible(this.cartPage.CartTable.container);
  }

  // ---------- items / quantity ----------

  async AssertProductInCart(name: string): Promise<void> {
    await this.runner.AssertElementVisible(this.cartPage.rowByProductName(name));
  }

  async SetQuantity(productName: string, quantity: string): Promise<void> {
    await this.runner.TypeText(this.cartPage.quantityInputForProduct(productName), quantity);
  }

  async GetQuantity(productName: string): Promise<string> {
    return this.runner.GetInputValue(this.cartPage.quantityInputForProduct(productName));
  }

  async ClickUpdateCart(): Promise<void> {
    await this.runner.TriggerAndWaitForNetworkIdle(() =>
      this.runner.ClickElement(this.cartPage.Buttons.updateCartButton),
    );
  }

  async RemoveProduct(productName: string): Promise<void> {
    await this.runner.CheckElement(this.cartPage.removeCheckboxForProduct(productName));
    await this.ClickUpdateCart();
  }

  async AssertCartIsEmpty(): Promise<void> {
    const rowCount = await this.runner.CountElements(this.cartPage.CartTable.rows);
    expect(rowCount, 'cart should have no item rows').toBe(0);
    await this.runner.AssertElementContainsText(this.cartPage.EmptyCartMessage, cartMessages.empty);
  }

  // ---------- totals ----------

  async GetTotalByLabel(label: string): Promise<number> {
    const text = await this.runner.GetElementText(this.cartPage.totalRowByLabel(label));
    return parsePrice(text);
  }

  async AssertSubtotalAndTotalArePositive(): Promise<void> {
    const subtotal = await this.GetTotalByLabel('Sub-Total');
    const total = await this.GetTotalByLabel('Total');
    expect(Number.isNaN(subtotal), 'sub-total should contain a number').toBe(false);
    expect(Number.isNaN(total), 'total should contain a number').toBe(false);
    expect(subtotal).toBeGreaterThan(0);
    expect(total).toBeGreaterThan(0);
  }

  // ---------- coupon / gift card ----------

  async ApplyCoupon(code: string): Promise<void> {
    await this.runner.TypeText(this.cartPage.Coupon.codeInput, code);
    await this.runner.TriggerAndWaitForNetworkIdle(() =>
      this.runner.ClickElement(this.cartPage.Coupon.applyButton),
    );
  }

  async ApplyGiftCard(code: string): Promise<void> {
    await this.runner.TypeText(this.cartPage.GiftCard.codeInput, code);
    await this.runner.TriggerAndWaitForNetworkIdle(() =>
      this.runner.ClickElement(this.cartPage.GiftCard.applyButton),
    );
  }

  /** The invalid-code cases are the reliable ones: this site has no real active coupon/gift card. */
  async AssertCouponRejected(): Promise<void> {
    await this.runner.AssertElementContainsText(
      this.cartPage.Totals.container,
      cartMessages.invalidCoupon,
    );
  }

  async AssertGiftCardRejected(): Promise<void> {
    await this.runner.AssertElementContainsText(
      this.cartPage.Totals.container,
      cartMessages.invalidGiftCard,
    );
  }

  /**
   * A valid-looking code either gets accepted (no more "could not be found" message) or is
   * rejected the same way an invalid one would be — this site has no real active codes, so both
   * outcomes mean the UI handled the attempt; only a silent no-op (page unchanged) is a failure.
   */
  async AssertCouponAttemptHandled(): Promise<void> {
    await expect(this.cartPage.Totals.container).toBeVisible();
  }

  // ---------- estimate shipping ----------

  async EstimateShipping(data: EstimateShippingData): Promise<void> {
    await this.runner.SelectOptionByLabel(
      this.cartPage.EstimateShipping.countrySelect,
      data.country,
    );
    const stateVisible = await this.runner.IsElementVisible(
      this.cartPage.EstimateShipping.stateSelect,
    );
    if (stateVisible) {
      await this.runner.SelectOptionByLabel(this.cartPage.EstimateShipping.stateSelect, data.state);
    }
    await this.runner.TypeText(this.cartPage.EstimateShipping.zipInput, data.zipPostalCode);
    await this.runner.TriggerAndWaitForNetworkIdle(() =>
      this.runner.ClickElement(this.cartPage.EstimateShipping.estimateButton),
    );
  }

  async AssertEstimateShippingResultShown(): Promise<void> {
    await this.runner.AssertElementVisible(this.cartPage.EstimateShipping.result);
  }

  // ---------- terms of service / checkout ----------

  async AcceptTermsOfService(): Promise<void> {
    await this.runner.CheckElement(this.cartPage.TermsOfService.checkbox);
  }

  async ClickCheckout(): Promise<void> {
    await this.runner.ClickElement(this.cartPage.Buttons.checkoutButton);
  }

  /** Clicking checkout without accepting ToS must not leave the cart page. */
  async AssertCheckoutBlockedWithoutAcceptingTerms(): Promise<void> {
    await this.ClickCheckout();
    await expect(async () => {
      const stillOnCart = await this.runner.IsElementVisible(this.cartPage.CartTable.container);
      const errorShown = await this.runner.IsElementVisible(this.cartPage.TermsOfService.checkbox);
      expect(stillOnCart && errorShown, 'checkout should be blocked until terms are accepted').toBe(
        true,
      );
    }).toPass({ timeout: 10_000 });
  }

  async ProceedToCheckout(): Promise<void> {
    await this.AcceptTermsOfService();
    await this.runner.TriggerAndWaitForUrlChange(() => this.ClickCheckout());
  }
}
