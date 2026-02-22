import { AlertTriangle, Clock, Trash2 } from 'lucide-react';
import type { PantryItem } from '../../../types/pantryItem';

interface ExpirationAlertsProps {
  expiredItems: PantryItem[];
  expiringItems: PantryItem[];
  onRemove: (itemId: number) => void;
}

const ExpirationAlerts = ({ expiredItems, expiringItems, onRemove }: ExpirationAlertsProps) => {
  if (expiredItems.length === 0 && expiringItems.length === 0) {
    return null;
  }

  // Helper local formator
  const getDaysDiff = (dateStr: string | null) => {
    if (!dateStr) return 0;
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Expired Section */}
      {expiredItems.length > 0 && (
        <section className="bg-alert-50 border border-alert-200 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-alert-700 font-heading">
            <AlertTriangle className="shrink-0" size={20} />
            <h3 className="font-semibold text-lg leading-none">Productos Caducados</h3>
            <span className="bg-alert-200 text-alert-800 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
              {expiredItems.length}
            </span>
          </div>

          <ul className="flex flex-col gap-2 mt-1">
            {expiredItems.map(item => (
              <li key={item.id} className="bg-white border border-alert-100 rounded-lg p-3 flex items-center justify-between gap-3 shadow-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-surface-900 font-body text-sm truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-alert-600 font-body font-semibold truncate">
                    Caducó hace {Math.abs(getDaysDiff(item.expirationDate))} días
                  </p>
                </div>
                {/* Trash button directly here for quick cleanup */}
                <button
                  onClick={() => onRemove(item.id)}
                  className="shrink-0 p-1.5 text-surface-400 hover:text-alert-600 hover:bg-alert-50 rounded-md transition-colors"
                  aria-label="Tirar producto"
                  title="Eliminar de la despensa"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Expiring Soon Section */}
      {expiringItems.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-700 font-heading">
            <Clock className="shrink-0" size={20} />
            <h3 className="font-semibold text-lg leading-none">Próximos a Caducar</h3>
            <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
              {expiringItems.length}
            </span>
          </div>

          <ul className="flex flex-col gap-2 mt-1">
            {expiringItems.map(item => {
              const daysLeft = getDaysDiff(item.expirationDate);
              return (
                <li key={item.id} className="bg-white border border-amber-100 rounded-lg p-3 flex items-center justify-between gap-3 shadow-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-surface-900 font-body text-sm truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-amber-600 font-body font-semibold truncate">
                      {daysLeft === 0 ? 'Caduca HASTA HOY' : `Caduca en ${daysLeft} días`}
                    </p>
                  </div>
                  {/* Action to use it or throw it */}
                  <button
                    onClick={() => onRemove(item.id)}
                    className="shrink-0 p-1.5 text-surface-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    aria-label="Consumido / Tirar"
                    title="Marcar como consumido"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ExpirationAlerts;
