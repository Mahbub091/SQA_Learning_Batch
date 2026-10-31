import { expect, Page } from '@playwright/test';
import { SearchHelper } from '@root/Utilities/Helper/Search.helper';
import { searchData } from '@root/Utilities/testData/search.data';
import { searchMessages } from '@root/Utilities/testData/messages.data';

/**
 * Action = a complete test scenario, written as a chain of helper steps.
 * Method names read like a sentence ("User should ..."), so a spec stays one readable line.
 * This class covers the Search scenarios (basic, negative / boundary, advanced).
 */
export default class SearchAction {
  private searchHelper: SearchHelper;

  constructor(page: Page) {
    this.searchHelper = new SearchHelper(page);
  }

  // ---------- basic search ----------

  /** Searching a full product name finds that product. */
  async UserShouldFindProductByExactName(): Promise<void> {
    await this.searchHelper.GoToHomePage();
    await this.searchHelper.SearchFromHeader(searchData.exactName);
    await this.searchHelper.AssertExactProductFound(searchData.exactName);
  }

  /** Searching part of a name finds products whose name contains it. */
  async UserShouldFindProductsByPartialName(): Promise<void> {
    await this.searchHelper.GoToHomePage();
    await this.searchHelper.SearchFromHeader(searchData.partialName);
    await this.searchHelper.AssertResultsContainTerm(searchData.partialName);
  }

  /** Pressing Enter in the search box searches, just like clicking the button. */
  async UserShouldFindProductWithPressingEnter(): Promise<void> {
    await this.searchHelper.GoToHomePage();
    await this.searchHelper.SearchFromHeaderWithEnterKey(searchData.partialName);
    await this.searchHelper.AssertResultsContainTerm(searchData.partialName);
  }

  /** Same results regardless of letter case. */
  async SearchShouldBeCaseInsensitive(variation: string): Promise<void> {
    await this.searchHelper.GoToHomePage();
    // Baseline: the results for the normal lower-case term.
    await this.searchHelper.SearchFromHeader(searchData.partialName);
    await this.searchHelper.WaitForSearchResultsPage();
    const baseline = await this.searchHelper.GetResultTitles();
    expect(baseline.length).toBeGreaterThan(0);

    // Search again with a different letter case: the results must be identical.
    await this.searchHelper.SearchFromSearchPage(variation);
    await this.searchHelper.AssertResultsContainTerm(searchData.partialName);
    expect(await this.searchHelper.GetResultTitles()).toEqual(baseline);
  }

  /** A term that matches nothing shows "No products were found ...". */
  async UserShouldSeeNoResultsMessage(): Promise<void> {
    await this.searchHelper.GoToHomePage();
    await this.searchHelper.SearchFromHeader(searchData.noResultTerm);
    await this.searchHelper.AssertNoResultsMessage();
  }

  /** Clicking Search with an empty header box opens the "Please enter some search keyword" alert. */
  async UserShouldSeeAlertForEmptyHeaderSearch(): Promise<void> {
    await this.searchHelper.GoToHomePage();
    const message = await this.searchHelper.SubmitEmptyHeaderSearchAndReadAlert();
    expect(message).toMatch(searchMessages.emptyAlert);
  }

  /** A too-short term on the search page shows the minimum-length warning. */
  async UserShouldSeeMinimumLengthErrorOnSearchPage(term: string): Promise<void> {
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.SearchFromSearchPage(term);
    await this.searchHelper.AssertMinimumLengthWarning();
  }

  /** A too-short term typed in the header shows the minimum-length warning. */
  async UserShouldSeeMinimumLengthErrorFromHeader(term: string): Promise<void> {
    await this.searchHelper.GoToHomePage();
    await this.searchHelper.SearchFromHeader(term);
    await this.searchHelper.AssertMinimumLengthWarning();
  }

  // ---------- advanced search ----------

  /** Searching a category WITH "search sub categories" ticked finds products inside them. */
  async AdvancedSearchShouldFindProductsInCategoryWithSubCategories(): Promise<void> {
    const { keyword, parentCategory } = searchData.advanced;
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.EnableAdvancedSearch();
    await this.searchHelper.SelectCategory(parentCategory);
    await this.searchHelper.SetAutomaticallySearchSubCategories(true);
    await this.searchHelper.SearchFromSearchPage(keyword);
    await this.searchHelper.AssertResultsContainTerm(keyword);
  }

  /** The same search WITHOUT the sub-category option finds nothing (the products are in sub-categories). */
  async AdvancedSearchShouldExcludeSubCategoriesWhenNotSelected(): Promise<void> {
    const { keyword, parentCategory } = searchData.advanced;
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.EnableAdvancedSearch();
    await this.searchHelper.SelectCategory(parentCategory);
    await this.searchHelper.SetAutomaticallySearchSubCategories(false);
    await this.searchHelper.SearchFromSearchPage(keyword);
    await this.searchHelper.AssertNoResultsMessage();
  }

  /** Only products priced inside the entered range are returned. */
  async AdvancedSearchShouldRespectPriceRange(): Promise<void> {
    const { keyword, priceFrom, priceTo } = searchData.advanced;
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.EnableAdvancedSearch();
    await this.searchHelper.SetPriceRange(priceFrom, priceTo);
    await this.searchHelper.SearchFromSearchPage(keyword);
    await this.searchHelper.AssertResultCountAtLeast(1);
    await this.searchHelper.AssertResultPricesWithin(priceFrom, priceTo);
  }

  /** A minimum price no product can reach returns "No products were found ...". */
  async AdvancedSearchShouldReturnNothingForImpossiblePriceRange(): Promise<void> {
    const { keyword, impossiblePriceFrom } = searchData.advanced;
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.EnableAdvancedSearch();
    await this.searchHelper.SetPriceRange(impossiblePriceFrom);
    await this.searchHelper.SearchFromSearchPage(keyword);
    await this.searchHelper.AssertNoResultsMessage();
  }

  /** Also searching in descriptions can only add results, never remove any. */
  async SearchInDescriptionsShouldNotReturnFewerResults(): Promise<void> {
    const term = searchData.partialName;

    // Search 1: product names only.
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.EnableAdvancedSearch();
    await this.searchHelper.SetSearchInDescriptions(false);
    await this.searchHelper.SearchFromSearchPage(term);
    await this.searchHelper.WaitForSearchResultsPage();
    const namesOnly = await this.searchHelper.GetResultCount();

    // Search 2: names AND descriptions.
    await this.searchHelper.EnableAdvancedSearch();
    await this.searchHelper.SetSearchInDescriptions(true);
    await this.searchHelper.SearchFromSearchPage(term);
    await this.searchHelper.WaitForSearchResultsPage();
    const withDescriptions = await this.searchHelper.GetResultCount();

    expect(namesOnly).toBeGreaterThan(0);
    expect(withDescriptions).toBeGreaterThanOrEqual(namesOnly);
  }

  // ---------- edge cases ----------

  /** A term made only of special characters must not break the page. */
  async SearchShouldHandleSpecialCharacters(): Promise<void> {
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.SearchFromSearchPage(searchData.specialCharacters);
    await this.searchHelper.AssertSearchHandledGracefully();
  }

  /** A very long term (500 characters) must not break the page. */
  async SearchShouldHandleVeryLongString(): Promise<void> {
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.SearchFromSearchPage('a'.repeat(searchData.longStringLength));
    await this.searchHelper.AssertSearchHandledGracefully();
  }
}
