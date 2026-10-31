/** Validation / status messages shown by the Demo Web Shop (matched case-insensitively). */
export const registrationMessages = {
  success: /your registration completed/i,
  firstNameRequired: /first name is required/i,
  lastNameRequired: /last name is required/i,
  emailRequired: /email is required/i,
  wrongEmail: /wrong email/i,
  passwordRequired: /password is required/i,
  passwordTooShort: /password should have at least 6 characters/i,
  passwordMismatch: /password and confirmation password do not match/i,
  duplicateEmail: /the specified email already exists/i,
};

export const loginMessages = {
  unsuccessful: /login was unsuccessful/i,
  noAccount: /no customer account found/i,
  incorrectCredentials: /the credentials provided are incorrect/i,
  emailRequired: /please enter your email/i,
};

export const passwordRecoveryMessages = {
  enterEmail: /enter your email/i,
  wrongEmail: /wrong email/i,
  emailSent: /email with instructions has been sent to you/i,
  emailNotFound: /email not found/i,
};
