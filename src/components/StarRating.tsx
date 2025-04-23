import { useState } from 'react';

interface Props {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: number;
}

const Star = ({ filled, size }: { filled: boolean; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'var(--accent)' : 'none'}
    stroke={filled ? 'var(--accent)' : 'var(--line-2)'} strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const StarRating = ({ value, onChange, readOnly, size = 18 }: Props) => {
  const [hover, setHover] = useState(0);
  const interactive = !readOnly && !!onChange;
  const display = interactive && hover > 0 ? hover : value;

  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          style={{ cursor: interactive ? 'pointer' : 'default', lineHeight: 0 }}
          onMouseEnter={interactive ? () => setHover(i) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
          onClick={interactive ? () => onChange(i) : undefined}
        >
          <Star filled={i <= Math.round(display)} size={size} />
        </span>
      ))}
    </span>
  );
};

export default StarRating;
