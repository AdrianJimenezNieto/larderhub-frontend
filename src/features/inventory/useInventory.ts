import { useState, useEffect, useCallback } from 'react';
import type { PantryItem, CreatePantryItemRequest, UpdatePantryItemRequest } from '../../types/pantryItem';
import * as inventoryService from './inventoryService';

interface UseInventoryReturn {
  items: PantryItem[];
  expiredItems: PantryItem[];
  expiringItems: PantryItem[];
  loading: boolean;
  error: string | null;
  addItem: (data: CreatePantryItemRequest) => Promise<void>;
  editItem: (itemId: number, data: UpdatePantryItemRequest) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

// Helper: fallback visual para render si la API no está disponible inmediatamente o para UI instantánea
export const isExpiringSoon = (dateStr: string | null, days = 7): boolean => {
  if (!dateStr) return false;
  const diffDays = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
};

// Helper: fallback visual
export const isExpired = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

const useInventory = (householdId: number | null): UseInventoryReturn => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [expiredItems, setExpiredItems] = useState<PantryItem[]>([]);
  const [expiringItems, setExpiringItems] = useState<PantryItem[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (householdId === null) {
      setItems([]);
      setExpiredItems([]);
      setExpiringItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Cargamos todo en paralelo para alimentar el dashboard y vistas de despensa reales desde backend
      const [all, expired, expiring] = await Promise.all([
        inventoryService.getPantryItems(householdId),
        inventoryService.getExpiredItems(householdId),
        inventoryService.getExpiringItems(householdId, 7), // 7 days ahead by default
      ]);
      setItems(all);
      setExpiredItems(expired);
      setExpiringItems(expiring);
    } catch {
      setError('No se pudo cargar el inventario ni las alertas. Comprueba tu conexión.');
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const addItem = async (data: CreatePantryItemRequest): Promise<void> => {
    if (!householdId) return;
    try {
      // Como el endpoint de backend es idempotente por producto (hace suma de cantidades),
      // no sabemos si devolverá un item nuevo o uno existente sumado.
      // Por limpieza y fiabilidad, hacemos la llamada y luego refetch de todo.
      await inventoryService.createPantryItem(householdId, data);
      await fetchItems();
    } catch {
      throw new Error('No se pudo añadir el producto. Inténtalo de nuevo.');
    }
  };

  const editItem = async (itemId: number, data: UpdatePantryItemRequest): Promise<void> => {
    if (!householdId) return;
    // Optimistic update para UX rápida en cantidad/fecha
    const previous = items;
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...data } : i)));
    try {
      await inventoryService.updatePantryItem(householdId, itemId, data);
      // Las fechas pueden haber cambiado: refrescamos las alertas.
      await fetchItems();
    } catch {
      setItems(previous);
      throw new Error('No se pudo actualizar el producto. Inténtalo de nuevo.');
    }
  };

  const removeItem = async (itemId: number): Promise<void> => {
    if (!householdId) return;
    // Optimistic remove general
    const previous = items;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setExpiredItems((prev) => prev.filter((i) => i.id !== itemId));
    setExpiringItems((prev) => prev.filter((i) => i.id !== itemId));

    try {
      await inventoryService.deletePantryItem(householdId, itemId);
    } catch {
      setItems(previous);
      void fetchItems(); // Restaurar estado asumiendo error
      throw new Error('No se pudo eliminar el producto. Inténtalo de nuevo.');
    }
  };

  return {
    items,
    expiredItems,
    expiringItems,
    loading,
    error,
    addItem,
    editItem,
    removeItem,
    refetch: fetchItems,
  };
};

export default useInventory;
