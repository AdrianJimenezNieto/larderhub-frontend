// Catalog product — represents an item in the global product catalog
export interface CatalogProduct {
  id: number;
  name: string | null;      // backend may return null for some catalog entries
  unit: string | null;
  category: string | null;
}
