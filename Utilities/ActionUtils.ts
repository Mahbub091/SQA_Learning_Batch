import { Page, expect, Locator, test } from "@playwright/test";

export default class ActionUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async NavigateToUrl(
    url: string,
    waitForLoadState: boolean = true,
  ): Promise<void> {
    try {
      await this.page.goto(url);
      if (waitForLoadState) {
        await this.page.waitForLoadState("networkidle");
      }
    } catch (error) {
      console.error("Error occurred while navigating to URL:", error);
      throw error;
    }
  }

  async ClickElement(locator: Locator): Promise<void> {
    try {
      await locator.click();
    } catch (error) {
      console.error("Error occurred while clicking the element:", error);
      throw error;
    }
  }

  async TypeText(locator: Locator, text: string): Promise<void> {
    try {
      await locator.fill(text);
    } catch (error) {
      console.error("Error occurred while typing text:", error);
      throw error;
    }
  }

  async GetElementText(locator: Locator): Promise<string> {
    try {
      return await locator.textContent() || "";
    } catch (error) {
      console.error("Error occurred while getting element text:", error);
      throw error;
    }
  }

  async AssertElementVisible(locator: Locator): Promise<void> {
    try {
      await expect(locator).toBeVisible();
    } catch (error) {
      console.error("Error occurred while asserting element visibility:", error);
      throw error;
    }
  }
}
