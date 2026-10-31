import { Page, expect, Locator } from '@playwright/test';

/**
 * ActionUtils = the lowest layer of the framework.
 * It wraps raw Playwright calls (click, type, assert ...) in small reusable methods.
 * Most of them log a clear message and re-throw if the step fails, which makes failures easy to read.
 * Helpers use these methods instead of calling Playwright directly.
 */
export default class ActionUtils {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ---------- simple actions ----------

  /** Un-ticks a checkbox (does nothing if it is already un-ticked). */
  async UncheckElement(locator: Locator): Promise<void> {
    try {
      await locator.uncheck();
    } catch (error) {
      console.error('Error occurred while unchecking the element:', error);
      throw error;
    }
  }

  /** Moves the mouse over an element (used to open drop-down menus). */
  async HoverElement(locator: Locator): Promise<void> {
    try {
      await locator.hover();
    } catch (error) {
      console.error('Error occurred while hovering over the element:', error);
      throw error;
    }
  }

  /** Presses a keyboard key on an element, e.g. `PressKey(input, 'Enter')`. */
  async PressKey(locator: Locator, key: string): Promise<void> {
    try {
      await locator.press(key);
    } catch (error) {
      console.error('Error occurred while pressing a key:', error);
      throw error;
    }
  }

  /** Picks an entry of a drop-down (<select>) by the text the user sees. */
  async SelectOptionByLabel(locator: Locator, label: string): Promise<void> {
    try {
      await locator.selectOption({ label });
    } catch (error) {
      console.error(`Error occurred while selecting option "${label}":`, error);
      throw error;
    }
  }

  /** Clicks an element. */
  async ClickElement(locator: Locator): Promise<void> {
    try {
      await locator.click();
    } catch (error) {
      console.error('Error occurred while clicking the element:', error);
      throw error;
    }
  }

  /** Ticks a checkbox / radio button (does nothing if it is already ticked). */
  async CheckElement(locator: Locator): Promise<void> {
    try {
      await locator.check();
    } catch (error) {
      console.error('Error occurred while checking the element:', error);
      throw error;
    }
  }

  /** Clears an input and types the given text into it. */
  async TypeText(locator: Locator, text: string): Promise<void> {
    try {
      await locator.fill(text);
    } catch (error) {
      console.error('Error occurred while typing text:', error);
      throw error;
    }
  }

  // ---------- reading from the page ----------

  /** Returns the text of every <option> in a drop-down (extra spaces removed). */
  async GetSelectOptionLabels(locator: Locator): Promise<string[]> {
    const labels = await locator.locator('option').allTextContents();
    return labels.map((label) => label.replace(/\s+/g, ' ').trim());
  }

  /** Returns the text of the option that is currently selected in a drop-down. */
  async GetSelectedOptionLabel(locator: Locator): Promise<string> {
    const label = await locator.locator('option:checked').first().textContent();
    return (label ?? '').replace(/\s+/g, ' ').trim();
  }

  /** Returns the text of every element that matches the locator (extra spaces removed). */
  async GetAllTexts(locator: Locator): Promise<string[]> {
    const texts = await locator.allTextContents();
    return texts.map((text) => text.replace(/\s+/g, ' ').trim());
  }

  /** Returns how many elements match the locator. */
  async CountElements(locator: Locator): Promise<number> {
    return locator.count();
  }

  /** True if the (first) element is visible right now. Does not wait. */
  async IsElementVisible(locator: Locator): Promise<boolean> {
    return locator.first().isVisible();
  }

  /** True if the checkbox / radio button is ticked. */
  async IsElementChecked(locator: Locator): Promise<boolean> {
    return locator.isChecked();
  }

  /** Returns the text of an element, or an empty string when it has none. */
  async GetElementText(locator: Locator): Promise<string> {
    try {
      return (await locator.textContent()) || '';
    } catch (error) {
      console.error('Error occurred while getting element text:', error);
      throw error;
    }
  }

  /** Returns name + expiry date of every cookie (used to tell "remember me" cookies apart). */
  async GetCookies(): Promise<{ name: string; expires: number }[]> {
    const cookies = await this.page.context().cookies();
    return cookies.map(({ name, expires }) => ({ name, expires }));
  }

  // ---------- assertions (the test fails if the check fails) ----------

  /** Passes when the element is NOT shown on the page (waits up to the expect timeout). */
  async AssertElementNotVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden();
  }

  /** Passes when the (first) element contains the text. Accepts plain text or a regex. */
  async AssertElementContainsText(locator: Locator, text: string | RegExp): Promise<void> {
    await expect(locator.first()).toContainText(text);
  }

  /** Passes when the current page address matches the given text or regex. */
  async AssertUrlMatches(url: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }

  /** Passes when the browser tab title matches the given text or regex. */
  async AssertPageTitle(title: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  /** Passes when the element is shown on the page (waits up to the expect timeout). */
  async AssertElementVisible(locator: Locator): Promise<void> {
    try {
      await expect(locator).toBeVisible();
    } catch (error) {
      console.error('Error occurred while asserting element visibility:', error);
      throw error;
    }
  }

  // ---------- browser / page level actions ----------

  /** Runs `trigger` and returns the message of the browser dialog (alert/confirm) it opens. */
  async CaptureDialogMessage(trigger: () => Promise<void>): Promise<string> {
    // Start listening BEFORE the trigger, otherwise a fast dialog could be missed.
    const dialogPromise = this.page.waitForEvent('dialog');
    await trigger();
    const dialog = await dialogPromise;
    const message = dialog.message();
    await dialog.accept();
    return message;
  }

  /** Waits for the URL to change after `trigger` (used by select boxes that reload the page). */
  async TriggerAndWaitForUrlChange(trigger: () => Promise<void>): Promise<void> {
    const before = this.page.url();
    await trigger();
    await this.page.waitForURL((url) => url.toString() !== before);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Opens a URL. By default it also waits until the network is quiet (page fully loaded). */
  async NavigateToUrl(url: string, waitForLoadState: boolean = true): Promise<void> {
    try {
      await this.page.goto(url);
      if (waitForLoadState) {
        await this.page.waitForLoadState('networkidle');
      }
    } catch (error) {
      console.error('Error occurred while navigating to URL:', error);
      throw error;
    }
  }

  /**
   * Pauses for `time` SECONDS and then optionally waits for a selector / network / load state.
   * Prefer normal assertions (they wait automatically); use this only when nothing else works.
   */
  async waitForDesiredState(
    time: number,
    Options: {
      waitForSelector?: string;
      waitForNetworkIdle?: boolean;
      waitForLoadState?: 'load' | 'domcontentloaded' | 'networkidle';
    } = {},
  ): Promise<void> {
    const { waitForSelector, waitForNetworkIdle, waitForLoadState } = Options;

    try {
      await this.page.waitForTimeout(time * 1000);
      if (waitForSelector) {
        await this.page.waitForSelector(waitForSelector, {
          state: 'visible',
          timeout: 10000,
        });
        // this.logMessage(`Waited for selector: ${waitForSelector}`);
      }

      if (waitForNetworkIdle) {
        await this.page.waitForLoadState('networkidle');
        // this.logMessage(`Waited for network idle`);
      }
      if (waitForLoadState) {
        await this.page.waitForLoadState(waitForLoadState);
        // this.logMessage(`Waited for load state: ${waitForLoadState}`);
      }
    } catch (error) {
      const errorMsg = `❌ Failed to wait for ${time} seconds to match specified conditions`;
      // this.logMessage(errorMsg, 'error');
      // await this.captureScreenshotOnFailure('wait');
      throw new Error(errorMsg);
    }
  }

  /**
   * Checks that an element's text equals the expected text (letter case and outer spaces ignored).
   *
   * - `identifier`   : a CSS selector string OR a Playwright Locator.
   * - `expectedText` : one string (compared with the first match), or an array of strings
   *                    (one per matching element, in order; the element count must be equal).
   * - `childSelector`: optional CSS selector searched inside `identifier` (selector strings only).
   * - `placeholderText`: a value such as '-' that the page shows for "no data"; it counts as empty
   *                    and makes the check fail.
   * - `timeout`      : how long (ms) to wait for the elements to appear.
   *
   * The commented-out `this.logMessage(...)` lines are kept for a future logger.
   */
  async verifyElementText(
    identifier: string | Locator,
    expectedText: string | string[],
    childSelector?: string,
    placeholderText: '-' | 'Not provided' = '-',
    timeout: number = 10000,
  ): Promise<void> {
    try {
      let target: Locator;
      let contextLabel: string;

      // Step 1: turn the identifier into a Locator and a readable label for error messages.
      if (typeof identifier === 'string') {
        await this.page.waitForSelector(identifier, { timeout });
        target = this.page.locator(identifier);
        contextLabel = identifier;

        if (childSelector) {
          target = target.locator(childSelector);
          await expect(async () => {
            const count = await target.count();
            expect(count).toBeGreaterThan(0);
          }).toPass({ timeout });
          contextLabel += ` > ${childSelector}`;
        }
      } else {
        target = identifier;
        contextLabel = 'Locator instance';
      }

      // Step 2: a text is "normalized" before comparing: trimmed, lower-cased,
      // and an empty / placeholder text becomes ''.
      const normalize = (val: string) => {
        const trimmed = val.trim();
        if (trimmed === '' || trimmed.toLowerCase() === placeholderText.toLowerCase()) {
          return '';
        }
        return trimmed.toLowerCase();
      };

      // Builds a readable "expected vs actual" error and throws it.
      const logFailure = async (
        context: string,
        expected: string,
        actualRaw: string,
        actualNormalized: string,
      ) => {
        const errorMsg =
          `❌ Text mismatch at "${context}"\n` +
          `  ├─ Expected (normalized): "${expected}"\n` +
          `  ├─ Actual (raw): "${actualRaw}"\n` +
          `  └─ Actual (normalized): "${actualNormalized}"`;
        // this.logMessage(errorMsg, 'error');
        // await this.captureScreenshotOnFailure('verifyElementText');
        throw new Error(errorMsg);
      };

      // Step 3: wait until at least one element exists.
      await expect(async () => {
        const count = await target.count();
        expect(count).toBeGreaterThan(0);
      }).toPass({ timeout });

      if (typeof expectedText === 'string') {
        // Case A: one expected text -> compare it with the first matching element.
        const actualRawText = (await target.first().textContent()) ?? '';
        if (
          actualRawText.trim() === '' ||
          actualRawText.trim().toLowerCase() === placeholderText.toLowerCase()
        ) {
          throw new Error(
            `Element "${contextLabel}" text is empty or placeholder "${placeholderText}"`,
          );
        }

        const actualNormalized = normalize(actualRawText);
        const expectedNormalized = normalize(expectedText);

        if (actualNormalized !== expectedNormalized) {
          await logFailure(contextLabel, expectedNormalized, actualRawText, actualNormalized);
        }

        // this.logMessage(
        //   `✅ Text of "${contextLabel}" matches expected: "${actualRawText.trim()}"`,
        //   'info',
        // );
      } else {
        // Case B: a list of expected texts -> compare element by element, in order.
        if (expectedText.length === 0) {
          // this.logMessage(
          //   `⚠️ Expected text array is empty for "${contextLabel}". Skipping validation.`,
          //   'warn',
          // );
          return;
        }

        const actualCount = await target.count();
        if (actualCount !== expectedText.length) {
          const errorMsg =
            `❌ Element count mismatch for "${contextLabel}"\n` +
            `  ├─ Expected count: ${expectedText.length}\n` +
            `  └─ Actual count:   ${actualCount}`;
          // this.logMessage(errorMsg, 'error');
          // await this.captureScreenshotOnFailure('verifyElementText');
          throw new Error(errorMsg);
        }

        for (let i = 0; i < actualCount; i++) {
          const element = target.nth(i);
          const actualRawText = (await element.textContent()) ?? '';

          if (
            actualRawText.trim() === '' ||
            actualRawText.trim().toLowerCase() === placeholderText.toLowerCase()
          ) {
            throw new Error(
              `Element "${contextLabel} [index: ${i}]" text is empty or placeholder "${placeholderText}"`,
            );
          }

          const actualNormalized = normalize(actualRawText);
          const expectedNormalized = normalize(expectedText[i]);
          const elementLabel = `${contextLabel} [index: ${i}]`;

          if (actualNormalized !== expectedNormalized) {
            await logFailure(elementLabel, expectedNormalized, actualRawText, actualNormalized);
          }

          // this.logMessage(
          //   `✅ Text of "${elementLabel}" matches expected: "${actualRawText.trim()}"`,
          //   'info',
          // );
        }
      }
    } catch (error) {
      // Prefix every failure so it is obvious which utility reported it.
      if (error instanceof Error) {
        const enhancedMessage = `❌ verifyElementText failed: ${error.message}`;
        // this.logMessage(enhancedMessage, 'error');
        error.message = enhancedMessage;
        throw error;
      }
      throw error;
    }
  }
}
