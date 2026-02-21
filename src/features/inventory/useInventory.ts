import { useState, useEffect, useCallback } from 'react';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../../types/product';
import * as inventoryService from './inventoryService';

interface UseInventoryReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  // CRUD actions
  addProduct: (data: CreateProductRequest) => Promise<void>;
  editProduct: (id: number, data: UpdateProductRequest) => Promise<void>;
  removeProduct: (id: number) => Promise<void>;
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

// Helper: returns true if the product is already expired
export const isExpired = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

const useInventory = (): UseInventoryReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch all products from the backend ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getProducts();
      setProducts(data);
    } catch {
      setError('No se pudo cargar el inventario. Comprueba tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  // --- CREATE (refetch after server confirms) ---
  const addProduct = async (data: CreateProductRequest): Promise<void> => {
    try {
      const created = await inventoryService.createProduct(data);
      // Append new product without a full refetch
      setProducts((prev) => [...prev, created]);
    } catch {
      throw new Error('No se pudo añadir el producto. Inténtalo de nuevo.');
    }
  };

  // --- UPDATE (optimistic: update locally, rollback on error) ---
  const editProduct = async (
    id: number,
    data: UpdateProductRequest
  ): Promise<void> => {
    // Snapshot for rollback
    const previous = products;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
    try {
      const updated = await inventoryService.updateProduct(id, data);
      // Sync with server response (handles any computed fields from the backend)
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      // Rollback on failure
      setProducts(previous);
      throw new Error('No se pudo actualizar el producto. Inténtalo de nuevo.');
    }
  };

  // --- DELETE (optimistic: remove locally, rollback on error) ---
  const removeProduct = async (id: number): Promise<void> => {
    const previous = products;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await inventoryService.deleteProduct(id);
    } catch {
      // Rollback on failure
      setProducts(previous);
      throw new Error('No se pudo eliminar el producto. Inténtalo de nuevo.');
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    editProduct,
    removeProduct,
    refetch: fetchProducts,
  };
};

export default useInventory;
