import { compilePatterns, staticData } from './data.loader';

/** Validation / status messages shown by the Demo Web Shop (matched case-insensitively). */
export const registrationMessages = compilePatterns(staticData.messages.registration);
export const loginMessages = compilePatterns(staticData.messages.login);
export const passwordRecoveryMessages = compilePatterns(staticData.messages.passwordRecovery);
export const productDetailMessages = compilePatterns(staticData.messages.productDetail);
