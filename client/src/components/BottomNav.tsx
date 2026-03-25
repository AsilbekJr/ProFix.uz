import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, User, Plus, Briefcase } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function BottomNav() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const links = [
    { to: '/', icon: Home, label: 'Bosh', end: true },
    ...(user?.role === 'SPECIALIST' ? [{ to: '/jobs', icon: Briefcase, label: "E'lonlar", end: false }] : []),
    { to: '/orders', icon: ClipboardList, label: 'Buyurtma', end: false },
  ];

  return (
    <div className="bottom-nav-wrap">
      <nav className="bottom-nav">
        {/* Left items */}
        <div style={{ display: 'flex', gap: 4 }}>
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 3, padding: '8px 18px', borderRadius: 18,
                  cursor: 'pointer', transition: 'all 0.25s',
                  background: isActive ? 'var(--primary-glow)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-sub)',
                }}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3px' }}>{label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right: Profile */}
        <div style={{ display: 'flex', gap: 4 }}>
          <NavLink to="/profile" style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, padding: '8px 18px', borderRadius: 18,
                cursor: 'pointer', transition: 'all 0.25s',
                background: isActive ? 'var(--primary-glow)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-sub)',
              }}>
                <User size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span style={{ fontSize: 10, fontWeight: 700 }}>Profil</span>
              </div>
            )}
          </NavLink>
        </div>

      </nav>
    </div>
  );
}
