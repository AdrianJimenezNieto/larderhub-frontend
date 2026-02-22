// PantryItem — flat structure matching the backend InventoryItemResponseDTO
export interface PantryItem {
  id: number;
  productId: number;
  productName: string | null;
  productBarcode: string | null;
  productImageUrl: string | null;
  standardUnit: string | null;
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
