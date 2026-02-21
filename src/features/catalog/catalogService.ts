import { apiClient } from '../../lib/axiosClient';
import type { CatalogProduct } from '../../types/catalogProduct';

const BASE = '/api/v1/products';

// GET /api/v1/products — fetch the full product catalog
export const getCatalogProducts = (): Promise<CatalogProduct[]> =>
  apiClient.get<CatalogProduct[]>(BASE).then((r) => r.data);
