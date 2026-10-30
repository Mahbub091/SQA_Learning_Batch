import { Page } from '@playwright/test';
import { NavigationHelper } from '@root/Helper/Navigation.helper';
import { CategoryData, FooterLinkData, SubCategoryData } from '@root/testData/catalog.data';

export default class NavigationAction {
  private navigationHelper: NavigationHelper;

  constructor(page: Page) {
    this.navigationHelper = new NavigationHelper(page);
  }

  async UserShouldLandOnTheHomePage(): Promise<void> {
    await this.navigationHelper.GoToHomePage();
    await this.navigationHelper.AssertHomePageLoaded();
  }

  async UserShouldReachCategoryFromTopMenu(category: CategoryData): Promise<void> {
    await this.navigationHelper.GoToHomePage();
    await this.navigationHelper.OpenTopMenuCategory(category.name);
    await this.navigationHelper.AssertOnPage(category.path, category.heading);
  }

  async UserShouldReachSubCategoryFromTopMenu(sub: SubCategoryData): Promise<void> {
    await this.navigationHelper.GoToHomePage();
    await this.navigationHelper.OpenSubCategoryFromTopMenu(sub.parent, sub.name);
    await this.navigationHelper.AssertOnPage(sub.path, sub.heading);
  }

  async UserShouldReachSubCategoryFromCategoryPage(sub: SubCategoryData): Promise<void> {
    await this.navigationHelper.GoToPath(sub.parentPath);
    await this.navigationHelper.OpenSubCategoryFromCategoryTile(sub.name);
    await this.navigationHelper.AssertOnPage(sub.path, sub.heading);
  }

  async UserShouldSeeBreadcrumbOnCategoryPage(category: CategoryData): Promise<void> {
    await this.navigationHelper.GoToPath(category.path);
    await this.navigationHelper.AssertBreadcrumbContains(['Home', category.name]);
  }

  async UserShouldSeeBreadcrumbOnSubCategoryPage(sub: SubCategoryData): Promise<void> {
    await this.navigationHelper.GoToPath(sub.path);
    await this.navigationHelper.AssertBreadcrumbContains(['Home', sub.parent, sub.name]);
  }

  async UserShouldReturnHomeFromBreadcrumb(category: CategoryData): Promise<void> {
    await this.navigationHelper.GoToPath(category.path);
    await this.navigationHelper.AssertBreadcrumbHomeLinkWorks();
    await this.navigationHelper.AssertHomePageLoaded();
  }

  async UserShouldSeeLeftMenuWithSubCategories(sub: SubCategoryData): Promise<void> {
    await this.navigationHelper.GoToPath(sub.parentPath);
    await this.navigationHelper.AssertLeftMenuContains([sub.parent, sub.name]);
  }

  async UserShouldReachSubCategoryFromLeftMenu(sub: SubCategoryData): Promise<void> {
    await this.navigationHelper.GoToPath(sub.parentPath);
    await this.navigationHelper.OpenFromLeftMenu(sub.name);
    await this.navigationHelper.AssertOnPage(sub.path, sub.heading);
  }

  async UserShouldReachCategoryFromLeftMenu(category: CategoryData): Promise<void> {
    await this.navigationHelper.GoToHomePage();
    await this.navigationHelper.OpenFromLeftMenu(category.name);
    await this.navigationHelper.AssertOnPage(category.path, category.heading);
  }

  async UserShouldReachPageFromFooterLink(link: FooterLinkData): Promise<void> {
    await this.navigationHelper.GoToHomePage();
    await this.navigationHelper.AssertFooterLinkVisible(link.name);
    await this.navigationHelper.OpenFooterLink(link.name);
    await this.navigationHelper.AssertOnPage(link.path, link.heading);
  }
}
