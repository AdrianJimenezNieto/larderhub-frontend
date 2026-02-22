import { useState, useEffect } from 'react';
import type { PantryItem, CreatePantryItemRequest } from '../../../types/pantryItem';
import type { CatalogProduct } from '../../../types/catalogProduct';
import { getCatalogProducts } from '../../catalog/catalogService';
import CatalogSearchInput from './CatalogSearchInput';

interface PantryItemModalProps {
  // If item is provided, the modal is in "edit" mode (only qty + date editable)
  item?: PantryItem | null;
  onSave: (data: CreatePantryItemRequest) => Promise<void>;
  onClose: () => void;
}

const PantryItemModal = ({ item, onSave, onClose }: PantryItemModalProps) => {
  const isEditing = !!item;

  // Catalog state (for the add-mode dropdown)
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(false);

  // Form state — productId uses the flat pantryItem.productId
  const [productId, setProductId] = useState<number | ''>(item?.productId ?? '');
  const [quantity, setQuantity] = useState<number>(item?.quantity ?? 1);
  const [expirationDate, setExpirationDate] = useState<string>(item?.expirationDate ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch catalog on mount
  useEffect(() => {
    setCatalogLoading(true);
    getCatalogProducts()
      .then((data) => { setCatalog(data); setCatalogError(false); })
      .catch(() => setCatalogError(true))
      .finally(() => setCatalogLoading(false));
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (item) {
      setProductId(item.productId);
      setQuantity(item.quantity);
      setExpirationDate(item.expirationDate ?? '');
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isEditing && productId === '') { setError('Selecciona un producto del catálogo.'); return; }
    if (quantity <= 0) { setError('La cantidad debe ser mayor que 0.'); return; }
    setLoading(true);
    try {
      await onSave({ productId: productId as number, quantity, expirationDate: expirationDate || null });
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Find selected catalog product to show its unit next to the quantity field
  const selectedCatalogProduct = catalog.find((p) => p.id === productId);
  const unitHint = isEditing ? item?.standardUnit : selectedCatalogProduct?.standardUnit;

  return (
    <div
      className="fixed inset-0 z-50 bg-surface-900/50 flex items-end sm:items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pantry-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-modal p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 id="pantry-modal-title" className="text-xl text-surface-900 font-heading">
            {isEditing ? 'Editar cantidad / caducidad' : 'Añadir a la despensa'}
          </h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-700 text-2xl leading-none" aria-label="Cerrar modal">×</button>
        </div>

        {/* Error alert */}
        {error && (
          <div role="alert" className="text-sm text-alert-600 bg-alert-50 border border-alert-200 rounded-lg px-4 py-2 font-body">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          {/* Product selector */}
          <div className="flex flex-col gap-1">
            <label htmlFor="pantry-product" className="text-sm font-semibold text-surface-700 font-body">
              Producto <span className="text-alert-600">*</span>
            </label>

            {isEditing ? (
              // Read-only in edit mode — product cannot be swapped
              <div className="border border-surface-200 bg-surface-100 rounded-lg px-3 py-2 font-body text-surface-700">
                {item?.productName ?? 'Producto desconocido'}
              </div>
            ) : catalogError ? (
              <p className="text-sm text-alert-600 font-body">No se pudo cargar el catálogo. Recarga la página.</p>
            ) : (
              <CatalogSearchInput
                catalog={catalog}
                value={productId}
                onChange={(id) => { setProductId(id); setError(null); }}
                disabled={catalogLoading}
              />
            )}
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1">
            <label htmlFor="pantry-quantity" className="text-sm font-semibold text-surface-700 font-body">
              Cantidad <span className="text-alert-600">*</span>
              {unitHint && <span className="ml-2 text-surface-400 font-normal">({unitHint})</span>}
            </label>
            <input
              id="pantry-quantity"
              type="number"
              min={0.01}
              step={0.01}
              required
              value={quantity}
              onChange={(e) => { setQuantity(Number(e.target.value)); setError(null); }}
              className="border border-surface-300 rounded-lg px-3 py-2 font-body text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Expiration date */}
          <div className="flex flex-col gap-1">
            <label htmlFor="pantry-expiration" className="text-sm font-semibold text-surface-700 font-body">
              Fecha de caducidad <span className="text-surface-400 font-normal">(opcional)</span>
            </label>
            <input
              id="pantry-expiration"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="border border-surface-300 rounded-lg px-3 py-2 font-body text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-surface-300 text-surface-600 font-semibold font-body rounded-lg hover:bg-surface-100 transition-colors">
              Cancelar
            </button>
            <button id="pantry-modal-save" type="submit"
              disabled={loading || (!isEditing && catalogLoading)}
              className="flex-1 bg-brand-600 text-white font-semibold font-body rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors">
              {loading ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Añadir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PantryItemModal;
