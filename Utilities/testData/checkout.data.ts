import { staticData } from './data.loader';
import { FakeDataProvider } from './FakeDataProvider';

export interface AddressData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  state: string;
  city: string;
  address1: string;
  zipPostalCode: string;
  phoneNumber: string;
}

const staticAddress = staticData.checkout.address;

/** A complete, valid address: a fresh fake name/email plus the fixed static address fields. */
export function generateAddress(overrides: Partial<AddressData> = {}): AddressData {
  const user = FakeDataProvider.user();
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    ...staticAddress,
    ...overrides,
  };
}

export const shippingMethods = staticData.checkout.shippingMethods;
export const paymentMethods = staticData.checkout.paymentMethods;
export const creditCard = staticData.checkout.creditCard;
export const purchaseOrderNumber: string = staticData.checkout.purchaseOrderNumber;

export type ShippingMethodKey = keyof typeof shippingMethods;
export type PaymentMethodKey = keyof typeof paymentMethods;
