import { test } from '@root/Utilities/fixtures/base.fixture';
import { SortKey } from '@root/Utilities/Actions/Catalog.action';

// Every "Sort by" option that gets its own test (keys of `sortOptions` in catalog.data.ts).
const sortKeys: SortKey[] = ['nameAsc', 'nameDesc', 'priceAsc', 'priceDesc', 'createdOn'];

// A spec stays thin: it only names the scenario. The steps live in the Action class.
test.describe('Catalog', { tag: ['@catalog'] }, () => {
  test.describe('sorting', () => {
    test('offers every sort option', async ({ catalogActions }) => {
      await catalogActions.UserShouldSeeAllSortOptions();
    });

    // One generated test per sort option.
    for (const sortKey of sortKeys) {
      test(`sorts by ${sortKey}`, async ({ catalogActions }) => {
        await catalogActions.UserShouldBeAbleToSort(sortKey);
      });
    }
  });

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
