
import {
  useGetAllSpecialistsQuery,
  useVerifySpecialistMutation,
  useUnverifySpecialistMutation
} from '@/store/adminApiSlice';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Award, CheckCircle, Clock, Search, ExternalLink, MapPin, ShieldCheck, ShieldAlert, XCircle } from 'lucide-react';

const UZ_REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Samarqand viloyati', 'Buxoro viloyati',
  'Farg\'ona viloyati', 'Andijon viloyati', 'Namangan viloyati', 'Navoiy viloyati',
  'Qashqadaryo viloyati', 'Surxondaryo viloyati', 'Jizzax viloyati', 'Sirdaryo viloyati',
  'Xorazm viloyati', 'Qoraqalpog\'iston Respublikasi'
];

const S = {
  card:   { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' } as React.CSSProperties,
  th:     { padding: '14px 18px', textAlign: 'left' as const, fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.8px', whiteSpace: 'nowrap' as const, borderBottom: '1px solid var(--border)', background: 'var(--bg-card2)' },
  td:     { padding: '14px 18px', fontSize: 14, borderBottom: '1px solid var(--border)', verticalAlign: 'top' as const },
  input:  { width: '100%', padding: '10px 14px 10px 38px', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 14, outline: 'none' } as React.CSSProperties,
  select: { padding: '10px 14px', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 14, outline: 'none', appearance: 'none' as const } as React.CSSProperties,
};

export default function SpecialistsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  const { data: res, isLoading, refetch } = useGetAllSpecialistsQuery();
  const [verify,   { isLoading: isVerifying   }] = useVerifySpecialistMutation();
  const [unverify, { isLoading: isUnverifying }] = useUnverifySpecialistMutation();

  const all = res?.data || [];
  const specialists = all.filter((s: import('@/types').Specialist) => {
    const matchesFilter = filter === 'pending' ? !s.isVerified : filter === 'verified' ? s.isVerified : true;
    const matchesSearch = s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.user?.phone?.includes(searchTerm);
    const matchesRegion = regionFilter ? s.location?.toLowerCase().includes(regionFilter.toLowerCase()) : true;
    return matchesFilter && matchesSearch && matchesRegion;
  });

  const handleVerify = async (id: string, isCurrentlyVerified: boolean) => {
    try {
      if (isCurrentlyVerified) {
        if (!window.confirm('Haqiqatdan ham bu ustani tasdiqdan bekor qilasizmi?')) return;
        await unverify(id).unwrap();
        toast.success('Usta tasdiqlanishi bekor qilindi ⏳');
      } else {
        await verify(id).unwrap();
        toast.success('Usta muvaffaqiyatli tasdiqlandi! ✅');
      }
      refetch();
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const FilterBtn = ({ value, label, color }: { value: typeof filter; label: string; color: string }) => {
    const isActive = filter === value;
    return (
      <button
        onClick={() => setFilter(value)}
        style={{
          padding: '8px 18px', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer',
          border: isActive ? 'none' : '1px solid var(--border)',
          background: isActive ? color : 'var(--bg-card)',
          color: isActive ? '#fff' : 'var(--text)',
          boxShadow: isActive ? `0 4px 16px ${color}40` : 'none',
          transition: 'all 0.2s'
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Award size={30} color="var(--primary)" /> Ustalar Boshqaruvi
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Mutaxassislarni tekshirish, tasdiqlash va faoliyatini nazorat qilish</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between" style={{ marginBottom: 24 }}>
        <div className="flex flex-wrap gap-2">
          <FilterBtn value="all"      label="Barchasi"                                              color="var(--primary)" />
          <FilterBtn value="pending"  label={`⏳ Tasdiq kutayotgan (${all.filter((s: any) => !s.isVerified).length})`} color="var(--warning)" />
          <FilterBtn value="verified" label="✅ Tasdiqlangan"                                        color="var(--success)" />
        </div>
        <div className="flex flex-col md:flex-row w-full lg:w-auto gap-3">
          <div className="relative w-full md:w-[220px]">
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Ism yoki telefon..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full"
              style={S.input}
            />
          </div>
          <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="w-full md:w-auto" style={{ ...S.select, minWidth: 180 }}>
            <option value="">📍 Barcha viloyatlar</option>
            {UZ_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
            <p>Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : specialists.length === 0 ? (
          <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Search size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p>Hech qanday mutaxassis topilmadi</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={S.th}>Mutaxassis</th>
                  <th style={S.th}>Ma'lumotlar</th>
                  <th style={S.th}>Xizmatlar</th>
                  <th style={S.th}>Status</th>
                  <th style={S.th}>Amal</th>
                </tr>
              </thead>
              <tbody>
                {specialists.map((s: import('@/types').Specialist) => (
                  <tr key={s.id}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                    {/* Usta Profile */}
                    <td style={{ ...S.td, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), #8E85FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 17, flexShrink: 0 }}>
                          {s.user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{s.user?.name || 'Ismsiz'}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.user?.phone || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Location & Bio */}
                    <td style={{ ...S.td, maxWidth: 240 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 13, marginBottom: 5 }}>
                        <MapPin size={13} /> {s.location || 'Manzil yo\'q'}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', lineHeight: 1.4, maxWidth: 220 }}>
                        {s.bio ? (s.bio.length > 60 ? s.bio.substring(0, 60) + '...' : s.bio) : 'Bio ma\'lumoti yo\'q'}
                      </p>
                    </td>

                    {/* Services */}
                    <td style={{ ...S.td, maxWidth: 220 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                        {s.services?.map((srv: any) => (
                          <span key={srv.id} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 8, background: 'var(--bg-card2)', color: 'var(--text-muted)', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                            {srv.category?.name}
                          </span>
                        ))}
                        {(!s.services || s.services.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                      </div>
                      {s.documents && s.documents.length > 0 && (
                        <a href={s.documents[0]} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                          <ExternalLink size={12} /> Hujjatlarni ko'rish
                        </a>
                      )}
                    </td>

                    {/* Status */}
                    <td style={S.td}>
                      {s.isVerified ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 10, fontSize: 12, fontWeight: 800, background: 'rgba(52,197,158,0.12)', color: 'var(--success)' }}>
                          <ShieldCheck size={13} /> Tasdiqlangan
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 10, fontSize: 12, fontWeight: 800, background: 'rgba(245,166,35,0.12)', color: 'var(--warning)' }}>
                          <ShieldAlert size={13} /> Kutilmoqda
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={S.td}>
                      {!s.isVerified ? (
                        <button
                          onClick={() => handleVerify(s.id, s.isVerified)}
                          disabled={isVerifying || isUnverifying}
                          style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, opacity: (isVerifying || isUnverifying) ? 0.5 : 1 }}
                        >
                          <CheckCircle size={14} /> Tasdiqlash
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(s.id, s.isVerified)}
                          disabled={isVerifying || isUnverifying}
                          style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: 'none', padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all 0.2s', opacity: (isVerifying || isUnverifying) ? 0.5 : 1 }}
                          onMouseEnter={e => { (e.currentTarget as any).style.background = 'var(--danger)'; (e.currentTarget as any).style.color = '#fff'; }}
                          onMouseLeave={e => { (e.currentTarget as any).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as any).style.color = 'var(--danger)'; }}
                        >
                          <XCircle size={14} /> Bekor qilish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
