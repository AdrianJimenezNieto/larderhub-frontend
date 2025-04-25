import Sheet from '../Sheet';

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
}: ConfirmModalProps) => (
  <Sheet open={isOpen} onClose={onCancel} height="auto">
    <div style={{ padding: '8px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="h-m" style={{ fontSize: 20 }}>{title}</div>
        <p className="body-s" style={{ marginTop: 8, color: 'var(--ink-2)' }}>{message}</p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} className="btn btn-soft" style={{ flex: 1 }}>
          {cancelText}
        </button>
        <button
          onClick={() => { onConfirm(); onCancel(); }}
          className="btn"
          style={{
            flex: 1,
            background: isDestructive ? 'var(--red)' : 'var(--ink)',
            color: 'var(--paper)',
          }}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </Sheet>
);

export default ConfirmModal;
