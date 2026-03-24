'use client';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAdminLoginMutation } from '@/store/adminApiSlice';
import { setAdminCredentials } from '@/store/adminAuthSlice';
import { useRouter } from 'next/navigation';
import { Lock, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const [adminLogin, { isLoading }] = useAdminLoginMutation();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998' + val.replace(/^\+?998?/, '');
    }
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanPhone = phone.replace(/\s/g, '');
    try {
      const res = await adminLogin({ phone: cleanPhone, password }).unwrap();
      if (!res.user || res.user.role !== 'ADMIN') {
        setError('Siz admin emassiz. Ruxsat yo\'q.');
        return;
      }
      dispatch(setAdminCredentials({ user: res.user, token: res.token }));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.data?.message || 'Kirish xatoligi. Ma\'lumotlarni tekshiring.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.12) 0%, transparent 60%), var(--bg)'
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '44px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '20px',
            background: 'linear-gradient(135deg, #6C63FF, #5A52D5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', margin: '0 auto 16px',
            boxShadow: '0 10px 20px rgba(108,99,255,0.3)'
          }}>
            <ShieldCheck size={38} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px', fontWeight: 500 }}>
            ProFix.uz boshqaruv tizimi
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
              ADMIN TELEFON RAQAMI
            </label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+998 90 000 00 00"
              required
              style={{
                width: '100%', padding: '14px 16px',
                background: 'var(--bg-card2)',
                border: '1px solid var(--border)',
                borderRadius: '14px', color: 'var(--text)',
                fontSize: '16px', outline: 'none',
                fontWeight: 600,
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
              ADMIN PAROLI
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '14px 16px',
                background: 'var(--bg-card2)',
                border: '1px solid var(--border)',
                borderRadius: '14px', color: 'var(--text)',
                fontSize: '16px', outline: 'none',
                fontWeight: 600,
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 14px', borderRadius: '12px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: 'var(--danger)', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              padding: '14px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '15px',
              marginTop: '4px'
            }}
          >
            {isLoading ? '⏳ Tekshirilmoqda...' : <><Lock size={18} /> Kirish</>}
          </button>
        </form>
      </div>
    </div>
  );
}


