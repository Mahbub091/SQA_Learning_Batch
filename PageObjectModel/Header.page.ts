import { Page, Locator } from '@playwright/test';
import { exactNameRegex } from '../Utilities/textUtils';

export class HeaderPage {
  readonly HeaderFeature: {
    readonly logo: Locator;
    readonly topMenu: Locator;
    readonly topMenuSubLists: Locator;
  };

  readonly SearchBox: {
    readonly searchInput: Locator;
    readonly searchButton: Locator;
  };

  readonly HeaderLinks: {
    readonly cartLink: Locator;
    readonly wishlistLink: Locator;
    readonly compareLink: Locator;
  };

  constructor(private page: Page) {
    this.HeaderFeature = {
      logo: this.page.locator(`css=.header-logo a`),
      topMenu: this.page.locator(`css=.top-menu`),
      topMenuSubLists: this.page.locator(`css=.top-menu .sublist`),
    };

    this.SearchBox = {
      searchInput: this.page.locator(`css=input#small-searchterms`),
      searchButton: this.page.locator(`css=input.search-box-button`),
    };

    this.HeaderLinks = {
      cartLink: this.page.locator(`css=.ico-cart`),
      wishlistLink: this.page.locator(`css=.ico-wishlist`),
      compareLink: this.page.locator(`css=.ico-compare`),
    };
  }

  topMenuLink(name: string): Locator {
    return this.page.locator(`css=.top-menu`).getByRole('link', { name: exactNameRegex(name) });
  }

  topMenuSubLink(parent: string, name: string): Locator {
    return this.page
      .locator(`css=.top-menu > li`)
      .filter({ has: this.topMenuLink(parent) })
      .getByRole('link', { name: exactNameRegex(name) });
  }
}
