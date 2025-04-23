import { useState } from 'react';
import type { PantryItem } from '../../../types/pantryItem';

interface Props {
  item: PantryItem;
  onEdit: (item: PantryItem) => void;
  onDelete: (id: number) => void;
  flash?: boolean;
}


function getDaysLeft(expirationDate: string | null): number | null {
  if (!expirationDate) return null;
  return Math.ceil((new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getFreshness(daysLeft: number | null): { label: string; kind: 'fresh' | 'soon' | 'expired' | 'none' } {
  if (daysLeft == null) return { label: 'Sin fecha', kind: 'none' };
  if (daysLeft < 0) return { label: 'Caducado', kind: 'expired' };
  if (daysLeft === 0) return { label: 'Caduca hoy', kind: 'soon' };
  if (daysLeft <= 3) return { label: `Caduca en ${daysLeft}d`, kind: 'soon' };
  return { label: `Fresco · ${daysLeft}d`, kind: 'fresh' };
}

const ProductRow = ({ item, onEdit, onDelete, flash }: Props) => {
  const [swipeOpen, setSwipeOpen] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);

  const daysLeft = getDaysLeft(item.expirationDate);
  const { label: freshnessLabel, kind } = getFreshness(daysLeft);

  const handleTouchStart = (e: React.TouchEvent) => setStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (dx < -40) setSwipeOpen(true);
    else if (dx > 40) setSwipeOpen(false);
    setStartX(null);
  };

  const chipClass = kind === 'fresh' ? 'chip chip-fresh'
    : kind === 'soon' ? 'chip chip-soon'
    : kind === 'expired' ? 'chip chip-expired'
    : 'chip';

  return (
    <div className={`swipe-item${flash ? ' flash' : ''}`} style={{ marginBottom: 8 }}>
      <div className="swipe-actions">
        <button className="swipe-action edit" onClick={() => { setSwipeOpen(false); onEdit(item); }}>Editar</button>
        <button className="swipe-action del" onClick={() => { onDelete(item.id); setSwipeOpen(false); }}>Eliminar</button>
      </div>

      <div
        className={`swipe-content${swipeOpen ? ' open' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => { if (swipeOpen) setSwipeOpen(false); else onEdit(item); }}
        style={{ display: 'flex', flexDirection: 'column', padding: 14, gap: 10 }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Product image placeholder */}
          <div className="placeholder" style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 9 }}>{item.productName?.slice(0, 4).toLowerCase()}</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="h-s" style={{
              fontSize: 15, lineHeight: 1.2,
              textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
            }}>
              {item.productName ?? 'Producto'}
            </div>
            {item.standardUnit && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{item.standardUnit}</span>
              </div>
            )}
          </div>

          {/* Qty display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div
              className="mono"
              style={{ minWidth: 28, textAlign: 'center', fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}
              onClick={e => e.stopPropagation()}
            >
              {item.quantity}
            </div>
          </div>
        </div>

        {/* Bottom row: freshness chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={chipClass} style={{ height: 22, padding: '0 9px', fontSize: 10, flexShrink: 0 }}>
            <span className="dot" style={{ width: 5, height: 5 }} />
            {freshnessLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductRow;
