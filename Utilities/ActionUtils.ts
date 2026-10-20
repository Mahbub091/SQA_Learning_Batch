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
}
