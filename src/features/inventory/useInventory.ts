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

// helpers para la UI sin esperar a la API

const parseLocalDate = (dateStr: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const todayMidnight = (): Date => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};

export const isExpired = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  const d = parseLocalDate(dateStr);
  if (!d) return false;
  return d.getTime() < todayMidnight().getTime();
};

export const isExpiringSoon = (dateStr: string | null, days = 7): boolean => {
  if (!dateStr) return false;
  const d = parseLocalDate(dateStr);
  if (!d) return false;
  const diffDays = Math.round((d.getTime() - todayMidnight().getTime()) / 86400000);
  return diffDays >= 0 && diffDays <= days;
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
      // cargamos en paralelo: inventario + alertas de caducidad
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
      // el backend suma cantidades si ya existe, así que refrescamos todo
      await inventoryService.createPantryItem(householdId, data);
      await fetchItems();
    } catch {
      throw new Error('No se pudo añadir el producto. Inténtalo de nuevo.');
    }
  };

  const editItem = async (itemId: number, data: UpdatePantryItemRequest): Promise<void> => {
    if (!householdId) return;
    // update optimista
    const previous = items;
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...data } : i)));
    try {
      await inventoryService.updatePantryItem(householdId, itemId, data);
      // las alertas pueden haber cambiado
      await fetchItems();
    } catch {
      setItems(previous);
      throw new Error('No se pudo actualizar el producto. Inténtalo de nuevo.');
    }
  };

  const removeItem = async (itemId: number): Promise<void> => {
    if (!householdId) return;
    // quitamos de las tres listas
    const previous = items;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setExpiredItems((prev) => prev.filter((i) => i.id !== itemId));
    setExpiringItems((prev) => prev.filter((i) => i.id !== itemId));

    try {
      await inventoryService.deletePantryItem(householdId, itemId);
    } catch {
      setItems(previous);
      void fetchItems();
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
