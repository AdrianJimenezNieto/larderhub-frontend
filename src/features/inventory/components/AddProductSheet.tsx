import { useState, useEffect } from 'react';
import type { PantryItem, CreatePantryItemRequest } from '../../../types/pantryItem';
import type { CatalogProduct } from '../../../types/catalogProduct';
import { getCatalogProducts } from '../../catalog/catalogService';
import Sheet from '../../../components/Sheet';

interface Props {
  open: boolean;
  item?: PantryItem | null;
  onSave: (data: CreatePantryItemRequest) => Promise<void>;
  onClose: () => void;
}

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
  </svg>
);
const MinusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const PlusSmIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const AddProductSheet = ({ open, item, onSave, onClose }: Props) => {
  const isEditing = !!item;
  const [step, setStep] = useState<0 | 1>(isEditing ? 1 : 0);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [q, setQ] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [quantity, setQuantity] = useState(item?.quantity ?? 1);
  const [expirationDate, setExpirationDate] = useState(item?.expirationDate ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        if (!isEditing) { setStep(0); setSelectedProduct(null); setQ(''); }
        setError(null);
      }, 300);
    }
  }, [open, isEditing]);

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
      setExpirationDate(item.expirationDate ?? '');
    }
  }, [item]);

  useEffect(() => {
    if (step === 0 && !isEditing) {
      setCatalogLoading(true);
      getCatalogProducts()
        .then(data => setCatalog(data))
        .finally(() => setCatalogLoading(false));
    }
  }, [step, isEditing]);

  const filtered = catalog.filter(p =>
    !q || (p.name ?? '').toLowerCase().includes(q.toLowerCase())
  );

  const handleSave = async () => {
    const pid = isEditing ? item!.productId : selectedProduct?.id;
    if (!pid) { setError('Selecciona un producto.'); return; }
    if (quantity <= 0) { setError('La cantidad debe ser mayor que 0.'); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave({ productId: pid, quantity, expirationDate: expirationDate || null });
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} height={step === 0 ? '75dvh' : '80dvh'}>
      {step === 0 ? (
        <div style={{ padding: '18px 20px 0', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <div className="micro">Añadir rápido · 01</div>
              <div className="h-l" style={{ fontSize: 28, marginTop: 2 }}>
                ¿Qué has <em style={{ fontStyle: 'italic', color: 'var(--accent-ink)' }}>comprado?</em>
              </div>
            </div>
            <span style={{ flex: 1 }} />
            <button className="btn btn-icon btn-soft" onClick={onClose}><CloseIcon /></button>
          </div>

          <div style={{ marginTop: 18, position: 'relative' }}>
            <input
              className="input"
              placeholder="Buscar producto…"
              value={q}
              onChange={e => setQ(e.target.value)}
              style={{ paddingLeft: 44 }}
              autoFocus
            />
            <div style={{ position: 'absolute', left: 16, top: 17, color: 'var(--muted)' }}>
              <SearchIcon />
            </div>
          </div>

          <div className="label" style={{ marginTop: 20, marginBottom: 8 }}>
            {catalogLoading ? 'Cargando…' : 'Catálogo'}
          </div>
          <div className="sheet-scroll" style={{ flex: 1 }}>
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedProduct(p); setStep(1); }}
                style={{
                  width: '100%', padding: '12px 4px', background: 'none', border: 0,
                  borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', textAlign: 'left', color: 'var(--ink)',
                }}
              >
                <div className="placeholder" style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 9 }}>{(p.name ?? '').slice(0, 3).toLowerCase()}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="h-s" style={{ fontSize: 15 }}>{p.name}</div>
                  {p.standardUnit && <div className="body-s" style={{ fontSize: 11 }}>{p.standardUnit}</div>}
                </div>
                <PlusSmIcon />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: '18px 20px 0', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isEditing && (
              <button className="btn btn-icon btn-soft" onClick={() => setStep(0)}><BackIcon /></button>
            )}
            <span style={{ flex: 1 }} />
            <button className="btn btn-icon btn-soft" onClick={onClose}><CloseIcon /></button>
          </div>

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="placeholder" style={{ width: 76, height: 76, borderRadius: 14 }}>
              <span style={{ fontSize: 9 }}>{(isEditing ? item?.productName : selectedProduct?.name)?.slice(0, 4).toLowerCase()}</span>
            </div>
            <div>
              <div className="micro">{isEditing ? item?.standardUnit : selectedProduct?.standardUnit}</div>
              <div className="h-m" style={{ marginTop: 2, fontSize: 20 }}>
                {isEditing ? item?.productName : selectedProduct?.name}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--red-soft)', color: 'var(--red)', borderRadius: 'var(--r-m)', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Quantity stepper */}
          <div style={{ marginTop: 24 }}>
            <div className="label" style={{ marginBottom: 8 }}>Cantidad</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button className="btn btn-icon btn-soft" style={{ width: 56, height: 56 }} onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <MinusIcon />
              </button>
              <div className="mono" style={{ flex: 1, textAlign: 'center', fontSize: 52, fontWeight: 600, letterSpacing: '-0.02em' }}>
                {quantity}
              </div>
              <button className="btn btn-icon btn-accent" style={{ width: 56, height: 56 }} onClick={() => setQuantity(q => q + 1)}>
                <PlusIcon />
              </button>
            </div>
          </div>

          {/* Expiration date */}
          <div style={{ marginTop: 24 }}>
            <div className="label" style={{ marginBottom: 8 }}>Fecha de caducidad <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--muted)', fontSize: 11 }}>(opcional)</span></div>
            <input
              className="input"
              type="date"
              value={expirationDate}
              onChange={e => setExpirationDate(e.target.value)}
            />
          </div>

          <div style={{ flex: 1 }} />
          <div style={{ padding: '16px 0 20px' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Añadir a la despensa'}
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
};

export default AddProductSheet;
