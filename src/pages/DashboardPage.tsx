import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useHouseholdStore } from '../store/householdStore';
import useInventory from '../features/inventory/useInventory';
import ProductCard from '../features/inventory/components/ProductCard';
import ProductModal from '../features/inventory/components/ProductModal';
import type { PantryItem, CreatePantryItemRequest } from '../types/pantryItem';

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Active household from the persistent store
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const getActiveHousehold = useHouseholdStore((s) => s.getActiveHousehold);
  const activeHousehold = getActiveHousehold();

  // Inventory scoped to the active household (null = skip fetching)
  const { items, loading, error, addItem, editItem, removeItem } = useInventory(activeHouseholdId);

  // Modal state: undefined = closed, null = add mode, PantryItem = edit mode
  const [modalItem, setModalItem] = useState<PantryItem | null | undefined>(undefined);
  const isModalOpen = modalItem !== undefined;
  const [actionError, setActionError] = useState<string | null>(null);

  const openAddModal = () => { setModalItem(null); setActionError(null); };
  const openEditModal = (item: PantryItem) => { setModalItem(item); setActionError(null); };
  const closeModal = () => setModalItem(undefined);

  const handleSave = async (data: CreatePantryItemRequest) => {
    if (modalItem) {
      await editItem(modalItem.id, { quantity: data.quantity, expirationDate: data.expirationDate });
    } else {
      await addItem(data);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que quieres eliminar este producto de tu despensa?')) return;
    try {
      await removeItem(id);
    } catch (err: unknown) {
      setActionError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Top navigation bar */}
      <header className="bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between gap-3">
        <h1 className="text-xl text-brand-600 shrink-0">LarderHub</h1>

        <div className="flex items-center gap-2 min-w-0">
          {/* Active household indicator + link to /households */}
          <button
            id="households-nav-button"
            onClick={() => navigate('/households')}
            className="flex items-center gap-1.5 text-sm font-body border border-surface-200 rounded-lg px-3 py-1.5 hover:bg-surface-100 transition-colors min-w-0 truncate"
            title="Gestionar hogares"
          >
            <span className="text-base">🏠</span>
            <span className="text-surface-700 font-semibold truncate hidden sm:block">
              {activeHousehold?.name ?? 'Sin hogar activo'}
            </span>
            {activeHousehold?.myRole === 'ADMIN' && (
              <span className="shrink-0 text-xs bg-brand-100 text-brand-700 font-semibold px-1.5 rounded-full">Admin</span>
            )}
          </button>

          {/* Shopping list link */}
          <button
            id="shopping-list-nav-button"
            onClick={() => navigate('/shopping-list')}
            className="flex items-center gap-1.5 text-sm font-body border border-surface-200 rounded-lg px-3 py-1.5 hover:bg-surface-100 transition-colors shrink-0"
            title="Lista de la compra"
          >
            <span className="text-base">🛒</span>
            <span className="text-surface-700 font-semibold hidden sm:block">Lista</span>
          </button>

          <span className="text-sm text-surface-500 font-body hidden sm:block">{user?.name}</span>
          <button
            id="logout-button"
            onClick={logout}
            className="text-sm font-semibold font-body text-surface-500 border border-surface-300 rounded-lg px-3 hover:bg-surface-100 transition-colors shrink-0"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* === Banner: no active household === */}
        {!activeHouseholdId && (
          <div className="bg-action-50 border border-action-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-action-700 font-body">No tienes ningún hogar seleccionado</p>
              <p className="text-sm text-action-600 font-body mt-0.5">
                Crea un hogar o únete a uno para gestionar tu despensa.
              </p>
            </div>
            <button
              id="go-households-banner"
              onClick={() => navigate('/households')}
              className="shrink-0 bg-action-500 text-white font-semibold font-body rounded-lg px-4 hover:bg-action-600 transition-colors text-sm"
            >
              Ir a Hogares
            </button>
          </div>
        )}

        {/* Page title + action bar */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl text-surface-900">
              {activeHousehold ? activeHousehold.name : 'Mi despensa'}
            </h2>
            <p className="text-sm text-surface-400 font-body mt-0.5">
              {items.length} {items.length === 1 ? 'producto' : 'productos'} en tu inventario
            </p>
          </div>
          <button
            id="add-item-button"
            onClick={openAddModal}
            disabled={!activeHouseholdId}
            className="shrink-0 bg-brand-600 text-white font-semibold font-body rounded-lg px-5 hover:bg-brand-700 disabled:opacity-40 transition-colors flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            Añadir
          </button>
        </div>

        {/* Action error */}
        {actionError && (
          <div role="alert" className="text-sm text-alert-600 bg-alert-50 border border-alert-200 rounded-lg px-4 py-2 font-body">
            {actionError}
          </div>
        )}

        {/* Loading */}
        {activeHouseholdId && loading && (
          <div className="flex items-center justify-center py-16 text-surface-400 font-body">
            Cargando tu despensa…
          </div>
        )}

        {/* Fetch error */}
        {error && !loading && (
          <div role="alert" className="text-center py-16 text-alert-600 font-body">{error}</div>
        )}

        {/* Empty state */}
        {activeHouseholdId && !loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <span className="text-6xl">🥫</span>
            <p className="text-surface-500 font-body">
              Tu despensa está vacía. ¡Empieza añadiendo un producto del catálogo!
            </p>
            <button onClick={openAddModal} className="bg-brand-600 text-white font-semibold font-body rounded-lg px-6 hover:bg-brand-700 transition-colors">
              Añadir primer producto
            </button>
          </div>
        )}

        {/* Items grid */}
        {!loading && !error && items.length > 0 && (
          <section aria-label="Productos en tu despensa" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <ProductCard key={item.id} item={item} onEdit={openEditModal} onDelete={handleDelete} />
            ))}
          </section>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <ProductModal item={modalItem} onSave={handleSave} onClose={closeModal} />
      )}
    </div>
  );
};

export default DashboardPage;
