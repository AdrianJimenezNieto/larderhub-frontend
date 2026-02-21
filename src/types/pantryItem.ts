import type { CatalogProduct } from './catalogProduct';

// A PantryItem is a product from the catalog added to the user's pantry
export interface PantryItem {
  id: number;
  product: CatalogProduct; // embedded catalog product returned by the backend
  quantity: number;
  expirationDate: string | null; // ISO-8601 date (YYYY-MM-DD)
}

// Maps to PantryItemCreateDTO in the backend
export interface CreatePantryItemRequest {
  productId: number;
  quantity: number;
  expirationDate: string | null;
}

// Maps to PantryItemUpdateDTO in the backend
export interface UpdatePantryItemRequest {
  quantity?: number;
  expirationDate?: string | null;
}
