import { useState, useEffect, useCallback } from 'react';
import type { ShoppingItem, CreateShoppingItemRequest } from '../../types/shoppingItem';
import * as service from './shoppingListService';

interface UseShoppingListReturn {
  items: ShoppingItem[];
  loading: boolean;
  error: string | null;
  pendingItems: ShoppingItem[];
  checkedItems: ShoppingItem[];
  addItem: (data: CreateShoppingItemRequest) => Promise<void>;
  checkItem: (itemId: number) => Promise<ShoppingItem>;
  deleteItem: (itemId: number) => Promise<void>;
  generateFromPantry: (threshold?: number) => Promise<ShoppingItem[]>;
  refetch: () => Promise<void>;
}

const useShoppingList = (householdId: number | null): UseShoppingListReturn => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (householdId === null) { setItems([]); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await service.getShoppingList(householdId);
      setItems(data);
    } catch {
      setError('No se pudo cargar la lista de la compra.');
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => { void fetchItems(); }, [fetchItems]);

  // añadir: usamos la respuesta del server para tener el ID real
  const addItem = async (data: CreateShoppingItemRequest): Promise<void> => {
    if (!householdId) return;
    const created = await service.addShoppingItem(householdId, data);
    setItems((prev) => [created, ...prev]);
  };

  // marcar comprado: update optimista
  const checkItem = async (itemId: number): Promise<ShoppingItem> => {
    if (!householdId) throw new Error('No household selected.');
    const previous = items;
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, checked: true } : i))
    );
    try {
      const updated = await service.checkShoppingItem(householdId, itemId);
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
      return updated;
    } catch (err) {
      setItems(previous);
      throw err;
    }
  };

  const deleteItem = async (itemId: number): Promise<void> => {
    if (!householdId) return;
    const previous = items;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await service.deleteShoppingItem(householdId, itemId);
    } catch (err) {
      setItems(previous);
      throw err;
    }
  };

  // genera lista desde stock bajo
  const generateFromPantry = async (threshold = 1.0): Promise<ShoppingItem[]> => {
    if (!householdId) return [];
    const newItems = await service.generateFromPantry(householdId, threshold);
    if (newItems.length > 0) {
      setItems((prev) => {
        // evitamos duplicar items ya en estado local
        const existingIds = new Set(prev.map((i) => i.id));
        const fresh = newItems.filter((i) => !existingIds.has(i.id));
        return [...fresh, ...prev];
      });
    }
    return newItems;
  };

  const pendingItems = items.filter((i) => !i.checked);
  const checkedItems = items.filter((i) => i.checked);

  return {
    items,
    loading,
    error,
    pendingItems,
    checkedItems,
    addItem,
    checkItem,
    deleteItem,
    generateFromPantry,
    refetch: fetchItems,
  };
};

export default useShoppingList;
