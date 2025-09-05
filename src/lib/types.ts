import { Database } from "./database.types";

export type InventoryItem = {
  id: string;
  name: string;
  code: string;
  quantity: number;
  lastUpdated: string;
  category: string;
  unit: string;
  reorder_point: number | null;
  category_id: string | null;
  unit_id: string | null;
  is_palindrome: boolean;
};

export type DbItem = Database['public']['Tables']['items']['Row'];

export type StockMove = {
  id: string;
  item: string;
  type: 'in' | 'out';
  quantity: number;
  timestamp: string;
  condition: string | null;
  reason: string | null;
};
