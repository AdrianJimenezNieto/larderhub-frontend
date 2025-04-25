import type { PantryItem } from '../../../types/pantryItem';

interface Props {
  expiredItems: PantryItem[];
  expiringItems: PantryItem[];
  onRemove: (id: number) => void;
  onClose: () => void;
}

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

function getDaysLeft(expirationDate: string | null): number | null {
  if (!expirationDate) return null;
  return Math.ceil((new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const ExpirationAlerts = ({ expiredItems, expiringItems, onRemove, onClose }: Props) => {
  const total = expiredItems.length + expiringItems.length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 30,
      background: 'var(--paper)', color: 'var(--ink)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      animation: 'screenIn .3s cubic-bezier(.2,.8,.2,1)',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>

        <div style={{ padding: '16px 20px' }}>
          <button className="btn btn-icon btn-soft" onClick={onClose}><BackIcon /></button>
        </div>

        <div style={{ padding: '8px 24px' }}>
          <div className="label" style={{ marginBottom: 10 }}>{total} productos a revisar</div>
          <h1 className="h-xl">A punto de<br /><em>irse.</em></h1>
          <p className="body" style={{ marginTop: 14 }}>
            Un vistazo a lo que conviene cocinar esta semana para no tirar comida.
          </p>
        </div>

        {expiredItems.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div className="label" style={{ padding: '0 24px 10px' }}>Caducados · {expiredItems.length}</div>
            <div style={{ padding: '0 20px' }}>
              {expiredItems.map(item => {
                const d = getDaysLeft(item.expirationDate);
                return (
                  <div key={item.id} className="card" style={{ padding: 12, marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center', borderLeft: '3px solid var(--red)' }}>
                    <div className="placeholder" style={{ width: 50, height: 50, borderRadius: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 9 }}>{item.productName?.slice(0, 3).toLowerCase()}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="h-s" style={{ fontSize: 14 }}>{item.productName}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--red)' }}>
                        {d != null ? `Caducó hace ${Math.abs(d)}d` : 'Caducado'}
                      </div>
                    </div>
                    <button className="btn btn-sm btn-soft" onClick={() => onRemove(item.id)}>Eliminar</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {expiringItems.length > 0 && (
          <div style={{ marginTop: 24, paddingBottom: 60 }}>
            <div className="label" style={{ padding: '0 24px 10px' }}>Caducan pronto · {expiringItems.length}</div>
            <div style={{ padding: '0 20px' }}>
              {expiringItems.map(item => {
                const d = getDaysLeft(item.expirationDate);
                return (
                  <div key={item.id} className="card" style={{ padding: 12, marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center', borderLeft: '3px solid var(--amber)' }}>
                    <div className="placeholder" style={{ width: 50, height: 50, borderRadius: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 9 }}>{item.productName?.slice(0, 3).toLowerCase()}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="h-s" style={{ fontSize: 14 }}>{item.productName}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'oklch(45% 0.12 55)' }}>
                        {d === 0 ? 'Caduca hoy' : d != null ? `Caduca en ${d}d` : ''}
                      </div>
                    </div>
                    <button className="btn btn-sm btn-soft" onClick={() => onRemove(item.id)}>Revisar</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpirationAlerts;
