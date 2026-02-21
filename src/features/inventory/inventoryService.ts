import { apiClient } from '../../lib/axiosClient';
import type { PantryItem, CreatePantryItemRequest, UpdatePantryItemRequest } from '../../types/pantryItem';

const BASE = '/api/v1/inventory';

// GET /api/v1/inventory
export const getPantryItems = (): Promise<PantryItem[]> =>
  apiClient.get<PantryItem[]>(BASE).then((r) => r.data);

// POST /api/v1/inventory — body: { productId, quantity, expirationDate }
export const createPantryItem = (data: CreatePantryItemRequest): Promise<PantryItem> =>
  apiClient.post<PantryItem>(BASE, data).then((r) => r.data);

// PUT /api/v1/inventory/:id — body: { quantity?, expirationDate? }
export const updatePantryItem = (id: number, data: UpdatePantryItemRequest): Promise<PantryItem> =>
  apiClient.put<PantryItem>(`${BASE}/${id}`, data).then((r) => r.data);

// DELETE /api/v1/inventory/:id
export const deletePantryItem = (id: number): Promise<void> =>
  apiClient.delete(`${BASE}/${id}`).then(() => undefined);
