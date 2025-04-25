import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l6 6L20 6"/>
  </svg>
);

const Toast = ({ message, type = 'info', duration = 3500, onClose }: ToastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, duration);
    return () => clearTimeout(id);
  }, [duration, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="toast"
      style={{
        transition: 'opacity .3s, transform .3s',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
      }}
    >
      {type === 'success' ? <CheckIcon /> : <span className="pulse" />}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        style={{
          background: 'none', border: 0, color: 'inherit', opacity: 0.6,
          cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0, minWidth: 0, minHeight: 0,
        }}
      >×</button>
    </div>
  );
};

export default Toast;
