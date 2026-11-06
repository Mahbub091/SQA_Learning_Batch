import { test as base, BrowserContext } from '@playwright/test';
import ActionUtils from '../ActionUtils';
import { LoginHelper } from '../Helper/Login.helper';
import LoginActions from '../Actions/Login.action';
import RegisterActions from '../Actions/Register.action';
import PasswordRecoveryActions from '../Actions/PasswordRecovery.action';
import NavigationActions from '../Actions/Navigation.action';
import CatalogActions from '../Actions/Catalog.action';
import SearchActions from '../Actions/Search.action';
import ProductActions from '../Actions/Product.action';
import ProductReviewActions from '../Actions/ProductReview.action';
import EmailAFriendActions from '../Actions/EmailAFriend.action';
import { LoginPage } from '../../PageObjectModel/Login.page';

interface TestFixtures {
  browserContext: BrowserContext;
  runner: ActionUtils;
  userLoginPage: LoginPage;
  userLoginHelper: LoginHelper;
  userLoginActions: LoginActions;
  userRegisterActions: RegisterActions;
  passwordRecoveryActions: PasswordRecoveryActions;
  navigationActions: NavigationActions;
  catalogActions: CatalogActions;
  searchActions: SearchActions;
  productActions: ProductActions;
  productReviewActions: ProductReviewActions;
  emailAFriendActions: EmailAFriendActions;
}

const test = base.extend<TestFixtures>({
  browserContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    try {
      await use(context);
    } finally {
      await context.close();
    }
  },
  runner: async ({ browserContext }, use) => {
    const page = await browserContext.newPage();
    const utilsInstance = new ActionUtils(page);
    try {
      await use(utilsInstance);
    } finally {
      await page.close();
    }
  },
  userLoginPage: async ({ runner }, use) => {
    await use(new LoginPage(runner.page));
  },
  userLoginHelper: async ({ runner }, use) => {
    await use(new LoginHelper(runner.page));
  },
  userLoginActions: async ({ runner }, use) => {
    await use(new LoginActions(runner.page));
  },
  userRegisterActions: async ({ runner }, use) => {
    await use(new RegisterActions(runner.page));
  },
  passwordRecoveryActions: async ({ runner }, use) => {
    await use(new PasswordRecoveryActions(runner.page));
  },
  navigationActions: async ({ runner }, use) => {
    await use(new NavigationActions(runner.page));
  },
  catalogActions: async ({ runner }, use) => {
    await use(new CatalogActions(runner.page));
  },
  searchActions: async ({ runner }, use) => {
    await use(new SearchActions(runner.page));
  },
  productActions: async ({ runner }, use) => {
    await use(new ProductActions(runner.page));
  },
  productReviewActions: async ({ runner }, use) => {
    await use(new ProductReviewActions(runner.page));
  },
  emailAFriendActions: async ({ runner }, use) => {
    await use(new EmailAFriendActions(runner.page));
  },
});

export { test };
