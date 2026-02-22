import { useState } from 'react';
import type { JoinHouseholdRequest } from '../../../types/household';

interface JoinHouseholdModalProps {
  onSave: (data: JoinHouseholdRequest) => Promise<void>;
  onClose: () => void;
}

const JoinHouseholdModal = ({ onSave, onClose }: JoinHouseholdModalProps) => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Force uppercase, strip non-alphanumeric, max 8 chars
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setJoinCode(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length !== 8) { setError('El código debe tener exactamente 8 caracteres.'); return; }
    setLoading(true);
    setError(null);
    try {
      await onSave({ joinCode });
      onClose();
    } catch (err: unknown) {
      const msg = (err as Error).message ?? '';
      setError(msg || 'Código no válido o ya eres miembro de este hogar.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-surface-900/50 flex items-center justify-center p-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-household-title"
    >
      <div className="w-full max-w-sm bg-white rounded-xl shadow-modal p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 id="join-household-title" className="text-xl text-surface-900 font-heading">
            Unirse a un hogar
          </h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-700 text-2xl leading-none" aria-label="Cerrar">×</button>
        </div>

        <p className="text-sm text-surface-500 font-body">
          Introduce el código de invitación que te ha compartido el administrador del hogar.
        </p>

        {error && (
          <div role="alert" className="text-sm text-alert-600 bg-alert-50 border border-alert-200 rounded-lg px-4 py-2 font-body">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="join-code" className="text-sm font-semibold text-surface-700 font-body">
              Código de invitación <span className="text-alert-600">*</span>
            </label>
            <input
              id="join-code"
              type="text"
              inputMode="text"
              autoComplete="off"
              required
              value={joinCode}
              onChange={handleChange}
              placeholder="XXXXXXXX"
              className="border border-surface-300 rounded-lg px-3 py-2 font-body text-surface-900 text-center tracking-[0.4em] text-lg uppercase focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
            <span className="text-xs text-surface-400 font-body text-center">{joinCode.length}/8 caracteres</span>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-surface-300 text-surface-600 font-semibold font-body rounded-lg hover:bg-surface-100 transition-colors">
              Cancelar
            </button>
            <button id="join-household-save" type="submit" disabled={loading || joinCode.length !== 8}
              className="flex-1 bg-action-500 text-white font-semibold font-body rounded-lg hover:bg-action-600 disabled:opacity-50 transition-colors">
              {loading ? 'Uniéndose…' : 'Unirse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinHouseholdModal;
