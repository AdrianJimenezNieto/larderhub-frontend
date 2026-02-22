// ShoppingItem — matches ShoppingItemResponseDTO from the backend
export interface ShoppingItem {
  id: number;
  householdId: number;
  productId: number;
  productName: string | null;
  productCategory: string | null;
  standardUnit: string | null;
  quantity: number;
  checked: boolean;
  addedAt: string; // ISO 8601
}

// Maps to ShoppingItemCreateDTO
export interface CreateShoppingItemRequest {
  productId: number;
  quantity: number;
}
