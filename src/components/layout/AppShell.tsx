import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { logout } from '../../api/auth';
import TopNav from './TopNav';
import ToastContainer from '../ui/ToastContainer';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useRideAlert } from '../../hooks/useRideAlert';

const navItems = [
  { to: '/', label: 'Live Map', icon: '🗺' },
  { to: '/rides', label: 'Rides', icon: '🚗' },
  { to: '/streams', label: 'Streams', icon: '📡' },
];

export default function AppShell() {
  useWebSocket();
  useRideAlert();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuth();
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '0 20px 28px' }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--color-primary)',
              letterSpacing: '-0.3px',
            }}
          >
            Sabi<span style={{ color: 'var(--color-text-primary)' }}>Ride</span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--color-text-muted)',
              marginTop: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Admin Monitor
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--border-radius-md)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                transition: 'var(--transition)',
              })}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0 12px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--border-radius-md)',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-danger)';
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: 16 }}>↩</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopNav />
        <main style={{ flex: 1, overflow: 'auto', background: 'var(--color-bg)' }}>
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
