import { test } from '../Utilities/fixtures/base.fixture';
import { searchData } from '../Utilities/testData/search.data';

test.describe('Search', { tag: ['@search'] }, () => {
  test.describe('basic search', () => {
    test(
      'finds a product by its exact name',
      { tag: ['@e2e', '@smoke'] },
      async ({ searchActions }) => {
        await searchActions.UserShouldFindProductByExactName();
      },
    );

    test('finds products by a partial name', async ({ searchActions }) => {
      await searchActions.UserShouldFindProductsByPartialName();
    });

    test('searches when Enter is pressed', async ({ searchActions }) => {
      await searchActions.UserShouldFindProductWithPressingEnter();
    });

    for (const variation of searchData.caseVariations) {
      test(`is case-insensitive ("${variation}")`, async ({ searchActions }) => {
        await searchActions.SearchShouldBeCaseInsensitive(variation);
      });
    }
  });

  test.describe('negative and boundary input', () => {
    test('shows a message when nothing matches', async ({ searchActions }) => {
      await searchActions.UserShouldSeeNoResultsMessage();
    });

    test('alerts on an empty header search', async ({ searchActions }) => {
      await searchActions.UserShouldSeeAlertForEmptyHeaderSearch();
    });

    for (const term of searchData.tooShortTerms) {
      test(`enforces the minimum length on the search page ("${term}")`, async ({
        searchActions,
      }) => {
        await searchActions.UserShouldSeeMinimumLengthErrorOnSearchPage(term);
      });

      test(`enforces the minimum length from the header ("${term}")`, async ({ searchActions }) => {
        await searchActions.UserShouldSeeMinimumLengthErrorFromHeader(term);
      });
    }

    test('handles special characters', async ({ searchActions }) => {
      await searchActions.SearchShouldHandleSpecialCharacters();
    });

    test('handles a very long search string', async ({ searchActions }) => {
      await searchActions.SearchShouldHandleVeryLongString();
    });
  });

  test.describe('advanced search', () => {
    test('searches a category together with its sub-categories', async ({ searchActions }) => {
      await searchActions.AdvancedSearchShouldFindProductsInCategoryWithSubCategories();
    });

    test('excludes sub-categories when the option is off', async ({ searchActions }) => {
      await searchActions.AdvancedSearchShouldExcludeSubCategoriesWhenNotSelected();
    });

    test('respects the price range', async ({ searchActions }) => {
      await searchActions.AdvancedSearchShouldRespectPriceRange();
    });

    test('returns nothing for an impossible price range', async ({ searchActions }) => {
      await searchActions.AdvancedSearchShouldReturnNothingForImpossiblePriceRange();
    });

    test('searching in descriptions never returns fewer results', async ({ searchActions }) => {
      await searchActions.SearchInDescriptionsShouldNotReturnFewerResults();
    });
  });
});
