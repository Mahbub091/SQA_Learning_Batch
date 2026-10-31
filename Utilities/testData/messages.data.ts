/**
 * Expected validation / status messages, grouped by feature.
 *
 * The actual wording lives in ONE place: `Data/StaticData.json`.
 * This file only turns that text into case-insensitive regular expressions, so a spec can say
 * "the page should contain this message" without caring about capital letters or a trailing dot.
 *
 * To change a message, edit `Data/StaticData.json` – no code change is needed here.
 */
import staticData from '@root/Data/StaticData.json';
import { messageRegex } from '@root/Utilities/textUtils';

// Short local names for the two sections of the JSON file.
const errors = staticData.ErrorMessages;
const success = staticData.SuccessMessages;

/** Messages shown on the Register page. */
export const registrationMessages = {
  success: messageRegex(success.registrationCompleted),
  firstNameRequired: messageRegex(errors.firstNameRequiredError),
  lastNameRequired: messageRegex(errors.lastNameRequiredError),
  emailRequired: messageRegex(errors.emailRequiredError),
  wrongEmail: messageRegex(errors.wrongEmailError),
  passwordRequired: messageRegex(errors.passwordRequiredError),
  passwordTooShort: messageRegex(errors.passwordTooShortError),
  passwordMismatch: messageRegex(errors.passwordMismatchError),
  duplicateEmail: messageRegex(errors.duplicateEmailError),
};

/** Messages shown on the Login page. */
export const loginMessages = {
  unsuccessful: messageRegex(errors.loginUnsuccessfulError),
  noAccount: messageRegex(errors.noCustomerAccountError),
  incorrectCredentials: messageRegex(errors.incorrectCredentialsError),
  emailRequired: messageRegex(errors.loginEmailRequiredError),
};

/** Messages shown on the Password Recovery ("Forgot password") page. */
export const passwordRecoveryMessages = {
  enterEmail: messageRegex(errors.forgotPasswordEmptyEmailError),
  wrongEmail: messageRegex(errors.wrongEmailError),
  emailSent: messageRegex(success.passwordRecoveryEmailSent),
  emailNotFound: messageRegex(errors.forgotPasswordEmailNotFoundError),
};

/** Messages shown by the Search feature (search page, header search box and its alert). */
export const searchMessages = {
  noResults: messageRegex(errors.searchNoResultsError),
  minLength: messageRegex(errors.searchMinLengthError),
  emptyAlert: messageRegex(errors.searchEmptyAlertError),
};
