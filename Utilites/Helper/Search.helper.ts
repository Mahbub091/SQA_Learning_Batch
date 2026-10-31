import { expect, Page } from '@playwright/test';
import { HeaderPage } from '../../PageObjectModel/Header.page';
import { SearchPage } from '../../PageObjectModel/Search.page';
import ActionUtils from '../ActionUtils';
import { urlFor } from '../config/env.config';
import { searchMessages } from '../testData/search.data';
import { parsePrice } from '../textUtils';

export class SearchHelper {
  private headerPage: HeaderPage;
  private searchPage: SearchPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.headerPage = new HeaderPage(page);
    this.searchPage = new SearchPage(page);
    this.runner = new ActionUtils(page);
  }

  async GoToHomePage(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor());
    await this.runner.AssertElementVisible(this.headerPage.SearchBox.searchInput);
  }

  async OpenSearchPage(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor('/search'));
    await this.runner.AssertElementContainsText(
      this.searchPage.SearchFeature.pageHeading,
      /search/i,
    );
    await this.runner.AssertElementVisible(this.searchPage.SearchFeature.searchTermInput);
  }

  // ---------- basic search ----------

  async SearchFromHeader(term: string): Promise<void> {
    await this.runner.TypeText(this.headerPage.SearchBox.searchInput, term);
    await this.runner.ClickElement(this.headerPage.SearchBox.searchButton);
  }

  async SearchFromHeaderWithEnterKey(term: string): Promise<void> {
    await this.runner.TypeText(this.headerPage.SearchBox.searchInput, term);
    await this.runner.PressKey(this.headerPage.SearchBox.searchInput, 'Enter');
  }

  async SearchFromSearchPage(term: string): Promise<void> {
    await this.runner.TypeText(this.searchPage.SearchFeature.searchTermInput, term);
    await this.runner.ClickElement(this.searchPage.SearchFeature.searchButton);
  }

  /** Clicking Search in the header with nothing typed opens a JS alert. */
  async SubmitEmptyHeaderSearchAndReadAlert(): Promise<string> {
    return this.runner.CaptureDialogMessage(() =>
      this.runner.ClickElement(this.headerPage.SearchBox.searchButton),
    );
  }

  // ---------- advanced search ----------

  async EnableAdvancedSearch(): Promise<void> {
    await this.runner.CheckElement(this.searchPage.AdvancedSearch.advancedCheckbox);
    await this.runner.AssertElementVisible(this.searchPage.AdvancedSearch.categorySelect);
  }

  async SelectCategory(label: string): Promise<void> {
    await this.runner.SelectOptionByLabel(this.searchPage.AdvancedSearch.categorySelect, label);
  }

  async SetAutomaticallySearchSubCategories(enabled: boolean): Promise<void> {
    const checkbox = this.searchPage.AdvancedSearch.subCategoriesCheckbox;
    if (enabled) await this.runner.CheckElement(checkbox);
    else await this.runner.UncheckElement(checkbox);
  }

  async SetPriceRange(from?: number, to?: number): Promise<void> {
    if (from !== undefined) {
      await this.runner.TypeText(this.searchPage.AdvancedSearch.priceFromInput, String(from));
    }
    if (to !== undefined) {
      await this.runner.TypeText(this.searchPage.AdvancedSearch.priceToInput, String(to));
    }
  }

  async SetSearchInDescriptions(enabled: boolean): Promise<void> {
    const checkbox = this.searchPage.AdvancedSearch.searchInDescriptionCheckbox;
    if (enabled) await this.runner.CheckElement(checkbox);
    else await this.runner.UncheckElement(checkbox);
  }

  async SubmitSearch(): Promise<void> {
    await this.runner.ClickElement(this.searchPage.SearchFeature.searchButton);
  }

  // ---------- reading results ----------

  async WaitForSearchResultsPage(): Promise<void> {
    await this.runner.AssertUrlMatches(/\/search/i);
    await this.runner.AssertElementVisible(this.searchPage.Results.resultsContainer);
  }

  async GetResultTitles(): Promise<string[]> {
    return this.runner.GetAllTexts(this.searchPage.Results.productTitles);
  }

  async GetResultCount(): Promise<number> {
    return this.runner.CountElements(this.searchPage.Results.productItems);
  }

  async GetResultPrices(): Promise<number[]> {
    const texts = await this.runner.GetAllTexts(this.searchPage.Results.productPrices);
    return texts.map(parsePrice);
  }

  // ---------- assertions ----------

  async AssertResultsContainTerm(term: string): Promise<void> {
    await this.WaitForSearchResultsPage();
    const titles = await this.GetResultTitles();
    expect(titles.length, `expected results for "${term}"`).toBeGreaterThan(0);
    expect(
      titles.some((title) => title.toLowerCase().includes(term.toLowerCase())),
      `no result title contains "${term}": ${titles.join(' | ')}`,
    ).toBe(true);
  }

  async AssertExactProductFound(name: string): Promise<void> {
    await this.WaitForSearchResultsPage();
    const titles = await this.GetResultTitles();
    expect(titles.map((t) => t.toLowerCase())).toContain(name.toLowerCase());
  }

  async AssertNoResultsMessage(): Promise<void> {
    await this.WaitForSearchResultsPage();
    await this.runner.AssertElementContainsText(
      this.searchPage.Results.resultsContainer,
      searchMessages.noResults,
    );
    expect(await this.GetResultCount()).toBe(0);
  }

  async AssertMinimumLengthWarning(): Promise<void> {
    await this.runner.AssertUrlMatches(/\/search/i);
    await this.runner.AssertElementVisible(this.searchPage.Results.warning.first());
    await this.runner.AssertElementContainsText(
      this.searchPage.Results.warning,
      searchMessages.minLength,
    );
    expect(await this.GetResultCount()).toBe(0);
  }

  async AssertResultCountEquals(expected: number): Promise<void> {
    await this.WaitForSearchResultsPage();
    expect(await this.GetResultCount()).toBe(expected);
  }

  async AssertResultCountAtLeast(minimum: number): Promise<void> {
    await this.WaitForSearchResultsPage();
    expect(await this.GetResultCount()).toBeGreaterThanOrEqual(minimum);
  }

  async AssertResultPricesWithin(min: number, max: number): Promise<void> {
    const prices = await this.GetResultPrices();
    expect(prices.length, 'price filter should return products').toBeGreaterThan(0);
    for (const price of prices) {
      expect(price).toBeGreaterThanOrEqual(min);
      expect(price).toBeLessThanOrEqual(max);
    }
  }

  /** The page must stay usable: still the search page, showing either results or "no results". */
  async AssertSearchHandledGracefully(): Promise<void> {
    await this.WaitForSearchResultsPage();
    await this.runner.AssertElementContainsText(
      this.searchPage.SearchFeature.pageHeading,
      /search/i,
    );
    await expect(this.searchPage.Results.resultsContainer).not.toContainText(
      /server error|exception|stack trace/i,
    );
  }

  async AssertSearchTermKept(term: string): Promise<void> {
    await expect(this.searchPage.SearchFeature.searchTermInput).toHaveValue(term);
  }
}
