import { Locator, Page } from "@playwright/test";

export class LoginPage {
    readonly headerLogo: Locator

    constructor(private page: Page) {
        this.page = page
        this.headerLogo = this.page.locator("img[alt='Tricentis Demo Web Shop']")
    }
}