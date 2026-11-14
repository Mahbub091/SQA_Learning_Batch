import { test } from '@root/Utilities/fixtures/base.fixture';

test.describe('Shopping cart', { tag: ['@cart'] }, () => {
  test(
    'items: adds a single product to the cart',
    { tag: ['@e2e', '@smoke'] },
    async ({ cartActions }) => {
      await cartActions.UserShouldBeAbleToAddASingleProductToCart();
    },
  );

  test('items: adds multiple products to the cart', { tag: ['@e2e'] }, async ({ cartActions }) => {
    await cartActions.UserShouldBeAbleToAddMultipleProductsToCart();
  });

  test('items: updates the quantity of an item already in the cart', async ({ cartActions }) => {
    await cartActions.UserShouldBeAbleToUpdateQuantity();
  });

  test(
    'items: removing the only item leaves the cart empty',
    { tag: ['@e2e'] },
    async ({ cartActions }) => {
      await cartActions.UserShouldBeAbleToRemoveAnItemAndCartBecomesEmpty();
    },
  );

  test('totals: sub-total and total are shown as positive amounts', async ({ cartActions }) => {
    await cartActions.CartShouldShowPositiveSubtotalAndTotal();
  });

  test('coupon: an invalid discount code is rejected', async ({ cartActions }) => {
    await cartActions.UserShouldSeeInvalidCouponRejected();
  });

  test('coupon: a coupon-code attempt is handled by the page', async ({ cartActions }) => {
    await cartActions.UserShouldSeeCouponAttemptHandled();
  });

  test('gift card: an invalid gift card code is rejected', async ({ cartActions }) => {
    await cartActions.UserShouldSeeInvalidGiftCardRejected();
  });

  test('gift card: a gift-card-code attempt is handled by the page', async ({ cartActions }) => {
    await cartActions.UserShouldSeeGiftCardAttemptHandled();
  });

  test('shipping: estimate shipping by country/state/zip shows a result', async ({
    cartActions,
  }) => {
    await cartActions.UserShouldBeAbleToEstimateShipping();
  });

  test(
    'checkout gate: checkout is blocked until terms of service is accepted',
    { tag: ['@e2e'] },
    async ({ cartActions }) => {
      await cartActions.CheckoutShouldBeBlockedWithoutAcceptingTerms();
    },
  );

  test(
    'persistence: cart contents survive a logout and a later login',
    { tag: ['@e2e'] },
    async ({ cartActions }) => {
      await cartActions.CartShouldPersistAfterLogoutAndLogin();
    },
  );
});
