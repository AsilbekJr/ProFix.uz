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
  Camera, Trash2, Bell, Star, MapPin, Loader2
} from 'lucide-react';

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
  return <Wrench size={20} />;
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

export default function HomePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: categoriesRes, isLoading: catLoading } = useGetCategoriesQuery();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const categories = categoriesRes?.data || [];
  const stripEmoji = (str: string) => str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  const services = categories.map(c => ({ id: c.id, label: stripEmoji(c.name), name: c.name }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '☀️ Xayrli tong' : hour < 17 ? '🌤️ Xayrli kun' : '🌙 Xayrli kech';
  const firstName = user?.name?.split(' ')[0] || 'Mehmon';

  return (
    <div className="page-enter" style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>

      {/* ── HEADER ── */}
      <div style={{
        padding: '52px 20px 20px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', letterSpacing: '0.5px' }}>ProFix</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 4, fontWeight: 500 }}>{greeting}</p>
            <h1 style={{
              fontFamily: 'Poppins, sans-serif', fontSize: 26, fontWeight: 800,
              color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1.2
            }}>
              {firstName} 👋
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn-icon" onClick={toggleTheme} title="Temani o'zgartirish">
              {theme === 'dark'
                ? <Sun size={18} style={{ color: '#FBBF24' }} />
                : <Moon size={18} style={{ color: 'var(--primary)' }} />
              }
            </button>
            <button
              className="avatar avatar-sm"
              onClick={() => navigate('/profile')}
              style={{ cursor: 'pointer', border: 'none', fontSize: 16, fontWeight: 800 }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </button>
          </div>
        </div>

        {/* Hero CTA */}
        <button
          className="btn btn-gradient"
          onClick={() => navigate('/order/create')}
          style={{ marginTop: 20, height: 52, borderRadius: 16, fontSize: 15 }}
        >
          <Plus size={20} />
          Yangi buyurtma berish
        </button>
      </div>

      {/* ── SERVICES GRID ── */}
      <div style={{ padding: '24px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 800,
            color: 'var(--text)', letterSpacing: '-0.3px'
          }}>
            Xizmatlar
          </h2>
          <span style={{
            fontSize: 12, fontWeight: 700, color: 'var(--primary)',
            background: 'var(--primary-glow)', padding: '3px 10px', borderRadius: 50
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
                      transition: 'all 0.2s', aspectRatio: '1',
                      color: colorScheme.color,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
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

      {/* ── MY ORDERS CARD ── */}
      <div style={{ padding: '8px 20px 20px' }}>
        <div
          role="button"
          onClick={() => navigate('/orders')}
          className="card card-hover"
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '18px 20px' }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: 'var(--primary-glow)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)', flexShrink: 0
          }}>
            <ClipboardList size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>Mening buyurtmalarim</p>
            <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>Joriy va o'tgan buyurtmalar</p>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-sub)' }} />
        </div>

        {/* ── NEARBY SPECIALISTS SECTION ── */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{
              fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 800,
              color: 'var(--text)', letterSpacing: '-0.3px'
            }}>
              Top Ustalar
            </h2>
          </div>
          <NearbySpecialistsInline />
        </div>
      </div>
    </div>
  );
}

// ── Inline Nearby Specialists Component ──

function NearbySpecialistsInline() {
  const navigate = useNavigate();
  const { data: res, isLoading } = useGetSpecialistsQuery({});
  const specialists = res?.data || [];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 76, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  if (specialists.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '32px 20px',
        background: 'var(--bg-card)', borderRadius: 20,
        border: '1px dashed var(--border)'
      }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
        <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>Hozircha ustalar topilmadi</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {specialists.slice(0, 5).map((s: any, i) => (
        <div
          key={s.id}
          className="card card-hover"
          role="button"
          onClick={() => navigate(`/specialists/${s.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '14px 16px' }}
        >
          <div className="avatar" style={{ background: `var(--gradient-brand)`, fontSize: 17, borderRadius: 14 }}>
            {s.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{s.user?.name}</p>
              {s.isVerified && (
                <span style={{ fontSize: 11, color: 'var(--accent)', background: 'rgba(52,211,153,0.1)', padding: '1px 6px', borderRadius: 50, fontWeight: 700 }}>
                  ✓ Tasdiqlangan
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#FBBF24', fontWeight: 700 }}>
                <Star size={11} fill="#FBBF24" /> {s.rating.toFixed(1)}
              </span>
              {s._count?.ordersAsSpecialist > 0 && (
                <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                  {s._count.ordersAsSpecialist}+ bajarilgan
                </span>
              )}
              {s.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-sub)' }}>
                  <MapPin size={10} /> {s.location.split(',')[0]}
                </span>
              )}
            </div>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text-sub)', flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}
