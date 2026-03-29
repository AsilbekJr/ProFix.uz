import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetCategoriesQuery, useGetSpecialistsQuery } from '../store/apiSlice';
import { useTheme } from '../context/ThemeContext';
import {
  Wrench, Zap, Frame, DoorClosed, Home, Snowflake, Key,
  Droplet, Hammer, Package, ChevronRight, Sun, Moon,
  ClipboardList, Plus, Cpu, Truck, Monitor, TreePine,
  Car, Sofa, Shirt, Flame, Shield, Brush, Wind, Wifi,
  Camera, Trash2, Star, MapPin, Settings,
} from 'lucide-react';
import SpecialistCard from '../components/SpecialistCard';

/* ── Icon helper ─────────────────────────────────────────────── */
function getCategoryIcon(name: string): React.ReactNode {
  const n = name.toLowerCase();
  if (n.includes('santex') || n.includes('suv') || n.includes('quvur')) return <Wrench size={20} />;
  if (n.includes('elektr') || n.includes('tok'))  return <Zap size={20} />;
  if (n.includes('deraza') || n.includes('oyna')) return <Frame size={20} />;
  if (n.includes('eshik') || n.includes('qulf'))  return <DoorClosed size={20} />;
  if (n.includes('shift') || n.includes('devor') || n.includes('shinam')) return <Home size={20} />;
  if (n.includes('konditsion') || n.includes('sovut')) return <Snowflake size={20} />;
  if (n.includes('kalit') || n.includes('qulfchi')) return <Key size={20} />;
  if (n.includes('tozal') || n.includes('clean')) return <Droplet size={20} />;
  if (n.includes('quril') || n.includes("ta'mir") || n.includes('remont')) return <Hammer size={20} />;
  if (n.includes("ko'ch") || n.includes('tash') || n.includes('yuk')) return <Truck size={20} />;
  if (n.includes('kompyu') || n.includes('texnik')) return <Monitor size={20} />;
  if (n.includes('maishiy') || n.includes('texnika')) return <Cpu size={20} />;
  if (n.includes('mebel') || n.includes("yig'ish")) return <Sofa size={20} />;
  if (n.includes('bog') || n.includes("o'simlik")) return <TreePine size={20} />;
  if (n.includes('haydov') || n.includes('avto')) return <Car size={20} />;
  if (n.includes("bo'yoq") || n.includes('paint')) return <Brush size={20} />;
  if (n.includes('gaz') || n.includes('isitish')) return <Flame size={20} />;
  if (n.includes('xavfsiz') || n.includes('kamera')) return <Camera size={20} />;
  if (n.includes('internet') || n.includes('wifi')) return <Wifi size={20} />;
  if (n.includes('tozal') || n.includes('axlat')) return <Trash2 size={20} />;
  if (n.includes('kiyim') || n.includes('tikuv')) return <Shirt size={20} />;
  if (n.includes('konditsion') || n.includes('ventilyat')) return <Wind size={20} />;
  if (n.includes('qorovul') || n.includes('himoya')) return <Shield size={20} />;
  return <Package size={20} />;
}

const CATEGORY_COLORS = [
  { bg: 'rgba(124,110,250,0.12)', color: '#7C6EFA', border: 'rgba(124,110,250,0.2)' },
  { bg: 'rgba(244,114,182,0.1)',  color: '#F472B6', border: 'rgba(244,114,182,0.2)' },
  { bg: 'rgba(52,211,153,0.1)',   color: '#34D399', border: 'rgba(52,211,153,0.2)' },
  { bg: 'rgba(251,191,36,0.1)',   color: '#FBBF24', border: 'rgba(251,191,36,0.2)' },
  { bg: 'rgba(96,165,250,0.1)',   color: '#60A5FA', border: 'rgba(96,165,250,0.2)' },
  { bg: 'rgba(248,113,113,0.1)',  color: '#F87171', border: 'rgba(248,113,113,0.2)' },
  { bg: 'rgba(167,139,250,0.1)',  color: '#A78BFA', border: 'rgba(167,139,250,0.2)' },
  { bg: 'rgba(34,197,94,0.1)',    color: '#22C55E', border: 'rgba(34,197,94,0.2)' },
];

/* ── Static price preview (will be from admin panel later) ────── */
const PRICE_PREVIEW = [
  { icon: '🔧', name: 'Santexnika', from: '50,000' },
  { icon: '⚡', name: 'Elektrik',   from: '40,000' },
  { icon: '❄️', name: 'Konditsioner', from: '80,000' },
  { icon: '🪟', name: 'Deraza',     from: '60,000' },
];

/* ── Viral 3-step progress ───────────────────────────────────── */
const VIRAL_STEPS = [
  { emoji: '📸', label: 'Muammo' },
  { emoji: '📍', label: 'Manzil' },
  { emoji: '🔧', label: 'Usta yo\'lda' },
];

/* ── Main Page ───────────────────────────────────────────────── */
export default function HomePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: categoriesRes, isLoading: catLoading } = useGetCategoriesQuery();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const categories = categoriesRes?.data || [];
  const stripEmoji = (str: string) =>
    str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  const services = categories.map(c => ({ id: c.id, label: stripEmoji(c.name), name: c.name }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '☀️ Xayrli tong' : hour < 17 ? '🌤️ Xayrli kun' : '🌙 Xayrli kech';
  const firstName = user?.name?.split(' ')[0] || 'Mehmon';

  const [activeStep] = useState(0); // purely visual

  return (
    <div className="page-enter" style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div style={{
        padding: '52px 20px 20px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow orbs */}
        <div className="hero-glow-orb" style={{
          width: 200, height: 200,
          background: 'var(--primary)',
          top: -80, right: -60, opacity: 0.12,
        }} />
        <div className="hero-glow-orb" style={{
          width: 120, height: 120,
          background: 'var(--secondary)',
          top: 20, right: 80, opacity: 0.08,
          animationDelay: '2s',
        }} />

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              {/* Online indicator */}
              <span className="online-dot" />
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.3px' }}>
                ProFix.uz — Online
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 2, fontWeight: 500 }}>{greeting}</p>
            <h1 style={{
              fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 900,
              color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1.2
            }}>
              {firstName} 👋
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', zIndex: 1 }}>
            <button className="btn-icon" onClick={toggleTheme} title="Temani o'zgartirish">
              {theme === 'dark'
                ? <Sun size={18} style={{ color: '#FBBF24' }} />
                : <Moon size={18} style={{ color: 'var(--primary)' }} />
              }
            </button>
            <button
              className="avatar avatar-sm"
              onClick={() => navigate('/profile')}
              style={{ cursor: 'pointer', border: 'none', fontSize: 14, fontWeight: 800 }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </button>
          </div>
        </div>

        {/* ── ONE-CLICK HERO BUTTON ── */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button
            id="one-click-order-btn"
            className="btn one-click-btn"
            onClick={() => navigate('/order/create')}
            style={{
              marginTop: 20, height: 62, borderRadius: 20, fontSize: 16,
              fontWeight: 800, width: '100%',
              background: 'var(--gradient-brand)',
              color: '#fff',
              boxShadow: '0 8px 32px rgba(124,110,250,0.40)',
              fontFamily: 'Poppins, sans-serif',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 24 }}>📍</span>
            <span>Manzilni yuborish va usta chaqirish</span>
          </button>

          {/* Sub-label */}
          <p style={{
            textAlign: 'center', fontSize: 11, color: 'var(--text-sub)',
            marginTop: 8, fontWeight: 500,
          }}>
            O'rtacha 15 daqiqada usta yetib keladi • Ro'yxatdan o'tish shart emas
          </p>
        </div>

        {/* ── VIRAL 3-STEP PROGRESS ── */}
        <div style={{
          display: 'flex', marginTop: 20, position: 'relative', zIndex: 1,
          background: 'var(--bg-elev)', borderRadius: 16, padding: '14px 16px',
          border: '1px solid var(--border)',
        }}>
          {VIRAL_STEPS.map((step, i) => (
            <div className="viral-step" key={i}>
              {/* Connect line (not after last) */}
              {i < VIRAL_STEPS.length - 1 && (
                <div className="viral-step-line">
                  <div className="viral-step-line-fill" style={{ width: activeStep > i ? '100%' : '0%' }} />
                </div>
              )}

              <div
                className="viral-step-dot"
                style={{
                  background: i === 0 ? 'var(--primary)' : i === 1 ? 'var(--bg-card2)' : 'var(--bg-card2)',
                  color: i === 0 ? '#fff' : 'var(--text-sub)',
                  boxShadow: i === 0 ? '0 0 0 4px var(--primary-glow)' : 'none',
                  fontSize: 18,
                }}
              >
                {step.emoji}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, color: i === 0 ? 'var(--primary)' : 'var(--text-sub)',
                textAlign: 'center',
              }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── PRICE PREVIEW STRIP ── */}
        <div style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 8, letterSpacing: '0.5px' }}>
            NARXLAR (dan boshlab)
          </p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {PRICE_PREVIEW.map((p, i) => (
              <div key={i} style={{
                flexShrink: 0, background: 'var(--bg-card2)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6,
                animation: `priceSlide 0.3s ease ${i * 80}ms both`,
              }}>
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 600 }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 800 }}>
                    {p.from} <span style={{ fontSize: 9, color: 'var(--text-sub)' }}>so'mdan</span>
                  </p>
                </div>
              </div>
            ))}
            <div
              style={{
                flexShrink: 0, background: 'var(--primary-glow)', border: '1px solid var(--border-hover)',
                borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/order/create')}
              role="button"
            >
              <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>Barchasi →</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SERVICES GRID ─────────────────────────────────────── */}
      <div style={{ padding: '20px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif', fontSize: 17, fontWeight: 800,
            color: 'var(--text)', letterSpacing: '-0.3px',
          }}>
            Xizmatlar
          </h2>
          <span style={{
            fontSize: 11, fontWeight: 700, color: 'var(--primary)',
            background: 'var(--primary-glow)', padding: '3px 10px', borderRadius: 50,
          }}>
            {services.length} ta
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {catLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 84, borderRadius: 16 }} />
              ))
            : services.map((service, i) => {
                const colorScheme = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                return (
                  <button
                    key={service.id}
                    onClick={() => navigate(`/category/${service.id}`, { state: { categoryName: service.label } })}
                    style={{
                      background: colorScheme.bg,
                      border: `1px solid ${colorScheme.border}`,
                      borderRadius: 16, padding: '12px 6px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', gap: 8, cursor: 'pointer',
                      transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)', aspectRatio: '1',
                      color: colorScheme.color,
                      animationDelay: `${i * 40}ms`,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1.06) translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${colorScheme.border}`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                    onMouseDown={e => (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)'}
                    onMouseUp={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'}
                  >
                    {getCategoryIcon(service.name)}
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: 'var(--text)',
                      textAlign: 'center', lineHeight: 1.3,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any
                    }}>
                      {service.label}
                    </span>
                  </button>
                );
              })
          }
        </div>
      </div>

      {/* ── MY ORDERS CARD ─────────────────────────────────────── */}
      <div style={{ padding: '8px 20px' }}>
        <div
          role="button"
          onClick={() => navigate('/orders')}
          className="card card-hover"
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '16px 18px' }}
        >
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: 'var(--primary-glow)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)', flexShrink: 0,
          }}>
            <ClipboardList size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>Mening buyurtmalarim</p>
            <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>Joriy va o'tgan buyurtmalar</p>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-sub)' }} />
        </div>
      </div>

      {/* ── TOP SPECIALISTS ────────────────────────────────────── */}
      <div style={{ padding: '8px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif', fontSize: 17, fontWeight: 800,
            color: 'var(--text)', letterSpacing: '-0.3px'
          }}>
            Top Ustalar
          </h2>
          <button
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, color: 'var(--primary)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
            onClick={() => navigate('/order/create')}
          >
            Hammasi <ChevronRight size={14} />
          </button>
        </div>
        <TopSpecialistsSection />
      </div>

      {/* ── SETTINGS SHORTCUT ──────────────────────────────────── */}
      <div style={{ padding: '0 20px 20px' }}>
        <div
          role="button"
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 16,
            background: 'var(--bg-elev)', border: '1px solid var(--border)',
            cursor: 'pointer',
          }}
        >
          <Settings size={18} style={{ color: 'var(--text-sub)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-sub)' }}>
            Profil va sozlamalar
          </span>
          <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-sub)' }} />
        </div>
      </div>
    </div>
  );
}

/* ── Top Specialists Section ────────────────────────────────── */
function TopSpecialistsSection() {
  const navigate = useNavigate();
  const { data: res, isLoading } = useGetSpecialistsQuery({});
  const specialists = res?.data || [];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 88, borderRadius: 20 }} />
        ))}
      </div>
    );
  }

  if (specialists.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '32px 20px',
        background: 'var(--bg-card)', borderRadius: 20,
        border: '1px dashed var(--border)',
      }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
        <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>Hozircha ustalar topilmadi</p>
        <button
          className="btn btn-primary"
          style={{ marginTop: 12, height: 42, borderRadius: 12, fontSize: 13 }}
          onClick={() => navigate('/order/create')}
        >
          <Plus size={16} />
          Buyurtma qoldirish
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {specialists.slice(0, 5).map((s: any, i: number) => (
        <SpecialistCard
          key={s.id}
          id={s.id}
          name={s.user?.name || 'Usta'}
          rating={s.rating || 0}
          reviewCount={s.reviewCount || 0}
          isVerified={s.isVerified}
          location={s.location}
          completedOrders={s._count?.ordersAsSpecialist || 0}
          etaMinutes={10 + i * 5} // demo ETA
          animationDelay={i * 80}
        />
      ))}
    </div>
  );
}
