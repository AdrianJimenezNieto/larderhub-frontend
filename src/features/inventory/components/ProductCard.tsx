import type { PantryItem } from '../../../types/pantryItem';
import { isExpiringSoon, isExpired } from '../useInventory';

interface ProductCardProps {
  item: PantryItem;
  onEdit: (item: PantryItem) => void;
  onDelete: (id: number) => void;
}

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES');
};

const ProductCard = ({ item, onEdit, onDelete }: ProductCardProps) => {
  const expiringSoon = isExpiringSoon(item.expirationDate);
  const expired = isExpired(item.expirationDate);

  const borderClass = expired
    ? 'border-alert-600 shadow-alert-100'
    : expiringSoon
      ? 'border-amber-400 shadow-amber-50'
      : 'border-surface-200';

  return (
    <article className={`bg-white rounded-xl border-2 ${borderClass} p-4 flex flex-col gap-3 shadow-card transition-shadow hover:shadow-modal`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-surface-900 font-semibold font-body leading-tight">
          {item.productName ?? 'Producto sin nombre'}
        </h3>
        {expired && (
          <span className="shrink-0 text-xs font-semibold bg-alert-100 text-alert-700 px-2 py-0.5 rounded-full">Caducado</span>
        )}
        {!expired && expiringSoon && (
          <span className="shrink-0 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Caduca pronto</span>
        )}
      </div>

      {/* Data */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-body">
        <div>
          <dt className="text-surface-400 text-xs uppercase tracking-wide">Cantidad</dt>
          <dd className="text-surface-800 font-semibold">
            {item.quantity} {item.standardUnit ?? ''}
          </dd>
        </div>
        <div>
          <dt className="text-surface-400 text-xs uppercase tracking-wide">Caducidad</dt>
          <dd className={`font-semibold ${expired ? 'text-alert-600' : expiringSoon ? 'text-amber-600' : 'text-surface-800'}`}>
            {formatDate(item.expirationDate)}
          </dd>
        </div>
      </dl>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-surface-100">
        <button
          id={`edit-item-${item.id}`}
          onClick={() => onEdit(item)}
          className="flex-1 text-sm font-semibold font-body text-action-500 border border-action-500 rounded-lg hover:bg-action-50 transition-colors"
          aria-label={`Editar ${item.productName}`}
        >
          Editar
        </button>
        <button
          id={`delete-item-${item.id}`}
          onClick={() => onDelete(item.id)}
          className="flex-1 text-sm font-semibold font-body text-alert-600 border border-alert-600 rounded-lg hover:bg-alert-50 transition-colors"
          aria-label={`Eliminar ${item.productName}`}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
