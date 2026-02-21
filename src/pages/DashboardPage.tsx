import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import useInventory from '../features/inventory/useInventory';
import ProductCard from '../features/inventory/components/ProductCard';
import ProductModal from '../features/inventory/components/ProductModal';
import type { Product, CreateProductRequest } from '../types/product';

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { products, loading, error, addProduct, editProduct, removeProduct } = useInventory();

  // Modal state: null = closed, undefined = add mode, Product = edit mode
  const [modalProduct, setModalProduct] = useState<Product | null | undefined>(undefined);
  const isModalOpen = modalProduct !== undefined;

  // Inline action error feedback (shows below header)
  const [actionError, setActionError] = useState<string | null>(null);

  const openAddModal = () => {
    setModalProduct(null);
    setActionError(null);
  };

  const openEditModal = (product: Product) => {
    setModalProduct(product);
    setActionError(null);
  };

  const closeModal = () => setModalProduct(undefined);

  // Called by ProductModal on save (handles both create and update)
  const handleSave = async (data: CreateProductRequest) => {
    if (modalProduct) {
      // Edit mode
      await editProduct(modalProduct.id, data);
    } else {
      // Add mode
      await addProduct(data);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;
    try {
      await removeProduct(id);
    } catch (err: unknown) {
      setActionError((err as Error).message);
    }
  };

  // Derived stats
  const totalProducts = products.length;

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
            <h2 className="text-2xl text-surface-900">Mi inventario</h2>
            <p className="text-sm text-surface-400 font-body mt-0.5">
              {totalProducts} {totalProducts === 1 ? 'producto' : 'productos'} en tu despensa
            </p>
          </div>
          <button
            id="add-product-button"
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
            Cargando inventario…
          </div>
        )}

        {/* Fetch error */}
        {error && !loading && (
          <div role="alert" className="text-center py-16 text-alert-600 font-body">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <span className="text-6xl">🥫</span>
            <p className="text-surface-500 font-body">
              Tu despensa está vacía. ¡Empieza añadiendo un producto!
            </p>
            <button
              onClick={openAddModal}
              className="bg-brand-600 text-white font-semibold font-body rounded-lg px-6 hover:bg-brand-700 transition-colors"
            >
              Añadir primer producto
            </button>
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && products.length > 0 && (
          <section
            aria-label="Lista de productos"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
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
          product={modalProduct}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default DashboardPage;
