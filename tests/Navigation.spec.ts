import { test } from '../Utilities/fixtures/base.fixture';
import { footerLinks, subCategories, topCategories } from '../Utilities/testData/catalog.data';

test.describe('Navigation', { tag: ['@navigation'] }, () => {
  test('lands on the home page', { tag: ['@e2e', '@smoke'] }, async ({ navigationActions }) => {
    await navigationActions.UserShouldLandOnTheHomePage();
  });

  test.describe('top menu categories', () => {
    for (const category of topCategories) {
      test(`${category.name} opens the right page`, async ({ navigationActions }) => {
        await navigationActions.UserShouldReachCategoryFromTopMenu(category);
      });
    }
  });

  test.describe('sub-categories', () => {
    for (const sub of subCategories) {
      test(`${sub.parent} > ${sub.name} via the top menu`, async ({ navigationActions }) => {
        await navigationActions.UserShouldReachSubCategoryFromTopMenu(sub);
      });

      test(`${sub.parent} > ${sub.name} via the category page`, async ({ navigationActions }) => {
        await navigationActions.UserShouldReachSubCategoryFromCategoryPage(sub);
      });
    }
  });

  test.describe('breadcrumbs', () => {
    for (const category of topCategories) {
      test(`${category.name} shows Home > ${category.name}`, async ({ navigationActions }) => {
        await navigationActions.UserShouldSeeBreadcrumbOnCategoryPage(category);
      });
    }

    for (const sub of subCategories) {
      test(`${sub.name} shows Home > ${sub.parent} > ${sub.name}`, async ({
        navigationActions,
      }) => {
        await navigationActions.UserShouldSeeBreadcrumbOnSubCategoryPage(sub);
      });
    }

    test('Home link returns to the landing page', async ({ navigationActions }) => {
      await navigationActions.UserShouldReturnHomeFromBreadcrumb(topCategories[0]);
    });
  });

  test.describe('left category menu', () => {
    for (const category of topCategories) {
      test(`${category.name} link works`, async ({ navigationActions }) => {
        await navigationActions.UserShouldReachCategoryFromLeftMenu(category);
      });
    }

    for (const sub of subCategories) {
      test(`${sub.parent} menu lists ${sub.name}`, async ({ navigationActions }) => {
        await navigationActions.UserShouldSeeLeftMenuWithSubCategories(sub);
      });

      test(`${sub.name} opens from the left menu`, async ({ navigationActions }) => {
        await navigationActions.UserShouldReachSubCategoryFromLeftMenu(sub);
      });
    }
  });

  test.describe('footer links', () => {
    for (const link of footerLinks) {
      test(`${link.name} opens the right page`, async ({ navigationActions }) => {
        await navigationActions.UserShouldReachPageFromFooterLink(link);
      });
    }
  });
});
