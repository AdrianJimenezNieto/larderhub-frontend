import { useState, useEffect, useCallback } from 'react';
import type { PantryItem, CreatePantryItemRequest, UpdatePantryItemRequest } from '../../types/pantryItem';
import * as inventoryService from './inventoryService';

interface UseInventoryReturn {
  items: PantryItem[];
  loading: boolean;
  error: string | null;
  addItem: (data: CreatePantryItemRequest) => Promise<void>;
  editItem: (itemId: number, data: UpdatePantryItemRequest) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

// Helper: returns true if the expiration date is within the next `days` days
export const isExpiringSoon = (dateStr: string | null, days = 3): boolean => {
  if (!dateStr) return false;
  const diffDays = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
};

// Helper: returns true if the item is already expired
export const isExpired = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

// householdId: active household — pass null to disable all fetching
const useInventory = (householdId: number | null): UseInventoryReturn => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (householdId === null) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getPantryItems(householdId);
      setItems(data);
    } catch {
      setError('No se pudo cargar el inventario. Comprueba tu conexión.');
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  // Re-fetch whenever the active household changes
  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const addItem = async (data: CreatePantryItemRequest): Promise<void> => {
    if (!householdId) return;
    try {
      const created = await inventoryService.createPantryItem(householdId, data);
      setItems((prev) => [...prev, created]);
    } catch {
      throw new Error('No se pudo añadir el producto. Inténtalo de nuevo.');
    }
  };

  const editItem = async (itemId: number, data: UpdatePantryItemRequest): Promise<void> => {
    if (!householdId) return;
    const previous = items;
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...data } : i)));
    try {
      const updated = await inventoryService.updatePantryItem(householdId, itemId, data);
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
    } catch {
      setItems(previous);
      throw new Error('No se pudo actualizar el producto. Inténtalo de nuevo.');
    }
  };

  const removeItem = async (itemId: number): Promise<void> => {
    if (!householdId) return;
    const previous = items;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await inventoryService.deletePantryItem(householdId, itemId);
    } catch {
      setItems(previous);
      throw new Error('No se pudo eliminar el producto. Inténtalo de nuevo.');
    }
  };

  return { items, loading, error, addItem, editItem, removeItem, refetch: fetchItems };
};

export default useInventory;
