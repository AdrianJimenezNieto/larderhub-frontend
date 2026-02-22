import { Check, Trash2 } from 'lucide-react';
import type { ShoppingItem } from '../../../types/shoppingItem';

interface ShoppingItemCardProps {
  item: ShoppingItem;
  onCheck: (id: number) => void;
  onDelete: (id: number) => void;
  checkingId: number | null;
}

// Format ISO 8601 date to relative or short string
const formatDate = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

const ShoppingItemCard = ({ item, onCheck, onDelete, checkingId }: ShoppingItemCardProps) => {
  const isChecking = checkingId === item.id;

  return (
    <li
      className={`flex items-center gap-3 bg-white rounded-xl border border-surface-200 px-4 py-3 shadow-card transition-all duration-300 ${item.checked ? 'opacity-50' : 'opacity-100'
        }`}
    >
      {/* Check button */}
      {!item.checked && (
        <button
          id={`check-item-${item.id}`}
          onClick={() => onCheck(item.id)}
          disabled={isChecking}
          className="shrink-0 w-8 h-8 rounded-full border-2 border-brand-500 flex items-center justify-center hover:bg-brand-50 disabled:opacity-40 transition-colors"
          aria-label={`Marcar ${item.productName} como comprado`}
        >
          {isChecking ? (
            <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check size={14} className="text-brand-600" />
          )}
        </button>
      )}

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold font-body text-sm text-surface-900 truncate ${item.checked ? 'line-through text-surface-400' : ''}`}>
          {item.productName ?? 'Producto'}
        </p>
        <p className="text-xs text-surface-400 font-body">
          {item.quantity} {item.standardUnit ?? ''} · {item.productCategory ?? ''} · {formatDate(item.addedAt)}
        </p>
      </div>

      {/* Delete button */}
      <button
        id={`delete-shopping-${item.id}`}
        onClick={() => onDelete(item.id)}
        className="shrink-0 w-8 h-8 flex items-center justify-center text-surface-300 hover:text-alert-600 hover:bg-alert-50 rounded-lg transition-colors"
        aria-label={`Eliminar ${item.productName}`}
      >
        <Trash2 size={15} />
      </button>
    </li>
  );
};

export default ShoppingItemCard;
