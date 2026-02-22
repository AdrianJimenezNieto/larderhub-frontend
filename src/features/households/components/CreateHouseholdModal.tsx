import { useState } from 'react';
import type { CreateHouseholdRequest } from '../../../types/household';

interface CreateHouseholdModalProps {
  onSave: (data: CreateHouseholdRequest) => Promise<void>;
  onClose: () => void;
}

const CreateHouseholdModal = ({ onSave, onClose }: CreateHouseholdModalProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('El nombre es obligatorio.'); return; }
    if (name.length > 50) { setError('El nombre no puede superar los 50 caracteres.'); return; }
    setLoading(true);
    setError(null);
    try {
      await onSave({ name: name.trim() });
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Error al crear el hogar.');
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
      aria-labelledby="create-household-title"
    >
      <div className="w-full max-w-sm bg-white rounded-xl shadow-modal p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 id="create-household-title" className="text-xl text-surface-900 font-heading">
            Crear hogar
          </h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-700 text-2xl leading-none" aria-label="Cerrar">×</button>
        </div>

        {error && (
          <div role="alert" className="text-sm text-alert-600 bg-alert-50 border border-alert-200 rounded-lg px-4 py-2 font-body">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="household-name" className="text-sm font-semibold text-surface-700 font-body">
              Nombre del hogar <span className="text-alert-600">*</span>
            </label>
            <input
              id="household-name"
              type="text"
              maxLength={50}
              required
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              placeholder="Ej: Casa de Adrián"
              className="border border-surface-300 rounded-lg px-3 py-2 font-body text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
            <span className="text-xs text-surface-400 font-body text-right">{name.length}/50</span>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-surface-300 text-surface-600 font-semibold font-body rounded-lg hover:bg-surface-100 transition-colors">
              Cancelar
            </button>
            <button id="create-household-save" type="submit" disabled={loading}
              className="flex-1 bg-brand-600 text-white font-semibold font-body rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors">
              {loading ? 'Creando…' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHouseholdModal;
