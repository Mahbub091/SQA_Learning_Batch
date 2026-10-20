import { test, expect } from "@playwright/test";
import { LoginPage } from "../../PageObjectModel/Login.page";
import ActionUtils from "../../Utilities/ActionUtils";
import dotenv from "dotenv";
dotenv.config();

test.describe("Navigation", () => {
  test("should navigate to the correct page", async ({ page }) => {
    const landingPageUrl = process.env.LANDING_PAGE_URL;
    const loginPage = new LoginPage(page);
    const runner = new ActionUtils(page);
    // Navigate to the home page
    await runner.NavigateToUrl(
      landingPageUrl || "https://demowebshop.tricentis.com/",
    );
    await expect(loginPage.headerLogo).toBeVisible();
  });
});
