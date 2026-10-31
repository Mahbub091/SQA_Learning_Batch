import { Page, Locator } from '@playwright/test';
import { exactNameRegex } from '@root/Utilities/textUtils';

/**
 * Page object for the header at the top of every page: logo, main menu and the search box.
 * A page object only describes WHERE things are (locators); it never clicks or asserts.
 */
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

  /** A link in the main menu found by its exact text, e.g. "Computers". */
  topMenuLink(name: string): Locator {
    return this.page.locator(`css=.top-menu`).getByRole('link', { name: exactNameRegex(name) });
  }

  /** A link in the drop-down that opens under a main menu item, e.g. "Computers" > "Desktops". */
  topMenuSubLink(parent: string, name: string): Locator {
    return this.page
      .locator(`css=.top-menu > li`)
      .filter({ has: this.topMenuLink(parent) })
      .getByRole('link', { name: exactNameRegex(name) });
  }
}
