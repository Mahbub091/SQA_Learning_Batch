import { staticData } from './data.loader';
import { ProductData } from './product.data';

export const cartPrimaryProduct: ProductData = staticData.cart.primaryProduct;
export const cartSecondaryProduct: ProductData = staticData.cart.secondaryProduct;

export const validCoupon: string = staticData.cart.validCoupon;
export const invalidCoupon: string = staticData.cart.invalidCoupon;
export const validGiftCard: string = staticData.cart.validGiftCard;
export const invalidGiftCard: string = staticData.cart.invalidGiftCard;

export interface EstimateShippingData {
  country: string;
  state: string;
  zipPostalCode: string;
}

export const estimateShipping: EstimateShippingData = staticData.cart.estimateShipping;
