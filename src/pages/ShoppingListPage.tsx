import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useHouseholdStore } from '../store/householdStore';
import useShoppingList from '../features/shoppingList/useShoppingList';
import ShoppingItemCard from '../features/shoppingList/components/ShoppingItemCard';
import AddShoppingItemForm from '../features/shoppingList/components/AddShoppingItemForm';
import ShoppingListSkeleton from '../features/shoppingList/components/ShoppingListSkeleton';
import Toast from '../components/Toast';
import type { CatalogProduct } from '../types/catalogProduct';
import { getCatalogProducts } from '../features/catalog/catalogService';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

const ShoppingListPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const getActiveHousehold = useHouseholdStore((s) => s.getActiveHousehold);
  const activeHousehold = getActiveHousehold();

  const {
    pendingItems,
    checkedItems,
    loading,
    error,
    addItem,
    checkItem,
    deleteItem,
    generateFromPantry,
  } = useShoppingList(activeHouseholdId);

  // Catalog for the "add item" form
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  // UI state
  const [toast, setToast] = useState<ToastState | null>(null);
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [checkedSectionOpen, setCheckedSectionOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [threshold, setThreshold] = useState(1.0);
  const [showThresholdPanel, setShowThresholdPanel] = useState(false);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    getCatalogProducts()
      .then(setCatalog)
      .catch(() => showToast('No se pudo cargar el catálogo de productos.', 'error'))
      .finally(() => setCatalogLoading(false));
  }, [showToast]);

  // Redirect to /households if no active household
  useEffect(() => {
    if (!activeHouseholdId) navigate('/households');
  }, [activeHouseholdId, navigate]);

  const handleAdd = async (productId: number, quantity: number) => {
    await addItem({ productId, quantity });
  };

  const handleCheck = async (itemId: number) => {
    const item = [...pendingItems, ...checkedItems].find((i) => i.id === itemId);
    setCheckingId(itemId);
    try {
      await checkItem(itemId);
      showToast(`✅ ${item?.productName ?? 'Producto'} añadido a tu despensa`, 'success');
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
        showToast('No hay productos con bajo stock para añadir.', 'info');
      } else {
        showToast(
          `${newItems.length} ${newItems.length === 1 ? 'producto añadido' : 'productos añadidos'} a la lista`,
          'success'
        );
      }
    } catch {
      showToast('Error al generar la lista automáticamente.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Navbar */}
      <header className="bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between gap-3">
        <h1 className="text-xl text-brand-600 shrink-0">LarderHub</h1>
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate('/households')}
            className="flex items-center gap-1.5 text-sm font-body border border-surface-200 rounded-lg px-3 py-1.5 hover:bg-surface-100 transition-colors truncate"
            title="Gestionar hogares"
          >
            <span className="text-base">🏠</span>
            <span className="text-surface-700 font-semibold truncate hidden sm:block">
              {activeHousehold?.name ?? 'Sin hogar'}
            </span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-body border border-surface-200 text-surface-600 rounded-lg px-3 py-1.5 hover:bg-surface-100 transition-colors hidden sm:block"
          >
            Despensa
          </button>
          <span className="text-sm text-surface-500 font-body hidden md:block">{user?.name}</span>
          <button
            id="logout-button"
            onClick={logout}
            className="text-sm font-semibold font-body text-surface-500 border border-surface-300 rounded-lg px-3 py-1.5 hover:bg-surface-100 transition-colors shrink-0"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Page header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShoppingCart size={22} className="text-brand-600 shrink-0" />
            <div>
              <h2 className="text-2xl text-surface-900">Lista de la Compra</h2>
              <p className="text-sm text-surface-400 font-body">
                {pendingItems.length} {pendingItems.length === 1 ? 'pendiente' : 'pendientes'}
                {checkedItems.length > 0 && ` · ${checkedItems.length} comprados`}
              </p>
            </div>
          </div>

          {/* Auto-generate button */}
          <div className="relative">
            <button
              id="generate-button"
              onClick={() => setShowThresholdPanel((v) => !v)}
              className="flex items-center gap-1.5 bg-action-500 text-white font-semibold font-body text-sm rounded-lg px-4 py-2 hover:bg-action-600 transition-colors"
            >
              <Sparkles size={15} />
              Auto-generar
            </button>

            {/* Threshold panel */}
            {showThresholdPanel && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-surface-200 rounded-xl shadow-modal p-4 z-20 flex flex-col gap-3">
                <p className="text-sm font-semibold text-surface-700 font-body">
                  Umbral de bajo stock
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="flex-1 accent-action-500"
                    aria-label="Umbral de stock"
                  />
                  <span className="text-sm font-semibold text-surface-900 font-body w-10 text-right">
                    {threshold.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-surface-400 font-body">
                  Se añadirán productos con cantidad ≤ {threshold.toFixed(1)} unidad(es).
                </p>
                <button
                  id="confirm-generate-button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full bg-action-500 text-white font-semibold font-body text-sm rounded-lg py-2 hover:bg-action-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} />
                  {generating ? 'Generando…' : 'Confirmar'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div role="alert" className="text-sm text-alert-600 bg-alert-50 border border-alert-200 rounded-xl px-4 py-3 font-body">
            {error}
          </div>
        )}

        {/* Add item form */}
        <AddShoppingItemForm
          catalog={catalog}
          catalogLoading={catalogLoading}
          onAdd={handleAdd}
        />

        {/* Loading skeleton */}
        {loading && <ShoppingListSkeleton />}

        {/* Empty state */}
        {!loading && !error && pendingItems.length === 0 && checkedItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <ShoppingCart size={56} className="text-surface-200" />
            <div>
              <p className="font-semibold text-surface-500 font-body">Tu lista está vacía</p>
              <p className="text-sm text-surface-400 font-body mt-1">
                Añade productos manualmente o usa el botón <strong>Auto-generar</strong> para detectar bajo stock.
              </p>
            </div>
          </div>
        )}

        {/* Pending items */}
        {!loading && pendingItems.length > 0 && (
          <section aria-label="Productos pendientes">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-surface-400 font-body mb-2">
              Pendientes ({pendingItems.length})
            </h3>
            <ul className="flex flex-col gap-2">
              {pendingItems.map((item) => (
                <ShoppingItemCard
                  key={item.id}
                  item={item}
                  onCheck={handleCheck}
                  onDelete={handleDelete}
                  checkingId={checkingId}
                />
              ))}
            </ul>
          </section>
        )}

        {/* Checked items (collapsible) */}
        {!loading && checkedItems.length > 0 && (
          <section aria-label="Productos comprados">
            <button
              onClick={() => setCheckedSectionOpen((v) => !v)}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-surface-400 font-body mb-2 hover:text-surface-600 transition-colors"
              aria-expanded={checkedSectionOpen}
            >
              {checkedSectionOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Comprados ({checkedItems.length})
            </button>

            {checkedSectionOpen && (
              <ul className="flex flex-col gap-2">
                {checkedItems.map((item) => (
                  <ShoppingItemCard
                    key={item.id}
                    item={item}
                    onCheck={handleCheck}
                    onDelete={handleDelete}
                    checkingId={checkingId}
                  />
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ShoppingListPage;
