import { useState } from 'react';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}

const UserAvatar = ({ name, avatarUrl, size = 36 }: UserAvatarProps) => {
  const [imgError, setImgError] = useState(false);
  const initials = name.slice(0, 2).toUpperCase();

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: 'var(--accent)',
        color: '#0c1e10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--sans)',
        fontSize: Math.round(size * 0.35),
        fontWeight: 700,
      }}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
