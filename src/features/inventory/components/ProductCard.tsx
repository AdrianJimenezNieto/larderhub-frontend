import type { PantryItem } from '../../../types/pantryItem';
import { isExpiringSoon, isExpired } from '../useInventory';

interface ProductCardProps {
  item: PantryItem;
  onEdit: (item: PantryItem) => void;
  onDelete: (id: number) => void;
}

// Format ISO date string to locale date (DD/MM/YYYY)
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES');
};

const ProductCard = ({ item, onEdit, onDelete }: ProductCardProps) => {
  const expiringSoon = isExpiringSoon(item.expirationDate);
  const expired = isExpired(item.expirationDate);

  // Dynamic border based on expiration status
  const borderClass = expired
    ? 'border-alert-600'
    : expiringSoon
      ? 'border-action-500'
      : 'border-surface-200';

  return (
    <article
      className={`bg-white rounded-xl border-2 ${borderClass} p-4 flex flex-col gap-3 shadow-card transition-shadow hover:shadow-modal`}
    >
      {/* Header: product name + expiry badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-surface-900 font-semibold font-body leading-tight">
            {item.product.name}
          </h3>
          <span className="text-xs text-surface-400 font-body">{item.product.category}</span>
        </div>

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
            {item.quantity} {item.product.unit}
          </dd>
        </div>
        <div>
          <dt className="text-surface-400 text-xs uppercase tracking-wide">Caducidad</dt>
          <dd
            className={`font-semibold ${expired
                ? 'text-alert-600'
                : expiringSoon
                  ? 'text-action-600'
                  : 'text-surface-800'
              }`}
          >
            {formatDate(item.expirationDate)}
          </dd>
        </div>
      </dl>

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-surface-100">
        <button
          id={`edit-item-${item.id}`}
          onClick={() => onEdit(item)}
          className="flex-1 text-sm font-semibold font-body text-action-500 border border-action-500 rounded-lg hover:bg-action-50 transition-colors"
          aria-label={`Editar ${item.product.name}`}
        >
          Editar
        </button>
        <button
          id={`delete-item-${item.id}`}
          onClick={() => onDelete(item.id)}
          className="flex-1 text-sm font-semibold font-body text-alert-600 border border-alert-600 rounded-lg hover:bg-alert-50 transition-colors"
          aria-label={`Eliminar ${item.product.name}`}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
