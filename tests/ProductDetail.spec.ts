import { test } from '@root/Utilities/fixtures/base.fixture';
import { QuantityBoundaryKey } from '@root/Utilities/Actions/Product.action';

const quantityBoundaryKeys: QuantityBoundaryKey[] = ['zero', 'negative', 'large', 'nonNumeric'];

test.describe('Product detail page', { tag: ['@product'] }, () => {
  test(
    'overview: shows the correct name, price, description and image',
    { tag: ['@e2e', '@smoke'] },
    async ({ productActions }) => {
      await productActions.UserShouldSeeCorrectProductDetails();
    },
  );

  test('options: processor, RAM and HDD are marked as required', async ({ productActions }) => {
    await productActions.UserShouldSeeRequiredIndicatorsOnCustomComputerOptions();
  });

  test('options: a gift card rejects empty recipient fields', async ({ productActions }) => {
    await productActions.UserShouldSeeValidationForMissingGiftCardRecipientFields();
  });

  test('price: updates when the RAM option changes', async ({ productActions }) => {
    await productActions.PriceShouldUpdateWhenRamOptionChanges();
  });

  test('price: updates when the HDD option changes', async ({ productActions }) => {
    await productActions.PriceShouldUpdateWhenHddOptionChanges();
  });

  for (const key of quantityBoundaryKeys) {
    test(`quantity: handles a "${key}" value gracefully`, async ({ productActions }) => {
      await productActions.UserShouldSeeQuantityBoundaryHandledGracefully(key);
    });
  }

  test('actions: adds the product to the cart', { tag: ['@e2e'] }, async ({ productActions }) => {
    await productActions.UserShouldBeAbleToAddProductToCart();
  });

  test('actions: adds the product to the wishlist', async ({ productActions }) => {
    await productActions.UserShouldBeAbleToAddProductToWishlist();
  });

  test('actions: adds the product to the compare list', async ({ productActions }) => {
    await productActions.UserShouldBeAbleToAddProductToCompareList();
  });

  test('actions: opens the email-a-friend form', async ({ productActions }) => {
    await productActions.UserShouldBeAbleToOpenEmailAFriendForm();
  });
});
