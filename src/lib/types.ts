
export type Product = {
  id: string;
  division: number;
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
