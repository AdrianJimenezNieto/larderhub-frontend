import { useState, useEffect } from 'react';
import type { HouseholdMember } from '../../../types/household';
import { getHouseholdMembers } from '../householdService';

interface HouseholdMembersModalProps {
  householdId: number;
  householdName: string;
  onClose: () => void;
}

// Format ISO datetime to DD/MM/YYYY
const formatDate = (str: string) =>
  new Date(str).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

const HouseholdMembersModal = ({ householdId, householdName, onClose }: HouseholdMembersModalProps) => {
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getHouseholdMembers(householdId)
      .then(setMembers)
      .catch(() => setError('No se pudieron cargar los miembros.'))
      .finally(() => setLoading(false));
  }, [householdId]);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-surface-900/50 flex items-center justify-center p-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="members-modal-title"
    >
      <div className="w-full max-w-sm bg-white rounded-xl shadow-modal p-6 flex flex-col gap-5 max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 id="members-modal-title" className="text-xl text-surface-900 font-heading">
              Miembros
            </h2>
            <p className="text-sm text-surface-400 font-body">{householdName}</p>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-700 text-2xl leading-none" aria-label="Cerrar">×</button>
        </div>

        {/* Content */}
        {loading && (
          <p className="text-sm text-surface-400 font-body text-center py-6">Cargando miembros…</p>
        )}
        {error && (
          <div role="alert" className="text-sm text-alert-600 bg-alert-50 border border-alert-200 rounded-lg px-4 py-2 font-body">
            {error}
          </div>
        )}
        {!loading && !error && (
          <ul className="flex flex-col gap-2 overflow-y-auto">
            {members.map((member) => (
              <li key={member.userId} className="flex items-center justify-between gap-3 bg-surface-50 rounded-lg px-4 py-3">
                <div>
                  <p className="font-semibold text-surface-900 font-body text-sm">{member.username}</p>
                  <p className="text-xs text-surface-400 font-body">Desde {formatDate(member.joinedAt)}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${member.role === 'ADMIN'
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-surface-200 text-surface-600'
                  }`}>
                  {member.role === 'ADMIN' ? 'Admin' : 'Miembro'}
                </span>
              </li>
            ))}
          </ul>
        )}

        <button id="members-modal-close" onClick={onClose}
          className="border border-surface-300 text-surface-600 font-semibold font-body rounded-lg hover:bg-surface-100 transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default HouseholdMembersModal;
