import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHouseholdStore } from '../store/householdStore';
import useInventory from '../features/inventory/useInventory';
import ProductRow from '../features/inventory/components/ProductRow';
import AddProductSheet from '../features/inventory/components/AddProductSheet';
import ExpirationAlerts from '../features/inventory/components/ExpirationAlerts';
import type { PantryItem, CreatePantryItemRequest } from '../types/pantryItem';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
  </svg>
);
const BellIcon = ({ stroke }: { stroke?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke ?? 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9a6 6 0 0112 0c0 4 2 6 2 6H4s2-2 2-6zM10 20a2 2 0 004 0"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6"/>
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const activeHouseholdId = useHouseholdStore(s => s.activeHouseholdId);
  const getActiveHousehold = useHouseholdStore(s => s.getActiveHousehold);
  const activeHousehold = getActiveHousehold();

  const { items, expiredItems, expiringItems, loading, error, addItem, editItem, removeItem } =
    useInventory(activeHouseholdId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem_, setEditItem_] = useState<PantryItem | null>(null);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const soonCount = expiringItems.length;
  const expiredCount = expiredItems.length;

  const filtered = items.filter(item => {
    if (query && !item.productName?.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === 'soon') return expiringItems.some(e => e.id === item.id);
    if (filter === 'expired') return expiredItems.some(e => e.id === item.id);
    return true;
  });

  const openAdd = () => { setEditItem_(null); setSheetOpen(true); };
  const openEdit = (item: PantryItem) => { setEditItem_(item); setSheetOpen(true); };

  const handleSave = async (data: CreatePantryItemRequest) => {
    if (editItem_) {
      await editItem(editItem_.id, { quantity: data.quantity, expirationDate: data.expirationDate });
    } else {
      await addItem(data);
    }
  };

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  if (alertsOpen) {
    return (
      <ExpirationAlerts
        expiredItems={expiredItems}
        expiringItems={expiringItems}
        onRemove={async (id) => { await removeItem(id); }}
        onClose={() => setAlertsOpen(false)}
      />
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'none', background: 'var(--paper)', position: 'relative' }}>

      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <button
            onClick={() => navigate('/households')}
            style={{ background: 'none', border: 0, padding: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--ink)' }}
          >
            <span className="h-s" style={{ fontSize: 14 }}>{activeHousehold?.name ?? 'Sin hogar'}</span>
            <ChevronDownIcon />
          </button>
          <span style={{ flex: 1 }} />
          <span className="sync-pulse" />
          <span className="micro" style={{ fontSize: 9 }}>en vivo</span>
        </div>

        <div className="micro" style={{ marginBottom: 6 }}>
          {today} · {items.length} productos
        </div>
        <h1 className="h-xl" style={{ fontSize: 46 }}>Tu <em>despensa</em>.</h1>
      </div>

      {/* No household banner */}
      {!activeHouseholdId && !loading && (
        <div style={{ margin: '20px 20px 0', padding: 16, background: 'var(--amber-soft)', borderRadius: 14, borderLeft: '3px solid var(--amber)' }}>
          <div className="h-s" style={{ fontSize: 14 }}>Sin hogar activo</div>
          <p className="body-s" style={{ marginTop: 4 }}>Crea o únete a un hogar para gestionar tu despensa.</p>
          <button className="btn btn-sm btn-primary" style={{ marginTop: 10 }} onClick={() => navigate('/households')}>
            Ir a Hogares
          </button>
        </div>
      )}

      {/* Expiration alerts banner */}
      {activeHouseholdId && !loading && (soonCount > 0 || expiredCount > 0) && (
        <button
          onClick={() => setAlertsOpen(true)}
          style={{
            margin: '20px 20px 0', padding: 14,
            background: 'var(--amber-soft)',
            border: '1px solid color-mix(in oklch, var(--amber) 20%, transparent)',
            borderRadius: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12, width: 'calc(100% - 40px)',
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BellIcon stroke="var(--amber)" />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div className="h-s" style={{ fontSize: 13 }}>
              {expiredCount > 0 && `${expiredCount} caducado${expiredCount > 1 ? 's' : ''} · `}
              {soonCount > 0 && `${soonCount} caducan pronto`}
            </div>
            <div className="body-s" style={{ fontSize: 11, marginTop: 1 }}>
              Revisa qué conviene cocinar esta semana
            </div>
          </div>
          <ChevronRightIcon />
        </button>
      )}

      {/* Search + filter chips */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            placeholder="Buscar en la despensa…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 44 }}
          />
          <div style={{ position: 'absolute', left: 16, top: 17, color: 'var(--muted)', pointerEvents: 'none' }}>
            <SearchIcon />
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          ['all', `Todos · ${items.length}`],
          ['soon', `Caducan pronto · ${soonCount}`],
          ['expired', `Caducados · ${expiredCount}`],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className="chip"
            style={{
              height: 32, padding: '0 12px', cursor: 'pointer', flexShrink: 0, border: 0,
              background: filter === id ? 'var(--ink)' : 'var(--paper-2)',
              color: filter === id ? 'var(--paper)' : 'var(--ink-2)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div className="body-s">Cargando tu despensa…</div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ padding: '20px', marginTop: 12 }}>
          <div style={{ padding: 14, background: 'var(--red-soft)', borderRadius: 'var(--r-m)', color: 'var(--red)', fontSize: 13 }}>
            {error}
          </div>
        </div>
      )}

      {/* Product list */}
      {!loading && !error && (
        <div style={{ padding: '16px 20px 120px' }}>
          {filtered.map(item => (
            <ProductRow
              key={item.id}
              item={item}
              onEdit={openEdit}
              onDelete={async (id) => { await removeItem(id); }}
            />
          ))}

          {filtered.length === 0 && items.length > 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div className="h-s" style={{ color: 'var(--muted)' }}>Sin resultados</div>
              <div className="body-s" style={{ marginTop: 4 }}>Prueba con otro filtro o búsqueda.</div>
            </div>
          )}

          {activeHouseholdId && items.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="placeholder" style={{ width: 80, height: 80, borderRadius: 16, margin: '0 auto 16px' }}>
                <span>vacío</span>
              </div>
              <div className="h-s">Despensa vacía</div>
              <div className="body-s" style={{ marginTop: 4 }}>Añade tu primer producto con el botón +</div>
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      {activeHouseholdId && (
        <button
          onClick={openAdd}
          style={{
            position: 'fixed', right: 20, bottom: 90, zIndex: 20,
            width: 60, height: 60, borderRadius: 30,
            background: 'var(--ink)', color: 'var(--paper)',
            border: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          }}
        >
          <PlusIcon />
        </button>
      )}

      {/* Add/Edit Sheet */}
      <AddProductSheet
        open={sheetOpen}
        item={editItem_}
        onSave={handleSave}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
