import { Page, Locator } from '@playwright/test';

/**
 * Everything under "My account": customer info, the address book, order history + order details,
 * change password, downloadable products and back-in-stock subscriptions.
 *
 * Field ids/classes follow nopCommerce's conventional MVC views for these pages
 * (CustomerInfo: FirstName/LastName/Email/Newsletter; CustomerAddress: Address_* prefixed fields;
 * ChangePassword: OldPassword/NewPassword/ConfirmNewPassword; order list/detail: .order-item,
 * .order-details-area, .pdf-invoice-button). None of this has been checked against this Demo Web
 * Shop instance's live DOM, so verify it (and adjust) the first time this file is run — see the
 * README note on unverified locators. Several lookups below are deliberately text/label-based
 * (addressItemByText, orderItemByText) rather than guessed CSS classes, for the same resilience
 * reason as Cart.page.ts's totalRowByLabel.
 */
export class AccountPage {
  readonly CustomerInfo: {
    readonly container: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly emailInput: Locator;
    readonly newsletterCheckbox: Locator;
    readonly saveButton: Locator;
    readonly notificationBar: Locator;
  };

  readonly Addresses: {
    readonly container: Locator;
    readonly items: Locator;
    readonly addNewButton: Locator;
  };

  readonly AddressForm: {
    readonly container: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly emailInput: Locator;
    readonly companyInput: Locator;
    readonly countrySelect: Locator;
    readonly stateSelect: Locator;
    readonly cityInput: Locator;
    readonly address1Input: Locator;
    readonly address2Input: Locator;
    readonly zipInput: Locator;
    readonly phoneInput: Locator;
    readonly faxInput: Locator;
    readonly saveButton: Locator;
  };

  readonly Orders: {
    readonly container: Locator;
    readonly items: Locator;
    readonly emptyMessage: Locator;
  };

  readonly OrderDetails: {
    readonly container: Locator;
    readonly orderNumber: Locator;
    readonly pdfInvoiceButton: Locator;
  };

  readonly ChangePassword: {
    readonly container: Locator;
    readonly oldPasswordInput: Locator;
    readonly newPasswordInput: Locator;
    readonly confirmNewPasswordInput: Locator;
    readonly saveButton: Locator;
    readonly result: Locator;
  };

  readonly DownloadableProducts: {
    readonly container: Locator;
  };

  readonly BackInStockSubscriptions: {
    readonly container: Locator;
  };

  constructor(private page: Page) {
    this.CustomerInfo = {
      container: this.page.locator(`css=.customer-info, #customer-info-form`),
      firstNameInput: this.page.locator(`css=#FirstName`),
      lastNameInput: this.page.locator(`css=#LastName`),
      emailInput: this.page.locator(`css=#Email`),
      newsletterCheckbox: this.page.locator(`css=#Newsletter`),
      saveButton: this.page.locator(`css=.save-customer-info-button, input[value='Save']`),
      notificationBar: this.page.locator(`css=.bar-notification.success .content`),
    };

    this.Addresses = {
      container: this.page.locator(`css=.address-list, .addresses`),
      items: this.page.locator(`css=.address-item`),
      addNewButton: this.page.locator(`css=.add-address-button`),
    };

    this.AddressForm = {
      container: this.page.locator(`css=.address-form, #address-form`),
      firstNameInput: this.page.locator(`css=#Address_FirstName`),
      lastNameInput: this.page.locator(`css=#Address_LastName`),
      emailInput: this.page.locator(`css=#Address_Email`),
      companyInput: this.page.locator(`css=#Address_Company`),
      countrySelect: this.page.locator(`css=#Address_CountryId`),
      stateSelect: this.page.locator(`css=#Address_StateProvinceId`),
      cityInput: this.page.locator(`css=#Address_City`),
      address1Input: this.page.locator(`css=#Address_Address1`),
      address2Input: this.page.locator(`css=#Address_Address2`),
      zipInput: this.page.locator(`css=#Address_ZipPostalCode`),
      phoneInput: this.page.locator(`css=#Address_PhoneNumber`),
      faxInput: this.page.locator(`css=#Address_FaxNumber`),
      saveButton: this.page.locator(`css=.save-address-button`),
    };

    this.Orders = {
      container: this.page.locator(`css=.order-list, #customer-orders`),
      items: this.page.locator(`css=.order-item`),
      emptyMessage: this.page.locator(`css=.no-data`),
    };

    this.OrderDetails = {
      container: this.page.locator(`css=.order-details-area`),
      orderNumber: this.page.locator(`css=.order-details-area .order-number`),
      pdfInvoiceButton: this.page.locator(`css=.pdf-invoice-button`),
    };

    this.ChangePassword = {
      container: this.page.locator(`css=.change-password-page, #change-password-form`),
      oldPasswordInput: this.page.locator(`css=#OldPassword`),
      newPasswordInput: this.page.locator(`css=#NewPassword`),
      confirmNewPasswordInput: this.page.locator(`css=#ConfirmNewPassword`),
      saveButton: this.page.locator(`css=.change-password-button`),
      result: this.page.locator(`css=.change-password-page .result, .result`),
    };

    this.DownloadableProducts = {
      container: this.page.locator(`css=.downloadable-products, #customer-downloadable-products`),
    };

    this.BackInStockSubscriptions = {
      container: this.page.locator(`css=.subscriptions, #customer-subscriptions`),
    };
  }

  /** An address card in the address book, found by any text it contains (name, city, street...). */
  addressItemByText(text: string): Locator {
    return this.Addresses.items.filter({ hasText: text });
  }

  editButtonFor(addressItem: Locator): Locator {
    return addressItem.locator(`css=.edit-address-button`);
  }

  deleteButtonFor(addressItem: Locator): Locator {
    return addressItem.locator(`css=.delete-address-button`);
  }

  /** An order row in order history, found by text it contains (product name or order number). */
  orderItemByText(text: string): Locator {
    return this.Orders.items.filter({ hasText: text });
  }

  detailsLinkFor(orderItem: Locator): Locator {
    return orderItem.getByRole('link', { name: /order details/i });
  }

  reorderButtonFor(orderItem: Locator): Locator {
    return orderItem.locator(`css=.re-order-button`);
  }
}
