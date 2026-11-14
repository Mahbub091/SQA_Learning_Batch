import { Page, Locator } from '@playwright/test';

/**
 * The OnePageCheckout flow (nopCommerce's default checkout widget) plus the order-confirmation
 * page it ends on.
 *
 * Field ids follow nopCommerce's conventional MVC model names (BillingNewAddress_*,
 * ShippingNewAddress_*, shippingoption, paymentmethod, CardNumber, ...). They have not been
 * checked against this specific Demo Web Shop instance's live DOM, so verify them (and adjust)
 * the first time this file is run — see the README note on unverified locators.
 */
export class CheckoutPage {
  readonly GuestCheckout: {
    readonly checkoutAsGuestButton: Locator;
  };

  readonly Billing: {
    readonly container: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly emailInput: Locator;
    readonly countrySelect: Locator;
    readonly stateSelect: Locator;
    readonly cityInput: Locator;
    readonly address1Input: Locator;
    readonly zipInput: Locator;
    readonly phoneInput: Locator;
    readonly continueButton: Locator;
  };

  readonly Shipping: {
    readonly container: Locator;
    readonly shipToSameAddressCheckbox: Locator;
    readonly pickupInStoreCheckbox: Locator;
    readonly continueButton: Locator;
  };

  readonly ShippingMethod: {
    readonly container: Locator;
    readonly options: Locator;
    readonly continueButton: Locator;
  };

  readonly PaymentMethod: {
    readonly container: Locator;
    readonly options: Locator;
    readonly continueButton: Locator;
  };

  readonly PaymentInfo: {
    readonly container: Locator;
    readonly cardTypeSelect: Locator;
    readonly cardholderNameInput: Locator;
    readonly cardNumberInput: Locator;
    readonly expireMonthSelect: Locator;
    readonly expireYearSelect: Locator;
    readonly cvvInput: Locator;
    readonly purchaseOrderNumberInput: Locator;
    readonly continueButton: Locator;
    readonly validationError: Locator;
  };

  readonly ConfirmOrder: {
    readonly container: Locator;
    readonly confirmButton: Locator;
  };

  readonly OrderCompleted: {
    readonly container: Locator;
    readonly orderNumber: Locator;
  };

  constructor(private page: Page) {
    this.GuestCheckout = {
      checkoutAsGuestButton: this.page.locator(`css=.checkout-as-guest-button`),
    };

    this.Billing = {
      container: this.page.locator(`css=#opc-billing, #checkout-step-billing`),
      firstNameInput: this.page.locator(`css=#BillingNewAddress_FirstName`),
      lastNameInput: this.page.locator(`css=#BillingNewAddress_LastName`),
      emailInput: this.page.locator(`css=#BillingNewAddress_Email`),
      countrySelect: this.page.locator(`css=#BillingNewAddress_CountryId`),
      stateSelect: this.page.locator(`css=#BillingNewAddress_StateProvinceId`),
      cityInput: this.page.locator(`css=#BillingNewAddress_City`),
      address1Input: this.page.locator(`css=#BillingNewAddress_Address1`),
      zipInput: this.page.locator(`css=#BillingNewAddress_ZipPostalCode`),
      phoneInput: this.page.locator(`css=#BillingNewAddress_PhoneNumber`),
      continueButton: this.page.locator(
        `css=#opc-billing .new-address-next-step-button, #opc-billing .button-1`,
      ),
    };

    this.Shipping = {
      container: this.page.locator(`css=#opc-shipping, #checkout-step-shipping`),
      shipToSameAddressCheckbox: this.page.locator(`css=#ShipToSameAddress`),
      pickupInStoreCheckbox: this.page.locator(`css=#PickUpInStore`),
      continueButton: this.page.locator(
        `css=#opc-shipping .new-address-next-step-button, #opc-shipping .button-1`,
      ),
    };

    this.ShippingMethod = {
      container: this.page.locator(`css=#opc-shipping-method, #checkout-step-shipping-method`),
      options: this.page.locator(`css=input[name='shippingoption']`),
      continueButton: this.page.locator(`css=.shipping-method-next-step-button`),
    };

    this.PaymentMethod = {
      container: this.page.locator(`css=#opc-payment-method, #checkout-step-payment-method`),
      options: this.page.locator(`css=input[name='paymentmethod']`),
      continueButton: this.page.locator(`css=.payment-method-next-step-button`),
    };

    this.PaymentInfo = {
      container: this.page.locator(`css=#opc-payment-info, #checkout-step-payment-info`),
      cardTypeSelect: this.page.locator(`css=#CreditCardType`),
      cardholderNameInput: this.page.locator(`css=#CardholderName`),
      cardNumberInput: this.page.locator(`css=#CardNumber`),
      expireMonthSelect: this.page.locator(`css=#ExpireMonth`),
      expireYearSelect: this.page.locator(`css=#ExpireYear`),
      cvvInput: this.page.locator(`css=#CardCode`),
      purchaseOrderNumberInput: this.page.locator(`css=#PurchaseOrderNumber`),
      continueButton: this.page.locator(`css=.payment-info-next-step-button`),
      validationError: this.page.locator(
        `css=#opc-payment-info .field-validation-error, #opc-payment-info .message-error`,
      ),
    };

    this.ConfirmOrder = {
      container: this.page.locator(`css=#opc-confirm-order, #checkout-step-confirm-order`),
      confirmButton: this.page.locator(`css=.confirm-order-next-step-button`),
    };

    this.OrderCompleted = {
      container: this.page.locator(`css=.order-completed`),
      orderNumber: this.page.locator(
        `css=.order-completed .details, .order-completed .order-number`,
      ),
    };
  }

  /** The radio input for a shipping method, found by its visible label text. */
  shippingOptionByName(name: string): Locator {
    return this.ShippingMethod.container
      .locator('label')
      .filter({ hasText: name })
      .locator('input');
  }

  /** The radio input for a payment method, found by its visible label text. */
  paymentOptionByName(name: string): Locator {
    return this.PaymentMethod.container.locator('label').filter({ hasText: name }).locator('input');
  }
}
