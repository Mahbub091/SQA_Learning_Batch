import { test } from '@root/Utilities/fixtures/base.fixture';
import { ShippingMethodKey, PaymentMethodKey } from '@root/Utilities/testData/checkout.data';

const shippingMethodKeys: ShippingMethodKey[] = ['ground', 'nextDayAir', 'secondDayAir'];
const paymentMethodKeys: PaymentMethodKey[] = [
  'cod',
  'checkMoneyOrder',
  'creditCard',
  'purchaseOrder',
];

test.describe('Checkout', { tag: ['@checkout'] }, () => {
  test(
    'flow: a guest can complete checkout end to end',
    { tag: ['@e2e', '@smoke'] },
    async ({ checkoutActions }) => {
      await checkoutActions.GuestShouldBeAbleToCompleteCheckout();
    },
  );

  test(
    'flow: a registered user can complete checkout end to end',
    { tag: ['@e2e'] },
    async ({ checkoutActions }) => {
      await checkoutActions.RegisteredUserShouldBeAbleToCompleteCheckout();
    },
  );

  test('billing address: an empty address is rejected', async ({ checkoutActions }) => {
    await checkoutActions.UserShouldSeeValidationForEmptyBillingAddress();
  });

  test('shipping address: ship to the same address as billing', async ({ checkoutActions }) => {
    await checkoutActions.UserShouldBeAbleToShipToTheSameAddress();
  });

  test('shipping address: ship to a different address', async ({ checkoutActions }) => {
    await checkoutActions.UserShouldBeAbleToUseADifferentShippingAddress();
  });

  test('shipping address: pick up in store instead of shipping', async ({ checkoutActions }) => {
    await checkoutActions.UserShouldBeAbleToChoosePickupInStore();
  });

  for (const key of shippingMethodKeys) {
    test(`shipping method: "${key}" can be selected and the flow continues`, async ({
      checkoutActions,
    }) => {
      await checkoutActions.UserShouldBeAbleToSelectShippingMethod(key);
    });
  }

  for (const key of paymentMethodKeys) {
    test(
      `payment method: "${key}" can be selected and reaches order confirmation`,
      { tag: ['@e2e'] },
      async ({ checkoutActions }) => {
        await checkoutActions.UserShouldBeAbleToSelectPaymentMethod(key);
      },
    );
  }

  test('credit card: an invalid card number is rejected', async ({ checkoutActions }) => {
    await checkoutActions.UserShouldSeeInvalidCardNumberRejected();
  });

  test('credit card: an expired card is rejected', async ({ checkoutActions }) => {
    await checkoutActions.UserShouldSeeExpiredCardRejected();
  });

  test('credit card: a wrong CVV is rejected', async ({ checkoutActions }) => {
    await checkoutActions.UserShouldSeeWrongCvvRejected();
  });

  test(
    'confirmation: order-completed page shows an order number',
    { tag: ['@e2e'] },
    async ({ checkoutActions }) => {
      await checkoutActions.UserShouldSeeOrderNumberAfterConfirming();
    },
  );

  test('navigation: back button returns to the previous checkout step', async ({
    checkoutActions,
  }) => {
    await checkoutActions.UserShouldBeAbleToNavigateBackBetweenSteps();
  });
});
