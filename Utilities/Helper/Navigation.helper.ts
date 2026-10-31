import { expect, Page } from '@playwright/test';
import { HeaderPage } from '@root/PageObjectModel/Header.page';
import { FooterPage } from '@root/PageObjectModel/Footer.page';
import { CatalogPage } from '@root/PageObjectModel/Catalog.page';
import ActionUtils from '@root/Utilities/ActionUtils';
import { urlFor } from '@root/Utilities/config/env.config';
import { escapeRegExp } from '@root/Utilities/textUtils';

/**
 * Helper = small, reusable steps and checks for ONE feature (here: site navigation -
 * top menu, left menu, breadcrumbs and footer links).
 * Actions (the next layer up) chain these steps into a full test scenario.
 */
export class NavigationHelper {
  private headerPage: HeaderPage;
  private footerPage: FooterPage;
  private catalogPage: CatalogPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.headerPage = new HeaderPage(page);
    this.footerPage = new FooterPage(page);
    this.catalogPage = new CatalogPage(page);
    this.runner = new ActionUtils(page);
  }

  // ---------- going to a page ----------

  /** Opens the home page and waits for the logo. */
  async GoToHomePage(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor());
    await this.runner.AssertElementVisible(this.headerPage.HeaderFeature.logo);
  }

  /** Opens any page of the site by its URL path, e.g. '/books'. */
  async GoToPath(path: string): Promise<void> {
    await this.runner.NavigateToUrl(urlFor(path));
  }

  // ---------- clicking menus and links ----------

  /** Clicks a main menu item, e.g. "Books". */
  async OpenTopMenuCategory(name: string): Promise<void> {
    await this.runner.ClickElement(this.headerPage.topMenuLink(name));
  }

  /** Hovers the main menu item to open its drop-down, then clicks the sub-category. */
  async OpenSubCategoryFromTopMenu(parent: string, name: string): Promise<void> {
    await this.runner.HoverElement(this.headerPage.topMenuLink(parent));
    const subLink = this.headerPage.topMenuSubLink(parent, name);
    await this.runner.AssertElementVisible(subLink);
    await this.runner.ClickElement(subLink);
  }

  /** Clicks a sub-category picture tile on a category page. */
  async OpenSubCategoryFromCategoryTile(name: string): Promise<void> {
    await this.runner.ClickElement(this.catalogPage.subCategoryTile(name));
  }

  /** Clicks a link in the left category menu. */
  async OpenFromLeftMenu(name: string): Promise<void> {
    await this.runner.ClickElement(this.catalogPage.leftMenuLink(name));
  }

  /** Scrolls to a footer link and clicks it. */
  async OpenFooterLink(name: string): Promise<void> {
    const link = this.footerPage.footerLink(name);
    await link.scrollIntoViewIfNeeded();
    await this.runner.ClickElement(link);
  }

  // ---------- assertions ----------

  /** The home page is open: right tab title, right URL, and the top menu is shown. */
  async AssertHomePageLoaded(): Promise<void> {
    await this.runner.AssertPageTitle(/demo web shop/i);
    await this.runner.AssertUrlMatches(new RegExp(`${escapeRegExp(urlFor())}?$`));
    await this.runner.AssertElementVisible(this.headerPage.HeaderFeature.topMenu);
  }

  /** The left menu is shown and contains every given link. */
  async AssertLeftMenuContains(names: string[]): Promise<void> {
    await this.runner.AssertElementVisible(this.catalogPage.CatalogFeature.leftCategoryMenu);
    for (const name of names) {
      await this.runner.AssertElementVisible(this.catalogPage.leftMenuLink(name));
    }
  }

  /** The URL ends with `path` (an optional trailing "/" or "?query" is fine) and the heading matches. */
  async AssertOnPage(path: string, heading: RegExp): Promise<void> {
    await this.runner.AssertUrlMatches(new RegExp(`${escapeRegExp(path)}/?(\\?.*)?$`, 'i'));
    await expect(this.catalogPage.CatalogFeature.pageHeading.first()).toHaveText(heading);
  }

  /** The breadcrumb trail is shown and contains every given name, e.g. Home > Computers. */
  async AssertBreadcrumbContains(names: string[]): Promise<void> {
    const breadcrumb = this.catalogPage.CatalogFeature.breadcrumb;
    await this.runner.AssertElementVisible(breadcrumb);
    for (const name of names) {
      await expect(breadcrumb).toContainText(exactNameRegexLoose(name));
    }
  }

  /** Clicking "Home" (first breadcrumb link) goes back to the landing page. */
  async AssertBreadcrumbHomeLinkWorks(): Promise<void> {
    const homeLink = this.catalogPage.CatalogFeature.breadcrumbLinks.first();
    await this.runner.ClickElement(homeLink);
    await this.runner.AssertUrlMatches(new RegExp(`${escapeRegExp(urlFor())}?$`));
  }

  /** The footer link with this name is shown. */
  async AssertFooterLinkVisible(name: string): Promise<void> {
    await this.runner.AssertElementVisible(this.footerPage.footerLink(name));
  }
}

/** Case-insensitive "contains" regex for a name (despite its name, it is NOT a whole-text match). */
function exactNameRegexLoose(name: string): RegExp {
  return new RegExp(escapeRegExp(name), 'i');
}
