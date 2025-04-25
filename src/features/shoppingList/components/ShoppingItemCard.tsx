import { useState } from 'react';
import type { ShoppingItem } from '../../../types/shoppingItem';

interface Props {
  item: ShoppingItem;
  onCheck: (id: number) => void;
  onDelete: (id: number) => void;
  checkingId: number | null;
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l6 6L20 6"/>
  </svg>
);

const ShoppingItemCard = ({ item, onCheck, onDelete, checkingId }: Props) => {
  const [swipeOpen, setSwipeOpen] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  const isChecking = checkingId === item.id;

  const handleTouchStart = (e: React.TouchEvent) => setStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (dx < -40) setSwipeOpen(true);
    else if (dx > 40) setSwipeOpen(false);
    setStartX(null);
  };

  return (
    <div className="swipe-item" style={{ marginBottom: 8, opacity: item.checked ? 0.5 : 1 }}>
      <div className="swipe-actions">
        <button
          className="swipe-action del"
          onClick={() => { onDelete(item.id); setSwipeOpen(false); }}
        >
          Eliminar
        </button>
      </div>

      <div
        className={`swipe-content${swipeOpen ? ' open' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}
      >
        <button
          id={`check-item-${item.id}`}
          onClick={() => { if (!item.checked) onCheck(item.id); }}
          disabled={isChecking || item.checked}
          style={{
            flexShrink: 0,
            width: 32, height: 32, borderRadius: 16,
            border: item.checked ? '2px solid var(--accent)' : '2px solid var(--line)',
            background: item.checked ? 'var(--accent)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: item.checked ? 'default' : 'pointer',
            color: item.checked ? 'var(--paper)' : 'var(--muted)',
            transition: 'all .2s',
          }}
        >
          {isChecking ? (
            <span style={{ width: 14, height: 14, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', display: 'block', animation: 'spin 0.6s linear infinite' }} />
          ) : item.checked ? (
            <CheckIcon />
          ) : null}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="h-s" style={{
            fontSize: 15, textDecoration: item.checked ? 'line-through' : 'none',
            color: item.checked ? 'var(--muted)' : 'var(--ink)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {item.productName ?? 'Producto'}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            {item.quantity} {item.standardUnit ?? ''}
            {item.productCategory ? ` · ${item.productCategory}` : ''}
          </div>
        </div>

        <button
          id={`delete-shopping-${item.id}`}
          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
          style={{
            flexShrink: 0, width: 32, height: 32,
            background: 'none', border: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', borderRadius: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ShoppingItemCard;
