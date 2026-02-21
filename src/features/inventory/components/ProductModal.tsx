import { useState, useEffect } from 'react';
import type { Product, CreateProductRequest, ProductUnit } from '../../../types/product';

const UNITS: ProductUnit[] = ['ud', 'kg', 'g', 'L', 'ml'];

const EMPTY_FORM: CreateProductRequest = {
  name: '',
  quantity: 1,
  unit: 'ud',
  expirationDate: null,
  category: '',
  notes: '',
};

interface ProductModalProps {
  // If product is provided, the modal is in "edit" mode
  product?: Product | null;
  onSave: (data: CreateProductRequest) => Promise<void>;
  onClose: () => void;
}

const ProductModal = ({ product, onSave, onClose }: ProductModalProps) => {
  const isEditing = !!product;
  const [form, setForm] = useState<CreateProductRequest>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        quantity: product.quantity,
        unit: product.unit,
        expirationDate: product.expirationDate,
        category: product.category,
        notes: product.notes ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value === '' && name === 'expirationDate' ? null : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('El nombre del producto es obligatorio.');
      return;
    }
    if (form.quantity <= 0) {
      setError('La cantidad debe ser mayor que 0.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Error al guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  // Close modal on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 bg-surface-900/50 flex items-end sm:items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Modal panel */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-modal p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-xl text-surface-900 font-heading">
            {isEditing ? 'Editar producto' : 'Añadir producto'}
          </h2>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-700 text-2xl leading-none"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="text-sm text-alert-600 bg-alert-50 border border-alert-200 rounded-lg px-4 py-2 font-body">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="product-name" className="text-sm font-semibold text-surface-700 font-body">
              Nombre <span className="text-alert-600">*</span>
            </label>
            <input
              id="product-name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Leche entera"
              className="border border-surface-300 rounded-lg px-3 py-2 font-body text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Quantity + Unit (side by side) */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="product-quantity" className="text-sm font-semibold text-surface-700 font-body">
                Cantidad <span className="text-alert-600">*</span>
              </label>
              <input
                id="product-quantity"
                name="quantity"
                type="number"
                min={0.01}
                step={0.01}
                required
                value={form.quantity}
                onChange={handleChange}
                className="border border-surface-300 rounded-lg px-3 py-2 font-body text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>
            <div className="flex flex-col gap-1 w-24">
              <label htmlFor="product-unit" className="text-sm font-semibold text-surface-700 font-body">
                Unidad
              </label>
              <select
                id="product-unit"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="border border-surface-300 rounded-lg px-3 py-2 font-body text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition bg-white"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label htmlFor="product-category" className="text-sm font-semibold text-surface-700 font-body">
              Categoría
            </label>
            <input
              id="product-category"
              name="category"
              type="text"
              value={form.category}
              onChange={handleChange}
              placeholder="Ej: Lácteos, Verduras…"
              className="border border-surface-300 rounded-lg px-3 py-2 font-body text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Expiration date */}
          <div className="flex flex-col gap-1">
            <label htmlFor="product-expiration" className="text-sm font-semibold text-surface-700 font-body">
              Fecha de caducidad
            </label>
            <input
              id="product-expiration"
              name="expirationDate"
              type="date"
              value={form.expirationDate ?? ''}
              onChange={handleChange}
              className="border border-surface-300 rounded-lg px-3 py-2 font-body text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label htmlFor="product-notes" className="text-sm font-semibold text-surface-700 font-body">
              Notas
            </label>
            <textarea
              id="product-notes"
              name="notes"
              rows={2}
              value={form.notes}
              onChange={handleChange}
              placeholder="Opcional…"
              className="border border-surface-300 rounded-lg px-3 py-2 font-body text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-surface-300 text-surface-600 font-semibold font-body rounded-lg hover:bg-surface-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="product-modal-save"
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand-600 text-white font-semibold font-body rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Añadir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
