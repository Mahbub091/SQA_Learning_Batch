import { Page, Locator } from '@playwright/test';
import { exactNameRegex } from '../Utilities/textUtils';

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

  footerLink(name: string): Locator {
    return this.page.locator(`css=.footer`).getByRole('link', { name: exactNameRegex(name) });
  }
}
