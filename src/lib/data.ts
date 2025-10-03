import { addDays, subDays, formatISO } from 'date-fns';
import type { Product } from './types';

const today = new Date();

export const products: Product[] = [
  {
    id: 'prod_1',
    division: 'Bakery',
    itemCode: 'BK-001',
    packSize: 12,
    description: 'Artisan Sourdough Loaf',
    minExpiry: formatISO(addDays(today, 15)), // expiring-soon
    maxExpiry: formatISO(addDays(today, 25)),
    projectedSellOut: formatISO(addDays(today, 10)),
    quantityOnHand: 150,
    committedQuantity: 25,
  },
  {
    id: 'prod_2',
    division: 'Dairy',
    itemCode: 'DY-015',
    packSize: 6,
    description: 'Organic Greek Yogurt',
    minExpiry: formatISO(addDays(today, 45)), // at-risk
    maxExpiry: formatISO(addDays(today, 60)),
    projectedSellOut: formatISO(addDays(today, 40)),
    quantityOnHand: 200,
    committedQuantity: 150,
  },
  {
    id: 'prod_3',
    division: 'Produce',
    itemCode: 'PR-052',
    packSize: 1,
    description: 'Avocado Hass',
    minExpiry: formatISO(addDays(today, 5)), // expiring-soon
    maxExpiry: formatISO(addDays(today, 9)),
    projectedSellOut: formatISO(addDays(today, 3)),
    quantityOnHand: 300,
    committedQuantity: 100,
  },
  {
    id: 'prod_4',
    division: 'Beverages',
    itemCode: 'BV-101',
    packSize: 24,
    description: 'Sparkling Mineral Water',
    minExpiry: formatISO(addDays(today, 180)), // healthy
    maxExpiry: formatISO(addDays(today, 365)),
    projectedSellOut: formatISO(addDays(today, 150)),
    quantityOnHand: 500,
    committedQuantity: 50,
  },
  {
    id: 'prod_5',
    division: 'Frozen',
    itemCode: 'FZ-033',
    packSize: 1,
    description: 'Neapolitan Pizza',
    minExpiry: formatISO(addDays(today, 88)), // at-risk
    maxExpiry: formatISO(addDays(today, 120)),
    projectedSellOut: formatISO(addDays(today, 95)),
    quantityOnHand: 120,
    committedQuantity: 80,
  },
  {
    id: 'prod_6',
    division: 'Snacks',
    itemCode: 'SN-089',
    packSize: 30,
    description: 'Sea Salt Potato Chips',
    minExpiry: formatISO(addDays(today, 92)), // healthy
    maxExpiry: formatISO(addDays(today, 150)),
    projectedSellOut: formatISO(addDays(today, 70)),
    quantityOnHand: 450,
    committedQuantity: 450,
  },
  {
    id: 'prod_7',
    division: 'Dairy',
    itemCode: 'DY-004',
    packSize: 1,
    description: 'Whole Milk Gallon',
    minExpiry: formatISO(addDays(today, 12)), // expiring-soon
    maxExpiry: formatISO(addDays(today, 18)),
    projectedSellOut: formatISO(addDays(today, 8)),
    quantityOnHand: 80,
    committedQuantity: 10,
  },
    {
    id: 'prod_8',
    division: 'Meat',
    itemCode: 'MT-007',
    packSize: 2,
    description: 'Grass-fed Ribeye Steak',
    minExpiry: formatISO(addDays(today, 8)), // expiring-soon
    maxExpiry: formatISO(addDays(today, 14)),
    projectedSellOut: formatISO(subDays(today, 2)), // past sell-out date
    quantityOnHand: 40,
    committedQuantity: 5,
  },
];
