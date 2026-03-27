'use client';
import { useGetUsersQuery, useDeleteUserMutation } from '@/store/adminApiSlice';
import toast from 'react-hot-toast';
import { Users, Trash2, Shield, User, Wrench, Search, Phone } from 'lucide-react';
import { useState } from 'react';

const S = {
  card:   { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' } as React.CSSProperties,
  th:     { padding: '14px 18px', textAlign: 'left' as const, fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.8px', whiteSpace: 'nowrap' as const, borderBottom: '1px solid var(--border)', background: 'var(--bg-card2)' },
  td:     { padding: '14px 18px', fontSize: 14, borderBottom: '1px solid var(--border)', verticalAlign: 'middle' as const },
  input:  { width: '100%', padding: '10px 14px 10px 38px', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 14, outline: 'none' } as React.CSSProperties,
};

export default function UsersPage() {
  const { data: res, isLoading } = useGetUsersQuery({});
  const [deleteUser] = useDeleteUserMutation();
  const [searchTerm, setSearchTerm] = useState('');

  const all = res?.data || [];
  const users = all.filter((u: any) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm) ||
    u.telegramId?.includes(searchTerm)
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name || id}" foydalanuvchini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteUser(id).unwrap();
      toast.success('Foydalanuvchi o\'chirildi');
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':     return { icon: <Shield size={13} />,  label: 'Admin', color: 'var(--warning)', bg: 'rgba(245,166,35,0.12)' };
      case 'SPECIALIST':return { icon: <Wrench size={13} />,  label: 'Usta',  color: 'var(--primary)', bg: 'rgba(108,99,255,0.12)' };
      default:          return { icon: <User size={13} />,    label: 'Mijoz', color: 'var(--text-muted)', bg: 'rgba(107,107,138,0.1)' };
    }
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Users size={30} color="var(--primary)" /> Foydalanuvchilar
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tizimdagi barcha foydalanuvchilar va ularning rollarini boshqarish</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 16px', fontWeight: 800, color: 'var(--primary)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Users size={16} /> {all.length} ta umumiy
        </div>
      </div>

      {/* Search */}
      <div className="mb-5 relative w-full md:max-w-[380px]" style={{ marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Ismi, telefon yoki Telegram ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={S.input}
        />
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Yuklanmoqda...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p>Foydalanuvchilar topilmadi</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={S.th}>Foydalanuvchi</th>
                  <th style={S.th}>Telefon</th>
                  <th style={S.th}>Rol</th>
                  <th style={S.th}>Ro'yxatdan o'tgan</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Amal</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => {
                  const roleBadge = getRoleBadge(user.role);
                  return (
                    <tr key={user.id}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), #8E85FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                            {user.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{user.name || 'Ismsiz'}</p>
                            {user.telegramId && (
                              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>TG: {user.telegramId}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)', fontSize: 14 }}>
                          <Phone size={13} color="var(--primary)" />
                          {user.phone || '—'}
                        </div>
                      </td>
                      <td style={S.td}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800, background: roleBadge.bg, color: roleBadge.color }}>
                          {roleBadge.icon} {roleBadge.label}
                        </span>
                      </td>
                      <td style={{ ...S.td, color: 'var(--text-muted)', fontSize: 13 }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('uz') : '—'}
                      </td>
                      <td style={{ ...S.td, textAlign: 'right' }}>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: 'none', padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all 0.2s' }}
                          onMouseEnter={e => { (e.currentTarget as any).style.background = 'var(--danger)'; (e.currentTarget as any).style.color = '#fff'; }}
                          onMouseLeave={e => { (e.currentTarget as any).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as any).style.color = 'var(--danger)'; }}
                        >
                          <Trash2 size={14} /> O'chirish
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
