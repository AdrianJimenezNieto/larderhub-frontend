import { apiClient } from '../../lib/axiosClient';
import type { ShoppingItem, CreateShoppingItemRequest } from '../../types/shoppingItem';

const base = (householdId: number) =>
  `/api/v1/households/${householdId}/shopping-list`;

export const getShoppingList = (householdId: number): Promise<ShoppingItem[]> =>
  apiClient.get<ShoppingItem[]>(base(householdId)).then((r) => r.data);

export const addShoppingItem = (
  householdId: number,
  data: CreateShoppingItemRequest
): Promise<ShoppingItem> =>
  apiClient.post<ShoppingItem>(base(householdId), data).then((r) => r.data);

export const checkShoppingItem = (
  householdId: number,
  itemId: number
): Promise<ShoppingItem> =>
  apiClient.put<ShoppingItem>(`${base(householdId)}/${itemId}/check`).then((r) => r.data);

export const deleteShoppingItem = (
  householdId: number,
  itemId: number
): Promise<void> =>
  apiClient.delete(`${base(householdId)}/${itemId}`).then(() => undefined);

export const generateFromPantry = (
  householdId: number,
  threshold = 1.0
): Promise<ShoppingItem[]> =>
  apiClient
    .post<ShoppingItem[]>(`${base(householdId)}/generate`, null, {
      params: { threshold },
    })
    .then((r) => r.data);
