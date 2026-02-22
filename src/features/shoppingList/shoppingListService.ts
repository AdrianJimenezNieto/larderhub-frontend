import { apiClient } from '../../lib/axiosClient';
import type { ShoppingItem, CreateShoppingItemRequest } from '../../types/shoppingItem';

const base = (householdId: number) =>
  `/api/v1/households/${householdId}/shopping-list`;

// GET /api/v1/households/{householdId}/shopping-list
export const getShoppingList = (householdId: number): Promise<ShoppingItem[]> =>
  apiClient.get<ShoppingItem[]>(base(householdId)).then((r) => r.data);

// POST /api/v1/households/{householdId}/shopping-list
export const addShoppingItem = (
  householdId: number,
  data: CreateShoppingItemRequest
): Promise<ShoppingItem> =>
  apiClient.post<ShoppingItem>(base(householdId), data).then((r) => r.data);

// PUT /api/v1/households/{householdId}/shopping-list/{itemId}/check
export const checkShoppingItem = (
  householdId: number,
  itemId: number
): Promise<ShoppingItem> =>
  apiClient.put<ShoppingItem>(`${base(householdId)}/${itemId}/check`).then((r) => r.data);

// DELETE /api/v1/households/{householdId}/shopping-list/{itemId}
export const deleteShoppingItem = (
  householdId: number,
  itemId: number
): Promise<void> =>
  apiClient.delete(`${base(householdId)}/${itemId}`).then(() => undefined);

// POST /api/v1/households/{householdId}/shopping-list/generate?threshold=N
export const generateFromPantry = (
  householdId: number,
  threshold = 1.0
): Promise<ShoppingItem[]> =>
  apiClient
    .post<ShoppingItem[]>(`${base(householdId)}/generate`, null, {
      params: { threshold },
    })
    .then((r) => r.data);
