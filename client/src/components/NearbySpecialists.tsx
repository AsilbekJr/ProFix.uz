import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetSpecialistsQuery } from '../store/apiSlice';
import { MapPin, Star, ChevronRight, Search, CheckCircle, ChevronDown, ShieldCheck } from 'lucide-react';
import { REGIONS } from '../lib/uzbekistan';

export default function NearbySpecialists() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showAll, setShowAll] = useState(false);

  const { data: specialistsRes, isLoading } = useGetSpecialistsQuery(
    selectedRegion ? { district: selectedRegion } : {},
  );

  const specialists = specialistsRes?.data || [];
  const displayList = showAll || selectedRegion ? specialists : specialists.slice(0, 3);

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{
          fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 800,
          color: 'var(--text)', letterSpacing: '-0.3px'
        }}>
          {selectedRegion || 'Mutaxassislar'}
        </h2>
        <span style={{
          fontSize: 12, fontWeight: 700, color: 'var(--text-sub)',
          background: 'var(--bg-elev)', padding: '3px 10px', borderRadius: 50
        }}>
          {specialists.length} jami
        </span>
      </div>

      {/* Region filter */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <MapPin size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
        <select
          value={selectedRegion}
          onChange={e => { setSelectedRegion(e.target.value); setShowAll(false); }}
          style={{
            paddingLeft: 46, paddingRight: 40, background: 'var(--bg-card)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)', fontWeight: 600, height: 52
          }}
        >
          <option value="">📍 Barcha hududlar</option>
          {REGIONS.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
        </select>
        <ChevronDown size={14} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 86, borderRadius: 20 }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {specialists.length === 0 ? (
            <div style={{
              padding: '40px 20px', textAlign: 'center', background: 'var(--bg-card)',
              borderRadius: 24, border: '1px dashed var(--border)'
            }}>
              <Search size={32} style={{ margin: '0 auto 12px', color: 'var(--text-faint)' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-sub)' }}>
                {selectedRegion ? `${selectedRegion}da mutaxassislar topilmadi` : "Hozircha mutaxassislar yo'q"}
              </p>
            </div>
          ) : (
            displayList.map((spec: any) => (
              <div
                key={spec.id}
                className="card card-hover"
                onClick={() => navigate(`/specialists/${spec.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', padding: '16px 20px' }}
              >
                {/* Avatar section */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div className="avatar avatar-lg" style={{ fontSize: 24 }}>
                    {spec.user?.name?.[0]?.toUpperCase()}
                  </div>
                  {spec.isVerified && (
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
                      {spec.user?.name}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FBBF24', fontSize: 12, fontWeight: 800 }}>
                      <Star size={12} fill="currentColor" /> {spec.rating?.toFixed(1) ?? '0.0'}
                    </div>
                    
                    {spec._count?.ordersAsSpecialist > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontSize: 11, fontWeight: 700, background: 'rgba(52,211,153,0.1)', padding: '2px 8px', borderRadius: 50 }}>
                        <CheckCircle size={10} strokeWidth={3} /> {spec._count.ordersAsSpecialist} ta ish
                      </div>
                    )}

                    {spec.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-sub)', fontSize: 12 }}>
                        <MapPin size={12} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>
                          {spec.location.split(',').slice(-1)[0]?.trim() || spec.location.split(',')[0]}
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
            ))
          )}

          {/* Show more button */}
          {!selectedRegion && specialists.length > 3 && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="btn btn-ghost"
              style={{ padding: '12px 20px', fontSize: 14, marginTop: 4, border: 'none', background: 'var(--bg-elev)' }}
            >
              <span style={{ color: 'var(--text)', fontWeight: 700 }}>
                {showAll ? "Kamroq ko'rsatish" : `Barchasini ko'rish (${specialists.length})`}
              </span>
              <ChevronDown size={18} style={{ transform: showAll ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', color: 'var(--text-sub)' }} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
