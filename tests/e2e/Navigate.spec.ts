import { test, expect } from "@playwright/test"
import { LoginPage } from "../../PageObjectModel/LoginPage"
import ActionUtils from "../../Utilities/ActionUtils"
import dotenv from "dotenv"
dotenv.config()


test.describe("navigate", () => {
    test("navigate to login page", async ({ page }) => {
        const landingPageUrl = process.env.LANDING_PAGE_URL
        const loginPage = new LoginPage(page)
        const runner = new ActionUtils(page)
        if (!landingPageUrl) {
            throw new Error("LANDING_PAGE_URL is not defined in the .env file");
        }
        await runner.navigateToUrl(landingPageUrl);
        await expect(loginPage.headerLogo).toBeVisible()
    })
}) 