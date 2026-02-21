import type { Product } from '../../../types/product';
import { isExpiringSoon, isExpired } from '../useInventory';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

// Format ISO date string to locale date (DD/MM/YYYY)
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES');
};

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const expiringSoon = isExpiringSoon(product.expirationDate);
  const expired = isExpired(product.expirationDate);

  // Dynamic border color based on expiration status
  const borderClass = expired
    ? 'border-alert-600'
    : expiringSoon
      ? 'border-action-500'
      : 'border-surface-200';

  return (
    <article
      className={`bg-white rounded-xl border-2 ${borderClass} p-4 flex flex-col gap-3 shadow-card transition-shadow hover:shadow-modal`}
    >
      {/* Header: name + expiry badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-surface-900 font-semibold font-body leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* Expiry status badge */}
        {expired && (
          <span className="shrink-0 text-xs font-semibold bg-alert-100 text-alert-600 px-2 py-0.5 rounded-full">
            Caducado
          </span>
        )}
        {!expired && expiringSoon && (
          <span className="shrink-0 text-xs font-semibold bg-action-100 text-action-600 px-2 py-0.5 rounded-full">
            Caduca pronto
          </span>
        )}
      </div>

      {/* Product data */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-body">
        <div>
          <dt className="text-surface-400 text-xs uppercase tracking-wide">Cantidad</dt>
          <dd className="text-surface-800 font-semibold">
            {product.quantity} {product.unit}
          </dd>
        </div>
        <div>
          <dt className="text-surface-400 text-xs uppercase tracking-wide">Categoría</dt>
          <dd className="text-surface-800 font-semibold truncate">{product.category || '—'}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-surface-400 text-xs uppercase tracking-wide">Caducidad</dt>
          <dd
            className={`font-semibold ${expired
                ? 'text-alert-600'
                : expiringSoon
                  ? 'text-action-600'
                  : 'text-surface-800'
              }`}
          >
            {formatDate(product.expirationDate)}
          </dd>
        </div>
      </dl>

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-surface-100">
        <button
          id={`edit-product-${product.id}`}
          onClick={() => onEdit(product)}
          className="flex-1 text-sm font-semibold font-body text-action-500 border border-action-500 rounded-lg hover:bg-action-50 transition-colors"
          aria-label={`Editar ${product.name}`}
        >
          Editar
        </button>
        <button
          id={`delete-product-${product.id}`}
          onClick={() => onDelete(product.id)}
          className="flex-1 text-sm font-semibold font-body text-alert-600 border border-alert-600 rounded-lg hover:bg-alert-50 transition-colors"
          aria-label={`Eliminar ${product.name}`}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
