// Product domain types — used across the inventory slice

export type ProductUnit = 'ud' | 'kg' | 'g' | 'L' | 'ml';

export interface Product {
  id: number;
  name: string;
  quantity: number;
  unit: ProductUnit;
  expirationDate: string | null; // ISO-8601 date string (YYYY-MM-DD)
  category: string;
  notes?: string;
}

export interface CreateProductRequest {
  name: string;
  quantity: number;
  unit: ProductUnit;
  expirationDate: string | null;
  category: string;
  notes?: string;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;
