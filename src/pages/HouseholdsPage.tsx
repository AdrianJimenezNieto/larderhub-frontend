import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHouseholdStore } from '../store/householdStore';
import * as householdService from '../features/households/householdService';
import type { Household, CreateHouseholdRequest, JoinHouseholdRequest } from '../types/household';
import CreateHouseholdModal from '../features/households/components/CreateHouseholdModal';
import JoinHouseholdModal from '../features/households/components/JoinHouseholdModal';
import HouseholdMembersModal from '../features/households/components/HouseholdMembersModal';

type ModalType = 'create' | 'join' | null;

const HouseholdsPage = () => {
  const navigate = useNavigate();
  const { households, activeHouseholdId, setHouseholds, addHousehold, setActiveHousehold } =
    useHouseholdStore();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [membersHousehold, setMembersHousehold] = useState<Household | null>(null);

  // Load all user households on mount
  useEffect(() => {
    householdService
      .getMyHouseholds()
      .then((data) => {
        setHouseholds(data);
        setFetchError(null);
      })
      .catch(() => setFetchError('No se pudieron cargar tus hogares. Inténtalo de nuevo.'))
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

  const handleSelectHousehold = (id: number) => {
    setActiveHousehold(id);
    navigate('/dashboard');
  };

  const formatDate = (str: string) =>
    new Date(str).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl text-brand-600">LarderHub</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm font-semibold font-body text-surface-500 border border-surface-300 rounded-lg px-3 hover:bg-surface-100 transition-colors"
        >
          ← Volver al dashboard
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Title + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl text-surface-900">Mis hogares</h2>
            <p className="text-sm text-surface-400 font-body mt-0.5">
              Grupos colaborativos con despensa compartida
            </p>
          </div>
          <div className="flex gap-2">
            <button
              id="join-household-button"
              onClick={() => setModal('join')}
              className="border border-action-500 text-action-500 font-semibold font-body rounded-lg px-4 hover:bg-action-50 transition-colors text-sm"
            >
              Unirse con código
            </button>
            <button
              id="create-household-button"
              onClick={() => setModal('create')}
              className="bg-brand-600 text-white font-semibold font-body rounded-lg px-4 hover:bg-brand-700 transition-colors text-sm flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span> Crear hogar
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center text-surface-400 font-body py-12">Cargando hogares…</p>
        )}

        {/* Fetch error */}
        {fetchError && !loading && (
          <div role="alert" className="text-sm text-alert-600 bg-alert-50 border border-alert-200 rounded-lg px-4 py-3 font-body">
            {fetchError}
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && households.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <span className="text-6xl">🏠</span>
            <p className="text-surface-500 font-body">
              Todavía no perteneces a ningún hogar. Crea uno nuevo o únete con un código.
            </p>
          </div>
        )}

        {/* Household list */}
        {!loading && !fetchError && households.length > 0 && (
          <ul className="flex flex-col gap-4">
            {households.map((h) => {
              const isActive = h.id === activeHouseholdId;
              return (
                <li
                  key={h.id}
                  className={`bg-white rounded-xl border-2 p-4 flex flex-col gap-3 shadow-card transition-shadow ${isActive ? 'border-brand-600' : 'border-surface-200'
                    }`}
                >
                  {/* Household header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-surface-900 font-body">{h.name}</h3>
                        {isActive && (
                          <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-surface-400 font-body mt-0.5">
                        Creado el {formatDate(h.createdAt)}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${h.myRole === 'ADMIN'
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-surface-200 text-surface-600'
                      }`}>
                      {h.myRole === 'ADMIN' ? 'Admin' : 'Miembro'}
                    </span>
                  </div>

                  {/* Join code */}
                  <div className="flex items-center gap-2 bg-surface-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-surface-400 font-body">Código de invitación:</span>
                    <code className="text-sm font-semibold text-surface-700 tracking-widest select-all">
                      {h.joinCode}
                    </code>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      id={`select-household-${h.id}`}
                      onClick={() => handleSelectHousehold(h.id)}
                      disabled={isActive}
                      className="flex-1 text-sm font-semibold font-body bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-40 transition-colors"
                    >
                      {isActive ? 'Hogar activo' : 'Seleccionar'}
                    </button>
                    <button
                      id={`view-members-${h.id}`}
                      onClick={() => setMembersHousehold(h)}
                      className="flex-1 text-sm font-semibold font-body border border-surface-300 text-surface-600 rounded-lg hover:bg-surface-100 transition-colors"
                    >
                      Ver miembros
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Modals */}
      {modal === 'create' && (
        <CreateHouseholdModal onSave={handleCreate} onClose={() => setModal(null)} />
      )}
      {modal === 'join' && (
        <JoinHouseholdModal onSave={handleJoin} onClose={() => setModal(null)} />
      )}
      {membersHousehold && (
        <HouseholdMembersModal
          householdId={membersHousehold.id}
          householdName={membersHousehold.name}
          onClose={() => setMembersHousehold(null)}
        />
      )}
    </div>
  );
};

export default HouseholdsPage;
