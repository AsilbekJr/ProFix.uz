'use client';
import {
  useGetAllSpecialistsQuery,
  useVerifySpecialistMutation,
  useUnverifySpecialistMutation
} from '@/store/adminApiSlice';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Users, CheckCircle, Clock, Search, ExternalLink, 
  MapPin, ShieldCheck, ShieldAlert, Award, XCircle
} from 'lucide-react';

// O'zbekiston viloyatlari
const UZ_REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Samarqand viloyati', 'Buxoro viloyati',
  'Farg\'ona viloyati', 'Andijon viloyati', 'Namangan viloyati', 'Navoiy viloyati',
  'Qashqadaryo viloyati', 'Surxondaryo viloyati', 'Jizzax viloyati', 'Sirdaryo viloyati',
  'Xorazm viloyati', 'Qoraqalpog\'iston Respublikasi'
];

export default function SpecialistsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  
  const { data: res, isLoading, refetch } = useGetAllSpecialistsQuery();
  const [verify, { isLoading: isVerifying }] = useVerifySpecialistMutation();
  const [unverify, { isLoading: isUnverifying }] = useUnverifySpecialistMutation();
  
  const all = res?.data || [];

  const specialists = all.filter((s: import('@/types').Specialist) => {
    const matchesFilter = 
      filter === 'pending' ? !s.isVerified : 
      filter === 'verified' ? s.isVerified : true;
    
    const matchesSearch = 
      s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.user?.phone?.includes(searchTerm);

    const matchesRegion = regionFilter
      ? s.location?.toLowerCase().includes(regionFilter.toLowerCase())
      : true;
      
    return matchesFilter && matchesSearch && matchesRegion;
  });

  const handleVerify = async (id: string, isCurrentlyVerified: boolean) => {
    try {
      if (isCurrentlyVerified) {
        if (!window.confirm('Haqiqatdan ham bu ustani tasdiqdan bekor qilasizmi?')) return;
        await unverify(id).unwrap();
        toast.success("Usta tasdiqlanishi bekor qilindi ⏳");
      } else {
        await verify(id).unwrap();
        toast.success("Usta muvaffaqiyatli tasdiqlandi! ✅");
      }
      refetch();
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  return (
    <div className="page-enter" style={{ paddingBottom: '40px' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Award size={32} color="var(--primary)" /> Ustalar Boshqaruvi
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Mutaxassislarni tekshirish, tasdiqlash va faoliyatini nazorat qilish
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ 
        display: 'flex', flexWrap: 'wrap', 
        gap: '16px', marginBottom: '24px', 
        alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter('all')}> Barchasi </button>
          <button className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
            style={filter === 'pending' ? { background: '#FFC107', borderColor: '#FFC107' } : {}}
            onClick={() => setFilter('pending')}> 
            <Clock size={14} style={{ marginRight: '6px' }} /> Tasdiq kutayotgan ({all.filter((s: any) => !s.isVerified).length})
          </button>
          <button className={`btn ${filter === 'verified' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter('verified')}> 
            <CheckCircle size={14} style={{ marginRight: '6px' }} /> Tasdiqlangan 
          </button>
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Ism yoki telefon orqali qidirish..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 40px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', color: 'var(--text)', outline: 'none'
            }}
          />
        </div>
        <select
          value={regionFilter}
          onChange={e => setRegionFilter(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', color: regionFilter ? 'var(--text)' : 'var(--text-muted)',
            fontSize: '14px', outline: 'none', cursor: 'pointer'
          }}
        >
          <option value="">📍 Barcha viloyatlar</option>
          {UZ_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Main Table Layer */}
      <div style={{ 
        background: 'var(--bg-card)', border: '1px solid var(--border)', 
        borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)' 
      }}>
        {isLoading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <div className="animate-spin" style={{ marginBottom: '16px', display: 'inline-block' }}><Clock size={32} /></div>
            <p style={{ color: 'var(--text-muted)' }}>Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
              <tr>
                <th>Mutaxassis</th>
                <th>Ma'lumotlar</th>
                <th>Xizmatlar</th>
                <th>Status</th>
                <th>Amal</th>
              </tr>
            </thead>
            <tbody>
              {specialists.map((s: import('@/types').Specialist) => (
                <tr key={s.id}>
                  {/* Usta Profile */}
                  <td style={{ minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: 44, height: 44, borderRadius: '14px', 
                        background: 'var(--primary)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '18px', fontWeight: 800
                      }}>
                        {s.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>{s.user?.name || 'Ismsiz'}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{s.user?.phone || '—'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Locations & Bio */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>
                      <MapPin size={14} /> {s.location || 'Manzil yo\'q'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: '1.4' }}>
                      {s.bio ? (s.bio.length > 60 ? s.bio.substring(0, 60) + '...' : s.bio) : 'Bio ma\'lumoti yo\'q'}
                    </div>
                  </td>

                  {/* Services & Docs */}
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {s.services?.map(srv => (
                        <span key={srv.id} style={{ 
                          fontSize: '11px', padding: '2px 8px', 
                          borderRadius: '6px', background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid var(--border)' 
                        }}>
                          {srv.category?.name}
                        </span>
                      ))}
                    </div>
                    {s.documents && s.documents.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                         <a href={s.documents[0]} target="_blank" rel="noreferrer" 
                            style={{ fontSize: '11px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ExternalLink size={12} /> Hujjatlarni ko'rish
                         </a>
                      </div>
                    )}
                  </td>

                  {/* Verification status */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {s.isVerified ? (
                        <span style={{ 
                          display: 'flex', alignItems: 'center', gap: '4px', 
                          color: 'var(--success)', fontSize: '13px', fontWeight: 700 
                        }}>
                          <ShieldCheck size={16} /> Tasdiqlangan
                        </span>
                      ) : (
                        <span style={{ 
                          display: 'flex', alignItems: 'center', gap: '4px', 
                          color: '#FFC107', fontSize: '13px', fontWeight: 700 
                        }}>
                          <ShieldAlert size={16} /> Kutilmoqda
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    {!s.isVerified ? (
                      <button 
                        className="btn btn-success" 
                        onClick={() => handleVerify(s.id, s.isVerified)}
                        disabled={isVerifying || isUnverifying}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}
                      >
                        <CheckCircle size={15} /> Tasdiqlash
                      </button>
                    ) : (
                      <button 
                        className="btn btn-ghost" 
                        onClick={() => handleVerify(s.id, s.isVerified)}
                        disabled={isVerifying || isUnverifying}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', color: 'var(--danger)' }}
                      >
                        <XCircle size={15} /> Bekor qilish
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        {specialists.length === 0 && !isLoading && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
             <Search size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
             <p>Hech qanday mutaxassis topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}
