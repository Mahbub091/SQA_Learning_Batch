import { Page, Locator } from '@playwright/test';

/**
 * The "email a friend" page nopCommerce opens from a product's email-a-friend link.
 * Field ids follow the ProductEmailAFriendModel's property names.
 */
export class EmailAFriendPage {
  readonly EmailForm: {
    readonly friendEmailInput: Locator;
    readonly yourEmailInput: Locator;
    readonly personalMessageInput: Locator;
    readonly sendButton: Locator;
  };

  readonly Messages: {
    readonly result: Locator;
    readonly friendEmailError: Locator;
    readonly yourEmailError: Locator;
  };

  constructor(private page: Page) {
    this.EmailForm = {
      friendEmailInput: this.page.locator(`css=#FriendEmail`),
      yourEmailInput: this.page.locator(`css=#YourEmailAddress`),
      personalMessageInput: this.page.locator(`css=#PersonalMessage`),
      sendButton: this.page.locator(`css=input[value='Send Email'], button:has-text('Send Email')`),
    };

    this.Messages = {
      result: this.page.locator(`css=.result`),
      friendEmailError: this.page.locator(`css=span[data-valmsg-for='FriendEmail']`),
      yourEmailError: this.page.locator(`css=span[data-valmsg-for='YourEmailAddress']`),
    };
  }
}
