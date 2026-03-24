'use client';
import { useGetUsersQuery, useDeleteUserMutation } from '@/store/adminApiSlice';
import toast from 'react-hot-toast';
import { Users, Trash2, Shield, User, Wrench, Search, Calendar, Phone } from 'lucide-react';
import { useState } from 'react';

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
    switch(role) {
      case 'ADMIN': return { icon: <Shield size={14} />, label: 'Admin', color: 'var(--warning)', bg: 'rgba(245,166,35,0.1)' };
      case 'SPECIALIST': return { icon: <Wrench size={14} />, label: 'Usta', color: 'var(--primary)', bg: 'rgba(108,99,255,0.1)' };
      default: return { icon: <User size={14} />, label: 'Mijoz', color: 'var(--text-muted)', bg: 'rgba(107,107,138,0.1)' };
    }
  };

  return (
    <div className="page-enter" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={32} color="var(--primary)" /> Foydalanuvchilar
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Tizimdagi barcha foydalanuvchilar va ularning rollarini boshqarish</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '14px', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} /> {all.length} ta umumiy
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
         <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Ism, telefon yoki Telegram ID orqali qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px 12px 48px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '14px', color: 'var(--text)', outline: 'none',
                fontSize: '14px', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
         </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
        {isLoading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
             <p>Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Foydalanuvchi</th>
                  <th>Aloqa</th>
                  <th>Roli</th>
                  <th>Sana</th>
                  <th>Amal</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: import('@/types').User) => {
                  const role = getRoleBadge(user.role);
                  return (
                    <tr key={user.id}>
                      <td style={{ minWidth: '200px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: 38, height: 38, borderRadius: '12px', 
                              background: role.bg, color: role.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '14px', fontWeight: 800
                            }}>
                              {user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '15px' }}>{user.name || 'Ismsiz'}</span>
                         </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text)' }}>
                              <Phone size={12} color="var(--primary)" /> {user.phone || '—'}
                           </div>
                           {user.telegramId && (
                             <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '18px' }}>
                                TG ID: {user.telegramId}
                             </div>
                           )}
                        </div>
                      </td>
                      <td>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '6px', 
                          padding: '6px 12px', borderRadius: '10px',
                          background: role.bg, color: role.color,
                          fontSize: '12px', fontWeight: 700
                        }}>
                          {role.icon} {role.label}
                        </div>
                      </td>
                      <td>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                            <Calendar size={13} /> {new Date(user.createdAt).toLocaleDateString('uz')}
                         </div>
                      </td>
                      <td>
                        {user.role !== 'ADMIN' && (
                          <button 
                            className="btn btn-danger" 
                            style={{ width: 34, height: 34, padding: 0, borderRadius: '10px' }}
                            onClick={() => handleDelete(user.id, user.name || '')}
                            title="O'chirish"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    Foydalanuvchilar topilmadi
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
