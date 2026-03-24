'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogout } from '@/store/adminAuthSlice';
import { useRouter } from 'next/navigation';
import type { RootState } from '@/store';
import {
  LayoutDashboard, ClipboardList, Wrench, Users,
  FolderTree, LogOut, Building2, Sun, Moon, Menu, X
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useState, useEffect } from 'react';

const NAV = [
  { href: '/dashboard',             icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/orders',      icon: ClipboardList,   label: 'Buyurtmalar' },
  { href: '/dashboard/specialists', icon: Wrench,          label: 'Ustalar' },
  { href: '/dashboard/users',       icon: Users,           label: 'Foydalanuvchilar' },
  { href: '/dashboard/categories',  icon: FolderTree,      label: 'Kategoriyalar' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((s: RootState) => s.adminAuth.user);
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(adminLogout());
    router.push('/');
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Section */}
      <div style={{ padding: '32px 24px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary), #8E85FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 8px 16px rgba(108,99,255,0.25)'
          }}>
            <Building2 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '-0.5px', color: 'var(--text)' }}>Mahalla-Servis</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Boshqaruv Paneli
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Layer */}
      <nav style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '12px 16px' }}>Asosiy menyu</p>
        {NAV.map(n => {
          const Icon = n.icon;
          const isActive = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 18px', borderRadius: '16px',
                fontSize: '14px', fontWeight: 700,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                background: isActive ? 'rgba(108,99,255,0.08)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.25s',
                border: isActive ? '1px solid rgba(108,99,255,0.1)' : '1px solid transparent'
              }}
              onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
              {n.label}
              {isActive && (
                <div style={{
                  marginLeft: 'auto', width: 5, height: 5,
                  borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)'
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Section */}
      <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.01)' }}>
        <div style={{ 
          background: 'var(--bg-card2)', padding: '16px', borderRadius: '22px', 
          border: '1px solid var(--border)', marginBottom: '16px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '12px',
            background: 'var(--primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 900, boxShadow: '0 4px 12px rgba(108,99,255,0.2)'
          }}>
            {user?.name?.[0] || 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Admin'}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Asosiy boshqaruvchi</p>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              width: 32, height: 32, borderRadius: '10px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-danger"
          style={{ 
            width: '100%', padding: '14px', borderRadius: '18px', 
            gap: '10px', fontSize: '14px', fontWeight: 800,
            background: 'var(--danger)', border: 'none', boxShadow: '0 10px 20px rgba(239,68,68,0.2)'
          }}
        >
          <LogOut size={18} /> Chiqish
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside className="sidebar sidebar-desktop">
        <SidebarContent />
      </aside>

      {/* ── Mobile: Hamburger toggle button ─────────────────── */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setOpen(true)}
        aria-label="Menyuni ochish"
      >
        <Menu size={22} />
      </button>

      {/* ── Mobile: Overlay ──────────────────────────────────── */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile: Sliding Sidebar ──────────────────────────── */}
      <aside className={`sidebar sidebar-mobile${open ? ' open' : ''}`}>
        <button
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: '8px',
            background: 'var(--bg-card2)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)', zIndex: 1
          }}
        >
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>
    </>
  );
}
