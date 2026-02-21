import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import useInventory from '../features/inventory/useInventory';
import ProductCard from '../features/inventory/components/ProductCard';
import ProductModal from '../features/inventory/components/ProductModal';
import type { PantryItem, CreatePantryItemRequest } from '../types/pantryItem';

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { items, loading, error, addItem, editItem, removeItem } = useInventory();

  // Modal state: undefined = closed, null = add mode, PantryItem = edit mode
  const [modalItem, setModalItem] = useState<PantryItem | null | undefined>(undefined);
  const isModalOpen = modalItem !== undefined;

  // Inline error feedback for delete/edit actions
  const [actionError, setActionError] = useState<string | null>(null);

  const openAddModal = () => {
    setModalItem(null);
    setActionError(null);
  };

  const openEditModal = (item: PantryItem) => {
    setModalItem(item);
    setActionError(null);
  };

  const closeModal = () => setModalItem(undefined);

  // Called by ProductModal on save — routes to addItem or editItem
  const handleSave = async (data: CreatePantryItemRequest) => {
    if (modalItem) {
      // Edit mode: only quantity and expirationDate can change
      await editItem(modalItem.id, {
        quantity: data.quantity,
        expirationDate: data.expirationDate,
      });
    } else {
      // Add mode: full CreatePantryItemRequest
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

  const totalItems = items.length;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Top navigation bar */}
      <header className="bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl text-brand-600">LarderHub</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-surface-500 font-body hidden sm:block">
            {user?.name}
          </span>
          <button
            id="logout-button"
            onClick={logout}
            className="text-sm font-semibold font-body text-surface-500 border border-surface-300 rounded-lg px-3 hover:bg-surface-100 transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Page title + action bar */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl text-surface-900">Mi despensa</h2>
            <p className="text-sm text-surface-400 font-body mt-0.5">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu inventario
            </p>
          </div>
          <button
            id="add-item-button"
            onClick={openAddModal}
            className="shrink-0 bg-brand-600 text-white font-semibold font-body rounded-lg px-5 hover:bg-brand-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            Añadir
          </button>
        </div>

        {/* Action error feedback */}
        {actionError && (
          <div role="alert" className="text-sm text-alert-600 bg-alert-50 border border-alert-200 rounded-lg px-4 py-2 font-body">
            {actionError}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-surface-400 font-body">
            Cargando tu despensa…
          </div>
        )}

        {/* Fetch error */}
        {error && !loading && (
          <div role="alert" className="text-center py-16 text-alert-600 font-body">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <span className="text-6xl">🥫</span>
            <p className="text-surface-500 font-body">
              Tu despensa está vacía. ¡Empieza añadiendo un producto del catálogo!
            </p>
            <button
              onClick={openAddModal}
              className="bg-brand-600 text-white font-semibold font-body rounded-lg px-6 hover:bg-brand-700 transition-colors"
            >
              Añadir primer producto
            </button>
          </div>
        )}

        {/* Items grid */}
        {!loading && !error && items.length > 0 && (
          <section
            aria-label="Productos en tu despensa"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {items.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </section>
        )}
      </main>

      {/* Add / Edit modal */}
      {isModalOpen && (
        <ProductModal
          item={modalItem}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default DashboardPage;
