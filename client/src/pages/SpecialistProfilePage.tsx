import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGetSpecialistByIdQuery } from '../store/apiSlice';
import {
  ChevronLeft, Star, MapPin, BadgeCheck, Wrench, AlertCircle,
  Image as ImageIcon, Calendar, Loader2,
  User, PhoneCall, ShieldCheck, CheckCircle2, Briefcase,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function SpecialistProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: res, isLoading } = useGetSpecialistByIdQuery(id!);
  const specialist = res?.data;
  const user = useSelector((state: RootState) => state.auth.user);
  const isMe = user?.id === specialist?.userId;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12 }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-sub)', fontSize: 14, fontWeight: 500 }}>Profil yuklanmoqda...</p>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="page-enter" style={{ paddingTop: 100, padding: 20, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <AlertCircle size={32} />
        </div>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Mutaxassis topilmadi</h1>
        <p style={{ fontSize: 15, color: 'var(--text-sub)', marginBottom: 32 }}>Ushbu profil o'chirilgan yoki mavjud emas.</p>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ width: 'auto', padding: '14px 40px' }}>Orqaga</button>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ paddingBottom: isMe ? 40 : 220 }}>
      
      {/* ── COVER & HEADER ── */}
      <div style={{ position: 'relative' }}>
        <div style={{ height: 180, background: 'var(--gradient-brand)', position: 'relative', overflow: 'hidden' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute', top: 48, left: 20, zIndex: 20, height: 40, padding: '0 16px',
              borderRadius: 12, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)', color: '#fff', display: 'flex', alignItems: 'center',
              gap: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer'
            }}
            className="active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} /> Orqaga
          </button>
          
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: '10%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(20px)' }} />
        </div>

        {/* ── PROFILE CARD ── */}
        <div style={{ padding: '0 20px', marginTop: -40, position: 'relative', zIndex: 10 }}>
          <div className="card" style={{ padding: 24, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 24, background: 'var(--gradient-brand)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  fontSize: 32, fontWeight: 800, border: '4px solid var(--bg-card)', marginTop: -48,
                  boxShadow: '0 8px 24px var(--primary-glow)'
                }}>
                  {specialist.user?.name?.[0]?.toUpperCase() || <User size={36} />}
                </div>
                {specialist.isVerified && (
                  <div style={{
                    position: 'absolute', bottom: -4, right: -4, background: 'var(--accent)',
                    borderRadius: '50%', padding: 4, color: '#fff', border: '3px solid var(--bg-card)'
                  }}>
                    <ShieldCheck size={16} strokeWidth={3} />
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: 20, fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {specialist.user?.name}
                  </h1>
                  {specialist.isVerified && (
                    <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(16,185,129,0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <BadgeCheck size={12} strokeWidth={3} /> Verified
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: 'var(--text-sub)', fontSize: 13, fontWeight: 600 }}>
                  <Wrench size={14} style={{ color: 'var(--primary)' }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {specialist.services?.[0]?.category?.name || 'Professional usta'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Star size={16} fill="currentColor" style={{ color: '#FBBF24' }} />
                  {specialist.rating?.toFixed(1) || '0.0'}
                </div>
                <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Reyting</p>
              </div>
              <div style={{ textAlign: 'center', background: 'var(--bg)', borderRadius: 12, padding: '4px 0' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                  {specialist._count?.ordersAsSpecialist || 0}
                </div>
                <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Buyurtma</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                  {specialist.experienceYear || 0}
                </div>
                <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Tajriba (yil)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* ── BIO ── */}
        <section>
          <h3 className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Briefcase size={20} style={{ color: 'var(--primary)' }} /> Tashrifnoma (Bio)
          </h3>
          <div className="card" style={{ padding: 20, fontSize: 15, lineHeight: 1.6, color: 'var(--text)' }}>
            {specialist.bio || <span style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>Ustaning o'zi haqida ma'lumoti hozircha yo'q.</span>}
          </div>
        </section>

        {/* ── INFO ── */}
        <section>
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={20} />
              </div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Xizmat hududi</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{specialist.location || 'Barcha hududlar'}</p>
              </div>
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Calendar size={20} />
              </div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Platformaga a'zo</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>
                  {specialist.createdAt
                    ? new Date(specialist.createdAt).toLocaleDateString('uz', { month: 'long', year: 'numeric' }) + ' yildan beri'
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PORTFOLIO ── */}
        {specialist.portfolios && specialist.portfolios.length > 0 && (
          <section>
            <h3 className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ImageIcon size={20} style={{ color: 'var(--primary)' }} /> Bajargan ishlari <span style={{ color: 'var(--text-faint)' }}>({specialist.portfolios.length})</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {specialist.portfolios.map((p: any, idx: number) => (
                <div key={idx} style={{ aspectRatio: '1/1', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-elev)', cursor: 'zoom-in' }} className="group">
                  <img src={p.afterImage} alt={`Portfolio ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="group-hover:scale-110" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── REVIEWS ── */}
        {specialist.reviews && specialist.reviews.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <MessageCircle size={20} style={{ color: 'var(--primary)' }} /> Sharhlar <span style={{ color: 'var(--text-faint)' }}>({specialist.reviews.length})</span>
              </h3>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', display: 'flex', gap: 4, alignItems: 'center' }}>
                Barchasi <ChevronRight size={12} strokeWidth={3} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {specialist.reviews.map((review: any) => (
                <div key={review.id} className="card" style={{ padding: 20, background: 'var(--bg-card2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700 }}>
                      {review.client?.name?.[0]?.toUpperCase() || <User size={20} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.client?.name || 'Mijoz'}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{new Date(review.createdAt).toLocaleDateString('uz', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} fill={s <= review.rating ? 'currentColor' : 'none'} style={{ color: s <= review.rating ? '#FBBF24' : 'var(--text-faint)' }} />
                    ))}
                  </div>
                  {review.comment && (
                    <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, paddingLeft: 12, borderLeft: '3px solid var(--primary-glow)', fontStyle: 'italic' }}>
                      "{review.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
      
      {/* ── STICKY CALL ACTION ── */}
      {!isMe && (
        <div
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{
            position: 'fixed',
            bottom: 104,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 430,
            padding: '0 16px',
            zIndex: 101,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: 'hsl(var(--card) / 0.92)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              border: '1px solid hsl(var(--border))',
              borderRadius: 24,
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            }}
          >
            <a
              href={`tel:${specialist.user?.phone}`}
              style={{
                width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                background: '#10b981',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
              }}
              className="active:scale-95 transition-transform"
            >
              <PhoneCall size={22} />
            </a>
            <button
              onClick={() => {
                const stateToPass = location.state || {};
                const catId = stateToPass.categoryId || specialist.services?.[0]?.categoryId;
                const catName = stateToPass.categoryName || specialist.services?.[0]?.category?.name;
                navigate('/order/create', { state: { categoryId: catId, categoryName: catName, specialistId: specialist.id }});
              }}
              className="active:scale-95 transition-transform"
              style={{
                flex: 1,
                height: 52,
                borderRadius: 16,
                fontSize: 15,
                fontWeight: 700,
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: 'var(--shadow-glow)',
                letterSpacing: '0.2px',
              }}
            >
              <CheckCircle2 size={20} color="#fff" />
              Bu ustani chaqirish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
