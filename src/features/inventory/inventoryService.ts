import { apiClient } from '../../lib/axiosClient';
import type { PantryItem, CreatePantryItemRequest, UpdatePantryItemRequest } from '../../types/pantryItem';

// Base URL requires householdId — the backend scopes all inventory under a household
const base = (householdId: number) =>
  `/api/v1/households/${householdId}/inventory`;

// GET /api/v1/households/{householdId}/inventory
export const getPantryItems = (householdId: number): Promise<PantryItem[]> =>
  apiClient.get<PantryItem[]>(base(householdId)).then((r) => r.data);

// GET /api/v1/households/{householdId}/inventory/expired
export const getExpiredItems = (householdId: number): Promise<PantryItem[]> =>
  apiClient.get<PantryItem[]>(`${base(householdId)}/expired`).then((r) => r.data);

// GET /api/v1/households/{householdId}/inventory/expiring?daysAhead=7
export const getExpiringItems = (householdId: number, daysAhead = 7): Promise<PantryItem[]> =>
  apiClient
    .get<PantryItem[]>(`${base(householdId)}/expiring`, { params: { daysAhead } })
    .then((r) => r.data);

// POST /api/v1/households/{householdId}/inventory
export const createPantryItem = (
  householdId: number,
  data: CreatePantryItemRequest
): Promise<PantryItem> =>
  apiClient.post<PantryItem>(base(householdId), data).then((r) => r.data);

// PUT /api/v1/households/{householdId}/inventory/{itemId}
export const updatePantryItem = (
  householdId: number,
  itemId: number,
  data: UpdatePantryItemRequest
): Promise<PantryItem> =>
  apiClient.put<PantryItem>(`${base(householdId)}/${itemId}`, data).then((r) => r.data);

// DELETE /api/v1/households/{householdId}/inventory/{itemId}
export const deletePantryItem = (householdId: number, itemId: number): Promise<void> =>
  apiClient.delete(`${base(householdId)}/${itemId}`).then(() => undefined);

