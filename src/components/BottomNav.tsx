import { NavLink, useLocation } from 'react-router-dom';

const PantryIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2"/>
    <path d="M4 9h16M4 15h16M10 3v18M10 6h.01M10 12h.01M10 18h.01"/>
  </svg>
);
const CartIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>
    <path d="M3 3h2l2.5 12h11l2-8H6"/>
  </svg>
);
const BookIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h10a4 4 0 014 4v12H8a4 4 0 01-4-4V4zM4 17a3 3 0 013-3h11"/>
  </svg>
);
const UsersIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3"/><path d="M3 21a6 6 0 0112 0"/>
    <circle cx="17" cy="7" r="2.5"/><path d="M15 14a5 5 0 018 4"/>
  </svg>
);
const UserIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>
  </svg>
);

const tabs = [
  { to: '/dashboard',     label: 'Despensa', Icon: PantryIcon },
  { to: '/shopping-list', label: 'Compra',   Icon: CartIcon   },
  { to: '/recipes',       label: 'Recetas',  Icon: BookIcon   },
  { to: '/households',    label: 'Hogar',    Icon: UsersIcon  },
  { to: '/profile',       label: 'Perfil',   Icon: UserIcon   },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="bottom-nav">
      {tabs.map(({ to, label, Icon }) => {
        const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to));
        return (
          <NavLink key={to} to={to} className={`nav-item${active ? ' active' : ''}`}>
            <Icon active={active} />
            <span>{label}</span>
            <span className="nav-dot" />
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
