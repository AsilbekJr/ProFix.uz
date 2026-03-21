import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrderByIdQuery, useCreateReviewMutation } from '../store/apiSlice';
import { Star, ChevronLeft, Send, Loader2, HardHat, Quote, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const RATING_LABELS = ['', 'Yomon', 'Qoniqarsiz', "O'rtacha", 'Yaxshi', 'Ajoyib'];

export default function ReviewPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: res, isLoading: orderLoading } = useGetOrderByIdQuery(orderId!);
  const [createReview, { isLoading: submitting }] = useCreateReviewMutation();
  const order = res?.data;

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Iltimos yulduzcha bering');
      return;
    }
    try {
      await createReview({ orderId: orderId!, rating, comment }).unwrap();
      toast.success("Rahmat! Sizning sharhingiz qabul qilindi 🎉");
      navigate('/orders');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Xatolik yuz berdi');
    }
  };

  if (orderLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12 }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-sub)', fontSize: 14, fontWeight: 500 }}>Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ paddingBottom: 100 }}>
      {/* ── HEADER ── */}
      <header style={{
        padding: '52px 20px 24px',
        background: 'var(--bg-card)',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn-icon" onClick={() => navigate(-1)} style={{ flexShrink: 0 }}>
            <ChevronLeft size={24} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Xizmatni baholash
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 600, marginTop: 2 }}>
              Sizning fikringiz biz uchun muhim
            </p>
          </div>
        </div>
      </header>

      <main style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* ── SPECIALIST CARD ── */}
        {order?.specialist && (
          <div className="card scale-in" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center', background: 'var(--primary-glow)', borderColor: 'var(--border-hover)', borderStyle: 'dashed' }}>
             <div style={{
               width: 56, height: 56, borderRadius: 16, background: 'var(--gradient-brand)',
               display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
               fontSize: 24, fontWeight: 800, flexShrink: 0, boxShadow: '0 8px 24px var(--primary-glow)'
             }}>
               {order.specialist.user?.name?.[0]?.toUpperCase() || <HardHat size={28} />}
             </div>
             <div style={{ flex: 1, minWidth: 0 }}>
               <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usta</span>
               <h3 style={{ fontSize: 18, fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                 {order.specialist.user?.name || 'Usta'}
               </h3>
               <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                 {order.category?.name || 'Xizmat turi'}
               </p>
             </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* ── STAR RATING ── */}
          <section className="card slide-up" style={{ padding: '32px 24px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(251,191,36,0.1)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} />
              </div>
              Xizmat sifati qanday edi?
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              {[1, 2, 3, 4, 5].map(star => {
                const isFilled = (hovered || rating) >= star;
                const starColor = isFilled ? '#FBBF24' : 'var(--border)';
                
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    style={{
                      position: 'relative', padding: 8, background: 'none', border: 'none',
                      cursor: 'pointer', transform: isFilled ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                    className="active:scale-95"
                  >
                    <Star
                      size={48}
                      fill={isFilled ? 'currentColor' : 'none'}
                      style={{ color: starColor, transition: 'color 0.2s' }}
                      strokeWidth={1.5}
                    />
                    {isFilled && (
                      <div style={{ position: 'absolute', inset: 4, background: 'rgba(251,191,36,0.2)', filter: 'blur(12px)', borderRadius: '50%', zIndex: -1 }} />
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ minHeight: 32, marginTop: 16 }}>
              {(hovered || rating) > 0 && (
                <div className="slide-down">
                  <span style={{
                    fontSize: 20, fontFamily: 'Poppins, sans-serif', fontWeight: 800,
                    color: (hovered || rating) >= 4 ? 'var(--accent)' : (hovered || rating) >= 3 ? '#FBBF24' : 'var(--danger)',
                    background: (hovered || rating) >= 4 ? 'rgba(52,211,153,0.1)' : (hovered || rating) >= 3 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)',
                    padding: '4px 16px', borderRadius: 50
                  }}>
                    {RATING_LABELS[hovered || rating]}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* ── COMMENT ── */}
          <section className="slide-up" style={{ animationDelay: '0.1s' }}>
            <label className="section-label">Sharhingizni yozing (ixtiyoriy)</label>
            <div style={{ position: 'relative', marginTop: 8 }}>
              <Quote size={20} style={{ position: 'absolute', left: 16, top: 16, color: 'var(--text-sub)' }} />
              <textarea
                rows={4}
                placeholder="Usta ishi, muamala va boshqa tafsilotlar haqida..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{ paddingLeft: 46, paddingTop: 16 }}
              />
            </div>
          </section>

          {/* ── SUBMIT ── */}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className={`btn btn-gradient slide-up ${rating === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ height: 56, borderRadius: 16, fontSize: 16, animationDelay: '0.2s', marginTop: 12 }}
          >
            {submitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            <span>{submitting ? 'Yuborilmoqda...' : 'Sharhni yuborish'}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
