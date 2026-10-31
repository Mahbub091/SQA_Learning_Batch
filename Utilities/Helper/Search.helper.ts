import { expect, Page } from '@playwright/test';
import { HeaderPage } from '@root/PageObjectModel/Header.page';
import { SearchPage } from '@root/PageObjectModel/Search.page';
import ActionUtils from '@root/Utilities/ActionUtils';
import { urlFor } from '@root/Utilities/config/env.config';
import { searchMessages } from '@root/Utilities/testData/messages.data';
import { parsePrice } from '@root/Utilities/textUtils';

/**
 * Helper = small, reusable steps and checks for ONE feature (here: search - the header search box,
 * the search page, advanced search and the results list).
 * Actions (the next layer up) chain these steps into a full test scenario.
 */
export class SearchHelper {
  private headerPage: HeaderPage;
  private searchPage: SearchPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.headerPage = new HeaderPage(page);
    this.searchPage = new SearchPage(page);
    this.runner = new ActionUtils(page);
  }

  /** Opens the home page and waits for the header search box. */
  async GoToHomePage(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor());
    await this.runner.AssertElementVisible(this.headerPage.SearchBox.searchInput);
  }

  /** Opens the search page directly and waits for its heading and search field. */
  async OpenSearchPage(): Promise<void> {
    await this.runner.NavigateToUrl(urlFor('/search'));
    await this.runner.AssertElementContainsText(
      this.searchPage.SearchFeature.pageHeading,
      /search/i,
    );
    await this.runner.AssertElementVisible(this.searchPage.SearchFeature.searchTermInput);
  }

  // ---------- basic search ----------

  /** Types a term in the header search box and clicks its Search button. */
  async SearchFromHeader(term: string): Promise<void> {
    await this.runner.TypeText(this.headerPage.SearchBox.searchInput, term);
    await this.runner.ClickElement(this.headerPage.SearchBox.searchButton);
  }

  /** Types a term in the header search box and presses Enter instead of clicking. */
  async SearchFromHeaderWithEnterKey(term: string): Promise<void> {
    await this.runner.TypeText(this.headerPage.SearchBox.searchInput, term);
    await this.runner.PressKey(this.headerPage.SearchBox.searchInput, 'Enter');
  }

  /** Types a term on the search page itself and clicks its Search button. */
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

  /** Ticks "Advanced search" and waits for the extra options to appear. */
  async EnableAdvancedSearch(): Promise<void> {
    await this.runner.CheckElement(this.searchPage.AdvancedSearch.advancedCheckbox);
    await this.runner.AssertElementVisible(this.searchPage.AdvancedSearch.categorySelect);
  }

  /** Chooses a category in the advanced search drop-down. */
  async SelectCategory(label: string): Promise<void> {
    await this.runner.SelectOptionByLabel(this.searchPage.AdvancedSearch.categorySelect, label);
  }

  /** Ticks / un-ticks "Automatically search sub categories". */
  async SetAutomaticallySearchSubCategories(enabled: boolean): Promise<void> {
    const checkbox = this.searchPage.AdvancedSearch.subCategoriesCheckbox;
    if (enabled) await this.runner.CheckElement(checkbox);
    else await this.runner.UncheckElement(checkbox);
  }

  /** Fills the price "from" and / or "to" fields (a value left out is not touched). */
  async SetPriceRange(from?: number, to?: number): Promise<void> {
    if (from !== undefined) {
      await this.runner.TypeText(this.searchPage.AdvancedSearch.priceFromInput, String(from));
    }
    if (to !== undefined) {
      await this.runner.TypeText(this.searchPage.AdvancedSearch.priceToInput, String(to));
    }
  }

  /** Ticks / un-ticks "Search In product descriptions". */
  async SetSearchInDescriptions(enabled: boolean): Promise<void> {
    const checkbox = this.searchPage.AdvancedSearch.searchInDescriptionCheckbox;
    if (enabled) await this.runner.CheckElement(checkbox);
    else await this.runner.UncheckElement(checkbox);
  }

  /** Clicks the Search button of the search page. */
  async SubmitSearch(): Promise<void> {
    await this.runner.ClickElement(this.searchPage.SearchFeature.searchButton);
  }

  // ---------- reading results ----------

  /** Waits until the search results page (URL + results area) is shown. */
  async WaitForSearchResultsPage(): Promise<void> {
    await this.runner.AssertUrlMatches(/\/search/i);
    await this.runner.AssertElementVisible(this.searchPage.Results.resultsContainer);
  }

  /** Product names in the results, in the order shown. */
  async GetResultTitles(): Promise<string[]> {
    return this.runner.GetAllTexts(this.searchPage.Results.productTitles);
  }

  /** Number of products in the results. */
  async GetResultCount(): Promise<number> {
    return this.runner.CountElements(this.searchPage.Results.productItems);
  }

  /** Product prices in the results, as numbers. */
  async GetResultPrices(): Promise<number[]> {
    const texts = await this.runner.GetAllTexts(this.searchPage.Results.productPrices);
    return texts.map(parsePrice);
  }

  // ---------- assertions ----------

  /** There is at least one result and at least one title contains the term (any letter case). */
  async AssertResultsContainTerm(term: string): Promise<void> {
    await this.WaitForSearchResultsPage();
    const titles = await this.GetResultTitles();
    expect(titles.length, `expected results for "${term}"`).toBeGreaterThan(0);
    expect(
      titles.some((title) => title.toLowerCase().includes(term.toLowerCase())),
      `no result title contains "${term}": ${titles.join(' | ')}`,
    ).toBe(true);
  }

  /** The product with this exact name (any letter case) is in the results. */
  async AssertExactProductFound(name: string): Promise<void> {
    await this.WaitForSearchResultsPage();
    const titles = await this.GetResultTitles();
    expect(titles.map((t) => t.toLowerCase())).toContain(name.toLowerCase());
  }

  /** The "No products were found ..." message is shown and the result list is empty. */
  async AssertNoResultsMessage(): Promise<void> {
    await this.WaitForSearchResultsPage();
    await this.runner.AssertElementContainsText(
      this.searchPage.Results.resultsContainer,
      searchMessages.noResults,
    );
    expect(await this.GetResultCount()).toBe(0);
  }

  /** The "Search term minimum length is 3 characters" warning is shown and nothing is listed. */
  async AssertMinimumLengthWarning(): Promise<void> {
    await this.runner.AssertUrlMatches(/\/search/i);
    await this.runner.AssertElementVisible(this.searchPage.Results.warning.first());
    await this.runner.AssertElementContainsText(
      this.searchPage.Results.warning,
      searchMessages.minLength,
    );
    expect(await this.GetResultCount()).toBe(0);
  }

  /** The results contain exactly this many products. */
  async AssertResultCountEquals(expected: number): Promise<void> {
    await this.WaitForSearchResultsPage();
    expect(await this.GetResultCount()).toBe(expected);
  }

  /** The results contain at least this many products. */
  async AssertResultCountAtLeast(minimum: number): Promise<void> {
    await this.WaitForSearchResultsPage();
    expect(await this.GetResultCount()).toBeGreaterThanOrEqual(minimum);
  }

  /** At least one product is listed and every price is between `min` and `max`. */
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
    // A crash page would contain one of these words.
    await expect(this.searchPage.Results.resultsContainer).not.toContainText(
      /server error|exception|stack trace/i,
    );
  }

  /** The search field still shows the term that was searched for. */
  async AssertSearchTermKept(term: string): Promise<void> {
    await expect(this.searchPage.SearchFeature.searchTermInput).toHaveValue(term);
  }
}
