// Catalog product — matches ProductResponseDTO from the backend
export interface CatalogProduct {
  id: number;
  name: string | null;         // backend may return null for some catalog entries
  category: string | null;
  barcode: string | null;
  imageUrl: string | null;
  standardUnit: string | null; // e.g. "gramos", "litros", "ud"
}

