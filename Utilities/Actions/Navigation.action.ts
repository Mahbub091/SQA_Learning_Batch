import { Page } from '@playwright/test';
import { NavigationHelper } from '@root/Utilities/Helper/Navigation.helper';
import {
  CategoryData,
  FooterLinkData,
  SubCategoryData,
} from '@root/Utilities/testData/catalog.data';

/**
 * Action = a complete test scenario, written as a chain of helper steps.
 * Method names read like a sentence ("User should ..."), so a spec stays one readable line.
 * This class covers the Navigation scenarios (menus, breadcrumbs, footer links).
 */
export default class NavigationAction {
  private navigationHelper: NavigationHelper;

  constructor(page: Page) {
    this.navigationHelper = new NavigationHelper(page);
  }

  /** The landing page opens with the right title, URL and top menu. */
  async UserShouldLandOnTheHomePage(): Promise<void> {
    await this.navigationHelper.GoToHomePage();
    await this.navigationHelper.AssertHomePageLoaded();
  }

  /** Clicking a main-menu category opens that category's page. */
  async UserShouldReachCategoryFromTopMenu(category: CategoryData): Promise<void> {
    await this.navigationHelper.GoToHomePage();
    await this.navigationHelper.OpenTopMenuCategory(category.name);
    await this.navigationHelper.AssertOnPage(category.path, category.heading);
  }

  /** Hovering a main-menu item and clicking its sub-category opens the sub-category page. */
  async UserShouldReachSubCategoryFromTopMenu(sub: SubCategoryData): Promise<void> {
    await this.navigationHelper.GoToHomePage();
    await this.navigationHelper.OpenSubCategoryFromTopMenu(sub.parent, sub.name);
    await this.navigationHelper.AssertOnPage(sub.path, sub.heading);
  }

  /** Clicking a sub-category picture tile on the parent category page opens it. */
  async UserShouldReachSubCategoryFromCategoryPage(sub: SubCategoryData): Promise<void> {
    await this.navigationHelper.GoToPath(sub.parentPath);
    await this.navigationHelper.OpenSubCategoryFromCategoryTile(sub.name);
    await this.navigationHelper.AssertOnPage(sub.path, sub.heading);
  }

  /** A category page shows the breadcrumb "Home > Category". */
  async UserShouldSeeBreadcrumbOnCategoryPage(category: CategoryData): Promise<void> {
    await this.navigationHelper.GoToPath(category.path);
    await this.navigationHelper.AssertBreadcrumbContains(['Home', category.name]);
  }

  /** A sub-category page shows the breadcrumb "Home > Parent > Sub-category". */
  async UserShouldSeeBreadcrumbOnSubCategoryPage(sub: SubCategoryData): Promise<void> {
    await this.navigationHelper.GoToPath(sub.path);
    await this.navigationHelper.AssertBreadcrumbContains(['Home', sub.parent, sub.name]);
  }

  /** The "Home" link of the breadcrumb returns to the landing page. */
  async UserShouldReturnHomeFromBreadcrumb(category: CategoryData): Promise<void> {
    await this.navigationHelper.GoToPath(category.path);
    await this.navigationHelper.AssertBreadcrumbHomeLinkWorks();
    await this.navigationHelper.AssertHomePageLoaded();
  }

  /** The left menu of a parent category lists the parent and its sub-category. */
  async UserShouldSeeLeftMenuWithSubCategories(sub: SubCategoryData): Promise<void> {
    await this.navigationHelper.GoToPath(sub.parentPath);
    await this.navigationHelper.AssertLeftMenuContains([sub.parent, sub.name]);
  }

  /** Clicking a sub-category in the left menu opens its page. */
  async UserShouldReachSubCategoryFromLeftMenu(sub: SubCategoryData): Promise<void> {
    await this.navigationHelper.GoToPath(sub.parentPath);
    await this.navigationHelper.OpenFromLeftMenu(sub.name);
    await this.navigationHelper.AssertOnPage(sub.path, sub.heading);
  }

  /** Clicking a category in the left menu (shown on the home page) opens its page. */
  async UserShouldReachCategoryFromLeftMenu(category: CategoryData): Promise<void> {
    await this.navigationHelper.GoToHomePage();
    await this.navigationHelper.OpenFromLeftMenu(category.name);
    await this.navigationHelper.AssertOnPage(category.path, category.heading);
  }

  /** Clicking a footer link opens the matching page. */
  async UserShouldReachPageFromFooterLink(link: FooterLinkData): Promise<void> {
    await this.navigationHelper.GoToHomePage();
    await this.navigationHelper.AssertFooterLinkVisible(link.name);
    await this.navigationHelper.OpenFooterLink(link.name);
    await this.navigationHelper.AssertOnPage(link.path, link.heading);
  }
}
