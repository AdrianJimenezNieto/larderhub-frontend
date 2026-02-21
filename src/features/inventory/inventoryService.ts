import { apiClient } from '../../lib/axiosClient';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../../types/product';

const BASE = '/api/v1/products';

// GET /api/v1/products
export const getProducts = (): Promise<Product[]> =>
  apiClient.get<Product[]>(BASE).then((r) => r.data);

// POST /api/v1/products
export const createProduct = (data: CreateProductRequest): Promise<Product> =>
  apiClient.post<Product>(BASE, data).then((r) => r.data);

// PUT /api/v1/products/:id
export const updateProduct = (id: number, data: UpdateProductRequest): Promise<Product> =>
  apiClient.put<Product>(`${BASE}/${id}`, data).then((r) => r.data);

// DELETE /api/v1/products/:id
export const deleteProduct = (id: number): Promise<void> =>
  apiClient.delete(`${BASE}/${id}`).then(() => undefined);
