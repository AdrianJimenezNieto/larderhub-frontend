import { useState, useRef } from 'react';
import { Trash2, UserPlus, Search, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import useMemberManagement from '../useMemberManagement';
import type { HouseholdRole } from '../../../types/household';

interface HouseholdMembersModalProps {
  householdId: number;
  householdName: string;
  myRole: HouseholdRole;
  onClose: () => void;
}

// Avatar with initials
const Avatar = ({ username }: { username: string }) => {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
      <span className="text-white font-semibold text-xs font-body">{initials}</span>
    </div>
  );
};

// Format ISO datetime to DD/MM/YYYY
const formatDate = (str: string) =>
  new Date(str).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

const RoleBadge = ({ role }: { role: HouseholdRole }) => (
  <span
    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${role === 'ADMIN' ? 'bg-brand-100 text-brand-700' : 'bg-surface-200 text-surface-600'
      }`}
  >
    {role === 'ADMIN' ? 'Admin' : 'Miembro'}
  </span>
);

const HouseholdMembersModal = ({
  householdId,
  householdName,
  myRole,
  onClose,
}: HouseholdMembersModalProps) => {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isAdmin = myRole === 'ADMIN';

  const {
    members,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    searchError,
    triggerSearch,
    inviteMember,
    removeMember,
  } = useMemberManagement(householdId);

  // Invite state
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Remove confirm state
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleInvite = async (username: string) => {
    setInviting(true);
    setInviteError(null);
    try {
      await inviteMember(username);
      setInviteSuccess(`✅ ${username} añadido al household`);
      setTimeout(() => setInviteSuccess(null), 3500);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) setInviteError('No tienes permisos de administrador.');
      else if (status === 400) setInviteError('El usuario ya es miembro o no existe.');
      else setInviteError('Error al añadir el miembro.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: number) => {
    setRemovingId(memberId);
    setConfirmRemoveId(null);
    try {
      await removeMember(memberId);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      console.error('Remove member error', status);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-surface-900/50 flex items-center justify-center p-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="members-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-modal flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between shrink-0">
          <div>
            <h2 id="members-modal-title" className="text-xl text-surface-900 font-heading">
              Miembros
            </h2>
            <p className="text-sm text-surface-400 font-body">{householdName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-700 text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex flex-col gap-4 p-6">

          {/* === Search & Invite — only ADMIN === */}
          {isAdmin && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-surface-700 font-body flex items-center gap-1.5">
                <UserPlus size={15} className="text-brand-600" />
                Añadir miembro
              </h3>

              {/* Search input */}
              <div className="flex gap-2">
                <input
                  ref={searchInputRef}
                  id="member-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setInviteError(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && triggerSearch()}
                  placeholder="Username o email…"
                  className="flex-1 border border-surface-300 rounded-lg px-3 py-2 text-sm font-body text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
                <button
                  id="member-search-button"
                  onClick={triggerSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="shrink-0 flex items-center gap-1 bg-surface-100 border border-surface-300 text-surface-700 font-semibold font-body text-sm rounded-lg px-3 hover:bg-surface-200 disabled:opacity-50 transition-colors"
                >
                  {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Buscar
                </button>
              </div>

              {/* Search error */}
              {searchError && (
                <p className="text-xs text-alert-600 font-body">{searchError}</p>
              )}

              {/* Search results list (may be multiple) */}
              {searchResults.length > 0 && !searchError && (
                <ul className="flex flex-col gap-2">
                  {searchResults.map((result) => (
                    <li key={result.id} className="flex items-center gap-3 bg-surface-50 rounded-lg px-4 py-3 border border-surface-200">
                      <Avatar username={result.username} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-surface-900 font-body text-sm truncate">
                          {result.username}
                        </p>
                        <p className="text-xs text-surface-400 font-body truncate">{result.email}</p>
                      </div>
                      {result.alreadyMember ? (
                        <span className="shrink-0 text-xs font-semibold bg-surface-200 text-surface-500 px-2 py-0.5 rounded-full">
                          Ya es miembro
                        </span>
                      ) : (
                        <button
                          id={`invite-member-${result.id}`}
                          onClick={() => handleInvite(result.username)}
                          disabled={inviting}
                          className="shrink-0 bg-action-500 text-white font-semibold font-body text-xs rounded-lg px-3 py-1.5 hover:bg-action-600 disabled:opacity-50 transition-colors"
                        >
                          {inviting ? 'Añadiendo…' : 'Añadir'}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* Invite error / success */}
              {inviteError && <p className="text-xs text-alert-600 font-body">{inviteError}</p>}
              {inviteSuccess && <p className="text-xs text-brand-600 font-body font-semibold">{inviteSuccess}</p>}

              <hr className="border-surface-100" />
            </section>
          )}

          {/* === Members list === */}
          <section>
            <h3 className="text-sm font-semibold text-surface-700 font-body mb-3">
              {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
            </h3>

            {/* Loading skeleton */}
            {loading && (
              <ul className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-3 animate-pulse px-1 py-2">
                    <div className="w-9 h-9 rounded-full bg-surface-200" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-3 bg-surface-200 rounded w-1/3" />
                      <div className="h-2 bg-surface-100 rounded w-1/4" />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {error && !loading && (
              <div role="alert" className="text-sm text-alert-600 bg-alert-50 border border-alert-200 rounded-lg px-4 py-2 font-body">
                {error}
              </div>
            )}

            {!loading && !error && (
              <ul className="flex flex-col gap-2">
                {members.map((member) => {
                  const isSelf = member.userId === currentUserId;
                  const isConfirming = confirmRemoveId === member.userId;
                  const isRemoving = removingId === member.userId;

                  return (
                    <li
                      key={member.userId}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-50 transition-colors"
                    >
                      <Avatar username={member.username} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-surface-900 font-body text-sm truncate">
                            {member.username}
                          </p>
                          {isSelf && (
                            <span className="shrink-0 text-xs text-surface-400 font-body">(tú)</span>
                          )}
                        </div>
                        <p className="text-xs text-surface-400 font-body">
                          Desde {formatDate(member.joinedAt)}
                        </p>
                      </div>

                      <RoleBadge role={member.role} />

                      {/* Remove button — only ADMIN, only on other members */}
                      {isAdmin && !isSelf && (
                        isConfirming ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              id={`confirm-remove-${member.userId}`}
                              onClick={() => handleRemove(member.userId)}
                              disabled={isRemoving}
                              className="text-xs font-semibold font-body bg-alert-600 text-white rounded-lg px-2.5 py-1 hover:bg-alert-700 disabled:opacity-50 transition-colors"
                            >
                              {isRemoving ? '…' : 'Confirmar'}
                            </button>
                            <button
                              onClick={() => setConfirmRemoveId(null)}
                              className="text-xs font-semibold font-body border border-surface-300 text-surface-600 rounded-lg px-2.5 py-1 hover:bg-surface-100 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`remove-member-${member.userId}`}
                            onClick={() => setConfirmRemoveId(member.userId)}
                            disabled={isRemoving}
                            className="shrink-0 w-8 h-8 flex items-center justify-center text-surface-300 hover:text-alert-600 hover:bg-alert-50 rounded-lg transition-colors"
                            aria-label={`Expulsar a ${member.username}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        )
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-100 shrink-0">
          <button
            id="members-modal-close"
            onClick={onClose}
            className="w-full border border-surface-300 text-surface-600 font-semibold font-body rounded-lg py-2 hover:bg-surface-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HouseholdMembersModal;
