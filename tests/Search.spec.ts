import { test } from '@root/Utilities/fixtures/base.fixture';
import { searchData } from '@root/Utilities/testData/search.data';

test.describe('Search', { tag: ['@search'] }, () => {
  test(
    'basic: finds a product by its exact name',
    { tag: ['@e2e', '@smoke'] },
    async ({ searchActions }) => {
      await searchActions.UserShouldFindProductByExactName();
    },
  );

  test('basic: finds products by a partial name', async ({ searchActions }) => {
    await searchActions.UserShouldFindProductsByPartialName();
  });

  test('basic: searches when Enter is pressed', async ({ searchActions }) => {
    await searchActions.UserShouldFindProductWithPressingEnter();
  });

  for (const variation of searchData.caseVariations) {
    test(`basic: is case-insensitive ("${variation}")`, async ({ searchActions }) => {
      await searchActions.SearchShouldBeCaseInsensitive(variation);
    });
  }

  test('negative: shows a message when nothing matches', async ({ searchActions }) => {
    await searchActions.UserShouldSeeNoResultsMessage();
  });

  test('negative: alerts on an empty header search', async ({ searchActions }) => {
    await searchActions.UserShouldSeeAlertForEmptyHeaderSearch();
  });

  for (const term of searchData.tooShortTerms) {
    test(`negative: enforces the minimum length on the search page ("${term}")`, async ({
      searchActions,
    }) => {
      await searchActions.UserShouldSeeMinimumLengthErrorOnSearchPage(term);
    });

    test(`negative: enforces the minimum length from the header ("${term}")`, async ({
      searchActions,
    }) => {
      await searchActions.UserShouldSeeMinimumLengthErrorFromHeader(term);
    });
  }

  test('negative: handles special characters', async ({ searchActions }) => {
    await searchActions.SearchShouldHandleSpecialCharacters();
  });

  test('negative: handles a very long search string', async ({ searchActions }) => {
    await searchActions.SearchShouldHandleVeryLongString();
  });

  test('advanced: searches a category together with its sub-categories', async ({
    searchActions,
  }) => {
    await searchActions.AdvancedSearchShouldFindProductsInCategoryWithSubCategories();
  });

  test('advanced: excludes sub-categories when the option is off', async ({ searchActions }) => {
    await searchActions.AdvancedSearchShouldExcludeSubCategoriesWhenNotSelected();
  });

  test('advanced: respects the price range', async ({ searchActions }) => {
    await searchActions.AdvancedSearchShouldRespectPriceRange();
  });

  test('advanced: returns nothing for an impossible price range', async ({ searchActions }) => {
    await searchActions.AdvancedSearchShouldReturnNothingForImpossiblePriceRange();
  });

  test('advanced: searching in descriptions never returns fewer results', async ({
    searchActions,
  }) => {
    await searchActions.SearchInDescriptionsShouldNotReturnFewerResults();
  });
});
