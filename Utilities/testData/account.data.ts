import { staticData } from './data.loader';
import { FakeDataProvider } from './FakeDataProvider';

export interface CustomerInfoData {
  firstName: string;
  lastName: string;
}

export interface AccountAddressData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  country: string;
  state: string;
  city: string;
  address1: string;
  address2: string;
  zipPostalCode: string;
  phoneNumber: string;
  faxNumber: string;
}

/** The new first/last name used by the "edit customer info" scenario. */
export const updatedInfo: CustomerInfoData = staticData.account.updatedInfo;

const staticNewAddress = staticData.account.newAddress;

/** A complete, valid address for the "add address" form: a fresh fake name/email plus fixed fields. */
export function generateAccountAddress(
  overrides: Partial<AccountAddressData> = {},
): AccountAddressData {
  const user = FakeDataProvider.user();
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    ...staticNewAddress,
    ...overrides,
  };
}

/** The fields changed when editing an existing address. */
export const editedAddressFields = staticData.account.editedAddress;

/** The product bought to put a real order into order history, for the order-history tests. */
export const orderProduct = staticData.account.orderProduct;
