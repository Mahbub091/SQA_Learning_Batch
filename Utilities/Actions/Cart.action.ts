import { Page } from '@playwright/test';
import { ProductHelper } from '../Helper/Product.helper';
import { CartHelper } from '../Helper/Cart.helper';
import { LoginHelper } from '../Helper/Login.helper';
import { RegisterHelper } from '../Helper/Register.helper';
import {
  cartPrimaryProduct,
  cartSecondaryProduct,
  validCoupon,
  invalidCoupon,
  validGiftCard,
  invalidGiftCard,
  estimateShipping,
} from '../testData/cart.data';
import { generateUser } from '../testData/user.data';

export default class CartAction {
  private productHelper: ProductHelper;
  private cartHelper: CartHelper;
  private loginHelper: LoginHelper;
  private registerHelper: RegisterHelper;

  constructor(page: Page) {
    this.productHelper = new ProductHelper(page);
    this.cartHelper = new CartHelper(page);
    this.loginHelper = new LoginHelper(page);
    this.registerHelper = new RegisterHelper(page);
  }

  private async AddProductToCartFromItsPage(path: string): Promise<void> {
    await this.productHelper.GoToProduct(path);
    await this.productHelper.ClickAddToCart();
    await this.productHelper.AssertAddedToCart();
  }

  // ---------- add / update quantity ----------

  async UserShouldBeAbleToAddASingleProductToCart(): Promise<void> {
    await this.AddProductToCartFromItsPage(cartPrimaryProduct.path);
    await this.cartHelper.GoToCart();
    await this.cartHelper.AssertProductInCart(cartPrimaryProduct.name);
  }

  async UserShouldBeAbleToAddMultipleProductsToCart(): Promise<void> {
    await this.AddProductToCartFromItsPage(cartPrimaryProduct.path);
    await this.AddProductToCartFromItsPage(cartSecondaryProduct.path);

    await this.cartHelper.GoToCart();
    await this.cartHelper.AssertProductInCart(cartPrimaryProduct.name);
    await this.cartHelper.AssertProductInCart(cartSecondaryProduct.name);
  }

  async UserShouldBeAbleToUpdateQuantity(): Promise<void> {
    await this.AddProductToCartFromItsPage(cartPrimaryProduct.path);
    await this.cartHelper.GoToCart();

    await this.cartHelper.SetQuantity(cartPrimaryProduct.name, '3');
    await this.cartHelper.ClickUpdateCart();

    const quantity = await this.cartHelper.GetQuantity(cartPrimaryProduct.name);
    if (quantity.trim() !== '3') {
      throw new Error(`Expected quantity to be updated to "3", but the field shows "${quantity}".`);
    }
  }

  // ---------- remove ----------

  async UserShouldBeAbleToRemoveAnItemAndCartBecomesEmpty(): Promise<void> {
    await this.AddProductToCartFromItsPage(cartPrimaryProduct.path);
    await this.cartHelper.GoToCart();

    await this.cartHelper.RemoveProduct(cartPrimaryProduct.name);
    await this.cartHelper.AssertCartIsEmpty();
  }

  // ---------- totals ----------

  async CartShouldShowPositiveSubtotalAndTotal(): Promise<void> {
    await this.AddProductToCartFromItsPage(cartPrimaryProduct.path);
    await this.cartHelper.GoToCart();
    await this.cartHelper.AssertSubtotalAndTotalArePositive();
  }

  // ---------- coupon / gift card ----------

  async UserShouldSeeInvalidCouponRejected(): Promise<void> {
    await this.AddProductToCartFromItsPage(cartPrimaryProduct.path);
    await this.cartHelper.GoToCart();
    await this.cartHelper.ApplyCoupon(invalidCoupon);
    await this.cartHelper.AssertCouponRejected();
  }

  async UserShouldSeeCouponAttemptHandled(): Promise<void> {
    await this.AddProductToCartFromItsPage(cartPrimaryProduct.path);
    await this.cartHelper.GoToCart();
    await this.cartHelper.ApplyCoupon(validCoupon);
    await this.cartHelper.AssertCouponAttemptHandled();
  }

  async UserShouldSeeInvalidGiftCardRejected(): Promise<void> {
    await this.AddProductToCartFromItsPage(cartPrimaryProduct.path);
    await this.cartHelper.GoToCart();
    await this.cartHelper.ApplyGiftCard(invalidGiftCard);
    await this.cartHelper.AssertGiftCardRejected();
  }

  async UserShouldSeeGiftCardAttemptHandled(): Promise<void> {
    await this.AddProductToCartFromItsPage(cartPrimaryProduct.path);
    await this.cartHelper.GoToCart();
    await this.cartHelper.ApplyGiftCard(validGiftCard);
    await this.cartHelper.AssertCouponAttemptHandled();
  }

  // ---------- estimate shipping ----------

  async UserShouldBeAbleToEstimateShipping(): Promise<void> {
    await this.AddProductToCartFromItsPage(cartPrimaryProduct.path);
    await this.cartHelper.GoToCart();
    await this.cartHelper.EstimateShipping(estimateShipping);
    await this.cartHelper.AssertEstimateShippingResultShown();
  }

  // ---------- terms of service ----------

  async CheckoutShouldBeBlockedWithoutAcceptingTerms(): Promise<void> {
    await this.AddProductToCartFromItsPage(cartPrimaryProduct.path);
    await this.cartHelper.GoToCart();
    await this.cartHelper.AssertCheckoutBlockedWithoutAcceptingTerms();
  }

  // ---------- persistence across logout/login ----------

  async CartShouldPersistAfterLogoutAndLogin(): Promise<void> {
    const user = generateUser();
    await this.loginHelper.NavigateToTheLandingPage();
    await this.registerHelper.RegisterNewUser(user);
    await this.registerHelper.AssertRegistrationCompleted();
    await this.registerHelper.ContinueAfterRegistration();
    await this.loginHelper.AssertUserIsLoggedIn(user.email);

    await this.AddProductToCartFromItsPage(cartPrimaryProduct.path);
    await this.cartHelper.GoToCart();
    await this.cartHelper.AssertProductInCart(cartPrimaryProduct.name);

    await this.loginHelper.Logout();
    await this.loginHelper.LoginWithCredentials(user.email, user.password);
    await this.loginHelper.AssertUserIsLoggedIn(user.email);

    await this.cartHelper.GoToCart();
    await this.cartHelper.AssertProductInCart(cartPrimaryProduct.name);
  }
}
