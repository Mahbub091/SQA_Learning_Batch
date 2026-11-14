import { expect, Page } from '@playwright/test';
import { CheckoutPage } from '../../PageObjectModel/Checkout.page';
import ActionUtils from '../ActionUtils';
import { urlFor } from '../config/env.config';
import { checkoutMessages } from '../testData/messages.data';
import { AddressData } from '../testData/checkout.data';

export type CheckoutStep =
  'billing' | 'shipping' | 'shippingMethod' | 'paymentMethod' | 'paymentInfo' | 'confirmOrder';

export class CheckoutHelper {
  private checkoutPage: CheckoutPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.checkoutPage = new CheckoutPage(page);
    this.runner = new ActionUtils(page);
  }

  async GoToCheckout(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor('/onepagecheckout'));
  }

  async CheckoutAsGuest(): Promise<void> {
    const guestButtonVisible = await this.runner.IsElementVisible(
      this.checkoutPage.GuestCheckout.checkoutAsGuestButton,
    );
    if (guestButtonVisible) {
      await this.runner.TriggerAndWaitForUrlChange(() =>
        this.runner.ClickElement(this.checkoutPage.GuestCheckout.checkoutAsGuestButton),
      );
    }
  }

  // ---------- billing address ----------

  async FillBillingAddress(data: AddressData): Promise<void> {
    await this.runner.TypeText(this.checkoutPage.Billing.firstNameInput, data.firstName);
    await this.runner.TypeText(this.checkoutPage.Billing.lastNameInput, data.lastName);
    await this.runner.TypeText(this.checkoutPage.Billing.emailInput, data.email);
    await this.runner.SelectOptionByLabel(this.checkoutPage.Billing.countrySelect, data.country);

    const stateVisible = await this.runner.IsElementVisible(this.checkoutPage.Billing.stateSelect);
    if (stateVisible) {
      await this.runner.SelectOptionByLabel(this.checkoutPage.Billing.stateSelect, data.state);
    }

    await this.runner.TypeText(this.checkoutPage.Billing.cityInput, data.city);
    await this.runner.TypeText(this.checkoutPage.Billing.address1Input, data.address1);
    await this.runner.TypeText(this.checkoutPage.Billing.zipInput, data.zipPostalCode);
    await this.runner.TypeText(this.checkoutPage.Billing.phoneInput, data.phoneNumber);
  }

  async ContinueFromBilling(): Promise<void> {
    await this.runner.TriggerAndWaitForNetworkIdle(() =>
      this.runner.ClickElement(this.checkoutPage.Billing.continueButton),
    );
  }

  /** Leaves every required field empty and continues, to trigger client/server validation. */
  async SubmitEmptyBillingAddress(): Promise<void> {
    await this.ContinueFromBilling();
  }

  async AssertStillOnBillingStep(): Promise<void> {
    await this.runner.AssertElementVisible(this.checkoutPage.Billing.firstNameInput);
  }

  // ---------- shipping address ----------

  async SetShipToSameAddress(shipToSame: boolean): Promise<void> {
    const checkbox = this.checkoutPage.Shipping.shipToSameAddressCheckbox;
    const visible = await this.runner.IsElementVisible(checkbox);
    if (!visible) return;
    if (shipToSame) {
      await this.runner.CheckElement(checkbox);
    } else {
      await this.runner.UncheckElement(checkbox);
    }
  }

  async SetPickupInStore(pickup: boolean): Promise<void> {
    const checkbox = this.checkoutPage.Shipping.pickupInStoreCheckbox;
    const visible = await this.runner.IsElementVisible(checkbox);
    if (!visible) return;
    if (pickup) {
      await this.runner.CheckElement(checkbox);
    } else {
      await this.runner.UncheckElement(checkbox);
    }
  }

  async ContinueFromShipping(): Promise<void> {
    await this.runner.TriggerAndWaitForNetworkIdle(() =>
      this.runner.ClickElement(this.checkoutPage.Shipping.continueButton),
    );
  }

  // ---------- shipping method ----------

  async SelectShippingMethod(name: string): Promise<void> {
    await this.runner.CheckElement(this.checkoutPage.shippingOptionByName(name));
  }

  async ContinueFromShippingMethod(): Promise<void> {
    await this.runner.TriggerAndWaitForNetworkIdle(() =>
      this.runner.ClickElement(this.checkoutPage.ShippingMethod.continueButton),
    );
  }

  // ---------- payment method ----------

  async SelectPaymentMethod(name: string): Promise<void> {
    await this.runner.CheckElement(this.checkoutPage.paymentOptionByName(name));
  }

  async ContinueFromPaymentMethod(): Promise<void> {
    await this.runner.TriggerAndWaitForNetworkIdle(() =>
      this.runner.ClickElement(this.checkoutPage.PaymentMethod.continueButton),
    );
  }

  // ---------- payment info ----------

  async FillCreditCardInfo(data: {
    cardholderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvv: string;
  }): Promise<void> {
    const info = this.checkoutPage.PaymentInfo;
    await this.runner.TypeText(info.cardholderNameInput, data.cardholderName);
    await this.runner.TypeText(info.cardNumberInput, data.cardNumber);

    const monthVisible = await this.runner.IsElementVisible(info.expireMonthSelect);
    if (monthVisible) {
      await this.runner.SelectOptionByLabel(info.expireMonthSelect, data.expireMonth);
    }
    const yearVisible = await this.runner.IsElementVisible(info.expireYearSelect);
    if (yearVisible) {
      await this.runner.SelectOptionByLabel(info.expireYearSelect, data.expireYear);
    }
    await this.runner.TypeText(info.cvvInput, data.cvv);
  }

  async FillPurchaseOrderNumber(poNumber: string): Promise<void> {
    await this.runner.TypeText(this.checkoutPage.PaymentInfo.purchaseOrderNumberInput, poNumber);
  }

  async ContinueFromPaymentInfo(): Promise<void> {
    await this.runner.TriggerAndWaitForNetworkIdle(() =>
      this.runner.ClickElement(this.checkoutPage.PaymentInfo.continueButton),
    );
  }

  /** A bad card must not be accepted: either a validation error, or the flow doesn't advance. */
  async AssertPaymentInfoRejected(): Promise<void> {
    const errorVisible = await this.runner.IsElementVisible(
      this.checkoutPage.PaymentInfo.validationError,
    );
    const confirmVisible = await this.runner.IsElementVisible(
      this.checkoutPage.ConfirmOrder.container,
    );
    expect(
      errorVisible || !confirmVisible,
      'an invalid card should show a validation error or keep the flow on the payment info step',
    ).toBe(true);
  }

  // ---------- confirm order ----------

  async ConfirmOrder(): Promise<void> {
    await this.runner.TriggerAndWaitForNetworkIdle(() =>
      this.runner.ClickElement(this.checkoutPage.ConfirmOrder.confirmButton),
    );
  }

  async AssertOrderCompleted(): Promise<void> {
    await this.runner.AssertElementVisible(this.checkoutPage.OrderCompleted.container);
    await this.runner.AssertElementContainsText(
      this.checkoutPage.OrderCompleted.container,
      checkoutMessages.orderCompleted,
    );
  }

  async GetOrderNumberText(): Promise<string> {
    return this.runner.GetElementText(this.checkoutPage.OrderCompleted.orderNumber);
  }

  // ---------- navigation between steps ----------

  async GoBackOneStep(): Promise<void> {
    await this.runner.GoBack();
  }

  async AssertOnStep(step: CheckoutStep): Promise<void> {
    const container = this.ContainerForStep(step);
    await this.runner.AssertElementVisible(container);
  }

  private ContainerForStep(step: CheckoutStep) {
    switch (step) {
      case 'billing':
        return this.checkoutPage.Billing.container;
      case 'shipping':
        return this.checkoutPage.Shipping.container;
      case 'shippingMethod':
        return this.checkoutPage.ShippingMethod.container;
      case 'paymentMethod':
        return this.checkoutPage.PaymentMethod.container;
      case 'paymentInfo':
        return this.checkoutPage.PaymentInfo.container;
      case 'confirmOrder':
        return this.checkoutPage.ConfirmOrder.container;
    }
  }
}
