import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetOpenTendersQuery } from '../store/apiSlice';
import { 
  Briefcase, MapPin, Loader2, Calendar, 
  ChevronRight, AlertCircle, HardHat
} from 'lucide-react';
import { Order } from '../types';

export default function JobBoardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: res, isLoading } = useGetOpenTendersQuery(undefined, {
    skip: user?.role !== 'SPECIALIST'
  });
  
  const navigate = useNavigate();
  // Filter only those that have no specialistId (true open jobs)
  const openJobs = res?.data?.filter((o: Order) => !o.specialistId) || [];

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
        padding: '52px 20px 24px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
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
            Ish E'lonlari
          </h1>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.4, paddingLeft: 4 }}>
          Sizning mutaxassisligingiz bo'yicha yangi buyurtmalar qidirilmoqda. Ularni qabul qiling va daromad toping.
        </p>
      </header>

      {/* ── LIST ── */}
      <main style={{ padding: '24px 20px' }}>
        {openJobs.length === 0 ? (
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
              Siz tanlagan toifalarga mos buyurtmalar chiqqanda bu yerda ko'rinadi. Keyinroq yana tekshirib ko'ring.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {openJobs.map((job: Order) => (
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
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', background: 'var(--primary-glow)',
                    color: 'var(--primary)', borderRadius: 10,
                    fontSize: 12, fontWeight: 700
                  }}>
                    <Briefcase size={14} /> Yangi
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}>
                    <Calendar size={14} />
                    {new Date(job.createdAt).toLocaleDateString('uz', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
