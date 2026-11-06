import { staticData } from './data.loader';

export interface ProductData {
  name: string;
  path: string;
  /** 0 means "not verified against the live site" — only check the price is a positive number. */
  expectedPrice: number;
}

export interface CustomComputerData extends ProductData {
  attributeGroups: {
    processorLabel: string;
    ramLabel: string;
    hddLabel: string;
  };
}

export const customComputer: CustomComputerData = staticData.productDetail.customComputer;
export const giftCardProduct: ProductData = {
  ...staticData.productDetail.giftCard,
  expectedPrice: 0,
};

export const quantityBoundaries = staticData.productDetail.quantityBoundaries;
export const reviewRatings: number[] = staticData.productDetail.reviewRatings;
