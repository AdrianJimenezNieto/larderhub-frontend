import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useHouseholdStore } from '../store/householdStore';
import { useTheme } from '../lib/useTheme';
import UserAvatar from '../components/UserAvatar';
import {
  isPushSupported,
  getCurrentPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from '../features/push/pushService';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 14A8 8 0 1110 4a7 7 0 0010 10z"/>
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9a6 6 0 0112 0c0 4 2 6 2 6H4s2-2 2-6zM10 20a2 2 0 004 0"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3"/><path d="M3 21a6 6 0 0112 0"/>
    <circle cx="17" cy="7" r="2.5"/><path d="M15 14a5 5 0 018 4"/>
  </svg>
);
const LeafIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 4c-1 10-6 16-16 16 0-10 6-16 16-16zM4 20L14 10"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 01-.1 1.2l2 1.5-2 3.5-2.3-1a7 7 0 01-2 1.2l-.4 2.6h-4l-.4-2.6a7 7 0 01-2-1.2l-2.3 1-2-3.5 2-1.5a7 7 0 010-2.4l-2-1.5 2-3.5 2.3 1a7 7 0 012-1.2l.4-2.6h4l.4 2.6a7 7 0 012 1.2l2.3-1 2 3.5-2 1.5c.1.4.1.8.1 1.2z"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h4l10-10-4-4L4 16v4z"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6"/>
  </svg>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const households = useHouseholdStore(s => s.households);
  const activeId = useHouseholdStore(s => s.activeHouseholdId);
  const activeHousehold = households.find(h => h.id === activeId);
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(true);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    isPushSupported().then(supported => {
      setPushSupported(supported);
      if (supported) {
        getCurrentPushSubscription().then(sub => setPushEnabled(sub !== null));
      }
    });
  }, []);

  const handlePushToggle = async () => {
    if (pushLoading) return;
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
      } else {
        const ok = await subscribeToPush();
        setPushEnabled(ok);
      }
    } catch {
      // permission denied or network error — leave state unchanged
    } finally {
      setPushLoading(false);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const nameParts = user?.name?.split(' ') ?? ['Usuario'];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return (
    <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'none', background: 'var(--paper)' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px 0' }}>
        <div className="label" style={{ marginBottom: 10 }}>Perfil</div>
        <h1 className="h-xl"><em>{firstName}</em>{lastName ? <><br />{lastName}.</> : '.'}</h1>
      </div>

      {/* User card */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--paper-2)', borderRadius: 14 }}>
          <UserAvatar name={user?.name ?? '?'} avatarUrl={user?.avatarUrl} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="h-s" style={{ fontSize: 14 }}>{user?.email ?? ''}</div>
            <div className="body-s" style={{ fontSize: 11 }}>Miembro desde 2026</div>
          </div>
          <button className="btn btn-sm btn-soft"><EditIcon /></button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '28px 24px 10px' }}>
        <div className="label">Estadísticas</div>
      </div>
      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div className="card" style={{ padding: 14 }}>
          <div className="mono" style={{ fontSize: 28, fontWeight: 600 }}>—</div>
          <div className="body-s" style={{ fontSize: 11 }}>Productos gestionados</div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="mono" style={{ fontSize: 28, fontWeight: 600, color: 'var(--accent-ink)' }}>—</div>
          <div className="body-s" style={{ fontSize: 11 }}>Recetas cocinadas</div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="mono" style={{ fontSize: 28, fontWeight: 600 }}>—<span style={{ fontSize: 14 }}>kg</span></div>
          <div className="body-s" style={{ fontSize: 11 }}>Comida salvada este mes</div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="mono" style={{ fontSize: 28, fontWeight: 600 }}>{households.length}</div>
          <div className="body-s" style={{ fontSize: 11 }}>Hogares activos</div>
        </div>
      </div>

      {/* Settings */}
      <div style={{ padding: '28px 24px 10px' }}>
        <div className="label">Ajustes</div>
      </div>
      <div style={{ padding: '0 20px 120px' }}>
        <div className="card" style={{ overflow: 'hidden' }}>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 14,
              background: 'none', border: 0, borderBottom: '1px solid var(--line)',
              cursor: 'pointer', color: 'var(--ink)', textAlign: 'left',
            }}
          >
            {dark ? <MoonIcon /> : <SunIcon />}
            <div style={{ flex: 1 }}>
              <div className="h-s" style={{ fontSize: 14 }}>Apariencia</div>
              <div className="body-s" style={{ fontSize: 11 }}>{dark ? 'Modo oscuro' : 'Modo claro'}</div>
            </div>
            <div style={{
              width: 44, height: 26, borderRadius: 14, padding: 3,
              background: dark ? 'var(--accent)' : 'var(--line-2)',
              position: 'relative', transition: 'background .2s', flexShrink: 0,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                transform: dark ? 'translateX(18px)' : 'translateX(0)', transition: 'transform .2s',
              }} />
            </div>
          </button>

          {/* Notification toggle */}
          <button
            onClick={pushSupported ? handlePushToggle : undefined}
            disabled={pushLoading || !pushSupported}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 14,
              background: 'none', border: 0, borderBottom: '1px solid var(--line)',
              cursor: pushSupported ? 'pointer' : 'default', color: 'var(--ink)', textAlign: 'left',
              opacity: pushLoading ? 0.6 : 1,
            }}
          >
            <BellIcon />
            <div style={{ flex: 1 }}>
              <div className="h-s" style={{ fontSize: 14 }}>Notificaciones</div>
              <div className="body-s" style={{ fontSize: 11 }}>
                {!pushSupported ? 'No disponible en este navegador' : pushEnabled ? 'Activadas' : 'Caducidades, actualizaciones del hogar'}
              </div>
            </div>
            {pushSupported && (
              <div style={{
                width: 44, height: 26, borderRadius: 14, padding: 3,
                background: pushEnabled ? 'var(--accent)' : 'var(--line-2)',
                position: 'relative', transition: 'background .2s', flexShrink: 0,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  transform: pushEnabled ? 'translateX(18px)' : 'translateX(0)', transition: 'transform .2s',
                }} />
              </div>
            )}
          </button>

          {[
            { icon: <UsersIcon />, t: 'Hogares', s: activeHousehold ? `${activeHousehold.name} · ${households.length} total` : 'Sin hogar activo' },
            { icon: <LeafIcon />, t: 'Preferencias', s: 'Dieta, alergias, unidades' },
            { icon: <SettingsIcon />, t: 'Cuenta y seguridad', s: 'Correo, contraseña, datos' },
          ].map((r, i, arr) => (
            <button
              key={i}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 14,
                background: 'none', border: 0,
                borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
                cursor: 'pointer', color: 'var(--ink)', textAlign: 'left',
              }}
            >
              {r.icon}
              <div style={{ flex: 1 }}>
                <div className="h-s" style={{ fontSize: 14 }}>{r.t}</div>
                <div className="body-s" style={{ fontSize: 11 }}>{r.s}</div>
              </div>
              <ChevronRightIcon />
            </button>
          ))}
        </div>

        <button
          className="btn btn-ghost"
          style={{ width: '100%', marginTop: 16, color: 'var(--red)', borderColor: 'var(--red-soft)' }}
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
