import { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGetSpecialistsQuery } from '../store/apiSlice';
import { MapPin, Star, ChevronLeft, ChevronRight, Search, Loader2, CheckCircle, ShieldCheck, Wrench } from 'lucide-react';
import { REGIONS } from '../lib/uzbekistan';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface LocationState {
  categoryName?: string;
}

export default function SpecialistsListPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { id: categoryId } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState;
  const navigate = useNavigate();

  const [selectedRegion, setSelectedRegion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: specialistsRes, isLoading } = useGetSpecialistsQuery(
    {
      categoryId: categoryId || '',
      ...(selectedRegion ? { district: selectedRegion } : {})
    },
    { skip: !categoryId }
  );

  const specialists = useMemo(() => {
    const list = specialistsRes?.data || [];
    // Filter out self
    return list.filter((s: any) => s.userId !== user?.id);
  }, [specialistsRes, user?.id]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return specialists;
    return specialists.filter((s: any) => s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [specialists, searchQuery]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12 }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-sub)', fontSize: 14, fontWeight: 500 }}>Ustalar izlanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ paddingBottom: 100 }}>
      {/* ── HEADER ── */}
      <header style={{
        padding: '52px 20px 24px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn-icon" onClick={() => navigate(-1)} style={{ flexShrink: 0 }}>
            <ChevronLeft size={24} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {state?.categoryName ? `${state.categoryName} ustalari` : 'Ustalar ro\'yxati'}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, marginTop: 2 }}>
              {filtered.length} ta mutaxassis topildi
            </p>
          </div>
        </div>
      </header>

      <main style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* ── FILTERS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <MapPin size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              style={{ paddingLeft: 46 }}
            >
              <option value="">📍 Barcha hududlar</option>
              {REGIONS.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Ustani ismidan qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 46 }}
            />
          </div>
        </div>

        {/* ── LIST ── */}
        <div>
          <h2 className="section-label" style={{ marginBottom: 16 }}>
            {searchQuery ? 'Qidiruv natijalari' : selectedRegion ? selectedRegion : 'Barcha mutaxassislar'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((s: any) => (
              <div
                key={s.id}
                className="card card-hover slide-up"
                onClick={() => navigate(`/specialists/${s.id}`, { state: { categoryId, categoryName: state?.categoryName } })}
                style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', padding: '16px 20px' }}
              >
                {/* Avatar section */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div className="avatar avatar-lg" style={{ fontSize: 24, boxShadow: '0 8px 24px var(--primary-glow)' }}>
                    {s.user?.name?.[0]?.toUpperCase()}
                  </div>
                  {s.isVerified && (
                    <div style={{
                      position: 'absolute', bottom: -4, right: -4,
                      background: 'var(--accent)', color: '#fff',
                      borderRadius: '50%', padding: 4, display: 'flex',
                      border: '3px solid var(--bg-card)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <ShieldCheck size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Info section */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 16, fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.user?.name}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FBBF24', fontSize: 12, fontWeight: 800 }}>
                      <Star size={12} fill="currentColor" /> {s.rating?.toFixed(1) ?? '0.0'}
                    </div>
                    
                    {s._count?.ordersAsSpecialist > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontSize: 11, fontWeight: 700, background: 'rgba(52,211,153,0.1)', padding: '2px 8px', borderRadius: 50 }}>
                        <CheckCircle size={10} strokeWidth={3} /> {s._count.ordersAsSpecialist} ta ish
                      </div>
                    )}

                    {s.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-sub)', fontSize: 12 }}>
                        <MapPin size={12} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>
                          {s.location.split(',').slice(-1)[0]?.trim() || s.location.split(',')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Arrow */}
                <div style={{
                  width: 36, height: 36, borderRadius: 12, background: 'var(--bg-input)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-sub)', flexShrink: 0
                }}>
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{
                padding: '48px 24px', textAlign: 'center', background: 'var(--bg-card)',
                borderRadius: 24, border: '1px dashed var(--border)'
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20, background: 'var(--bg-elev)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-faint)', margin: '0 auto 16px'
                }}>
                  <Search size={32} />
                </div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Hech narsa topilmadi</h3>
                <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.5, marginBottom: 24 }}>
                  {searchQuery 
                    ? `"${searchQuery}" ismli usta topilmadi. Ismni to'g'ri yozganingizga ishonch hosil qiling.` 
                    : selectedRegion 
                      ? `${selectedRegion}da hozircha ustalarimiz yo'q. Boshqa hududni tanlab ko'ring.` 
                      : "Ushbu yo'nalishda hozircha mutaxassislar mavjud emas."}
                </p>
                <button className="btn btn-ghost" onClick={() => {setSelectedRegion(''); setSearchQuery('');}} style={{ height: 44, borderRadius: 14 }}>
                  Filtrlarni tozalash
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── QUICK ORDER BUTTON ── */}
        <button
          onClick={() => navigate('/order/create', { state: { categoryId, categoryName: state?.categoryName } })}
          className="card card-hover"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20,
            background: 'var(--primary-glow)', borderColor: 'var(--border-hover)', borderStyle: 'dashed',
            marginTop: 12
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-elev)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={20} />
          </div>
          <span style={{ fontSize: 16, fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'var(--text)' }}>Tezkor umumiy buyurtma</span>
        </button>

      </main>
    </div>
  );
}
