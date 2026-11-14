import { Page, Locator } from '@playwright/test';

/**
 * The shopping cart page (nopCommerce "ShoppingCart" view).
 *
 * The selectors below follow nopCommerce's standard theme classes and MVC field names
 * (applydiscountcouponcode, applygiftcardcouponcode, estimateshipping, termsofservice). They have
 * not been checked against this specific Demo Web Shop instance's live DOM, so verify them (and
 * adjust) the first time this file is run. Totals are found by filtering each row for its label
 * text rather than guessing an exact class, the same pattern `Product.page.ts` uses for attribute
 * groups — this is more resilient to small markup differences than a hardcoded selector.
 */
export class CartPage {
  readonly CartTable: {
    readonly container: Locator;
    readonly rows: Locator;
  };

  readonly Totals: {
    readonly container: Locator;
  };

  readonly Coupon: {
    readonly codeInput: Locator;
    readonly applyButton: Locator;
  };

  readonly GiftCard: {
    readonly codeInput: Locator;
    readonly applyButton: Locator;
  };

  readonly EstimateShipping: {
    readonly container: Locator;
    readonly countrySelect: Locator;
    readonly stateSelect: Locator;
    readonly zipInput: Locator;
    readonly estimateButton: Locator;
    readonly result: Locator;
  };

  readonly TermsOfService: {
    readonly checkbox: Locator;
  };

  readonly Buttons: {
    readonly updateCartButton: Locator;
    readonly continueShoppingButton: Locator;
    readonly checkoutButton: Locator;
  };

  readonly EmptyCartMessage: Locator;

  constructor(private page: Page) {
    this.CartTable = {
      container: this.page.locator(`css=.cart`).first(),
      rows: this.page.locator(`css=.cart tbody tr`),
    };

    this.Totals = {
      container: this.page.locator(`css=.cart-total`),
    };

    this.Coupon = {
      codeInput: this.page.locator(`css=#discountcouponcode`),
      applyButton: this.page.locator(`css=input[name='applydiscountcouponcode']`),
    };

    this.GiftCard = {
      codeInput: this.page.locator(`css=#giftcardcouponcode`),
      applyButton: this.page.locator(`css=input[name='applygiftcardcouponcode']`),
    };

    this.EstimateShipping = {
      container: this.page.locator(`css=#estimate-shipping, .estimate-shipping`),
      countrySelect: this.page.locator(`css=#CountryId`),
      stateSelect: this.page.locator(`css=#StateProvinceId`),
      zipInput: this.page.locator(`css=#ZipPostalCode`),
      estimateButton: this.page.locator(`css=input[name='estimateshipping']`),
      result: this.page.locator(`css=#estimate-shipping-result, .estimate-shipping-result`),
    };

    this.TermsOfService = {
      checkbox: this.page.locator(`css=#termsofservice`),
    };

    this.Buttons = {
      updateCartButton: this.page.locator(`css=input[name='updatecart']`),
      continueShoppingButton: this.page.locator(`css=.continue-shopping-button`),
      checkoutButton: this.page.locator(`css=.checkout-button, #checkout`),
    };

    this.EmptyCartMessage = this.page.locator(`css=.order-summary-content, .cart`);
  }

  /** The cart row for a product, found by its name link's text. */
  rowByProductName(name: string): Locator {
    return this.CartTable.rows.filter({ hasText: name });
  }

  /** The quantity `<input>` inside a product's cart row. */
  quantityInputForProduct(name: string): Locator {
    return this.rowByProductName(name).locator(`css=input[name*='itemquantity'], input.qty-input`);
  }

  /** The "remove from cart" checkbox inside a product's cart row. */
  removeCheckboxForProduct(name: string): Locator {
    return this.rowByProductName(name).locator(`css=input[name*='removefromcart']`);
  }

  /** The row total ("Sub-Total", "Shipping", "Tax", "Total", ...) by its label text. */
  totalRowByLabel(label: string): Locator {
    return this.Totals.container.locator('tr').filter({ hasText: label });
  }
}
