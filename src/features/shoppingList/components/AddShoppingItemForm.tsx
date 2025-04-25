import { useState } from 'react';
import type { CatalogProduct } from '../../../types/catalogProduct';
import CatalogSearchInput from '../../inventory/components/CatalogSearchInput';

interface Props {
  catalog: CatalogProduct[];
  catalogLoading: boolean;
  onAdd: (productId: number, quantity: number) => Promise<void>;
}

const AddShoppingItemForm = ({ catalog, catalogLoading, onAdd }: Props) => {
  const [productId, setProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedProduct = catalog.find(p => p.id === productId);

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
      setError('No se pudo añadir el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {error && (
        <div style={{ padding: '8px 12px', background: 'var(--red-soft)', color: 'var(--red)', borderRadius: 'var(--r-m)', fontSize: 13 }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <CatalogSearchInput
            catalog={catalog}
            value={productId}
            onChange={(id) => { setProductId(id); setError(null); }}
            disabled={catalogLoading}
            placeholder={catalogLoading ? 'Cargando catálogo…' : 'Busca un producto…'}
          />
        </div>
        <input
          type="number"
          min={1}
          step={1}
          value={quantity}
          onChange={e => { setQuantity(Number(e.target.value)); setError(null); }}
          className="input"
          style={{ width: 64, textAlign: 'center' }}
          aria-label="Cantidad"
        />
        {selectedProduct?.standardUnit && (
          <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center', flexShrink: 0 }}>
            {selectedProduct.standardUnit}
          </span>
        )}
        <button
          id="add-shopping-item-button"
          type="submit"
          disabled={loading || catalogLoading}
          className="btn btn-accent"
          style={{ flexShrink: 0, paddingLeft: 16, paddingRight: 16 }}
        >
          {loading ? '…' : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default AddShoppingItemForm;
