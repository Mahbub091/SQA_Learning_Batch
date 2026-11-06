import { test } from '../Utilities/fixtures/base.fixture';
import { footerLinks, subCategories, topCategories } from '../Utilities/testData/catalog.data';

test.describe('Navigation', { tag: ['@navigation'] }, () => {
  test('lands on the home page', { tag: ['@e2e', '@smoke'] }, async ({ navigationActions }) => {
    await navigationActions.UserShouldLandOnTheHomePage();
  });

  for (const category of topCategories) {
    test(`top menu: ${category.name} opens the right page`, async ({ navigationActions }) => {
      await navigationActions.UserShouldReachCategoryFromTopMenu(category);
    });
  }

  for (const sub of subCategories) {
    test(`sub-category: ${sub.parent} > ${sub.name} via the top menu`, async ({
      navigationActions,
    }) => {
      await navigationActions.UserShouldReachSubCategoryFromTopMenu(sub);
    });

    test(`sub-category: ${sub.parent} > ${sub.name} via the category page`, async ({
      navigationActions,
    }) => {
      await navigationActions.UserShouldReachSubCategoryFromCategoryPage(sub);
    });
  }

  for (const category of topCategories) {
    test(`breadcrumb: ${category.name} shows Home > ${category.name}`, async ({
      navigationActions,
    }) => {
      await navigationActions.UserShouldSeeBreadcrumbOnCategoryPage(category);
    });
  }

  for (const sub of subCategories) {
    test(`breadcrumb: ${sub.name} shows Home > ${sub.parent} > ${sub.name}`, async ({
      navigationActions,
    }) => {
      await navigationActions.UserShouldSeeBreadcrumbOnSubCategoryPage(sub);
    });
  }

  test('breadcrumb: Home link returns to the landing page', async ({ navigationActions }) => {
    await navigationActions.UserShouldReturnHomeFromBreadcrumb(topCategories[0]);
  });

  for (const category of topCategories) {
    test(`left menu: ${category.name} link works`, async ({ navigationActions }) => {
      await navigationActions.UserShouldReachCategoryFromLeftMenu(category);
    });
  }

  for (const sub of subCategories) {
    test(`left menu: ${sub.parent} menu lists ${sub.name}`, async ({ navigationActions }) => {
      await navigationActions.UserShouldSeeLeftMenuWithSubCategories(sub);
    });

    test(`left menu: ${sub.name} opens from the left menu`, async ({ navigationActions }) => {
      await navigationActions.UserShouldReachSubCategoryFromLeftMenu(sub);
    });
  }

  for (const link of footerLinks) {
    test(`footer: ${link.name} opens the right page`, async ({ navigationActions }) => {
      await navigationActions.UserShouldReachPageFromFooterLink(link);
    });
  }
});
