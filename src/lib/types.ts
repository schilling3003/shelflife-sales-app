
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

export type SalesCommitment = {
  id: string;
  userId: string;
  productId: string;
  committedQuantity: number;
  commitmentDate: string; // ISO Date string
};

export type User = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
};
