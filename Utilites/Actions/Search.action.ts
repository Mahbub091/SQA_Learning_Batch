import { expect, Page } from '@playwright/test';
import { SearchHelper } from '../Helper/Search.helper';
import { searchData, searchMessages } from '../testData/search.data';

export default class SearchAction {
  private searchHelper: SearchHelper;

  constructor(page: Page) {
    this.searchHelper = new SearchHelper(page);
  }

  // ---------- basic search ----------

  async UserShouldFindProductByExactName(): Promise<void> {
    await this.searchHelper.GoToHomePage();
    await this.searchHelper.SearchFromHeader(searchData.exactName);
    await this.searchHelper.AssertExactProductFound(searchData.exactName);
  }

  async UserShouldFindProductsByPartialName(): Promise<void> {
    await this.searchHelper.GoToHomePage();
    await this.searchHelper.SearchFromHeader(searchData.partialName);
    await this.searchHelper.AssertResultsContainTerm(searchData.partialName);
  }

  async UserShouldFindProductWithPressingEnter(): Promise<void> {
    await this.searchHelper.GoToHomePage();
    await this.searchHelper.SearchFromHeaderWithEnterKey(searchData.partialName);
    await this.searchHelper.AssertResultsContainTerm(searchData.partialName);
  }

  /** Same results regardless of letter case. */
  async SearchShouldBeCaseInsensitive(variation: string): Promise<void> {
    await this.searchHelper.GoToHomePage();
    await this.searchHelper.SearchFromHeader(searchData.partialName);
    await this.searchHelper.WaitForSearchResultsPage();
    const baseline = await this.searchHelper.GetResultTitles();
    expect(baseline.length).toBeGreaterThan(0);

    await this.searchHelper.SearchFromSearchPage(variation);
    await this.searchHelper.AssertResultsContainTerm(searchData.partialName);
    expect(await this.searchHelper.GetResultTitles()).toEqual(baseline);
  }

  async UserShouldSeeNoResultsMessage(): Promise<void> {
    await this.searchHelper.GoToHomePage();
    await this.searchHelper.SearchFromHeader(searchData.noResultTerm);
    await this.searchHelper.AssertNoResultsMessage();
  }

  async UserShouldSeeAlertForEmptyHeaderSearch(): Promise<void> {
    await this.searchHelper.GoToHomePage();
    const message = await this.searchHelper.SubmitEmptyHeaderSearchAndReadAlert();
    expect(message).toMatch(searchMessages.emptyAlert);
  }

  async UserShouldSeeMinimumLengthErrorOnSearchPage(term: string): Promise<void> {
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.SearchFromSearchPage(term);
    await this.searchHelper.AssertMinimumLengthWarning();
  }

  async UserShouldSeeMinimumLengthErrorFromHeader(term: string): Promise<void> {
    await this.searchHelper.GoToHomePage();
    await this.searchHelper.SearchFromHeader(term);
    await this.searchHelper.AssertMinimumLengthWarning();
  }

  // ---------- advanced search ----------

  async AdvancedSearchShouldFindProductsInCategoryWithSubCategories(): Promise<void> {
    const { keyword, parentCategory } = searchData.advanced;
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.EnableAdvancedSearch();
    await this.searchHelper.SelectCategory(parentCategory);
    await this.searchHelper.SetAutomaticallySearchSubCategories(true);
    await this.searchHelper.SearchFromSearchPage(keyword);
    await this.searchHelper.AssertResultsContainTerm(keyword);
  }

  async AdvancedSearchShouldExcludeSubCategoriesWhenNotSelected(): Promise<void> {
    const { keyword, parentCategory } = searchData.advanced;
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.EnableAdvancedSearch();
    await this.searchHelper.SelectCategory(parentCategory);
    await this.searchHelper.SetAutomaticallySearchSubCategories(false);
    await this.searchHelper.SearchFromSearchPage(keyword);
    await this.searchHelper.AssertNoResultsMessage();
  }

  async AdvancedSearchShouldRespectPriceRange(): Promise<void> {
    const { keyword, priceFrom, priceTo } = searchData.advanced;
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.EnableAdvancedSearch();
    await this.searchHelper.SetPriceRange(priceFrom, priceTo);
    await this.searchHelper.SearchFromSearchPage(keyword);
    await this.searchHelper.AssertResultCountAtLeast(1);
    await this.searchHelper.AssertResultPricesWithin(priceFrom, priceTo);
  }

  async AdvancedSearchShouldReturnNothingForImpossiblePriceRange(): Promise<void> {
    const { keyword, impossiblePriceFrom } = searchData.advanced;
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.EnableAdvancedSearch();
    await this.searchHelper.SetPriceRange(impossiblePriceFrom);
    await this.searchHelper.SearchFromSearchPage(keyword);
    await this.searchHelper.AssertNoResultsMessage();
  }

  async SearchInDescriptionsShouldNotReturnFewerResults(): Promise<void> {
    const term = searchData.partialName;

    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.EnableAdvancedSearch();
    await this.searchHelper.SetSearchInDescriptions(false);
    await this.searchHelper.SearchFromSearchPage(term);
    await this.searchHelper.WaitForSearchResultsPage();
    const namesOnly = await this.searchHelper.GetResultCount();

    await this.searchHelper.EnableAdvancedSearch();
    await this.searchHelper.SetSearchInDescriptions(true);
    await this.searchHelper.SearchFromSearchPage(term);
    await this.searchHelper.WaitForSearchResultsPage();
    const withDescriptions = await this.searchHelper.GetResultCount();

    expect(namesOnly).toBeGreaterThan(0);
    expect(withDescriptions).toBeGreaterThanOrEqual(namesOnly);
  }

  // ---------- edge cases ----------

  async SearchShouldHandleSpecialCharacters(): Promise<void> {
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.SearchFromSearchPage(searchData.specialCharacters);
    await this.searchHelper.AssertSearchHandledGracefully();
  }

  async SearchShouldHandleVeryLongString(): Promise<void> {
    await this.searchHelper.OpenSearchPage();
    await this.searchHelper.SearchFromSearchPage('a'.repeat(searchData.longStringLength));
    await this.searchHelper.AssertSearchHandledGracefully();
  }
}
