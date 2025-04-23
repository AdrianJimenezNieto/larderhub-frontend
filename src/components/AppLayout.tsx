import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const AppLayout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--paper)' }}>
    <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
      <Outlet />
    </main>
    <BottomNav />
  </div>
);

export default AppLayout;
