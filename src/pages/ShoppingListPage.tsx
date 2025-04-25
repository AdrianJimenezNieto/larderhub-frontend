import { useState, useEffect, useCallback } from 'react';
import { useHouseholdStore } from '../store/householdStore';
import useShoppingList from '../features/shoppingList/useShoppingList';
import ShoppingItemCard from '../features/shoppingList/components/ShoppingItemCard';
import AddShoppingItemForm from '../features/shoppingList/components/AddShoppingItemForm';
import Toast from '../components/Toast';
import type { CatalogProduct } from '../types/catalogProduct';
import { getCatalogProducts } from '../features/catalog/catalogService';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z"/>
  </svg>
);

const ShoppingListPage = () => {
  const activeHouseholdId = useHouseholdStore(s => s.activeHouseholdId);

  const { pendingItems, checkedItems, loading, error, addItem, checkItem, deleteItem, generateFromPantry } =
    useShoppingList(activeHouseholdId);

  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'cart'>('pending');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [threshold, setThreshold] = useState(1.0);
  const [showThresholdPanel, setShowThresholdPanel] = useState(false);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    getCatalogProducts()
      .then(setCatalog)
      .catch(() => showToast('No se pudo cargar el catálogo.', 'error'))
      .finally(() => setCatalogLoading(false));
  }, [showToast]);

  const handleAdd = async (productId: number, quantity: number) => {
    await addItem({ productId, quantity });
  };

  const handleCheck = async (itemId: number) => {
    const item = [...pendingItems, ...checkedItems].find(i => i.id === itemId);
    setCheckingId(itemId);
    try {
      await checkItem(itemId);
      showToast(`${item?.productName ?? 'Producto'} añadido a la despensa`, 'success');
    } catch {
      showToast('No se pudo marcar el producto.', 'error');
    } finally {
      setCheckingId(null);
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      await deleteItem(itemId);
    } catch {
      showToast('No se pudo eliminar el producto.', 'error');
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newItems = await generateFromPantry(threshold);
      setShowThresholdPanel(false);
      if (newItems.length === 0) {
        showToast('No hay productos con bajo stock.', 'info');
      } else {
        showToast(`${newItems.length} ${newItems.length === 1 ? 'producto añadido' : 'productos añadidos'}`, 'success');
      }
    } catch {
      showToast('Error al generar la lista automáticamente.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const activeItems = tab === 'pending' ? pendingItems : checkedItems;

  return (
    <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'none', background: 'var(--paper)', position: 'relative' }}>

      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="micro" style={{ marginBottom: 6 }}>
          {pendingItems.length} pendientes · {checkedItems.length} en el carro
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 className="h-xl" style={{ fontSize: 46 }}>Tu <em>compra</em>.</h1>
          <div style={{ position: 'relative' }}>
            <button
              id="generate-button"
              onClick={() => setShowThresholdPanel(v => !v)}
              className="btn btn-soft btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}
            >
              <SparklesIcon />
              Auto
            </button>
            {showThresholdPanel && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', zIndex: 20,
                width: 220, background: 'var(--paper-2)', borderRadius: 'var(--r-l)',
                border: '1px solid var(--line)', padding: 14,
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div className="label">Umbral de bajo stock</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="range" min={0.1} max={5} step={0.1}
                    value={threshold}
                    onChange={e => setThreshold(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--accent)' }}
                  />
                  <span className="mono" style={{ fontSize: 14, fontWeight: 600, width: 32, textAlign: 'right' }}>
                    {threshold.toFixed(1)}
                  </span>
                </div>
                <div className="body-s" style={{ color: 'var(--muted)' }}>
                  Añade productos con cantidad ≤ {threshold.toFixed(1)}
                </div>
                <button
                  id="confirm-generate-button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="btn btn-accent"
                  style={{ width: '100%' }}
                >
                  {generating ? 'Generando…' : 'Confirmar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && !loading && (
        <div style={{ margin: '12px 20px 0', padding: '10px 14px', background: 'var(--red-soft)', borderRadius: 'var(--r-m)', color: 'var(--red)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* No household */}
      {!activeHouseholdId && !loading && (
        <div style={{ margin: '20px 20px 0', padding: 16, background: 'var(--amber-soft)', borderRadius: 14, borderLeft: '3px solid var(--amber)' }}>
          <div className="h-s" style={{ fontSize: 14 }}>Sin hogar activo</div>
          <p className="body-s" style={{ marginTop: 4 }}>Crea o únete a un hogar para gestionar tu lista.</p>
        </div>
      )}

      {/* Add form */}
      {activeHouseholdId && (
        <div style={{ padding: '20px 20px 0' }}>
          <AddShoppingItemForm
            catalog={catalog}
            catalogLoading={catalogLoading}
            onAdd={handleAdd}
          />
        </div>
      )}

      {/* Tabs */}
      <div style={{ padding: '16px 20px 0', display: 'flex', gap: 6 }}>
        {[
          ['pending', `Pendiente · ${pendingItems.length}`],
          ['cart', `En el carro · ${checkedItems.length}`],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id as 'pending' | 'cart')}
            className="chip"
            style={{
              height: 32, padding: '0 12px', cursor: 'pointer', border: 0,
              background: tab === id ? 'var(--ink)' : 'var(--paper-2)',
              color: tab === id ? 'var(--paper)' : 'var(--ink-2)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div className="body-s">Cargando lista…</div>
        </div>
      )}

      {/* List */}
      {!loading && (
        <div style={{ padding: '12px 20px 120px' }}>
          {activeItems.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="placeholder" style={{ width: 80, height: 80, borderRadius: 16, margin: '0 auto 16px' }}>
                <span>{tab === 'pending' ? 'vacío' : 'ok'}</span>
              </div>
              <div className="h-s">{tab === 'pending' ? 'Lista vacía' : 'Nada en el carro'}</div>
              <div className="body-s" style={{ marginTop: 4 }}>
                {tab === 'pending'
                  ? 'Añade productos o usa Auto para detectar bajo stock.'
                  : 'Marca productos como comprados para verlos aquí.'}
              </div>
            </div>
          )}

          {activeItems.map(item => (
            <ShoppingItemCard
              key={item.id}
              item={item}
              onCheck={handleCheck}
              onDelete={handleDelete}
              checkingId={checkingId}
            />
          ))}
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default ShoppingListPage;
