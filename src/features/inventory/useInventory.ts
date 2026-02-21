import { useState, useEffect, useCallback } from 'react';
import type { PantryItem, CreatePantryItemRequest, UpdatePantryItemRequest } from '../../types/pantryItem';
import * as inventoryService from './inventoryService';

interface UseInventoryReturn {
  items: PantryItem[];
  loading: boolean;
  error: string | null;
  // CRUD actions
  addItem: (data: CreatePantryItemRequest) => Promise<void>;
  editItem: (id: number, data: UpdatePantryItemRequest) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  // Manual refetch
  refetch: () => Promise<void>;
}

// Helper: returns true if the expiration date is within the next `days` days
export const isExpiringSoon = (dateStr: string | null, days = 3): boolean => {
  if (!dateStr) return false;
  const expiration = new Date(dateStr);
  const now = new Date();
  const diffMs = expiration.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
};

// Helper: returns true if the item is already expired
export const isExpired = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

const useInventory = (): UseInventoryReturn => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch all pantry items from the backend ---
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getPantryItems();
      setItems(data);
    } catch {
      setError('No se pudo cargar el inventario. Comprueba tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  // --- CREATE: append server response (avoids fake temp IDs) ---
  const addItem = async (data: CreatePantryItemRequest): Promise<void> => {
    try {
      const created = await inventoryService.createPantryItem(data);
      setItems((prev) => [...prev, created]);
    } catch {
      throw new Error('No se pudo añadir el producto. Inténtalo de nuevo.');
    }
  };

  // --- UPDATE (optimistic: update locally, rollback on error) ---
  const editItem = async (id: number, data: UpdatePantryItemRequest): Promise<void> => {
    const previous = items;
    // Optimistic: merge only the editable fields (quantity + expirationDate)
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    try {
      const updated = await inventoryService.updatePantryItem(id, data);
      // Sync with server response to stay consistent
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch {
      setItems(previous);
      throw new Error('No se pudo actualizar el producto. Inténtalo de nuevo.');
    }
  };

  // --- DELETE (optimistic: remove locally, rollback on error) ---
  const removeItem = async (id: number): Promise<void> => {
    const previous = items;
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await inventoryService.deletePantryItem(id);
    } catch {
      setItems(previous);
      throw new Error('No se pudo eliminar el producto. Inténtalo de nuevo.');
    }
  };

  return {
    items,
    loading,
    error,
    addItem,
    editItem,
    removeItem,
    refetch: fetchItems,
  };
};

export default useInventory;
