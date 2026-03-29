import { Share2, Download, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareResultCardProps {
  beforeImage?: string;
  afterImage?: string;
  specialistName: string;
  categoryName: string;
  rating?: number;
  orderDate?: string;
  onReview?: () => void;
}

export default function ShareResultCard({
  beforeImage,
  afterImage,
  specialistName,
  categoryName,
  rating,
  orderDate,
  onReview,
}: ShareResultCardProps) {

  const handleShare = () => {
    const text = `✅ ProFix.uz orqali ${categoryName.toLowerCase()} ta'mirlatdim!\n` +
      `🔧 Usta: ${specialistName}\n` +
      `Siz ham sinab ko'ring 👇\nhttps://profix.uz`;

    if ((window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent('https://profix.uz')}&text=${encodeURIComponent(text)}`
      );
    } else if (navigator.share) {
      navigator.share({ title: 'ProFix.uz — Ta\'mir yakunlandi', text, url: 'https://profix.uz' });
    } else {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent('https://profix.uz')}&text=${encodeURIComponent(text)}`,
        '_blank'
      );
    }
    toast.success("Ulashildi! Do'stlaringiz ham ProFix'ni ko'radi 🎉");
  };

  const hasImages = beforeImage || afterImage;

  return (
    <div style={{
      background: 'var(--gradient-card)',
      border: '1px solid var(--border)',
      borderRadius: 24,
      padding: 20,
      animation: 'cardEntrance 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          fontSize: 28,
          animation: 'successBounce 0.6s cubic-bezier(0.22,1,0.36,1) forwards'
        }}>
          ✅
        </div>
        <div>
          <p style={{
            fontWeight: 800, fontSize: 16,
            fontFamily: 'Poppins, sans-serif', color: 'var(--text)'
          }}>
            Ish muvaffaqiyatli yakunlandi!
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
            Usta {specialistName} · {categoryName}
            {orderDate && ` · ${orderDate}`}
          </p>
        </div>
      </div>

      {/* Before/After images */}
      {hasImages && (
        <div className="before-after-container" style={{ marginBottom: 16, height: 140 }}>
          {/* Before */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            {beforeImage ? (
              <img
                src={beforeImage}
                alt="Oldin"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'var(--bg-elev)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: 28 }}>📷</span>
              </div>
            )}
            <span
              className="before-after-label"
              style={{ left: 8, background: 'rgba(0,0,0,0.55)', color: '#fff' }}
            >
              Oldin
            </span>
          </div>

          {/* After */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            {afterImage ? (
              <img
                src={afterImage}
                alt="Keyin"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'var(--bg-elev)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: 28 }}>✨</span>
              </div>
            )}
            <span
              className="before-after-label"
              style={{ right: 8, background: 'rgba(52,211,153,0.75)', color: '#fff' }}
            >
              Keyin
            </span>
          </div>
        </div>
      )}

      {/* Rating bar — if not yet rated */}
      {!rating && onReview && (
        <div style={{
          padding: '12px 14px', borderRadius: 14, marginBottom: 12,
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Star size={18} style={{ color: '#FBBF24', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
              Ustani baholang
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>
              Baholasangiz 🎁 bonus olasiz!
            </p>
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '6px 14px', height: 'auto', width: 'auto', borderRadius: 10, fontSize: 12 }}
            onClick={onReview}
          >
            Baholash
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className="btn btn-ghost"
          style={{ height: 46, borderRadius: 14, fontSize: 13, flex: 1 }}
          onClick={() => toast('Yuklab olish tez orada...', { icon: '📥' })}
        >
          <Download size={16} />
          Saqlash
        </button>
        <button
          className="btn btn-gradient"
          style={{ height: 46, borderRadius: 14, fontSize: 13, flex: 1 }}
          onClick={handleShare}
        >
          <Share2 size={16} />
          Do'stlar bilan ulashish
        </button>
      </div>
    </div>
  );
}
