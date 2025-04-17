import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHouseholdStore } from '../store/householdStore';
import * as householdService from '../features/households/householdService';
import type { Household, CreateHouseholdRequest, JoinHouseholdRequest } from '../types/household';
import CreateHouseholdModal from '../features/households/components/CreateHouseholdModal';
import JoinHouseholdModal from '../features/households/components/JoinHouseholdModal';
import HouseholdMembersModal from '../features/households/components/HouseholdMembersModal';
import ConfirmModal from '../components/ui/ConfirmModal';

type ModalType = 'create' | 'join' | null;

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l6 6L20 6"/>
  </svg>
);

const HouseholdsPage = () => {
  const navigate = useNavigate();
  const { households, activeHouseholdId, setHouseholds, addHousehold, setActiveHousehold, removeHousehold } = useHouseholdStore();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [membersHousehold, setMembersHousehold] = useState<Household | null>(null);
  const [dissolveTarget, setDissolveTarget] = useState<Household | null>(null);
  const [dissolving, setDissolving] = useState(false);

  useEffect(() => {
    householdService.getMyHouseholds()
      .then(data => { setHouseholds(data); setFetchError(null); })
      .catch(() => setFetchError('No se pudieron cargar tus hogares.'))
      .finally(() => setLoading(false));
  }, [setHouseholds]);

  const handleCreate = async (data: CreateHouseholdRequest) => {
    const created = await householdService.createHousehold(data);
    addHousehold(created);
    setActiveHousehold(created.id);
  };

  const handleJoin = async (data: JoinHouseholdRequest) => {
    const joined = await householdService.joinHousehold(data);
    addHousehold(joined);
    setActiveHousehold(joined.id);
  };

  const handleSelect = (id: number) => {
    setActiveHousehold(id);
    navigate('/dashboard');
  };

  const handleDissolve = async (householdId: number) => {
    setDissolving(true);
    try {
      await householdService.deleteHousehold(householdId);
      removeHousehold(householdId);
      if (activeHouseholdId === householdId) navigate('/households');
    } catch {
      // error is visible via the fetchError or a future toast; store is untouched
    } finally {
      setDissolving(false);
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'none', background: 'var(--paper)' }}>

      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="micro" style={{ marginBottom: 6 }}>
          {households.length} {households.length === 1 ? 'hogar' : 'hogares'}
        </div>
        <h1 className="h-xl" style={{ fontSize: 46 }}>Tus <em>hogares</em>.</h1>
      </div>

      {/* Error */}
      {fetchError && !loading && (
        <div style={{ margin: '16px 20px 0', padding: '10px 14px', background: 'var(--red-soft)', borderRadius: 'var(--r-m)', color: 'var(--red)', fontSize: 13 }}>
          {fetchError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div className="body-s">Cargando hogares…</div>
        </div>
      )}

      {/* Household list */}
      {!loading && (
        <div style={{ padding: '20px 20px 0' }}>
          {households.map(h => {
            const isActive = h.id === activeHouseholdId;
            return (
              <div
                key={h.id}
                className="card"
                style={{
                  marginBottom: 12, padding: 16,
                  borderLeft: isActive ? '3px solid var(--accent)' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="h-s" style={{ fontSize: 16 }}>{h.name}</div>
                      {isActive && (
                        <span className="chip chip-fresh" style={{ height: 20, padding: '0 8px', fontSize: 10 }}>
                          <span className="dot" style={{ width: 5, height: 5 }} />
                          Activo
                        </span>
                      )}
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      {h.myRole === 'ADMIN' ? 'Admin' : 'Miembro'}
                    </div>
                  </div>
                </div>

                {/* Join code */}
                <div style={{
                  background: 'var(--paper-2)', borderRadius: 'var(--r-m)',
                  padding: '8px 12px', marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span className="micro">Código de invitación</span>
                  <span className="mono" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.1em', flex: 1, userSelect: 'all' }}>
                    {h.joinCode}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    id={`select-household-${h.id}`}
                    onClick={() => handleSelect(h.id)}
                    disabled={isActive}
                    className="btn btn-sm"
                    style={{
                      flex: 1,
                      background: isActive ? 'var(--accent)' : 'var(--ink)',
                      color: 'var(--paper)',
                      opacity: isActive ? 0.7 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    {isActive ? <><CheckIcon /> Activo</> : 'Seleccionar'}
                  </button>
                  <button
                    id={`view-members-${h.id}`}
                    onClick={() => setMembersHousehold(h)}
                    className="btn btn-sm btn-soft"
                    style={{ flex: 1 }}
                  >
                    Miembros
                  </button>
                  {h.myRole === 'ADMIN' && (
                    <button
                      id={`dissolve-household-${h.id}`}
                      onClick={() => setDissolveTarget(h)}
                      disabled={dissolving}
                      className="btn btn-sm btn-ghost"
                      style={{ color: 'var(--red)', borderColor: 'var(--red)', opacity: 0.8 }}
                    >
                      Disolver
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {!loading && !fetchError && households.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div className="placeholder" style={{ width: 80, height: 80, borderRadius: 16, margin: '0 auto 16px' }}>
                <span>hogar</span>
              </div>
              <div className="h-s">Sin hogares</div>
              <div className="body-s" style={{ marginTop: 4 }}>Crea uno nuevo o únete con un código de invitación.</div>
            </div>
          )}

          {/* Create / Join cards */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 120 }}>
            <button
              id="create-household-button"
              onClick={() => setModal('create')}
              style={{
                flex: 1, padding: 16, borderRadius: 'var(--r-l)',
                border: '1.5px dashed var(--line)', background: 'none',
                cursor: 'pointer', textAlign: 'left', color: 'var(--ink)',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}
            >
              <div className="h-s" style={{ fontSize: 15 }}>+ Crear hogar</div>
              <div className="body-s" style={{ color: 'var(--muted)' }}>Nuevo grupo compartido</div>
            </button>
            <button
              id="join-household-button"
              onClick={() => setModal('join')}
              style={{
                flex: 1, padding: 16, borderRadius: 'var(--r-l)',
                border: '1.5px dashed var(--line)', background: 'none',
                cursor: 'pointer', textAlign: 'left', color: 'var(--ink)',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}
            >
              <div className="h-s" style={{ fontSize: 15 }}>Unirse</div>
              <div className="body-s" style={{ color: 'var(--muted)' }}>Con código de invitación</div>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modal === 'create' && <CreateHouseholdModal onSave={handleCreate} onClose={() => setModal(null)} />}
      {modal === 'join' && <JoinHouseholdModal onSave={handleJoin} onClose={() => setModal(null)} />}
      {membersHousehold && (
        <HouseholdMembersModal
          householdId={membersHousehold.id}
          householdName={membersHousehold.name}
          myRole={membersHousehold.myRole}
          onClose={() => setMembersHousehold(null)}
        />
      )}
      <ConfirmModal
        isOpen={!!dissolveTarget}
        title="Disolver hogar"
        message={`¿Seguro que quieres disolver "${dissolveTarget?.name}"? Se eliminarán todos los miembros, el inventario y la lista de la compra. Esta acción no se puede deshacer.`}
        confirmText="Disolver"
        cancelText="Cancelar"
        isDestructive
        onConfirm={() => dissolveTarget && handleDissolve(dissolveTarget.id)}
        onCancel={() => setDissolveTarget(null)}
      />
    </div>
  );
};

export default HouseholdsPage;
