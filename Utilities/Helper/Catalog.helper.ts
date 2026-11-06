import { expect, Page } from '@playwright/test';
import { CatalogPage } from '../../PageObjectModel/Catalog.page';
import ActionUtils from '../ActionUtils';
import { urlFor } from '../config/env.config';
import { isNumberSorted, isSortedAscending, parsePrice } from '../textUtils';

export interface PriceRange {
  min: number;
  max: number;
}

export class CatalogHelper {
  private catalogPage: CatalogPage;
  private runner: ActionUtils;

  constructor(page: Page) {
    this.catalogPage = new CatalogPage(page);
    this.runner = new ActionUtils(page);
  }

  async GoToCategory(path: string): Promise<void> {
    await this.runner.NavigateToUrl(urlFor(path));
    await this.runner.AssertElementVisible(this.catalogPage.CatalogFeature.pageHeading.first());
  }

  // ---------- reading the product list ----------

  async GetProductNames(): Promise<string[]> {
    return this.runner.GetAllTexts(this.catalogPage.Products.productTitles);
  }

  async GetProductPrices(): Promise<number[]> {
    const texts = await this.runner.GetAllTexts(this.catalogPage.Products.productPrices);
    return texts.map(parsePrice);
  }

  async GetProductCount(): Promise<number> {
    return this.runner.CountElements(this.catalogPage.Products.productItems);
  }

  // ---------- sorting ----------

  async SortBy(label: string): Promise<void> {
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.SelectOptionByLabel(this.catalogPage.Toolbar.sortSelect, label),
    );
    await expect(this.catalogPage.Toolbar.sortSelect.locator('option:checked')).toHaveText(label);
  }

  async AssertSortOptionsAvailable(labels: string[]): Promise<void> {
    const available = await this.runner.GetSelectOptionLabels(this.catalogPage.Toolbar.sortSelect);
    for (const label of labels) {
      expect(available, `sort option "${label}" should exist`).toContain(label);
    }
  }

  async AssertSortedByName(direction: 'asc' | 'desc'): Promise<void> {
    const names = await this.GetProductNames();
    expect(names.length, 'category should list at least 2 products').toBeGreaterThan(1);
    const ordered = direction === 'asc' ? names : [...names].reverse();
    expect(isSortedAscending(ordered), `names not sorted ${direction}: ${names.join(' | ')}`).toBe(
      true,
    );
  }

  async AssertSortedByPrice(direction: 'asc' | 'desc'): Promise<void> {
    const prices = await this.GetProductPrices();
    expect(prices.length, 'category should list at least 2 priced products').toBeGreaterThan(1);
    expect(prices.every((price) => !Number.isNaN(price))).toBe(true);
    expect(isNumberSorted(prices, direction), `prices not sorted ${direction}: ${prices}`).toBe(
      true,
    );
  }

  async AssertSameProductsAfterSort(before: string[]): Promise<void> {
    const after = await this.GetProductNames();
    expect([...after].sort()).toEqual([...before].sort());
  }

  // ---------- page size ----------

  async GetPageSizeOptions(): Promise<number[]> {
    const labels = await this.runner.GetSelectOptionLabels(this.catalogPage.Toolbar.pageSizeSelect);
    return labels.map((label) => parseInt(label, 10)).filter((n) => !Number.isNaN(n));
  }

  async GetSelectedPageSize(): Promise<number> {
    const label = await this.runner.GetSelectedOptionLabel(this.catalogPage.Toolbar.pageSizeSelect);
    return parseInt(label, 10);
  }

  async SelectPageSize(size: number): Promise<void> {
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.SelectOptionByLabel(this.catalogPage.Toolbar.pageSizeSelect, String(size)),
    );
    expect(await this.GetSelectedPageSize()).toBe(size);
  }

  async AssertProductCountAtMost(max: number): Promise<void> {
    const count = await this.GetProductCount();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(max);
  }

  // ---------- grid / list view ----------

  async SwitchView(mode: 'Grid' | 'List'): Promise<void> {
    const current = await this.runner.GetSelectedOptionLabel(
      this.catalogPage.Toolbar.viewModeSelect,
    );
    if (current.toLowerCase() === mode.toLowerCase()) return;
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.SelectOptionByLabel(this.catalogPage.Toolbar.viewModeSelect, mode),
    );
  }

  async AssertViewMode(mode: 'Grid' | 'List'): Promise<void> {
    const shown =
      mode === 'Grid'
        ? this.catalogPage.Products.productGrid
        : this.catalogPage.Products.productList;
    const hidden =
      mode === 'Grid'
        ? this.catalogPage.Products.productList
        : this.catalogPage.Products.productGrid;
    await expect(shown.first()).toBeVisible();
    await expect(hidden).toHaveCount(0);
  }

  // ---------- pagination ----------

  async IsPagerVisible(): Promise<boolean> {
    return this.runner.IsElementVisible(this.catalogPage.Pager.pager);
  }

  async GoToPage(pageNumber: number): Promise<void> {
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.ClickElement(this.catalogPage.pagerPageLink(pageNumber)),
    );
  }

  async AssertCurrentPage(pageNumber: number): Promise<void> {
    await expect(this.catalogPage.Pager.currentPage).toHaveText(String(pageNumber));
    if (pageNumber > 1) {
      await this.runner.AssertUrlMatches(new RegExp(`pagenumber=${pageNumber}`, 'i'));
    }
  }

  async AssertNoOverlap(first: string[], second: string[]): Promise<void> {
    const overlap = first.filter((name) => second.includes(name));
    expect(overlap, 'products must not repeat across pages').toEqual([]);
  }

  // ---------- price filter ----------

  async HasPriceRangeFilter(): Promise<boolean> {
    return (await this.runner.CountElements(this.catalogPage.Filters.priceRangeOptions)) > 0;
  }

  async GetFirstPriceRangeText(): Promise<string> {
    const [first] = await this.runner.GetAllTexts(this.catalogPage.Filters.priceRangeOptions);
    return first ?? '';
  }

  /** Understands "Under 25.00", "25.00 - 50.00" and "Over 1200.00". */
  ParsePriceRange(text: string): PriceRange {
    const numbers = (text.replace(/,/g, '').match(/\d+(\.\d+)?/g) ?? []).map(Number);
    if (/under/i.test(text)) return { min: 0, max: numbers[0] };
    if (/over/i.test(text)) return { min: numbers[0], max: Number.POSITIVE_INFINITY };
    return { min: numbers[0], max: numbers[1] ?? Number.POSITIVE_INFINITY };
  }

  async ApplyFirstPriceRange(): Promise<void> {
    await this.runner.TriggerAndWaitForUrlChange(() =>
      this.runner.ClickElement(this.catalogPage.Filters.priceRangeOptions.first()),
    );
    await this.runner.AssertUrlMatches(/price=/i);
  }

  async AssertPricesWithin(range: PriceRange): Promise<void> {
    const prices = await this.GetProductPrices();
    expect(prices.length, 'filter should leave at least one product').toBeGreaterThan(0);
    for (const price of prices) {
      expect(price).toBeGreaterThanOrEqual(range.min);
      expect(price).toBeLessThanOrEqual(range.max);
    }
  }
}
