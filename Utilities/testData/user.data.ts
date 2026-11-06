import { staticData } from './data.loader';
import { FakeDataProvider, UserData } from './FakeDataProvider';

export type { UserData };

/** An e-mail address that fails the site's format validation. */
export const invalidEmail = staticData.invalidInputs.invalidEmail;

/** Builds a brand-new user. The e-mail is unique per call, so tests never collide. */
export function generateUser(overrides: Partial<UserData> = {}): UserData {
  return FakeDataProvider.user(overrides);
}
