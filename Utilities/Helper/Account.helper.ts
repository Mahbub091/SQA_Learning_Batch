import { expect, Page } from '@playwright/test';
import { AccountPage } from '../../PageObjectModel/Account.page';
import ActionUtils from '../ActionUtils';
import { urlFor } from '../config/env.config';
import { accountMessages } from '../testData/messages.data';
import { AccountAddressData, CustomerInfoData } from '../testData/account.data';

export class AccountHelper {
  private accountPage: AccountPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.accountPage = new AccountPage(page);
    this.runner = new ActionUtils(page);
  }

  // ---------- customer info ----------

  async GoToCustomerInfo(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor('/customer/info'));
    await this.runner.AssertElementVisible(this.accountPage.CustomerInfo.firstNameInput);
  }

  async UpdateCustomerInfo(data: CustomerInfoData): Promise<void> {
    await this.runner.TypeText(this.accountPage.CustomerInfo.firstNameInput, data.firstName);
    await this.runner.TypeText(this.accountPage.CustomerInfo.lastNameInput, data.lastName);
    await this.runner.TriggerAndWaitForNetworkIdle(() =>
      this.runner.ClickElement(this.accountPage.CustomerInfo.saveButton),
    );
  }

  async AssertCustomerInfoSaved(data: CustomerInfoData): Promise<void> {
    await this.runner.AssertElementContainsText(
      this.accountPage.CustomerInfo.notificationBar,
      accountMessages.infoUpdated,
    );
    const firstName = await this.runner.GetInputValue(this.accountPage.CustomerInfo.firstNameInput);
    const lastName = await this.runner.GetInputValue(this.accountPage.CustomerInfo.lastNameInput);
    expect(firstName).toBe(data.firstName);
    expect(lastName).toBe(data.lastName);
  }

  // ---------- addresses ----------

  async GoToAddresses(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor('/customer/addresses'));
    await this.runner.AssertElementVisible(this.accountPage.Addresses.container);
  }

  async ClickAddNewAddress(): Promise<void> {
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.ClickElement(this.accountPage.Addresses.addNewButton),
    );
  }

  async FillAddressForm(data: AccountAddressData): Promise<void> {
    const form = this.accountPage.AddressForm;
    await this.runner.TypeText(form.firstNameInput, data.firstName);
    await this.runner.TypeText(form.lastNameInput, data.lastName);
    await this.runner.TypeText(form.emailInput, data.email);
    await this.runner.TypeText(form.companyInput, data.company);
    await this.runner.SelectOptionByLabel(form.countrySelect, data.country);

    const stateVisible = await this.runner.IsElementVisible(form.stateSelect);
    if (stateVisible) {
      await this.runner.SelectOptionByLabel(form.stateSelect, data.state);
    }

    await this.runner.TypeText(form.cityInput, data.city);
    await this.runner.TypeText(form.address1Input, data.address1);
    await this.runner.TypeText(form.address2Input, data.address2);
    await this.runner.TypeText(form.zipInput, data.zipPostalCode);
    await this.runner.TypeText(form.phoneInput, data.phoneNumber);
    await this.runner.TypeText(form.faxInput, data.faxNumber);
  }

  async SaveAddress(): Promise<void> {
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.ClickElement(this.accountPage.AddressForm.saveButton),
    );
  }

  async AddAddress(data: AccountAddressData): Promise<void> {
    await this.ClickAddNewAddress();
    await this.FillAddressForm(data);
    await this.SaveAddress();
  }

  async AssertAddressInList(text: string): Promise<void> {
    await this.runner.AssertElementVisible(this.accountPage.addressItemByText(text));
  }

  async AssertAddressNotInList(text: string): Promise<void> {
    const count = await this.runner.CountElements(this.accountPage.addressItemByText(text));
    expect(count, `address containing "${text}" should no longer be in the address book`).toBe(0);
  }

  async EditAddress(matchText: string, changes: Partial<AccountAddressData>): Promise<void> {
    const item = this.accountPage.addressItemByText(matchText);
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.ClickElement(this.accountPage.editButtonFor(item)),
    );

    const form = this.accountPage.AddressForm;
    if (changes.city) await this.runner.TypeText(form.cityInput, changes.city);
    if (changes.address1) await this.runner.TypeText(form.address1Input, changes.address1);
    await this.SaveAddress();
  }

  /** nopCommerce confirms address deletion with a JS confirm() dialog before posting the delete. */
  async DeleteAddress(matchText: string): Promise<void> {
    const item = this.accountPage.addressItemByText(matchText);
    const deleteButton = this.accountPage.deleteButtonFor(item);
    await this.runner.CaptureDialogMessage(() => this.runner.ClickElement(deleteButton));
    await this.runner.page.waitForLoadState('networkidle');
  }

  // ---------- order history / order details ----------

  async GoToOrders(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor('/customer/orders'));
    await this.runner.AssertElementVisible(this.accountPage.Orders.container);
  }

  async AssertOrderInHistory(text: string): Promise<void> {
    await this.runner.AssertElementVisible(this.accountPage.orderItemByText(text));
  }

  async OpenOrderDetails(matchText: string): Promise<void> {
    const item = this.accountPage.orderItemByText(matchText);
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.ClickElement(this.accountPage.detailsLinkFor(item)),
    );
  }

  async AssertOrderDetailsShowOrderNumber(): Promise<void> {
    await this.runner.AssertElementVisible(this.accountPage.OrderDetails.container);
    const text = await this.runner.GetElementText(this.accountPage.OrderDetails.orderNumber);
    expect(/\d/.test(text), `order details should show an order number, got: "${text}"`).toBe(true);
  }

  async ClickReorder(matchText: string): Promise<void> {
    const item = this.accountPage.orderItemByText(matchText);
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.ClickElement(this.accountPage.reorderButtonFor(item)),
    );
  }

  /** Reorder should land on the cart (or shopping cart confirmation) with the order's item in it. */
  async AssertReorderReachedCart(): Promise<void> {
    await this.runner.AssertUrlMatches(/cart/i);
  }

  async DownloadPdfInvoice(): Promise<string> {
    const downloadPromise = this.runner.page.waitForEvent('download');
    await this.runner.ClickElement(this.accountPage.OrderDetails.pdfInvoiceButton);
    const download = await downloadPromise;
    return download.suggestedFilename();
  }

  // ---------- change password ----------

  async GoToChangePassword(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor('/customer/changepassword'));
    await this.runner.AssertElementVisible(this.accountPage.ChangePassword.oldPasswordInput);
  }

  async SubmitPasswordChange(
    oldPassword: string,
    newPassword: string,
    confirmNewPassword: string = newPassword,
  ): Promise<void> {
    const form = this.accountPage.ChangePassword;
    await this.runner.TypeText(form.oldPasswordInput, oldPassword);
    await this.runner.TypeText(form.newPasswordInput, newPassword);
    await this.runner.TypeText(form.confirmNewPasswordInput, confirmNewPassword);
    await this.runner.TriggerAndWaitForNetworkIdle(() => this.runner.ClickElement(form.saveButton));
  }

  async AssertPasswordChangeResult(message: RegExp): Promise<void> {
    await this.runner.AssertElementContainsText(this.accountPage.ChangePassword.result, message);
  }

  // ---------- downloadable products / back-in-stock subscriptions ----------

  async GoToDownloadableProducts(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor('/customer/downloadableproducts'));
    await this.runner.AssertElementVisible(this.accountPage.DownloadableProducts.container);
  }

  async GoToBackInStockSubscriptions(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor('/backinstocksubscriptions'));
    await this.runner.AssertElementVisible(this.accountPage.BackInStockSubscriptions.container);
  }
}
