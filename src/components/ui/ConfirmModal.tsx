import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 p-2 rounded-full ${isDestructive ? 'bg-alert-100 text-alert-600' : 'bg-brand-100 text-brand-600'}`}>
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1 mt-1">
              <h2 id="confirm-modal-title" className="text-lg font-semibold text-surface-900 leading-none">
                {title}
              </h2>
              <p id="confirm-modal-desc" className="text-sm text-surface-500 font-body mt-2">
                {message}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="shrink-0 text-surface-400 hover:text-surface-600 transition-colors p-1"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold font-body text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`px-4 py-2 text-sm font-semibold font-body text-white rounded-lg transition-colors ${isDestructive
                  ? 'bg-alert-600 hover:bg-alert-700'
                  : 'bg-brand-600 hover:bg-brand-700'
                }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
