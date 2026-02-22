// Catalog product — represents an item in the global product catalog
export interface CatalogProduct {
  id: number;
  name: string | null;         // backend may return null for some catalog entries
  standardUnit: string | null; // e.g. "gramos", "litros", "ud"
  category: string | null;
}

