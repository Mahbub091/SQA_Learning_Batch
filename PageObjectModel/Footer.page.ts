import { Page, Locator } from '@playwright/test';
import { exactNameRegex } from '@root/Utilities/textUtils';

/**
 * Page object for the footer that appears at the bottom of every page.
 * A page object only describes WHERE things are (locators); it never clicks or asserts.
 */
export class FooterPage {
  readonly FooterFeature: {
    readonly footer: Locator;
    readonly footerLinks: Locator;
  };

  constructor(private page: Page) {
    this.FooterFeature = {
      footer: this.page.locator(`css=.footer`),
      footerLinks: this.page.locator(`css=.footer a`),
    };
  }

  /** A single footer link found by its exact visible text, e.g. "About us". */
  footerLink(name: string): Locator {
    return this.page.locator(`css=.footer`).getByRole('link', { name: exactNameRegex(name) });
  }
}
