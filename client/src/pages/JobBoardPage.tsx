import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetOpenTendersQuery } from '../store/apiSlice';
import { 
  Briefcase, MapPin, Loader2, Calendar, 
  ChevronRight, AlertCircle, HardHat, Navigation
} from 'lucide-react';
import { Order } from '../types';

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function JobBoardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: res, isLoading } = useGetOpenTendersQuery(undefined, {
    skip: user?.role !== 'SPECIALIST'
  });
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'specialty' | 'general'>('specialty');

  const jobs = res?.data?.filter((o: Order) => !o.specialistId) || [];
  
  // Calculate distance and filter based on metadata
  const processedJobs = useMemo(() => {
    const specialistLat = res?.meta?.specialistLat;
    const specialistLng = res?.meta?.specialistLng;
    const specialistCategories: string[] = res?.meta?.categoryIds || [];

    return jobs.map(job => {
      let distance = null;
      if (specialistLat && specialistLng && job.locationLat && job.locationLng) {
        distance = calculateDistance(specialistLat, specialistLng, job.locationLat, job.locationLng);
      }
      
      const isSpecialty = specialistCategories.includes(job.categoryId);
      
      return { ...job, distance, isSpecialty };
    }).sort((a, b) => {
      // Sort by distance (closest first), if no distance, push to bottom
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      // Fallback sorting to date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [jobs, res?.meta]);

  const specialtyJobs = processedJobs.filter(j => j.isSpecialty);
  const displayJobs = activeTab === 'specialty' ? specialtyJobs : processedJobs;

  if (user?.role !== 'SPECIALIST') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12 }}>
        <AlertCircle size={48} style={{ color: 'var(--danger)' }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Ruxsat etilmagan</h2>
        <p style={{ color: 'var(--text-sub)' }}>Bu sahifa faqat ustalar uchun.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12 }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-sub)', fontSize: 14, fontWeight: 500 }}>Ishlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ paddingBottom: 100 }}>
      {/* ── HEADER ── */}
      <header style={{
        padding: '52px 20px 20px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: 'var(--primary-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
          }}>
            <Briefcase size={22} strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontFamily: 'Poppins, sans-serif', fontSize: 26, fontWeight: 800,
            color: 'var(--text)', letterSpacing: '-0.5px'
          }}>
            E'lonlar
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {[
            { id: 'specialty' as const, label: 'Mutaxassislik', count: specialtyJobs.length },
            { id: 'general' as const, label: 'Umumiy e\'lonlar', count: processedJobs.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, height: 44, borderRadius: 14, border: 'none',
                fontSize: 14, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s', cursor: 'pointer',
                background: activeTab === tab.id ? 'var(--primary)' : 'var(--bg-input)',
                color: activeTab === tab.id ? '#fff' : 'var(--text-sub)',
                boxShadow: activeTab === tab.id ? '0 4px 16px var(--primary-glow)' : 'none'
              }}
            >
              {tab.label}
              <span style={{
                background: activeTab === tab.id ? 'rgba(0,0,0,0.2)' : 'var(--border)',
                color: activeTab === tab.id ? '#fff' : 'var(--text)', fontSize: 10, height: 20, padding: '0 8px',
                borderRadius: 10, display: 'flex', alignItems: 'center'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* ── LIST ── */}
      <main style={{ padding: '20px' }}>
        {displayJobs.length === 0 ? (
          <div style={{
            padding: '48px 20px', textAlign: 'center', background: 'var(--bg-card)',
            borderRadius: 24, border: '1px dashed var(--border)'
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 24, background: 'var(--bg-input)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-faint)', margin: '0 auto 16px'
            }}>
              <HardHat size={36} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
              Hozircha yangi e'lonlar yo'q
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', marginTop: 8, lineHeight: 1.5 }}>
              Yangi buyurtmalar paydo bo'lganda shu yerda va eng yaqin masofadan boshlab ko'rinadi.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {displayJobs.map((job) => (
              <div
                key={job.id}
                className="card card-hover"
                onClick={() => navigate(`/orders/${job.id}`)}
                style={{ 
                  cursor: 'pointer', padding: 20,
                  position: 'relative', overflow: 'hidden'
                }}
              >
                {/* Status bar on left */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                  background: 'var(--primary)'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px', background: 'var(--primary-glow)',
                      color: 'var(--primary)', borderRadius: 10,
                      fontSize: 12, fontWeight: 700
                    }}>
                      <Briefcase size={14} /> Yangi
                    </div>
                    {job.distance !== null && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 8px', background: 'var(--bg-input)',
                        color: 'var(--text)', borderRadius: 10,
                        fontSize: 12, fontWeight: 600
                      }}>
                        <Navigation size={12} style={{ color: 'var(--primary)' }} /> 
                        {job.distance < 1 ? '< 1 km' : `${job.distance.toFixed(1)} km`}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}>
                    <Calendar size={14} />
                    {new Date(job.createdAt).toLocaleDateString('uz', { day: 'numeric', month: 'short' })}
                  </div>
                </div>

                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                  {job.category?.name || 'Boshqa xizmat'}
                </h3>
                
                <p style={{ 
                  fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.5, 
                  marginBottom: 16, WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', 
                  display: '-webkit-box', overflow: 'hidden' 
                }}>
                  {job.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 10, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={14} strokeWidth={2} />
                    </div>
                    {job.address?.split(',')[0]?.trim() || 'Manzil yashirilgan'}
                  </div>
                  <div style={{
                    width: 36, height: 36, borderRadius: 12, background: 'var(--bg-input)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)', flexShrink: 0,
                    transition: 'all 0.2s'
                  }}>
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
