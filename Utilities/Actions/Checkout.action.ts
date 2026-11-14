import { Page } from '@playwright/test';
import { ProductHelper } from '../Helper/Product.helper';
import { CartHelper } from '../Helper/Cart.helper';
import { CheckoutHelper } from '../Helper/Checkout.helper';
import { LoginHelper } from '../Helper/Login.helper';
import { RegisterHelper } from '../Helper/Register.helper';
import { cartPrimaryProduct } from '../testData/cart.data';
import {
  generateAddress,
  shippingMethods,
  paymentMethods,
  creditCard,
  purchaseOrderNumber,
  ShippingMethodKey,
  PaymentMethodKey,
} from '../testData/checkout.data';
import { generateUser } from '../testData/user.data';

export default class CheckoutAction {
  private productHelper: ProductHelper;
  private cartHelper: CartHelper;
  private checkoutHelper: CheckoutHelper;
  private loginHelper: LoginHelper;
  private registerHelper: RegisterHelper;

  constructor(page: Page) {
    this.productHelper = new ProductHelper(page);
    this.cartHelper = new CartHelper(page);
    this.checkoutHelper = new CheckoutHelper(page);
    this.loginHelper = new LoginHelper(page);
    this.registerHelper = new RegisterHelper(page);
  }

  /** Precondition for every checkout scenario: one item in the cart, terms accepted. */
  private async AddItemAndReachCheckout(): Promise<void> {
    await this.productHelper.GoToProduct(cartPrimaryProduct.path);
    await this.productHelper.ClickAddToCart();
    await this.productHelper.AssertAddedToCart();

    await this.cartHelper.GoToCart();
    await this.cartHelper.ProceedToCheckout();
  }

  private async RegisterAndLogIn() {
    const user = generateUser();
    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertRegistrationCompleted();
    await this.registerHelper.ContinueAfterRegistration();
    await this.loginHelper.AssertUserIsLoggedIn(user.email);
    return user;
  }

  /** Fills billing (+ shipping, method, payment) and stops right before confirming the order. */
  private async FillCheckoutUpToConfirmOrder(
    paymentMethod: string = paymentMethods.cod,
  ): Promise<void> {
    await this.checkoutHelper.FillBillingAddress(generateAddress());
    await this.checkoutHelper.ContinueFromBilling();

    await this.checkoutHelper.SetShipToSameAddress(true);
    await this.checkoutHelper.ContinueFromShipping();

    await this.checkoutHelper.SelectShippingMethod(shippingMethods.ground);
    await this.checkoutHelper.ContinueFromShippingMethod();

    await this.checkoutHelper.SelectPaymentMethod(paymentMethod);
    await this.checkoutHelper.ContinueFromPaymentMethod();

    if (paymentMethod === paymentMethods.creditCard) {
      await this.checkoutHelper.FillCreditCardInfo({
        cardholderName: 'Test Buyer',
        cardNumber: creditCard.validNumber,
        expireMonth: creditCard.expireMonth,
        expireYear: creditCard.validExpireYear,
        cvv: creditCard.cvv,
      });
      await this.checkoutHelper.ContinueFromPaymentInfo();
    } else if (paymentMethod === paymentMethods.purchaseOrder) {
      await this.checkoutHelper.FillPurchaseOrderNumber(purchaseOrderNumber);
      await this.checkoutHelper.ContinueFromPaymentInfo();
    }
  }

  // ---------- guest vs registered checkout ----------

  async GuestShouldBeAbleToCompleteCheckout(): Promise<void> {
    await this.AddItemAndReachCheckout();
    await this.checkoutHelper.CheckoutAsGuest();
    await this.FillCheckoutUpToConfirmOrder();
    await this.checkoutHelper.ConfirmOrder();
    await this.checkoutHelper.AssertOrderCompleted();
  }

  async RegisteredUserShouldBeAbleToCompleteCheckout(): Promise<void> {
    await this.RegisterAndLogIn();
    await this.AddItemAndReachCheckout();
    await this.FillCheckoutUpToConfirmOrder();
    await this.checkoutHelper.ConfirmOrder();
    await this.checkoutHelper.AssertOrderCompleted();
  }

  // ---------- billing address validation ----------

  async UserShouldSeeValidationForEmptyBillingAddress(): Promise<void> {
    await this.AddItemAndReachCheckout();
    await this.checkoutHelper.CheckoutAsGuest();
    await this.checkoutHelper.SubmitEmptyBillingAddress();
    await this.checkoutHelper.AssertStillOnBillingStep();
  }

  // ---------- shipping address / pickup ----------

  async UserShouldBeAbleToShipToTheSameAddress(): Promise<void> {
    await this.AddItemAndReachCheckout();
    await this.checkoutHelper.CheckoutAsGuest();
    await this.checkoutHelper.FillBillingAddress(generateAddress());
    await this.checkoutHelper.ContinueFromBilling();

    await this.checkoutHelper.SetShipToSameAddress(true);
    await this.checkoutHelper.ContinueFromShipping();
    await this.checkoutHelper.AssertOnStep('shippingMethod');
  }

  async UserShouldBeAbleToUseADifferentShippingAddress(): Promise<void> {
    await this.AddItemAndReachCheckout();
    await this.checkoutHelper.CheckoutAsGuest();
    await this.checkoutHelper.FillBillingAddress(generateAddress());
    await this.checkoutHelper.ContinueFromBilling();

    await this.checkoutHelper.SetShipToSameAddress(false);
    await this.checkoutHelper.ContinueFromShipping();
    await this.checkoutHelper.AssertOnStep('shippingMethod');
  }

  async UserShouldBeAbleToChoosePickupInStore(): Promise<void> {
    await this.AddItemAndReachCheckout();
    await this.checkoutHelper.CheckoutAsGuest();
    await this.checkoutHelper.FillBillingAddress(generateAddress());
    await this.checkoutHelper.ContinueFromBilling();

    await this.checkoutHelper.SetPickupInStore(true);
    await this.checkoutHelper.ContinueFromShipping();
    await this.checkoutHelper.AssertOnStep('shippingMethod');
  }

  // ---------- shipping methods ----------

  async UserShouldBeAbleToSelectShippingMethod(methodKey: ShippingMethodKey): Promise<void> {
    await this.AddItemAndReachCheckout();
    await this.checkoutHelper.CheckoutAsGuest();
    await this.checkoutHelper.FillBillingAddress(generateAddress());
    await this.checkoutHelper.ContinueFromBilling();
    await this.checkoutHelper.SetShipToSameAddress(true);
    await this.checkoutHelper.ContinueFromShipping();

    await this.checkoutHelper.SelectShippingMethod(shippingMethods[methodKey]);
    await this.checkoutHelper.ContinueFromShippingMethod();
    await this.checkoutHelper.AssertOnStep('paymentMethod');
  }

  // ---------- payment methods ----------

  async UserShouldBeAbleToSelectPaymentMethod(methodKey: PaymentMethodKey): Promise<void> {
    await this.AddItemAndReachCheckout();
    await this.checkoutHelper.CheckoutAsGuest();
    await this.FillCheckoutUpToConfirmOrder(paymentMethods[methodKey]);
    await this.checkoutHelper.AssertOnStep('confirmOrder');
  }

  // ---------- credit card field validation ----------

  async UserShouldSeeInvalidCardNumberRejected(): Promise<void> {
    await this.AddItemAndReachCheckout();
    await this.checkoutHelper.CheckoutAsGuest();
    await this.checkoutHelper.FillBillingAddress(generateAddress());
    await this.checkoutHelper.ContinueFromBilling();
    await this.checkoutHelper.SetShipToSameAddress(true);
    await this.checkoutHelper.ContinueFromShipping();
    await this.checkoutHelper.SelectShippingMethod(shippingMethods.ground);
    await this.checkoutHelper.ContinueFromShippingMethod();
    await this.checkoutHelper.SelectPaymentMethod(paymentMethods.creditCard);
    await this.checkoutHelper.ContinueFromPaymentMethod();

    await this.checkoutHelper.FillCreditCardInfo({
      cardholderName: 'Test Buyer',
      cardNumber: creditCard.invalidNumber,
      expireMonth: creditCard.expireMonth,
      expireYear: creditCard.validExpireYear,
      cvv: creditCard.cvv,
    });
    await this.checkoutHelper.ContinueFromPaymentInfo();
    await this.checkoutHelper.AssertPaymentInfoRejected();
  }

  async UserShouldSeeExpiredCardRejected(): Promise<void> {
    await this.AddItemAndReachCheckout();
    await this.checkoutHelper.CheckoutAsGuest();
    await this.checkoutHelper.FillBillingAddress(generateAddress());
    await this.checkoutHelper.ContinueFromBilling();
    await this.checkoutHelper.SetShipToSameAddress(true);
    await this.checkoutHelper.ContinueFromShipping();
    await this.checkoutHelper.SelectShippingMethod(shippingMethods.ground);
    await this.checkoutHelper.ContinueFromShippingMethod();
    await this.checkoutHelper.SelectPaymentMethod(paymentMethods.creditCard);
    await this.checkoutHelper.ContinueFromPaymentMethod();

    await this.checkoutHelper.FillCreditCardInfo({
      cardholderName: 'Test Buyer',
      cardNumber: creditCard.validNumber,
      expireMonth: creditCard.expireMonth,
      expireYear: creditCard.expiredYear,
      cvv: creditCard.cvv,
    });
    await this.checkoutHelper.ContinueFromPaymentInfo();
    await this.checkoutHelper.AssertPaymentInfoRejected();
  }

  async UserShouldSeeWrongCvvRejected(): Promise<void> {
    await this.AddItemAndReachCheckout();
    await this.checkoutHelper.CheckoutAsGuest();
    await this.checkoutHelper.FillBillingAddress(generateAddress());
    await this.checkoutHelper.ContinueFromBilling();
    await this.checkoutHelper.SetShipToSameAddress(true);
    await this.checkoutHelper.ContinueFromShipping();
    await this.checkoutHelper.SelectShippingMethod(shippingMethods.ground);
    await this.checkoutHelper.ContinueFromShippingMethod();
    await this.checkoutHelper.SelectPaymentMethod(paymentMethods.creditCard);
    await this.checkoutHelper.ContinueFromPaymentMethod();

    await this.checkoutHelper.FillCreditCardInfo({
      cardholderName: 'Test Buyer',
      cardNumber: creditCard.validNumber,
      expireMonth: creditCard.expireMonth,
      expireYear: creditCard.validExpireYear,
      cvv: creditCard.invalidCvv,
    });
    await this.checkoutHelper.ContinueFromPaymentInfo();
    await this.checkoutHelper.AssertPaymentInfoRejected();
  }

  // ---------- order confirmation ----------

  async UserShouldSeeOrderNumberAfterConfirming(): Promise<void> {
    await this.AddItemAndReachCheckout();
    await this.checkoutHelper.CheckoutAsGuest();
    await this.FillCheckoutUpToConfirmOrder();
    await this.checkoutHelper.ConfirmOrder();
    await this.checkoutHelper.AssertOrderCompleted();

    const orderNumberText = await this.checkoutHelper.GetOrderNumberText();
    if (!/\d/.test(orderNumberText)) {
      throw new Error(
        `Expected the order-completed page to show an order number containing digits, got: "${orderNumberText}"`,
      );
    }
  }

  // ---------- back navigation ----------

  async UserShouldBeAbleToNavigateBackBetweenSteps(): Promise<void> {
    await this.AddItemAndReachCheckout();
    await this.checkoutHelper.CheckoutAsGuest();
    await this.checkoutHelper.FillBillingAddress(generateAddress());
    await this.checkoutHelper.ContinueFromBilling();
    await this.checkoutHelper.SetShipToSameAddress(true);
    await this.checkoutHelper.ContinueFromShipping();
    await this.checkoutHelper.AssertOnStep('shippingMethod');

    await this.checkoutHelper.GoBackOneStep();
    await this.checkoutHelper.AssertOnStep('shipping');
  }
}
