import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { useLoginMutation, useRegisterOrLoginMutation, useTelegramAuthMutation } from '../store/apiSlice';
import toast from 'react-hot-toast';
import { ArrowRight, Loader2, Phone, Lock, User, Smartphone, Eye, EyeOff, Info, CheckCircle2, Sun, Moon } from 'lucide-react';
import { formatPhone } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

const tg = (window as any).Telegram?.WebApp;

const FEATURES = [
  { icon: '🔧', title: '500+ usta', sub: 'Tasdiqlangan mutaxassislar' },
  { icon: '⚡', title: 'Tez javob', sub: "O'rtacha 15 daqiqa" },
  { icon: '🛡️', title: 'Kafolat', sub: 'Har bir ish uchun' },
];

export default function AuthPage() {
  const [phone, setPhone] = useState('+998 ');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterOrLoginMutation();
  const [telegramAuth] = useTelegramAuthMutation();
  const loading = isLoginLoading || isRegisterLoading;

  useEffect(() => {
    if (tg?.initDataUnsafe?.user) handleTelegramLogin();
  }, []);

  const handleTelegramLogin = async () => {
    if (!tg?.initDataUnsafe?.user) return;
    try {
      const res = await telegramAuth({
        telegramId: String(tg.initDataUnsafe.user.id),
        name: `${tg.initDataUnsafe.user.first_name || ''} ${tg.initDataUnsafe.user.last_name || ''}`.trim()
      }).unwrap();
      dispatch(setCredentials({ user: res.user, token: res.token }));
      navigate('/');
    } catch { toast.error('Telegram orqali kirishda xatolik'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone.length !== 13) { toast.error("Telefon raqamni to'liq kiriting"); return; }

    if (mode === 'login') {
      try {
        const res = await login({ phone: cleanPhone, password }).unwrap();
        dispatch(setCredentials({ user: res.user, token: res.token }));
        navigate('/');
      } catch (err: any) {
        toast.error(err.data?.message || 'Xatolik yuz berdi');
      }
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) { toast.error('Parol kamida 6 ta belgi bo\'lishi kerak'); return; }
      if (password !== confirmPassword) { toast.error('Parollar mos emas'); return; }
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (!fullName) { toast.error('Ism va familiyangizni kiriting'); return; }
      try {
        const res = await register({ phone: cleanPhone, name: fullName, password }).unwrap();
        dispatch(setCredentials({ user: res.user, token: res.token }));
        navigate('/');
      } catch (err: any) {
        toast.error(err.data?.message || 'Xatolik yuz berdi');
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Ambient blobs */}
      <div style={{
        position: 'absolute', top: -120, right: -80,
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,110,250,0.18) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -60,
        width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '0 20px', paddingTop: 60, paddingBottom: 48 }}>
        
        {/* Toggle Theme */}
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)',
            zIndex: 10
          }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Brand Header */}
        <div className="page-enter" style={{ textAlign: 'center', marginBottom: 40 }}>
          <img 
            src="/logo.png" 
            alt="ProFix Logo" 
            style={{ 
              width: 90, 
              height: 90, 
              margin: '0 auto 16px', 
              objectFit: 'contain',
              filter: theme === 'dark' ? 'drop-shadow(0 8px 16px rgba(59, 130, 246, 0.4))' : 'drop-shadow(0 8px 16px rgba(59, 130, 246, 0.2))',
              transition: 'all 0.3s ease'
            }} 
          />
          <h1 style={{
            fontFamily: 'Poppins, sans-serif', fontSize: 32, fontWeight: 800,
            color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 8,
            transition: 'color 0.3s ease'
          }}>
            Pro<span style={{ color: 'var(--primary)' }}>Fix</span>.uz
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.5 }}>
            Atrofingizda ishonchli ustalar tarmog'i
          </p>
        </div>

        {/* Feature chips */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}
          className="fade-in">
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 50,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              fontSize: 12, fontWeight: 600, color: 'var(--text-sub)',
            }}>
              <span>{f.icon}</span>
              <span style={{ color: 'var(--text)' }}>{f.title}</span>
            </div>
          ))}
        </div>

        {/* Auth Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: '28px 24px',
          boxShadow: 'var(--shadow-card)',
        }} className="scale-in">

          {/* Tab Switcher */}
          <div style={{
            display: 'flex', background: 'var(--bg-card2)',
            borderRadius: 14, padding: 4, marginBottom: 28, gap: 4
          }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '11px 8px', borderRadius: 10, border: 'none',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  fontSize: 14, fontWeight: 700,
                  transition: 'all 0.25s',
                  background: mode === m ? 'var(--bg-card)' : 'transparent',
                  color: mode === m ? 'var(--text)' : 'var(--text-sub)',
                  boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {m === 'login' ? 'Kirish' : "A'zo bo'lish"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 8, letterSpacing: '0.3px' }}>
                TELEFON RAQAM
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  placeholder="+998 XX XXX XX XX"
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            </div>

            {/* Register fields */}
            {mode === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 8 }}>ISM</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Ism"
                      style={{ paddingLeft: 42 }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 8 }}>FAMILIYA</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Familiya" required />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 8, letterSpacing: '0.3px' }}>
                PAROL
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingLeft: 42, paddingRight: 44, letterSpacing: '0.15em' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)', padding: 4 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'register' && (
                <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-sub)', marginTop: 6 }}>
                  <Info size={11} style={{ color: 'var(--primary)' }} />
                  Kamida 6 ta belgi, harf va raqam bo'lsin
                </p>
              )}
            </div>

            {/* Confirm password */}
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 8 }}>PAROLNI TASDIQLANG</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ letterSpacing: '0.15em' }}
                  required
                />
              </div>
            )}

            {/* Submit btn */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-gradient"
              style={{ marginTop: 8, height: 52, fontSize: 16, borderRadius: 16 }}
            >
              {loading
                ? <Loader2 size={22} className="animate-spin" />
                : <>
                    <span>{mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}</span>
                    <ArrowRight size={20} />
                  </>
              }
            </button>
          </form>

          {/* Trust indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
            {['🔐 Xavfsiz', '✅ Tez', '🆓 Bepul'].map((t, i) => (
              <span key={i} style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Footer legal */}
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-sub)', marginTop: 24, lineHeight: 1.6, padding: '0 12px' }}>
          Davom etish orqali{' '}
          <a href="#" style={{ color: 'var(--primary)', fontWeight: 700 }}>Foydalanish shartlari</a>
          {' '}va{' '}
          <a href="#" style={{ color: 'var(--primary)', fontWeight: 700 }}>Maxfiylik siyosati</a>
          {' '}ga rozilik bildirasiz.
        </p>
      </div>
    </div>
  );
}
