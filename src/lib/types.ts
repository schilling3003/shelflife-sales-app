export type ProductStatus = 'healthy' | 'at-risk' | 'expiring-soon';

export type Product = {
  id: string;
  division: string;
  itemCode: string;
  brand: string;
  description: string;
  packSize: number;
  size: string;
  minExpiry: string; // ISO Date string
  maxExpiry: string; // ISO Date string
  projectedSellOut: string; // ISO Date string
  quantityOnHand: number;
  committedQuantity: number;
};
