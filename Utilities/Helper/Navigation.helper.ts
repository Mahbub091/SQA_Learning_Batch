import { expect, Page } from '@playwright/test';
import { HeaderPage } from '../../PageObjectModel/Header.page';
import { FooterPage } from '../../PageObjectModel/Footer.page';
import { CatalogPage } from '../../PageObjectModel/Catalog.page';
import ActionUtils from '../ActionUtils';
import { urlFor } from '../config/env.config';
import { escapeRegExp } from '../textUtils';

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

  async GoToHomePage(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor());
    await this.runner.AssertElementVisible(this.headerPage.HeaderFeature.logo);
  }

  async GoToPath(path: string): Promise<void> {
    await this.runner.NavigateToUrl(urlFor(path));
  }

  async AssertHomePageLoaded(): Promise<void> {
    await this.runner.AssertPageTitle(/demo web shop/i);
    await this.runner.AssertUrlMatches(new RegExp(`${escapeRegExp(urlFor())}?$`));
    await this.runner.AssertElementVisible(this.headerPage.HeaderFeature.topMenu);
  }

  async OpenTopMenuCategory(name: string): Promise<void> {
    await this.runner.ClickElement(this.headerPage.topMenuLink(name));
  }

  async OpenSubCategoryFromTopMenu(parent: string, name: string): Promise<void> {
    await this.runner.HoverElement(this.headerPage.topMenuLink(parent));
    const subLink = this.headerPage.topMenuSubLink(parent, name);
    await this.runner.AssertElementVisible(subLink);
    await this.runner.ClickElement(subLink);
  }

  async OpenSubCategoryFromCategoryTile(name: string): Promise<void> {
    await this.runner.ClickElement(this.catalogPage.subCategoryTile(name));
  }

  async OpenFromLeftMenu(name: string): Promise<void> {
    await this.runner.ClickElement(this.catalogPage.leftMenuLink(name));
  }

  async AssertLeftMenuContains(names: string[]): Promise<void> {
    await this.runner.AssertElementVisible(this.catalogPage.CatalogFeature.leftCategoryMenu);
    for (const name of names) {
      await this.runner.AssertElementVisible(this.catalogPage.leftMenuLink(name));
    }
  }

  async AssertOnPage(path: string, heading: RegExp): Promise<void> {
    await this.runner.AssertUrlMatches(new RegExp(`${escapeRegExp(path)}/?(\\?.*)?$`, 'i'));
    await expect(this.catalogPage.CatalogFeature.pageHeading.first()).toHaveText(heading);
  }

  async AssertBreadcrumbContains(names: string[]): Promise<void> {
    const breadcrumb = this.catalogPage.CatalogFeature.breadcrumb;
    await this.runner.AssertElementVisible(breadcrumb);
    for (const name of names) {
      await expect(breadcrumb).toContainText(exactNameRegexLoose(name));
    }
  }

  async AssertBreadcrumbHomeLinkWorks(): Promise<void> {
    const homeLink = this.catalogPage.CatalogFeature.breadcrumbLinks.first();
    await this.runner.ClickElement(homeLink);
    await this.runner.AssertUrlMatches(new RegExp(`${escapeRegExp(urlFor())}?$`));
  }

  async OpenFooterLink(name: string): Promise<void> {
    const link = this.footerPage.footerLink(name);
    await link.scrollIntoViewIfNeeded();
    await this.runner.ClickElement(link);
  }

  async AssertFooterLinkVisible(name: string): Promise<void> {
    await this.runner.AssertElementVisible(this.footerPage.footerLink(name));
  }
}

function exactNameRegexLoose(name: string): RegExp {
  return new RegExp(escapeRegExp(name), 'i');
}
