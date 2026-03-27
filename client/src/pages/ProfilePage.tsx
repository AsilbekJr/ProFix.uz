import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout, setCredentials } from '../store/authSlice';
import { useUpdateMeMutation, useGetMeQuery } from '../store/apiSlice';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import {
  User, Crown, Wrench, Edit3, LogOut, Check, ChevronRight,
  Sun, Moon, Shield, Phone, BadgeCheck,
  Settings, HelpCircle, Bell, Briefcase, 
  ShieldCheck, Loader2
} from 'lucide-react';
import { formatPhone } from '../lib/utils';


export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const { data: latestUser } = useGetMeQuery(undefined, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (latestUser?.data && token) {
      dispatch(setCredentials({ user: latestUser.data, token }));
    }
  }, [latestUser, token, dispatch]);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Ism bo'sh bo'lishi mumkin emas");
      return;
    }
    if (phone && phone.replace(/\s+/g, '').length !== 13) {
      toast.error("Telefon raqami noto'g'ri");
      return;
    }
    try {
      const res = await updateMe({ 
        name: name.trim(), 
        phone: phone.trim() || undefined 
      }).unwrap();
      if (token) dispatch(setCredentials({ user: res.data, token }));
      setEditing(false);
      toast.success('Profil yangilandi ✅');
    } catch (err: any) {
      toast.error(err.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setName(user?.name || '');
    setPhone(user?.phone || '');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  const roleConfig = {
    ADMIN:      { label: 'Administrator', icon: <Crown size={14} />,  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    SPECIALIST: { label: 'Mutaxassis',    icon: <Wrench size={14} />, color: 'var(--primary)', bg: 'var(--primary-glow)' },
    CLIENT:     { label: 'Mijoz',         icon: <User size={14} />,   color: 'var(--secondary)',  bg: 'rgba(56,189,248,0.1)' },
  };
  const role = roleConfig[user?.role || 'CLIENT'];

  return (
    <div className="page-enter" style={{ paddingBottom: 100 }}>
      
      {/* ── HEADER ── */}
      <header style={{
        padding: '52px 20px 24px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
            Mening profilim
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 600 }}>Sozlamalar va shaxsiy ma'lumotlar</p>
        </div>
        <button 
          onClick={toggleTheme}
          className="btn-icon"
          style={{ width: 44, height: 44, borderRadius: 16 }}
        >
          {theme === 'dark' ? <Sun size={20} style={{ color: '#FBBF24' }} /> : <Moon size={20} style={{ color: 'var(--primary)' }} />}
        </button>
      </header>

      <main style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* ── USER CARD ── */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 120, height: 120, background: 'var(--primary-glow)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24, background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 32, fontWeight: 800,
              boxShadow: '0 8px 24px var(--primary-glow)', border: '4px solid var(--bg-card)'
            }}>
              {user?.name?.[0]?.toUpperCase() || <User size={36} />}
            </div>
            {user?.role === 'SPECIALIST' && user.specialist?.isVerified && (
              <div style={{
                position: 'absolute', bottom: -4, right: -4, background: 'var(--accent)',
                borderRadius: '50%', padding: 4, color: '#fff', border: '3px solid var(--bg-card)'
              }}>
                <BadgeCheck size={16} strokeWidth={3} />
              </div>
            )}
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 22, fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: 'var(--text)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Foydalanuvchi'}
            </h2>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 50,
              background: role.bg, color: role.color,
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {role.icon} {role.label}
            </div>
          </div>
        </div>

        {/* ── PERSONAL INFO ── */}
        <section>
          <h3 className="section-label">Shaxsiy ma'lumotlar</h3>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              flexWrap: 'wrap', gap: '16px', marginBottom: editing ? 20 : 0 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 16, background: 'var(--bg-elev)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                  <Settings size={20} />
                </div>
                <h3 style={{ fontSize: 18, fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Sozlamalar</h3>
              </div>
              {!editing && (
                <button className="btn btn-ghost" onClick={() => setEditing(true)} style={{ height: 40, padding: '0 16px', borderRadius: 12, background: 'var(--bg-elev)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={14} /> Tahrirlash
                </button>
              )}
            </div>

            {editing ? (
              <div className="slide-down" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                <div>
                  <label className="section-label">To'liq ism</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ marginTop: 8 }}
                  />
                </div>
                
                <div>
                  <label className="section-label">Telefon raqam</label>
                  <div style={{ position: 'relative', marginTop: 8 }}>
                    <Phone size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(formatPhone(e.target.value))}
                      style={{ paddingLeft: 46 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1, borderRadius: 16 }}>
                    {saving ? <Loader2 className="animate-spin" /> : <Check size={18} />} Saqlash
                  </button>
                  <button className="btn btn-ghost" onClick={handleCancelEdit} style={{ flex: 1, borderRadius: 16, background: 'var(--bg-input)' }}>
                    Bekor qilish
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'block' }}>Ro'yxatdan o'tgan</span>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('uz', { month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'block' }}>Telefon</span>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{user?.phone || '—'}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── SPECIALIZED MENU ── */}
        <section>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {user?.role === 'CLIENT' && (
              <button 
                onClick={() => navigate('/apply-specialist')}
                className="card card-hover"
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(16,185,129,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={24} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h3 style={{ fontSize: 16, fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'var(--text)' }}>Usta bo'lib ishlash</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>Platformada o'z xizmatlaringizni taklif qiling</p>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--accent)' }} />
              </button>
            )}

            {user?.role === 'SPECIALIST' && user?.specialist && (
              <button 
                onClick={() => navigate(`/specialists/${user.specialist!.id}`)}
                className="card card-hover"
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: 'var(--primary-glow)', borderColor: 'var(--primary-glow)' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--bg-elev)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h3 style={{ fontSize: 16, fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'var(--text)' }}>Mutaxassis profilim</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>Xizmatlar, reyting va mijozlar sharhlari</p>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--primary)' }} />
              </button>
            )}

            {user?.role === 'SPECIALIST' && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: 'var(--bg-input)', borderStyle: 'dashed' }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: user.specialist?.isVerified ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: user.specialist?.isVerified ? 'var(--accent)' : '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'var(--text)' }}>Verifikatsiya</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>
                    {user.specialist?.isVerified ? 'Tasdiqlangan mutaxassis' : 'Admin tekshiruvida...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── APP SETTINGS ── */}
        <section>
          <h3 className="section-label">Ilova sozlamalari</h3>
          <div className="card" style={{ padding: 8 }}>
            <MenuItem icon={<Bell size={20} style={{ color: 'var(--secondary)' }} />} label="Bildirishnomalar" />
            <MenuItem icon={<HelpCircle size={20} style={{ color: 'var(--primary)' }} />} label="Yordam markazi" />
            <MenuItem icon={<Shield size={20} style={{ color: 'var(--accent)' }} />} label="Xavfsizlik & Maxfiylik" />
          </div>
        </section>

        {/* ── LOGOUT ── */}
        <button 
          onClick={handleLogout}
          className="btn"
          style={{ width: '100%', height: 56, borderRadius: 16, background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)', marginTop: 8 }}
        >
          <LogOut size={20} />
          <span>Tizimdan chiqish</span>
        </button>

      </main>
    </div>
  );
}

function MenuItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, cursor: 'pointer', transition: 'background 0.2s' }} className="hover:bg-[var(--bg-elev)]">
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-elev)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <p style={{ flex: 1, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{label}</p>
      <ChevronRight size={18} style={{ color: 'var(--text-faint)' }} />
    </div>
  );
}
