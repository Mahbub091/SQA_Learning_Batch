import { Page } from "@playwright/test";
import { Locator } from "@playwright/test";

export class LoginPage {
  readonly headerLogo: Locator;

  constructor(private page: Page) {
    this.headerLogo = this.page.locator(
      `css=img[alt='Tricentis Demo Web Shop']`,
    );
  }
}