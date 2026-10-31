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
