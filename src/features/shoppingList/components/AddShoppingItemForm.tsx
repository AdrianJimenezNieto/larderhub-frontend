import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { CatalogProduct } from '../../../types/catalogProduct';
import CatalogSearchInput from '../../inventory/components/CatalogSearchInput';

interface AddShoppingItemFormProps {
  catalog: CatalogProduct[];
  catalogLoading: boolean;
  onAdd: (productId: number, quantity: number) => Promise<void>;
}

const AddShoppingItemForm = ({ catalog, catalogLoading, onAdd }: AddShoppingItemFormProps) => {
  const [productId, setProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedProduct = catalog.find((p) => p.id === productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productId === '') { setError('Selecciona un producto.'); return; }
    if (quantity <= 0) { setError('La cantidad debe ser > 0.'); return; }
    setLoading(true);
    setError(null);
    try {
      await onAdd(productId, quantity);
      setProductId('');
      setQuantity(1);
    } catch {
      setError('No se pudo añadir el producto. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-surface-200 rounded-xl p-4 flex flex-col gap-3 shadow-card"
      noValidate
    >
      <h3 className="text-sm font-semibold text-surface-700 font-body">Añadir producto a la lista</h3>

      {error && (
        <p role="alert" className="text-xs text-alert-600 font-body">{error}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        {/* Product combobox */}
        <div className="flex-1">
          <CatalogSearchInput
            catalog={catalog}
            value={productId}
            onChange={(id) => { setProductId(id); setError(null); }}
            disabled={catalogLoading}
            placeholder="Busca un producto…"
          />
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-1 shrink-0">
          <input
            id="shopping-quantity"
            type="number"
            min={0.01}
            step={0.01}
            value={quantity}
            onChange={(e) => { setQuantity(Number(e.target.value)); setError(null); }}
            className="w-20 border border-surface-300 rounded-lg px-2 py-2 font-body text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            aria-label="Cantidad"
          />
          {selectedProduct?.standardUnit && (
            <span className="text-xs text-surface-400 font-body">{selectedProduct.standardUnit}</span>
          )}
        </div>

        {/* Submit */}
        <button
          id="add-shopping-item-button"
          type="submit"
          disabled={loading || catalogLoading}
          className="shrink-0 flex items-center gap-1.5 bg-brand-600 text-white font-semibold font-body text-sm rounded-lg px-4 hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          <Plus size={16} />
          {loading ? 'Añadiendo…' : 'Añadir'}
        </button>
      </div>
    </form>
  );
};

export default AddShoppingItemForm;
