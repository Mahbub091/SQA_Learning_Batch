import { test } from '../Utilities/fixtures/base.fixture';

test.describe('My account', { tag: ['@account'] }, () => {
  test(
    'customer info: first and last name can be edited and saved',
    { tag: ['@e2e', '@smoke'] },
    async ({ accountActions }) => {
      await accountActions.UserShouldBeAbleToUpdateCustomerInfo();
    },
  );

  test('addresses: a new address can be added', { tag: ['@e2e'] }, async ({ accountActions }) => {
    await accountActions.UserShouldBeAbleToAddANewAddress();
  });

  test('addresses: an existing address can be edited', async ({ accountActions }) => {
    await accountActions.UserShouldBeAbleToEditAnExistingAddress();
  });

  test('addresses: an address can be deleted', async ({ accountActions }) => {
    await accountActions.UserShouldBeAbleToDeleteAnAddress();
  });

  test(
    'order history: a placed order appears in the order list',
    { tag: ['@e2e'] },
    async ({ accountActions }) => {
      await accountActions.PlacedOrderShouldAppearInOrderHistory();
    },
  );

  test('order details: the details page shows an order number', async ({ accountActions }) => {
    await accountActions.OrderDetailsPageShouldShowOrderNumber();
  });

  test(
    'order history: re-order adds the previous items back to the cart',
    { tag: ['@e2e'] },
    async ({ accountActions }) => {
      await accountActions.ReorderShouldAddPreviousItemsBackToCart();
    },
  );

  test('order details: the PDF invoice can be downloaded', async ({ accountActions }) => {
    await accountActions.UserShouldBeAbleToDownloadPdfInvoice();
  });

  test('change password: the wrong old password is rejected', async ({ accountActions }) => {
    await accountActions.ChangePasswordShouldRejectWrongOldPassword();
  });

  test('change password: a too-short new password is rejected', async ({ accountActions }) => {
    await accountActions.ChangePasswordShouldRejectTooShortNewPassword();
  });

  test('change password: a mismatched confirmation is rejected', async ({ accountActions }) => {
    await accountActions.ChangePasswordShouldRejectMismatchedConfirmation();
  });

  test(
    'change password: a valid change succeeds and the new password can log in',
    { tag: ['@e2e'] },
    async ({ accountActions }) => {
      await accountActions.UserShouldBeAbleToChangePasswordAndLoginWithNewPassword();
    },
  );

  test('downloadable products: the page is reachable', async ({ accountActions }) => {
    await accountActions.DownloadableProductsPageShouldBeAccessible();
  });

  test('back-in-stock subscriptions: the page is reachable', async ({ accountActions }) => {
    await accountActions.BackInStockSubscriptionsPageShouldBeAccessible();
  });
});
