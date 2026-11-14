import { test } from '@root/Utilities/fixtures/base.fixture';
import { SortKey } from '@root/Utilities/Actions/Catalog.action';

const sortKeys: SortKey[] = ['nameAsc', 'nameDesc', 'priceAsc', 'priceDesc', 'createdOn'];

test.describe('Catalog', { tag: ['@catalog'] }, () => {
  test('sorting: offers every sort option', async ({ catalogActions }) => {
    await catalogActions.UserShouldSeeAllSortOptions();
  });

  for (const sortKey of sortKeys) {
    test(`sorting: sorts by ${sortKey}`, async ({ catalogActions }) => {
      await catalogActions.UserShouldBeAbleToSort(sortKey);
    });
  }

  test('changes the page size', async ({ catalogActions }) => {
    await catalogActions.UserShouldBeAbleToChangePageSize();
  });

  test('switches between grid and list view', async ({ catalogActions }) => {
    await catalogActions.UserShouldBeAbleToSwitchBetweenGridAndListView();
  });

  test('filters by price range where available', async ({ catalogActions }) => {
    await catalogActions.UserShouldBeAbleToFilterByPriceRange();
  });

  test('paginates when the category has enough products', async ({ catalogActions }) => {
    await catalogActions.UserShouldBeAbleToPaginate();
  });
});
