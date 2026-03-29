import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrderByIdQuery, useCreateReviewMutation } from '../store/apiSlice';
import { Star, ChevronLeft, Send, Loader2, HardHat, Quote, Sparkles, Camera, X, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

const RATING_LABELS = ['', 'Yomon', 'Qoniqarsiz', "O'rtacha", 'Yaxshi', 'Ajoyib! 🎉'];
const CONFETTI_COLORS = ['#7C6EFA', '#F472B6', '#34D399', '#FBBF24', '#60A5FA', '#F87171'];

export default function ReviewPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: res, isLoading: orderLoading } = useGetOrderByIdQuery(orderId!);
  const [createReview, { isLoading: submitting }] = useCreateReviewMutation();
  const order = res?.data;

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState('');
  const [afterPreview, setAfterPreview] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (type: 'before' | 'after', file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'before') { setBeforeImage(file); setBeforePreview(url); }
    else { setAfterImage(file); setAfterPreview(url); }
  };

  const hasBonus = !!(beforeImage || afterImage || comment.length > 20);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { toast.error('Iltimos yulduzcha bering'); return; }
    try {
      await createReview({ orderId: orderId!, rating, comment }).unwrap();
      setShowConfetti(true);
      if (hasBonus) {
        toast.success('🎁 Bonus yozildi! Keyingi buyurtmada 10% chegirma!', { duration: 4000 });
      } else {
        toast.success('Rahmat! Sharhingiz qabul qilindi 🎉');
      }
      setTimeout(() => navigate('/orders'), 2000);
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
    <div className="page-enter" style={{ paddingBottom: 100, position: 'relative', overflow: 'hidden' }}>

      {/* ── CONFETTI OVERLAY ── */}
      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                left: `${Math.random() * 90 + 5}%`,
                top: '-10px',
                width: `${6 + Math.random() * 6}px`,
                height: `${6 + Math.random() * 6}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.9 + Math.random() * 0.6}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{
        padding: '52px 20px 20px',
        background: 'var(--bg-card)',
        position: 'sticky', top: 0, zIndex: 40,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn-icon" onClick={() => navigate(-1)} style={{ flexShrink: 0 }}>
            <ChevronLeft size={24} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
              Xizmatni baholash
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 600, marginTop: 2 }}>
              Sizning fikringiz biz uchun muhim
            </p>
          </div>
        </div>
      </header>

      <main style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── SPECIALIST CARD ── */}
        {order?.specialist && (
          <div className="card scale-in" style={{
            padding: 18, display: 'flex', gap: 14, alignItems: 'center',
            background: 'var(--primary-glow)', borderColor: 'var(--border-hover)',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              fontSize: 22, fontWeight: 800, flexShrink: 0, boxShadow: '0 6px 20px var(--primary-glow)',
            }}>
              {order.specialist.user?.name?.[0]?.toUpperCase() || <HardHat size={24} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usta</span>
              <h3 style={{ fontSize: 17, fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: 'var(--text)' }}>
                {order.specialist.user?.name || 'Usta'}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
                {order.category?.name || 'Xizmat turi'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── STAR RATING ── */}
          <section className="card" style={{ padding: '28px 20px', textAlign: 'center' }}>
            <h3 style={{
              fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20,
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(251,191,36,0.12)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} />
              </div>
              Xizmat sifati qanday edi?
            </h3>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              {[1, 2, 3, 4, 5].map(star => {
                const isFilled = (hovered || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    style={{
                      position: 'relative', padding: 8, background: 'none', border: 'none',
                      cursor: 'pointer',
                      transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    <Star
                      size={44}
                      fill={isFilled ? '#FBBF24' : 'none'}
                      style={{ color: isFilled ? '#FBBF24' : 'var(--border)', transition: 'color 0.2s' }}
                      strokeWidth={1.5}
                    />
                    {isFilled && (
                      <div style={{ position: 'absolute', inset: 4, background: 'rgba(251,191,36,0.18)', filter: 'blur(10px)', borderRadius: '50%', zIndex: -1 }} />
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ minHeight: 36, marginTop: 14 }}>
              {(hovered || rating) > 0 && (
                <span style={{
                  fontSize: 18, fontFamily: 'Poppins, sans-serif', fontWeight: 800,
                  color: (hovered || rating) >= 4 ? 'var(--accent)' : (hovered || rating) >= 3 ? '#FBBF24' : 'var(--danger)',
                  background: (hovered || rating) >= 4 ? 'rgba(52,211,153,0.1)' : (hovered || rating) >= 3 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)',
                  padding: '4px 18px', borderRadius: 50,
                  animation: 'badgePop 0.3s ease forwards',
                }}>
                  {RATING_LABELS[hovered || rating]}
                </span>
              )}
            </div>
          </section>

          {/* ── BEFORE / AFTER PHOTOS (bonus) ── */}
          <section className="card" style={{ padding: 18 }}>
            {/* Bonus badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
              padding: '10px 14px', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(124,110,250,0.12), rgba(244,114,182,0.08))',
              border: '1px solid rgba(124,110,250,0.2)',
            }}>
              <Gift size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                  🎁 Bonus olish uchun rasm qo'shing!
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                  "Oldin" va "Keyin" rasmlar — keyingi buyurtmada <strong style={{ color: 'var(--primary)' }}>10% chegirma</strong>
                </p>
              </div>
              {hasBonus && (
                <span style={{
                  fontSize: 11, fontWeight: 800, color: 'var(--accent)',
                  background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
                  padding: '3px 10px', borderRadius: 50,
                  animation: 'badgePop 0.4s ease forwards',
                }}>
                  ✓ Bonus!
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Before */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 6, textAlign: 'center' }}>📷 Oldin</p>
                {beforePreview ? (
                  <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', aspectRatio: '1' }}>
                    <img src={beforePreview} alt="Oldin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => { setBeforeImage(null); setBeforePreview(''); }}
                      style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => beforeRef.current?.click()}
                    style={{ aspectRatio: '1', borderRadius: 14, border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--bg-input)', gap: 6 }}
                  >
                    <Camera size={22} style={{ color: 'var(--text-sub)' }} />
                    <span style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 600 }}>Rasm qo'shish</span>
                  </div>
                )}
                <input ref={beforeRef} type="file" accept="image/*" hidden onChange={e => handleImageChange('before', e.target.files?.[0] || null)} />
              </div>

              {/* After */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 6, textAlign: 'center' }}>✨ Keyin</p>
                {afterPreview ? (
                  <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', aspectRatio: '1' }}>
                    <img src={afterPreview} alt="Keyin" style={{ width: '100%', height: '100%', objectFit: 'cover', border: '2px solid var(--accent)' }} />
                    <button
                      type="button"
                      onClick={() => { setAfterImage(null); setAfterPreview(''); }}
                      style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => afterRef.current?.click()}
                    style={{ aspectRatio: '1', borderRadius: 14, border: '2px dashed rgba(52,211,153,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(52,211,153,0.04)', gap: 6 }}
                  >
                    <Camera size={22} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>Rasm qo'shish</span>
                  </div>
                )}
                <input ref={afterRef} type="file" accept="image/*" hidden onChange={e => handleImageChange('after', e.target.files?.[0] || null)} />
              </div>
            </div>
          </section>

          {/* ── COMMENT ── */}
          <section>
            <label className="section-label">Sharhingizni yozing (ixtiyoriy)</label>
            <div style={{ position: 'relative', marginTop: 8 }}>
              <Quote size={18} style={{ position: 'absolute', left: 16, top: 16, color: 'var(--text-sub)' }} />
              <textarea
                rows={3}
                placeholder="Usta ishi, muamala, vaqtida kelishi haqida..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{ paddingLeft: 46, paddingTop: 14 }}
              />
            </div>
            {comment.length > 20 && (
              <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginTop: 4 }}>
                ✓ Yaxshi sharh — bonus qo'shildi!
              </p>
            )}
          </section>

          {/* ── SUBMIT ── */}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="btn btn-gradient"
            style={{ height: 54, borderRadius: 16, fontSize: 16, fontWeight: 800 }}
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            <span>{submitting ? 'Yuborilmoqda...' : hasBonus ? '🎁 Sharh va bonus yuborish' : 'Sharhni yuborish'}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
