interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: string;
}

const Sheet = ({ open, onClose, children, height }: SheetProps) => {
  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={height ? { height } : undefined}>
        <div className="sheet-handle" />
        {children}
      </div>
    </>
  );
};

export default Sheet;
