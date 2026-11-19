import { Page } from '@playwright/test';
import { ProductHelper } from '../Helper/Product.helper';
import { CartHelper } from '../Helper/Cart.helper';
import { CheckoutHelper } from '../Helper/Checkout.helper';
import { LoginHelper } from '../Helper/Login.helper';
import { RegisterHelper } from '../Helper/Register.helper';
import { AccountHelper } from '../Helper/Account.helper';
import { generateUser, UserData } from '../testData/user.data';
import { generateAddress, shippingMethods, paymentMethods } from '../testData/checkout.data';
import {
  updatedInfo,
  generateAccountAddress,
  editedAddressFields,
  orderProduct,
} from '../testData/account.data';
import { env } from '../config/env.config';
import { accountMessages } from '../testData/messages.data';

export default class AccountAction {
  private productHelper: ProductHelper;
  private cartHelper: CartHelper;
  private checkoutHelper: CheckoutHelper;
  private loginHelper: LoginHelper;
  private registerHelper: RegisterHelper;
  private accountHelper: AccountHelper;

  constructor(page: Page) {
    this.productHelper = new ProductHelper(page);
    this.cartHelper = new CartHelper(page);
    this.checkoutHelper = new CheckoutHelper(page);
    this.loginHelper = new LoginHelper(page);
    this.registerHelper = new RegisterHelper(page);
    this.accountHelper = new AccountHelper(page);
  }

  /** Every account scenario needs a freshly registered, logged-in user. */
  private async RegisterAndLogIn(): Promise<UserData> {
    const user = generateUser();
    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertRegistrationCompleted();
    await this.registerHelper.ContinueAfterRegistration();
    await this.loginHelper.AssertUserIsLoggedIn(user.email);
    return user;
  }

  /** Buys one item end to end (Cash On Delivery, ship to billing) so order history has an order. */
  private async PlaceOneOrder(): Promise<void> {
    await this.productHelper.GoToProduct(orderProduct.path);
    await this.productHelper.ClickAddToCart();
    await this.productHelper.AssertAddedToCart();

    await this.cartHelper.GoToCart();
    await this.cartHelper.ProceedToCheckout();

    await this.checkoutHelper.FillBillingAddress(generateAddress());
    await this.checkoutHelper.ContinueFromBilling();
    await this.checkoutHelper.SetShipToSameAddress(true);
    await this.checkoutHelper.ContinueFromShipping();
    await this.checkoutHelper.SelectShippingMethod(shippingMethods.ground);
    await this.checkoutHelper.ContinueFromShippingMethod();
    await this.checkoutHelper.SelectPaymentMethod(paymentMethods.cod);
    await this.checkoutHelper.ContinueFromPaymentMethod();
    await this.checkoutHelper.ConfirmOrder();
    await this.checkoutHelper.AssertOrderCompleted();
  }

  // ---------- customer info ----------

  async UserShouldBeAbleToUpdateCustomerInfo(): Promise<void> {
    await this.RegisterAndLogIn();
    await this.accountHelper.GoToCustomerInfo();
    await this.accountHelper.UpdateCustomerInfo(updatedInfo);
    await this.accountHelper.AssertCustomerInfoSaved(updatedInfo);
  }

  // ---------- addresses: add / edit / delete ----------

  async UserShouldBeAbleToAddANewAddress(): Promise<void> {
    await this.RegisterAndLogIn();
    await this.accountHelper.GoToAddresses();

    const address = generateAccountAddress();
    await this.accountHelper.AddAddress(address);
    await this.accountHelper.AssertAddressInList(address.address1);
  }

  async UserShouldBeAbleToEditAnExistingAddress(): Promise<void> {
    await this.RegisterAndLogIn();
    await this.accountHelper.GoToAddresses();

    const address = generateAccountAddress();
    await this.accountHelper.AddAddress(address);
    await this.accountHelper.AssertAddressInList(address.address1);

    await this.accountHelper.EditAddress(address.address1, editedAddressFields);
    await this.accountHelper.AssertAddressInList(editedAddressFields.address1);
  }

  async UserShouldBeAbleToDeleteAnAddress(): Promise<void> {
    await this.RegisterAndLogIn();
    await this.accountHelper.GoToAddresses();

    const address = generateAccountAddress();
    await this.accountHelper.AddAddress(address);
    await this.accountHelper.AssertAddressInList(address.address1);

    await this.accountHelper.DeleteAddress(address.address1);
    await this.accountHelper.AssertAddressNotInList(address.address1);
  }

  // ---------- order history / order details / reorder / pdf invoice ----------

  async PlacedOrderShouldAppearInOrderHistory(): Promise<void> {
    await this.RegisterAndLogIn();
    await this.PlaceOneOrder();

    await this.accountHelper.GoToOrders();
    await this.accountHelper.AssertOrderInHistory(orderProduct.name);
  }

  async OrderDetailsPageShouldShowOrderNumber(): Promise<void> {
    await this.RegisterAndLogIn();
    await this.PlaceOneOrder();

    await this.accountHelper.GoToOrders();
    await this.accountHelper.OpenOrderDetails(orderProduct.name);
    await this.accountHelper.AssertOrderDetailsShowOrderNumber();
  }

  async ReorderShouldAddPreviousItemsBackToCart(): Promise<void> {
    await this.RegisterAndLogIn();
    await this.PlaceOneOrder();

    await this.accountHelper.GoToOrders();
    await this.accountHelper.ClickReorder(orderProduct.name);
    await this.accountHelper.AssertReorderReachedCart();
    await this.cartHelper.AssertProductInCart(orderProduct.name);
  }

  async UserShouldBeAbleToDownloadPdfInvoice(): Promise<void> {
    await this.RegisterAndLogIn();
    await this.PlaceOneOrder();

    await this.accountHelper.GoToOrders();
    await this.accountHelper.OpenOrderDetails(orderProduct.name);

    const filename = await this.accountHelper.DownloadPdfInvoice();
    if (!/\.pdf$/i.test(filename)) {
      throw new Error(`Expected the invoice download to be a .pdf file, got: "${filename}"`);
    }
  }

  // ---------- change password ----------

  async ChangePasswordShouldRejectWrongOldPassword(): Promise<void> {
    await this.RegisterAndLogIn();
    await this.accountHelper.GoToChangePassword();
    await this.accountHelper.SubmitPasswordChange(env.WRONG_PASSWORD, env.NEW_USER_PASSWORD);
    await this.accountHelper.AssertPasswordChangeResult(accountMessages.oldPasswordWrong);
  }

  async ChangePasswordShouldRejectTooShortNewPassword(): Promise<void> {
    const user = await this.RegisterAndLogIn();
    await this.accountHelper.GoToChangePassword();
    await this.accountHelper.SubmitPasswordChange(user.password, env.SHORT_PASSWORD);
    await this.accountHelper.AssertPasswordChangeResult(accountMessages.passwordTooShort);
  }

  async ChangePasswordShouldRejectMismatchedConfirmation(): Promise<void> {
    const user = await this.RegisterAndLogIn();
    await this.accountHelper.GoToChangePassword();
    await this.accountHelper.SubmitPasswordChange(
      user.password,
      env.NEW_USER_PASSWORD,
      env.MISMATCH_PASSWORD,
    );
    await this.accountHelper.AssertPasswordChangeResult(accountMessages.passwordMismatch);
  }

  async UserShouldBeAbleToChangePasswordAndLoginWithNewPassword(): Promise<void> {
    const user = await this.RegisterAndLogIn();
    await this.accountHelper.GoToChangePassword();
    await this.accountHelper.SubmitPasswordChange(user.password, env.NEW_USER_PASSWORD);
    await this.accountHelper.AssertPasswordChangeResult(accountMessages.passwordChanged);

    await this.loginHelper.Logout();
    await this.loginHelper.LoginWithCredentials(user.email, env.NEW_USER_PASSWORD);
    await this.loginHelper.AssertUserIsLoggedIn(user.email);
  }

  // ---------- downloadable products / back-in-stock subscriptions ----------

  async DownloadableProductsPageShouldBeAccessible(): Promise<void> {
    await this.RegisterAndLogIn();
    await this.accountHelper.GoToDownloadableProducts();
  }

  async BackInStockSubscriptionsPageShouldBeAccessible(): Promise<void> {
    await this.RegisterAndLogIn();
    await this.accountHelper.GoToBackInStockSubscriptions();
  }
}
