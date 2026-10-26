import { test, expect, Page, Locator } from "@playwright/test";

export default class ActionUtils {
    private page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async navigateToUrl(url: string, waitForLoadState: boolean = true): Promise<void> {
        try {
            await this.page.goto(url);
            if (waitForLoadState) {
                await this.page.waitForLoadState("networkidle");
            }
        } catch (error) {
            console.error(`Failed to navigate to URL: ${url}`, error);
            throw error;
        }
    }

}